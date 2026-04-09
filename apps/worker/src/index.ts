import http from "node:http";

import { Worker } from "bullmq";

import { JobKindSchema, WorkerJobPayloadSchema } from "@blog-saas/domain";

import { dispatchJob } from "./jobs";
import { markJobRunCompleted, markJobRunFailed, markJobRunRunning } from "./persistence";
import { createRedisConnection, queueName } from "./queue";
import { createWorkerRecoveryMonitor } from "./recovery";

function isTruthy(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function stayAliveInDegradedMode(reason: string) {
  console.warn(`Worker degraded mode enabled: ${reason}`);
  setInterval(() => {
    console.log("Worker degraded mode active; queue startup is intentionally bypassed.");
  }, 5 * 60 * 1000);
}

function getRestartGracePeriodMs() {
  const rawGracePeriod = process.env.BLOG_SAAS_WORKER_RESTART_GRACE_MS;
  if (!rawGracePeriod) {
    return 2 * 60 * 1000;
  }

  const parsedGracePeriod = Number.parseInt(rawGracePeriod, 10);
  if (!Number.isFinite(parsedGracePeriod) || parsedGracePeriod < 1_000) {
    throw new Error(
      `Invalid BLOG_SAAS_WORKER_RESTART_GRACE_MS value for worker runtime: ${rawGracePeriod}`,
    );
  }

  return parsedGracePeriod;
}

function maybeStartHealthServer(getHealthStatus: () => { ok: boolean; reason: string | null }) {
  const rawPort = process.env.PORT;
  if (!rawPort) {
    return null;
  }

  const port = Number.parseInt(rawPort, 10);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid PORT value for worker health server: ${rawPort}`);
  }

  const server = http.createServer((request, response) => {
    const url = request.url ?? "/";
    if (url === "/health" || url === "/") {
      const healthStatus = getHealthStatus();
      response.writeHead(healthStatus.ok ? 200 : 503, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ...healthStatus, service: "blog-saas-worker" }));
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "Not found" }));
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Worker health server listening on ${port}`);
  });

  return server;
}

async function main() {
  if (isTruthy(process.env.BLOG_SAAS_WORKER_DEGRADED_MODE)) {
    maybeStartHealthServer(() => ({ ok: true, reason: "degraded-mode" }));
    stayAliveInDegradedMode("BLOG_SAAS_WORKER_DEGRADED_MODE is set");
    return;
  }

  const connection = createRedisConnection();
  const restartGracePeriodMs = getRestartGracePeriodMs();
  let worker: Worker | null = null;
  const recoveryMonitor = createWorkerRecoveryMonitor({
    gracePeriodMs: restartGracePeriodMs,
    onRestartRequested(reason) {
      console.error(
        `Worker did not recover within ${restartGracePeriodMs}ms after: ${reason}. Exiting so Render can restart it.`,
      );
      const closeWorker = worker
        ? worker.close().catch((error) => {
            console.error("Failed to close worker cleanly during recovery exit:", error);
          })
        : Promise.resolve();

      void closeWorker
        .finally(() => {
          recoveryMonitor.stop();
          connection.disconnect();
          process.exit(1);
        });
    },
  });

  maybeStartHealthServer(() => {
    const snapshot = recoveryMonitor.snapshot();
    return {
      ok: snapshot.healthy,
      reason: snapshot.pendingRestartReason,
    };
  });

  connection.on("ready", () => {
    recoveryMonitor.markHealthy();
    console.log("Redis connection ready");
  });

  connection.on("error", (error) => {
    recoveryMonitor.markUnhealthy("redis-error");
    console.error("Redis connection error:", error);
  });

  connection.on("close", () => {
    recoveryMonitor.markUnhealthy("redis-connection-closed");
    console.warn("Redis connection closed");
  });

  connection.on("end", () => {
    recoveryMonitor.markUnhealthy("redis-connection-ended");
    console.warn("Redis connection ended");
  });

  connection.on("reconnecting", (delay: number) => {
    recoveryMonitor.markUnhealthy("redis-reconnecting");
    console.warn(`Redis reconnecting in ${delay}ms`);
  });

  worker = new Worker(
    queueName,
    async (job) => {
      const jobKind = JobKindSchema.parse(job.name);
      const payload = WorkerJobPayloadSchema.parse(job.data);
      await markJobRunRunning(jobKind, payload);

      try {
        const result = await dispatchJob(jobKind, payload);
        await markJobRunCompleted(payload, { result });
        console.log(JSON.stringify({ jobKind, correlationId: payload.correlationId, result }, null, 2));
        return result;
      } catch (error) {
        await markJobRunFailed(payload, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 4,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Completed ${job.name} ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Failed ${job?.name ?? "unknown"} ${job?.id ?? "unknown"}:`, error);
  });

  worker.on("error", (error) => {
    recoveryMonitor.markUnhealthy("worker-error");
    console.error("Worker queue error:", error);
  });

  console.log(`Worker listening on queue ${queueName}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

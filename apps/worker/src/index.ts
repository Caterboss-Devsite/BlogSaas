import http from "node:http";

import { Worker } from "bullmq";

import { JobKindSchema, WorkerJobPayloadSchema } from "@blog-saas/domain";

import { dispatchJob } from "./jobs";
import { createRedisConnection, queueName } from "./queue";

function maybeStartHealthServer() {
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
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true, service: "blog-saas-worker" }));
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
  maybeStartHealthServer();
  const connection = createRedisConnection();

  const worker = new Worker(
    queueName,
    async (job) => {
      const jobKind = JobKindSchema.parse(job.name);
      const payload = WorkerJobPayloadSchema.parse(job.data);
      const result = await dispatchJob(jobKind, payload);
      console.log(JSON.stringify({ jobKind, correlationId: payload.correlationId, result }, null, 2));
      return result;
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

  console.log(`Worker listening on queue ${queueName}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

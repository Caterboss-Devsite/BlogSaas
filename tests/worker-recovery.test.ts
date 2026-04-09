import { describe, expect, it, vi } from "vitest";

import { createWorkerRecoveryMonitor } from "../apps/worker/src/recovery";

describe("worker recovery monitor", () => {
  it("requests a restart when an outage outlives the grace period", () => {
    vi.useFakeTimers();

    const onRestartRequested = vi.fn();
    const monitor = createWorkerRecoveryMonitor({
      gracePeriodMs: 60_000,
      onRestartRequested,
    });

    monitor.markUnhealthy("Redis connection closed");
    expect(monitor.snapshot()).toEqual({
      healthy: false,
      pendingRestartReason: "Redis connection closed",
    });

    vi.advanceTimersByTime(59_999);
    expect(onRestartRequested).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onRestartRequested).toHaveBeenCalledWith("Redis connection closed");

    vi.useRealTimers();
  });

  it("cancels a pending restart when the connection recovers", () => {
    vi.useFakeTimers();

    const onRestartRequested = vi.fn();
    const monitor = createWorkerRecoveryMonitor({
      gracePeriodMs: 60_000,
      onRestartRequested,
    });

    monitor.markUnhealthy("Redis reconnecting");
    monitor.markHealthy();

    vi.advanceTimersByTime(60_000);

    expect(onRestartRequested).not.toHaveBeenCalled();
    expect(monitor.snapshot()).toEqual({
      healthy: true,
      pendingRestartReason: null,
    });

    vi.useRealTimers();
  });
});

export interface WorkerRecoverySnapshot {
  healthy: boolean;
  pendingRestartReason: string | null;
}

interface WorkerRecoveryMonitorOptions {
  gracePeriodMs: number;
  onRestartRequested: (reason: string) => void;
}

export interface WorkerRecoveryMonitor {
  markHealthy: () => void;
  markUnhealthy: (reason: string) => void;
  snapshot: () => WorkerRecoverySnapshot;
  stop: () => void;
}

export function createWorkerRecoveryMonitor(
  options: WorkerRecoveryMonitorOptions,
): WorkerRecoveryMonitor {
  let restartTimer: NodeJS.Timeout | null = null;
  let pendingRestartReason: string | null = null;

  const clearRestartTimer = () => {
    if (restartTimer) {
      clearTimeout(restartTimer);
      restartTimer = null;
    }
  };

  return {
    markHealthy() {
      pendingRestartReason = null;
      clearRestartTimer();
    },
    markUnhealthy(reason) {
      if (pendingRestartReason) {
        return;
      }

      pendingRestartReason = reason;
      restartTimer = setTimeout(() => {
        restartTimer = null;
        options.onRestartRequested(reason);
      }, options.gracePeriodMs);
    },
    snapshot() {
      return {
        healthy: pendingRestartReason === null,
        pendingRestartReason,
      };
    },
    stop() {
      pendingRestartReason = null;
      clearRestartTimer();
    },
  };
}

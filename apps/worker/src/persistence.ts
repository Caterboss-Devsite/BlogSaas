import type { Prisma } from "@prisma/client";
import { prisma } from "@blog-saas/db";
import type { JobKind, WorkerJobPayload } from "@blog-saas/domain";

export async function markJobRunQueued(jobKind: JobKind, payload: WorkerJobPayload) {
  return prisma.jobRun.upsert({
    where: { correlationId: payload.correlationId },
    update: {
      tenantId: payload.tenantId,
      jobKind,
      attempt: payload.attempt,
      status: "queued",
      payload,
      lastError: null,
    },
    create: {
      tenantId: payload.tenantId,
      jobKind,
      correlationId: payload.correlationId,
      attempt: payload.attempt,
      status: "queued",
      payload,
    },
  });
}

export async function markJobRunRunning(jobKind: JobKind, payload: WorkerJobPayload) {
  return prisma.jobRun.upsert({
    where: { correlationId: payload.correlationId },
    update: {
      tenantId: payload.tenantId,
      jobKind,
      attempt: payload.attempt,
      status: "running",
      payload,
      startedAt: new Date(),
      finishedAt: null,
      lastError: null,
    },
    create: {
      tenantId: payload.tenantId,
      jobKind,
      correlationId: payload.correlationId,
      attempt: payload.attempt,
      status: "running",
      payload,
      startedAt: new Date(),
    },
  });
}

export async function markJobRunCompleted(
  payload: WorkerJobPayload,
  data: {
    result: Record<string, unknown>;
  },
) {
  const normalizedPayload = JSON.parse(
    JSON.stringify({
      ...(payload as unknown as Record<string, unknown>),
      result: data.result,
    }),
  ) as Record<string, unknown>;

  return prisma.jobRun.update({
    where: { correlationId: payload.correlationId },
    data: {
      status: "completed",
      finishedAt: new Date(),
      lastError: null,
      payload: normalizedPayload as Prisma.InputJsonValue,
    },
  });
}

export async function markJobRunFailed(
  payload: WorkerJobPayload,
  error: unknown,
) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  return prisma.jobRun.updateMany({
    where: { correlationId: payload.correlationId },
    data: {
      status: "failed",
      finishedAt: new Date(),
      lastError: message.slice(0, 2000),
    },
  });
}

export function markdownToHtml(markdown: string) {
  const lines = markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());

  const html: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    html.push(`<p>${escapeHtml(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    html.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      html.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      html.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      html.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return html.join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

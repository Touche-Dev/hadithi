import type { Manuscript, ManuscriptStatus } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
/** Engagement du site : réponse motivée sous 8 à 10 semaines. */
export const WATCH_AFTER_DAYS = 8 * 7;
export const LATE_AFTER_DAYS = 10 * 7;

export const FINAL_STATUSES: ManuscriptStatus[] = ["accepte", "refuse", "a_retravailler"];

export type DeadlineState = "normal" | "watch" | "late" | "answered";

export function deadlineDate(receivedAt: string): Date {
  return new Date(new Date(receivedAt).getTime() + LATE_AFTER_DAYS * DAY);
}

export function deadlineState(
  m: Pick<Manuscript, "received_at" | "status" | "answered_at">,
  now: Date = new Date(),
): DeadlineState {
  if (m.answered_at || FINAL_STATUSES.includes(m.status)) return "answered";
  const days = (now.getTime() - new Date(m.received_at).getTime()) / DAY;
  if (days > LATE_AFTER_DAYS) return "late";
  if (days > WATCH_AFTER_DAYS) return "watch";
  return "normal";
}

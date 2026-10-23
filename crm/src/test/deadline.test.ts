import { describe, expect, it } from "vitest";
import { deadlineDate, deadlineState } from "@/lib/deadline";

const now = new Date("2026-10-19T12:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

describe("délai de réponse aux manuscrits", () => {
  it("reste normal jusqu'à 8 semaines", () => {
    expect(deadlineState({ received_at: daysAgo(55), status: "en_lecture", answered_at: null }, now)).toBe("normal");
  });
  it("passe à surveiller après 8 semaines", () => {
    expect(deadlineState({ received_at: daysAgo(57), status: "en_lecture", answered_at: null }, now)).toBe("watch");
  });
  it("passe en retard après 10 semaines", () => {
    expect(deadlineState({ received_at: daysAgo(71), status: "recu", answered_at: null }, now)).toBe("late");
  });
  it("n'est plus en retard une fois la décision rendue", () => {
    expect(deadlineState({ received_at: daysAgo(100), status: "refuse", answered_at: null }, now)).toBe("answered");
  });
  it("fixe la date limite à 10 semaines après réception", () => {
    expect(deadlineDate("2026-01-01T00:00:00Z").toISOString()).toBe("2026-03-12T00:00:00.000Z");
  });
});

import { describe, expect, it } from "vitest";
import { MANUSCRIPT_FILE, MB, validateFile } from "@/lib/upload";
import { isUpcoming, slugify } from "@/lib/events";

describe("Fichier de manuscrit", () => {
  it("accepte PDF, DOC et DOCX", () => {
    for (const n of ["a.pdf", "b.DOC", "c.docx"]) expect(validateFile({ name: n, size: MB }, MANUSCRIPT_FILE)).toBeNull();
  });
  it("refuse un autre format", () => {
    expect(validateFile({ name: "a.odt", size: MB }, MANUSCRIPT_FILE)).toMatch(/Format non accepté/);
  });
  it("accepte 10 Mo pile et refuse au-delà", () => {
    expect(validateFile({ name: "a.pdf", size: 10 * MB }, MANUSCRIPT_FILE)).toBeNull();
    expect(validateFile({ name: "a.pdf", size: 10 * MB + 1 }, MANUSCRIPT_FILE)).toMatch(/trop volumineux/);
  });
});

describe("Événements", () => {
  it("génère le slug depuis le titre", () => {
    expect(slugify("Lancement : Sahel, terres d'avenir")).toBe("lancement-sahel-terres-d-avenir");
  });
  it("classe selon la date", () => {
    const now = Date.parse("2026-10-19T12:00:00Z");
    expect(isUpcoming("2026-10-20T00:00:00Z", now)).toBe(true);
    expect(isUpcoming("2026-10-18T00:00:00Z", now)).toBe(false);
  });
});

/** Règles de téléversement (vérifiées aussi côté serveur). */
export const MB = 1024 * 1024;

export interface UploadRule {
  extensions: string[];
  maxBytes: number;
  label: string;
}

export const MANUSCRIPT_FILE: UploadRule = { extensions: ["pdf", "doc", "docx"], maxBytes: 10 * MB, label: "PDF, DOC ou DOCX, 10 Mo maximum" };
export const EVENT_IMAGE: UploadRule = { extensions: ["jpg", "jpeg", "png", "webp"], maxBytes: 5 * MB, label: "JPG, PNG ou WEBP, 5 Mo maximum" };

/** Renvoie un message d'erreur en français, ou null si le fichier est accepté. */
export function validateFile(file: { name: string; size: number }, rule: UploadRule): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!file.name.includes(".") || !rule.extensions.includes(ext))
    return `Format non accepté (.${ext || "?"}). Formats autorisés : ${rule.extensions.map((e) => e.toUpperCase()).join(", ")}.`;
  if (file.size > rule.maxBytes)
    return `Fichier trop volumineux (${formatSize(file.size)}). Taille maximale : ${formatSize(rule.maxBytes)}.`;
  return null;
}

export function formatSize(bytes: number | null | undefined) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / MB).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

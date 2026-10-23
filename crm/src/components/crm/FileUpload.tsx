import { useRef, useState } from "react";
import { AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/api/admin";
import { validateFile, type UploadRule } from "@/lib/upload";

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

/** Champ de téléversement : contrôle format/taille, barre de progression, erreur claire. */
export function FileUpload({
  rule,
  label,
  hasFile,
  onUploaded,
}: {
  rule: UploadRule;
  label: string;
  hasFile?: boolean;
  onUploaded: (f: UploadedFile) => void | Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const err = validateFile(file, rule);
    if (err) return setError(err);
    setProgress(0);
    try {
      const res = (await uploadFile(file, setProgress)) as UploadedFile;
      await onUploaded(res);
    } catch (e) {
      setError((e as Error).message || "Le téléversement a échoué. Réessayez.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <span className="field-label">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" disabled={progress !== null} onClick={() => input.current?.click()}>
          <Upload /> {hasFile ? "Remplacer le fichier" : "Choisir un fichier"}
        </Button>
        <span className="text-xs text-muted-foreground">{rule.label}</span>
      </div>
      <input
        ref={input}
        type="file"
        className="sr-only"
        aria-label={label}
        accept={rule.extensions.map((e) => "." + e).join(",")}
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {progress !== null && (
        <div className="space-y-1" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-1 bg-muted">
            <div className="h-1 bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">Envoi en cours… {progress} %</p>
        </div>
      )}
      {error && (
        <p className="flex items-start gap-1.5 text-sm text-destructive" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

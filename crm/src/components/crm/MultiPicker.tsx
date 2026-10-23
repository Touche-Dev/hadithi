import { useState } from "react";
import { X } from "lucide-react";

/** Sélecteur multiple : puces des éléments choisis + liste déroulante filtrable. */
export function MultiPicker({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: { id: number; label: string }[];
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const n = q.trim().toLowerCase();
  const avail = options.filter((o) => !value.includes(o.id) && (!n || o.label.toLowerCase().includes(n)));

  return (
    <div className="space-y-2">
      <span className="field-label">{label}</span>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              {options.find((o) => o.id === id)?.label ?? `#${id}`}
              <button type="button" aria-label="Retirer" onClick={() => onChange(value.filter((v) => v !== id))}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          className="field-input"
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {open && avail.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-border bg-card text-sm">
            {avail.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange([...value, o.id]);
                    setQ("");
                  }}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { deadlineDate, deadlineState } from "@/lib/deadline";
import { formatDate } from "@/lib/labels";
import type { Manuscript } from "@/types";

export function PageHeader({ eyebrow, title, actions }: { eyebrow?: string; title: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl text-primary sm:text-4xl">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1", className)}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export const TextInput = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn("field-input", className)} {...p} />
);
export const TextArea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn("field-input min-h-24 resize-y", className)} {...p} />
);
export const Select = ({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn("field-input cursor-pointer pr-6", className)} {...p} />
);

const badge = cva("inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-semibold", {
  variants: {
    tone: {
      navy: "bg-primary text-primary-foreground",
      blue: "bg-secondary text-secondary-foreground",
      muted: "bg-muted text-muted-foreground",
      outline: "border border-border text-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground",
      danger: "bg-destructive text-destructive-foreground",
    },
  },
  defaultVariants: { tone: "muted" },
});
export type BadgeTone = NonNullable<VariantProps<typeof badge>["tone"]>;
export const Badge = ({ tone, children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) => (
  <span className={cn(badge({ tone }), className)}>{children}</span>
);

export function DeadlineBadge({ m }: { m: Pick<Manuscript, "received_at" | "status" | "answered_at"> }) {
  const st = deadlineState(m);
  if (st === "answered") return <Badge tone="outline">Répondu</Badge>;
  const due = formatDate(deadlineDate(m.received_at).toISOString());
  if (st === "late") return <Badge tone="danger">En retard · {due}</Badge>;
  if (st === "watch") return <Badge tone="warning">À surveiller · {due}</Badge>;
  return <Badge tone="blue">Échéance {due}</Badge>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="panel px-6 py-12 text-center text-sm text-muted-foreground">{children}</div>;
}

export function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  if (pages <= 1) return <p className="mt-4 text-sm text-muted-foreground">{total} résultat(s)</p>;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{total} résultat(s)</span>
      <div className="flex items-center gap-2">
        <button aria-label="Page précédente" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-sm border border-border p-1.5 disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <span>
          {page} / {pages}
        </span>
        <button aria-label="Page suivante" disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-sm border border-border p-1.5 disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: ReactNode }[] }) {
  return (
    <div className="mb-6 flex gap-6 border-b border-border" role="tablist">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            "subtitle -mb-px border-b-2 pb-3 text-sm transition-colors",
            value === it.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-primary",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Loading() {
  return <div className="py-24 text-center text-sm text-muted-foreground">Chargement…</div>;
}

export function paginate<T>(rows: T[], page: number, size = 10) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(page, pages);
  return { rows: rows.slice((p - 1) * size, p * size), pages, page: p };
}

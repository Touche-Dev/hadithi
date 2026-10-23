import { useState, type FormEvent } from "react";
import { buttonStyles } from "./ui";

export function Newsletter({ variant = "navy" }: { variant?: "light" | "navy" }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const onNavy = variant === "navy";

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return;
    setDone(true);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-lg">
      <label
        htmlFor={`newsletter-${variant}`}
        className={`eyebrow mb-3 block ${onNavy ? "text-light-blue" : "text-muted-foreground"}`}
      >
        Email
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <input
          id={`newsletter-${variant}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className={`min-w-0 rounded-sm border bg-transparent px-4 py-3 text-sm outline-none transition-colors ${
            onNavy
              ? "border-cream/30 text-cream placeholder:text-cream/40 focus:border-light-blue"
              : "border-navy/25 text-navy placeholder:text-navy/40 focus:border-navy"
          }`}
        />
        <button type="submit" className={onNavy ? buttonStyles.onNavy : buttonStyles.solid}>
          S'abonner
        </button>
      </div>
      {done ? (
        <p
          className={`mt-3 text-sm ${onNavy ? "text-light-blue" : "text-muted-foreground"}`}
          role="status"
        >
          Merci — votre inscription est enregistrée.
        </p>
      ) : null}
    </form>
  );
}

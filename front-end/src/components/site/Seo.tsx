import { useEffect } from "react";

type SeoProps = {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Marks the page as non-indexable (used for "not found" states). */
  noindex?: boolean;
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attr: "name" | "property", key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

/**
 * Client-side replacement for TanStack Start's per-route `head()`. Under the
 * previous SSR setup these tags were rendered server-side; as a plain SPA
 * they are now applied after mount, so a crawler that does not execute
 * JavaScript will only see the defaults declared in `index.html`.
 */
export function Seo({ title, description, ogTitle, ogDescription, noindex }: SeoProps) {
  useEffect(() => {
    document.title = title;

    if (description) upsertMeta("name", "description", description);

    upsertMeta("property", "og:title", ogTitle ?? title);

    const resolvedOgDescription = ogDescription ?? description;
    if (resolvedOgDescription) {
      upsertMeta("property", "og:description", resolvedOgDescription);
    }

    if (noindex) {
      upsertMeta("name", "robots", "noindex");
    } else {
      removeMeta("name", "robots");
    }
  }, [title, description, ogTitle, ogDescription, noindex]);

  return null;
}

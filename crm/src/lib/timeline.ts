import type { RootState } from "@/store/hooks";
import { manuscriptStatusLabel, type Source } from "./labels";

export interface TimelineItem {
  key: string;
  source: Source;
  date: string;
  title: string;
  detail?: string;
  link?: { to: "/manuscrits/$id"; id: string };
}

type Data = RootState["data"];

export function contactTimeline(d: Data, contactId: number): TimelineItem[] {
  const items: TimelineItem[] = [];
  const colName = (id: string | null) => d.collections.find((c) => c.id === id)?.name ?? "Toutes";
  for (const m of d.manuscripts.filter((x) => x.contact_id === contactId))
    items.push({
      key: `m${m.id}`,
      source: "manuscrit",
      date: m.received_at,
      title: `Manuscrit envoyé : « ${m.title} »`,
      detail: `${m.genre} · ${manuscriptStatusLabel(m.status)}`,
      link: { to: "/manuscrits/$id", id: String(m.id) },
    });
  for (const b of d.bookClub.filter((x) => x.contact_id === contactId))
    items.push({ key: `b${b.id}`, source: "book_club", date: b.created_at, title: "Inscription au Book Club", detail: `Collection : ${colName(b.collection_id)}` });
  for (const a of d.academy.filter((x) => x.contact_id === contactId))
    items.push({ key: `a${a.id}`, source: "academy", date: a.created_at, title: `Demande Academy : ${a.workshop}`, detail: a.project });
  for (const r of d.registrations.filter((x) => x.contact_id === contactId)) {
    const ev = d.events.find((e) => e.slug === r.event_slug);
    items.push({ key: `r${r.id}`, source: "evenement", date: r.created_at, title: `Inscription : ${ev?.title ?? r.event_slug}`, detail: `${r.seats} place(s)` });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export function contactSources(d: Data): Map<number, Set<Source>> {
  const map = new Map<number, Set<Source>>();
  const add = (id: number, s: Source) => {
    if (!map.has(id)) map.set(id, new Set());
    map.get(id)!.add(s);
  };
  d.manuscripts.forEach((x) => add(x.contact_id, "manuscrit"));
  d.bookClub.forEach((x) => add(x.contact_id, "book_club"));
  d.academy.forEach((x) => add(x.contact_id, "academy"));
  d.registrations.forEach((x) => add(x.contact_id, "evenement"));
  return map;
}

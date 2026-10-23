/** Transforme un titre en slug d'URL : minuscules, sans accents, tirets. */
export function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Un événement est « à venir » tant que sa date n'est pas passée. */
export function isUpcoming(date: string, now = Date.now()) {
  return new Date(date).getTime() >= now;
}

export function seatsTaken(regs: { seats: number }[]) {
  return regs.reduce((n, r) => n + r.seats, 0);
}

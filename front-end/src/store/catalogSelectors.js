export const selectCatalogStatus = (s) => s.catalog.status;
export const selectCatalogError = (s) => s.catalog.error;

export const selectCollections = (s) => s.catalog.collections;
export const selectBooks = (s) => s.catalog.books;
export const selectAuthors = (s) => s.catalog.authors;
export const selectEvents = (s) => s.catalog.events;

export const selectBookBySlug = (slug) => (s) =>
  s.catalog.books.find((b) => b.slug === slug);

export const selectAuthorBySlug = (slug) => (s) =>
  s.catalog.authors.find((a) => a.slug === slug);

export const selectEventsByBook = (slug) => (s) =>
  s.catalog.events.filter((e) => e.book_slugs.includes(slug));

export const selectEventsByAuthor = (slug) => (s) =>
  s.catalog.events.filter((e) => e.author_slugs.includes(slug));
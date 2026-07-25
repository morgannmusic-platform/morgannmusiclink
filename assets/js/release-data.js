export const RELEASES = [
  { title: "LEVEL MAX", url: "LEVEL-MAX.html", subtitle: "Morgann Music" },
  { title: "GARÇON", url: "GARCON.html", subtitle: "Brooklyn" }
];

export function normalizePath(pathname) {
  const current = decodeURIComponent(pathname.split('/').pop() || 'index.html').trim();
  return current.length ? current : 'index.html';
}

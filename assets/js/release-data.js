export const RELEASES = [
  { title: "SILKY SMOOTH", url: "SILKY SMOOTH.html", subtitle: "Sortie le 14 mars 📅" },
  { title: "Latin El Clan 🔥🌴", url: "latinelclan.html", subtitle: "Sortie — Disponible maintenant" },
  { title: "Won't Give Up", url: "wontgiveup.html", subtitle: "Single" },
  { title: "80s", url: "80s.html", subtitle: "Sortie" },
  { title: "Velvet Breeze", url: "velvetbreeze.html", subtitle: "Sortie" },
  { title: "LEVEL MAX", url: "LEVEL-MAX.html", subtitle: "Single" },
  { title: "LEVEL UP", url: "LEVEL-UP.html", subtitle: "Single" },
  { title: "Glitter Night", url: "GlitterNight.html", subtitle: "Single" },
  { title: "Funky", url: "funky.html", subtitle: "Single" },
  { title: "Éther", url: "éther.html", subtitle: "Single" },
  { title: "SLINKY GROOVE", url: "SLINKY GROOVE.html", subtitle: "Single" },
  { title: "13", url: "13.html", subtitle: "Sortie" },
  { title: "Pas Simple", url: "Pas-Simple.html", subtitle: "Single" }
];

export function normalizePath(pathname) {
  const current = decodeURIComponent(pathname.split('/').pop() || 'index.html').trim();
  return current.length ? current : 'index.html';
}

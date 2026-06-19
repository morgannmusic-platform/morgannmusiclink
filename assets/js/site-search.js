import { RELEASES, normalizePath } from "./release-data.js";

const RECENT_PAGES_KEY = "morgann_recent_release_pages";
const MAX_RECENT = 5;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function initSearchBar() {
  const input = document.getElementById("global-search-input");
  const results = document.getElementById("global-search-results");

  if (!input || !results) return;

  const render = (query) => {
    const term = query.trim().toLowerCase();
    if (!term) {
      results.innerHTML = "";
      results.classList.remove("active");
      return;
    }

    const matches = RELEASES.filter((item) => {
      const title = item.title.toLowerCase();
      const subtitle = (item.subtitle || "").toLowerCase();
      return title.includes(term) || subtitle.includes(term);
    }).slice(0, 8);

    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">Aucune sortie trouvée</div>';
      results.classList.add("active");
      return;
    }

    results.innerHTML = matches
      .map(
        (item) =>
          `<a class="search-item" href="${item.url}"><span>${escapeHtml(item.title)}</span><small>${escapeHtml(
            item.subtitle || "Sortie"
          )}</small></a>`
      )
      .join("");

    results.classList.add("active");
  };

  input.addEventListener("input", (event) => {
    render(event.target.value);
  });

  document.addEventListener("click", (event) => {
    if (!results.contains(event.target) && event.target !== input) {
      results.classList.remove("active");
    }
  });
}

function trackReleasePageVisit() {
  const currentPath = normalizePath(window.location.pathname);
  const release = RELEASES.find((item) => item.url === currentPath);

  if (!release) return;

  const raw = localStorage.getItem(RECENT_PAGES_KEY);
  const parsed = raw ? JSON.parse(raw) : [];

  const filtered = parsed.filter((item) => item.url !== release.url);
  filtered.unshift({
    title: release.title,
    url: release.url,
    visitedAt: Date.now()
  });

  localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
}

function renderRecentOnHome() {
  const holder = document.getElementById("recent-pages-list");
  if (!holder) return;

  const raw = localStorage.getItem(RECENT_PAGES_KEY);
  const parsed = raw ? JSON.parse(raw) : [];

  if (!parsed.length) {
    holder.innerHTML = "<li>Aucune page consultée pour le moment.</li>";
    return;
  }

  holder.innerHTML = parsed
    .slice(0, MAX_RECENT)
    .map((item) => `<li><a href="${item.url}">${escapeHtml(item.title)}</a></li>`)
    .join("");
}

export function initGlobalSiteFeatures() {
  initSearchBar();
  trackReleasePageVisit();
  renderRecentOnHome();
}

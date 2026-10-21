export function initGlobalSiteFeatures() {
  const searchInput = document.getElementById("global-search-input");
  const searchResults = document.getElementById("global-search-results");

  if (!searchInput || !searchResults) return;

  let debounceTimer = null;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    clearTimeout(debounceTimer);

    if (!query) {
      searchResults.innerHTML = "";
      searchResults.classList.remove("active");
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        // Récupération globale des sorties et des artistes
        const [releasesRes, artistsRes] = await Promise.all([
          fetch("https://api.worker.mm-cp.uk/api/releases").then(r => r.json()).catch(() => ({ releases: [] })),
          fetch("https://api.worker.mm-cp.uk/api/artists").then(r => r.json()).catch(() => ({ artists: [] }))
        ]);

        const releases = releasesRes.releases || [];
        const artists = artistsRes.artists || [];

        // Normalisation pour comparer sans accents
        const normalize = (str) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const qNorm = normalize(query);

        // 1. Filtrer les SORTIES avec le statut "direct" et correspondant à la recherche
        const matchingReleases = releases.filter(r => {
          const status = normalize(r.status);
          const title = normalize(r.title);
          const artist = normalize(r.artistName);
          return status === "direct" && (title.includes(qNorm) || artist.includes(qNorm));
        });

        // Trouver les noms d'artistes qui ont au moins UNE sortie avec le statut "direct"
        const artistsWithDirectReleasesNames = new Set(
          releases
            .filter(r => normalize(r.status) === "direct" && r.artistName)
            .map(r => r.artistName.trim().toLowerCase())
        );

        // 2. Filtrer les ARTISTES correspondant à la recherche ET ayant au moins une sortie "direct"
        const matchingArtists = artists.filter(a => {
          const name = a.name ? a.name.trim().toLowerCase() : "";
          const hasDirect = artistsWithDirectReleasesNames.has(name);
          return hasDirect && normalize(a.name).includes(qNorm);
        });

        // Construction du HTML des résultats
        let html = "";

        if (matchingReleases.length === 0 && matchingArtists.length === 0) {
          searchResults.innerHTML = `<div class="search-empty" style="padding: 12px; color: #fff; text-align: center;">Aucun résultat direct trouvé</div>`;
          searchResults.classList.add("active");
          return;
        }

        // Affichage des Artistes trouvés
        if (matchingArtists.length > 0) {
          html += `<div style="padding: 6px 12px; font-size: 11px; text-transform: uppercase; color: #FC8FB0; font-weight: 700;">Artistes (Sorties Directes)</div>`;
          matchingArtists.forEach(artist => {
            html += `
                            <a href="artiste.html?name=${encodeURIComponent(artist.name)}" class="search-item">
                                <span>🎤 ${artist.name}</span>
                                <small style="color: #4CAF50; font-weight: 600;">Direct</small>
                            </a>
                        `;
          });
        }

        // Affichage des Sorties trouvées
        if (matchingReleases.length > 0) {
          html += `<div style="padding: 6px 12px; font-size: 11px; text-transform: uppercase; color: #FC8FB0; font-weight: 700; margin-top: 4px;">Sorties (Direct)</div>`;
          matchingReleases.forEach(release => {
            html += `
                            <a href="sortie.html?id=${release.id}" class="search-item">
                                <span>🎵 ${release.title} <small style="opacity:0.7;">(${release.artistName || 'Artiste'})</small></span>
                                <small style="color: #4CAF50; font-weight: 600;">Direct</small>
                            </a>
                        `;
          });
        }

        searchResults.innerHTML = html;
        searchResults.classList.add("active");

      } catch (err) {
        console.error("Erreur de recherche globale :", err);
      }
    }, 300);
  });

  // Fermer les résultats si on clique en dehors
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove("active");
    }
  });
}
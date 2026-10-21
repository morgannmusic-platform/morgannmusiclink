document.addEventListener("DOMContentLoaded", async () => {
    const artistesContainer = document.getElementById("artistes-container");
    const sortiesContainer = document.getElementById("sorties-container");

    // Fonction pour forcer l'URL absolue de l'API Worker
    const fixImgUrl = (url) => {
        if (!url) return "https://mm-cp.uk/assets/img/icons/sombre.png";
        if (url.startsWith("http")) return url;
        if (url.startsWith("pochette/") || url.startsWith("cover/")) {
            return `https://api.worker.mm-cp.uk/api/files/${url}`;
        }
        if (url.startsWith("/")) return `https://api.worker.mm-cp.uk${url}`;
        return `https://api.worker.mm-cp.uk/api/files/${url}`;
    };

    try {
        const [resReleases, resArtists] = await Promise.all([
            fetch("https://api.worker.mm-cp.uk/api/releases"),
            fetch("https://api.worker.mm-cp.uk/api/artists")
        ]);

        if (!resReleases.ok || !resArtists.ok) throw new Error("Erreur de communication avec l'API");

        const dataReleases = await resReleases.json();
        const dataArtists = await resArtists.json();

        const allReleases = dataReleases.releases || [];
        const artists = dataArtists.artists || [];

        // 1. Filtrer uniquement les sorties qui ont le statut "direct"
        const directReleases = allReleases.filter(r => (r.status || "").toLowerCase() === "direct");

        // 2. Les 5 dernières sorties (parmi celles qui sont "direct")
        const dernieresSorties = directReleases.slice(0, 5);
        sortiesContainer.innerHTML = "";

        if (dernieresSorties.length === 0) {
            sortiesContainer.innerHTML = "<p>Aucune sortie disponible.</p>";
        } else {
            dernieresSorties.forEach(release => {
                // On remplace le lien externe par sortie.html?id=
                const releaseId = release.id || release._id; // Adapte selon le nom de la clé de l'ID dans ton API
                const link = `sortie.html?id=${releaseId}`;
                const cover = fixImgUrl(release.cover_url || release.coverUrl);

                sortiesContainer.innerHTML += `
                    <a href="${link}" class="mml-card">
                        <img src="${cover}" alt="Cover ${release.title}">
                        <div class="mml-card-title">${release.title}</div>
                    </a>
                `;
            });
        }

        // 3. Compter les sorties "direct" par artiste pour le top 5
        const stats = {};
        directReleases.forEach(r => {
            const name = r.artistName;
            if (name) stats[name] = (stats[name] || 0) + 1;
        });

        // On ne garde que les artistes qui ont au moins une sortie "direct" (count > 0)
        const topArtistes = artists
            .map(a => ({ ...a, count: stats[a.name] || 0 }))
            .filter(a => a.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        artistesContainer.innerHTML = "";

        if (topArtistes.length === 0) {
            artistesContainer.innerHTML = "<p>Aucun artiste disponible.</p>";
        } else {
            topArtistes.forEach(artiste => {
                // Redirection vers artiste.html?name= avec encodage de l'URL
                const link = `artiste.html?name=${encodeURIComponent(artiste.name)}`;
                const photo = fixImgUrl(artiste.photo || artiste.logo_url || artiste.logoUrl);

                artistesContainer.innerHTML += `
                    <a href="${link}" class="mml-card">
                        <img src="${photo}" alt="Photo ${artiste.name}">
                        <div class="mml-card-title">${artiste.name}</div>
                    </a>
                `;
            });
        }

    } catch (error) {
        console.error("Erreur critique :", error);
        artistesContainer.innerHTML = "<p>Impossible de charger les artistes.</p>";
        sortiesContainer.innerHTML = "<p>Impossible de charger les sorties.</p>";
    }
});
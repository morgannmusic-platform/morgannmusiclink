export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();
    const baseUrl = `https://${hostname}`;

    try {
        // Récupération des sorties et des artistes en parallèle depuis la base D1
        const releasesPromise = env.DB.prepare(
            "SELECT id, updated_at, created_at FROM releases ORDER BY created_at DESC"
        ).all();

        const artistsPromise = env.DB.prepare(
            "SELECT id, created_at FROM artists ORDER BY created_at DESC"
        ).all();

        const [releasesRes, artistsRes] = await Promise.all([releasesPromise, artistsPromise]);
        const releases = releasesRes.results || [];
        const artists = artistsRes.results || [];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Page d'accueil
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;

        // Boucle sur les sorties (/sortie?id=...)
        for (const row of releases) {
            let lastmod = row.updated_at || row.created_at || new Date().toISOString();
            if (lastmod.includes("T")) {
                lastmod = lastmod.split("T")[0];
            }

            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/sortie?id=${row.id}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        }

        // Boucle sur les artistes (/artiste?id=...)
        for (const row of artists) {
            let lastmod = row.created_at || new Date().toISOString();
            if (lastmod.includes("T")) {
                lastmod = lastmod.split("T")[0];
            }

            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/artiste?id=${row.id}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            xml += `  </url>\n`;
        }

        xml += `</urlset>`;

        return new Response(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (err) {
        return new Response(`<error>${err.message}</error>`, {
            status: 500,
            headers: { "Content-Type": "application/xml; charset=utf-8" }
        });
    }
}
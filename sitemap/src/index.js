export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Si on ne demande pas explicitement le sitemap, on renvoie une 404
        if (url.pathname !== "/sitemap.xml") {
            return new Response("Non trouvé", { status: 404 });
        }

        try {
            // Récupération des IDs et des dates depuis ta table releases
            const { results } = await env.DB.prepare(
                "SELECT id, updated_at, created_at FROM releases ORDER BY created_at DESC"
            ).all();

            const hostname = url.hostname.toLowerCase();
            const baseUrl = `https://${hostname}`;

            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

            // Page d'accueil du sous-domaine (link ou play)
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/</loc>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += `    <priority>1.0</priority>\n`;
            xml += `  </url>\n`;

            // Boucle sur chaque sortie pour générer son URL avec l'ID
            for (const row of (results || [])) {
                const releaseId = row.id;
                let lastmod = row.updated_at || row.created_at || new Date().toISOString();
                if (lastmod.includes("T")) {
                    lastmod = lastmod.split("T")[0];
                }

                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/sortie?id=${releaseId}</loc>\n`;
                xml += `    <lastmod>${lastmod}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.8</priority>\n`;
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
};
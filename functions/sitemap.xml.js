export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const baseUrl = `https://${hostname}`;

  // Fonction pour garantir un format de date valide (YYYY-MM-DD) exigé par Google
  function formatDate(dateString) {
    try {
      if (!dateString) return new Date().toISOString().split("T")[0];
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
    } catch (e) {}
    return new Date().toISOString().split("T")[0];
  }

  try {
    // 1. Récupération des sorties avec le statut 'direct' ou 'livrée'
    const releasesRes = await env.DB.prepare(
      `SELECT id, updated_at, created_at 
       FROM releases 
       WHERE LOWER(status) IN ('direct', 'livrée', 'livree') 
       ORDER BY created_at DESC`
    ).all();
    const releases = releasesRes.results || [];

    // 2. Récupération des artistes liés à ces sorties
    const artistsRes = await env.DB.prepare(
      `SELECT DISTINCT a.id, a.created_at 
       FROM artists a
       JOIN releases r ON (r.user_uid = a.user_uid OR LOWER(r.artist_name) = LOWER(a.name))
       WHERE LOWER(r.status) IN ('direct', 'livrée', 'livree')
       ORDER BY a.created_at DESC`
    ).all();
    const artists = artistsRes.results || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Page d'accueil
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Boucle sur les sorties filtrées
    for (const row of releases) {
      const lastmod = formatDate(row.updated_at || row.created_at);

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/sortie?id=${row.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Boucle sur les artistes valides
    for (const row of artists) {
      const lastmod = formatDate(row.created_at);

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
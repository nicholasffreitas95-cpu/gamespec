// Robô de notícias do GameSpec
// Busca RSS de portais de hardware/tech, filtra, categoriza e grava news.json
// Executado automaticamente pelo GitHub Actions (diário) — sem dependências

const FEEDS = [
  { name: "Adrenaline", url: "https://adrenaline.com.br/rss" },
  { name: "TecMundo", url: "https://www.tecmundo.com.br/hardware/rss" },
  { name: "Canaltech", url: "https://canaltech.com.br/rss/hardware/" },
  { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/full" },
  { name: "VideoCardz", url: "https://videocardz.com/feed" }
];

function decodeXml(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function extract(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeXml(m[1]) : "";
}

function categorize(title) {
  const t = title.toLowerCase();
  if (/pre[çc]o|pre[çc]os|price|d[óo]lar|aumento|car[oa]s?[ao]?|custo|tarifa|mais barat|desconto|promo/.test(t))
    return "💰 Preços";
  if (/review|an[áa]lise|testamos|benchmark|comparativo/.test(t)) return "🔬 Review";
  if (/lan[çc]a|lanzado|announc|anunci|revelad|chega|apresentad|novo|nova|rumor|vazou|leak/.test(t))
    return "🚀 Lançamentos";
  return "📰 Mercado";
}

async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "GameSpec-NewsBot/1.0" },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = [];
    const blocks = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi);
    for (const b of blocks) {
      const title = extract(b[1], "title");
      const link = extract(b[1], "link");
      const pubDate = extract(b[1], "pubDate");
      if (!title || !link) continue;
      const date = pubDate ? new Date(pubDate) : new Date();
      if (isNaN(date)) continue;
      // Descarta notícias com mais de 15 dias
      if (Date.now() - date.getTime() > 15 * 24 * 3600 * 1000) continue;
      items.push({
        title,
        link,
        source: feed.name,
        date: date.toISOString(),
        tag: categorize(title)
      });
    }
    console.log(`✓ ${feed.name}: ${items.length} itens`);
    return items;
  } catch (err) {
    console.warn(`✗ ${feed.name}: ${err.message}`);
    return [];
  }
}

const results = await Promise.all(FEEDS.map(fetchFeed));

// Deduplica por título normalizado e ordena por data
const seen = new Set();
const all = results
  .flat()
  .filter((n) => {
    const key = n.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 40);

const payload = {
  updated: new Date().toISOString(),
  total: all.length,
  items: all
};

await import("node:fs").then((fs) =>
  fs.writeFileSync("news.json", JSON.stringify(payload, null, 2))
);

console.log(`news.json gerado com ${all.length} notícias.`);

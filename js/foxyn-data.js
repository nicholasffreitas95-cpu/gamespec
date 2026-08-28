// ============================================================
// FOXYN — Dados de demonstração + integração com APIs
// Radar de Preços, Benchmark e Produtos
// Em produção: trocar os mock pelo resultado do proxy/API.
// ============================================================

// Catálogo de produtos para o Radar (dados de demonstração)
const FOXYN_PRODUCTS = [
  { id: "rtx4060", name: "RTX 4060 8GB", brand: "NVIDIA", price: 1849, prev: 1999, store: "Kabum", stock: true, trend: -7.5 },
  { id: "rx7800xt", name: "RX 7800 XT 16GB", brand: "AMD", price: 2899, prev: 3299, store: "Terabyte", stock: true, trend: -12.1 },
  { id: "r5-7600", name: "Ryzen 5 7600", brand: "AMD", price: 1099, prev: 1199, store: "Kabum", stock: true, trend: -8.3 },
  { id: "i5-13400f", name: "Core i5-13400F", brand: "Intel", price: 999, prev: 1099, store: "Pichau", stock: true, trend: -9.1 },
  { id: "rtx4070super", name: "RTX 4070 Super 12GB", brand: "NVIDIA", price: 3799, prev: 3599, store: "Terabyte", stock: false, trend: 5.6 },
  { id: "ddr5-32", name: "DDR5 32GB 6000MT/s", brand: "Kingston", price: 649, prev: 780, store: "Kabum", stock: true, trend: -16.8 },
  { id: "ssd-1tb", name: "SSD NVMe 1TB Gen4", brand: "Samsung", price: 549, prev: 599, store: "Terabyte", stock: true, trend: -8.3 },
  { id: "rx7600", name: "RX 7600 8GB", brand: "AMD", price: 1599, prev: 1699, store: "Pichau", stock: true, trend: -5.9 }
];

// Histórico de preços simulado (últimos 6 meses) para gerar gráficos
const FOXYN_PRICE_HISTORY = {
  rtx4060: [2190, 2120, 2050, 1999, 1940, 1849],
  rx7800xt: [3490, 3410, 3320, 3299, 3150, 2899],
  r5-7600: [1250, 1230, 1200, 1199, 1150, 1099],
  i5-13400f: [1150, 1120, 1099, 1070, 1040, 999],
  rtx4070super: [3490, 3500, 3520, 3550, 3599, 3799],
  ddr5-32: [820, 800, 780, 740, 690, 649],
  "ssd-1tb": [620, 610, 599, 580, 570, 549],
  rx7600: [1790, 1750, 1720, 1699, 1650, 1599]
};

// Calcula o Buy Score de um produto (0-100)
// Combina tendência de preço, disponibilidade e desconto
function foxynBuyScore(product) {
  let score = 50;
  if (product.trend < 0) score += Math.min(30, -product.trend * 2.2);
  else score -= Math.min(25, product.trend * 2.2);
  if (product.stock) score += 12;
  const discount = ((product.prev - product.price) / product.prev) * 100;
  if (discount > 0) score += Math.min(15, discount * 1.5);
  return Math.max(0, Math.min(99, Math.round(score)));
}

// Gera um "PC Score" (0-100) para um PC de demonstração
function foxynPCScore() {
  return 76;
}

// Gera dados de benchmark de demonstração (FPS, 1% low, heatmaps)
function foxynBenchmarkGame(game) {
  const g = game || { name: "Cyberpunk 2077", fps: { low: 40, medium: 62, high: 78, ultra: 55 }, genre: "RPG" };
  return {
    game: g.name,
    average: 78,
    low1: 61,
    frametime: 12.8,
    tempCpu: 62,
    tempGpu: 68,
    usageCpu: 45,
    usageGpu: 82
  };
}

// Nosso catálogo de jogos com FPS de referência
const FOXYN_GAMES = [
  { id: "cs2", name: "CS2", genre: "FPS", fps: { low: 180, medium: 150, high: 120, ultra: 90 } },
  { id: "valorant", name: "Valorant", genre: "FPS", fps: { low: 220, medium: 180, high: 150, ultra: 120 } },
  { id: "fortnite", name: "Fortnite", genre: "Battle Royale", fps: { low: 90, medium: 75, high: 60, ultra: 45 } },
  { id: "apex", name: "Apex Legends", genre: "Battle Royale", fps: { low: 85, medium: 72, high: 60, ultra: 48 } },
  { id: "cyberpunk", name: "Cyberpunk 2077", genre: "RPG", fps: { low: 55, medium: 45, high: 40, ultra: 30 } },
  { id: "rdr2", name: "Red Dead Redemption 2", genre: "Ação", fps: { low: 70, medium: 55, high: 48, ultra: 38 } },
  { id: "gta5", name: "GTA V", genre: "Ação", fps: { low: 90, medium: 75, high: 62, ultra: 50 } },
  { id: "gow", name: "God of War", genre: "Ação", fps: { low: 65, medium: 50, high: 42, ultra: 34 } }
];

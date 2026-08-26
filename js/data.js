// Banco de dados de hardware e jogos
// gpuScore / cpuScore: índice relativo de desempenho (100 = RTX 3070 / Ryzen 7 5800X)
// Jogos: fps de referência a 1080p para uma GPU índice 100, por preset

const CPUS = [
  { id: "c2d-e8400", name: "Intel Core 2 Duo E8400", score: 10, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "c2q-q6600", name: "Intel Core 2 Quad Q6600", score: 13, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "c2q-q9550", name: "Intel Core 2 Quad Q9550", score: 15, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i3-2100", name: "Intel Core i3-2100", score: 21, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i3-3220", name: "Intel Core i3-3220", score: 26, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i5-2400", name: "Intel Core i5-2400", score: 27, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "g4560", name: "Intel Pentium G4560", score: 28, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i5-2500k", name: "Intel Core i5-2500K", score: 31, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i5-3470", name: "Intel Core i5-3470", score: 31, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i7-2600", name: "Intel Core i7-2600", score: 33, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i5-4460", name: "Intel Core i5-4460", score: 34, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i5-4590", name: "Intel Core i5-4590", score: 36, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i7-3770", name: "Intel Core i7-3770", score: 36, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },
  { id: "i7-4790", name: "Intel Core i7-4790", score: 39, group: "Intel — Linhas antigas (LGA775 / 1155 / 1150)" },

  { id: "i3-10100f", name: "Intel Core i3-10100F", score: 42, group: "Intel — Modernos" },
  { id: "i3-12100f", name: "Intel Core i3-12100F", score: 55, group: "Intel — Modernos" },
  { id: "i5-10400f", name: "Intel Core i5-10400F", score: 60, group: "Intel — Modernos" },
  { id: "i5-11400f", name: "Intel Core i5-11400F", score: 66, group: "Intel — Modernos" },
  { id: "i5-12400f", name: "Intel Core i5-12400F", score: 80, group: "Intel — Modernos" },
  { id: "i5-13400f", name: "Intel Core i5-13400F", score: 90, group: "Intel — Modernos" },
  { id: "i5-13600k", name: "Intel Core i5-13600K", score: 110, group: "Intel — Modernos" },
  { id: "i7-11700", name: "Intel Core i7-11700", score: 85, group: "Intel — Modernos" },
  { id: "i7-12700k", name: "Intel Core i7-12700K", score: 115, group: "Intel — Modernos" },
  { id: "i7-13700k", name: "Intel Core i7-13700K", score: 125, group: "Intel — Modernos" },
  { id: "i9-12900k", name: "Intel Core i9-12900K", score: 128, group: "Intel — Modernos" },
  { id: "i9-13900k", name: "Intel Core i9-13900K", score: 138, group: "Intel — Modernos" },

  { id: "ph2-x4-965", name: "AMD Phenom II X4 965", score: 18, group: "AMD — Linhas antigas (AM3 / AM3+ / FM2)" },
  { id: "fx-4300", name: "AMD FX-4300", score: 20, group: "AMD — Linhas antigas (AM3 / AM3+ / FM2)" },
  { id: "fx-6300", name: "AMD FX-6300", score: 26, group: "AMD — Linhas antigas (AM3 / AM3+ / FM2)" },
  { id: "fx-8320", name: "AMD FX-8320", score: 31, group: "AMD — Linhas antigas (AM3 / AM3+ / FM2)" },
  { id: "fx-8350", name: "AMD FX-8350", score: 33, group: "AMD — Linhas antigas (AM3 / AM3+ / FM2)" },

  { id: "r3-3200g", name: "AMD Ryzen 3 3200G", score: 30, group: "AMD — Ryzen" },
  { id: "athlon-3000g", name: "AMD Athlon 3000G", score: 34, group: "AMD — Ryzen" },
  { id: "r3-1200", name: "AMD Ryzen 3 1200", score: 38, group: "AMD — Ryzen" },
  { id: "r5-1600", name: "AMD Ryzen 5 1600", score: 47, group: "AMD — Ryzen" },
  { id: "r5-2600", name: "AMD Ryzen 5 2600", score: 51, group: "AMD — Ryzen" },
  { id: "r5-3600", name: "AMD Ryzen 5 3600", score: 65, group: "AMD — Ryzen" },
  { id: "r5-5600", name: "AMD Ryzen 5 5600", score: 78, group: "AMD — Ryzen" },
  { id: "r5-5600x3d", name: "AMD Ryzen 5 5600X3D", score: 88, group: "AMD — Ryzen" },
  { id: "r5-7600", name: "AMD Ryzen 5 7600", score: 95, group: "AMD — Ryzen" },
  { id: "r7-3700x", name: "AMD Ryzen 7 3700X", score: 72, group: "AMD — Ryzen" },
  { id: "r7-5700x", name: "AMD Ryzen 7 5700X", score: 88, group: "AMD — Ryzen" },
  { id: "r7-5800x3d", name: "AMD Ryzen 7 5800X3D", score: 105, group: "AMD — Ryzen" },
  { id: "r7-7800x3d", name: "AMD Ryzen 7 7800X3D", score: 122, group: "AMD — Ryzen" },
  { id: "r9-5900x", name: "AMD Ryzen 9 5900X", score: 100, group: "AMD — Ryzen" },
  { id: "r9-7900x", name: "AMD Ryzen 9 7900X", score: 126, group: "AMD — Ryzen" }
];

const GPUS = [
  { id: "gtx750ti", name: "NVIDIA GTX 750 Ti", score: 15, vram: 2, group: "NVIDIA — Antigas (GTX 700 / 900)" },
  { id: "gtx760", name: "NVIDIA GTX 760", score: 21, vram: 2, group: "NVIDIA — Antigas (GTX 700 / 900)" },
  { id: "gtx960", name: "NVIDIA GTX 960", score: 23, vram: 2, group: "NVIDIA — Antigas (GTX 700 / 900)" },
  { id: "gtx970", name: "NVIDIA GTX 970", score: 33, vram: 4, group: "NVIDIA — Antigas (GTX 700 / 900)" },
  { id: "gtx980", name: "NVIDIA GTX 980", score: 37, vram: 4, group: "NVIDIA — Antigas (GTX 700 / 900)" },

  { id: "gtx1050", name: "NVIDIA GTX 1050", score: 18, vram: 2, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1050ti", name: "NVIDIA GTX 1050 Ti", score: 22, vram: 4, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1060-3gb", name: "NVIDIA GTX 1060 3GB", score: 27, vram: 3, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1060", name: "NVIDIA GTX 1060 6GB", score: 32, vram: 6, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1070", name: "NVIDIA GTX 1070", score: 46, vram: 8, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1070ti", name: "NVIDIA GTX 1070 Ti", score: 49, vram: 8, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1080", name: "NVIDIA GTX 1080", score: 54, vram: 8, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1080ti", name: "NVIDIA GTX 1080 Ti", score: 68, vram: 11, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1650", name: "NVIDIA GTX 1650", score: 28, vram: 4, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1660", name: "NVIDIA GTX 1660", score: 37, vram: 6, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1660s", name: "NVIDIA GTX 1660 Super", score: 40, vram: 6, group: "NVIDIA — GTX 10 / 16" },
  { id: "gtx1660ti", name: "NVIDIA GTX 1660 Ti", score: 43, vram: 6, group: "NVIDIA — GTX 10 / 16" },

  { id: "rtx2060", name: "NVIDIA RTX 2060", score: 50, vram: 6, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx2060s", name: "NVIDIA RTX 2060 Super", score: 57, vram: 8, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx2070", name: "NVIDIA RTX 2070", score: 61, vram: 8, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx2070s", name: "NVIDIA RTX 2070 Super", score: 66, vram: 8, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx2080", name: "NVIDIA RTX 2080", score: 74, vram: 8, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx2080ti", name: "NVIDIA RTX 2080 Ti", score: 92, vram: 11, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx3050", name: "NVIDIA RTX 3050", score: 42, vram: 8, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx3060-8", name: "NVIDIA RTX 3060 8GB", score: 63, vram: 8, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx3060-12", name: "NVIDIA RTX 3060 12GB", score: 66, vram: 12, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx3060ti", name: "NVIDIA RTX 3060 Ti", score: 85, vram: 8, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx3070", name: "NVIDIA RTX 3070", score: 100, vram: 8, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx3080", name: "NVIDIA RTX 3080", score: 130, vram: 10, group: "NVIDIA — RTX 20 / 30" },
  { id: "rtx3090", name: "NVIDIA RTX 3090", score: 145, vram: 24, group: "NVIDIA — RTX 20 / 30", premium: true },

  { id: "rtx4060", name: "NVIDIA RTX 4060", score: 82, vram: 8, group: "NVIDIA — RTX 40" },
  { id: "rtx4060ti-8", name: "NVIDIA RTX 4060 Ti 8GB", score: 94, vram: 8, group: "NVIDIA — RTX 40" },
  { id: "rtx4060ti-16", name: "NVIDIA RTX 4060 Ti 16GB", score: 96, vram: 16, group: "NVIDIA — RTX 40" },
  { id: "rtx4070", name: "NVIDIA RTX 4070", score: 118, vram: 12, group: "NVIDIA — RTX 40" },
  { id: "rtx4070ti", name: "NVIDIA RTX 4070 Ti", score: 140, vram: 12, group: "NVIDIA — RTX 40" },
  { id: "rtx4080", name: "NVIDIA RTX 4080", score: 175, vram: 16, group: "NVIDIA — RTX 40", premium: true },
  { id: "rtx4090", name: "NVIDIA RTX 4090", score: 260, vram: 24, group: "NVIDIA — RTX 40", premium: true },

  { id: "r7-360", name: "AMD Radeon R7 360", score: 13, vram: 2, group: "AMD — Antigas (R7 / R9)" },
  { id: "rx460", name: "AMD RX 460", score: 15, vram: 2, group: "AMD — Antigas (R7 / R9)" },
  { id: "r9-270x", name: "AMD Radeon R9 270X", score: 17, vram: 2, group: "AMD — Antigas (R7 / R9)" },
  { id: "r9-280x", name: "AMD Radeon R9 280X", score: 20, vram: 3, group: "AMD — Antigas (R7 / R9)" },
  { id: "r9-380", name: "AMD Radeon R9 380", score: 21, vram: 4, group: "AMD — Antigas (R7 / R9)" },
  { id: "r9-390", name: "AMD Radeon R9 390", score: 28, vram: 8, group: "AMD — Antigas (R7 / R9)" },

  { id: "rx470", name: "AMD RX 470", score: 26, vram: 4, group: "AMD — RX 400 / 500 / Vega" },
  { id: "rx570", name: "AMD RX 570", score: 27, vram: 8, group: "AMD — RX 400 / 500 / Vega" },
  { id: "rx480", name: "AMD RX 480", score: 29, vram: 8, group: "AMD — RX 400 / 500 / Vega" },
  { id: "rx580", name: "AMD RX 580", score: 30, vram: 8, group: "AMD — RX 400 / 500 / Vega" },
  { id: "rx590", name: "AMD RX 590", score: 36, vram: 8, group: "AMD — RX 400 / 500 / Vega" },
  { id: "rx5500xt", name: "AMD RX 5500 XT", score: 26, vram: 8, group: "AMD — RX 400 / 500 / Vega" },
  { id: "rx5600xt", name: "AMD RX 5600 XT", score: 44, vram: 6, group: "AMD — RX 400 / 500 / Vega" },
  { id: "rx5700xt", name: "AMD RX 5700 XT", score: 52, vram: 8, group: "AMD — RX 400 / 500 / Vega" },
  { id: "rx6500xt", name: "AMD RX 6500 XT", score: 38, vram: 4, group: "AMD — RX 400 / 500 / Vega" },
  { id: "vega56", name: "AMD Radeon RX Vega 56", score: 52, vram: 8, group: "AMD — RX 400 / 500 / Vega" },
  { id: "vega64", name: "AMD Radeon RX Vega 64", score: 55, vram: 8, group: "AMD — RX 400 / 500 / Vega" },

  { id: "rx6600", name: "AMD RX 6600", score: 60, vram: 8, group: "AMD — RX 6000 / 7000" },
  { id: "rx6650xt", name: "AMD RX 6650 XT", score: 68, vram: 8, group: "AMD — RX 6000 / 7000" },
  { id: "rx6700xt", name: "AMD RX 6700 XT", score: 90, vram: 12, group: "AMD — RX 6000 / 7000" },
  { id: "rx6800xt", name: "AMD RX 6800 XT", score: 125, vram: 16, group: "AMD — RX 6000 / 7000" },
  { id: "rx6900xt", name: "AMD RX 6900 XT", score: 132, vram: 16, group: "AMD — RX 6000 / 7000" },
  { id: "rx7600", name: "AMD RX 7600", score: 72, vram: 8, group: "AMD — RX 6000 / 7000" },
  { id: "rx7800xt", name: "AMD RX 7800 XT", score: 120, vram: 16, group: "AMD — RX 6000 / 7000" },
  { id: "rx7900xt", name: "AMD RX 7900 XT", score: 165, vram: 20, group: "AMD — RX 6000 / 7000", premium: true },
  { id: "rx7900xtx", name: "AMD RX 7900 XTX", score: 200, vram: 24, group: "AMD — RX 6000 / 7000", premium: true },

  { id: "arc-a310", name: "Intel Arc A310", score: 20, vram: 4, group: "Intel Arc" },
  { id: "arc-a380", name: "Intel Arc A380", score: 26, vram: 6, group: "Intel Arc" },
  { id: "arc-a580", name: "Intel Arc A580", score: 60, vram: 8, group: "Intel Arc" },
  { id: "arc-a750", name: "Intel Arc A750", score: 74, vram: 8, group: "Intel Arc" },
  { id: "arc-a770-8", name: "Intel Arc A770 8GB", score: 78, vram: 8, group: "Intel Arc" },
  { id: "arc-a770-16", name: "Intel Arc A770 16GB", score: 80, vram: 16, group: "Intel Arc" }
];

// refFpsLow/Med/High/Ultra: FPS médio a 1080p numa GPU de índice 100 (≈RTX 3070)
// cpuHeavy: quanto o jogo depende do processador para alcançar FPS alto
const GAMES = [
  { id: "cyberpunk2077", name: "Cyberpunk 2077", genre: "RPG / Mundo aberto", cpuHeavy: 0.75, vramHeavy: true,
    fps: { low: 150, medium: 115, high: 90, ultra: 68 } },
  { id: "eldenring", name: "Elden Ring", genre: "Action RPG", cpuHeavy: 0.55,
    fps: { low: 110, medium: 95, high: 82, ultra: 62 } },
  { id: "gtav", name: "GTA V", genre: "Ação / Mundo aberto", cpuHeavy: 0.7,
    fps: { low: 280, medium: 220, high: 180, ultra: 145 } },
  { id: "rdr2", name: "Red Dead Redemption 2", genre: "Mundo aberto", cpuHeavy: 0.7, vramHeavy: true,
    fps: { low: 155, medium: 125, high: 100, ultra: 76 } },
  { id: "witcher3", name: "The Witcher 3 (Next-Gen)", genre: "RPG / Mundo aberto", cpuHeavy: 0.6,
    fps: { low: 170, medium: 135, high: 108, ultra: 84 } },
  { id: "bg3", name: "Baldur's Gate 3", genre: "RPG", cpuHeavy: 0.85,
    fps: { low: 190, medium: 160, high: 130, ultra: 102 } },
  { id: "hogwarts", name: "Hogwarts Legacy", genre: "RPG / Mundo aberto", cpuHeavy: 0.6, vramHeavy: true,
    fps: { low: 115, medium: 92, high: 74, ultra: 56 } },
  { id: "godofwar", name: "God of War (2018)", genre: "Action Adventure", cpuHeavy: 0.6,
    fps: { low: 170, medium: 140, high: 115, ultra: 92 } },
  { id: "spiderman", name: "Marvel's Spider-Man Remastered", genre: "Action Adventure", cpuHeavy: 0.8,
    fps: { low: 210, medium: 175, high: 145, ultra: 112 } },
  { id: "forza5", name: "Forza Horizon 5", genre: "Corrida", cpuHeavy: 0.6,
    fps: { low: 250, medium: 205, high: 168, ultra: 128 } },
  { id: "starfield", name: "Starfield", genre: "RPG / Espaço", cpuHeavy: 0.85, vramHeavy: true,
    fps: { low: 85, medium: 68, high: 55, ultra: 42 } },
  { id: "alanwake2", name: "Alan Wake 2", genre: "Terror / Gráficos pesados", cpuHeavy: 0.55, vramHeavy: true,
    fps: { low: 78, medium: 60, high: 47, ultra: 34 } },
  { id: "palworld", name: "Palworld", genre: "Sobrevivência", cpuHeavy: 0.8,
    fps: { low: 120, medium: 98, high: 78, ultra: 58 } },
  { id: "valorant", name: "Valorant", genre: "FPS Competitivo", cpuHeavy: 1.1,
    fps: { low: 600, medium: 520, high: 460, ultra: 400 } },
  { id: "cs2", name: "Counter-Strike 2", genre: "FPS Competitivo", cpuHeavy: 1.15,
    fps: { low: 480, medium: 420, high: 360, ultra: 300 } },
  { id: "fortnite", name: "Fortnite", genre: "Battle Royale", cpuHeavy: 0.9,
    fps: { low: 290, medium: 220, high: 165, ultra: 115 } },
  { id: "apex", name: "Apex Legends", genre: "Battle Royale", cpuHeavy: 0.95,
    fps: { low: 330, medium: 285, high: 255, ultra: 215 } },
  { id: "warzone", name: "Call of Duty: Warzone", genre: "Battle Royale", cpuHeavy: 0.9,
    fps: { low: 210, medium: 175, high: 148, ultra: 120 } },
  { id: "lol", name: "League of Legends", genre: "MOBA", cpuHeavy: 1.2,
    fps: { low: 550, medium: 500, high: 450, ultra: 380 } },
  { id: "minecraft", name: "Minecraft (Java)", genre: "Sandbox", cpuHeavy: 1.25,
    fps: { low: 650, medium: 560, high: 480, ultra: 380 } }
];

const RESOLUTIONS = [
  { id: "1080p", name: "Full HD (1920x1080)", mult: 1.0, vramMult: 1.0 },
  { id: "1440p", name: "QHD (2560x1440)", mult: 1.75, vramMult: 1.35, premium: true },
  { id: "4k", name: "4K (3840x2160)", mult: 3.6, vramMult: 2.0, premium: true }
];

const RAM_OPTIONS = [
  { value: 8, label: "8 GB", factor: 0.78 },
  { value: 12, label: "12 GB", factor: 0.9 },
  { value: 16, label: "16 GB", factor: 1.0 },
  { value: 24, label: "24 GB", factor: 1.01 },
  { value: 32, label: "32 GB", factor: 1.02 },
  { value: 64, label: "64 GB ou mais", factor: 1.02 }
];

const UPSCALING_OPTIONS = [
  { value: 1.0, label: "Desligado (nativo)" },
  { value: 1.5, label: "Quality (~+50% FPS)" },
  { value: 1.75, label: "Balanced (~+75% FPS)" },
  { value: 2.0, label: "Performance (~+100% FPS)" }
];

// premium: true = visível somente para assinantes
const TIPS = [
  { premium: false, title: "🎮 GPU primeiro, sempre",
    text: "Para jogos, a placa de vídeo influencia 2 a 3 vezes mais que o processador. Se o orçamento é limitado, priorize a melhor GPU possível dentro do seu valor." },
  { premium: false, title: "🧠 16 GB de RAM é o mínimo hoje",
    text: "Jogos modernos como Cyberpunk 2077 e Hogwarts Legacy consomem facilmente mais de 12 GB com o sistema aberto. Com 8 GB você terá travamentos mesmo com hardware bom." },
  { premium: false, title: "💾 Instale os jogos em SSD NVMe",
    text: "Além do carregamento muito mais rápido, jogos em mundo aberto fazem streaming de texturas direto do disco — em HD, isso causa pop-in e engasgos constantes." },
  { premium: true, title: "⚡ Undervolt e curva de fan inteligente",
    text: "Reduzir a tensão da GPU/CPU em 5-10% mantém os mesmos clocks com menos calor, permitindo boost sustentado por mais tempo. Ferramentas: MSI Afterburner (GPU) e Curve Optimizer (Ryzen)." },
  { premium: true, title: "🔧 Ative Resizable BAR (ReBAR/SAM)",
    text: "Permite à CPU acessar toda a VRAM de uma vez. Em jogos como Horizon e Forza, ganhos de 5-15%. Ative na BIOS (Above 4G Decoding + ReBAR) — placas RX 6000/7000 chamam de Smart Access Memory." },
  { premium: true, title: "🖥️ Drivers: limpeza completa ao trocar de GPU",
    text: "Ao migrar NVIDIA→AMD (ou o contrário), use o DDU (Display Driver Uninstaller) em modo seguro. Restos de driver antigo causam queda de desempenho, tela preta e crashes aleatórios." }
];

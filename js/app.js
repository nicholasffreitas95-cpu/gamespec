// Lógica de estimativa de desempenho
// Modelo: o limite de FPS é o menor entre gargalo de GPU e gargalo de CPU.
// O upscaling (DLSS/FSR) acelera apenas o lado da GPU, com eficiência < 100%.

const REF_CPU_SCORE = 85; // CPU de referência (Ryzen 7 5700X)
const UPSCALE_EFFICIENCY = 0.92;
// VRAM necessária (GB) por preset em 1080p; multiplicada pela resolução
const VRAM_NEED_GB = { low: 2.5, medium: 4, high: 6, ultra: 8 };
const PRESETS = [
  { id: "low", name: "Baixo" },
  { id: "medium", name: "Médio" },
  { id: "high", name: "Alto" },
  { id: "ultra", name: "Ultra" }
];

function estimateFps(cpu, gpu, ram, res, game, upscale) {
  const ramFactor = ram.factor;
  const presetResults = {};

  for (const preset of PRESETS) {
    const refFps = game.fps[preset.id];
    const upscaleEff = 1 + (upscale - 1) * UPSCALE_EFFICIENCY;
    let gpuLimited = ((refFps * gpu.score) / 100 / res.mult) * upscaleEff;
    const cpuLimited = (refFps * cpu.score) / REF_CPU_SCORE;

    // Penalidade por VRAM insuficiente: jogos pesados + resoluções altas exigem mais memória
    const vramNeed =
      VRAM_NEED_GB[preset.id] * res.vramMult * (game.vramHeavy ? 1.25 : 1);
    const vramDeficit = Math.max(0, vramNeed - gpu.vram);
    const vramFactor =
      vramDeficit > 0 ? Math.max(0.6, 1 - vramDeficit * 0.05) : 1;
    gpuLimited *= vramFactor;

    const fps = Math.min(gpuLimited, cpuLimited) * ramFactor;
    const bottleneck = gpuLimited < cpuLimited ? "gpu" : "cpu";
    presetResults[preset.id] = {
      fps: Math.round(fps),
      bottleneck,
      vramLimited: vramFactor < 1,
      vramNeed: Math.round(vramNeed * 10) / 10
    };
  }

  return presetResults;
}

function classify(fps) {
  if (fps >= 144) return { label: "Competitivo", cls: "great" };
  if (fps >= 100) return { label: "Excelente", cls: "great" };
  if (fps >= 60) return { label: "Muito bom", cls: "good" };
  if (fps >= 40) return { label: "Jogável", cls: "ok" };
  return { label: "Insuficiente", cls: "bad" };
}

function recommendPreset(results) {
  for (let i = PRESETS.length - 1; i >= 0; i--) {
    if (results[PRESETS[i].id].fps >= 60) return PRESETS[i];
  }
  return PRESETS[0];
}

function populateSelect(id, items, valueKey, labelFn) {
  const select = document.getElementById(id);
  let currentGroup = null;
  let optgroup = null;

  for (const item of items) {
    if (item.group !== currentGroup) {
      currentGroup = item.group;
      if (currentGroup) {
        optgroup = document.createElement("optgroup");
        optgroup.label = currentGroup;
        select.appendChild(optgroup);
      } else {
        optgroup = null;
      }
    }
    const parent = optgroup || select;
    const opt = document.createElement("option");
    opt.value = item[valueKey];
    opt.textContent = labelFn(item);
    parent.appendChild(opt);
  }
}

function getSelected(list, idProp, selectId) {
  const value = document.getElementById(selectId).value;
  return list.find((item) => String(item[idProp]) === value);
}

function getBlockedSelections(gpu, res) {
  const blocked = [];
  if (!AuthGuard.isPremium()) {
    if (gpu.premium) blocked.push(`a placa ${gpu.name}`);
    if (res.premium) blocked.push(`a resolução ${res.name}`);
  }
  return blocked;
}

function renderResults(scrollToView = false) {
  const cpu = getSelected(CPUS, "id", "cpuSelect");
  const gpu = getSelected(GPUS, "id", "gpuSelect");
  const ram = getSelected(RAM_OPTIONS, "value", "ramSelect");
  const res = getSelected(RESOLUTIONS, "id", "resSelect");
  const game = getSelected(GAMES, "id", "gameSelect");
  const upscale = parseFloat(document.getElementById("upscaleSelect").value);

  // Conteúdo exclusivo do plano Premium
  if (AuthGuard.isLoggedIn()) {
    const blocked = getBlockedSelections(gpu, res);
    if (blocked.length) {
      const msg =
        `Conteúdo Premium: ${blocked.join(" e ")}. ` +
        "Assine por R$ 19,90/mês para desbloquear.";
      AuthGuard.setGateWarning(msg);
      document.getElementById("results").hidden = true;
      if (scrollToView) AuthGuard.openPay(msg);
      return;
    }
  }

  if (!window.AuthGuard || !AuthGuard.requestAnalysis()) return;

  const results = estimateFps(cpu, gpu, ram, res, game, upscale);
  const native = estimateFps(cpu, gpu, ram, res, game, 1.0);
  const recommended = recommendPreset(results);
  const upOpt = UPSCALING_OPTIONS.find((u) => u.value === upscale);

  document.getElementById("gameSummary").textContent =
    `${game.name} • ${res.name} • ${ram.label} de RAM${upscale > 1 ? ` • Upscaling: ${upOpt.label}` : ""}`;
  document.getElementById("hwSummary").textContent =
    `CPU: ${cpu.name} | GPU: ${gpu.name}`;

  // Cartões por preset
  const grid = document.getElementById("presetGrid");
  grid.innerHTML = "";
  let maxFps = 0;
  for (const p of PRESETS) maxFps = Math.max(maxFps, results[p.id].fps);
  if (maxFps === 0) maxFps = 1;

  for (const preset of PRESETS) {
    const r = results[preset.id];
    const c = classify(r.fps);
    const card = document.createElement("div");
    card.className = "preset-card";
    if (recommended && preset.id === recommended.id) card.classList.add("recommended");

    const nativeFps = native[preset.id].fps;
    let compareHtml = "";
    if (upscale > 1) {
      if (r.fps > nativeFps) {
        const pct = Math.round((r.fps / nativeFps - 1) * 100);
        compareHtml = `<span class="delta">▲ ${nativeFps} → ${r.fps} FPS (+${pct}% vs nativo)</span>`;
      } else {
        compareHtml = `<span class="delta-eq">= nativo (${nativeFps} FPS) — limite do processador</span>`;
      }
    }

    const vramWarnHtml = r.vramLimited
      ? `<span class="vram-warn">⚠ VRAM insuficiente (${gpu.vram}GB — ideal ~${r.vramNeed}GB): perda de desempenho e travamentos</span>`
      : "";

    const bottleneckText =
      r.bottleneck === "gpu" ? "Limite: Placa de vídeo" : "Limite: Processador";

    const barWidth = Math.min(100, (r.fps / maxFps) * 100);
    card.innerHTML = `
      ${recommended && preset.id === recommended.id ? '<span class="badge">Recomendado</span>' : ""}
      <h3>${preset.name}</h3>
      <div class="fps"><span class="num">${r.fps}</span> FPS médio</div>
      <div class="bar"><div class="bar-fill ${c.cls}" style="width:${barWidth}%"></div></div>
      <span class="status ${c.cls}">${c.label}</span>
      <span class="bottleneck">${bottleneckText}</span>
      ${compareHtml}
      ${vramWarnHtml}
    `;
    grid.appendChild(card);
  }

  const verdict = document.getElementById("verdict");
  if (results[recommended.id].fps >= 60) {
    verdict.innerHTML = `✅ Sua máquina roda <strong>${game.name}</strong> de forma fluida no preset <strong>${recommended.name}</strong> em ${res.name}.`;
  } else if (results[recommended.id].fps >= 40) {
    verdict.innerHTML = `⚠️ Sua máquina roda <strong>${game.name}</strong>, mas apenas no preset <strong>${recommended.name}</strong>, com FPS limitado. Considere upscaling ou upgrades.`;
  } else {
    verdict.innerHTML = `❌ Infelizmente sua configuração não atinge boa jogabilidade em <strong>${game.name}</strong> nesta resolução. Reduza a resolução ou considere trocar a GPU.`;
  }

  document.getElementById("results").hidden = false;
  if (scrollToView) {
    document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  AuthGuard.logEvent("Análise", game.name);
}

function renderTips() {
  const grid = document.getElementById("tipsGrid");
  grid.innerHTML = "";

  for (const tip of TIPS) {
    const unlocked = !tip.premium || AuthGuard.isPremium();
    const card = document.createElement("article");
    card.className = "tip-card" + (unlocked ? "" : " locked");

    const h3 = document.createElement("h3");
    h3.textContent = tip.title;
    const p = document.createElement("p");
    p.textContent = tip.text;

    card.append(h3, p);

    if (!unlocked) {
      card.classList.add("locked");
      p.classList.add("blur-text");
      const overlay = document.createElement("div");
      overlay.className = "tip-lock";
      overlay.innerHTML = '<span>🔒 Premium</span>';
      overlay.addEventListener("click", () => AuthGuard.openPay());
      card.appendChild(overlay);
    }

    grid.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateSelect("cpuSelect", CPUS, "id", (c) => c.name);
  populateSelect("gpuSelect", GPUS, "id", (g) => g.name + (g.premium ? " 🔒" : ""));
  populateSelect("ramSelect", RAM_OPTIONS, "value", (r) => r.label);
  populateSelect("resSelect", RESOLUTIONS, "id", (r) => r.name + (r.premium ? " 🔒" : ""));
  populateSelect("gameSelect", GAMES, "id", (g) => `${g.name} — ${g.genre}`);
  populateSelect("upscaleSelect", UPSCALING_OPTIONS, "value", (u) => u.label);

  document.getElementById("analyzeBtn").addEventListener("click", () => renderResults(true));
  document.querySelectorAll("select").forEach((s) =>
    s.addEventListener("change", () => renderResults(false))
  );

  renderTips();
  window.addEventListener("gs-auth-changed", renderTips);

  /* ── Menu mobile ── */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");
  if (hamburgerBtn && navMenu) {
    const closeMenu = () => {
      navMenu.classList.remove("open");
      hamburgerBtn.classList.remove("active");
      document.body.classList.remove("menu-open");
    };
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      hamburgerBtn.classList.toggle("active", isOpen);
      document.body.classList.toggle("menu-open", isOpen);
    });
    navMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }
});

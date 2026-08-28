// ============================================================
// FOXYN — Framework/Componentes compartilhados
// Layout, métricas, scores, toasts, gate de login, persistência
// ============================================================

const FOXYN = {
  // ---------- Persistência ----------
  get(key, fb) {
    try {
      const v = JSON.parse(localStorage.getItem("foxyn_" + key));
      return v === null || v === undefined ? fb : v;
    } catch {
      return fb;
    }
  },
  set(key, value) {
    localStorage.setItem("foxyn_" + key, JSON.stringify(value));
  },

  // ---------- Toast ----------
  toast(msg, type = "info") {
    let wrap = document.querySelector(".fox-toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "fox-toast-wrap";
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = "fox-toast fox-toast--" + type;
    t.innerHTML = '<span class="fox-toast-msg"></span>';
    t.querySelector(".fox-toast-msg").textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transition = "opacity 0.3s";
      setTimeout(() => t.remove(), 300);
    }, 3500);
  },

  // ---------- Skeleton ----------
  skeleton(count) {
    let html = "";
    for (let i = 0; i < count; i++) {
      html += '<div class="fox-skeleton" style="height:140px"></div>';
    }
    return html;
  },

  // ---------- Score ----------
  scoreColor(score) {
    if (score >= 75) return ["fox-score--good", "COMPRE"];
    if (score >= 60) return ["fox-score--warn", "BOA OPORTUNIDADE"];
    if (score >= 40) return ["fox-score--warn", "AGUARDE"];
    return ["fox-score--bad", "PREÇO ALTO"];
  },
  scoreRing(score, verdict) {
    const radius = 38;
    const circ = 2 * Math.PI * radius;
    const off = circ - (Math.min(score, 100) / 100) * circ;
    const [cls, defaultVerd] = FOXYN.scoreColor(score);
    const label = verdict || defaultVerd;
    return `<div class="fox-score ${cls}">
      <div class="fox-score-ring">
        <svg width="84" height="84">
          <circle class="track" cx="42" cy="42" r="${radius}" stroke-width="7" fill="none" />
          <circle class="fill" cx="42" cy="42" r="${radius}" stroke-width="7" fill="none"
            stroke-dasharray="${circ}" stroke-dashoffset="${off}" />
        </svg>
        <span class="num">${Math.round(score)}</span>
      </div>
      <span class="fox-score-verdict">${label}</span>
    </div>`;
  },

  // ---------- Metadados do usuário (demo) ----------
  currentUser() {
    // Lê primeiro a sessão Foxyn e depois a sessão legada (auth.js do site original)
    const s = FOXYN.get("session", null) ||
      (JSON.parse(localStorage.getItem("gs_session") || "null"));
    return s;
  },
  isPremium() {
    const s = FOXYN.currentUser();
    return !!s && (s.role === "admin" || s.plan === "premium" || s.plan === "ultimate" || s.plan === "essential");
  },

  // ---------- Gate de login ----------
  gate() {
    if (FOXYN.currentUser()) return true;
    const reason = document.getElementById("foxLogin");
    if (reason) reason.classList.remove("hidden");
    return false;
  }
};

// ---------- Mosaico de detalhes de hardware (demo) ----------
const FOXYN_HW = {
  cpu: { temp: 62, usage: 45 },
  gpu: { temp: 68, usage: 82, vramUsed: 6.2 },
  ram: { used: 12, total: 32 },
  ssd: { used: 480, total: 1000 }
};

// ---------- Formatação ----------
function fmtReais(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtNum(v) {
  return Math.round(v).toLocaleString("pt-BR");
}

// ---------- Sidebar (renderizada como componente compartilhado) ----------
const FOXYN_NAV = [
  { section: "Principal" },
  { href: "dashboard.html", icon: "◎", label: "Dashboard" },
  { href: "meu-pc.html", icon: "🖥️", label: "Meu PC" },
  { href: "benchmark.html", icon: "📊", label: "Benchmark" },
  { href: "index.html", icon: "🎮", label: "Jogos" },
  { section: "Oportunidades" },
  { href: "radar-precos.html", icon: "📡", label: "Radar de Preços" },
  { href: "upgrades.html", icon: "⬆️", label: "Upgrades" },
  { href: "alertas.html", icon: "🔔", label: "Alertas" },
  { section: "Foxyn" },
  { href: "foxyn-ai.html", icon: "🦊", label: "Foxyn AI" },
  { href: "planos.html", icon: "💎", label: "Meu Plano" }
];

function renderFoxynSidebar(page) {
  let nav = "";
  for (const n of FOXYN_NAV) {
    if (n.section) {
      nav += `<div class="fox-nav-section">${n.section}</div>`;
    } else {
      const active = page && n.href.includes(page) ? " active" : "";
      nav +=
        `<a href="${n.href}" class="fox-nav-item${active}"><span class="fox-nav-icon">${n.icon}</span> ${n.label}</a>`;
    }
  }

  document.body.insertAdjacentHTML("afterbegin", `
    <nav id="foxSidebar" class="fox-sidebar">
      <a href="index.html" class="fox-brand">
        <span class="fox-logo-mark">🦊</span><span>FOX<span class="mark">YN</span></span>
      </a>
      <div class="fox-nav">${nav}</div>
      <div class="fox-sidebar-footer">
        <div class="fox-userbox">
          <span id="foxUserAvatar" class="fox-avatar">?</span>
          <div class="fox-user-info">
            <div id="foxUserName" class="fox-user-name">Visitante</div>
            <div id="foxUserPlan" class="fox-user-plan">—</div>
          </div>
        </div>
      </div>
    </nav>
    <div id="foxOverlay" class="fox-overlay"></div>`);

  // Topbar mobile (se a página tiver marcador)
  const main = document.querySelector(".fox-main");
  if (main) {
    main.insertAdjacentHTML("afterbegin", `
      <div class="fox-topbar">
        <button id="foxSidebarToggle" class="fox-sidebar-toggle" aria-label="Abrir menu">☰</button>
        <span class="fox-mobile-brand">FOX<span class="mark">YN</span></span>
      </div>`);
  }

  // Eventos
  const toggleBtn = document.getElementById("foxSidebarToggle");
  const sidebar = document.getElementById("foxSidebar");
  const overlay = document.getElementById("foxOverlay");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("show", sidebar.classList.contains("open"));
    });
  }
  if (overlay && sidebar) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });
  }
  if (sidebar) {
    sidebar.querySelectorAll(".fox-nav-item").forEach((a) =>
      a.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
      })
    );
  }

  // Usuário
  const user = FOXYN.currentUser();
  const nameEl = document.getElementById("foxUserName");
  const avatarEl = document.getElementById("foxUserAvatar");
  const planEl = document.getElementById("foxUserPlan");
  if (nameEl && user) nameEl.textContent = user.username;
  if (avatarEl && user) avatarEl.textContent = user.username[0].toUpperCase();
  if (planEl && user) {
    planEl.textContent =
      user.role === "admin" ? "Administrador"
      : user.plan === "ultimate" ? "Plano Ultimate"
      : user.plan === "essential" ? "Plano Essential"
      : user.plan === "premium" ? "Plano Premium"
      : "Plano Gratuito";
  }

  // Link de administração visível apenas para admins
  if (user && (user.role === "admin" || (user.username || "").toLowerCase() === "adm1982")) {
    const nav = document.querySelector("#foxSidebar .fox-nav");
    if (nav) {
      const a = document.createElement("a");
      a.href = "admin.html";
      a.className = "fox-nav-item" + (page === "admin" ? " active" : "");
      a.innerHTML = '<span class="fox-nav-icon">🛠️</span> Painel Admin';
      nav.appendChild(a);
    }
  }
}

// ---------- Inicialização comum ----------
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.foxPage || "";
  if (document.querySelector(".fox-main") || document.body.dataset.foxSidebar) {
    renderFoxynSidebar(page);
  }
});

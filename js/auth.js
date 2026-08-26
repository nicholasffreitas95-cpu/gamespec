// Sistema de autenticação, planos, pagamentos e dashboard (demonstração local)
// ⚠️ Os dados ficam apenas no localStorage do navegador. Em produção, use
// um backend real com hash seguro de senhas e gateway de pagamento.

const ADMIN_USER = "Adm1982";
const ADMIN_PASS = "198215057040";
const FREE_DAILY_LIMIT = 5;
const PRICE_MONTHLY = 19.9;

const LS_USERS = "gs_users";
const LS_SESSION = "gs_session";
const LS_LOG = "gs_log";
const LS_USAGE = "gs_usage";

// Hash simples (cyrb53) para não gravar senhas em texto puro no localStorage
function hashPass(str) {
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() { return readJson(LS_USERS, []); }
function saveUsers(users) { writeJson(LS_USERS, users); }

function getSession() { return readJson(LS_SESSION, null); }
function setSession(s) { writeJson(LS_SESSION, s); updateAuthUI(); }

function isAdmin(s = getSession()) { return !!s && s.role === "admin"; }
function isPremium(s = getSession()) {
  return !!s && (s.plan === "premium" || s.role === "admin");
}

function logEvent(type, detail = "") {
  const s = getSession();
  const log = readJson(LS_LOG, []);
  log.unshift({
    ts: Date.now(),
    user: s ? s.username : "visitante",
    type,
    detail
  });
  writeJson(LS_LOG, log.slice(0, 200));
}

// ---------- Cota de análises gratuitas ----------

let gateWarning = null; // aviso de conteúdo bloqueado (substitui a info de cota)

function setGateWarning(msg) {
  gateWarning = msg;
  updateQuotaInfo();
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

function getUsageToday() {
  const u = readJson(LS_USAGE, null);
  return u && u.date === todayKey() ? u.count : 0;
}

function consumeAnalysis() {
  const count = getUsageToday() + 1;
  writeJson(LS_USAGE, { date: todayKey(), count });
}

function updateQuotaInfo() {
  const el = document.getElementById("quotaInfo");
  if (!el) return;
  if (gateWarning) {
    el.textContent = "🔒 " + gateWarning;
    el.classList.add("warning");
    return;
  }
  el.classList.remove("warning");
  if (!getSession()) {
    el.textContent = "Entre ou crie uma conta gratuita para analisar jogos.";
  } else if (isPremium()) {
    el.textContent = "⭐ Premium: análises ilimitadas.";
  } else {
    const left = FREE_DAILY_LIMIT - getUsageToday();
    el.textContent =
      left > 0
        ? `Plano gratuito: ${left} de ${FREE_DAILY_LIMIT} análises restantes hoje.`
        : `Limite diário gratuito atingido. Assine o Premium para análises ilimitadas.`;
  }
}

// ---------- Porta de entrada da análise ----------

function requestAnalysis() {
  setGateWarning(null);
  const s = getSession();
  if (!s) {
    openAuth("Crie uma conta gratuita ou entre para analisar seus jogos.");
    return false;
  }
  if (!isPremium(s)) {
    if (getUsageToday() >= FREE_DAILY_LIMIT) {
      openPay(`Você atingiu ${FREE_DAILY_LIMIT} análises hoje. Assine o Premium por R$ 19,90/mês e analyze sem limites.`);
      return false;
    }
    consumeAnalysis();
  } else {
    consumeAnalysis();
  }
  updateQuotaInfo();
  return true;
}

// ---------- Autenticação ----------

function registerUser(username, email, password) {
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, msg: "Este nome de usuário já existe." };
  }
  const user = {
    username,
    email,
    passHash: hashPass(password),
    plan: "free",
    createdAt: Date.now(),
    lastLogin: null
  };
  users.push(user);
  saveUsers(users);

  logEvent("Cadastro", `Plano gratuito`);
  setSession({ username: user.username, plan: user.plan });
  return { ok: true };
}

function loginUser(username, password) {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    setSession({ username: ADMIN_USER, role: "admin", plan: "premium" });
    logEvent("Login", "Administrador");
    return { ok: true };
  }
  const users = getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!user || user.passHash !== hashPass(password)) {
    return { ok: false, msg: "Usuário ou senha incorretos." };
  }
  user.lastLogin = Date.now();
  saveUsers(users);

  logEvent("Login", `Plano ${user.plan}`);
  setSession({ username: user.username, plan: user.plan });
  return { ok: true };
}

function logoutUser() {
  logEvent("Logout", "");
  localStorage.removeItem(LS_SESSION);
  closeAuth();
  document.getElementById("adminSection").hidden = true;
  updateAuthUI();
}

// ---------- Pagamento simulado ----------

let payReasonMsg = "";

function openPay(reason = "") {
  const s = getSession();
  if (!s || s.role === "admin") {
    openAuth(s && s.role === "admin" ? "" : "Crie uma conta gratuita antes de assinar o Premium.");
    return;
  }
  if (isPremium(s)) return;

  payReasonMsg = reason;
  document.getElementById("pixCode").textContent =
    `gamespec.demo/pix/1990/assinatura/${encodeURIComponent(s.username)}`;
  document.getElementById("payMsg").textContent = "";
  document.getElementById("payModal").hidden = false;
}

function confirmPayment() {
  const method = document.querySelector('input[name="payMethod"]:checked').value;
  const msgEl = document.getElementById("payMsg");

  if (method === "card") {
    const num = document.getElementById("cardNum").value.trim();
    const exp = document.getElementById("cardExp").value.trim();
    const cvv = document.getElementById("cardCvv").value.trim();
    const name = document.getElementById("cardName").value.trim();
    if (num.length < 12 || !exp || !cvv || !name) {
      msgEl.textContent = "Preencha os dados do cartão para continuar.";
      msgEl.className = "form-msg error";
      return;
    }
  }

  const btn = document.getElementById("confirmPayBtn");
  btn.disabled = true;
  btn.textContent = "Processando pagamento...";

  setTimeout(() => {
    const users = getUsers();
    const user = users.find((u) => u.username === getSession().username);
    if (user) {
      user.plan = "premium";
      saveUsers(users);
    }
    const s = getSession();
    setSession({ ...s, plan: "premium" });

    logEvent("Pagamento", `R$ 19,90 — ${method === "pix" ? "Pix" : "Cartão"} (simulado)`);
    renderDashboard();

    btn.disabled = false;
    btn.textContent = "Confirmar pagamento";
    document.getElementById("payModal").hidden = true;

    msgEl.textContent = "";
    alert("✅ Pagamento aprovado! Bem-vindo ao GameSpec Premium.");
  }, 1400);
}

// ---------- Dashboard administrativo ----------

function renderDashboard() {
  if (!isAdmin()) return;

  const users = getUsers();
  const premiumCount = users.filter((u) => u.plan === "premium").length;
  const log = readJson(LS_LOG, []);
  const analysesTotal = log.filter((l) => l.type === "Análise").length;

  document.getElementById("statUsers").textContent = users.length;
  document.getElementById("statPremium").textContent = premiumCount;
  document.getElementById("statRevenue").textContent =
    (premiumCount * PRICE_MONTHLY).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  document.getElementById("statToday").textContent = analysesTotal;

  const usersTbody = document.getElementById("usersTbody");
  usersTbody.innerHTML = "";
  for (const u of [...users].reverse()) {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = u.username;
    const tdMail = document.createElement("td");
    tdMail.textContent = u.email;
    const tdPlan = document.createElement("td");
    tdPlan.innerHTML =
      u.plan === "premium"
        ? '<span class="plan-badge gold">PREMIUM</span>'
        : '<span class="plan-badge free">FREE</span>';
    const tdDate = document.createElement("td");
    tdDate.textContent = new Date(u.createdAt).toLocaleDateString("pt-BR");

    tr.append(tdName, tdMail, tdPlan, tdDate);
    usersTbody.appendChild(tr);
  }
  if (!users.length) {
    usersTbody.innerHTML = '<tr><td colspan="4" class="empty">Nenhum usuário cadastrado ainda.</td></tr>';
  }

  const logTbody = document.getElementById("logTbody");
  logTbody.innerHTML = "";
  for (const l of log.slice(0, 30)) {
    const tr = document.createElement("tr");

    const tdTs = document.createElement("td");
    tdTs.textContent = new Date(l.ts).toLocaleString("pt-BR");
    const tdUser = document.createElement("td");
    tdUser.textContent = l.user;
    const tdType = document.createElement("td");
    tdType.textContent = l.type;
    const tdDetail = document.createElement("td");
    tdDetail.textContent = l.detail;

    tr.append(tdTs, tdUser, tdType, tdDetail);
    logTbody.appendChild(tr);
  }
  if (!log.length) {
    logTbody.innerHTML = '<tr><td colspan="4" class="empty">Sem registros de acesso.</td></tr>';
  }
}

// ---------- UI de autenticação ----------

function updateAuthUI() {
  const s = getSession();
  const loginBtn = document.getElementById("loginOpenBtn");
  const chip = document.getElementById("userChip");
  const badge = document.getElementById("planBadge");
  const dashLink = document.getElementById("navDashboard");
  const adminSection = document.getElementById("adminSection");
  const subBtn = document.getElementById("subscribeBtn");
  const newsLink = document.getElementById("newsFab");
  const newsSection = document.getElementById("newsSection");

  // Sem sessão: o site inteiro fica bloqueado atrás da tela de login
  document.body.classList.toggle("logged-out", !s);
  if (!s) {
    switchTab("loginForm");
    document.getElementById("authModal").hidden = false;
  }

  if (s) {
    loginBtn.hidden = true;
    chip.hidden = false;
    document.getElementById("userNameLabel").textContent = s.username;
    document.getElementById("avatarLetter").textContent = s.username[0].toUpperCase();

    badge.hidden = false;
    badge.className = "plan-badge";
    if (isAdmin(s)) {
      badge.classList.add("admin");
      badge.textContent = "ADMINISTRADOR";
    } else if (s.plan === "premium") {
      badge.classList.add("gold");
      badge.textContent = "PREMIUM";
    } else {
      badge.classList.add("free");
      badge.textContent = "GRATUITO";
    }

    dashLink.hidden = !isAdmin(s);
    adminSection.hidden = !isAdmin(s);
    if (isAdmin(s)) renderDashboard();

    newsLink.hidden = !isPremium(s);
    newsSection.hidden = !isPremium(s);

    subBtn.disabled = isPremium(s);
    subBtn.textContent = isPremium(s) ? "✓ Você já é Premium" : "Assinar Premium";
  } else {
    loginBtn.hidden = false;
    chip.hidden = true;
    badge.hidden = true;
    dashLink.hidden = true;
    adminSection.hidden = true;
    newsLink.hidden = true;
    newsSection.hidden = true;
    subBtn.disabled = false;
    subBtn.textContent = "Assinar Premium";
  }

  updateQuotaInfo();
  window.dispatchEvent(new CustomEvent("gs-auth-changed"));
}

// ---------- Modais ----------

function openAuth(reason = "") {
  document.getElementById("authReason").textContent = reason;
  document.getElementById("authModal").hidden = false;
}

function closeAuth() {
  document.getElementById("authModal").hidden = true;
  document.getElementById("authReason").textContent = "";
  document.getElementById("loginMsg").textContent = "";
  document.getElementById("regMsg").textContent = "";
}

function switchTab(tabId) {
  document.querySelectorAll("#authModal .tab").forEach((t) =>
    t.classList.toggle("active", t.dataset.tab === tabId)
  );
  document.getElementById("loginForm").hidden = tabId !== "loginForm";
  document.getElementById("registerForm").hidden = tabId !== "registerForm";
}

// ---------- Inicialização ----------

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginOpenBtn").addEventListener("click", () => openAuth());
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
  document.getElementById("navDashboard").addEventListener("click", renderDashboard);

  document.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (document.body.classList.contains("logged-out")) return;
      document.getElementById(btn.dataset.close).hidden = true;
    })
  );

  document.querySelectorAll("#authModal .tab").forEach((t) =>
    t.addEventListener("click", () => switchTab(t.dataset.tab))
  );

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const res = loginUser(
      document.getElementById("loginUser").value.trim(),
      document.getElementById("loginPass").value
    );
    if (res.ok) {
      closeAuth();
    } else {
      const msg = document.getElementById("loginMsg");
      msg.textContent = res.msg;
      msg.className = "form-msg error";
    }
  });

  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const res = registerUser(
      document.getElementById("regUser").value.trim(),
      document.getElementById("regEmail").value.trim(),
      document.getElementById("regPass").value
    );
    if (res.ok) {
      closeAuth();
    } else {
      const msg = document.getElementById("regMsg");
      msg.textContent = res.msg;
      msg.className = "form-msg error";
    }
  });

  document.getElementById("subscribeBtn").addEventListener("click", () => {
    const s = getSession();
    if (!s) {
      openAuth("Crie uma conta gratuita antes de assinar o Premium.");
    } else if (!isPremium(s)) {
      openPay();
    }
  });

  document.querySelectorAll('input[name="payMethod"]').forEach((r) =>
    r.addEventListener("change", () => {
      const isPix = document.querySelector('input[name="payMethod"]:checked').value === "pix";
      document.getElementById("pixArea").hidden = !isPix;
      document.getElementById("cardArea").hidden = isPix;
    })
  );

  document.getElementById("confirmPayBtn").addEventListener("click", confirmPayment);

  document.getElementById("clearDataBtn").addEventListener("click", () => {
    if (confirm("Apagar TODOS os usuários, logs e sessões salvos neste navegador?")) {
      [LS_USERS, LS_LOG, LS_USAGE, LS_SESSION].forEach((k) => localStorage.removeItem(k));
      location.reload();
    }
  });

  updateAuthUI();
});

window.AuthGuard = {
  requestAnalysis,
  logEvent,
  isLoggedIn: () => !!getSession(),
  isPremium,
  isAdmin,
  openPay,
  openAuth,
  updateAuthUI,
  setGateWarning
};

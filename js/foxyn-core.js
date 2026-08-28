// ============================================================
// FOXYN CORE — Camada de dados/regras (simulada, proxy-ready)
// ------------------------------------------------------------
// Em um produto com backend, este arquivo seria substituído por
// chamadas reais (fetch) a uma API. Aqui mantemos um contrato
// único (FoxynCore.*) para que:
//   1. As páginas NUNCA acessem limits/dados diretamente.
//   2. A migração para API real seja feita APENAS aqui.
//   3. Nada no frontend confie em regras fora desta camada.
//
// IMPORTANTE: Este é um ambiente 100% estático (GitHub Pages).
// Os dados persistem em localStorage e NÃO representam um banco
// seguro de produção — apenas simulam o contrato do backend.
// ============================================================

const FoxynCore = (() => {
  // ---------- Catálogo de planos ----------
  // Cada plano descreve recursos disponíveis e seus limites.
  // `feature` é a chave usada em FoxynCore.limit() / FoxynCore.verify().
  const PLANS = {
    free: {
      id: "free",
      label: "FREE",
      tagline: "EXPERIMENTE",
      price: 0,
      features: {
        meu_pc: true,
        benchmark: true,
        benchmark_monthly_limit: 3,
        diagnostico: true,
        jogos: true,
        preco_pesquisa_limit: 10,
        price_monitor_limit: 2,
        alertas_basico: true,
        conquistas_basico: true
      }
    },
    essential: {
      id: "essential",
      label: "ESSENTIAL",
      tagline: "OTIMIZE",
      price: 19.9,
      features: {
        meu_pc: true,
        benchmark: true,
        benchmark_monthly_limit: null, // ilimitado (configurável pelo admin)
        diagnostico: true,
        jogos: true,
        presets: true,
        pc_score: true,
        historico: true,
        radar_completo: true,
        buy_score: true,
        monitoramento: true,
        price_monitor_limit: 20,
        alertas: true,
        upgrade_recomendacao: true,
        monte_meu_pc: true
      }
    },
    ultimate: {
      id: "ultimate",
      label: "ULTIMATE",
      tagline: "DECIDA MELHOR",
      price: 39.9,
      features: {
        meu_pc: true,
        benchmark: true,
        diagnostico: true,
        jogos: true,
        presets: true,
        pc_score: true,
        historico: true,
        radar_completo: true,
        buy_score: true,
        buy_score_avancado: true,
        monitoramento: true,
        price_monitor_limit: 100,
        alertas: true,
        alertas_inteligentes: true,
        upgrade_recomendacao: true,
        monte_meu_pc: true,
        foxyn_ai: true,
        comprar_x_esperar: true,
        analise_noticias: true,
        tendencias: true,
        plano_evolucao_avancado: true,
        relatorios: true,
        gamificacao_avancada: true
      }
    }
  };

  // Limites que o admin pode ajustar via painel (configurável).
  // Valores por plano; `null` = sem limite.
  const ADMIN_LIMITS = {
    benchmark_monthly_limit: { free: 3, essential: null, ultimate: null },
    price_monitor_limit: { free: 2, essential: 20, ultimate: 100 },
    preco_pesquisa_limit: { free: 10, essential: null, ultimate: null }
  };

  // ---------- Chaves de armazenamento (todos foxyn_*) ----------
  const K = {
    limits: "foxyn_cfg_limits",
    meta: "foxyn_meta", // { username: { pcProfile, subscription, monitored, alerts, benchmarks, economy, achievements } }
    analytics: "foxyn_analytics"
  };

  // ---------- Utilitários ----------
  const read = (key, fb) => {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v === null || v === undefined ? fb : v;
    } catch { return fb; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const currentUser = () => FOXYN.currentUser();

  // ---------- Limites centralizados ----------
  function limitsCfg() {
    return read(K.limits, {});
  }
  // Retorna o limite configurado para uma feature e um plano.
  // Fonte de verdade: ADMIN_LIMITS (padrão) sobrescrito por cfg do admin.
  function limit(feature, planId) {
    const cfg = limitsCfg();
    const overridden = cfg[feature] && cfg[feature][planId] !== undefined
      ? cfg[feature][planId]
      : null;
    if (overridden !== null) return overridden;
    const def = ADMIN_LIMITS[feature] && ADMIN_LIMITS[feature][planId];
    return def !== undefined ? def : null;
  }

  // ---------- Perfil do usuário (meta) ----------
  function metaOf(username) {
    const all = read(K.meta, {});
    return all[username] || null;
  }
  function saveMeta(username, meta) {
    const all = read(K.meta, {});
    all[username] = meta;
    write(K.meta, all);
  }

  // Inicializa o meta padrão de um usuário
  function ensureMeta(username) {
    let m = metaOf(username);
    if (!m) {
      m = {
        pcProfile: null,
        subscription: null,
        monitored: [],     // [{productId, targetPrice}]
        alerts: [],         // [{id, type, title, body, read, ts}]
        benchmarks: [],     // [{game, ts, results}]
        economy: [],        // [{productId, initialPrice, boughtPrice, ts}]
        achievements: [],   // [{id, ts}]
        usage: {}           // { feature: count } p/ contadores
      };
      saveMeta(username, m);
    }
    return m;
  }

  // ---------- Plano atual (consolida legado + novo) ----------
  // Mapeia planos legados -> novos:
  //   premium -> essential, admin -> ultimate (acesso total)
  function planIdOf(user) {
    if (!user) return "free";
    if (user.role === "admin") return "ultimate";
    if (user.plan === "premium") return "essential";
    if (user.plan === "free") return "free";
    if (PLANS[user.plan]) return user.plan;
    return "free";
  }
  function planOf(user) {
    return PLANS[planIdOf(user)];
  }
  function hasFeature(user, feature) {
    const p = planOf(user);
    return !!(p && p.features[feature] === true);
  }

  // ---------- Contadores de uso por feature ----------
  function usageCount(user, feature) {
    const u = currentUser();
    if (!u) return 0;
    const m = ensureMeta(u.username);
    return m.usage[feature] || 0;
  }
  function consume(user, feature, n = 1) {
    const u = currentUser();
    if (!u) return;
    const all = read(K.meta, {});
    const meta = all[u.username] || {};
    meta.usage = meta.usage || {};
    meta.usage[feature] = (meta.usage[feature] || 0) + n;
    all[u.username] = meta;
    write(K.meta, all);
  }

  // ---------- Verificação de permissão/limite (contrato backend) ----------
  // Retorna: { ok, used, limit, plan }
  // Lógica orientada à API: em produção, o servidor decide ok/used/limit.
  function verify(feature) {
    const user = currentUser();
    const planId = planIdOf(user);
    const plan = PLANS[planId];

    // Se a feature é um resource com limite numérico
    const lim = limit(feature === "benchmark" ? "benchmark_monthly_limit" : feature, planId);
    const isResource = lim !== null && ["benchmark_monthly_limit", "price_monitor_limit", "preco_pesquisa_limit"].includes(
      feature === "benchmark" ? "benchmark_monthly_limit" : feature
    );

    // Gate de login
    if (!user) {
      return { ok: false, reason: "auth", used: 0, limit: lim, plan: planId };
    }

    // Resource com limite
    if (isResource) {
      const used = feature === "price_monitor_limit"
        ? (user ? ensureMeta(user.username).monitored.length : 0)
        : usageCount(user, feature);
      const allowed = lim === null;
      if (!allowed && used >= lim) {
        return { ok: false, reason: "limit", used, limit: lim, plan: planId, upgradeTo: planId === "free" ? "essential" : "ultimate" };
      }
      return { ok: true, used, limit: lim, plan: planId };
    }

    // Membro flag de plano
    if (plan && feature in plan.features) {
      return { ok: plan.features[feature] === true, plan: planId };
    }

    // Feature não mapeada: acesso concedido (liberal) mas registrado para auditoria
    return { ok: true, plan: planId };
  }

  // ---------- Assinatura ----------
  // Representa a "cobrança" simulada. Prepara a estrutura para um gateway.
  function ensureSubscription(user) {
    const m = ensureMeta(user.username);
    const curPlan = planIdOf(user);
    if (!m.subscription) {
      m.subscription = {
        plan: curPlan,
        status: "active",          // active | canceled | past_due
        price: planOf(user).price,
        period: "monthly",
        nextCharge: nextChargeDate(),
        paymentMethod: null,       // "pix" | "card"
        gateway: "simulado",       // placeholder p/ gateway real
        history: []
      };
    } else if (m.subscription.status !== "canceled" && m.subscription.plan !== curPlan) {
      // Mantém consistente com a sessão (ex.: plano alterado na página legada)
      m.subscription.plan = curPlan;
      m.subscription.price = planOf(user).price;
      m.subscription.history = m.subscription.history || [];
      m.subscription.history.push({ action: "sync->" + curPlan, ts: Date.now(), price: planOf(user).price });
    }
    saveMeta(user.username, m);
    return m.subscription;
  }

  function nextChargeDate() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  }

  // ---------- Mudança de plano (upgrade/downgrade) ----------
  // Regras respeitam o período pago (simulado). Retorna objeto de resultado.
  function changePlan(user, targetPlan, opts = {}) {
    const from = planIdOf(user);
    if (from === "admin") {
      return { ok: false, msg: "Conta de administrador não pode ser alterada." };
    }
    if (opts.mode === "checkout" && opts.method) {
      // Simulação de checkout com gateway
      if (!["pix", "card"].includes(opts.method)) {
        return { ok: false, msg: "Forma de pagamento inválida." };
      }
    }

    const m = ensureMeta(user.username);
    m.subscription = {
      plan: targetPlan,
      status: "active",
      price: PLANS[targetPlan].price,
      period: "monthly",
      nextCharge: nextChargeDate(),
      paymentMethod: opts.method || m.subscription?.paymentMethod || "card",
      gateway: "simulado",
      history: [
        ...(m.subscription?.history || []),
        { action: from + "->" + targetPlan, ts: Date.now(), price: PLANS[targetPlan].price }
      ]
    };
    saveMeta(user.username, m);

    return { ok: true, plan: targetPlan, from };
  }

  function cancelSubscription(user) {
    const m = ensureMeta(user.username);
    if (m.subscription) m.subscription.status = "canceled";
    saveMeta(user.username, m);
    return { ok: true };
  }

  // ---------- Config de limites (admin) ----------
  // Persiste ajustes do admin sobre os limites padrão (ADMIN_LIMITS).
  function setLimit(feature, planId, value) {
    const cfg = limitsCfg();
    if (!ADMIN_LIMITS[feature]) return { ok: false, msg: "Limite desconhecido: " + feature };
    cfg[feature] = cfg[feature] || {};
    // value "" = voltar ao padrão; número = fixar; null/0 = ilimitado
    if (value === "" ) { delete cfg[feature][planId]; }
    else if (value === null || value === "ilimitado" || value === 0) { cfg[feature][planId] = null; }
    else { cfg[feature][planId] = parseInt(value, 10); }
    write(K.limits, cfg);
    return { ok: true };
  }

  // ---------- Métricas agregadas (admin) ----------
  function metrics() {
    const all = read(K.meta, {});
    const ids = new Set(Object.keys(all));
    let free = 0, essential = 0, ultimate = 0, canceled = 0, monitoredTotal = 0, alertTotal = 0, economyTotal = 0;
    ids.forEach((username) => {
      const mm = all[username];
      const plan = mm.subscription ? mm.subscription.plan : "free";
      if (mm.subscription && mm.subscription.status === "canceled") canceled++;
      if (plan === "essential") essential++; else if (plan === "ultimate") ultimate++; else free++;
      monitoredTotal += (mm.monitored || []).length;
      alertTotal += (mm.alerts || []).length;
      const e = (mm.economy || []).reduce((a, x) => a + (Number(x.saved) || 0), 0);
      economyTotal += e;
    });
    const total = ids.size;
    return {
      total, free, essential, ultimate, canceled, monitoredTotal, alertTotal,
      economyTotal,
      conversion: total ? Math.round(((essential + ultimate) / total) * 100) : 0
    };
  }

  // ---------- Monitoramento ----------
  function monitored(user) {
    return m(user).monitored;
  }
  function m(user) {
    return ensureMeta(user.username);
  }

  function addMonitor(user, productId, targetPrice) {
    const verif = verify("price_monitor_limit");
    if (!verif.ok) return { ok: false, ...verif };
    const mm = m(user);
    if (mm.monitored.some((x) => x.productId === productId)) {
      return { ok: false, msg: "Este produto já é monitorado." };
    }
    mm.monitored.push({ productId, targetPrice, ts: Date.now() });
    saveMeta(user.username, mm);
    // Registro de analytics
    track(user, "produto_monitorado", { productId });
    return { ok: true };
  }

  function removeMonitor(user, productId) {
    const mm = m(user);
    mm.monitored = mm.monitored.filter((x) => x.productId !== productId);
    saveMeta(user.username, mm);
    return { ok: true };
  }

  // ---------- Alertas ----------
  function pushAlert(user, type, title, body) {
    const mm = m(user);
    mm.alerts.unshift({ id: Date.now(), type, title, body, read: false, ts: Date.now() });
    saveMeta(user.username, mm);
  }
  function markAlertsRead(user) {
    const mm = m(user);
    mm.alerts.forEach((a) => (a.read = true));
    saveMeta(user.username, mm);
  }

  // ---------- Benchmark ----------
  function saveBenchmark(user, game, results) {
    const verif = verify("benchmark");
    if (!verif.ok) return { ok: false, ...verif };
    if (verif.limit !== null) consume(user, "benchmark");
    const mm = m(user);
    mm.benchmarks.push({ game, results, ts: Date.now() });
    saveMeta(user.username, mm);
    track(user, "benchmark_executado", { game });
    return { ok: true, verif };
  }

  // ---------- Economia ----------
  function recordEconomy(user, entry) {
    const mm = m(user);
    mm.economy.unshift(entry);
    saveMeta(user.username, mm);
    track(user, "economia_registrada", entry);
  }

  // ---------- Analytics (eventos) ----------
  // Preparado para envio a um serviço de analytics. Nenhum dado sensível.
  function track(user, event, payload = {}) {
    const all = read(K.analytics, []);
    all.push({ user: user?.username || "anon", event, ts: Date.now(), ...payload });
    // Mantém limite de tamanho no storage estático
    write(K.analytics, all.slice(-500));
    // Hook opcional para envio futuro
    try { if (window.FoxynAnalyticsHook) window.FoxynAnalyticsHook(event, payload); } catch {}
  }

  // ---------- API pública (contrato) ----------
  const api = {
    PLANS,
    ADMIN_LIMITS,
    planIdOf,
    planOf,
    hasFeature,
    limit,
    limitsCfg,
    verify,
    usageCount,
    consume,
    ensureSubscription,
    changePlan,
    cancelSubscription,
    setLimit,
    metrics,
    addMonitor,
    removeMonitor,
    monitored,
    pushAlert,
    markAlertsRead,
    saveBenchmark,
    recordEconomy,
    track,
    meta: m,
    saveMeta,
    nextChargeDate
  };

  // ---------- Inicialização ----------
  // Sincroniza sessão legada (auth.js) com o meta Foxyn na carga.
  document.addEventListener("DOMContentLoaded", () => {
    const u = FOXYN.currentUser();
    if (u) {
      ensureMeta(u.username);
      ensureSubscription(u);
    }
  });

  return api;
})();

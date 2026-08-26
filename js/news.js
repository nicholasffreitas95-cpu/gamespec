// Área de notícias (exclusiva para assinantes Premium)
// Lê news.json gerado automaticamente pelo robô do GitHub Actions

async function fetchNews() {
  try {
    const res = await fetch("news.json?t=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch {
    return null;
  }
}

function renderNews(data) {
  const grid = document.getElementById("newsGrid");
  const status = document.getElementById("newsStatus");
  grid.innerHTML = "";

  if (typeof AuthGuard !== "undefined" && !AuthGuard.isPremium()) {
    grid.innerHTML = "";
    status.textContent = "";
    return;
  }

  if (!data || !data.items || !data.items.length) {
    status.textContent =
      "Ainda não há notícias sincronizadas. O robô atualiza a lista automaticamente todos os dias às 08h (horário de Brasília) — você também pode rodar manualmente na aba Actions do repositório.";
    return;
  }

  status.textContent =
    `Fontes: Adrenaline, TecMundo, Canaltech, Tom's Hardware e VideoCardz • ` +
    `Atualizado em ${new Date(data.updated).toLocaleString("pt-BR")}`;

  for (const item of data.items) {
    const card = document.createElement("article");
    card.className = "news-card";

    const meta = document.createElement("div");
    meta.className = "news-meta";

    const tag = document.createElement("span");
    tag.className = "news-tag";
    tag.textContent = item.tag;

    const source = document.createElement("span");
    source.textContent = item.source;

    meta.append(tag, source);

    const link = document.createElement("a");
    link.href = item.link;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = item.title;

    const date = document.createElement("span");
    date.className = "news-date";
    date.textContent = new Date(item.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short"
    });

    card.append(meta, link, date);
    grid.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchNews();
  renderNews(data);
  window.addEventListener("gs-auth-changed", () => renderNews(data));
});

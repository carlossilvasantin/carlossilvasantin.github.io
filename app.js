const timeline = document.getElementById("timeline");
const count = document.getElementById("entry-count");
const template = document.getElementById("day-template");
const newsTimeline = document.getElementById("news-timeline");
const newsCount = document.getElementById("news-count");
const newsTemplate = document.getElementById("news-template");

const emptyIllustration = String.raw`
      .-''''-.
     /  .--.  \
    /  /    \  \
    |  |    |  |
    |  |.-""-. |
   ///'.::::.'\\\
  ||| ::/  \:: ;|
  ||; ::\__/:: ;|
   \\\ '::::' ///
    '=.\__/.='
        /\
       /__\    hoy nada de nada
`;

if (window.DIARY_SOURCE) {
  renderDiary(window.DIARY_SOURCE);
} else {
  timeline.innerHTML = `
    <section class="empty-state">
      <pre>${emptyIllustration}</pre>
      <p>No se ha podido cargar el diario todavia.</p>
    </section>
  `;
}

renderTelegramNews(window.TELEGRAM_NEWS);

function renderDiary(markdown) {
  const days = parseDiary(markdown);
  count.textContent = `${days.reduce((total, day) => total + day.entries.length, 0)} entradas`;

  if (days.length === 0) {
    timeline.innerHTML = `
      <section class="empty-state">
        <pre>${emptyIllustration}</pre>
        <p>El diario aun no tiene jornadas registradas.</p>
      </section>
    `;
    return;
  }

  timeline.innerHTML = "";

  days.forEach((day) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".day-title").textContent = formatDate(day.date);
    node.querySelector(".day-chip").textContent = `${day.entries.length} apunte${day.entries.length === 1 ? "" : "s"}`;

    const list = node.querySelector(".entry-list");

    if (day.entries.length === 0) {
      const item = document.createElement("li");
      item.innerHTML = `<pre>${emptyIllustration}</pre>`;
      list.appendChild(item);
    } else {
      day.entries.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = entry;
        list.appendChild(item);
      });
    }

    timeline.appendChild(node);
  });
}

function renderTelegramNews(feed) {
  const items = feed?.items ?? [];

  newsCount.textContent = `${items.length} referencia${items.length === 1 ? "" : "s"}`;

  if (!items.length) {
    newsTimeline.innerHTML = `
      <section class="empty-state">
        <p>Todavia no hay noticias referenciadas desde AdmiraNext.</p>
      </section>
    `;
    return;
  }

  newsTimeline.innerHTML = "";

  items.forEach((item, index) => {
    const node = newsTemplate.content.cloneNode(true);
    node.querySelector(".day-title").textContent = item.title;
    node.querySelector(".day-chip").textContent = `#${index + 1}`;

    const list = node.querySelector(".entry-list");
    const published = document.createElement("li");
    published.textContent = `Publicado: ${formatTimestamp(item.published_at)}`;
    list.appendChild(published);

    const body = document.createElement("li");
    body.textContent = item.body;
    list.appendChild(body);

    const link = document.createElement("li");
    link.innerHTML = `<a class="hero-link" href="${item.url}" target="_blank" rel="noreferrer">Abrir referencia en Telegram</a>`;
    list.appendChild(link);

    newsTimeline.appendChild(node);
  });
}

function parseDiary(markdown) {
  const lines = markdown.split(/\r?\n/);
  const days = [];
  let currentDay = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();

      if (/^\d{4}-\d{2}-\d{2}$/.test(heading)) {
        currentDay = { date: heading, entries: [] };
        days.push(currentDay);
      } else {
        currentDay = null;
      }

      continue;
    }

    if (!currentDay || !line || line.startsWith("#")) {
      continue;
    }

    currentDay.entries.push(line);
  }

  return days.reverse();
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatTimestamp(value) {
  if (!value) {
    return "sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

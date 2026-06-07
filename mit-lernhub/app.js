/* MIT Lernhub — App-Logik (Vanilla JS, keine Dependencies) */
(function () {
  "use strict";

  const DATA = window.CURRICULUM;
  const FIELDS = DATA.fields;
  const STORE_KEY = "mit-lernhub-progress-v1";
  const RING_CIRC = 2 * Math.PI * 27; // 169.646

  const CAT_COLOR = {
    "Mathematik-Grundlagen": "#7aa2f7",
    "Programmierung & CS": "#9ece6a",
    "Künstliche Intelligenz": "#bb9af7",
    "Machine Learning": "#ff9e64",
    "Deep Learning": "#f7768e",
    "NLP & LLMs": "#ff75a0",
    "Agentic AI": "#e0af68",
    "Prompt Engineering": "#cfa98a",
  };
  const STATUS_LABEL = { todo: "Offen", "in-progress": "Läuft", done: "Erledigt" };

  // ---- State ----
  let progress = load();
  let filterCat = "Alle";
  let filterLvl = "Alle";
  let query = "";

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); }
  function statusOf(id) { return progress[id] || "todo"; }
  function setStatus(id, s) {
    if (s === "todo") delete progress[id]; else progress[id] = s;
    save(); renderStats(); syncCard(id); syncPlanItem(id);
  }

  // ---- Helpers ----
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---- Stats / progress ring ----
  function renderStats() {
    const total = FIELDS.length;
    const done = FIELDS.filter((f) => statusOf(f.id) === "done");
    const totalH = FIELDS.reduce((a, f) => a + f.aufwand, 0);
    const doneH = done.reduce((a, f) => a + f.aufwand, 0);
    const pct = totalH ? Math.round((doneH / totalH) * 100) : 0;
    $("#statDone").textContent = done.length + "/" + total;
    $("#statHours").textContent = doneH + " h";
    $("#statTotal").textContent = totalH;
    $("#ringPct").textContent = pct + "%";
    $("#ringFill").style.strokeDashoffset = RING_CIRC * (1 - pct / 100);
  }

  // ---- Filters ----
  function buildChips() {
    const cats = ["Alle", ...new Set(FIELDS.map((f) => f.kategorie))];
    const lvls = ["Alle", "Grundlagen", "Mittel", "Fortgeschritten"];
    const catBox = $("#catChips"), lvlBox = $("#lvlChips");
    cats.forEach((c) => {
      const b = el("button", "chip" + (c === filterCat ? " active" : ""), esc(c));
      b.onclick = () => { filterCat = c; refreshChips(); renderGrid(); };
      catBox.appendChild(b);
    });
    lvls.forEach((l) => {
      const b = el("button", "chip" + (l === filterLvl ? " active" : ""), esc(l));
      b.onclick = () => { filterLvl = l; refreshChips(); renderGrid(); };
      lvlBox.appendChild(b);
    });
  }
  function refreshChips() {
    $("#catChips").querySelectorAll(".chip").forEach((b) => b.classList.toggle("active", b.textContent === filterCat));
    $("#lvlChips").querySelectorAll(".chip").forEach((b) => b.classList.toggle("active", b.textContent === filterLvl));
  }

  function matches(f) {
    if (filterCat !== "Alle" && f.kategorie !== filterCat) return false;
    if (filterLvl !== "Alle" && f.level !== filterLvl) return false;
    if (query) {
      const hay = (f.lernfeld + " " + f.kurs + " " + f.lernst + " " + f.summary + " " + f.bullets.join(" ")).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  }

  // ---- Card rendering ----
  function cardHTML(f) {
    const st = statusOf(f.id);
    const seg = ["todo", "in-progress", "done"].map((s) =>
      `<button data-s="${s}" class="${st === s ? "on" : ""}" title="${STATUS_LABEL[s]}">${STATUS_LABEL[s]}</button>`
    ).join("");
    return `
      <div class="card ${st === "done" ? "done" : ""}" data-id="${f.id}" style="--accent:${CAT_COLOR[f.kategorie] || "#7aa2f7"}">
        <div class="card-top">
          <div class="card-ico">${f.icon}</div>
          <div style="flex:1">
            <h3>${esc(f.lernfeld)}</h3>
            <p class="card-kurs">${esc(f.kurs)}</p>
          </div>
          <span class="badge lvl-${f.level}">${f.level}</span>
        </div>
        <p class="summary">${esc(f.summary)}</p>
        <ul class="bullets">${f.bullets.map((b) => "<li>" + esc(b) + "</li>").join("")}</ul>
        <p class="why">💡 ${esc(f.why)}</p>
        <div class="meta">
          <span class="tag">${esc(f.kategorie)}</span>
          <span class="tag">${f.modul} · ${esc(DATA.module[f.modul])}</span>
          <span class="tag">📅 Woche ${f.woche}</span>
          <span class="tag">⏱ ${f.aufwand} h</span>
        </div>
        <div class="card-foot">
          <div class="seg" data-id="${f.id}">${seg}</div>
          <a class="src" href="${f.quelle}" target="_blank" rel="noopener">Quelle öffnen ↗</a>
        </div>
      </div>`;
  }

  function renderGrid() {
    const grid = $("#grid");
    const list = FIELDS.filter(matches).sort((a, b) => a.woche - b.woche);
    if (!list.length) { grid.innerHTML = '<div class="empty">Keine Lernfelder für diese Filter. 🤔</div>'; return; }
    grid.innerHTML = list.map(cardHTML).join("");
    grid.querySelectorAll(".seg").forEach((seg) => {
      seg.querySelectorAll("button").forEach((btn) => {
        btn.onclick = () => setStatus(seg.dataset.id, btn.dataset.s);
      });
    });
  }
  function syncCard(id) {
    const card = $('#grid .card[data-id="' + id + '"]');
    if (!card) return;
    const st = statusOf(id);
    card.classList.toggle("done", st === "done");
    card.querySelectorAll(".seg button").forEach((b) => b.classList.toggle("on", b.dataset.s === st));
  }

  // ---- Plan view ----
  const PHASES = [
    { name: "Phase 1 · Fundament", weeks: [1, 2, 3, 4] },
    { name: "Phase 2 · KI & Machine Learning", weeks: [5, 6] },
    { name: "Phase 3 · Deep Learning & Sprache", weeks: [7, 8] },
    { name: "Phase 4 · Agentic AI & Capstone", weeks: [9, 10, 11, 12] },
  ];
  function renderPlan() {
    const box = $("#plan");
    box.innerHTML = "";
    PHASES.forEach((ph) => {
      box.appendChild(el("div", "phase-head", esc(ph.name)));
      ph.weeks.forEach((w) => {
        const items = FIELDS.filter((f) => f.woche === w);
        const hours = items.reduce((a, f) => a + f.aufwand, 0);
        const wEl = el("div", "week");
        wEl.innerHTML = `
          <div class="week-no"><div class="n">${w}</div><div class="h">${hours} h</div></div>
          <div class="week-items">${items.map((f) => {
            const checked = statusOf(f.id) === "done";
            return `<div class="week-item ${checked ? "checked" : ""}" data-id="${f.id}">
              <input type="checkbox" ${checked ? "checked" : ""} />
              <span class="ico">${f.icon}</span>
              <label><a href="${f.quelle}" target="_blank" rel="noopener">${esc(f.lernfeld)}</a></label>
              <span class="mod">${f.modul}</span>
            </div>`;
          }).join("")}</div>`;
        box.appendChild(wEl);
      });
    });
    box.querySelectorAll(".week-item input").forEach((cb) => {
      cb.onchange = () => {
        const id = cb.closest(".week-item").dataset.id;
        setStatus(id, cb.checked ? "done" : "todo");
      };
    });
  }
  function syncPlanItem(id) {
    const it = $('#plan .week-item[data-id="' + id + '"]');
    if (!it) return;
    const done = statusOf(id) === "done";
    it.classList.toggle("checked", done);
    it.querySelector("input").checked = done;
  }

  // ---- Tabs ----
  function showView(v) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    $("#view-fields").classList.toggle("hidden", v !== "fields");
    $("#view-plan").classList.toggle("hidden", v !== "plan");
    $("#view-about").classList.toggle("hidden", v !== "about");
    if (v === "plan") renderPlan();
  }

  // ---- Init ----
  function init() {
    buildChips();
    renderGrid();
    renderStats();
    $("#search").addEventListener("input", (e) => { query = e.target.value.trim().toLowerCase(); renderGrid(); });
    document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => showView(t.dataset.view)));
    $("#notionLink").href = DATA.meta.notionDb;
    $("#planLink").href = DATA.meta.notionPlan;
    $("#resetBtn").onclick = () => {
      if (confirm("Wirklich den gesamten Fortschritt löschen?")) {
        progress = {}; save(); renderStats(); renderGrid(); renderPlan();
      }
    };
  }
  document.addEventListener("DOMContentLoaded", init);
})();

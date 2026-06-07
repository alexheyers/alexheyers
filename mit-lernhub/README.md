# 🎓 MIT Lernhub — KI & Agentic Coding

Eine interaktive Lern-Oberfläche für **kostenloses MIT-Wissen** rund um Künstliche Intelligenz,
Machine Learning, Deep Learning, NLP/LLMs und **Agentic Coding** — strukturiert in **19 Lernfeldern**
und auf die 5 Module des Vibe Coding Bootcamps gemappt.

> Das MIT stellt über [MIT OpenCourseWare](https://ocw.mit.edu/) praktisch sein gesamtes Lehrmaterial
> kostenlos online. Dieser Hub bündelt die für Vibe Coding relevantesten Kurse an einem Ort.

## ✨ Features

- **📚 Lernfelder** — alle 19 Themen als Karten mit MIT-Kurs, Level, Aufwand, „Was du lernst“ und direktem Quellen-Link
- **🗺️ 12-Wochen-Plan** — ein realistischer Teilzeit-Lernpfad (~8–12 h/Woche) vom Fundament bis zum Capstone
- **✅ Fortschritts-Tracking** — Status pro Lernfeld (Offen / Läuft / Erledigt), gespeichert lokal im Browser (`localStorage`)
- **🔍 Filter & Suche** — nach Kategorie, Level und Stichwort
- **🎯 Fortschritts-Ring** — Live-Prozent nach absolvierten Lernstunden
- **🎤 Präsentation** — ein begleitender Slide-Deck (`praesentation.html`), keyboard-navigierbar, aus denselben Daten generiert
- **0 Dependencies** — reines HTML/CSS/JS, funktioniert offline

## 🚀 Starten

**Lokal:** einfach `index.html` im Browser öffnen — fertig.

Oder mit einem kleinen lokalen Server (empfohlen):

```bash
cd mit-lernhub
python3 -m http.server 8000
# → http://localhost:8000
```

**Online (GitHub Pages):** Pages im Repo aktivieren (Settings → Pages → Source: *GitHub Actions*).
Die mitgelieferte Workflow-Datei `.github/workflows/pages.yml` deployt automatisch.
Der Lernhub ist dann erreichbar unter:

```
https://alexheyers.github.io/alexheyers/mit-lernhub/
```

## 🗂 Dateien

| Datei | Zweck |
|-------|-------|
| `index.html` | App-Shell & Layout |
| `praesentation.html` | Begleitende Slide-Präsentation über alle Themen |
| `styles.css` | Tokyonight-Theme, komplett self-contained |
| `app.js` | Logik: Rendering, Filter, Fortschritt, Plan |
| `curriculum.js` | **Single Source of Truth** — alle Lernfelder als Daten |
| `curriculum.json` | Portabler Export (z. B. für Supabase / API) |

## 🔄 Verbindung zu Notion

Dieselben 19 Lernfelder liegen als **Notion-Datenbank** im *Vibe Coding Bootcamp* Workspace
(„🎓 MIT Wissens-Datenbank — KI & Agentic Coding“) inklusive Board-, Wochen- und Status-Ansichten,
plus eine 12-Wochen-Lernplan-Seite. Der Lernhub und Notion teilen dieselbe Struktur — du kannst
parallel in beiden arbeiten.

## 🧩 Optional: Supabase als Backend

`curriculum.json` lässt sich direkt in eine Supabase-Tabelle importieren, falls du den Fortschritt
geräteübergreifend synchronisieren willst (statt `localStorage`). Beispiel-Schema:

```sql
create table lernfelder (
  id text primary key,
  lernfeld text, kategorie text, kurs text, quelle text,
  level text, modul text, aufwand int, woche int,
  summary text
);
create table fortschritt (
  user_id uuid, field_id text references lernfelder(id),
  status text default 'todo', updated_at timestamptz default now(),
  primary key (user_id, field_id)
);
```

## 📚 Quellen (alle kostenlos)

- MIT OpenCourseWare — [ocw.mit.edu](https://ocw.mit.edu/)
- MIT 6.S191 Introduction to Deep Learning — [introtodeeplearning.com](https://introtodeeplearning.com/)
- MIT 6.5940 TinyML & Efficient Deep Learning — [hanlab.mit.edu](https://hanlab.mit.edu/courses/2024-fall-65940)
- MIT Open Learning Library (6.036 ML) — [openlearninglibrary.mit.edu](https://openlearninglibrary.mit.edu/)
- The Missing Semester of Your CS Education — [missing.csail.mit.edu](https://missing.csail.mit.edu/)

---

*Teil des Vibe Coding Bootcamps · Built with ☕, 🎵 and a lot of Claude.*

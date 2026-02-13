# CLAUDE.md — World Cup 2026 Fan Companion

## 1. Boundary Rule (Critical)

You MUST only read, write, and execute commands within:

```
/Users/stevehorrigan/Documents/Projects/wc2026/
```

Do NOT touch files or run commands outside this directory under any circumstances. If a task would require operating outside this folder, stop and ask the user.

---

## 2. Project Overview

A "Follow My Team" World Cup 2026 companion website. The user picks their country and gets a personalised view of fixtures, kick-off times in their timezone, squad info, knockout paths, and travel info between venues.

**Primary reference:** `PROJECT-BRIEF.md` is the source of truth for features, data structures, and build order.

---

## 3. Tech Stack

- **React** with **Vite**
- **Tailwind CSS**
- **Leaflet.js** (OpenStreetMap tiles) for the interactive map
- **JSON data files** — no database, no backend
- Deployed to **Vercel** via GitHub

---

## 4. Project Structure

```
wc2026/
├── public/flags/
├── src/
│   ├── components/       # React components
│   ├── data/             # JSON: teams, groups, venues, fixtures, squads
│   ├── utils/            # Helpers: timezone, fixtures, knockout, calendar
│   ├── index.css         # Tailwind imports
│   └── main.jsx          # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 5. Data Accuracy

Fixture, team, venue, and schedule data must be accurate. Always cross-reference against official sources when creating or modifying data files. There are 48 teams, 16 venues (11 USA, 3 Mexico, 2 Canada), and 104 matches.

6 teams are TBD pending playoffs (March 2026). Use placeholder entries as described in `PROJECT-BRIEF.md`.

---

## 6. Git Behaviour

- Confirm branch with `git status -sb` before starting work.
- Show `git diff` before committing.
- Use conventional commit messages: `feat(component): description`, `fix(data): description`, etc.
- Do NOT rebase, merge, amend, or create tags unless explicitly asked.
- Do NOT push unless explicitly asked.

---

## 7. Design Rules

- Mobile-first, clean, fast.
- Dark mode default (background: `#0f172a`), light mode toggle.
- Primary accent: teal (`#14b8a6`).
- Venue pin colours: USA = blue, Mexico = green, Canada = red.
- No FIFA trademarks in branding. Use "World Cup 2026" or similar.
- No official logos or copyrighted imagery. Use flagcdn.com for flags.
- Footer must include: "This is an unofficial fan site. Not affiliated with or endorsed by FIFA."

---

## 8. What NOT to Build

- No user accounts, database, or backend.
- No live websockets, prediction games, betting, video, or social embeds.
- Keep it simple. Only build what is described in `PROJECT-BRIEF.md` or explicitly requested.

---

## 9. Build Order

Follow the phased approach in `PROJECT-BRIEF.md`:

1. **Phase 1 (MVP):** Team Selector, Fixture List, Interactive Map, Group Table, Timezone Converter, Calendar Export, All Fixtures page.
2. **Phase 2 (Content):** Venue Pages, Squad Page, Knockout Paths, How It Works.
3. **Phase 3 (Tournament):** Live standings, bracket, scenario analysis.

Data layer (JSON files) comes first. Everything builds on accurate data.

---

## 10. General Behaviour

1. **Inspect first** — read relevant files before proposing changes.
2. **Propose a plan** — outline what you'll do before executing.
3. **Execute carefully** — small, focused changes.
4. **Verify** — check for errors, confirm behaviour.
5. **Summarise** — describe what changed, files touched, follow-ups.

If anything conflicts with `PROJECT-BRIEF.md`, stop and ask.

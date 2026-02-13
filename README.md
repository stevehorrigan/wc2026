# World Cup 2026 Fan Companion

A "Follow My Team" World Cup 2026 companion website. Pick your country and get a personalised view of fixtures, kick-off times in your timezone, squad info, and an interactive venue map — filtering the complexity of a 48-team, 104-match, 16-city, 3-country tournament down to what matters to you.

## Features

### Phase 1 — MVP
- **Team Selector** — Grid of all 48 teams with search. Click to enter your team's dashboard.
- **Fixture List** — Your team's group stage matches with timezone-adjusted kick-off times.
- **Interactive Map** — Leaflet map with venue pins coloured by country (USA=blue, Mexico=green, Canada=red).
- **Group Table** — Your group's teams, FIFA rankings, and all 6 group fixtures by matchday.
- **Timezone Converter** — Auto-detects your timezone, dropdown to override. All times update instantly.
- **Calendar Export** — Download an ICS file with your team's fixtures.
- **All Fixtures** — Browse all 104 matches grouped by date with round filters.

### Phase 2 — Content
- **Venue Pages** — Dedicated page per stadium with capacity, location map, hosted fixtures, and travel affiliate placeholders.
- **Squad Ladders** — Up to 55 players per team (core squad, extended pool, potentials) sourced from Wikipedia. Full names, DOB, caps, goals, clubs. Grouped by position with desktop table and mobile card views. Retired players excluded via `scripts/exclusions.json`. Refreshed daily via GitHub Actions or manually with `python scripts/scrape-squads.py`.
- **Knockout Path Scenarios** — Tabbed component on the team dashboard showing the bracket path to the Final for 1st, 2nd, and 3rd place finishes, with venues, dates, and opponent descriptions.
- **How It Works** — Explainer page covering the 48-team format, group stage, third-place advancement, tiebreaker rules, knockout bracket diagram, and key tournament dates.
- **Multi-format Calendar Export** — ICS download, Google Calendar link, and Outlook.com link for your team's fixtures.
- **Venue Local Time** — Option to show kick-off times in the host stadium's local timezone, useful for fans attending in person.

## Tech Stack

- React + Vite
- Tailwind CSS v4
- Leaflet.js (OpenStreetMap / CartoDB tiles)
- JSON data files (no backend)
- Deployed to Vercel

## Development

```bash
npm install
npm run dev
```

## Data

- 48 teams from the official December 2025 draw (42 confirmed + 6 playoff TBDs)
- 16 venues across USA (11), Mexico (3), and Canada (2)
- 104 matches: 72 group stage + 32 knockout

## Disclaimer

This is an unofficial fan site. Not affiliated with or endorsed by FIFA.

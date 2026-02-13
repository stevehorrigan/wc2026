# World Cup 2026 Fan Companion — Project Brief

## What we're building

A "Follow My Team" World Cup 2026 companion website. The user picks their country and gets a personalised view of everything relevant to them: fixtures on an interactive map, kick-off times in their timezone, squad info, knockout path scenarios, and travel info between venues.

This is NOT another fixture list or bracket predictor. The differentiator is personalisation — filtering the complexity of a 48-team, 104-game, 16-city, 3-country tournament down to what matters to one fan.

## Tech stack

- **React** with **Vite** for the build tool
- **Tailwind CSS** for styling
- **Leaflet.js** (with OpenStreetMap tiles) for the interactive map — fully free and open source, no API key needed
- **JSON data files** for all fixture/team/venue data — no database, no backend
- Deploy to **Vercel** via GitHub (already connected)
- All data is static/client-side. No server, no API needed for the MVP

## Project structure

```
wc2026/
├── public/
│   └── flags/              # Country flag SVGs (use flagcdn.com or similar CDN instead of local files if easier)
├── src/
│   ├── components/
│   │   ├── App.jsx                 # Main app shell, routing
│   │   ├── TeamSelector.jsx        # Pick your team — the entry point
│   │   ├── Dashboard.jsx           # Main view after selecting a team
│   │   ├── FixtureMap.jsx          # Leaflet map with venue pins and fixture overlays
│   │   ├── FixtureList.jsx         # Your team's fixtures as a list with timezone-adjusted times
│   │   ├── GroupTable.jsx          # Your team's group with standings
│   │   ├── KnockoutPath.jsx        # "If you finish 1st/2nd/3rd, you'll face..." scenarios
│   │   ├── TimezoneSelector.jsx    # Auto-detect + manual override
│   │   ├── VenuePage.jsx           # Individual venue/city info page
│   │   ├── SquadPage.jsx           # Team squad with player details
│   │   ├── HowItWorks.jsx          # Explainer: 48 teams, groups, 3rd place rules etc
│   │   ├── CalendarExport.jsx      # Download ICS file for your team's fixtures
│   │   ├── AllFixtures.jsx         # Full fixture list (for SEO and general browsing)
│   │   └── Footer.jsx
│   ├── data/
│   │   ├── teams.json              # All 48 teams with group, FIFA ranking, confederation
│   │   ├── groups.json             # 12 groups (A-L) with team assignments
│   │   ├── venues.json             # 16 venues with name, city, country, lat/lng, capacity, timezone
│   │   ├── fixtures.json           # All 104 matches: date, time (UTC), venue, teams, group/round
│   │   └── squads.json             # Squad data (can start empty, fill in as announced)
│   ├── utils/
│   │   ├── timezone.js             # Timezone detection and conversion helpers
│   │   ├── fixtures.js             # Filter/sort fixtures by team, date, round
│   │   ├── knockout.js             # Calculate knockout path scenarios
│   │   └── calendar.js             # ICS file generation
│   ├── index.css                   # Tailwind imports
│   └── main.jsx                    # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Data structures

### teams.json
```json
[
  {
    "id": "eng",
    "name": "England",
    "shortName": "ENG",
    "group": "L",
    "confederation": "UEFA",
    "fifaRanking": 5,
    "flagUrl": "https://flagcdn.com/w80/gb-eng.png",
    "qualified": true
  }
]
```

Note: 6 teams are TBD until the March playoffs. Use placeholder entries like:
- "UEFA Playoff A Winner" (Italy/Northern Ireland/Wales/Bosnia)
- "UEFA Playoff B Winner" (Ukraine/Sweden/Poland/Albania)
- "UEFA Playoff C Winner" (Turkey/Romania/Slovakia/Kosovo)
- "UEFA Playoff D Winner" (Denmark/North Macedonia/Czech Republic/Ireland)
- "FIFA Playoff 1 Winner" (DR Congo/Jamaica/New Caledonia)
- "FIFA Playoff 2 Winner" (Bolivia/Iraq/Suriname)

Update these once playoffs conclude on March 31.

### venues.json
```json
[
  {
    "id": "metlife",
    "name": "MetLife Stadium",
    "city": "East Rutherford",
    "displayCity": "New York / New Jersey",
    "country": "USA",
    "lat": 40.8128,
    "lng": -74.0742,
    "capacity": 82500,
    "timezone": "America/New_York",
    "hostsRounds": ["group", "r32", "r16", "qf", "sf", "final"]
  },
  {
    "id": "azteca",
    "name": "Estadio Azteca",
    "city": "Mexico City",
    "displayCity": "Mexico City",
    "country": "Mexico",
    "lat": 19.3029,
    "lng": -99.1505,
    "capacity": 87523,
    "timezone": "America/Mexico_City",
    "hostsRounds": ["group", "r32", "r16"]
  }
]
```

Full venue list (compile all 16):
- USA (11): MetLife Stadium (East Rutherford/NY-NJ), SoFi Stadium (Los Angeles), AT&T Stadium (Dallas), Hard Rock Stadium (Miami), Mercedes-Benz Stadium (Atlanta), NRG Stadium (Houston), Arrowhead Stadium (Kansas City), Levi's Stadium (San Francisco/Santa Clara), Lumen Field (Seattle), Gillette Stadium (Boston/Foxborough), Lincoln Financial Field (Philadelphia)
- Mexico (3): Estadio Azteca (Mexico City), Estadio Akron (Guadalajara), Estadio BBVA (Monterrey)
- Canada (2): BMO Field (Toronto), BC Place (Vancouver)

### fixtures.json
```json
[
  {
    "matchNumber": 1,
    "date": "2026-06-11",
    "timeUTC": "21:00",
    "venue": "azteca",
    "homeTeam": "mex",
    "awayTeam": "rsa",
    "group": "A",
    "round": "group",
    "matchday": 1
  }
]
```

For the full fixture data, source from the official FIFA schedule. All 104 matches. Store times in UTC and convert on the client side.

Key fixtures to get right:
- Match 1: Mexico vs South Africa, June 11, Estadio Azteca
- Match 3: Canada vs Australia, June 12, BMO Field Toronto
- Match 4: USA vs ?, June 12, SoFi Stadium Los Angeles
- Final: Match 104, July 19, MetLife Stadium

### squads.json
```json
{
  "eng": {
    "lastUpdated": "2026-02-13",
    "status": "preliminary",
    "manager": "Thomas Tuchel",
    "players": [
      {
        "name": "Jordan Pickford",
        "position": "GK",
        "club": "Everton",
        "caps": 65,
        "goals": 0,
        "age": 32,
        "number": 1,
        "tier": "core"
      }
    ]
  }
}
```

**Squad ladders (~50 players per team):** Extended pools sourced from FBRef national team pages via `scripts/scrape-squads.py`. Each player has a `tier` field:
- `"core"` — Regular starters and recent call-ups (~26 players)
- `"extended"` — Fringe players called up in last 1-2 years (~15 players)
- `"potential"` — Emerging talents and wider pool (~10 players)

Run `python scripts/scrape-squads.py` to refresh. The 6 TBD playoff teams are left empty until playoffs conclude.

**Calendar export formats:** ICS download (Apple/Outlook desktop), Google Calendar URL, Outlook.com URL. All generated client-side.

**Venue local time:** Timezone selector includes a "Venue local time" option that shows each fixture in its host stadium's local timezone — useful for fans attending matches in person.

## Core features — build in this order

### Phase 1: MVP (build first — target: live by mid-March)

1. **Team Selector** — grid of all 48 team flags/names. Click one to enter the dashboard. Store selection in URL params so it's shareable (e.g., `/team/eng`). Also store in localStorage so it remembers on return visits.

2. **Fixture List** — show the selected team's group stage matches. Date, time (converted to user's detected timezone), opponent, venue, city. Simple, clean, readable. Include a small note showing the user's detected timezone with option to change.

3. **Interactive Map** — Leaflet map showing pins for the venues where the selected team plays. Click a pin to see match details. Use custom coloured pins or markers for different rounds (group = blue, knockout = red, etc). Zoom to fit the relevant venues.

4. **Group Table** — show the team's group with all 4 teams, their FIFA ranking, and fixture schedule. Once the tournament starts this would show standings but for now just show the teams and fixtures.

5. **Timezone Converter** — auto-detect using `Intl.DateTimeFormat().resolvedOptions().timeZone`. Show a dropdown to override. All times throughout the site update when timezone changes. This is a core differentiator so get it right.

6. **Calendar Export** — "Add to calendar" button that generates an ICS file with the selected team's fixtures in the user's chosen timezone.

7. **All Fixtures page** — separate page showing all 104 matches grouped by date. Useful for general browsing and good for SEO.

### Phase 2: Content & Depth (March — May)

8. **Venue/City Pages** — one page per venue with: stadium info, city info, map, which matches are played there, travel tips. These are the pages where affiliate links (hotels, flights) will sit.

9. **Squad Page** — per team. Player list with position, club, caps, age. Status indicators (confirmed/provisional/injured). This gets populated as squads are announced.

10. **Knockout Path Scenarios** — "If England finish 1st in Group L, they'll play the 2nd place team from Group K or the 3rd place team from Group X in [city]." Show the branching paths visually. This is complex because of the 8 best third-placed team rules — see FIFA regulations.

11. **"How It Works" Explainer** — visual guide to the tournament format. 48 teams, 12 groups of 4, top 2 plus 8 best 3rd-place teams go through to round of 32. Head-to-head tiebreaker before goal difference (new rule for 2026). Make it clear and visual, not walls of text.

### Phase 3: Tournament Mode (June — July)

12. **Live-ish Group Standings** — update group tables as results come in (manual JSON updates or connect to a free API like football-data.org)

13. **Knockout Bracket** — visual bracket from R32 to Final, updating as results come in

14. **"What does this result mean"** — during group stages, show qualification scenarios. "If England beat Croatia AND France draw with Senegal, then..."

## Design direction

- Clean, modern, mobile-first. Most users will be on their phones
- Dark mode as default (football fans watching at night / in pubs) with light mode toggle
- Team colours used as accent when a team is selected (e.g., England = white/navy)
- Minimal chrome — the content IS the interface
- Fast. No loading spinners for static data. Everything should feel instant
- Use flag emojis or small flag images throughout — helps visual scanning
- Responsive: works perfectly on mobile, tablet, and desktop

## Colour palette suggestion
- Background: dark navy (#0f172a) for dark mode, white (#ffffff) for light
- Primary accent: teal/green (#14b8a6) — neutral, not tied to any team
- Text: white on dark, dark slate on light
- Venue pins: distinct colours per country (USA = blue, Mexico = green, Canada = red)

## SEO considerations

- Each team should have its own URL: `/team/eng`, `/team/bra`, etc.
- Each venue should have its own URL: `/venue/metlife`, `/venue/azteca`, etc.
- Page titles like "England World Cup 2026 Fixtures, Squad & Schedule"
- Meta descriptions for each page
- Use React Router for proper URLs (not hash routing)
- Pre-render or use SSG if possible for better crawling (Vite SSG plugin or consider Astro if SSR is needed)
- The All Fixtures page should target "World Cup 2026 schedule" type searches

## Important constraints

- **No FIFA trademarks**: don't use "FIFA World Cup" in the site title, branding, or meta titles. Use "World Cup 2026" or "2026 Football Tournament" or similar. Include a disclaimer in the footer: "This is an unofficial fan site. Not affiliated with or endorsed by FIFA."
- **No official logos or imagery**: use our own design, open source flag images, and map tiles
- **No copyrighted fixture presentation**: we can list factual data (dates, times, teams, venues) but use our own layout and presentation
- **Country flags**: use flagcdn.com CDN or an open source flag icon set. For England/Scotland/Wales use the individual nation flags, not the UK flag

## Affiliate integration points (build the structure now, add links later)

- Venue/city pages: "Hotels near [stadium]" → Booking.com affiliate link
- Venue/city pages: "Flights to [city]" → Skyscanner affiliate link
- Travel section: "Get an eSIM for USA/Mexico/Canada" → Airalo/Holafly affiliate link
- Footer/sidebar: "Travel insurance for your trip" → affiliate link
- These should be clearly labelled as affiliate/partner links

## What NOT to build (keep it simple)

- No user accounts or login
- No database or backend
- No live score websockets (manual updates are fine)
- No prediction game or fantasy football
- No forum or comments
- No betting odds (maybe later, not MVP)
- No video content
- No social media feed embeds

## Getting started

After creating the Vite + React project, the first thing to build is the data layer. Get the JSON files right with all 104 fixtures, 48 teams, and 16 venues. Everything else builds on top of that data. Double-check fixture data against the official FIFA schedule — accuracy is everything for a tool like this.

Then build the Team Selector → Fixture List → Map flow. That's the core user journey and needs to feel great before adding anything else.

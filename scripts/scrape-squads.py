#!/usr/bin/env python3
"""
Fetch World Cup 2026 squad data from API-Football.

Two-phase approach to stay within the free tier (100 req/day):
  Phase 1: /players/squads — quick roster (~30 players per team, 42 requests)
  Phase 2: /players?team=X&season=2024 — rich data with caps/goals (~3 pages × 42 teams)

The script is resumable: it saves progress after each team and skips teams
already fetched. Run it daily to gradually build up and refresh all squads.

Usage:
  python scripts/scrape-squads.py                # Run both phases
  python scripts/scrape-squads.py --phase1       # Quick roster only
  python scripts/scrape-squads.py --phase2       # Rich data only
  python scripts/scrape-squads.py --team eng     # Single team
  python scripts/scrape-squads.py --force        # Ignore cache, refetch all

Environment:
  API_FOOTBALL_KEY  — API key (or hardcoded fallback)
"""

import json
import os
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime, date

# ── Config ──────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MAPPING_PATH = os.path.join(SCRIPT_DIR, "team-api-mapping.json")
SQUADS_PATH = os.path.join(PROJECT_DIR, "src", "data", "squads.json")
CACHE_DIR = os.path.join(SCRIPT_DIR, ".squad-cache")
API_KEY = os.environ.get("API_FOOTBALL_KEY", "181bf53d8ec1174186fa7be7d70ea408")
BASE_URL = "https://v3.football.api-sports.io"
REQUEST_DELAY = 7  # seconds between requests (free tier: 10 req/min)
SEASON = 2024  # Most recent full international season
MAX_REQUESTS_PER_RUN = 90  # Leave 10 buffer from daily 100 limit

# Manager data (not available from API, manually maintained)
MANAGERS = {
    "eng": "Thomas Tuchel", "bra": "Dorival Júnior", "fra": "Didier Deschamps",
    "arg": "Lionel Scaloni", "esp": "Luis de la Fuente", "deu": "Julian Nagelsmann",
    "prt": "Roberto Martínez", "nld": "Ronald Koeman", "usa": "Mauricio Pochettino",
    "mex": "Javier Aguirre", "can": "Jesse Marsch", "bel": "Domenico Tedesco",
    "hrv": "Zlatko Dalić", "ury": "Marcelo Bielsa", "col": "Néstor Lorenzo",
    "jpn": "Hajime Moriyasu", "kor": "Hong Myung-bo", "aus": "Tony Popovic",
    "mar": "Walid Regragui", "sen": "Aliou Cissé", "sui": "Murat Yakın",
    "ecu": "Sebastián Beccacece", "gha": "Otto Addo", "civ": "Emerse Faé",
    "egy": "Hossam Hassan", "sau": "Roberto Mancini", "irn": "Amir Ghalenoei",
    "qat": "Luis García", "tun": "Faouzi Benzarti", "pan": "Thomas Christiansen",
    "pry": "Alfaro Moreno", "nor": "Ståle Solbakken", "aut": "Ralf Rangnick",
    "sco": "Steve Clarke", "dza": "Vladimir Petković", "jor": "Hussein Ammouta",
    "uzb": "Srecko Katanec", "nzl": "Darren Bazeley", "cpv": "Bubista",
    "hti": "Marc Collat", "cuw": "Dick Advocaat", "rsa": "Hugo Broos",
}

# ── API helpers ─────────────────────────────────────────────────────────────

request_count = 0

def api_get(endpoint):
    global request_count
    if request_count >= MAX_REQUESTS_PER_RUN:
        print(f"\n⚠ Reached {MAX_REQUESTS_PER_RUN} requests this run. Resume tomorrow.")
        return None

    req = urllib.request.Request(
        f"{BASE_URL}/{endpoint}",
        headers={"x-apisports-key": API_KEY}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.load(resp)
        request_count += 1

        # Check for rate limit (API returns empty results when throttled)
        if data.get("results", 0) == 0 and data.get("errors"):
            print(f"  ⚠ API error: {data['errors']}")
            return None
        return data
    except Exception as e:
        print(f"  ✗ Request failed: {e}")
        return None


def load_mapping():
    with open(MAPPING_PATH) as f:
        return json.load(f)


def load_existing_squads():
    if os.path.exists(SQUADS_PATH):
        with open(SQUADS_PATH) as f:
            return json.load(f)
    return {}


def save_squads(squads):
    with open(SQUADS_PATH, "w") as f:
        json.dump(squads, f, indent=2, ensure_ascii=False)


def load_cache(team_id, phase):
    path = os.path.join(CACHE_DIR, f"{team_id}_{phase}.json")
    if os.path.exists(path):
        with open(path) as f:
            data = json.load(f)
        # Cache valid for 24 hours
        cached_at = datetime.fromisoformat(data.get("cached_at", "2000-01-01"))
        if (datetime.now() - cached_at).total_seconds() < 86400:
            return data.get("players")
    return None


def save_cache(team_id, phase, players):
    os.makedirs(CACHE_DIR, exist_ok=True)
    path = os.path.join(CACHE_DIR, f"{team_id}_{phase}.json")
    with open(path, "w") as f:
        json.dump({"cached_at": datetime.now().isoformat(), "players": players}, f)


# ── Position mapping ────────────────────────────────────────────────────────

def normalize_position(pos):
    if not pos:
        return "MID"
    pos = pos.lower()
    if "goal" in pos:
        return "GK"
    if "defend" in pos or "back" in pos:
        return "DEF"
    if "mid" in pos:
        return "MID"
    if "attack" in pos or "forward" in pos or "offen" in pos or "strik" in pos:
        return "FWD"
    return "MID"


# ── Phase 1: Quick roster from /players/squads ──────────────────────────────

def fetch_squad_roster(api_team_id):
    """Get basic roster (~30 players) from the squad endpoint."""
    data = api_get(f"players/squads?team={api_team_id}")
    if not data or not data.get("response"):
        return []

    players = []
    for p in data["response"][0].get("players", []):
        players.append({
            "apiId": p["id"],
            "name": p["name"],
            "age": p.get("age"),
            "number": p.get("number"),
            "position": normalize_position(p.get("position")),
            "photo": p.get("photo"),
        })
    return players


# ── Phase 2: Rich data from /players?team=X&season=Y ───────────────────────

def fetch_player_stats(api_team_id):
    """Get all players who appeared for this team in the given season, with stats."""
    all_players = []
    page = 1
    total_pages = 1

    while page <= total_pages:
        if page > 1:
            time.sleep(REQUEST_DELAY)

        data = api_get(f"players?team={api_team_id}&season={SEASON}&page={page}")
        if not data or not data.get("response"):
            break

        total_pages = data["paging"]["total"]

        for entry in data["response"]:
            pl = entry["player"]

            # Sum appearances and goals across all national team competitions
            total_apps = 0
            total_goals = 0
            position = None

            for st in entry.get("statistics", []):
                games = st.get("games", {})
                goals = st.get("goals", {})
                apps = games.get("appearences") or 0
                gls = goals.get("total") or 0
                total_apps += apps
                total_goals += gls
                if not position and games.get("position"):
                    position = games["position"]

            all_players.append({
                "apiId": pl["id"],
                "name": f'{pl.get("firstname", "")} {pl.get("lastname", "")}'.strip() or pl["name"],
                "shortName": pl["name"],
                "age": pl.get("age"),
                "dob": pl.get("birth", {}).get("date"),
                "nationality": pl.get("nationality"),
                "position": normalize_position(position),
                "caps": total_apps,
                "goals": total_goals,
                "photo": pl.get("photo"),
            })

        page += 1

    return all_players


# ── Merge and tier assignment ───────────────────────────────────────────────

def merge_players(roster, stats):
    """Merge Phase 1 roster with Phase 2 stats. Assign tiers."""
    # Build lookup by API ID
    stats_by_id = {p["apiId"]: p for p in stats}
    roster_by_id = {p["apiId"]: p for p in roster}

    # All unique player IDs
    all_ids = set(list(stats_by_id.keys()) + list(roster_by_id.keys()))

    merged = []
    for pid in all_ids:
        r = roster_by_id.get(pid, {})
        s = stats_by_id.get(pid, {})

        player = {
            "name": s.get("name") or s.get("shortName") or r.get("name", "Unknown"),
            "position": s.get("position") or r.get("position", "MID"),
            "age": s.get("age") or r.get("age"),
            "number": r.get("number"),
            "caps": s.get("caps", 0),
            "goals": s.get("goals", 0),
        }

        # Tier: core if in current roster, extended if has appearances, potential otherwise
        in_roster = pid in roster_by_id
        has_apps = s.get("caps", 0) > 0

        if in_roster:
            player["tier"] = "core"
        elif has_apps:
            player["tier"] = "extended"
        else:
            player["tier"] = "potential"

        merged.append(player)

    # Sort: core first, then extended, then potential; within tier by caps desc
    tier_order = {"core": 0, "extended": 1, "potential": 2}
    pos_order = {"GK": 0, "DEF": 1, "MID": 2, "FWD": 3}
    merged.sort(key=lambda p: (
        tier_order.get(p["tier"], 9),
        pos_order.get(p["position"], 9),
        -(p.get("caps") or 0),
    ))

    # Cap at ~55 players
    return merged[:55]


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    phase1_only = "--phase1" in args
    phase2_only = "--phase2" in args
    force = "--force" in args
    single_team = None
    if "--team" in args:
        idx = args.index("--team")
        if idx + 1 < len(args):
            single_team = args[idx + 1]

    mapping = load_mapping()
    squads = load_existing_squads()

    team_ids = [single_team] if single_team else list(mapping.keys())
    today = date.today().isoformat()

    print(f"Squad scraper — {len(team_ids)} teams, season {SEASON}")
    print(f"API requests budget: {MAX_REQUESTS_PER_RUN}")
    print(f"{'Force mode' if force else 'Resumable mode (24h cache)'}\n")

    teams_updated = 0

    for team_id in team_ids:
        if team_id not in mapping:
            print(f"⚠ {team_id}: no API mapping, skipping")
            continue

        api_id = mapping[team_id]["apiId"]
        api_name = mapping[team_id]["name"]

        # Phase 1: Quick roster
        roster = []
        if not phase2_only:
            cached = None if force else load_cache(team_id, "roster")
            if cached is not None:
                roster = cached
                print(f"✓ {team_id:4s} ({api_name:25s}) roster: {len(roster):2d} players (cached)")
            else:
                time.sleep(REQUEST_DELAY)
                roster = fetch_squad_roster(api_id)
                if roster:
                    save_cache(team_id, "roster", roster)
                    print(f"✓ {team_id:4s} ({api_name:25s}) roster: {len(roster):2d} players (fetched)")
                else:
                    print(f"✗ {team_id:4s} ({api_name:25s}) roster: FAILED")

                if request_count >= MAX_REQUESTS_PER_RUN:
                    break

        # Phase 2: Rich player data
        stats = []
        if not phase1_only:
            cached = None if force else load_cache(team_id, "stats")
            if cached is not None:
                stats = cached
                print(f"  └─ stats: {len(stats):2d} players (cached)")
            else:
                time.sleep(REQUEST_DELAY)
                stats = fetch_player_stats(api_id)
                if stats:
                    save_cache(team_id, "stats", stats)
                    print(f"  └─ stats: {len(stats):2d} players (fetched, {request_count} reqs used)")
                else:
                    print(f"  └─ stats: FAILED or empty")

                if request_count >= MAX_REQUESTS_PER_RUN:
                    # Still save what we have so far
                    pass

        # Merge and save
        if roster or stats:
            players = merge_players(roster, stats)
            squads[team_id] = {
                "lastUpdated": today,
                "status": "preliminary",
                "manager": MANAGERS.get(team_id, squads.get(team_id, {}).get("manager")),
                "players": players,
            }
            teams_updated += 1

        if request_count >= MAX_REQUESTS_PER_RUN:
            print(f"\n⚠ Hit request limit ({request_count}/{MAX_REQUESTS_PER_RUN}). Resume tomorrow.")
            break

    # Ensure all 42 teams have entries (even if empty)
    for team_id in mapping:
        if team_id not in squads:
            squads[team_id] = {
                "lastUpdated": today,
                "status": "preliminary",
                "manager": MANAGERS.get(team_id),
                "players": [],
            }

    save_squads(squads)
    print(f"\n✓ Done. Updated {teams_updated} teams. Total requests: {request_count}")
    print(f"  Saved to {SQUADS_PATH}")


if __name__ == "__main__":
    main()

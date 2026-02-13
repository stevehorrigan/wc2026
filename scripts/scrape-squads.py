#!/usr/bin/env python3
"""
Scrape World Cup 2026 squad data from Wikipedia.

Each national team page has "Current squad" and "Recent call-ups" tables
giving us ~40-55 players per team with full name, position, DOB, caps,
goals, and current club.

Usage:
  python scripts/scrape-squads.py                # All 42 confirmed teams
  python scripts/scrape-squads.py --team eng     # Single team (test)
  python scripts/scrape-squads.py --force        # Ignore 24h cache

The script caches raw HTML for 24 hours to avoid hammering Wikipedia.
"""

import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, date
from html.parser import HTMLParser

# ── Config ──────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
SQUADS_PATH = os.path.join(PROJECT_DIR, "src", "data", "squads.json")
EXCLUSIONS_PATH = os.path.join(SCRIPT_DIR, "exclusions.json")
CACHE_DIR = os.path.join(SCRIPT_DIR, ".squad-cache")
REQUEST_DELAY = 2  # seconds between requests (polite crawling)
STALE_MONTHS = 12  # Recent call-ups older than this become "potential" tier

# Wikipedia page names for each national team
WIKI_PAGES = {
    "mex": "Mexico_men%27s_national_football_team",
    "rsa": "South_Africa_national_soccer_team",
    "kor": "South_Korea_men%27s_national_football_team",
    "can": "Canada_men%27s_national_soccer_team",
    "qat": "Qatar_national_football_team",
    "sui": "Switzerland_men%27s_national_football_team",
    "bra": "Brazil_men%27s_national_football_team",
    "mar": "Morocco_men%27s_national_football_team",
    "sco": "Scotland_men%27s_national_football_team",
    "hti": "Haiti_men%27s_national_football_team",
    "usa": "United_States_men%27s_national_soccer_team",
    "pry": "Paraguay_men%27s_national_football_team",
    "aus": "Australia_men%27s_national_soccer_team",
    "deu": "Germany_men%27s_national_football_team",
    "cuw": "Cura%C3%A7ao_national_football_team",
    "civ": "Ivory_Coast_men%27s_national_football_team",
    "ecu": "Ecuador_men%27s_national_football_team",
    "nld": "Netherlands_men%27s_national_football_team",
    "jpn": "Japan_men%27s_national_football_team",
    "tun": "Tunisia_men%27s_national_football_team",
    "bel": "Belgium_men%27s_national_football_team",
    "egy": "Egypt_men%27s_national_football_team",
    "irn": "Iran_men%27s_national_football_team",
    "nzl": "New_Zealand_men%27s_national_football_team",
    "esp": "Spain_men%27s_national_football_team",
    "cpv": "Cape_Verde_national_football_team",
    "sau": "Saudi_Arabia_men%27s_national_football_team",
    "ury": "Uruguay_men%27s_national_football_team",
    "fra": "France_men%27s_national_football_team",
    "sen": "Senegal_men%27s_national_football_team",
    "nor": "Norway_men%27s_national_football_team",
    "arg": "Argentina_men%27s_national_football_team",
    "dza": "Algeria_men%27s_national_football_team",
    "aut": "Austria_men%27s_national_football_team",
    "jor": "Jordan_national_football_team",
    "prt": "Portugal_men%27s_national_football_team",
    "uzb": "Uzbekistan_men%27s_national_football_team",
    "col": "Colombia_men%27s_national_football_team",
    "eng": "England_men%27s_national_football_team",
    "hrv": "Croatia_men%27s_national_football_team",
    "gha": "Ghana_men%27s_national_football_team",
    "pan": "Panama_national_football_team",
}

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

# ── HTML Table Parser ───────────────────────────────────────────────────────

class WikiTableParser(HTMLParser):
    """Parse Wikipedia squad tables into rows of text cells."""

    def __init__(self):
        super().__init__()
        self.rows = []
        self.current_row = []
        self.current_cell = ""
        self.in_cell = False
        self.skip_hidden = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "tr":
            self.current_row = []
        elif tag in ("td", "th"):
            self.in_cell = True
            self.current_cell = ""
        elif tag == "span":
            style = attrs_dict.get("style", "")
            if "display:none" in style or "display: none" in style:
                self.skip_hidden = True
            if "bday" in attrs_dict.get("class", ""):
                self.skip_hidden = False
        elif tag == "sup":
            # Skip footnote references
            self.skip_hidden = True

    def handle_endtag(self, tag):
        if tag in ("td", "th"):
            self.in_cell = False
            self.current_row.append(self.current_cell.strip())
            self.current_cell = ""
        elif tag == "tr":
            if self.current_row:
                self.rows.append(self.current_row)
        elif tag == "span":
            self.skip_hidden = False
        elif tag == "sup":
            self.skip_hidden = False

    def handle_data(self, data):
        if self.in_cell and not self.skip_hidden:
            self.current_cell += data


# ── Parsing helpers ─────────────────────────────────────────────────────────

def normalize_position(pos):
    if not pos:
        return "MID"
    pos = pos.strip().upper()
    if pos in ("GK",):
        return "GK"
    if pos in ("DF", "CB", "LB", "RB", "LWB", "RWB", "FB"):
        return "DEF"
    if pos in ("MF", "CM", "DM", "AM", "LM", "RM", "CDM", "CAM"):
        return "MID"
    if pos in ("FW", "CF", "LW", "RW", "ST", "SS", "WF"):
        return "FWD"
    return "MID"


def parse_dob(dob_str):
    """Extract YYYY-MM-DD from Wikipedia DOB string."""
    match = re.search(r"(\d{4}-\d{2}-\d{2})", dob_str)
    if match:
        return match.group(1)
    return None


def calc_age(dob_str):
    """Calculate age from DOB string."""
    dob = parse_dob(dob_str)
    if not dob:
        return None
    try:
        born = datetime.strptime(dob, "%Y-%m-%d")
        today = datetime.now()
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    except ValueError:
        return None


def parse_int(val):
    """Parse integer from string, handling commas and non-numeric chars."""
    if not val:
        return 0
    cleaned = re.sub(r"[^\d]", "", val)
    return int(cleaned) if cleaned else 0


def parse_callup_date(text):
    """Extract a date from 'v. Serbia, 13 November 2025' style strings."""
    match = re.search(r"(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})", text)
    if match:
        try:
            return datetime.strptime(f"{match.group(1)} {match.group(2)} {match.group(3)}", "%d %B %Y").date()
        except ValueError:
            pass
    return None


def is_stale_callup(callup_text):
    """Check if a call-up date is older than STALE_MONTHS."""
    d = parse_callup_date(callup_text)
    if not d:
        return False  # Can't tell, assume not stale
    delta = date.today() - d
    return delta.days > (STALE_MONTHS * 30)


def load_exclusions():
    """Load the manual exclusions list."""
    if os.path.exists(EXCLUSIONS_PATH):
        with open(EXCLUSIONS_PATH) as f:
            return json.load(f)
    return {}


def extract_table(html, after_id):
    """Extract the first <table> after a given section ID."""
    pos = html.find(f'id="{after_id}"')
    if pos == -1:
        return None
    table_start = html.find("<table", pos)
    if table_start == -1:
        return None
    table_end = html.find("</table>", table_start)
    if table_end == -1:
        return None
    return html[table_start : table_end + len("</table>")]


def parse_squad_table(table_html):
    """Parse a Wikipedia squad table into player dicts."""
    parser = WikiTableParser()
    parser.feed(table_html)

    if not parser.rows:
        return []

    # Detect column layout from header
    header = [c.lower().strip() for c in parser.rows[0]]

    # Map column indices
    col_map = {}
    for i, h in enumerate(header):
        if "no" in h or h == "#":
            col_map["number"] = i
        elif "pos" in h:
            col_map["position"] = i
        elif "player" in h or "name" in h:
            col_map["name"] = i
        elif "birth" in h or "dob" in h or "date" in h:
            col_map["dob"] = i
        elif "cap" in h:
            col_map["caps"] = i
        elif "goal" in h:
            col_map["goals"] = i
        elif "club" in h:
            col_map["club"] = i
        elif "call" in h or "latest" in h:
            col_map["latest_callup"] = i

    players = []
    for row in parser.rows[1:]:
        # Skip separator rows (single empty cell)
        if len(row) < 3:
            continue
        if all(c.strip() == "" for c in row):
            continue

        try:
            name = row[col_map.get("name", 2)] if "name" in col_map else ""
            if not name or name.strip() == "":
                continue

            dob_raw = row[col_map["dob"]] if "dob" in col_map and col_map["dob"] < len(row) else ""
            club_raw = row[col_map["club"]] if "club" in col_map and col_map["club"] < len(row) else ""

            player = {
                "name": name.strip(),
                "position": normalize_position(
                    row[col_map["position"]] if "position" in col_map and col_map["position"] < len(row) else ""
                ),
                "age": calc_age(dob_raw),
                "dob": parse_dob(dob_raw),
                "caps": parse_int(row[col_map["caps"]] if "caps" in col_map and col_map["caps"] < len(row) else "0"),
                "goals": parse_int(row[col_map["goals"]] if "goals" in col_map and col_map["goals"] < len(row) else "0"),
                "club": club_raw.strip() if club_raw else None,
            }

            # Number (optional)
            if "number" in col_map and col_map["number"] < len(row):
                num = parse_int(row[col_map["number"]])
                if num > 0:
                    player["number"] = num

            # Latest call-up (for recent call-ups table)
            if "latest_callup" in col_map and col_map["latest_callup"] < len(row):
                player["_latest_callup"] = row[col_map["latest_callup"]]

            players.append(player)
        except (IndexError, KeyError):
            continue

    return players


# ── Fetching and caching ────────────────────────────────────────────────────

def fetch_wiki_page(wiki_page, force=False):
    """Fetch a Wikipedia page, with 24h caching."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_path = os.path.join(CACHE_DIR, f"{wiki_page[:80]}.html")

    if not force and os.path.exists(cache_path):
        mtime = os.path.getmtime(cache_path)
        if (time.time() - mtime) < 86400:
            with open(cache_path) as f:
                return f.read()

    url = f"https://en.wikipedia.org/wiki/{wiki_page}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "WC2026FanCompanion/1.0 (squad data scraper; polite; contact: github.com/stevehorrigan/wc2026)"
    })

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
        with open(cache_path, "w") as f:
            f.write(html)
        return html
    except Exception as e:
        print(f"    ✗ Failed to fetch: {e}")
        return None


def scrape_team(team_id, wiki_page, exclusions=None, force=False):
    """Scrape squad data for one team from Wikipedia."""
    html = fetch_wiki_page(wiki_page, force=force)
    if not html:
        return None

    excluded_names = set()
    if exclusions:
        excluded_names = {n.lower() for n in exclusions.get(team_id, [])}

    # Try multiple section IDs for the current squad
    current_table = None
    for section_id in ["Current_squad", "Current_roster", "Players", "Squad"]:
        current_table = extract_table(html, section_id)
        if current_table:
            break

    current_players = parse_squad_table(current_table) if current_table else []

    # Try to find recent call-ups
    recent_table = None
    for section_id in ["Recent_call-ups", "Recent_callups", "Recent_call_ups"]:
        recent_table = extract_table(html, section_id)
        if recent_table:
            break

    recent_players = parse_squad_table(recent_table) if recent_table else []

    # Merge: current squad = core, recent call-ups = extended/potential
    seen_names = set()
    all_players = []

    for p in current_players:
        key = p["name"].lower()
        if key in excluded_names:
            continue
        if key not in seen_names:
            seen_names.add(key)
            p["tier"] = "core"
            p.pop("_latest_callup", None)
            all_players.append(p)

    for p in recent_players:
        key = p["name"].lower()
        if key in excluded_names:
            continue
        if key not in seen_names:
            seen_names.add(key)
            # Downgrade stale call-ups to "potential"
            callup = p.get("_latest_callup", "")
            if is_stale_callup(callup):
                p["tier"] = "potential"
            else:
                p["tier"] = "extended"
            p.pop("_latest_callup", None)
            all_players.append(p)

    # Sort: core first, then extended, then potential; within tier by position then caps desc
    pos_order = {"GK": 0, "DEF": 1, "MID": 2, "FWD": 3}
    tier_order = {"core": 0, "extended": 1, "potential": 2}
    all_players.sort(key=lambda p: (
        tier_order.get(p.get("tier", "core"), 9),
        pos_order.get(p["position"], 9),
        -(p.get("caps") or 0),
    ))

    # Cap at 55 players, keeping all core players
    if len(all_players) > 55:
        core_players = [p for p in all_players if p.get("tier") == "core"]
        others = [p for p in all_players if p.get("tier") != "core"]
        all_players = core_players + others[: 55 - len(core_players)]

    return all_players


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    force = "--force" in args
    single_team = None
    if "--team" in args:
        idx = args.index("--team")
        if idx + 1 < len(args):
            single_team = args[idx + 1]

    team_ids = [single_team] if single_team else list(WIKI_PAGES.keys())
    today = date.today().isoformat()

    # Load existing squads
    squads = {}
    if os.path.exists(SQUADS_PATH):
        with open(SQUADS_PATH) as f:
            squads = json.load(f)

    exclusions = load_exclusions()

    print(f"Wikipedia squad scraper — {len(team_ids)} teams")
    print(f"{'Force mode' if force else 'Using 24h HTML cache'}")
    if any(exclusions.get(t) for t in team_ids):
        print(f"Exclusions loaded for: {', '.join(t for t in team_ids if exclusions.get(t))}")
    print()

    teams_updated = 0
    teams_failed = 0

    for i, team_id in enumerate(team_ids):
        wiki_page = WIKI_PAGES.get(team_id)
        if not wiki_page:
            print(f"  ⚠ {team_id}: no Wikipedia page mapping")
            continue

        if i > 0:
            time.sleep(REQUEST_DELAY)

        print(f"  {team_id:4s}: ", end="", flush=True)

        players = scrape_team(team_id, wiki_page, exclusions=exclusions, force=force)

        if players is not None:
            core_count = sum(1 for p in players if p.get("tier") == "core")
            ext_count = sum(1 for p in players if p.get("tier") == "extended")

            squads[team_id] = {
                "lastUpdated": today,
                "status": "preliminary",
                "manager": MANAGERS.get(team_id, squads.get(team_id, {}).get("manager")),
                "players": players,
            }
            teams_updated += 1
            print(f"{len(players):2d} players (core={core_count}, extended={ext_count})")
        else:
            teams_failed += 1
            print("FAILED")
            # Keep existing data if scrape failed
            if team_id not in squads:
                squads[team_id] = {
                    "lastUpdated": today,
                    "status": "preliminary",
                    "manager": MANAGERS.get(team_id),
                    "players": [],
                }

    # Save
    with open(SQUADS_PATH, "w") as f:
        json.dump(squads, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Done. Updated: {teams_updated}, Failed: {teams_failed}")
    print(f"  Saved to {SQUADS_PATH}")


if __name__ == "__main__":
    main()

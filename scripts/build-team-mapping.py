#!/usr/bin/env python3
"""Build API-Football team ID mapping for our 42 confirmed WC2026 teams."""

import json
import urllib.request
import urllib.parse
import time
import os

API_KEY = os.environ.get("API_FOOTBALL_KEY", "181bf53d8ec1174186fa7be7d70ea408")
BASE = "https://v3.football.api-sports.io"
OUT_PATH = os.path.join(os.path.dirname(__file__), "team-api-mapping.json")

# Map our team IDs to search terms the API will recognise
TEAMS = [
    ("mex", "Mexico"), ("rsa", "South Africa"), ("kor", "South Korea"),
    ("can", "Canada"), ("qat", "Qatar"), ("sui", "Switzerland"),
    ("bra", "Brazil"), ("mar", "Morocco"), ("sco", "Scotland"), ("hti", "Haiti"),
    ("usa", "USA"), ("pry", "Paraguay"), ("aus", "Australia"),
    ("deu", "Germany"), ("cuw", "Curacao"), ("civ", "Ivory Coast"), ("ecu", "Ecuador"),
    ("nld", "Netherlands"), ("jpn", "Japan"), ("tun", "Tunisia"),
    ("bel", "Belgium"), ("egy", "Egypt"), ("irn", "Iran"), ("nzl", "New Zealand"),
    ("esp", "Spain"), ("cpv", "Cape Verde"), ("sau", "Saudi Arabia"), ("ury", "Uruguay"),
    ("fra", "France"), ("sen", "Senegal"), ("nor", "Norway"),
    ("arg", "Argentina"), ("dza", "Algeria"), ("aut", "Austria"), ("jor", "Jordan"),
    ("prt", "Portugal"), ("uzb", "Uzbekistan"), ("col", "Colombia"),
    ("eng", "England"), ("hrv", "Croatia"), ("gha", "Ghana"), ("pan", "Panama"),
]

def api_get(endpoint):
    req = urllib.request.Request(
        f"{BASE}/{endpoint}",
        headers={"x-apisports-key": API_KEY}
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)

def find_national_team(search_name):
    data = api_get(f"teams?search={urllib.parse.quote(search_name)}")
    for t in data["response"]:
        team = t["team"]
        name = team["name"]
        if team["national"] and " W" not in name and "U2" not in name and "U1" not in name:
            return team
    return None

# Load existing mapping if any
mapping = {}
if os.path.exists(OUT_PATH):
    with open(OUT_PATH) as f:
        mapping = json.load(f)

missing = [(oid, name) for oid, name in TEAMS if oid not in mapping]
print(f"Already mapped: {len(mapping)}, missing: {len(missing)}")

for i, (our_id, search_name) in enumerate(missing):
    if i > 0:
        time.sleep(3)  # 3s between requests to avoid throttle

    try:
        team = find_national_team(search_name)
        if team:
            mapping[our_id] = {"apiId": team["id"], "name": team["name"], "code": team.get("code")}
            print(f"✓ {our_id:4s} -> {team['id']:5d}: {team['name']}")
        else:
            print(f"✗ {our_id:4s}: NOT FOUND for '{search_name}'")
    except Exception as e:
        print(f"✗ {our_id:4s}: ERROR - {e}")

    # Save progress after each lookup
    with open(OUT_PATH, "w") as f:
        json.dump(mapping, f, indent=2)

print(f"\nTotal mapped: {len(mapping)}/{len(TEAMS)}")

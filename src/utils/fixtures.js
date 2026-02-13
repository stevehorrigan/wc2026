import teams from '../data/teams.json';
import venues from '../data/venues.json';
import fixtures from '../data/fixtures.json';
import groups from '../data/groups.json';

const teamMap = new Map(teams.map(t => [t.id, t]));
const venueMap = new Map(venues.map(v => [v.id, v]));

export function getTeamById(id) {
  return teamMap.get(id) || null;
}

export function getVenueById(id) {
  return venueMap.get(id) || null;
}

export function getAllTeams() {
  return teams;
}

export function getAllVenues() {
  return venues;
}

export function getAllFixtures() {
  return fixtures;
}

export function getTeamFixtures(teamId) {
  return fixtures.filter(
    f => f.homeTeam === teamId || f.awayTeam === teamId
  );
}

export function getGroupFixtures(group) {
  return fixtures.filter(f => f.group === group);
}

export function getGroupTeams(group) {
  const teamIds = groups[group] || [];
  return teamIds.map(id => getTeamById(id)).filter(Boolean);
}

export function getFixturesByDate(fixtureList) {
  const grouped = {};
  for (const fixture of fixtureList) {
    if (!grouped[fixture.date]) {
      grouped[fixture.date] = [];
    }
    grouped[fixture.date].push(fixture);
  }
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}

export function getTeamName(teamIdOrBracket) {
  const team = getTeamById(teamIdOrBracket);
  if (team) return team.name;

  // Knockout bracket position labels
  if (/^\d[A-L]$/.test(teamIdOrBracket)) {
    const pos = teamIdOrBracket[0];
    const group = teamIdOrBracket[1];
    if (pos === '1') return `Winner Group ${group}`;
    if (pos === '2') return `Runner-up Group ${group}`;
    if (pos === '3') return `3rd Group ${group}`;
  }
  if (/^W\d+$/.test(teamIdOrBracket)) {
    return `Winner Match ${teamIdOrBracket.slice(1)}`;
  }
  if (/^L\d+$/.test(teamIdOrBracket)) {
    return `Loser Match ${teamIdOrBracket.slice(1)}`;
  }
  if (/^3[A-L]+$/.test(teamIdOrBracket)) {
    return `Best 3rd (${teamIdOrBracket.slice(1)})`;
  }

  return teamIdOrBracket;
}

export function getTeamFlag(teamIdOrBracket) {
  const team = getTeamById(teamIdOrBracket);
  return team ? team.flagUrl : null;
}

export function getRoundLabel(round) {
  const labels = {
    group: 'Group Stage',
    r32: 'Round of 32',
    r16: 'Round of 16',
    qf: 'Quarter-final',
    sf: 'Semi-final',
    '3rd': 'Third Place',
    final: 'Final',
  };
  return labels[round] || round;
}

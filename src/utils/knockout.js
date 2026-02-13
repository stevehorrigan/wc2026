import fixtures from '../data/fixtures.json';
import groups from '../data/groups.json';
import { getVenueById, getTeamName, getTeamById } from './fixtures';

// Build lookup maps from the fixture data
const fixtureMap = new Map(fixtures.map(f => [f.matchNumber, f]));

// Find which R32 match a bracket position appears in
function findR32Match(bracketPos) {
  return fixtures.find(
    f => f.round === 'r32' && (f.homeTeam === bracketPos || f.awayTeam === bracketPos)
  );
}

// Find which match a "W{n}" winner feeds into
function findNextMatch(matchNumber) {
  const winnerKey = `W${matchNumber}`;
  return fixtures.find(
    f => f.homeTeam === winnerKey || f.awayTeam === winnerKey
  );
}

// Get likely candidate teams for a bracket position based on FIFA rankings
function getCandidates(bracketPos) {
  // Group position (e.g. "1A", "2B")
  if (/^\d[A-L]$/.test(bracketPos)) {
    const pos = parseInt(bracketPos[0]);
    const group = bracketPos[1];
    const teamIds = groups[group] || [];
    const teamList = teamIds.map(id => {
      const team = getTeamById(id);
      return team;
    }).filter(Boolean).sort((a, b) => (a.fifaRanking || 999) - (b.fifaRanking || 999));

    // For 1st place, return top 2 by ranking; for 2nd, return middle 2
    if (pos === 1) return teamList.slice(0, 2);
    if (pos === 2) return teamList.slice(1, 3);
    return teamList.slice(2);
  }

  // Third-place pools - get all 3rd-ranked teams from the listed groups
  if (/^3[A-L]+$/.test(bracketPos)) {
    const groupLetters = bracketPos.slice(1).split('');
    const candidates = [];
    for (const g of groupLetters) {
      const teamIds = groups[g] || [];
      const teamList = teamIds.map(id => getTeamById(id)).filter(Boolean)
        .sort((a, b) => (a.fifaRanking || 999) - (b.fifaRanking || 999));
      if (teamList.length >= 3) candidates.push(teamList[2]);
    }
    return candidates.sort((a, b) => (a.fifaRanking || 999) - (b.fifaRanking || 999));
  }

  return [];
}

// Trace a full path from a starting R32 match through to the final
function tracePath(r32Match) {
  const path = [];
  let current = r32Match;

  while (current) {
    const venue = getVenueById(current.venue);
    path.push({
      matchNumber: current.matchNumber,
      round: current.round,
      date: current.date,
      timeUTC: current.timeUTC,
      venue: venue ? venue.name : current.venue,
      venueCity: venue ? venue.displayCity : '',
      venueId: current.venue,
      opponent: current.homeTeam, // will be refined per-scenario
      homeTeam: current.homeTeam,
      awayTeam: current.awayTeam,
    });

    const next = findNextMatch(current.matchNumber);
    if (!next) break;
    current = next;
  }

  return path;
}

// Get the opponent description for a bracket position
function describeOpponent(bracketPos, excludePos) {
  if (bracketPos === excludePos) return null;

  // Known team position (1X, 2X)
  if (/^\d[A-L]$/.test(bracketPos)) {
    const pos = bracketPos[0];
    const group = bracketPos[1];
    const candidates = getCandidates(bracketPos);
    if (pos === '1') return { label: `Winner of Group ${group}`, type: 'group-winner', candidates };
    if (pos === '2') return { label: `Runner-up of Group ${group}`, type: 'group-runnerup', candidates };
  }

  // Third-place pool (3ABCDF etc.)
  if (/^3[A-L]+$/.test(bracketPos)) {
    const groupLetters = bracketPos.slice(1).split('');
    const candidates = getCandidates(bracketPos);
    return {
      label: `Best 3rd-place from ${groupLetters.map(g => `Group ${g}`).join(' / ')}`,
      type: 'third-place',
      candidates,
    };
  }

  // Winner of a previous match
  if (/^W\d+$/.test(bracketPos)) {
    const matchNum = parseInt(bracketPos.slice(1));
    const match = fixtureMap.get(matchNum);
    if (match) {
      const home = getTeamName(match.homeTeam);
      const away = getTeamName(match.awayTeam);
      return { label: `Winner of ${home} vs ${away}`, type: 'match-winner', matchNumber: matchNum };
    }
    return { label: `Winner of Match ${matchNum}`, type: 'match-winner', matchNumber: matchNum };
  }

  // Loser of a match
  if (/^L\d+$/.test(bracketPos)) {
    const matchNum = parseInt(bracketPos.slice(1));
    return { label: `Loser of Match ${matchNum}`, type: 'match-loser', matchNumber: matchNum };
  }

  return { label: bracketPos, type: 'unknown' };
}

/**
 * Get knockout path scenarios for a team in a given group.
 * Returns { first, second, third } where each is an object
 * with the bracket path if they finish in that position.
 */
export function getKnockoutPaths(group) {
  const firstPos = `1${group}`;
  const secondPos = `2${group}`;

  // --- 1st place path ---
  const firstR32 = findR32Match(firstPos);
  let firstPath = null;
  if (firstR32) {
    const rawPath = tracePath(firstR32);
    firstPath = rawPath.map(step => {
      const isHome = step.homeTeam === firstPos || /^W\d+$/.test(step.homeTeam);
      const opponentPos = step.homeTeam === firstPos ? step.awayTeam :
                          step.awayTeam === firstPos ? step.homeTeam :
                          // For later rounds, the "other" team
                          isHome ? step.awayTeam : step.homeTeam;
      return {
        ...step,
        opponent: describeOpponent(opponentPos, firstPos),
      };
    });
  }

  // --- 2nd place path ---
  const secondR32 = findR32Match(secondPos);
  let secondPath = null;
  if (secondR32) {
    const rawPath = tracePath(secondR32);
    secondPath = rawPath.map(step => {
      const opponentPos = step.homeTeam === secondPos ? step.awayTeam :
                          step.awayTeam === secondPos ? step.homeTeam :
                          step.awayTeam; // later rounds
      return {
        ...step,
        opponent: describeOpponent(opponentPos, secondPos),
      };
    });
  }

  // --- 3rd place scenarios ---
  // Find all R32 matches where this group appears in a third-place pool
  const thirdScenarios = [];
  for (const f of fixtures) {
    if (f.round !== 'r32') continue;
    const checkTeam = (pos) => {
      if (/^3[A-L]+$/.test(pos) && pos.includes(group)) {
        const rawPath = tracePath(f);
        const opponentPos = pos === f.homeTeam ? f.awayTeam : f.homeTeam;
        thirdScenarios.push({
          r32Match: f.matchNumber,
          opponent: describeOpponent(opponentPos, null),
          venue: getVenueById(f.venue),
          date: f.date,
          path: rawPath,
        });
      }
    };
    checkTeam(f.homeTeam);
    checkTeam(f.awayTeam);
  }

  return { first: firstPath, second: secondPath, third: thirdScenarios };
}

export function getRoundName(round) {
  const names = {
    r32: 'Round of 32',
    r16: 'Round of 16',
    qf: 'Quarter-final',
    sf: 'Semi-final',
    '3rd': 'Third Place',
    final: 'Final',
  };
  return names[round] || round;
}

import fixtures from '../data/fixtures.json';
import { getVenueById, getTeamName } from './fixtures';

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
    if (pos === '1') return { label: `Winner of Group ${group}`, type: 'group-winner' };
    if (pos === '2') return { label: `Runner-up of Group ${group}`, type: 'group-runnerup' };
  }

  // Third-place pool (3ABCDF etc.)
  if (/^3[A-L]+$/.test(bracketPos)) {
    const groups = bracketPos.slice(1).split('');
    return {
      label: `Best 3rd-place from ${groups.map(g => `Group ${g}`).join(' / ')}`,
      type: 'third-place',
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

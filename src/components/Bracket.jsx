import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllFixtures, getVenueById, getTeamName, getTeamFlag, getTeamById, getRoundLabel } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';
import { useTimezone } from '../hooks/useTimezone';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import TimezoneSelector, { VENUE_LOCAL } from './TimezoneSelector';

/**
 * Trace the bracket tree from a given match number recursively.
 * Returns an object keyed by round, with arrays of fixtures.
 */
function traceBracketHalf(matchNumber, fixtureMap) {
  const fixture = fixtureMap.get(matchNumber);
  if (!fixture) return {};

  const result = { [fixture.round]: [fixture] };

  for (const teamRef of [fixture.homeTeam, fixture.awayTeam]) {
    const winMatch = /^W(\d+)$/.exec(teamRef);
    if (winMatch) {
      const feederNum = parseInt(winMatch[1], 10);
      const sub = traceBracketHalf(feederNum, fixtureMap);
      for (const [round, matches] of Object.entries(sub)) {
        result[round] = (result[round] || []).concat(matches);
      }
    }
  }

  return result;
}

/**
 * Sort fixtures within a round by their match number to maintain
 * bracket ordering (adjacent pairs feed into the same next-round match).
 */
function sortByMatch(fixtures) {
  return [...fixtures].sort((a, b) => a.matchNumber - b.matchNumber);
}

// --- MatchCard ---

function TeamRow({ teamId }) {
  const team = getTeamById(teamId);
  const flag = getTeamFlag(teamId);
  const name = getTeamName(teamId);

  const inner = (
    <>
      {flag ? (
        <img src={flag} alt="" className="w-4 h-3 object-cover rounded-sm flex-shrink-0" />
      ) : (
        <span className="w-4 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm flex-shrink-0" />
      )}
      <span className="font-medium text-slate-900 dark:text-white truncate flex-1 text-xs">
        {name}
      </span>
    </>
  );

  if (team) {
    return (
      <Link to={`/team/${teamId}`} className="flex items-center gap-1.5 mb-1 hover:text-teal-400 transition-colors">
        {inner}
      </Link>
    );
  }

  return <div className="flex items-center gap-1.5 mb-1">{inner}</div>;
}

function MatchCard({ fixture, timezone, isVenueLocal }) {
  const venue = getVenueById(fixture.venue);
  const effectiveTz = isVenueLocal && venue ? venue.timezone : timezone;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs w-full">
      <TeamRow teamId={fixture.homeTeam} />
      <TeamRow teamId={fixture.awayTeam} />
      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
        {formatMatchDate(fixture.date, effectiveTz)} &middot;{' '}
        {formatMatchTime(fixture.date, fixture.timeUTC, effectiveTz)}
        {isVenueLocal && venue && (
          <span className="ml-1 text-teal-500 dark:text-teal-400">(local)</span>
        )}
      </div>
      {venue && (
        <Link
          to={`/venue/${venue.id}`}
          className="text-[10px] text-slate-400 dark:text-slate-500 truncate block hover:text-teal-400 transition-colors"
        >
          {venue.displayCity}
        </Link>
      )}
    </div>
  );
}

// --- Round column for desktop bracket ---

function RoundColumn({ label, fixtures, timezone, isVenueLocal, gap, labelColor }) {
  return (
    <div className={`flex flex-col justify-around w-48 flex-shrink-0 ${gap}`}>
      <h4 className={`text-xs font-semibold text-center mb-2 ${labelColor || 'text-teal-400'}`}>
        {label}
      </h4>
      {fixtures.map((f) => (
        <MatchCard key={f.matchNumber} fixture={f} timezone={timezone} isVenueLocal={isVenueLocal} />
      ))}
    </div>
  );
}

// --- Main Bracket component ---

export default function Bracket() {
  const { timezone, setTimezone } = useTimezone();
  useDocumentTitle('Tournament Bracket');

  const isVenueLocal = timezone === VENUE_LOCAL;
  const allFixtures = getAllFixtures();

  // Build fixture map for tree traversal
  const fixtureMap = useMemo(() => {
    const map = new Map();
    for (const f of allFixtures) {
      map.set(f.matchNumber, f);
    }
    return map;
  }, [allFixtures]);

  // Get knockout fixtures
  const knockoutFixtures = useMemo(() => {
    return allFixtures.filter(f => f.round !== 'group');
  }, [allFixtures]);

  // Find final and 3rd-place matches
  const finalMatch = knockoutFixtures.find(f => f.round === 'final');
  const thirdPlace = knockoutFixtures.find(f => f.round === '3rd');

  // Trace left and right halves from the final's two semi-final feeders
  const { leftHalf, rightHalf } = useMemo(() => {
    if (!finalMatch) return { leftHalf: {}, rightHalf: {} };

    // The final's homeTeam and awayTeam are W101 and W102 (the two SF winners)
    const homeSfMatch = /^W(\d+)$/.exec(finalMatch.homeTeam);
    const awaySfMatch = /^W(\d+)$/.exec(finalMatch.awayTeam);

    const leftSfNum = homeSfMatch ? parseInt(homeSfMatch[1], 10) : null;
    const rightSfNum = awaySfMatch ? parseInt(awaySfMatch[1], 10) : null;

    const left = leftSfNum ? traceBracketHalf(leftSfNum, fixtureMap) : {};
    const right = rightSfNum ? traceBracketHalf(rightSfNum, fixtureMap) : {};

    return { leftHalf: left, rightHalf: right };
  }, [finalMatch, fixtureMap]);

  // Extract sorted arrays for each round/half
  const leftR32 = sortByMatch(leftHalf.r32 || []);
  const leftR16 = sortByMatch(leftHalf.r16 || []);
  const leftQF = sortByMatch(leftHalf.qf || []);
  const leftSF = sortByMatch(leftHalf.sf || []);

  const rightR32 = sortByMatch(rightHalf.r32 || []);
  const rightR16 = sortByMatch(rightHalf.r16 || []);
  const rightQF = sortByMatch(rightHalf.qf || []);
  const rightSF = sortByMatch(rightHalf.sf || []);

  // Mobile round-by-round data
  const rounds = [
    { key: 'r32', label: 'Round of 32', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'r32')) },
    { key: 'r16', label: 'Round of 16', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'r16')) },
    { key: 'qf', label: 'Quarter-finals', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'qf')) },
    { key: 'sf', label: 'Semi-finals', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'sf')) },
    { key: '3rd', label: 'Third Place', fixtures: knockoutFixtures.filter(f => f.round === '3rd') },
    { key: 'final', label: 'Final', fixtures: knockoutFixtures.filter(f => f.round === 'final') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tournament Bracket</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Round of 32 through to the Final &middot; 32 knockout matches
          </p>
        </div>
        <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
      </div>

      {/* --- Mobile layout: round-by-round vertical scroll --- */}
      <div className="lg:hidden space-y-8">
        {rounds.map((round) => (
          <div key={round.key}>
            <h3
              className={`text-sm font-semibold mb-3 ${
                round.key === 'final'
                  ? 'text-amber-400'
                  : round.key === '3rd'
                  ? 'text-slate-400'
                  : 'text-teal-400'
              }`}
            >
              {round.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {round.fixtures.map((f) => (
                <MatchCard key={f.matchNumber} fixture={f} timezone={timezone} isVenueLocal={isVenueLocal} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- Desktop layout: horizontal bracket tree --- */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="flex gap-4 min-w-max px-4 items-center" style={{ minHeight: '900px' }}>
          {/* Left bracket: R32 -> R16 -> QF -> SF */}
          <RoundColumn
            label="Round of 32"
            fixtures={leftR32}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            gap="gap-2"
          />

          {/* Connector visual */}
          <div className="flex flex-col justify-around gap-2 w-4 flex-shrink-0" style={{ height: '100%' }}>
            {leftR32.map((_, i) =>
              i % 2 === 0 ? (
                <div key={i} className="flex-1 flex items-center">
                  <div className="w-full border-t-2 border-slate-300 dark:border-slate-600" />
                </div>
              ) : null
            )}
          </div>

          <RoundColumn
            label="Round of 16"
            fixtures={leftR16}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            gap="gap-6"
          />

          <div className="flex flex-col justify-around w-4 flex-shrink-0">
            {leftR16.map((_, i) =>
              i % 2 === 0 ? (
                <div key={i} className="flex-1 flex items-center">
                  <div className="w-full border-t-2 border-slate-300 dark:border-slate-600" />
                </div>
              ) : null
            )}
          </div>

          <RoundColumn
            label="Quarter-finals"
            fixtures={leftQF}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            gap="gap-16"
          />

          <div className="flex flex-col justify-around w-4 flex-shrink-0">
            <div className="flex-1 flex items-center">
              <div className="w-full border-t-2 border-slate-300 dark:border-slate-600" />
            </div>
          </div>

          <RoundColumn
            label="Semi-finals"
            fixtures={leftSF}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            gap="gap-0"
          />

          {/* Center: Final + 3rd Place */}
          <div className="flex flex-col items-center justify-center gap-6 px-6 flex-shrink-0 w-52">
            {finalMatch && (
              <div>
                <h4 className="text-xs font-semibold text-center text-amber-400 mb-2">Final</h4>
                <MatchCard fixture={finalMatch} timezone={timezone} isVenueLocal={isVenueLocal} />
              </div>
            )}
            {thirdPlace && (
              <div>
                <h4 className="text-xs font-semibold text-center text-slate-400 mb-2">3rd Place</h4>
                <MatchCard fixture={thirdPlace} timezone={timezone} isVenueLocal={isVenueLocal} />
              </div>
            )}
          </div>

          {/* Right bracket: SF -> QF -> R16 -> R32 (mirrored) */}
          <RoundColumn
            label="Semi-finals"
            fixtures={rightSF}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            gap="gap-0"
          />

          <div className="flex flex-col justify-around w-4 flex-shrink-0">
            <div className="flex-1 flex items-center">
              <div className="w-full border-t-2 border-slate-300 dark:border-slate-600" />
            </div>
          </div>

          <RoundColumn
            label="Quarter-finals"
            fixtures={rightQF}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            gap="gap-16"
          />

          <div className="flex flex-col justify-around w-4 flex-shrink-0">
            {rightR16.map((_, i) =>
              i % 2 === 0 ? (
                <div key={i} className="flex-1 flex items-center">
                  <div className="w-full border-t-2 border-slate-300 dark:border-slate-600" />
                </div>
              ) : null
            )}
          </div>

          <RoundColumn
            label="Round of 16"
            fixtures={rightR16}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            gap="gap-6"
          />

          <div className="flex flex-col justify-around gap-2 w-4 flex-shrink-0" style={{ height: '100%' }}>
            {rightR32.map((_, i) =>
              i % 2 === 0 ? (
                <div key={i} className="flex-1 flex items-center">
                  <div className="w-full border-t-2 border-slate-300 dark:border-slate-600" />
                </div>
              ) : null
            )}
          </div>

          <RoundColumn
            label="Round of 32"
            fixtures={rightR32}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            gap="gap-2"
          />
        </div>
      </div>
    </div>
  );
}

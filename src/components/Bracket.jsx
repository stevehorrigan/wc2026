import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllFixtures, getVenueById, getTeamName, getTeamFlag, getTeamById } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';
import { useTimezone } from '../hooks/useTimezone';
import { useMetaTags } from '../hooks/useMetaTags';
import TimezoneSelector, { VENUE_LOCAL } from './TimezoneSelector';

// ── Compact match card ──────────────────────────────────────────────────────

function TeamRow({ teamId }) {
  const team = getTeamById(teamId);
  const flag = getTeamFlag(teamId);
  const name = getTeamName(teamId);
  const inner = (
    <>
      {flag ? (
        <img src={flag} alt="" className="w-4 h-2.5 object-cover rounded-sm shrink-0" />
      ) : (
        <span className="w-4 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-sm shrink-0 inline-block" />
      )}
      <span className="truncate">{name}</span>
    </>
  );
  if (team) {
    return (
      <Link to={`/team/${teamId}`} className="flex items-center gap-1 hover:text-teal-400 transition-colors">
        {inner}
      </Link>
    );
  }
  return <div className="flex items-center gap-1">{inner}</div>;
}

function MatchCard({ fixture, timezone, isVenueLocal, compact }) {
  const venue = getVenueById(fixture.venue);
  const effectiveTz = isVenueLocal && venue ? venue.timezone : timezone;
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded ${
      compact ? 'px-1.5 py-1 text-[10px] leading-tight' : 'p-2 text-xs'
    }`}>
      <div className="font-medium text-slate-900 dark:text-white">
        <TeamRow teamId={fixture.homeTeam} />
        <TeamRow teamId={fixture.awayTeam} />
      </div>
      <div className={`text-slate-500 dark:text-slate-400 ${compact ? 'text-[8px] mt-0.5' : 'text-[10px] mt-0.5'}`}>
        {formatMatchDate(fixture.date, effectiveTz)}{' · '}
        {formatMatchTime(fixture.date, fixture.timeUTC, effectiveTz)}
        {isVenueLocal && venue && <span className="ml-0.5 text-teal-500">(L)</span>}
        {venue && !compact && (
          <>
            {' · '}
            <Link to={`/venue/${venue.id}`} className="hover:text-teal-400 transition-colors">
              {venue.displayCity}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

// ── Recursive bracket node ──────────────────────────────────────────────────
// Each node renders its two feeder matches (recursively) with CSS bracket
// lines, then its own match card. The tree structure ensures perfect alignment.

const LINE = 'bg-slate-300 dark:bg-slate-600';

function BracketNode({ matchNumber, fixtureMap, timezone, isVenueLocal, side = 'left' }) {
  const fixture = fixtureMap.get(matchNumber);
  if (!fixture) return null;

  // Find feeder matches (W73 → match 73)
  const feeders = [];
  for (const ref of [fixture.homeTeam, fixture.awayTeam]) {
    const m = /^W(\d+)$/.exec(ref);
    if (m) feeders.push(parseInt(m[1], 10));
  }

  const card = (
    <div style={{ width: '138px' }} className="shrink-0">
      <MatchCard fixture={fixture} timezone={timezone} isVenueLocal={isVenueLocal} compact />
    </div>
  );

  // Leaf node (R32) — just the card with padding
  if (feeders.length === 0) {
    return <div className="py-[3px]">{card}</div>;
  }

  // Recursive: render feeders + bracket connector + this card
  // The bracket connector is drawn using 3 absolute-positioned lines:
  //   - horizontal from top feeder center-right to vertical bar
  //   - horizontal from bottom feeder center-right to vertical bar
  //   - vertical connecting the two horizontals
  //   - horizontal from vertical bar midpoint to this card

  const feederTop = (
    <BracketNode
      matchNumber={feeders[0]}
      fixtureMap={fixtureMap}
      timezone={timezone}
      isVenueLocal={isVenueLocal}
      side={side}
    />
  );
  const feederBot = (
    <BracketNode
      matchNumber={feeders[1]}
      fixtureMap={fixtureMap}
      timezone={timezone}
      isVenueLocal={isVenueLocal}
      side={side}
    />
  );

  if (side === 'left') {
    // Feeders on the left, card on the right
    return (
      <div className="flex items-center">
        {/* Feeder column */}
        <div className="flex flex-col">
          {feederTop}
          {feederBot}
        </div>
        {/* Bracket connector: vertical bar + horizontal arms */}
        <div className="relative flex flex-col self-stretch" style={{ width: '10px' }}>
          {/* Top arm: horizontal line at 25% height */}
          <div className="absolute left-0 right-1/2 top-1/4" style={{ height: '1.5px' }}>
            <div className={`h-full w-full ${LINE}`} />
          </div>
          {/* Bottom arm: horizontal line at 75% height */}
          <div className="absolute left-0 right-1/2 bottom-1/4" style={{ height: '1.5px' }}>
            <div className={`h-full w-full ${LINE}`} />
          </div>
          {/* Vertical bar from 25% to 75% */}
          <div className="absolute top-1/4 bottom-1/4 left-1/2" style={{ width: '1.5px' }}>
            <div className={`h-full w-full ${LINE}`} />
          </div>
          {/* Output: horizontal from center to right edge at 50% */}
          <div className="absolute left-1/2 right-0 top-1/2" style={{ height: '1.5px', marginTop: '-0.75px' }}>
            <div className={`h-full w-full ${LINE}`} />
          </div>
        </div>
        {card}
      </div>
    );
  }

  // Right side: card on left, feeders on right (mirrored)
  return (
    <div className="flex items-center">
      {card}
      <div className="relative flex flex-col self-stretch" style={{ width: '10px' }}>
        {/* Top arm */}
        <div className="absolute right-0 left-1/2 top-1/4" style={{ height: '1.5px' }}>
          <div className={`h-full w-full ${LINE}`} />
        </div>
        {/* Bottom arm */}
        <div className="absolute right-0 left-1/2 bottom-1/4" style={{ height: '1.5px' }}>
          <div className={`h-full w-full ${LINE}`} />
        </div>
        {/* Vertical bar */}
        <div className="absolute top-1/4 bottom-1/4 right-1/2" style={{ width: '1.5px' }}>
          <div className={`h-full w-full ${LINE}`} />
        </div>
        {/* Input: horizontal from left edge to center */}
        <div className="absolute right-1/2 left-0 top-1/2" style={{ height: '1.5px', marginTop: '-0.75px' }}>
          <div className={`h-full w-full ${LINE}`} />
        </div>
      </div>
      <div className="flex flex-col">
        {feederTop}
        {feederBot}
      </div>
    </div>
  );
}

// ── Sort helper ─────────────────────────────────────────────────────────────

function sortByMatch(arr) {
  return [...arr].sort((a, b) => a.matchNumber - b.matchNumber);
}

// ── Main component ──────────────────────────────────────────────────────────

export default function Bracket() {
  const { timezone, setTimezone } = useTimezone();
  useMetaTags({ title: 'Tournament Bracket', description: 'World Cup 2026 knockout bracket — Round of 32 to the Final. Full wallchart view with all 32 knockout matches.' });
  const isVenueLocal = timezone === VENUE_LOCAL;
  const allFixtures = getAllFixtures();

  const fixtureMap = useMemo(() => {
    const map = new Map();
    for (const f of allFixtures) map.set(f.matchNumber, f);
    return map;
  }, [allFixtures]);

  const knockoutFixtures = useMemo(() => allFixtures.filter(f => f.round !== 'group'), [allFixtures]);
  const finalMatch = knockoutFixtures.find(f => f.round === 'final');
  const thirdPlace = knockoutFixtures.find(f => f.round === '3rd');

  // Get the two SF match numbers that feed into the final
  const leftSfNum = useMemo(() => {
    if (!finalMatch) return null;
    const m = /^W(\d+)$/.exec(finalMatch.homeTeam);
    return m ? parseInt(m[1], 10) : null;
  }, [finalMatch]);

  const rightSfNum = useMemo(() => {
    if (!finalMatch) return null;
    const m = /^W(\d+)$/.exec(finalMatch.awayTeam);
    return m ? parseInt(m[1], 10) : null;
  }, [finalMatch]);

  // Mobile: round-by-round
  const rounds = useMemo(() => [
    { key: 'r32', label: 'Round of 32', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'r32')) },
    { key: 'r16', label: 'Round of 16', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'r16')) },
    { key: 'qf', label: 'Quarter-finals', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'qf')) },
    { key: 'sf', label: 'Semi-finals', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'sf')) },
    { key: '3rd', label: 'Third Place', fixtures: knockoutFixtures.filter(f => f.round === '3rd') },
    { key: 'final', label: 'Final', fixtures: knockoutFixtures.filter(f => f.round === 'final') },
  ], [knockoutFixtures]);

  return (
    <div className="mx-auto px-2 py-4" style={{ maxWidth: '1800px' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 px-2">
        <div>
          <h1 className="text-xl font-bold">Tournament Bracket</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            32 knockout matches &middot; Round of 32 to Final
          </p>
        </div>
        <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
      </div>

      {/* Mobile: round-by-round */}
      <div className="xl:hidden space-y-6 px-2">
        {rounds.map((round) => (
          <div key={round.key}>
            <h3 className={`text-sm font-semibold mb-2 ${
              round.key === 'final' ? 'text-amber-400' : round.key === '3rd' ? 'text-slate-400' : 'text-teal-400'
            }`}>
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

      {/* Desktop: recursive bracket tree */}
      <div className="hidden xl:flex items-center justify-center gap-0">
        {/* Left half bracket (feeders on left, progressing right to SF) */}
        {leftSfNum && (
          <BracketNode
            matchNumber={leftSfNum}
            fixtureMap={fixtureMap}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            side="left"
          />
        )}

        {/* Connector from left SF to Final */}
        <div className={`w-3 h-[1.5px] ${LINE}`} />

        {/* Center: Final + 3rd Place */}
        <div className="flex flex-col items-center gap-3 px-1 shrink-0" style={{ width: '155px' }}>
          {finalMatch && (
            <div className="w-full">
              <p className="text-[10px] font-bold text-center text-amber-400 mb-1">FINAL</p>
              <MatchCard fixture={finalMatch} timezone={timezone} isVenueLocal={isVenueLocal} compact />
            </div>
          )}
          {thirdPlace && (
            <div className="w-full">
              <p className="text-[10px] font-semibold text-center text-slate-400 mb-1">3RD PLACE</p>
              <MatchCard fixture={thirdPlace} timezone={timezone} isVenueLocal={isVenueLocal} compact />
            </div>
          )}
        </div>

        {/* Connector from Final to right SF */}
        <div className={`w-3 h-[1.5px] ${LINE}`} />

        {/* Right half bracket (feeders on right, progressing left to SF) */}
        {rightSfNum && (
          <BracketNode
            matchNumber={rightSfNum}
            fixtureMap={fixtureMap}
            timezone={timezone}
            isVenueLocal={isVenueLocal}
            side="right"
          />
        )}
      </div>
    </div>
  );
}

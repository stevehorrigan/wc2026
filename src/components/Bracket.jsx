import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllFixtures, getVenueById, getTeamName, getTeamFlag, getTeamById } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';
import { useTimezone } from '../hooks/useTimezone';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import TimezoneSelector, { VENUE_LOCAL } from './TimezoneSelector';

// ── Bracket tree tracing ────────────────────────────────────────────────────

function traceBracketHalf(matchNumber, fixtureMap) {
  const fixture = fixtureMap.get(matchNumber);
  if (!fixture) return {};
  const result = { [fixture.round]: [fixture] };
  for (const ref of [fixture.homeTeam, fixture.awayTeam]) {
    const m = /^W(\d+)$/.exec(ref);
    if (m) {
      const sub = traceBracketHalf(parseInt(m[1], 10), fixtureMap);
      for (const [round, matches] of Object.entries(sub)) {
        result[round] = (result[round] || []).concat(matches);
      }
    }
  }
  return result;
}

function sortByMatch(arr) {
  return [...arr].sort((a, b) => a.matchNumber - b.matchNumber);
}

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
        <span className="w-4 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-sm shrink-0" />
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
    } w-full`}>
      <div className={`font-medium text-slate-900 dark:text-white ${compact ? 'space-y-0' : 'space-y-0.5'}`}>
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

// ── SVG connector lines ─────────────────────────────────────────────────────

function Connectors({ count, direction = 'right' }) {
  // Each connector bridges a pair of matches → 1 output
  // count = number of pairs (e.g., 4 pairs of R32 → 4 R16 matches)
  const pairs = count;
  const pairHeight = 100 / pairs;

  return (
    <svg className="w-5 shrink-0" viewBox={`0 0 20 ${pairs * 40}`} preserveAspectRatio="none" style={{ height: '100%' }}>
      {Array.from({ length: pairs }).map((_, i) => {
        const top = i * 40 + 8;
        const bot = i * 40 + 32;
        const mid = (top + bot) / 2;
        const stroke = 'currentColor';
        if (direction === 'right') {
          return (
            <g key={i} className="text-slate-300 dark:text-slate-600">
              <line x1="0" y1={top} x2="10" y2={top} stroke={stroke} strokeWidth="1.5" />
              <line x1="0" y1={bot} x2="10" y2={bot} stroke={stroke} strokeWidth="1.5" />
              <line x1="10" y1={top} x2="10" y2={bot} stroke={stroke} strokeWidth="1.5" />
              <line x1="10" y1={mid} x2="20" y2={mid} stroke={stroke} strokeWidth="1.5" />
            </g>
          );
        }
        return (
          <g key={i} className="text-slate-300 dark:text-slate-600">
            <line x1="20" y1={top} x2="10" y2={top} stroke={stroke} strokeWidth="1.5" />
            <line x1="20" y1={bot} x2="10" y2={bot} stroke={stroke} strokeWidth="1.5" />
            <line x1="10" y1={top} x2="10" y2={bot} stroke={stroke} strokeWidth="1.5" />
            <line x1="10" y1={mid} x2="0" y2={mid} stroke={stroke} strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

// ── Round column using CSS Grid for proper alignment ────────────────────────

function RoundCol({ matches, timezone, isVenueLocal, roundSpan }) {
  // roundSpan: how many grid rows each match occupies (R32=1, R16=2, QF=4, SF=8)
  return (
    <div className="flex flex-col justify-around h-full gap-0" style={{ minWidth: '140px', maxWidth: '160px' }}>
      {matches.map((f) => (
        <div key={f.matchNumber} className="flex items-center" style={{ flex: roundSpan }}>
          <MatchCard fixture={f} timezone={timezone} isVenueLocal={isVenueLocal} compact />
        </div>
      ))}
    </div>
  );
}

// ── Desktop bracket ─────────────────────────────────────────────────────────

function DesktopBracket({ leftR32, leftR16, leftQF, leftSF, rightR32, rightR16, rightQF, rightSF, finalMatch, thirdPlace, timezone, isVenueLocal }) {
  return (
    <div className="hidden xl:flex items-stretch" style={{ height: 'calc(100vh - 140px)', minHeight: '700px' }}>
      {/* Left half: R32 → R16 → QF → SF */}
      <RoundCol matches={leftR32} timezone={timezone} isVenueLocal={isVenueLocal} roundSpan={1} />
      <div className="flex items-stretch shrink-0"><Connectors count={4} direction="right" /></div>
      <RoundCol matches={leftR16} timezone={timezone} isVenueLocal={isVenueLocal} roundSpan={2} />
      <div className="flex items-stretch shrink-0"><Connectors count={2} direction="right" /></div>
      <RoundCol matches={leftQF} timezone={timezone} isVenueLocal={isVenueLocal} roundSpan={4} />
      <div className="flex items-stretch shrink-0"><Connectors count={1} direction="right" /></div>
      <RoundCol matches={leftSF} timezone={timezone} isVenueLocal={isVenueLocal} roundSpan={8} />

      {/* Center: Final + 3rd Place */}
      <div className="flex flex-col items-center justify-center gap-3 px-3 shrink-0" style={{ minWidth: '160px', maxWidth: '170px' }}>
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

      {/* Right half: SF → QF → R16 → R32 */}
      <RoundCol matches={rightSF} timezone={timezone} isVenueLocal={isVenueLocal} roundSpan={8} />
      <div className="flex items-stretch shrink-0"><Connectors count={1} direction="left" /></div>
      <RoundCol matches={rightQF} timezone={timezone} isVenueLocal={isVenueLocal} roundSpan={4} />
      <div className="flex items-stretch shrink-0"><Connectors count={2} direction="left" /></div>
      <RoundCol matches={rightR16} timezone={timezone} isVenueLocal={isVenueLocal} roundSpan={2} />
      <div className="flex items-stretch shrink-0"><Connectors count={4} direction="left" /></div>
      <RoundCol matches={rightR32} timezone={timezone} isVenueLocal={isVenueLocal} roundSpan={1} />
    </div>
  );
}

// ── Round headers for desktop ───────────────────────────────────────────────

function RoundHeaders() {
  const rounds = ['R32', 'R16', 'QF', 'SF', 'Final', 'SF', 'QF', 'R16', 'R32'];
  return (
    <div className="hidden xl:flex items-center mb-2">
      {rounds.map((label, i) => (
        <div
          key={`${label}-${i}`}
          className={`text-[10px] font-semibold text-center uppercase tracking-wider shrink-0 ${
            label === 'Final' ? 'text-amber-400' : 'text-teal-500'
          }`}
          style={{
            minWidth: label === 'Final' ? '160px' : '140px',
            maxWidth: label === 'Final' ? '170px' : '160px',
            flex: label === 'Final' ? undefined : 1,
            // Add space for connectors
            ...(i < 8 && label !== 'Final' ? { marginRight: '20px' } : {}),
            ...(i > 0 && label !== 'Final' ? { marginLeft: i === 5 ? '0' : '0' } : {}),
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function Bracket() {
  const { timezone, setTimezone } = useTimezone();
  useDocumentTitle('Tournament Bracket');
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

  const { leftHalf, rightHalf } = useMemo(() => {
    if (!finalMatch) return { leftHalf: {}, rightHalf: {} };
    const homeM = /^W(\d+)$/.exec(finalMatch.homeTeam);
    const awayM = /^W(\d+)$/.exec(finalMatch.awayTeam);
    const left = homeM ? traceBracketHalf(parseInt(homeM[1], 10), fixtureMap) : {};
    const right = awayM ? traceBracketHalf(parseInt(awayM[1], 10), fixtureMap) : {};
    return { leftHalf: left, rightHalf: right };
  }, [finalMatch, fixtureMap]);

  const leftR32 = sortByMatch(leftHalf.r32 || []);
  const leftR16 = sortByMatch(leftHalf.r16 || []);
  const leftQF = sortByMatch(leftHalf.qf || []);
  const leftSF = sortByMatch(leftHalf.sf || []);
  const rightR32 = sortByMatch(rightHalf.r32 || []);
  const rightR16 = sortByMatch(rightHalf.r16 || []);
  const rightQF = sortByMatch(rightHalf.qf || []);
  const rightSF = sortByMatch(rightHalf.sf || []);

  const rounds = [
    { key: 'r32', label: 'Round of 32', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'r32')) },
    { key: 'r16', label: 'Round of 16', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'r16')) },
    { key: 'qf', label: 'Quarter-finals', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'qf')) },
    { key: 'sf', label: 'Semi-finals', fixtures: sortByMatch(knockoutFixtures.filter(f => f.round === 'sf')) },
    { key: '3rd', label: 'Third Place', fixtures: knockoutFixtures.filter(f => f.round === '3rd') },
    { key: 'final', label: 'Final', fixtures: knockoutFixtures.filter(f => f.round === 'final') },
  ];

  return (
    <div className="mx-auto px-2 py-4" style={{ maxWidth: '1600px' }}>
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

      {/* Desktop: full bracket */}
      <DesktopBracket
        leftR32={leftR32} leftR16={leftR16} leftQF={leftQF} leftSF={leftSF}
        rightR32={rightR32} rightR16={rightR16} rightQF={rightQF} rightSF={rightSF}
        finalMatch={finalMatch} thirdPlace={thirdPlace}
        timezone={timezone} isVenueLocal={isVenueLocal}
      />
    </div>
  );
}

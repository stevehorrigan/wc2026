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

// ── CSS connector lines (uses same flex layout as round columns) ────────────

const BORDER = 'border-slate-300 dark:border-slate-600';

function ConnectorPair({ direction = 'right', span }) {
  // A single bracket connector: two inputs → one output
  // Uses CSS borders so it aligns perfectly with flex siblings
  if (direction === 'right') {
    return (
      <div className="flex flex-col" style={{ flex: span }}>
        {/* Top half: bottom-right corner */}
        <div className={`flex-1 border-r border-b ${BORDER}`} />
        {/* Bottom half: top-right corner, with output line */}
        <div className={`flex-1 border-r border-t ${BORDER}`} />
      </div>
    );
  }
  return (
    <div className="flex flex-col" style={{ flex: span }}>
      <div className={`flex-1 border-l border-b ${BORDER}`} />
      <div className={`flex-1 border-l border-t ${BORDER}`} />
    </div>
  );
}

function Connectors({ count, direction = 'right', span }) {
  // count: number of connector pairs (R32→R16: 4 pairs, R16→QF: 2, QF→SF: 1)
  // span: flex value per pair (matches the next round's flex per match)
  return (
    <div className="flex flex-col w-3 shrink-0 h-full">
      {Array.from({ length: count }).map((_, i) => (
        <ConnectorPair key={i} direction={direction} span={span} />
      ))}
    </div>
  );
}

// Output lines from connector column to next round
function OutputLines({ count, span }) {
  return (
    <div className="flex flex-col w-2 shrink-0 h-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center" style={{ flex: span }}>
          <div className={`w-full border-t ${BORDER}`} />
        </div>
      ))}
    </div>
  );
}

// Input lines from round column into connector
function InputLines({ count, span }) {
  return (
    <div className="flex flex-col w-2 shrink-0 h-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center" style={{ flex: span }}>
          <div className={`w-full border-t ${BORDER}`} />
        </div>
      ))}
    </div>
  );
}

// ── Round column ────────────────────────────────────────────────────────────

function RoundCol({ matches, timezone, isVenueLocal, span }) {
  return (
    <div className="flex flex-col h-full" style={{ minWidth: '135px', maxWidth: '155px' }}>
      {matches.map((f) => (
        <div key={f.matchNumber} className="flex items-center px-0.5" style={{ flex: span }}>
          <MatchCard fixture={f} timezone={timezone} isVenueLocal={isVenueLocal} compact />
        </div>
      ))}
    </div>
  );
}

// ── Connector group: input lines + bracket + output lines ───────────────────

function ConnectorGroup({ inputCount, inputSpan, pairCount, pairSpan, outputCount, outputSpan, direction }) {
  return (
    <div className="flex items-stretch shrink-0 h-full">
      <InputLines count={inputCount} span={inputSpan} />
      <Connectors count={pairCount} direction={direction} span={pairSpan} />
      <OutputLines count={outputCount} span={outputSpan} />
    </div>
  );
}

// ── Desktop bracket ─────────────────────────────────────────────────────────

function DesktopBracket({ leftR32, leftR16, leftQF, leftSF, rightR32, rightR16, rightQF, rightSF, finalMatch, thirdPlace, timezone, isVenueLocal }) {
  // Flex spans: R32=1, R16=2, QF=4, SF=8
  // Connectors bridge pairs: input lines use source span, bracket pairs use dest span, output lines use dest span
  return (
    <div className="hidden xl:flex items-stretch" style={{ height: 'calc(100vh - 130px)', minHeight: '700px' }}>
      {/* Left half: R32 → R16 → QF → SF */}
      <RoundCol matches={leftR32} timezone={timezone} isVenueLocal={isVenueLocal} span={1} />
      <ConnectorGroup inputCount={8} inputSpan={1} pairCount={4} pairSpan={2} outputCount={4} outputSpan={2} direction="right" />
      <RoundCol matches={leftR16} timezone={timezone} isVenueLocal={isVenueLocal} span={2} />
      <ConnectorGroup inputCount={4} inputSpan={2} pairCount={2} pairSpan={4} outputCount={2} outputSpan={4} direction="right" />
      <RoundCol matches={leftQF} timezone={timezone} isVenueLocal={isVenueLocal} span={4} />
      <ConnectorGroup inputCount={2} inputSpan={4} pairCount={1} pairSpan={8} outputCount={1} outputSpan={8} direction="right" />
      <RoundCol matches={leftSF} timezone={timezone} isVenueLocal={isVenueLocal} span={8} />

      {/* Center: lines in → Final/3rd → lines out */}
      <InputLines count={1} span={8} />
      <div className="flex flex-col items-center justify-center gap-3 px-2 shrink-0" style={{ minWidth: '155px', maxWidth: '165px' }}>
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
      <InputLines count={1} span={8} />

      {/* Right half: SF → QF → R16 → R32 */}
      <RoundCol matches={rightSF} timezone={timezone} isVenueLocal={isVenueLocal} span={8} />
      <ConnectorGroup inputCount={1} inputSpan={8} pairCount={1} pairSpan={8} outputCount={2} outputSpan={4} direction="left" />
      <RoundCol matches={rightQF} timezone={timezone} isVenueLocal={isVenueLocal} span={4} />
      <ConnectorGroup inputCount={2} inputSpan={4} pairCount={2} pairSpan={4} outputCount={4} outputSpan={2} direction="left" />
      <RoundCol matches={rightR16} timezone={timezone} isVenueLocal={isVenueLocal} span={2} />
      <ConnectorGroup inputCount={4} inputSpan={2} pairCount={4} pairSpan={2} outputCount={8} outputSpan={1} direction="left" />
      <RoundCol matches={rightR32} timezone={timezone} isVenueLocal={isVenueLocal} span={1} />
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

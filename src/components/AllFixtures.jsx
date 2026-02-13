import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllFixtures, getFixturesByDate, getVenueById, getTeamName, getTeamFlag, getTeamById, getRoundLabel } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';
import { useTimezone } from '../hooks/useTimezone';
import TimezoneSelector from './TimezoneSelector';

const ROUND_OPTIONS = [
  { value: 'all', label: 'All Rounds' },
  { value: 'group', label: 'Group Stage' },
  { value: 'r32', label: 'Round of 32' },
  { value: 'r16', label: 'Round of 16' },
  { value: 'qf', label: 'Quarter-finals' },
  { value: 'sf', label: 'Semi-finals' },
  { value: '3rd', label: 'Third Place' },
  { value: 'final', label: 'Final' },
];

function TeamLabel({ teamId }) {
  const team = getTeamById(teamId);
  const flag = getTeamFlag(teamId);
  const name = getTeamName(teamId);

  const inner = (
    <span className="inline-flex items-center gap-1.5">
      {flag ? (
        <img src={flag} alt="" className="w-5 h-3.5 object-cover rounded-sm inline-block" />
      ) : (
        <span className="w-5 h-3.5 bg-slate-700 rounded-sm inline-block" />
      )}
      <span>{name}</span>
    </span>
  );

  if (team) {
    return (
      <Link to={`/team/${teamId}`} className="hover:text-teal-400 transition-colors">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function AllFixtures() {
  const { timezone, setTimezone } = useTimezone();
  const [roundFilter, setRoundFilter] = useState('all');

  const allFixtures = getAllFixtures();
  const filtered = roundFilter === 'all'
    ? allFixtures
    : allFixtures.filter(f => f.round === roundFilter);

  const grouped = getFixturesByDate(filtered);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">All Fixtures</h1>
        <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
      </div>

      {/* Round filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ROUND_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRoundFilter(opt.value)}
            className={`px-3 py-1 text-sm rounded-full transition-colors cursor-pointer
              ${roundFilter === opt.value
                ? 'bg-teal-600 text-white'
                : 'bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Fixtures grouped by date */}
      <div className="space-y-6">
        {grouped.map(([date, dayFixtures]) => (
          <div key={date}>
            <h2 className="text-sm font-semibold text-teal-400 mb-3 sticky top-0 bg-white dark:bg-[var(--color-dark-bg)] py-1 z-10">
              {formatMatchDate(date, timezone)} · {date}
            </h2>
            <div className="space-y-2">
              {dayFixtures.map((fixture) => {
                const venue = getVenueById(fixture.venue);
                const badge = fixture.group
                  ? `Group ${fixture.group}`
                  : getRoundLabel(fixture.round);

                return (
                  <div
                    key={fixture.matchNumber}
                    className="flex items-center gap-3 bg-slate-800/30 border border-slate-700/30 rounded-lg px-4 py-3 text-sm"
                  >
                    <span className="text-base font-mono text-white w-12 shrink-0">
                      {formatMatchTime(fixture.date, fixture.timeUTC, timezone)}
                    </span>
                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <TeamLabel teamId={fixture.homeTeam} />
                      <span className="text-slate-500">v</span>
                      <TeamLabel teamId={fixture.awayTeam} />
                    </div>
                    <span className="text-xs text-slate-500 hidden sm:inline shrink-0">
                      {venue?.displayCity}
                    </span>
                    <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded shrink-0">
                      {badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {grouped.length === 0 && (
        <p className="text-center text-slate-500 mt-8">No fixtures match this filter.</p>
      )}
    </div>
  );
}

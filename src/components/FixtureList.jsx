import { Link } from 'react-router-dom';
import { getTeamById, getVenueById, getTeamName, getTeamFlag, getRoundLabel } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';
import { VENUE_LOCAL } from './TimezoneSelector';

function TeamDisplay({ teamId, isHighlighted }) {
  const flag = getTeamFlag(teamId);
  const name = getTeamName(teamId);

  return (
    <div className={`flex items-center gap-2 ${isHighlighted ? 'font-semibold text-teal-400' : ''}`}>
      {flag ? (
        <img src={flag} alt="" className="w-6 h-4 object-cover rounded-sm" />
      ) : (
        <div className="w-6 h-4 bg-slate-200 dark:bg-slate-700 rounded-sm" />
      )}
      <span className="text-sm">{name}</span>
    </div>
  );
}

export default function FixtureList({ fixtures, teamId, timezone }) {
  if (!fixtures || fixtures.length === 0) {
    return <p className="text-slate-500 text-sm">No fixtures found.</p>;
  }

  const isVenueLocal = timezone === VENUE_LOCAL;

  return (
    <div className="space-y-3">
      {fixtures.map((fixture) => {
        const venue = getVenueById(fixture.venue);
        const effectiveTz = isVenueLocal && venue ? venue.timezone : timezone;
        const roundLabel = fixture.group
          ? `Group ${fixture.group} · Matchday ${fixture.matchday}`
          : getRoundLabel(fixture.round);

        return (
          <div
            key={fixture.matchNumber}
            className="bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-teal-400 font-medium">{roundLabel}</span>
              <span className="text-xs text-slate-500">Match {fixture.matchNumber}</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <TeamDisplay teamId={fixture.homeTeam} isHighlighted={fixture.homeTeam === teamId} />
              </div>
              <div className="px-4 text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatMatchTime(fixture.date, fixture.timeUTC, effectiveTz)}
                </div>
                <div className="text-xs text-slate-400">
                  {formatMatchDate(fixture.date, effectiveTz)}
                  {isVenueLocal && venue && (
                    <span className="ml-1 text-teal-500 dark:text-teal-400">(local)</span>
                  )}
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <TeamDisplay teamId={fixture.awayTeam} isHighlighted={fixture.awayTeam === teamId} />
              </div>
            </div>

            {venue && (
              <div className="text-xs text-slate-500 text-center">
                <Link to={`/venue/${venue.id}`} className="hover:text-teal-400 transition-colors">
                  {venue.name} · {venue.displayCity}
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

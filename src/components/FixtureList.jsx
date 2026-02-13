import { getTeamById, getVenueById, getTeamName, getTeamFlag, getRoundLabel } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';

function TeamDisplay({ teamId, isHighlighted }) {
  const flag = getTeamFlag(teamId);
  const name = getTeamName(teamId);

  return (
    <div className={`flex items-center gap-2 ${isHighlighted ? 'font-semibold text-teal-400' : ''}`}>
      {flag ? (
        <img src={flag} alt="" className="w-6 h-4 object-cover rounded-sm" />
      ) : (
        <div className="w-6 h-4 bg-slate-700 rounded-sm" />
      )}
      <span className="text-sm">{name}</span>
    </div>
  );
}

export default function FixtureList({ fixtures, teamId, timezone }) {
  if (!fixtures || fixtures.length === 0) {
    return <p className="text-slate-500 text-sm">No fixtures found.</p>;
  }

  return (
    <div className="space-y-3">
      {fixtures.map((fixture) => {
        const venue = getVenueById(fixture.venue);
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
                <div className="text-lg font-bold text-white">
                  {formatMatchTime(fixture.date, fixture.timeUTC, timezone)}
                </div>
                <div className="text-xs text-slate-400">
                  {formatMatchDate(fixture.date, timezone)}
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <TeamDisplay teamId={fixture.awayTeam} isHighlighted={fixture.awayTeam === teamId} />
              </div>
            </div>

            {venue && (
              <div className="text-xs text-slate-500 text-center">
                {venue.name} · {venue.displayCity}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

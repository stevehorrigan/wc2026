import { Link } from 'react-router-dom';
import { getGroupTeams, getGroupFixtures, getVenueById, getTeamName, getTeamFlag } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';
import { VENUE_LOCAL } from './TimezoneSelector';

export default function GroupTable({ group, teamId, timezone }) {
  const teams = getGroupTeams(group);
  const fixtures = getGroupFixtures(group);
  const isVenueLocal = timezone === VENUE_LOCAL;

  const matchdays = [1, 2, 3];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Group {group}</h3>

      {/* Team list */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              <th className="text-left py-2 px-3">Team</th>
              <th className="text-right py-2 px-3">FIFA Rank</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr
                key={team.id}
                className={`border-b border-slate-200 dark:border-slate-700/50 last:border-0
                  ${team.id === teamId ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
              >
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    {team.flagUrl ? (
                      <img src={team.flagUrl} alt="" className="w-6 h-4 object-cover rounded-sm" />
                    ) : (
                      <div className="w-6 h-4 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                    )}
                    <span className={team.id === teamId ? 'text-teal-400 font-medium' : ''}>
                      {team.name}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400">
                  {team.fifaRanking ? `#${team.fifaRanking}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Group fixtures by matchday */}
      {matchdays.map((md) => {
        const mdFixtures = fixtures.filter(f => f.matchday === md);
        if (mdFixtures.length === 0) return null;

        return (
          <div key={md}>
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Matchday {md}</h4>
            <div className="space-y-2">
              {mdFixtures.map((fixture) => {
                const venue = getVenueById(fixture.venue);
                const effectiveTz = isVenueLocal && venue ? venue.timezone : timezone;
                const homeFlag = getTeamFlag(fixture.homeTeam);
                const awayFlag = getTeamFlag(fixture.awayTeam);

                return (
                  <div
                    key={fixture.matchNumber}
                    className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded px-3 py-2 text-sm"
                  >
                    <span className="text-xs text-slate-500 w-16 shrink-0">
                      {formatMatchDate(fixture.date, effectiveTz)}
                    </span>
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300 shrink-0">
                      {formatMatchTime(fixture.date, fixture.timeUTC, effectiveTz)}
                      {isVenueLocal && venue && (
                        <span className="ml-1 text-teal-500 dark:text-teal-400 font-normal text-[10px]">(local)</span>
                      )}
                    </span>
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {homeFlag && <img src={homeFlag} alt="" className="w-4 h-3 object-cover rounded-sm" />}
                      <span className={fixture.homeTeam === teamId ? 'text-teal-400 font-medium' : ''}>
                        {getTeamName(fixture.homeTeam)}
                      </span>
                      <span className="text-slate-500 mx-1">v</span>
                      {awayFlag && <img src={awayFlag} alt="" className="w-4 h-3 object-cover rounded-sm" />}
                      <span className={fixture.awayTeam === teamId ? 'text-teal-400 font-medium' : ''}>
                        {getTeamName(fixture.awayTeam)}
                      </span>
                    </div>
                    {venue && (
                      <Link to={`/venue/${venue.id}`} className="text-xs text-slate-500 hover:text-teal-400 transition-colors hidden sm:inline">
                        {venue.displayCity}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

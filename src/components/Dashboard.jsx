import { useParams, Link } from 'react-router-dom';
import { getTeamById, getTeamFixtures } from '../utils/fixtures';
import { useTimezone } from '../hooks/useTimezone';
import { useMetaTags } from '../hooks/useMetaTags';
import TimezoneSelector from './TimezoneSelector';
import FixtureList from './FixtureList';
import FixtureMap from './FixtureMap';
import GroupTable from './GroupTable';
import CalendarExport from './CalendarExport';
import KnockoutPath from './KnockoutPath';

export default function Dashboard({ isDark }) {
  const { teamId } = useParams();
  const { timezone, setTimezone } = useTimezone();
  const team = getTeamById(teamId);
  useMetaTags(team ? {
    title: team.name + ' Fixtures & Schedule',
    description: `${team.name} World Cup 2026 fixtures, kick-off times, group stage schedule, squad, and venue map. Group ${team.group}.`,
  } : { title: 'Team Not Found' });

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold mb-4">Team not found</h2>
        <Link to="/" className="text-teal-400 hover:underline">← Pick a team</Link>
      </div>
    );
  }

  const fixtures = getTeamFixtures(teamId);
  const groupFixtures = fixtures.filter(f => f.round === 'group');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Team header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-600 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-sm">← Teams</Link>
          {team.flagUrl && (
            <img src={team.flagUrl} alt={`${team.name} flag`} className="w-16 h-10 object-cover rounded shadow" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Group {team.group} · FIFA #{team.fifaRanking} · {team.confederation}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
          <CalendarExport fixtures={groupFixtures} teamId={teamId} />
          <Link
            to={`/team/${teamId}/squad`}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600
                       text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
          >
            View Squad
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: fixtures + knockout path */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Fixtures</h2>
            <FixtureList fixtures={groupFixtures} teamId={teamId} timezone={timezone} />
          </div>

          <KnockoutPath group={team.group} timezone={timezone} />
        </div>

        {/* Right column: map + group */}
        <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
          <div>
            <h2 className="text-lg font-semibold mb-3">Venues</h2>
            <FixtureMap
              fixtures={groupFixtures}
              teamId={teamId}
              timezone={timezone}
              isDark={isDark}
            />
          </div>

          <GroupTable group={team.group} teamId={teamId} timezone={timezone} />
        </div>
      </div>
    </div>
  );
}

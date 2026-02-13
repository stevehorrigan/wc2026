import { useParams, Link, useOutletContext } from 'react-router-dom';
import { getTeamById } from '../utils/fixtures';
import squads from '../data/squads.json';

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'];
const POSITION_LABELS = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
};

function groupByPosition(players) {
  const groups = {};
  for (const pos of POSITION_ORDER) {
    groups[pos] = [];
  }
  for (const player of players) {
    const pos = POSITION_ORDER.includes(player.position) ? player.position : 'MID';
    groups[pos].push(player);
  }
  return groups;
}

function PositionGroup({ position, players }) {
  if (players.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        {POSITION_LABELS[position]} ({players.length})
      </h3>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Club</th>
              <th className="py-2 pr-4 font-medium text-center">Age</th>
              <th className="py-2 pr-4 font-medium text-center">Caps</th>
              <th className="py-2 font-medium text-center">Goals</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, idx) => (
              <tr
                key={player.name + idx}
                className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400 tabular-nums">
                  {player.number || '—'}
                </td>
                <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-white">
                  {player.name}
                </td>
                <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">
                  {player.club || '—'}
                </td>
                <td className="py-2.5 pr-4 text-center tabular-nums text-slate-700 dark:text-slate-300">
                  {player.age ?? '—'}
                </td>
                <td className="py-2.5 pr-4 text-center tabular-nums text-slate-700 dark:text-slate-300">
                  {player.caps ?? '—'}
                </td>
                <td className="py-2.5 text-center tabular-nums text-slate-700 dark:text-slate-300">
                  {player.goals ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {players.map((player, idx) => (
          <div
            key={player.name + idx}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-900 dark:text-white">{player.name}</span>
              {player.number && (
                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  #{player.number}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{player.club || 'Club TBD'}</p>
            <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              {player.age != null && <span>Age: {player.age}</span>}
              {player.caps != null && <span>Caps: {player.caps}</span>}
              {player.goals != null && <span>Goals: {player.goals}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SquadPage() {
  const { teamId } = useParams();
  const { isDark } = useOutletContext();
  const team = getTeamById(teamId);

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Team not found</h2>
        <Link to="/" className="text-teal-400 hover:underline">Pick a team</Link>
      </div>
    );
  }

  const squad = squads[teamId];
  const players = squad?.players || [];
  const manager = squad?.manager || null;
  const status = squad?.status || null;
  const lastUpdated = squad?.lastUpdated || null;
  const grouped = groupByPosition(players);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        to={`/team/${teamId}`}
        className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        &larr; Back to {team.name}
      </Link>

      {/* Team header */}
      <div className="flex items-center gap-4 mb-6">
        {team.flagUrl && (
          <img
            src={team.flagUrl}
            alt={`${team.name} flag`}
            className="w-16 h-10 object-cover rounded shadow"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{team.name} Squad</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            {manager && <span>Manager: {manager}</span>}
            {status && (
              <span className="inline-flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'confirmed'
                      ? 'bg-green-500'
                      : status === 'preliminary'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                  }`}
                />
                {status === 'confirmed' ? 'Confirmed' : status === 'preliminary' ? 'Preliminary' : 'TBD'}
              </span>
            )}
            {lastUpdated && <span>Updated: {lastUpdated}</span>}
          </div>
        </div>
      </div>

      {/* Squad content */}
      {players.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Squad not yet announced
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Official squads for the 2026 FIFA World Cup will be announced closer to the tournament.
            {manager && <> {team.name} are managed by <strong>{manager}</strong>.</>}
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {players.length} player{players.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          {POSITION_ORDER.map(pos => (
            <PositionGroup key={pos} position={pos} players={grouped[pos]} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
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

const TIER_CONFIG = {
  core: { label: 'Core Squad', description: 'Current squad and recent call-ups', defaultOpen: true },
  extended: { label: 'Extended Pool', description: 'Fringe players called up in last 1-2 years', defaultOpen: false },
  potential: { label: 'Potentials', description: 'Wider pool and emerging talents', defaultOpen: false },
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

function PlayerTable({ players }) {
  if (players.length === 0) return null;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Name</th>
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
            className="bg-white dark:bg-slate-800/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-900 dark:text-white">{player.name}</span>
              {player.number && (
                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  #{player.number}
                </span>
              )}
            </div>
            <div className="flex gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
              {player.age != null && <span>Age: {player.age}</span>}
              {player.caps != null && <span>Caps: {player.caps}</span>}
              {player.goals != null && <span>Goals: {player.goals}</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PositionGroup({ position, players }) {
  if (players.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {POSITION_LABELS[position]} ({players.length})
      </h4>
      <PlayerTable players={players} />
    </div>
  );
}

function TierSection({ tier, players }) {
  const config = TIER_CONFIG[tier];
  const [isOpen, setIsOpen] = useState(config.defaultOpen);
  const grouped = groupByPosition(players);

  if (players.length === 0) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {config.label}
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
              ({players.length})
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{config.description}</p>
        </div>
        <span className={`text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-4">
          {POSITION_ORDER.map(pos => (
            <PositionGroup key={pos} position={pos} players={grouped[pos]} />
          ))}
        </div>
      )}
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

  // Split by tier
  const core = players.filter(p => p.tier === 'core' || !p.tier);
  const extended = players.filter(p => p.tier === 'extended');
  const potential = players.filter(p => p.tier === 'potential');
  const hasTiers = extended.length > 0 || potential.length > 0;

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
            <span>{players.length} player{players.length !== 1 ? 's' : ''} tracked</span>
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
      ) : hasTiers ? (
        <div className="space-y-4">
          <TierSection tier="core" players={core} />
          <TierSection tier="extended" players={extended} />
          <TierSection tier="potential" players={potential} />
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-6">
          {POSITION_ORDER.map(pos => {
            const grouped = groupByPosition(players);
            return <PositionGroup key={pos} position={pos} players={grouped[pos]} />;
          })}
        </div>
      )}

      {/* Disclaimer */}
      {players.length > 0 && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center">
          Squad data sourced from API-Football. Preliminary squads based on recent call-ups. Final squads announced May 2026.
        </p>
      )}
    </div>
  );
}

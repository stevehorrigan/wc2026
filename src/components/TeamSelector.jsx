import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTeams } from '../utils/fixtures';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function TeamSelector() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const teams = getAllTeams();
  useDocumentTitle('Pick Your Team');

  const savedTeam = localStorage.getItem('wc2026-team');

  const filtered = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (teamId) => {
    localStorage.setItem('wc2026-team', teamId);
    navigate(`/team/${teamId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">
        World Cup 2026
      </h1>
      <p className="text-center text-slate-400 mb-8">
        Pick your team to get started
      </p>

      {savedTeam && (
        <div className="mb-6 text-center">
          <button
            onClick={() => handleSelect(savedTeam)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm
                       font-medium transition-colors cursor-pointer"
          >
            Continue with {teams.find(t => t.id === savedTeam)?.name || savedTeam} →
          </button>
        </div>
      )}

      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900
                     dark:bg-slate-800 dark:border-slate-700 dark:text-white
                     placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500
                     focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((team) => (
          <button
            key={team.id}
            onClick={() => handleSelect(team.id)}
            disabled={!team.qualified}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all cursor-pointer
              ${
                team.qualified
                  ? 'border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 active:scale-95'
                  : 'border-slate-200 dark:border-slate-800 opacity-40 cursor-not-allowed'
              }`}
          >
            {team.flagUrl ? (
              <img
                src={team.flagUrl}
                alt={`${team.name} flag`}
                className="w-12 h-8 object-cover rounded shadow-sm"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                TBD
              </div>
            )}
            <span className="text-sm font-medium text-center leading-tight">
              {team.name}
            </span>
            {team.fifaRanking && (
              <span className="text-xs text-slate-500">#{team.fifaRanking}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-500 mt-8">No teams match your search.</p>
      )}
    </div>
  );
}

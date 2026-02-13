import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getKnockoutPaths, getRoundName } from '../utils/knockout';
import { formatMatchDate, formatMatchTime } from '../utils/timezone';

function PathStep({ step, timezone, isLast }) {
  return (
    <div className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${
          step.round === 'final' ? 'bg-amber-500' : 'bg-teal-500'
        }`} />
        {!isLast && <div className="w-0.5 flex-1 bg-slate-300 dark:bg-slate-600" />}
      </div>

      {/* Step content */}
      <div className={`pb-4 ${isLast ? '' : 'pb-5'}`}>
        <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide">
          {getRoundName(step.round)}
        </p>
        <p className="font-medium text-sm text-slate-900 dark:text-white">
          {step.opponent ? (
            <>vs {step.opponent.label}</>
          ) : (
            'TBD'
          )}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatMatchDate(step.date, timezone)}</span>
          <span>{formatMatchTime(step.date, step.timeUTC, timezone)}</span>
          <Link
            to={`/venue/${step.venueId}`}
            className="text-teal-500 hover:text-teal-400 hover:underline"
          >
            {step.venue}{step.venueCity ? `, ${step.venueCity}` : ''}
          </Link>
        </div>
      </div>
    </div>
  );
}

function PathTimeline({ path, timezone }) {
  if (!path || path.length === 0) return null;

  return (
    <div className="pl-1">
      {path.map((step, i) => (
        <PathStep
          key={step.matchNumber}
          step={step}
          timezone={timezone}
          isLast={i === path.length - 1}
        />
      ))}
    </div>
  );
}

function ThirdPlaceScenarios({ scenarios, timezone }) {
  if (!scenarios || scenarios.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 italic">
        No third-place bracket paths found for this group.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        If your team finishes as one of the 8 best third-placed teams, they could face:
      </p>
      {scenarios.map((scenario, i) => (
        <div
          key={scenario.r32Match}
          className="bg-slate-100/50 dark:bg-slate-700/30 rounded-lg p-3"
        >
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
            Scenario {i + 1}
          </p>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            vs {scenario.opponent?.label || 'TBD'}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{formatMatchDate(scenario.date, timezone)}</span>
            {scenario.venue && (
              <Link
                to={`/venue/${scenario.venue.id}`}
                className="text-teal-500 hover:text-teal-400 hover:underline"
              >
                {scenario.venue.name}, {scenario.venue.displayCity}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { key: 'first', label: '1st Place', badge: 'Group Winner' },
  { key: 'second', label: '2nd Place', badge: 'Runner-up' },
  { key: 'third', label: '3rd Place', badge: 'Best 3rd' },
];

export default function KnockoutPath({ group, timezone }) {
  const [activeTab, setActiveTab] = useState('first');
  const paths = getKnockoutPaths(group);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Knockout Path</h2>

      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer
                ${activeTab === tab.key
                  ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 bg-teal-50/50 dark:bg-teal-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {/* Scenario description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {activeTab === 'first' && `If your team wins Group ${group}, here's the path to the Final:`}
            {activeTab === 'second' && `If your team finishes 2nd in Group ${group}, here's the bracket path:`}
            {activeTab === 'third' && `If your team finishes 3rd in Group ${group} and qualifies as one of the 8 best:`}
          </p>

          {activeTab === 'first' && (
            paths.first ? (
              <PathTimeline path={paths.first} timezone={timezone} />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                No bracket path found for 1st place in Group {group}.
              </p>
            )
          )}

          {activeTab === 'second' && (
            paths.second ? (
              <PathTimeline path={paths.second} timezone={timezone} />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                No bracket path found for 2nd place in Group {group}.
              </p>
            )
          )}

          {activeTab === 'third' && (
            <ThirdPlaceScenarios scenarios={paths.third} timezone={timezone} />
          )}
        </div>

        {/* Footer note */}
        <div className="px-4 pb-3">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Bracket paths are pre-determined by FIFA. Third-place matchups depend on which groups the qualifying teams come from.
          </p>
        </div>
      </div>
    </div>
  );
}

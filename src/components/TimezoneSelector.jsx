import { COMMON_TIMEZONES, getTimezoneAbbr } from '../utils/timezone';

export default function TimezoneSelector({ timezone, setTimezone }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-400" title="Timezone">🌐</span>
      <select
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
        className="bg-white text-slate-800 border border-slate-300 rounded px-2 py-1 text-sm
                   dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700
                   focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
      <span className="text-slate-500 text-xs">({getTimezoneAbbr(timezone)})</span>
    </div>
  );
}

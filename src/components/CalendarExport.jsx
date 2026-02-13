import { useState, useRef, useEffect } from 'react';
import { downloadICS, generateGoogleCalendarUrl, generateOutlookUrl } from '../utils/calendar';

export default function CalendarExport({ fixtures, teamId }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleICS = () => {
    downloadICS(fixtures, teamId);
    setOpen(false);
  };

  const handleGoogle = () => {
    for (const fixture of fixtures) {
      window.open(generateGoogleCalendarUrl(fixture), '_blank', 'noopener');
    }
    setOpen(false);
  };

  const handleOutlook = () => {
    for (const fixture of fixtures) {
      window.open(generateOutlookUrl(fixture), '_blank', 'noopener');
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg
                   text-sm font-medium transition-colors cursor-pointer"
      >
        <span>📅</span>
        Add to Calendar
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50
                     bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700
                     backdrop-blur-sm overflow-hidden"
        >
          <button
            onClick={handleICS}
            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3
                       text-slate-900 dark:text-white
                       hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <span className="text-base">📄</span>
            Apple / ICS File
          </button>
          <button
            onClick={handleGoogle}
            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3
                       text-slate-900 dark:text-white
                       hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <span className="text-base">🔵</span>
            Google Calendar
          </button>
          <button
            onClick={handleOutlook}
            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3
                       text-slate-900 dark:text-white
                       hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <span className="text-base">🟦</span>
            Outlook.com
          </button>
          {fixtures.length > 1 && (
            <p className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
              Google &amp; Outlook open one tab per fixture ({fixtures.length} matches).
              Allow popups if prompted.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

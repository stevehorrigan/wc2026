import { downloadICS } from '../utils/calendar';

export default function CalendarExport({ fixtures, teamId }) {
  const handleExport = () => {
    downloadICS(fixtures, teamId);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg
                 text-sm font-medium transition-colors cursor-pointer"
    >
      <span>📅</span>
      Add to Calendar
    </button>
  );
}

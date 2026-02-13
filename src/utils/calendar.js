import { getTeamById, getVenueById, getTeamName } from './fixtures';

function pad(n) {
  return String(n).padStart(2, '0');
}

function toICSDate(date, timeUTC) {
  const d = new Date(`${date}T${timeUTC}:00Z`);
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  return `${y}${m}${day}T${h}${min}00Z`;
}

function escapeICS(text) {
  return text.replace(/[,;\\]/g, c => `\\${c}`).replace(/\n/g, '\\n');
}

export function generateICS(fixtures, teamId) {
  const team = getTeamById(teamId);
  const teamLabel = team ? team.name : teamId;

  const events = fixtures.map(f => {
    const venue = getVenueById(f.venue);
    const home = getTeamName(f.homeTeam);
    const away = getTeamName(f.awayTeam);
    const summary = `${home} vs ${away}`;
    const location = venue ? `${venue.name}, ${venue.displayCity}` : '';
    const dtStart = toICSDate(f.date, f.timeUTC);

    // Assume 2 hour match duration
    const startDate = new Date(`${f.date}T${f.timeUTC}:00Z`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const dtEnd = toICSDate(
      endDate.toISOString().slice(0, 10),
      `${pad(endDate.getUTCHours())}:${pad(endDate.getUTCMinutes())}`
    );

    const roundLabel = f.group ? `Group ${f.group}` : (f.round || '');

    return [
      'BEGIN:VEVENT',
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(summary)}`,
      `DESCRIPTION:${escapeICS(`World Cup 2026 - ${roundLabel}`)}`,
      `LOCATION:${escapeICS(location)}`,
      `UID:wc2026-match-${f.matchNumber}@worldcup2026fan.com`,
      'END:VEVENT',
    ].join('\r\n');
  });

  const cal = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//World Cup 2026 Fan Companion//EN',
    `X-WR-CALNAME:World Cup 2026 - ${escapeICS(teamLabel)}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  return cal;
}

export function downloadICS(fixtures, teamId) {
  const icsContent = generateICS(fixtures, teamId);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wc2026-${teamId}-fixtures.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

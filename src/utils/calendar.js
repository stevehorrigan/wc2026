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

/**
 * Build event metadata from a single fixture for use in calendar URLs.
 */
function buildEventMeta(fixture) {
  const venue = getVenueById(fixture.venue);
  const home = getTeamName(fixture.homeTeam);
  const away = getTeamName(fixture.awayTeam);
  const title = `${home} vs ${away}`;
  const location = venue ? `${venue.name}, ${venue.displayCity}` : '';
  const roundLabel = fixture.group ? `Group ${fixture.group}` : (fixture.round || '');
  const description = `World Cup 2026 - ${roundLabel}`;

  const startDate = new Date(`${fixture.date}T${fixture.timeUTC}:00Z`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  return { title, location, description, startDate, endDate };
}

/**
 * Format a Date to Google Calendar's compact UTC format: 20260611T210000Z
 */
function toGoogleDate(date) {
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  return `${y}${m}${d}T${h}${min}00Z`;
}

/**
 * Format a Date to ISO 8601 for Outlook.com: 2026-06-11T21:00:00Z
 */
function toOutlookDate(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Generate a Google Calendar event creation URL for a single fixture.
 */
export function generateGoogleCalendarUrl(fixture) {
  const { title, location, description, startDate, endDate } = buildEventMeta(fixture);
  const dates = `${toGoogleDate(startDate)}/${toGoogleDate(endDate)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details: description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an Outlook.com calendar event creation URL for a single fixture.
 */
export function generateOutlookUrl(fixture) {
  const { title, location, description, startDate, endDate } = buildEventMeta(fixture);

  const params = new URLSearchParams({
    rru: 'addevent',
    subject: title,
    startdt: toOutlookDate(startDate),
    enddt: toOutlookDate(endDate),
    body: description,
    location,
  });

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

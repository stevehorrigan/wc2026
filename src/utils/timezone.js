export const COMMON_TIMEZONES = [
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Paris / Berlin (CET)', value: 'Europe/Paris' },
  { label: 'Istanbul (TRT)', value: 'Europe/Istanbul' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
  { label: 'Bangkok (ICT)', value: 'Asia/Bangkok' },
  { label: 'Shanghai / Hong Kong', value: 'Asia/Shanghai' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
  { label: 'Auckland (NZST)', value: 'Pacific/Auckland' },
  { label: 'US Eastern (ET)', value: 'America/New_York' },
  { label: 'US Central (CT)', value: 'America/Chicago' },
  { label: 'US Mountain (MT)', value: 'America/Denver' },
  { label: 'US Pacific (PT)', value: 'America/Los_Angeles' },
  { label: 'Mexico City (CST)', value: 'America/Mexico_City' },
  { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo' },
  { label: 'Buenos Aires (ART)', value: 'America/Argentina/Buenos_Aires' },
  { label: 'Toronto (ET)', value: 'America/Toronto' },
  { label: 'Vancouver (PT)', value: 'America/Vancouver' },
  { label: 'Lagos (WAT)', value: 'Africa/Lagos' },
  { label: 'Cairo (EET)', value: 'Africa/Cairo' },
  { label: 'Johannesburg (SAST)', value: 'Africa/Johannesburg' },
];

export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Europe/London';
  }
}

export function formatMatchTime(date, timeUTC, timezone) {
  const dateTime = new Date(`${date}T${timeUTC}:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    hour12: false,
  }).format(dateTime);
}

export function formatMatchDate(date, timezone) {
  const dateTime = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: timezone,
  }).format(dateTime);
}

export function formatFullDate(date, timeUTC, timezone) {
  const dateTime = new Date(`${date}T${timeUTC}:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    hour12: false,
  }).format(dateTime);
}

export function getTimezoneAbbr(timezone) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      timeZoneName: 'short',
    }).formatToParts(new Date());
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : timezone;
  } catch {
    return timezone;
  }
}

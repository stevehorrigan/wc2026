import { useParams, Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { getVenueById, getVenueFixtures, getTeamName, getTeamFlag, getTeamById, getRoundLabel, getFixturesByDate } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';
import { useTimezone } from '../hooks/useTimezone';
import { useMetaTags } from '../hooks/useMetaTags';
import TimezoneSelector, { VENUE_LOCAL } from './TimezoneSelector';

const COUNTRY_COLORS = {
  USA: '#3b82f6',
  Mexico: '#22c55e',
  Canada: '#ef4444',
};

function createMarkerIcon(country) {
  const color = COUNTRY_COLORS[country] || '#94a3b8';
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 18px; height: 18px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function TeamLabel({ teamId }) {
  const team = getTeamById(teamId);
  const flag = getTeamFlag(teamId);
  const name = getTeamName(teamId);

  const inner = (
    <span className="inline-flex items-center gap-1.5">
      {flag ? (
        <img src={flag} alt="" className="w-5 h-3.5 object-cover rounded-sm inline-block" />
      ) : (
        <span className="w-5 h-3.5 bg-slate-200 dark:bg-slate-700 rounded-sm inline-block" />
      )}
      <span>{name}</span>
    </span>
  );

  if (team) {
    return (
      <Link to={`/team/${teamId}`} className="hover:text-teal-400 transition-colors">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function VenuePage() {
  const { venueId } = useParams();
  const { isDark } = useOutletContext();
  const { timezone, setTimezone } = useTimezone();
  const venue = getVenueById(venueId);
  useMetaTags(venue ? {
    title: venue.name + ' — ' + venue.displayCity,
    description: `${venue.name} in ${venue.displayCity}, ${venue.country}. Capacity ${venue.capacity.toLocaleString()}. World Cup 2026 matches, location map, and travel info.`,
  } : { title: 'Venue Not Found' });

  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold mb-4">Venue not found</h2>
        <Link to="/" className="text-teal-400 hover:underline">← Home</Link>
      </div>
    );
  }

  const isVenueLocal = timezone === VENUE_LOCAL;
  const effectiveTz = isVenueLocal ? venue.timezone : timezone;
  const fixtures = getVenueFixtures(venueId);
  const grouped = getFixturesByDate(fixtures);

  const countryFlag = {
    USA: '🇺🇸',
    Mexico: '🇲🇽',
    Canada: '🇨🇦',
  };

  const roundLabels = venue.hostsRounds.map(r => getRoundLabel(r));

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-slate-600 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-sm">← Home</Link>
        <h1 className="text-3xl font-bold mt-2">{venue.name}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
          {countryFlag[venue.country]} {venue.displayCity}, {venue.country}
        </p>
      </div>

      {/* Info + Map grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Info card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-5 space-y-3">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Capacity</span>
            <p className="text-lg font-semibold">{venue.capacity.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">City</span>
            <p className="font-medium">{venue.city}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Local Timezone</span>
            <p className="font-medium">{venue.timezone}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Hosts Rounds</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {roundLabels.map((label) => (
                <span key={label} className="text-xs bg-teal-600/20 text-teal-400 px-2 py-0.5 rounded">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Matches Hosted</span>
            <p className="text-lg font-semibold">{fixtures.length}</p>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50" style={{ height: '300px' }}>
          <MapContainer
            center={[venue.lat, venue.lng]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url={tileUrl}
            />
            <Marker
              position={[venue.lat, venue.lng]}
              icon={createMarkerIcon(venue.country)}
            />
          </MapContainer>
        </div>
      </div>

      {/* Travel links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <a
          href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(venue.displayCity)}&aid=YOUR_BOOKING_AID`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-lg p-4 text-center hover:border-teal-500 transition-colors group"
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-400 transition-colors mb-1">Hotels near {venue.name}</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">Booking.com</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Partner link</p>
        </a>
        <a
          href={`https://www.skyscanner.net/transport/flights-to/${encodeURIComponent(venue.displayCity)}/?adultsv2=1&ref=wc2026`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-lg p-4 text-center hover:border-teal-500 transition-colors group"
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-400 transition-colors mb-1">Flights to {venue.displayCity}</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">Skyscanner</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Partner link</p>
        </a>
        <a
          href="https://www.airalo.com/?ref=wc2026"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-lg p-4 text-center hover:border-teal-500 transition-colors group"
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-400 transition-colors mb-1">eSIM for {venue.country}</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">Airalo</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Partner link</p>
        </a>
        <a
          href="https://nordvpn.com/special/?ref=wc2026"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-lg p-4 text-center hover:border-teal-500 transition-colors group"
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-400 transition-colors mb-1">Stream matches abroad</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">NordVPN</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Partner link</p>
        </a>
        <a
          href="https://safetywing.com/nomad-insurance/?ref=wc2026"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-lg p-4 text-center hover:border-teal-500 transition-colors group"
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-400 transition-colors mb-1">Travel insurance</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">SafetyWing</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Partner link</p>
        </a>
      </div>

      {/* Fixtures at this venue */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">Matches at {venue.name}</h2>
        <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
      </div>

      <div className="space-y-6">
        {grouped.map(([date, dayFixtures]) => (
          <div key={date}>
            <h3 className="text-sm font-semibold text-teal-400 mb-2">
              {formatMatchDate(date, effectiveTz)} · {date}
            </h3>
            <div className="space-y-2">
              {dayFixtures.map((fixture) => {
                const badge = fixture.group
                  ? `Group ${fixture.group}`
                  : getRoundLabel(fixture.round);

                return (
                  <div
                    key={fixture.matchNumber}
                    className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-lg px-4 py-3 text-sm"
                  >
                    <span className="shrink-0">
                      <span className="text-base font-mono">
                        {formatMatchTime(fixture.date, fixture.timeUTC, effectiveTz)}
                      </span>
                      {isVenueLocal && (
                        <span className="ml-1 text-teal-500 dark:text-teal-400 text-[10px]">(local)</span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <TeamLabel teamId={fixture.homeTeam} />
                      <span className="text-slate-500">v</span>
                      <TeamLabel teamId={fixture.awayTeam} />
                    </div>
                    <span className="text-xs bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded shrink-0">
                      {badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {grouped.length === 0 && (
        <p className="text-center text-slate-500 mt-8">No fixtures scheduled at this venue yet.</p>
      )}
    </div>
  );
}

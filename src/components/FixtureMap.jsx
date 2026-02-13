import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getVenueById, getTeamName } from '../utils/fixtures';
import { formatMatchTime, formatMatchDate } from '../utils/timezone';

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
      width: 14px; height: 14px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function FitBounds({ venues }) {
  const map = useMap();
  const prevBoundsRef = useRef(null);

  useEffect(() => {
    if (venues.length === 0) return;
    const bounds = L.latLngBounds(venues.map(v => [v.lat, v.lng]));
    const boundsStr = bounds.toBBoxString();
    if (prevBoundsRef.current !== boundsStr) {
      prevBoundsRef.current = boundsStr;
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
    }
  }, [venues, map]);

  return null;
}

export default function FixtureMap({ fixtures, teamId, timezone, isDark }) {
  const venueFixtures = {};
  for (const f of fixtures) {
    const venue = getVenueById(f.venue);
    if (!venue) continue;
    if (!venueFixtures[venue.id]) {
      venueFixtures[venue.id] = { venue, matches: [] };
    }
    venueFixtures[venue.id].matches.push(f);
  }

  const entries = Object.values(venueFixtures);
  const venues = entries.map(e => e.venue);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700/50" style={{ height: '400px' }}>
      <MapContainer
        center={[39, -98]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />
        <FitBounds venues={venues} />
        {entries.map(({ venue, matches }) => (
          <Marker
            key={venue.id}
            position={[venue.lat, venue.lng]}
            icon={createMarkerIcon(venue.country)}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-bold text-base mb-1">{venue.name}</div>
                <div className="text-slate-400 mb-2">
                  {venue.displayCity} · {venue.country}
                </div>
                {matches.map((m) => (
                  <div key={m.matchNumber} className="border-t border-slate-600 pt-1 mt-1">
                    <div className="font-medium">
                      {getTeamName(m.homeTeam)} vs {getTeamName(m.awayTeam)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatMatchDate(m.date, timezone)} · {formatMatchTime(m.date, m.timeUTC, timezone)}
                    </div>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

const PARTNER_LINKS = [
  { label: 'Hotels', provider: 'Booking.com', href: 'https://www.booking.com/?aid=YOUR_BOOKING_AID' },
  { label: 'Flights', provider: 'Skyscanner', href: 'https://www.skyscanner.net/?ref=wc2026' },
  { label: 'eSIM', provider: 'Airalo', href: 'https://www.airalo.com/?ref=wc2026' },
  { label: 'VPN', provider: 'NordVPN', href: 'https://nordvpn.com/special/?ref=wc2026' },
  { label: 'Travel Insurance', provider: 'SafetyWing', href: 'https://safetywing.com/nomad-insurance/?ref=wc2026' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 py-6 text-sm text-slate-500">
      {/* Partner links */}
      <div className="max-w-4xl mx-auto px-4 mb-4">
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-2">Travel partners</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {PARTNER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-teal-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-1">
          Links above are affiliate/partner links
        </p>
      </div>

      <div className="text-center">
        <p>This is an unofficial fan site. Not affiliated with or endorsed by FIFA.</p>
        <p className="mt-1">World Cup 2026 Fan Companion</p>
      </div>
    </footer>
  );
}

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import Footer from './Footer';

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg hover:text-teal-400 transition-colors">
            WC 2026
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/fixtures"
              className={`text-sm hover:text-teal-400 transition-colors
                ${location.pathname === '/fixtures' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              All Fixtures
            </Link>
            <Link
              to="/bracket"
              className={`text-sm hover:text-teal-400 transition-colors
                ${location.pathname === '/bracket' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              Bracket
            </Link>
            <Link
              to="/how-it-works"
              className={`text-sm hover:text-teal-400 transition-colors
                ${location.pathname === '/how-it-works' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              How It Works
            </Link>
            <button
              onClick={toggleTheme}
              className="text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-white transition-colors text-lg cursor-pointer"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <Outlet context={{ isDark }} />
      </main>

      <Footer />
    </div>
  );
}

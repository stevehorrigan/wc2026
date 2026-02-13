import { Link } from 'react-router-dom';
import { useMetaTags } from '../hooks/useMetaTags';

function SectionHeading({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-bold shrink-0">
        {number}
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
}

function InfoCallout({ title, children }) {
  return (
    <div className="border-l-4 border-teal-500 bg-teal-50 dark:bg-teal-900/20 rounded-r-lg px-4 py-3 my-4">
      {title && <p className="font-semibold text-teal-700 dark:text-teal-400 mb-1">{title}</p>}
      <div className="text-sm text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  );
}

function StepCard({ step, title, description }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-1">Step {step}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

function TimelineItem({ dates, label, detail }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-teal-500 shrink-0 mt-1.5" />
        <div className="w-0.5 flex-1 bg-slate-300 dark:bg-slate-600" />
      </div>
      <div className="pb-6">
        <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide">{dates}</p>
        <p className="font-semibold">{label}</p>
        {detail && <p className="text-sm text-slate-600 dark:text-slate-400">{detail}</p>}
      </div>
    </div>
  );
}

function BracketRound({ label, matches, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide">{label}</p>
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <span className="text-lg font-bold">{matches}</span>
      </div>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}

function BracketArrow() {
  return (
    <div className="flex items-center px-1">
      <svg className="w-6 h-4 text-slate-400 dark:text-slate-500" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 8h18m0 0l-5-5m5 5l-5 5" />
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  useMetaTags({ title: 'How the Tournament Works', description: '2026 World Cup format explained — 48 teams, 12 groups, third-place advancement rules, knockout bracket structure, and key dates.' });
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">How It Works</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        A guide to the 2026 World Cup format -- the first ever with 48 teams.
      </p>

      {/* Section 1: Tournament Overview */}
      <section className="mb-10">
        <SectionHeading number={1} title="Tournament Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-teal-500">48</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Teams</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-teal-500">104</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Matches</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-teal-500">16</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Venues</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-teal-500">3</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Countries</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The 2026 FIFA World Cup runs from <strong>June 11 to July 19, 2026</strong> across
          the United States (11 venues), Mexico (3 venues), and Canada (2 venues). It is the
          largest World Cup in history, expanding from 32 to 48 teams for the first time.
        </p>
      </section>

      {/* Section 2: Group Stage */}
      <section className="mb-10">
        <SectionHeading number={2} title="Group Stage" />
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <StepCard
            step={1}
            title="12 Groups of 4"
            description="48 teams are drawn into 12 groups (A through L), with 4 teams in each group."
          />
          <StepCard
            step={2}
            title="3 Matches Each"
            description="Every team plays 3 group matches -- one against each of the other teams in their group."
          />
          <StepCard
            step={3}
            title="32 Teams Advance"
            description="The top 2 from each group (24 teams) plus the 8 best third-placed teams (32 total) go through to the knockout stage."
          />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The group stage runs from June 11 to June 28. Three points for a win, one for a draw,
          zero for a loss. See the{' '}
          <Link to="/fixtures" className="text-teal-500 hover:text-teal-400 underline">full fixture schedule</Link>{' '}
          for all group stage matches.
        </p>
      </section>

      {/* Section 3: Third-Place Rules */}
      <section className="mb-10">
        <SectionHeading number={3} title="Third-Place Advancement" />
        <InfoCallout title="New for 48 teams">
          <p>
            With 12 groups, 8 of 12 third-placed teams advance to the Round of 32. This means
            finishing third is not necessarily the end -- two-thirds of third-placed teams go through.
          </p>
        </InfoCallout>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          After the group stage, the 12 third-placed teams are ranked against each other.
          The top 8 advance. The ranking criteria, in order:
        </p>
        <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-2">
          <li>Points (3 for a win, 1 for a draw)</li>
          <li>Goal difference</li>
          <li>Goals scored</li>
          <li>Disciplinary record (yellow/red cards converted to points)</li>
          <li>Drawing of lots</li>
        </ol>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
          Because different groups may have different strengths, a third-place finish with 4
          points and a positive goal difference will almost certainly be enough to go through.
        </p>
      </section>

      {/* Section 4: Tiebreaker Rules */}
      <section className="mb-10">
        <SectionHeading number={4} title="Tiebreaker Rules" />
        <InfoCallout title="Head-to-head first -- new for 2026">
          <p>
            In a change from previous World Cups, head-to-head record is now the first tiebreaker
            between teams level on points. Goal difference is no longer the primary separator.
          </p>
        </InfoCallout>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          When two or more teams in the same group finish level on points, the following
          criteria are applied in order:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-10">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Criterion</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-2 font-bold text-teal-500">1</td>
                <td className="px-4 py-2">Points in head-to-head matches</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">Between tied teams</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-teal-500">2</td>
                <td className="px-4 py-2">Goal difference in head-to-head matches</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">Between tied teams</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-teal-500">3</td>
                <td className="px-4 py-2">Goals scored in head-to-head matches</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">Between tied teams</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-teal-500">4</td>
                <td className="px-4 py-2">Overall goal difference</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">All group matches</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-teal-500">5</td>
                <td className="px-4 py-2">Overall goals scored</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">All group matches</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-teal-500">6</td>
                <td className="px-4 py-2">Disciplinary record</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">Fair play points</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-teal-500">7</td>
                <td className="px-4 py-2">Drawing of lots</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">Last resort</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
          This means a team that beats a rival 1-0 in the group but has a worse overall goal
          difference will still finish above them. The head-to-head result takes priority.
        </p>
      </section>

      {/* Section 5: Knockout Stage */}
      <section className="mb-10">
        <SectionHeading number={5} title="Knockout Stage" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          32 teams enter the knockout rounds. Every match is single-elimination: lose and you
          go home. Draws are settled by extra time and, if needed, a penalty shootout.
        </p>

        {/* Bracket diagram */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-6 mb-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[480px] gap-1">
            <BracketRound label="R32" matches={16} subtitle="32 teams" />
            <BracketArrow />
            <BracketRound label="R16" matches={8} subtitle="16 teams" />
            <BracketArrow />
            <BracketRound label="QF" matches={4} subtitle="8 teams" />
            <BracketArrow />
            <BracketRound label="SF" matches={2} subtitle="4 teams" />
            <BracketArrow />
            <BracketRound label="Final" matches={1} subtitle="MetLife" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Round of 32</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              16 matches. Group winners and runners-up are joined by the 8 best
              third-placed teams. The bracket is pre-determined based on group finishing
              positions.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Round of 16 to Final</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              8 matches in the Round of 16, then Quarter-finals (4), Semi-finals (2),
              a Third-place match, and the Final at MetLife Stadium in New York/New Jersey.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Key Dates */}
      <section className="mb-10">
        <SectionHeading number={6} title="Key Dates" />
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
          <TimelineItem
            dates="June 11 -- 28"
            label="Group Stage"
            detail="48 teams, 12 groups, 72 matches across all 16 venues"
          />
          <TimelineItem
            dates="June 29 -- July 3"
            label="Round of 32"
            detail="16 knockout matches -- single elimination begins"
          />
          <TimelineItem
            dates="July 5 -- 8"
            label="Round of 16"
            detail="8 matches to determine the quarter-finalists"
          />
          <TimelineItem
            dates="July 10 -- 11"
            label="Quarter-finals"
            detail="4 matches -- the last 8 teams compete"
          />
          <TimelineItem
            dates="July 14 -- 15"
            label="Semi-finals"
            detail="2 matches to decide the finalists"
          />
          <TimelineItem
            dates="July 18"
            label="Third-Place Match"
            detail="The two losing semi-finalists play for third place"
          />
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-teal-500 shrink-0 mt-1.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide">July 19</p>
              <p className="font-semibold">Final</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">MetLife Stadium, New York/New Jersey</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
        <h2 className="text-lg font-bold mb-2">Ready to follow your team?</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Pick your country and get a personalised view of fixtures, venues, and knockout paths.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Choose Your Team
          </Link>
          <Link
            to="/fixtures"
            className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View All Fixtures
          </Link>
        </div>
      </div>
    </div>
  );
}

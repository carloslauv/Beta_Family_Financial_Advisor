import Link from 'next/link';
import { Button } from '@/components/ui/button';

const dimensions = [
  {
    icon: '🏖️',
    name: 'Retirement',
    desc: 'Are you on track? See where you stand and what the gap looks like.',
  },
  {
    icon: '🎓',
    name: "Kids' Education",
    desc: 'College costs are growing. Know how your savings stack up.',
  },
  {
    icon: '💼',
    name: 'Company & Career',
    desc: 'Whether you\'re a founder or an employee, your career is the engine.',
  },
  {
    icon: '🤝',
    name: 'Aging Parents',
    desc: 'The dimension most people overlook — until it\'s urgent.',
  },
  {
    icon: '📅',
    name: 'Monthly Life',
    desc: 'Cash flow, emergency funds, and debt — the foundation everything else sits on.',
  },
];

const testimonials = [
  {
    quote:
      'I\'ve had a financial advisor for years and never seen all of this in one place. This is the clarity I didn\'t know I needed.',
    name: 'Sarah K.',
    title: 'Founder, 42',
  },
  {
    quote:
      'The connection between my company equity and retirement plan was something I\'d never thought about explicitly. Eye-opening.',
    name: 'Marcus T.',
    title: 'VP Engineering, 38',
  },
  {
    quote:
      'My partner and I finally have a shared language for our finances. The panorama gave us something to actually talk about.',
    name: 'Priya M.',
    title: 'Consultant, 45',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌅</span>
            <span className="font-bold text-gray-900 text-lg">Family Panorama</span>
          </div>
          <Link href="/start">
            <Button variant="primary" size="sm">
              Start your panorama
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-teal-100">
          <span>✨</span>
          <span>Free · 10 minutes · No account required to start</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
          See your family&apos;s full
          <br />
          <span className="text-teal-600">financial picture</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
          You manage retirement, kids&apos; education, your company, aging parents, and monthly bills in
          separate worlds. The Family Panorama brings it all together — in one clear view.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/start">
            <Button variant="primary" size="xl">
              Start your panorama (free)
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <p className="text-sm text-gray-400">No credit card · No financial account linking</p>
        </div>

        {/* Hero visual */}
        <div className="mt-16 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Family Panorama</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">The Full Picture</h3>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>

          {/* Mock dimension cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {dimensions.slice(0, 3).map((d) => (
              <div key={d.name} className="bg-gray-50 rounded-xl p-3.5 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{d.icon}</span>
                  <span className="text-xs font-semibold text-gray-600">{d.name}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mb-1">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: ['72%', '45%', '83%'][dimensions.indexOf(d)] }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${['text-teal-600', 'text-amber-600', 'text-green-600'][dimensions.indexOf(d)]}`}
                >
                  {['On Track', 'Needs Attention', 'On Track'][dimensions.indexOf(d)]}
                </span>
              </div>
            ))}
          </div>

          {/* Interconnection hint */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3.5 text-left">
            <div className="flex gap-2">
              <span className="text-teal-600">🔗</span>
              <p className="text-xs text-teal-800 leading-relaxed">
                <span className="font-semibold">Key insight: </span>
                Your company equity represents 34% of your net worth — your retirement plan is
                highly dependent on your exit outcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Your financial life in five dimensions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {dimensions.map((d, i) => (
              <div key={d.name} className="text-center">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
                  {d.icon}
                </div>
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{d.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          How it works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            {
              step: '1',
              title: 'Answer ~30 questions',
              desc: 'One at a time, in your own pace. Ranges are fine. Everything is skippable.',
              icon: '📝',
            },
            {
              step: '2',
              title: 'AI builds your panorama',
              desc: 'We compute your metrics and generate personalized insights across all five dimensions.',
              icon: '🤖',
            },
            {
              step: '3',
              title: 'See the full picture',
              desc: 'Your complete financial picture — with the connections between dimensions made visible.',
              icon: '🌅',
            },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="w-8 h-8 bg-teal-600 rounded-full text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            What midlife warriors say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to see your full picture?
        </h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Free, private, and takes about 10 minutes. No account needed to start.
        </p>
        <Link href="/start">
          <Button variant="primary" size="xl">
            Start your panorama (free)
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌅</span>
            <span className="font-semibold text-gray-700">Family Panorama</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            This tool provides informational perspectives only — not financial advice. Always consult
            a qualified financial professional for your specific situation.
          </p>
        </div>
      </footer>
    </div>
  );
}

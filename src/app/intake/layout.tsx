'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTIONS = [
  { id: 'basics', label: 'Basics', path: '/intake/basics', icon: '👤' },
  { id: 'retirement', label: 'Retirement', path: '/intake/retirement', icon: '🏖️' },
  { id: 'education', label: 'Education', path: '/intake/education', icon: '🎓' },
  { id: 'career', label: 'Career', path: '/intake/career', icon: '💼' },
  { id: 'parents', label: 'Parents', path: '/intake/parents', icon: '🤝' },
  { id: 'monthly', label: 'Monthly', path: '/intake/monthly', icon: '📅' },
];

function getSectionIndex(pathname: string): number {
  const idx = SECTIONS.findIndex((s) => pathname.includes(s.id));
  return idx === -1 ? 0 : idx;
}

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIdx = getSectionIndex(pathname);
  const currentSection = SECTIONS[currentIdx];
  const progressPct = ((currentIdx + 1) / SECTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-lg">🌅</span>
              <span className="font-bold text-gray-700 text-sm">Family Panorama</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                Section {currentIdx + 1} of {SECTIONS.length}
              </span>
              <span className="text-base">{currentSection?.icon}</span>
              <span className="text-sm font-medium text-gray-700">{currentSection?.label}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Section dots */}
          <div className="flex items-center justify-between mt-2">
            {SECTIONS.map((section, i) => (
              <div
                key={section.id}
                className="flex flex-col items-center gap-1"
                title={section.label}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < currentIdx
                      ? 'bg-teal-600'
                      : i === currentIdx
                      ? 'bg-teal-500 scale-125'
                      : 'bg-gray-200'
                  }`}
                />
                <span
                  className={`text-xs hidden sm:block transition-colors ${
                    i === currentIdx ? 'text-teal-600 font-medium' : 'text-gray-300'
                  }`}
                >
                  {section.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-xl">{children}</div>
      </main>

      {/* Footer note */}
      <footer className="text-center py-4 px-6">
        <p className="text-xs text-gray-300">
          Your answers are saved locally. Nothing leaves your device until you generate your panorama.
        </p>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useIntake } from '@/lib/intake-store';

export default function StartPage() {
  const router = useRouter();
  const { clearIntake, completedSections } = useIntake();

  const hasStarted = completedSections.size > 0;

  const handleFresh = () => {
    clearIntake();
    router.push('/intake/basics');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🌅</span>
            <span className="font-bold text-gray-700">Family Panorama</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          <span className="text-6xl mb-6 block">🌅</span>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Let&apos;s build your Family Panorama
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            We&apos;ll take you through six short sections — about 10 minutes total.
            Answer what you can, skip what you don&apos;t know yet. The panorama adapts to whatever
            you share.
          </p>

          {/* Section preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-700 text-sm mb-4 uppercase tracking-wide">
              What we&apos;ll cover
            </h3>
            <div className="space-y-3">
              {[
                { icon: '👤', label: 'The Basics', desc: '3–4 questions', section: 'basics' },
                { icon: '🏖️', label: 'Retirement', desc: '5–6 questions', section: 'retirement' },
                {
                  icon: '🎓',
                  label: "Kids' Education",
                  desc: '4–5 questions (if applicable)',
                  section: 'education',
                },
                {
                  icon: '💼',
                  label: 'Company & Career',
                  desc: '5–6 questions',
                  section: 'career',
                },
                { icon: '🤝', label: 'Aging Parents', desc: '4–5 questions', section: 'parents' },
                { icon: '📅', label: 'Monthly Life', desc: '5–6 questions', section: 'monthly' },
              ].map((item) => (
                <div key={item.section} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{item.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-gray-800 text-sm">{item.label}</span>
                    <span className="text-gray-400 text-xs ml-2">{item.desc}</span>
                  </div>
                  {completedSections.has(item.section) && (
                    <span className="text-green-600 text-xs font-medium">✓ Done</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {hasStarted ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/intake/basics')}
                >
                  Continue where I left off →
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full text-gray-400"
                  onClick={handleFresh}
                >
                  Start fresh
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => router.push('/intake/basics')}
              >
                Let&apos;s start →
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Your answers are saved locally on your device. Nothing is sent until you generate your
            panorama.
          </p>
        </div>
      </main>
    </div>
  );
}

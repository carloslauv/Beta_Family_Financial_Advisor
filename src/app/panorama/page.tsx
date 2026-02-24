'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Panorama } from '@/types';
import { loadPanorama } from '@/lib/intake-store';
import { SummaryCards } from '@/components/panorama/summary-cards';
import { ReadinessBar } from '@/components/panorama/readiness-bar';
import { DimensionCard } from '@/components/panorama/dimension-card';
import { Interconnections } from '@/components/panorama/interconnections';
import { Priorities } from '@/components/panorama/priorities';
import { Button } from '@/components/ui/button';

export default function PanoramaPage() {
  const router = useRouter();
  const [panorama, setPanorama] = useState<Panorama | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const stored = loadPanorama() as Panorama | null;
    if (!stored) {
      router.push('/start');
      return;
    }
    setPanorama(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    if (!panorama) return;
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panorama }),
      });
      const { token } = await response.json();
      const url = `${window.location.origin}/panorama/share/${token}`;
      setShareUrl(url);
      setShowShareModal(true);
    } catch {
      // Fallback: encode panorama in URL
      const encoded = btoa(encodeURIComponent(JSON.stringify(panorama))).slice(0, 200);
      setShareUrl(`${window.location.origin}/panorama/share/${encoded}`);
      setShowShareModal(true);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!panorama) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your panorama...</p>
        </div>
      </div>
    );
  }

  const generatedDate = new Date(panorama.generated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl">🌅</Link>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-none">
                {panorama.user_name ? `${panorama.user_name}'s` : 'Your'} Financial Panorama
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Generated {generatedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              Share with partner →
            </Button>
            <Link href="/intake/basics">
              <Button variant="ghost" size="sm">
                Update my numbers
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* A. Summary Cards */}
        <section>
          <SummaryCards panorama={panorama} />
        </section>

        {/* B. Readiness Bar */}
        <section>
          <ReadinessBar
            score={panorama.overall_readiness_score}
            label={panorama.overall_readiness_label}
          />
        </section>

        {/* C. Five Dimension Cards */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Your Five Dimensions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DimensionCard
              dimension="retirement"
              result={panorama.dimensions.retirement}
              narrative={panorama.ai_narratives.retirement_summary}
              animationDelay="delay-100"
            />
            <DimensionCard
              dimension="education"
              result={panorama.dimensions.education}
              narrative={panorama.ai_narratives.education_summary}
              animationDelay="delay-200"
            />
            <DimensionCard
              dimension="career"
              result={panorama.dimensions.career}
              narrative={panorama.ai_narratives.career_summary}
              animationDelay="delay-300"
            />
            <DimensionCard
              dimension="parents"
              result={panorama.dimensions.parents}
              narrative={panorama.ai_narratives.parents_summary}
              animationDelay="delay-400"
            />
            {/* Monthly spans full width */}
            <DimensionCard
              dimension="monthly"
              result={panorama.dimensions.monthly}
              narrative={panorama.ai_narratives.monthly_summary}
              animationDelay="delay-500"
              fullWidth
            />
          </div>
        </section>

        {/* D. Interconnections */}
        <section>
          <Interconnections interconnections={panorama.ai_narratives.interconnections} />
        </section>

        {/* E. Priorities */}
        <section>
          <Priorities priorities={panorama.ai_narratives.priorities} />
        </section>

        {/* F. CTA Section */}
        <section className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">
            This is your starting point, not the finish line.
          </h2>
          <p className="text-teal-100 mb-8 max-w-lg mx-auto">
            The Family Panorama gives you clarity. The next step is action — and we&apos;re building
            the tools to help you get there.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              disabled
              className="flex items-center gap-2 bg-white/20 text-white/60 border border-white/20 px-5 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed"
              title="Coming soon"
            >
              See my gap analysis →
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white/80">
                Coming soon
              </span>
            </button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleShare}
              className="!bg-white !text-teal-700 hover:!bg-teal-50"
            >
              Share with my partner
            </Button>

            <Link href="/intake/basics">
              <Button variant="ghost" size="md" className="!text-white hover:!bg-white/10">
                Update my numbers
              </Button>
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400 max-w-2xl mx-auto">
            The Family Panorama provides informational perspectives only — not financial advice.
            Numbers shown are estimates based on the information you provided. Always consult a
            qualified financial professional for advice specific to your situation.
          </p>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Share with your partner</h3>
            <p className="text-sm text-gray-500 mb-4">
              This link gives your partner a read-only view of your Family Panorama. It expires in
              30 days.
            </p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-600 truncate flex-1 font-mono">{shareUrl}</p>
              <button
                onClick={handleCopy}
                className="text-teal-600 hover:text-teal-800 font-medium text-xs shrink-0 transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowShareModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { notFound } from 'next/navigation';
import { getSharedPanorama } from '@/app/api/share/store';
import { Panorama } from '@/types';
import { SummaryCards } from '@/components/panorama/summary-cards';
import { ReadinessBar } from '@/components/panorama/readiness-bar';
import { DimensionCard } from '@/components/panorama/dimension-card';
import { Interconnections } from '@/components/panorama/interconnections';
import { Priorities } from '@/components/panorama/priorities';
import Link from 'next/link';

interface Props {
  params: { token: string };
}

export default function SharePage({ params }: Props) {
  const panorama = getSharedPanorama(params.token) as Panorama | null;

  if (!panorama) {
    notFound();
  }

  const generatedDate = new Date(panorama.generated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Read-only header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl">🌅</Link>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-none">
                {panorama.user_name ? `${panorama.user_name}'s` : 'Shared'} Financial Panorama
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Shared snapshot · Generated {generatedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full font-medium">
              Read-only view
            </span>
            <Link href="/start">
              <span className="text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors cursor-pointer">
                Create your own →
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Summary Cards */}
        <section>
          <SummaryCards panorama={panorama} />
        </section>

        {/* Readiness Bar */}
        <section>
          <ReadinessBar
            score={panorama.overall_readiness_score}
            label={panorama.overall_readiness_label}
          />
        </section>

        {/* Five Dimension Cards */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Five Dimensions</h2>
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
            <DimensionCard
              dimension="monthly"
              result={panorama.dimensions.monthly}
              narrative={panorama.ai_narratives.monthly_summary}
              animationDelay="delay-500"
              fullWidth
            />
          </div>
        </section>

        {/* Interconnections */}
        <section>
          <Interconnections interconnections={panorama.ai_narratives.interconnections} />
        </section>

        {/* Priorities */}
        <section>
          <Priorities priorities={panorama.ai_narratives.priorities} />
        </section>

        {/* CTA */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h3 className="font-bold text-gray-900 text-xl mb-2">
            Want to see your own panorama?
          </h3>
          <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
            The Family Panorama is free and takes about 10 minutes. No account required.
          </p>
          <Link href="/start">
            <span className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors cursor-pointer">
              Start your panorama (free) →
            </span>
          </Link>
        </section>

        {/* Disclaimer */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400 max-w-2xl mx-auto">
            This is a shared, read-only snapshot. The Family Panorama provides informational
            perspectives only — not financial advice.
          </p>
        </div>
      </main>
    </div>
  );
}

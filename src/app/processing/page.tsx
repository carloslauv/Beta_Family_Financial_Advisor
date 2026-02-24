'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '@/lib/intake-store';
import { savePanorama } from '@/lib/intake-store';

const MESSAGES = [
  'Building your family panorama...',
  'Connecting the dots between your five dimensions...',
  'Calculating your retirement trajectory...',
  'Analyzing your monthly cash flow...',
  'Generating your personalized insights...',
  'Almost ready...',
];

export default function ProcessingPage() {
  const router = useRouter();
  const { intake } = useIntake();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cycle through messages
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 1200);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return p;
        }
        return p + Math.random() * 8;
      });
    }, 400);

    // Call the API
    const generate = async () => {
      try {
        const response = await fetch('/api/generate-panorama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(intake),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const panorama = await response.json();
        setProgress(100);

        // Save panorama to localStorage
        savePanorama(panorama);

        // Short delay to show 100%
        await new Promise((r) => setTimeout(r, 600));

        router.push('/panorama');
      } catch (err) {
        console.error('Generation error:', err);
        setError('Something went wrong building your panorama. Please try again.');
      }
    };

    generate();

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <span className="text-5xl mb-6 block">⚠️</span>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="text-teal-600 font-medium hover:text-teal-800 transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cream-50 flex items-center justify-center px-6">
      <div className="text-center max-w-lg w-full">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
          <div
            className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🌅
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 min-h-[2rem] transition-all">
          {MESSAGES[messageIndex]}
        </h2>
        <p className="text-gray-500 mb-10">
          Pulling together your complete financial picture
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-sm mx-auto">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-right">
            {Math.round(Math.min(progress, 100))}%
          </p>
        </div>

        {/* Dimension preview */}
        <div className="mt-12 grid grid-cols-5 gap-3 max-w-xs mx-auto">
          {['🏖️', '🎓', '💼', '🤝', '📅'].map((icon, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-500 ${
                progress > (i + 1) * 15
                  ? 'bg-teal-100 scale-110'
                  : 'bg-gray-100 opacity-40'
              }`}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

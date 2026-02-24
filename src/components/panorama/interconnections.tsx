'use client';

import { AIContent } from '@/types';
import { Card } from '@/components/ui/card';

interface InterconnectionsProps {
  interconnections: AIContent['interconnections'];
}

export function Interconnections({ interconnections }: InterconnectionsProps) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">How Your Dimensions Connect</h2>
        <p className="text-sm text-gray-500 mt-1">
          The relationships between your five dimensions — the things most people never see in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {interconnections.map((item, i) => (
          <Card
            key={i}
            padding="md"
            className={`animate-fade-slide-up opacity-0`}
            style={{ animationDelay: `${i * 100 + 200}ms` }}
          >
            <div className="flex gap-3">
              <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.headline}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

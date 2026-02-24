'use client';

import { AIContent } from '@/types';

type Priority = AIContent['priorities'][0];

const PRIORITY_CONFIG = {
  high: {
    label: 'Priority 1',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border border-red-200',
    border: 'border-l-4 border-red-400',
  },
  medium: {
    label: 'Priority 2',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    border: 'border-l-4 border-amber-400',
  },
  low: {
    label: 'Priority 3',
    dot: 'bg-blue-400',
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    border: 'border-l-4 border-blue-300',
  },
  keep: {
    label: 'Keep Doing',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-800 border border-green-200',
    border: 'border-l-4 border-green-400',
  },
};

interface PrioritiesProps {
  priorities: Priority[];
}

export function Priorities({ priorities }: PrioritiesProps) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">What to Pay Attention To</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your personalized starting points, ranked by impact.
        </p>
      </div>

      <div className="space-y-3">
        {priorities.map((priority, i) => {
          const config = PRIORITY_CONFIG[priority.level];
          return (
            <div
              key={i}
              className={`bg-white rounded-xl shadow-sm ${config.border} pl-5 pr-5 py-4 animate-fade-slide-up opacity-0`}
              style={{ animationDelay: `${i * 100 + 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badge} mb-2`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
                    {config.label}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{priority.text}</p>
                  <p className="text-xs text-gray-400 mt-2 italic">{priority.action_teaser}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

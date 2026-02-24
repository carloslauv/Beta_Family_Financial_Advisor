'use client';

import { DimensionResult } from '@/types';
import { StatusBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DIMENSION_CONFIG = {
  retirement: {
    icon: '🏖️',
    name: 'Retirement',
    color: 'from-blue-50 to-white',
    border: 'border-blue-100',
  },
  education: {
    icon: '🎓',
    name: "Kids' Education",
    color: 'from-purple-50 to-white',
    border: 'border-purple-100',
  },
  career: {
    icon: '💼',
    name: 'Company & Career',
    color: 'from-orange-50 to-white',
    border: 'border-orange-100',
  },
  parents: {
    icon: '🤝',
    name: 'Aging Parents',
    color: 'from-rose-50 to-white',
    border: 'border-rose-100',
  },
  monthly: {
    icon: '📅',
    name: 'Monthly Life',
    color: 'from-teal-50 to-white',
    border: 'border-teal-100',
  },
};

const METRIC_COLORS = {
  good: 'text-green-700 font-semibold',
  warn: 'text-amber-700 font-semibold',
  alert: 'text-red-700 font-semibold',
  neutral: 'text-gray-700 font-medium',
};

interface DimensionCardProps {
  dimension: keyof typeof DIMENSION_CONFIG;
  result: DimensionResult;
  narrative: string;
  animationDelay?: string;
  fullWidth?: boolean;
}

export function DimensionCard({
  dimension,
  result,
  narrative,
  animationDelay = '',
  fullWidth = false,
}: DimensionCardProps) {
  const config = DIMENSION_CONFIG[dimension];

  return (
    <div
      className={cn(
        `bg-gradient-to-br ${config.color} rounded-2xl border ${config.border} shadow-sm p-6`,
        `animate-fade-slide-up opacity-0 ${animationDelay}`,
        fullWidth && 'col-span-full'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{config.name}</h3>
            <StatusBadge status={result.status} className="mt-1" />
          </div>
        </div>
        {/* Score ring */}
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={result.score >= 75 ? '#16a34a' : result.score >= 50 ? '#d97706' : '#dc2626'}
              strokeWidth="3"
              strokeDasharray={`${result.score} ${100 - result.score}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
            {result.score}
          </span>
        </div>
      </div>

      {/* Narrative */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{narrative}</p>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {result.metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-white/70 rounded-xl px-3 py-2.5 border border-white/80"
          >
            <p className="text-xs text-gray-400 font-medium mb-0.5">{metric.label}</p>
            <p className={cn('text-sm', METRIC_COLORS[metric.color])}>{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Connection callout */}
      <div className="bg-white/60 border border-gray-100 rounded-xl px-3 py-2.5">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-700">Connected: </span>
          {result.connection_text}
        </p>
      </div>
    </div>
  );
}

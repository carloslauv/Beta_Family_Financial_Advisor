'use client';

import { cn } from '@/lib/utils';

interface OptionButtonProps {
  label: string;
  description?: string;
  selected?: boolean;
  onClick: () => void;
  emoji?: string;
  disabled?: boolean;
}

export function OptionButton({
  label,
  description,
  selected,
  onClick,
  emoji,
  disabled,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        selected
          ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-sm'
          : 'border-gray-200 bg-white text-gray-800 hover:border-teal-300 hover:bg-teal-50/50'
      )}
    >
      <div className="flex items-start gap-3">
        {emoji && (
          <span className="text-xl mt-0.5 shrink-0" role="img">
            {emoji}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-base">{label}</span>
            {selected && (
              <svg
                className="w-4 h-4 text-teal-600 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
}

interface RangeOptionProps {
  ranges: string[];
  selected?: string;
  onSelect: (range: string) => void;
}

export function RangeSelector({ ranges, selected, onSelect }: RangeOptionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onSelect(range)}
          className={cn(
            'px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1',
            selected === range
              ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-sm'
              : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50/50'
          )}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

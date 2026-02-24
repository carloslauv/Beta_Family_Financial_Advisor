'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface QuestionCardProps {
  question: string;
  helper?: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
  isLastQuestion?: boolean;
}

export function QuestionCard({
  question,
  helper,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  nextDisabled = false,
  showBack = true,
  showSkip = true,
  isLastQuestion = false,
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Question */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 leading-snug">{question}</h2>
        {helper && (
          <p className="mt-2 text-sm text-gray-500 leading-relaxed flex items-start gap-1.5">
            <span className="text-teal-500 mt-0.5 shrink-0">ℹ</span>
            {helper}
          </p>
        )}
      </div>

      {/* Input area */}
      <div className="mb-8">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {showBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showSkip && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-2 px-3"
            >
              Skip for now
            </button>
          )}
          {onNext && (
            <Button
              variant="primary"
              size="md"
              onClick={onNext}
              disabled={nextDisabled}
            >
              {isLastQuestion ? 'Complete Section' : nextLabel}
              {!isLastQuestion && (
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface NumberInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}

export function NumberInput({
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  min,
  max,
}: NumberInputProps) {
  return (
    <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:border-teal-500 transition-colors">
      {prefix && (
        <span className="pl-4 text-gray-400 font-medium text-lg">{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '' || v === '-') {
            onChange('');
          } else {
            const parsed = parseFloat(v);
            if (!isNaN(parsed)) {
              onChange(parsed);
            }
          }
        }}
        placeholder={placeholder}
        min={min}
        max={max}
        className="flex-1 px-4 py-3.5 text-lg font-medium outline-none bg-transparent text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && (
        <span className="pr-4 text-gray-400 font-medium">{suffix}</span>
      )}
    </div>
  );
}

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatLabel?: (value: number) => string;
}

export function SliderInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatLabel,
}: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const label = formatLabel ? formatLabel(value) : String(value);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{formatLabel ? formatLabel(min) : min}</span>
        <span className="text-2xl font-bold text-teal-700">{label}</span>
        <span>{formatLabel ? formatLabel(max) : max}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-teal-600
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
          style={{
            background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
          }}
        />
      </div>
    </div>
  );
}

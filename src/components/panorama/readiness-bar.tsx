'use client';

import { useEffect, useState } from 'react';

interface ReadinessBarProps {
  score: number; // 0-100
  label: string;
}

export function ReadinessBar({ score, label }: ReadinessBarProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 400);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (score >= 75) return '#16a34a'; // green
    if (score >= 50) return '#d97706'; // amber
    if (score >= 35) return '#f59e0b'; // lighter amber
    return '#dc2626'; // red
  };

  const ticks = ['Needs Work', '', 'Developing', '', 'Moderate', '', 'On Track', '', 'Strong'];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Overall Financial Readiness</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Composite score across all five dimensions
          </p>
        </div>
        <div className="text-right">
          <span
            className="text-3xl font-bold"
            style={{ color: getColor() }}
          >
            {score}
          </span>
          <span className="text-lg text-gray-400 font-medium">/100</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative mb-3">
        <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${animatedScore}%`,
              background: `linear-gradient(to right, #dc2626 0%, #d97706 35%, #16a34a 75%, #15803d 100%)`,
            }}
          />
        </div>
        {/* Indicator */}
        <div
          className="absolute top-0 h-5 w-0.5 bg-gray-800 rounded-full transition-all duration-1000 ease-out"
          style={{ left: `${animatedScore}%` }}
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>Needs Work</span>
        <span>Developing</span>
        <span>Moderate</span>
        <span>On Track</span>
        <span>Strong</span>
      </div>

      {/* Label */}
      <div
        className="mt-4 px-4 py-2.5 rounded-xl text-sm font-medium"
        style={{
          backgroundColor: `${getColor()}15`,
          color: getColor(),
          border: `1px solid ${getColor()}30`,
        }}
      >
        {label}
      </div>

      {/* Dimension breakdown */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        Retirement (30%) · Education (25%) · Monthly (25%) · Parents (10%) · Career (10%)
      </p>
    </div>
  );
}

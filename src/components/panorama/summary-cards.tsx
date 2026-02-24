'use client';

import { Panorama } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface SummaryCardsProps {
  panorama: Panorama;
}

export function SummaryCards({ panorama }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Family Net Worth',
      value: formatCurrency(panorama.net_worth_estimate),
      sub:
        panorama.net_worth_estimate >= 0
          ? 'Total assets minus debts'
          : 'Net liabilities position',
      icon: '🏦',
      positive: panorama.net_worth_estimate >= 0,
      delay: 'delay-100',
    },
    {
      label: 'Monthly Cash Flow',
      value:
        (panorama.monthly_cash_flow >= 0 ? '+' : '') +
        formatCurrency(panorama.monthly_cash_flow) +
        '/mo',
      sub: panorama.monthly_cash_flow >= 0 ? 'Monthly surplus' : 'Monthly deficit',
      icon: '📊',
      positive: panorama.monthly_cash_flow >= 0,
      delay: 'delay-200',
    },
    {
      label: 'Savings Rate',
      value: formatPercent(panorama.savings_rate),
      sub:
        panorama.savings_rate >= 15
          ? 'Strong — above 15% benchmark'
          : panorama.savings_rate >= 10
          ? 'Moderate — approaching benchmark'
          : 'Below 10% target',
      icon: '💰',
      positive: panorama.savings_rate >= 10,
      delay: 'delay-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`animate-fade-slide-up ${card.delay} opacity-0`}
          padding="md"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{card.icon}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                card.positive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {card.positive ? '▲' : '▼'}
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {card.label}
          </p>
          <p
            className={`text-2xl font-bold ${
              card.positive ? 'text-gray-900' : 'text-red-600'
            }`}
          >
            {card.value}
          </p>
          <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
        </Card>
      ))}
    </div>
  );
}

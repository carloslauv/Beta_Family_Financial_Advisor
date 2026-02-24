import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMonthly(amount: number): string {
  if (amount < 0) return `-$${Math.abs(amount).toLocaleString()}/mo`;
  return `$${amount.toLocaleString()}/mo`;
}

// Parse range strings like "$300K-$500K", "$1M+", "$0-$50K"
export function getRangeMidpoint(range: string): number {
  if (!range) return 0;

  // Handle "$1M+" style
  if (range.includes('1M+')) return 1_500_000;
  if (range.includes('M+')) {
    const m = parseFloat(range);
    return m * 1_000_000 * 1.5;
  }

  // Normalize: remove $ signs, spaces
  const normalized = range.replace(/\$/g, '').replace(/,/g, '').trim();

  // Handle "+" suffix (e.g. "1M+")
  if (normalized.endsWith('+')) {
    const val = parseValue(normalized.slice(0, -1));
    return val * 1.5;
  }

  // Handle ranges with "-" (e.g. "300K-500K", "50K-150K")
  const parts = normalized.split('-').map((p) => p.trim());
  if (parts.length === 2) {
    const low = parseValue(parts[0]);
    const high = parseValue(parts[1]);
    return (low + high) / 2;
  }

  return parseValue(normalized);
}

function parseValue(str: string): number {
  const s = str.trim().toUpperCase();
  if (s.endsWith('M')) return parseFloat(s) * 1_000_000;
  if (s.endsWith('K')) return parseFloat(s) * 1_000;
  return parseFloat(s) || 0;
}

export function getEmergencyMonthsValue(range: string): number {
  const map: Record<string, number> = {
    'Less than 1': 0.5,
    '1-3': 2,
    '3-6': 4.5,
    '6-12': 9,
    '12+': 15,
  };
  return map[range] ?? 0;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

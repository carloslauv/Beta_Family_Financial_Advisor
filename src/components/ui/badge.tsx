import { cn } from '@/lib/utils';

type StatusType = 'on_track' | 'needs_attention' | 'behind' | 'uncertain' | 'unplanned';

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  on_track: {
    label: 'On Track',
    className: 'bg-green-100 text-green-800 border border-green-200',
  },
  needs_attention: {
    label: 'Needs Attention',
    className: 'bg-amber-100 text-amber-800 border border-amber-200',
  },
  behind: {
    label: 'Behind',
    className: 'bg-red-100 text-red-800 border border-red-200',
  },
  uncertain: {
    label: 'Uncertain',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  unplanned: {
    label: 'Unplanned',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'teal' | 'amber' | 'green' | 'red' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    teal: 'bg-teal-100 text-teal-800',
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

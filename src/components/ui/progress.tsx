import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  color?: 'teal' | 'green' | 'amber' | 'red';
}

export function Progress({
  value,
  className,
  barClassName,
  size = 'md',
  animate = true,
  color = 'teal',
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    teal: 'bg-teal-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div
      className={cn('w-full bg-gray-100 rounded-full overflow-hidden', heights[size], className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all',
          animate && 'duration-1000 ease-out',
          colors[color],
          barClassName
        )}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

interface StepProgressProps {
  totalSteps: number;
  currentStep: number; // 1-based
  labels?: string[];
}

export function StepProgress({ totalSteps, currentStep, labels }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={i} className="flex items-center">
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                isCompleted && 'bg-teal-600',
                isCurrent && 'bg-teal-600 scale-125',
                !isCompleted && !isCurrent && 'bg-gray-200'
              )}
              title={labels?.[i]}
            />
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-0.5 transition-all duration-300',
                  isCompleted ? 'bg-teal-600' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

import { motion } from 'framer-motion';
import { useStages } from '@/hooks/useCatalog';
import { cn } from '@/lib/utils';

/**
 * Shop by stage.
 *
 * A growth timeline rather than a dropdown. It starts at Preemie, which is the
 * whole point — preterm sizing gets a first-class place in the navigation
 * instead of being buried as a filter, and parents who need it find it in one
 * glance.
 */
interface StageSelectorProps {
  value: string | null;
  onChange: (slug: string | null) => void;
  className?: string;
}

export function StageSelector({ value, onChange, className }: StageSelectorProps) {
  const { data: stages } = useStages();

  if (!stages) return null;

  return (
    <div className={cn('w-full', className)}>
      <div className="nice-scroll flex gap-2 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const active = value === stage.slug;
          return (
            <button
              key={stage.slug}
              onClick={() => onChange(active ? null : stage.slug)}
              aria-pressed={active}
              className={cn(
                'relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200',
                active
                  ? 'text-ink'
                  : 'text-ink-soft hover:bg-surface-sunk hover:text-ink',
              )}
            >
              {/* The pill slides between stages rather than blinking. */}
              {active && (
                <motion.span
                  layoutId="stage-pill"
                  className="absolute inset-0 rounded-full bg-[hsl(var(--accent)/0.35)] shadow-plush-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative whitespace-nowrap">{stage.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* The selected stage explains itself — useful for first-time parents. */}
      {value && (
        <p className="mt-1 px-1 text-xs text-ink-soft">
          {stages.find((s) => s.slug === value)?.description}
        </p>
      )}
    </div>
  );
}

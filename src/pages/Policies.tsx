import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RingDivider } from '@/components/brand/ComfortRing';
import { usePolicy } from '@/hooks/useCatalog';
import { useUI } from '@/store/ui';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'privacy', label: 'Privacy' },
  { key: 'terms', label: 'Terms' },
  { key: 'returns', label: 'Returns' },
];

export function Policies() {
  const { policy } = useParams();
  const activeKey = policy ?? 'privacy';
  const { data: current, isPending } = usePolicy(activeKey);
  const setAccent = useUI((s) => s.setAccent);

  useEffect(() => {
    setAccent('lavender');
  }, [setAccent]);

  if (isPending || !current) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="skeleton mx-auto h-8 w-1/2 rounded-full" />
        <div className="skeleton mt-6 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">
            Policies
          </p>
          <h1 className="mt-2 font-display text-display-lg font-bold">{current.title}</h1>
          <RingDivider className="mx-auto mt-4" />
          <p className="mt-3 text-sm text-ink-faint">Last updated {current.updated}</p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex justify-center gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              to={`/policies/${tab.key}`}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                activeKey === tab.key
                  ? 'bg-ink text-cream'
                  : 'bg-surface text-ink-soft shadow-plush-sm hover:text-ink',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="space-y-4 leading-relaxed text-ink-soft">
          {current.body.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </>
  );
}

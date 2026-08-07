import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';

/**
 * Generic "nothing here" shell. Every Phase 2–5 route now has a real page —
 * this remains only as the 404 view and a reusable pattern if a future
 * route needs a stand-in again.
 */
export function Placeholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
        <span className="rounded-full bg-[hsl(var(--accent)/0.22)] px-4 py-1.5 text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">
          {phase}
        </span>
        <h1 className="mt-5 font-display text-display-lg font-bold">{title}</h1>
        <RingDivider className="mt-4" />
        <p className="mt-5 text-base leading-relaxed text-ink-soft">{description}</p>
        <PlushButton to="/" className="mt-8">
          Back to the shop
        </PlushButton>
      </div>
    </section>
  );
}

export const NotFoundPage = () => (
  <Placeholder
    phase="404"
    title="This page went for a nap"
    description="The page you were looking for does not exist. Let's get you back to the shop."
  />
);

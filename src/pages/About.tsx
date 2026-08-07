import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, MapPin, Ruler, Truck } from 'lucide-react';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { useUI } from '@/store/ui';
import type { ColorKey } from '@/lib/services/types';
import { ACCENTS } from '@/lib/theme';

const VALUES: { icon: typeof HeartHandshake; title: string; body: string; hue: ColorKey }[] = [
  {
    icon: Ruler,
    title: 'Sizes that actually fit',
    body: 'Preemie and newborn sizing gets a first-class place in every category, not a bolted-on filter.',
    hue: 'pink',
  },
  {
    icon: HeartHandshake,
    title: 'Genuine, never counterfeit',
    body: 'Every product is sourced directly from brands and distributors we can vouch for.',
    hue: 'mint',
  },
  {
    icon: Truck,
    title: 'Same-day across Kigali',
    body: 'Ordered before 2pm, delivered today — by motorbike for most orders, by car or van for anything too large.',
    hue: 'sky',
  },
  {
    icon: MapPin,
    title: 'Built for Rwandan families',
    body: 'Chosen, priced and delivered with Kigali in mind, not adapted from somewhere else.',
    hue: 'sunny',
  },
];

export function About() {
  const setAccent = useUI((s) => s.setAccent);

  useEffect(() => {
    setAccent('lavender');
  }, [setAccent]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">
            About Ibibondo
          </p>
          <h1 className="mt-2 font-display text-display-lg font-bold">
            Everything your little one needs, from the very first day
          </h1>
          <RingDivider className="mx-auto mt-4" />
          <p className="mt-5 leading-relaxed text-ink-soft">
            Ibibondo started with a simple frustration: a preemie bodysuit shouldn&rsquo;t be
            harder to find in Kigali than anything else a family needs. We built a shop
            around the sizes and essentials that get treated as an afterthought everywhere
            else — and then made sure the rest of the range was just as carefully chosen.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">Why we started here</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              A baby born early or small needs clothes, feeding equipment and care products
              sized for them — not a newborn outfit that swamps them until the day it
              suddenly doesn&rsquo;t. Families told us they were improvising, altering, or
              importing to solve this. We decided to stock the answer instead.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">What we promise</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              Every product on Ibibondo is something we&rsquo;d hand to our own family —
              genuine, correctly sized, and delivered the way it needs to be. A bottle
              arrives by motorbike within hours; a cot arrives by van, carefully, because
              that&rsquo;s what it actually needs.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-sunk/60 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body, hue }, i) => {
              const accent = ACCENTS[hue];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="rounded-3xl bg-surface p-5 shadow-plush-sm"
                >
                  <span
                    className="grid h-11 w-11 place-items-center rounded-2xl"
                    style={{ backgroundColor: `hsl(${accent.surface} / 0.22)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: `hsl(${accent.ink})` }} aria-hidden />
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl font-bold">Have a question first?</h2>
        <p className="mt-3 text-ink-soft">
          We answer WhatsApp, phone and email seven days a week — real people, not a queue.
        </p>
        <PlushButton to="/contact" className="mt-6">
          Get in touch
        </PlushButton>
      </section>
    </>
  );
}

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, MapPin, Ruler, Truck } from 'lucide-react';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { useSeo } from '@/hooks/useSeo';
import { useUI } from '@/store/ui';
import type { ColorKey } from '@/lib/services/types';
import { ACCENTS } from '@/lib/theme';

const VALUES: { icon: typeof HeartHandshake; title: string; body: string; hue: ColorKey }[] = [
  {
    icon: Ruler,
    title: 'Sizes and fits that make sense',
    body: 'From preemie sizing to family-size cookware, every product is chosen to genuinely fit its purpose — not a one-size-fits-all afterthought.',
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

  useSeo({
    title: 'About Hill Store',
    description:
      'Hill Store started with a mother who simply wanted to shop safely and conveniently. Today we bring kitchen, dining, cleaning, bedroom and baby essentials to families across Kigali.',
    path: '/about',
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">
            About Hill Store
          </p>
          <h1 className="mt-2 font-display text-display-lg font-bold">
            Everything your home needs within every family&rsquo;s reach
          </h1>
          <RingDivider className="mx-auto mt-4" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold">Our Story — Born from a Mother&rsquo;s Need</h2>
        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">
          <p>Hillstore started with a mother who simply wanted to shop safely and conveniently.</p>
          <p>
            While expecting her baby, she found it difficult to visit crowded markets and busy
            shopping areas. She worried about being accidentally hit by people carrying heavy
            items on their heads, and navigating crowded places became uncomfortable and
            stressful during pregnancy.
          </p>
          <p>
            That experience inspired a simple idea: what if families could access the things
            they need without having to struggle through crowded markets?
          </p>
          <p>
            From that personal experience, Hillstore was born — with a mission to bring
            essential products closer to families through convenient shopping.
          </p>
          <p>
            Today, Hillstore brings together kitchen and dining items, cleaning and household
            products, bedroom essentials, and baby products, making everyday shopping easier
            and more accessible.
          </p>
        </div>

        <h2 className="mt-10 font-display text-2xl font-bold">Our belief</h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Every family deserves access to the essentials they need — safely, conveniently, and
          within reach.
        </p>
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

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { useUI } from '@/store/ui';

const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  message: z.string().min(10, 'A few more words would help us help you'),
});
type ContactForm = z.infer<typeof contactSchema>;

const CARDS = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    body: 'Fastest way to reach us — answered seven days a week.',
    href: 'https://wa.me/250788748921?text=Hello%20Hill%20Store!%20I%20have%20a%20question.',
    label: '+250 788 748 921',
  },
  {
    icon: Phone,
    title: 'Phone',
    body: 'For anything easier to say out loud.',
    href: 'tel:+250788748921',
    label: '+250 788 748 921',
  },
  {
    icon: Mail,
    title: 'Email',
    body: 'For order references, receipts and anything in writing.',
    href: 'mailto:hello@hillstore.rw',
    label: 'hello@hillstore.rw',
  },
];

export function Contact() {
  const setAccent = useUI((s) => s.setAccent);

  useEffect(() => {
    setAccent('sky');
  }, [setAccent]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async () => {
    // No backend yet — this is where the Edge Function call lands later.
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Message sent', { description: 'We usually reply within a few hours.' });
    reset();
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">Contact</p>
          <h1 className="mt-2 font-display text-display-lg font-bold">Talk to a real person</h1>
          <RingDivider className="mx-auto mt-4" />
          <p className="mt-4 max-w-xl mx-auto text-ink-soft">
            Questions about sizing, an order, or whether something needs van delivery —
            answered seven days a week.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* -------------------------------------------------------- info */}
          <div className="space-y-4">
            {CARDS.map(({ icon: Icon, title, body, href, label }) => (
              <a
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="flex items-start gap-4 rounded-3xl bg-surface p-5 shadow-plush-sm transition-shadow duration-200 hover:shadow-plush"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--accent)/0.2)]">
                  <Icon className="h-5 w-5 text-[hsl(var(--accent-ink))]" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-base font-bold">{title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{body}</p>
                  <p className="mt-1 text-sm font-semibold text-[hsl(var(--accent-ink))]">{label}</p>
                </div>
              </a>
            ))}

            <div className="flex items-start gap-4 rounded-3xl bg-surface p-5 shadow-plush-sm">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--accent)/0.2)]">
                <Clock className="h-5 w-5 text-[hsl(var(--accent-ink))]" aria-hidden />
              </span>
              <div>
                <p className="font-display text-base font-bold">Hours</p>
                <p className="mt-0.5 text-sm text-ink-soft">Every day, 7am – 9pm</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl bg-surface p-5 shadow-plush-sm">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--accent)/0.2)]">
                <MapPin className="h-5 w-5 text-[hsl(var(--accent-ink))]" aria-hidden />
              </span>
              <div>
                <p className="font-display text-base font-bold">Based in</p>
                <p className="mt-0.5 text-sm text-ink-soft">Kigali, Rwanda</p>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------- form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 rounded-3xl bg-surface p-6 shadow-plush sm:p-8"
          >
            <label className="block">
              <span className="text-sm font-semibold text-ink">Your name</span>
              <input
                {...register('name')}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
                placeholder="Uwase Divine"
              />
              {errors.name && (
                <span className="mt-1 block text-xs text-pink-deep">{errors.name.message}</span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Email</span>
              <input
                type="email"
                {...register('email')}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
                placeholder="you@example.com"
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-pink-deep">{errors.email.message}</span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Message</span>
              <textarea
                {...register('message')}
                rows={5}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
                placeholder="How can we help?"
              />
              {errors.message && (
                <span className="mt-1 block text-xs text-pink-deep">{errors.message.message}</span>
              )}
            </label>

            <PlushButton type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Sending…' : 'Send message'}
            </PlushButton>
          </form>
        </div>
      </div>
    </>
  );
}

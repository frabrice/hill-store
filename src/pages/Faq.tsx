import { useEffect } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { RingDivider } from '@/components/brand/ComfortRing';
import { useUI } from '@/store/ui';

const FAQS: { question: string; answer: string; topic: string }[] = [
  {
    topic: 'Delivery',
    question: 'How fast is delivery in Kigali?',
    answer:
      'Same day if you order before 2pm — most orders arrive by motorbike within a few hours. Orders placed later go out first thing the next morning.',
  },
  {
    topic: 'Delivery',
    question: 'Why do some items say they need a car or van?',
    answer:
      'A motorbike can only safely carry so much. Anything over about 70cm on a side or 15kg — a cot, a stroller, a car seat — automatically switches to car or van delivery on the product page, so the fee and timing you see already account for it.',
  },
  {
    topic: 'Delivery',
    question: 'Do you deliver outside Kigali?',
    answer:
      'Yes — orders outside the city typically take 2–3 days. See the Delivery & zones page for exact fees by area.',
  },
  {
    topic: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'Mobile Money (MTN and Airtel), Visa and Mastercard, all at checkout.',
  },
  {
    topic: 'Sizing',
    question: 'My baby was born early — what size should I buy?',
    answer:
      'Start with our Preemie stage filter, or check the weight range in each product’s Size & weight details — preemie sizing is based on weight, not age, since that’s what actually determines fit.',
  },
  {
    topic: 'Sizing',
    question: 'What if the size is wrong when it arrives?',
    answer:
      'Check it at the door — if the size isn’t right, just hand it straight back to the delivery rider on the spot. We offer a 100% refund, no need to arrange a separate return. See our Refunds & returns policy for the full details.',
  },
  {
    topic: 'Orders',
    question: 'Can I change or cancel an order after placing it?',
    answer:
      'Message us on WhatsApp as soon as you can — if it hasn’t left for delivery yet, we can usually adjust or cancel it.',
  },
  {
    topic: 'Orders',
    question: 'Do you sell genuine products?',
    answer:
      'Always. Everything is sourced directly from brands and distributors we can vouch for — nothing counterfeit, ever.',
  },
];

export function Faq() {
  const setAccent = useUI((s) => s.setAccent);

  useEffect(() => {
    setAccent('mint');
  }, [setAccent]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">
            Frequently asked
          </p>
          <h1 className="mt-2 font-display text-display-lg font-bold">Questions, answered</h1>
          <RingDivider className="mx-auto mt-4" />
          <p className="mt-4 text-ink-soft">
            Delivery, payment, sizing and returns — the things that stop people ordering.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <Accordion.Root type="single" collapsible className="space-y-3">
          {FAQS.map(({ question, answer, topic }) => (
            <Accordion.Item
              key={question}
              value={question}
              className="overflow-hidden rounded-2xl bg-surface shadow-plush-sm"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span>
                    <span className="block text-[0.65rem] font-bold uppercase tracking-wide text-[hsl(var(--accent-ink))]">
                      {topic}
                    </span>
                    <span className="mt-0.5 block font-display text-base font-bold text-ink">
                      {question}
                    </span>
                  </span>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-ink-faint transition-transform duration-300 ease-plush group-data-[state=open]:rotate-180"
                    aria-hidden
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden text-sm text-ink-soft data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <p className="px-5 pb-4 leading-relaxed">{answer}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </>
  );
}

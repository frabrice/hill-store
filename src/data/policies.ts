import type { Policy } from '@/lib/services/types';

/**
 * The three legal pages every store needs. Migrated from what used to be
 * hardcoded directly in `pages/Policies.tsx` — now editable from admin, with
 * the storefront page just rendering whatever's here.
 */
export const policies: Policy[] = [
  {
    key: 'privacy',
    title: 'Privacy policy',
    updated: '1 July 2026',
    body: [
      'Ibibondo collects only what it needs to fulfil an order: your name, phone number, delivery address, and the items you’ve bought. We never sell or share this information with anyone outside what’s needed to get your order to you — our delivery riders, and the payment provider that processes your transaction.',
      'Browsing the shop doesn’t require an account, and we don’t track you across other sites. Wishlist and basket contents are stored on your own device so they’re there when you come back, not on a server tied to your identity.',
      'You can ask us to delete any information we hold about you at any time — message us on WhatsApp or email hello@ibibondo.rw and we’ll action it within a few days.',
    ].join('\n\n'),
  },
  {
    key: 'terms',
    title: 'Terms & conditions',
    updated: '1 July 2026',
    body: [
      'By placing an order with Ibibondo, you’re agreeing to pay the listed price plus the delivery fee shown at checkout for your zone. Prices are in Rwandan francs and can change without notice, but never after an order is confirmed.',
      'We make every reasonable effort to keep stock counts accurate. On the rare occasion something sells out between your order and dispatch, we’ll contact you before substituting or refunding — never silently.',
      'Delivery timing (same-day, next-day, or 2–3 days outside Kigali) is an estimate based on your zone and the item’s size, not a guarantee against traffic, weather or events outside our control.',
    ].join('\n\n'),
  },
  {
    key: 'returns',
    title: 'Refunds & returns',
    updated: '4 August 2026',
    body: [
      'Ibibondo offers a 100% refund on every order — checked at your door, not weeks later. When your delivery arrives, open it in front of the rider and make sure everything is right before they leave.',
      'If anything isn’t right — wrong item, wrong size, or you’ve simply changed your mind — hand it straight back to the delivery rider on the spot. There’s no need to repackage it later or arrange a separate collection; the return happens in the same visit as the delivery.',
      'Once the rider confirms the return, your refund is processed in full back to the payment method you used. If you weren’t able to check the order at the door for any reason, message us on WhatsApp within 24 hours and we’ll arrange a collection instead.',
    ].join('\n\n'),
  },
];

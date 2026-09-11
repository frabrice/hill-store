import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/brand/SocialIcons';
import { useSettings } from '@/hooks/useCatalog';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { to: '/shop', label: 'All products' },
      { to: '/shop/kitchen-ware', label: 'Kitchenwares' },
      { to: '/shop/dining-items', label: 'Dinning items' },
      { to: '/shop/cleaning-supplies', label: 'Cleaning supplies' },
      { to: '/shop/bedroom-comfort', label: 'Bedroom and comfort products' },
      { to: '/shop/baby-essentials', label: 'Baby Essentials' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { to: '/about', label: 'Our story' },
      { to: '/faq', label: 'Frequently asked' },
      { to: '/contact', label: 'Contact us' },
    ],
  },
  {
    title: 'Help',
    links: [
      { to: '/delivery', label: 'Delivery & zones' },
      { to: '/policies/returns', label: 'Returns' },
      { to: '/policies/privacy', label: 'Privacy policy' },
      { to: '/policies/terms', label: 'Terms & conditions' },
    ],
  },
];

const SOCIAL_LINKS = [
  { key: 'facebookUrl' as const, label: 'Facebook', Icon: FacebookIcon },
  { key: 'instagramUrl' as const, label: 'Instagram', Icon: InstagramIcon },
  { key: 'tiktokUrl' as const, label: 'TikTok', Icon: TikTokIcon },
  { key: 'twitterUrl' as const, label: 'X (Twitter)', Icon: X },
];

export function Footer() {
  const { data: settings } = useSettings();

  return (
    <footer className="mt-24 border-t border-hairline bg-surface pb-24 lg:pb-0">
      <div className="comfort-gradient h-1" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size="md" withTagline />
            <p className="mt-3 max-w-xs font-display text-sm font-bold italic text-ink-soft">
              Everything Your Home Needs, Within Every Family&rsquo;s Reach
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              From kitchen to nursery, from cleaning to everyday living —
              quality essentials made accessible to every family.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[hsl(var(--accent-ink))]" aria-hidden />
                <a href={`tel:${settings?.contactPhone.replace(/\s/g, '') ?? ''}`} className="hover:text-ink">
                  {settings?.contactPhone ?? '+250 788 748 921'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[hsl(var(--accent-ink))]" aria-hidden />
                <a href={`mailto:${settings?.contactEmail ?? 'hello@hillstore.rw'}`} className="hover:text-ink">
                  {settings?.contactEmail ?? 'hello@hillstore.rw'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[hsl(var(--accent-ink))]" aria-hidden />
                Kigali, Rwanda
              </li>
            </ul>

            {settings && (
              <div className="mt-6 flex items-center gap-2.5">
                {SOCIAL_LINKS.filter((s) => settings[s.key]).map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={settings[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full bg-surface-sunk text-ink-soft transition-colors hover:bg-[hsl(var(--accent)/0.25)] hover:text-[hsl(var(--accent-ink))]"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                ))}
              </div>
            )}
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-soft transition-colors hover:text-[hsl(var(--accent-ink))]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-hairline pt-6 text-xs text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Hill Store. All rights reserved.</p>
          <p>Made in Kigali</p>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Heart, Moon, Search, ShoppingBag, Sun, Truck, User } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useCategories, useSettings } from '@/hooks/useCatalog';
import { useCart, selectCount } from '@/store/cart';
import { useWishlist, selectWishlistCount } from '@/store/wishlist';
import { useUI } from '@/store/ui';
import { useAuth } from '@/lib/supabase/auth';
import { resolveIcon } from '@/lib/icons';
import { rwfFull } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Matches the store's default until settings load — same fallback CartDrawer uses. */
const FALLBACK_FREE_DELIVERY_THRESHOLD = 50000;

const NAV = [
  { to: '/shop', label: 'Shop' },
  { to: '/kits', label: 'Kits' },
  { to: '/learn', label: 'Learn' },
  { to: '/about', label: 'About' },
];

export function Header() {
  const { data: categories } = useCategories();
  const { data: settings } = useSettings();
  const count = useCart(selectCount);
  const wishlistCount = useWishlist(selectWishlistCount);
  const { theme, toggleTheme, setCartOpen, setSearchOpen, setAccent } = useUI();
  const { user } = useAuth();
  const [lifted, setLifted] = useState(false);
  const freeDeliveryThreshold = settings?.freeDeliveryThresholdRwf ?? FALLBACK_FREE_DELIVERY_THRESHOLD;

  // The header gains its shadow only once you have left the top of the page.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
    {/* Brand row: delivery strip + logo/nav/actions. Stays fully sticky
        below `md` (there's no separate category bar there to hand off to),
        but at `md` and up it scrolls away normally — only the category
        strip below stays pinned once you've scrolled past this.
        `sticky`/`md:static` live on <header> itself rather than an inner
        wrapper: a sticky element can only stay pinned for as long as its
        *own parent* is still in view, and a wrapper div sized to fit only
        this content would give it nowhere to stick beyond its own height.
        As a direct child of the full-page layout column, <header> has the
        room it needs — same reasoning as the category strip below. */}
    <header className="sticky top-0 z-50 md:static">
        {/* Delivery promise — the single most reassuring thing we can say, and
            the first brand colour a visitor sees, above the fold on every page. */}
        <div className="comfort-gradient hidden px-4 py-1.5 text-center text-xs font-semibold text-ink sm:block">
          <span className="inline-flex items-center gap-2 drop-shadow-[0_1px_1px_hsl(var(--surface)/0.4)]">
            <Truck className="h-3.5 w-3.5" aria-hidden />
            Same-day delivery across Kigali · Free over {rwfFull(freeDeliveryThreshold)}
          </span>
        </div>

        <div
          className={cn(
            'border-b border-hairline bg-surface/85 backdrop-blur-xl transition-shadow duration-300',
            lifted && 'shadow-plush',
          )}
        >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="shrink-0" aria-label="Hill Store — home">
            <Logo size="sm" />
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                    isActive
                      ? 'bg-[hsl(var(--accent)/0.22)] text-[hsl(var(--accent-ink))]'
                      : 'text-ink-soft hover:bg-surface-sunk hover:text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {/* Search reads as a field on desktop, an icon on mobile. */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-full bg-surface-sunk px-4 py-2.5 text-sm text-ink-faint transition-colors duration-200 hover:text-ink-soft md:flex"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span>Search products…</span>
              <kbd className="ml-6 rounded bg-surface px-1.5 py-0.5 font-sans text-[0.65rem] font-semibold text-ink-faint shadow-plush-sm">
                Ctrl K
              </kbd>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-surface-sunk hover:text-ink active:scale-[0.94] md:hidden"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>

            {/* Night-feed mode. */}
            <button
              onClick={toggleTheme}
              aria-label={
                theme === 'day' ? 'Switch to night-feed mode' : 'Switch to day mode'
              }
              title={theme === 'day' ? 'Night-feed mode' : 'Day mode'}
              className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-surface-sunk hover:text-ink active:scale-[0.94]"
            >
              {theme === 'day' ? (
                <Moon className="h-5 w-5" aria-hidden />
              ) : (
                <Sun className="h-5 w-5" aria-hidden />
              )}
            </button>

            <Link
              to="/account"
              aria-label={user ? 'Your account' : 'Sign in'}
              className="relative hidden h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-surface-sunk hover:text-ink active:scale-[0.94] sm:grid"
            >
              <User className="h-5 w-5" aria-hidden />
              {user && (
                <span
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[hsl(var(--accent-ink))]"
                  aria-hidden
                />
              )}
            </Link>

            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}`}
              className="relative hidden h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-surface-sunk hover:text-ink active:scale-[0.94] sm:grid"
            >
              <Heart className="h-5 w-5" aria-hidden />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[hsl(var(--accent-ink))] px-1 text-[0.65rem] font-bold text-cream">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              id="cart-target"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
              className="relative grid h-11 w-11 place-items-center rounded-full text-ink transition-colors duration-200 hover:bg-surface-sunk active:scale-[0.94]"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[hsl(var(--accent-ink))] px-1 text-[0.65rem] font-bold text-cream">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
        </div>
    </header>

    {/* Category strip — a sub-header of its own, deliberately a sibling of
        <header> rather than nested inside it. A sticky element can only stay
        pinned for as long as its containing block (here, its parent) is
        still in view — nested inside the ~11rem-tall header it would un-stick
        the moment that header scrolled past. As a sibling within the
        full-page layout column it has the whole page to stay pinned against.
        Below `md` it's hidden (Shop's own category chips cover mobile
        instead). At `md` and up it's independently sticky, so it's the one
        thing still pinned once the brand row above has scrolled out of view
        — always reachable while browsing. Hovering a category previews its
        colour. */}
    <div className="sticky top-0 z-40 hidden border-b border-hairline bg-surface/85 backdrop-blur-xl md:block">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {categories?.map((category) => {
            const Icon = resolveIcon(category.icon);
            return (
              <NavLink
                key={category.slug}
                to={`/shop/${category.slug}`}
                onMouseEnter={() => setAccent(category.colorKey)}
                className={({ isActive }) =>
                  cn(
                    'group inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-plush',
                    isActive
                      ? 'bg-[hsl(var(--accent)/0.25)] text-[hsl(var(--accent-ink))]'
                      : 'text-ink-soft hover:-translate-y-0.5 hover:bg-surface-sunk hover:text-ink',
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {category.name}
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
}

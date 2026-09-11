import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, Store } from 'lucide-react';
import { useCart, selectCount } from '@/store/cart';
import { useUI } from '@/store/ui';
import { cn } from '@/lib/utils';

/**
 * Bottom navigation, mobile only.
 *
 * Deliberate: most of these parents will arrive on a phone, often one-handed
 * and often at night. Putting the primary actions within thumb reach at the
 * bottom of the screen matters more here than on a typical store.
 */

const TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/shop', label: 'Shop', icon: Store, end: false },
];

export function MobileNav() {
  const count = useCart(selectCount);
  const { setSearchOpen, setCartOpen } = useUI();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-semibold transition-colors duration-200 active:scale-[0.94]',
                isActive ? 'text-[hsl(var(--accent-ink))]' : 'text-ink-faint',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid h-8 w-12 place-items-center rounded-full transition-colors duration-200',
                    isActive && 'bg-[hsl(var(--accent)/0.25)]',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-semibold text-ink-faint transition-colors duration-200 active:scale-[0.94]"
        >
          <span className="grid h-8 w-12 place-items-center rounded-full">
            <Search className="h-5 w-5" aria-hidden />
          </span>
          Search
        </button>

        <button
          onClick={() => setCartOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-semibold text-ink-faint transition-colors duration-200 active:scale-[0.94]"
          aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
        >
          <span className="relative grid h-8 w-12 place-items-center rounded-full">
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {count > 0 && (
              <span className="absolute right-1.5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[hsl(var(--accent-ink))] px-1 text-[0.6rem] font-bold text-cream">
                {count}
              </span>
            )}
          </span>
          Cart
        </button>
      </div>
    </nav>
  );
}

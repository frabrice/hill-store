import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';

/**
 * The management dashboard's own shell — separate from `RootLayout`. No
 * storefront header, footer, cart drawer or WhatsApp button belongs here;
 * this is a different application that happens to share a codebase.
 *
 * The outer frame is pinned to the viewport height with nothing scrolling at
 * that level — only `<main>` scrolls, so the sidebar and topbar stay put
 * exactly like a real desktop app rather than travelling with the page.
 */
export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  // Every route change starts at the top of the new page — of `<main>`,
  // since that's the element that actually scrolls here.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-cream font-sans">
      <Sidebar />

      <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in lg:hidden" />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-[80] w-64 bg-surface shadow-plush-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Sidebar className="flex h-full" collapsible={false} />
            <Dialog.Close asChild>
              <button
                aria-label="Close menu"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-sunk"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-hairline bg-surface px-4 lg:px-8">
          <button
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-surface-sunk lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <p className="text-sm font-semibold text-ink-faint">Management dashboard</p>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

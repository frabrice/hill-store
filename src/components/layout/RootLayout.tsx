import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { CartDrawer } from './CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { WhatsAppButton } from './WhatsAppButton';
import { ScrollRibbon } from '@/components/brand/ComfortRing';

/** Every route change starts at the top of the new page. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function RootLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollRibbon />
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <MobileNav />
      <CartDrawer />
      <SearchOverlay />
      <WhatsAppButton />
    </div>
  );
}

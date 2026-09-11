import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { Search, TrendingUp } from 'lucide-react';
import { ProductImage } from '@/components/shop/ProductImage';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useUI } from '@/store/ui';
import { rwfFull } from '@/lib/format';
import type { ColorKey } from '@/lib/services/types';

const SUGGESTIONS = ['Cookware', 'Cleaning bins', 'Bedding', 'Baby bottles', 'Towels'];

/**
 * Command-palette search.
 *
 * Opens on Ctrl/Cmd-K or from the header. Results are instant and show a
 * thumbnail and price, so a shopper can recognise what they want without
 * loading a results page first.
 */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data: products } = useProducts({});
  const { data: categories } = useCategories();

  const colorFor = useMemo(() => {
    const map = new Map<string, ColorKey>();
    categories?.forEach((c) => map.set(c.slug, c.colorKey));
    return map;
  }, [categories]);

  // Global keyboard shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  // Clear the box each time it reopens.
  useEffect(() => {
    if (searchOpen) setQuery('');
  }, [searchOpen]);

  const go = (path: string) => {
    setSearchOpen(false);
    navigate(path);
  };

  return (
    <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-ink/30 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in" />

        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[10vh] z-[80] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-3xl bg-surface shadow-plush-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-4"
        >
          <Dialog.Title className="sr-only">Search products</Dialog.Title>

          <Command shouldFilter={false} className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-hairline px-5">
              <Search className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                autoFocus
                placeholder="Search for cookware, bedding, baby essentials…"
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-ink-faint"
              />
              <kbd className="hidden rounded bg-surface-sunk px-1.5 py-0.5 text-[0.65rem] font-semibold text-ink-faint sm:block">
                Esc
              </kbd>
            </div>

            <Command.List className="nice-scroll max-h-[55vh] overflow-y-auto p-2">
              {!query && (
                <div className="p-3">
                  <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                    Popular searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="rounded-full bg-surface-sunk px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-[hsl(var(--accent)/0.22)] hover:text-[hsl(var(--accent-ink))] active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query && (
                <Command.Empty className="px-4 py-10 text-center text-sm text-ink-soft">
                  Nothing matched “{query}”. Try a broader word.
                </Command.Empty>
              )}

              {query &&
                products?.items
                  .filter((p) => {
                    const needle = query.toLowerCase();
                    return (
                      p.name.toLowerCase().includes(needle) ||
                      p.subtitle.toLowerCase().includes(needle) ||
                      p.tags.some((t) => t.includes(needle)) ||
                      p.categorySlug.includes(needle)
                    );
                  })
                  .slice(0, 8)
                  .map((p) => (
                    <Command.Item
                      key={p.id}
                      value={p.slug}
                      onSelect={() => go(`/product/${p.slug}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl p-2 data-[selected=true]:bg-[hsl(var(--accent)/0.16)]"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                        <ProductImage
                          publicId={p.images[0]}
                          alt={p.name}
                          colorKey={colorFor.get(p.categorySlug) ?? 'pink'}
                          art={p.art}
                          width={120}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="truncate text-xs text-ink-faint">{p.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold">
                        {rwfFull(p.priceRwf)}
                      </span>
                    </Command.Item>
                  ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

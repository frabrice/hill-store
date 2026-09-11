// Hill Store — sitemap generator.
//
// Run once at the start of every build (see package.json's "build" script)
// so public/sitemap.xml ships as a static asset with every real product,
// category and article URL. Talks to Supabase directly with a plain
// @supabase/supabase-js client — it can't import src/lib/supabase/client.ts,
// which reads import.meta.env (Vite-only, not available under plain Node).
//
// Deliberately never fails the build: if Supabase can't be reached, it
// falls back to writing the static pages only rather than blocking a
// deploy over a missing sitemap entry.

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const SITE_URL = 'https://www.hill-store.com';

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const STATIC_PAGES: UrlEntry[] = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/shop', changefreq: 'daily', priority: '0.9' },
  { loc: '/kits', changefreq: 'weekly', priority: '0.7' },
  { loc: '/about', changefreq: 'monthly', priority: '0.4' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.4' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5' },
  { loc: '/delivery', changefreq: 'monthly', priority: '0.4' },
  { loc: '/policies/privacy', changefreq: 'yearly', priority: '0.2' },
  { loc: '/policies/terms', changefreq: 'yearly', priority: '0.2' },
  { loc: '/policies/returns', changefreq: 'yearly', priority: '0.2' },
];

function toDateOnly(iso: string | null | undefined): string | undefined {
  return iso ? iso.slice(0, 10) : undefined;
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function fetchDynamicEntries(): Promise<UrlEntry[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('generate-sitemap: VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY not set — static pages only.');
    return [];
  }

  const supabase = createClient(url, key);
  const entries: UrlEntry[] = [];

  const [categories, products] = await Promise.all([
    supabase.from('categories').select('slug'),
    supabase.from('products').select('slug, created_at'),
  ]);

  if (categories.error) console.warn('generate-sitemap: categories fetch failed —', categories.error.message);
  else for (const c of categories.data) entries.push({ loc: `/shop/${c.slug}`, changefreq: 'weekly', priority: '0.8' });

  if (products.error) console.warn('generate-sitemap: products fetch failed —', products.error.message);
  else
    for (const p of products.data)
      entries.push({ loc: `/product/${p.slug}`, lastmod: toDateOnly(p.created_at), changefreq: 'weekly', priority: '0.7' });

  return entries;
}

function toXml(entries: UrlEntry[]): string {
  const body = entries
    .map((e) => {
      const lines = ['  <url>', `    <loc>${SITE_URL}${xmlEscape(e.loc)}</loc>`];
      if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority) lines.push(`    <priority>${e.priority}</priority>`);
      lines.push('  </url>');
      return lines.join('\n');
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

async function main() {
  let dynamic: UrlEntry[] = [];
  try {
    dynamic = await fetchDynamicEntries();
  } catch (err) {
    console.warn('generate-sitemap: dynamic fetch threw, falling back to static pages —', err);
  }

  const entries = [...STATIC_PAGES, ...dynamic];
  writeFileSync('public/sitemap.xml', toXml(entries), 'utf-8');
  console.log(`generate-sitemap: wrote ${entries.length} URLs to public/sitemap.xml`);
}

main();

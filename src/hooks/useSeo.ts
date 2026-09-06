import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Per-page SEO — title, description, canonical URL, Open Graph/Twitter tags,
 * and optional JSON-LD structured data. There's no react-helmet-async or
 * similar here; every tag is upserted directly by a stable selector so
 * navigating between pages updates the existing tags in place instead of
 * piling up duplicates.
 *
 * This runs client-side only. Google's crawler executes JavaScript and will
 * see these correctly — that's what matters for search ranking — but a
 * crawler that doesn't run JS (some social-preview bots) only ever sees the
 * static fallback tags in index.html. Given the goal here is search ranking,
 * not social previews, that's an acceptable trade for not taking on a new
 * dependency for a document-head library.
 */

export const SITE_NAME = 'Hill Store';
export const SITE_URL = 'https://www.hill-store.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/hero-baby-1100.webp`;

export interface SeoOptions {
  /** Full title as it should appear in the tab and in search results —
   * callers include "| Hill Store" themselves where that pattern fits. */
  title: string;
  description: string;
  /** Absolute image URL. Falls back to the brand hero photo when omitted —
   * most products have no real photo yet. */
  image?: string | null;
  /** Path for the canonical URL, e.g. "/product/preemie-bodysuit-set".
   * Defaults to the current route. */
  path?: string;
  type?: 'website' | 'article' | 'product';
  /** One schema.org object (or an array of them) to emit as JSON-LD. */
  jsonLd?: object | object[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSeo({ title, description, image, path, type = 'website', jsonLd }: SeoOptions) {
  const location = useLocation();
  // Objects passed inline are a fresh reference every render — comparing the
  // serialised string instead of the object keeps the effect from re-running
  // (and re-writing the DOM) when nothing about the content actually changed.
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    document.title = title;
    upsertMeta('name', 'description', description);

    const url = `${SITE_URL}${path ?? location.pathname}`;
    upsertLink('canonical', url);

    const ogImage = image ?? DEFAULT_OG_IMAGE;
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:image', ogImage);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);

    let script = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (jsonLdString) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = jsonLdString;
    } else if (script) {
      script.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, path, type, jsonLdString, location.pathname]);
}

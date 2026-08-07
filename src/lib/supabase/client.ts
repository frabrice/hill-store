import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.',
  );
}

/**
 * The one Supabase client for the app. `anon` key only — safe for the
 * browser, every table it can touch is gated by Row Level Security.
 *
 * Deliberately untyped against a generated `Database` schema: there's no
 * Supabase CLI access in this environment to generate one accurately from
 * the live database, and this project's own convention (see
 * `lib/services/types.ts`) already keeps snake_case↔camelCase mapping
 * confined to each service implementation rather than threading a global
 * schema type through the app. Once the CLI is linked, running
 * `supabase gen types typescript` and passing the result to `createClient`
 * here is a safe, additive upgrade.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

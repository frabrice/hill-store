-- `is_staff()` was created in 0001 without an explicit execute grant, unlike
-- `create_order()` (see 0003/0004) which needed one from day one. Supabase
-- doesn't automatically expose a newly created function to the API roles —
-- without this grant, `supabase.rpc('is_staff')` fails with "permission
-- denied", which the client silently treats as "not staff" (see
-- src/lib/supabase/auth.tsx's checkIsStaff). That's why a correctly-listed
-- staff account still saw the "doesn't have dashboard access" screen.
grant execute on function public.is_staff() to anon, authenticated;

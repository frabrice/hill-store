-- ============================================================================
-- Hill Store — rebrand from Ibibondo
--
-- Every stored mention of the old brand name, updated to match. Does NOT
-- touch store_settings.contact_email (ibibondoshop@gmail.com) — that's a
-- real working inbox, not brand text.
-- ============================================================================

update public.store_settings
set
  store_name = 'Hill Store',
  facebook_url = 'https://facebook.com/hillstore',
  instagram_url = 'https://instagram.com/hillstore',
  tiktok_url = 'https://tiktok.com/@hillstore'
where id = 1;

update public.products
set brand = 'Hill Store'
where brand = 'Ibibondo';

update public.articles
set author = 'Hill Store'
where author = 'Ibibondo';

update public.policies
set body = replace(replace(body, 'Ibibondo', 'Hill Store'), 'ibibondo.rw', 'hillstore.rw')
where body ilike '%ibibondo%';

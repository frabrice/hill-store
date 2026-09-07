-- Set the real social accounts and drop Facebook (no page for now).
update public.store_settings
set
  facebook_url  = '',
  instagram_url = 'https://www.instagram.com/hillstorerwanda/',
  tiktok_url    = 'https://www.tiktok.com/@hillstorerwanda',
  twitter_url   = 'https://x.com/hillstorerwanda';

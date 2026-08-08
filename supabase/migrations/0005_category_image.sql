-- Cloudinary public_id of a photo representing the category — set from the
-- admin dashboard, replacing the icon-only representation on cards that show
-- a real image. Null until an admin uploads one.
alter table public.categories add column image text;

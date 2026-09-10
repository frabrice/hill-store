-- New categories for the broader "home essentials" positioning (kitchen,
-- dining, cleaning, bedroom, baby) — created empty; products get assigned
-- to them later via /admin.
insert into public.categories (slug, name, tagline, color_key, icon, sort_order)
values
  ('dining-items', 'Dining Items', 'Everyday tableware and dining essentials for the whole family.', 'coral', 'UtensilsCrossed', 200),
  ('cleaning-supplies', 'Cleaning Supplies', 'Household cleaning essentials to keep every home fresh.', 'teal', 'Sparkles', 210),
  ('bedroom-comfort', 'Bedroom & Comfort', 'Bedding and comfort essentials for a better night''s rest.', 'indigo', 'Moon', 220);

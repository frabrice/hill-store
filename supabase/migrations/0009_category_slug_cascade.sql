-- Fix: editing a category's slug failed with a generic error whenever that
-- category already had products in it. products.category_slug references
-- categories.slug with the default "no action" behaviour, which blocks
-- changing a referenced slug while any product still points at the old one.
-- Adding "on update cascade" lets Postgres update every matching product's
-- category_slug automatically the instant the category's slug changes, so
-- the two stay in sync and the save just works.
alter table public.products drop constraint if exists products_category_slug_fkey;
alter table public.products add constraint products_category_slug_fkey
  foreign key (category_slug) references public.categories (slug) on update cascade;

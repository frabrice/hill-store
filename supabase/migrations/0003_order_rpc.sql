-- ============================================================================
-- Ibibondo — atomic order creation
--
-- Run this after 0001_schema.sql and 0002_seed.sql.
--
-- Checkout used to be two client-side steps (insert the order, then update
-- each product's stock) — fine for the mock service holding everything in
-- one in-memory store, but a real race condition once two shoppers can
-- check out at the same instant: both read the same stock count, both
-- decrement, and the item oversells. This wraps both steps in one
-- `security definer` function so they run in a single transaction, and
-- generates the order reference server-side so it can't be spoofed or
-- collide with a client clock.
--
-- This replaces direct INSERT access to `orders` — checkout must go through
-- `create_order`, not a raw table insert.
-- ============================================================================

drop policy if exists "anyone can place an order" on public.orders;

create or replace function public.create_order(
  p_status              text,
  p_lines               jsonb,
  p_subtotal_rwf        int,
  p_delivery_rwf        int,
  p_total_rwf           int,
  p_customer_name       text,
  p_customer_phone      text,
  p_address             text,
  p_delivery_zone_id    text,
  p_delivery_zone_name  text,
  p_payment_method      text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order public.orders;
  line jsonb;
begin
  insert into public.orders (
    reference, status, lines, subtotal_rwf, delivery_rwf, total_rwf,
    customer_name, customer_phone, address, delivery_zone_id,
    delivery_zone_name, payment_method, user_id
  ) values (
    'IB-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || upper(substr(md5(random()::text), 1, 4)),
    p_status, p_lines, p_subtotal_rwf, p_delivery_rwf, p_total_rwf,
    p_customer_name, p_customer_phone, p_address, p_delivery_zone_id,
    p_delivery_zone_name, p_payment_method,
    -- Null for a guest checkout; a signed-in shopper's id when that flow
    -- exists. auth.uid() reads the caller's own JWT, so this can't be
    -- spoofed to attach the order to someone else's account.
    auth.uid()
  )
  returning * into new_order;

  for line in select * from jsonb_array_elements(p_lines)
  loop
    if line->>'variantId' is not null then
      update public.products
      set variants = (
        select coalesce(
          jsonb_agg(
            case when v->>'id' = line->>'variantId'
              then jsonb_set(v, '{stock}', to_jsonb(greatest(0, (v->>'stock')::int - (line->>'quantity')::int)))
              else v
            end
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(variants) as v
      )
      where id = line->>'productId';
    else
      update public.products
      set stock = greatest(0, stock - (line->>'quantity')::int)
      where id = line->>'productId';
    end if;
  end loop;

  return new_order;
end;
$$;

grant execute on function public.create_order(
  text, jsonb, int, int, int, text, text, text, text, text, text
) to anon, authenticated;

-- ============================================================================
-- Ibibondo — customer email on orders
--
-- Run after 0001-0003. Adds an optional email column so order-confirmation
-- and status emails have somewhere to go for a guest checkout (accounts
-- already have one via auth.users, but a guest never creates a session).
--
-- create_order's signature changes (one new parameter), so the old function
-- is dropped first — `create or replace` only replaces a function whose
-- parameter list matches exactly, otherwise it just adds an overload and
-- leaves the stale one behind.
-- ============================================================================

alter table public.orders add column if not exists customer_email text;

drop function if exists public.create_order(
  text, jsonb, int, int, int, text, text, text, text, text, text
);

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
  p_payment_method      text,
  p_customer_email      text default null
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
    customer_name, customer_phone, customer_email, address, delivery_zone_id,
    delivery_zone_name, payment_method, user_id
  ) values (
    'IB-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || upper(substr(md5(random()::text), 1, 4)),
    p_status, p_lines, p_subtotal_rwf, p_delivery_rwf, p_total_rwf,
    p_customer_name, p_customer_phone, p_customer_email, p_address, p_delivery_zone_id,
    p_delivery_zone_name, p_payment_method,
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
  text, jsonb, int, int, int, text, text, text, text, text, text, text
) to anon, authenticated;

-- ============================================================================
-- Ibibondo — pay-on-delivery + self-reported MoMo payment
--
-- Replaces the placeholder momo/visa/mastercard checkout with two real
-- options while a payment gateway is still deferred: pay-on-delivery (cash
-- collected by staff on arrival) and MoMo, dialled manually by the customer
-- and self-reported (payer name + amount) so staff can cross-check it
-- against the real merchant account before releasing the order.
--
-- 'visa'/'mastercard' are LEFT in the check constraint — only 'pay_on_delivery'
-- is added — so any historical test orders already in the table don't fail
-- constraint validation. The frontend simply stops offering them.
--
-- create_order's signature changes (two new parameters), so the old function
-- is dropped first — `create or replace` only replaces a function whose
-- parameter list matches exactly, otherwise it just adds an overload and
-- leaves the stale one behind. Same pattern as 0004_customer_email.sql.
-- ============================================================================

alter table public.orders add column if not exists payer_name text;
alter table public.orders add column if not exists paid_amount_rwf int
  check (paid_amount_rwf is null or paid_amount_rwf >= 0);

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('momo', 'visa', 'mastercard', 'pay_on_delivery'));

alter table public.store_settings add column if not exists momo_code text not null default '*182*8*1*37306#';

drop function if exists public.create_order(
  text, jsonb, int, int, int, text, text, text, text, text, text, text
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
  p_customer_email      text default null,
  p_payer_name          text default null,
  p_paid_amount_rwf     int  default null
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
    delivery_zone_name, payment_method, payer_name, paid_amount_rwf, user_id
  ) values (
    'IB-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || upper(substr(md5(random()::text), 1, 4)),
    p_status, p_lines, p_subtotal_rwf, p_delivery_rwf, p_total_rwf,
    p_customer_name, p_customer_phone, p_customer_email, p_address, p_delivery_zone_id,
    p_delivery_zone_name, p_payment_method, p_payer_name, p_paid_amount_rwf,
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
  text, jsonb, int, int, int, text, text, text, text, text, text, text, text, int
) to anon, authenticated;

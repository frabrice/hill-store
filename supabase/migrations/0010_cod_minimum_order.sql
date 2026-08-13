-- Pay-on-delivery is now only offered for orders at or above this total —
-- smaller orders must pay in full via MoMo instead. Admin-editable, same
-- pattern as momo_code / cod_commitment_fee_rwf. 20,000 is a starting
-- placeholder — adjust it from Admin → Settings → Payment.
alter table public.store_settings add column if not exists cod_minimum_order_rwf int not null default 20000;

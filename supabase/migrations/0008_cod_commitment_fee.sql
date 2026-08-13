-- Pay-on-delivery orders now require a fixed commitment fee paid via MoMo
-- upfront (deducted from the order total, the rest is cash on arrival) —
-- deters no-show orders. Admin-editable, same pattern as momo_code.
alter table public.store_settings add column if not exists cod_commitment_fee_rwf int not null default 15000;

-- FERMA PRO: warehouse + synchronized accounting migration
-- Run once in Supabase SQL Editor.

create table if not exists public.warehouse_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('feed','medicine','bedding','other')),
  name text not null,
  unit text not null default 'кг',
  concentration text,
  package_size numeric(14,3),
  price_per_unit numeric(14,2) not null default 0,
  supplier text,
  lot text,
  expiry_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.warehouse_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.warehouse_items(id) on delete restrict,
  movement_date date not null default current_date,
  movement_type text not null check (movement_type in ('in','use','sale','home','adjustment')),
  quantity numeric(14,3) not null check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  batch_type text,
  batch_id uuid,
  reference_id uuid,
  supplier text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists warehouse_items_user_idx on public.warehouse_items(user_id);
create index if not exists warehouse_movements_user_item_idx on public.warehouse_movements(user_id,item_id,movement_date);

alter table public.warehouse_items enable row level security;
alter table public.warehouse_movements enable row level security;

drop policy if exists warehouse_items_owner on public.warehouse_items;
create policy warehouse_items_owner on public.warehouse_items for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

drop policy if exists warehouse_movements_owner on public.warehouse_movements;
create policy warehouse_movements_owner on public.warehouse_movements for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Helpful view: current balance and weighted-average value per item.
create or replace view public.warehouse_balances as
select
  i.id, i.user_id, i.item_type, i.name, i.unit, i.concentration, i.package_size,
  i.price_per_unit, i.supplier, i.lot, i.expiry_date, i.notes,
  coalesce(sum(case when m.movement_type='in' then m.quantity else 0 end),0) as received_qty,
  coalesce(sum(case when m.movement_type in ('use','sale','home') then m.quantity else 0 end),0) as issued_qty,
  coalesce(sum(case when m.movement_type='adjustment' then m.quantity else 0 end),0) as adjustment_qty,
  coalesce(sum(case when m.movement_type='in' then m.quantity else -m.quantity end),0) as balance_qty,
  case when coalesce(sum(case when m.movement_type='in' then m.quantity else 0 end),0)>0
       then coalesce(sum(case when m.movement_type='in' then m.total_amount else 0 end),0)
            /sum(case when m.movement_type='in' then m.quantity else 0 end)
       else i.price_per_unit end as weighted_price
from public.warehouse_items i
left join public.warehouse_movements m on m.item_id=i.id and m.user_id=i.user_id
group by i.id;

-- Medicine-specific aliases are kept in the same unified warehouse table.
comment on table public.warehouse_items is 'Unified FERMA PRO warehouse: feed, medicine, bedding, other';
comment on table public.warehouse_movements is 'All warehouse receipts, usage, sales, home transfers and adjustments';

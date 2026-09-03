-- FERMA PRO v3: clean database schema
-- Run this file once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.batches(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in('broiler','layer')), name text not null, breed text, placed_at date not null,
 initial_heads integer not null check(initial_heads>0), chick_price numeric(14,2) default 0, start_weight_g numeric(10,2),
 status text not null default 'active' check(status in('active','completed','archived')), notes text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.livestock_events(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 batch_id uuid not null references public.batches(id) on delete cascade, event_date date not null, event_type text not null check(event_type in('mortality','sale','home','cull','adjustment')),
 heads integer not null check(heads>0), weight_kg numeric(14,3) default 0, price_per_kg numeric(14,2) default 0, total_amount numeric(14,2) default 0, client text, notes text, created_at timestamptz default now()
);
create table if not exists public.broiler_weights(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 batch_id uuid not null references public.batches(id) on delete cascade, weigh_date date not null, sampled_heads integer not null check(sampled_heads>0), average_weight_g numeric(10,2) not null check(average_weight_g>=0), notes text, created_at timestamptz default now()
);
create table if not exists public.daily_records(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 batch_id uuid not null references public.batches(id) on delete cascade, record_date date not null, feed_kg numeric(14,3) default 0 check(feed_kg>=0), water_l numeric(14,3) default 0,
 eggs integer default 0 check(eggs>=0), medicine_cost numeric(14,2) default 0, bedding_cost numeric(14,2) default 0, electricity_cost numeric(14,2) default 0, labor_cost numeric(14,2) default 0, other_cost numeric(14,2) default 0, notes text, created_at timestamptz default now()
);
create table if not exists public.medicines(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, concentration text, form text,
 package_ml numeric(14,3) default 0, package_g numeric(14,3) default 0, price numeric(14,2) default 0, supplier text, lot text, expiry_date date, notes text, created_at timestamptz default now()
);
create table if not exists public.treatments(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, batch_id uuid not null references public.batches(id) on delete cascade,
 treatment_date date not null, medicine_id uuid references public.medicines(id) on delete set null, medicine_name text not null, dosage text, birds integer default 0, used_qty numeric(14,3) default 0, unit text default 'мл', price_per_unit numeric(14,4) default 0, total_cost numeric(14,2) generated always as(used_qty*price_per_unit) stored, notes text, created_at timestamptz default now()
);
create table if not exists public.warehouse_items(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, item_type text not null check(item_type in('feed','medicine','bedding','other')),
 name text not null, unit text not null default 'кг', concentration text, package_size numeric(14,3) default 0, price_per_unit numeric(14,4) default 0, supplier text, lot text, expiry_date date, notes text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.warehouse_movements(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, item_id uuid not null references public.warehouse_items(id) on delete cascade,
 movement_date date not null, movement_type text not null check(movement_type in('in','use','sale','home','adjustment')), quantity numeric(14,3) not null check(quantity>0), unit_price numeric(14,4) default 0,
 total_amount numeric(14,2) default 0, adjustment_direction text check(adjustment_direction in('in','out')), batch_id uuid references public.batches(id) on delete set null, reference_id uuid, supplier text, notes text, created_at timestamptz default now()
);
create table if not exists public.finance(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, operation_type text not null check(operation_type in('income','expense')),
 operation_date date not null, category text not null, amount numeric(14,2) not null check(amount>=0), batch_id uuid references public.batches(id) on delete set null, description text, created_at timestamptz default now()
);
create table if not exists public.feed_recipes(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, phase text, notes text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.feed_recipe_lines(
 id uuid primary key default gen_random_uuid(), recipe_id uuid not null references public.feed_recipes(id) on delete cascade, item_id uuid references public.warehouse_items(id) on delete set null, ingredient_name text not null, kg numeric(14,3) not null check(kg>0), price_per_kg numeric(14,4) default 0, protein_pct numeric(8,3) default 0, energy_mj numeric(8,3) default 0
);
create table if not exists public.feed_phases(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, kind text not null default 'broiler', name text not null,
 from_day integer not null check(from_day>0), to_day integer not null check(to_day>=from_day), recommended_weight_g numeric(10,2) default 0, recommended_feed_g_head numeric(10,2) default 0, notes text, sort_order integer default 0
);

create index if not exists batches_user_idx on public.batches(user_id); create index if not exists events_batch_idx on public.livestock_events(batch_id,event_date);
create index if not exists weights_batch_idx on public.broiler_weights(batch_id,weigh_date); create index if not exists daily_batch_idx on public.daily_records(batch_id,record_date);
create index if not exists wh_user_idx on public.warehouse_items(user_id); create index if not exists wh_moves_item_idx on public.warehouse_movements(item_id,movement_date);
create index if not exists finance_user_idx on public.finance(user_id,operation_date); create index if not exists recipes_user_idx on public.feed_recipes(user_id);

alter table public.batches enable row level security; alter table public.livestock_events enable row level security; alter table public.broiler_weights enable row level security; alter table public.daily_records enable row level security;
alter table public.medicines enable row level security; alter table public.treatments enable row level security; alter table public.warehouse_items enable row level security; alter table public.warehouse_movements enable row level security;
alter table public.finance enable row level security; alter table public.feed_recipes enable row level security; alter table public.feed_recipe_lines enable row level security; alter table public.feed_phases enable row level security;

do $$ declare t text; begin foreach t in array array['batches','livestock_events','broiler_weights','daily_records','medicines','treatments','warehouse_items','warehouse_movements','finance','feed_recipes','feed_recipe_lines','feed_phases'] loop execute format('drop policy if exists owner_all on public.%I',t); execute format('create policy owner_all on public.%I for all using (user_id=auth.uid()) with check (user_id=auth.uid())',t); end loop; end $$;
-- recipe lines are protected through their recipe, but adding user_id also makes RLS simple.
alter table public.feed_recipe_lines add column if not exists user_id uuid references auth.users(id) on delete cascade;
update public.feed_recipe_lines l set user_id=r.user_id from public.feed_recipes r where l.recipe_id=r.id and l.user_id is null;
create index if not exists recipe_lines_user_idx on public.feed_recipe_lines(user_id);
drop policy if exists owner_all on public.feed_recipe_lines;
create policy owner_all on public.feed_recipe_lines for all using(user_id=auth.uid()) with check(user_id=auth.uid());

create or replace view public.warehouse_balances as
select i.*, coalesce(sum(case when m.movement_type='in' then m.quantity when m.movement_type in('use','sale','home') then -m.quantity when m.movement_type='adjustment' and m.adjustment_direction='in' then m.quantity when m.movement_type='adjustment' and m.adjustment_direction='out' then -m.quantity else 0 end),0) balance_qty,
coalesce(sum(case when m.movement_type='in' then m.quantity else 0 end),0) received_qty,
coalesce(sum(case when m.movement_type in('use','sale','home') then m.quantity else 0 end),0) issued_qty,
case when coalesce(sum(case when m.movement_type='in' then m.quantity else 0 end),0)>0 then coalesce(sum(case when m.movement_type='in' then m.total_amount else 0 end),0)/nullif(sum(case when m.movement_type='in' then m.quantity else 0 end),0) else i.price_per_unit end weighted_price
from public.warehouse_items i left join public.warehouse_movements m on m.item_id=i.id and m.user_id=i.user_id group by i.id;

-- Default broiler phases. Ranges remain editable in the app.
insert into public.feed_phases(user_id,kind,name,from_day,to_day,sort_order) select id,'broiler','STARTER',1,14,1 from auth.users u where not exists(select 1 from public.feed_phases p where p.user_id=u.id and p.name='STARTER');
insert into public.feed_phases(user_id,kind,name,from_day,to_day,sort_order) select id,'broiler','GROWER 1',15,20,2 from auth.users u where not exists(select 1 from public.feed_phases p where p.user_id=u.id and p.name='GROWER 1');
insert into public.feed_phases(user_id,kind,name,from_day,to_day,sort_order) select id,'broiler','GROWER 2',21,28,3 from auth.users u where not exists(select 1 from public.feed_phases p where p.user_id=u.id and p.name='GROWER 2');
insert into public.feed_phases(user_id,kind,name,from_day,to_day,sort_order) select id,'broiler','GROWER 3',29,35,4 from auth.users u where not exists(select 1 from public.feed_phases p where p.user_id=u.id and p.name='GROWER 3');
insert into public.feed_phases(user_id,kind,name,from_day,to_day,sort_order) select id,'broiler','FINISHER 1',36,42,5 from auth.users u where not exists(select 1 from public.feed_phases p where p.user_id=u.id and p.name='FINISHER 1');
insert into public.feed_phases(user_id,kind,name,from_day,to_day,sort_order) select id,'broiler','FINISHER 2',43,9999,6 from auth.users u where not exists(select 1 from public.feed_phases p where p.user_id=u.id and p.name='FINISHER 2');

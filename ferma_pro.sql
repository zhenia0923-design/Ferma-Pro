-- FERMA PRO v5 PATCH: water expense
alter table public.daily_records add column if not exists water_cost numeric(14,2) default 0;
update public.daily_records set water_cost=0 where water_cost is null;

-- FERMA PRO: автоматична синхронізація складу та фінансів
-- Запустити ПІСЛЯ supabase_migration.sql

alter table public.warehouse_movements add column if not exists adjustment_direction text;
alter table public.warehouse_movements drop constraint if exists warehouse_movements_adjustment_direction_check;
alter table public.warehouse_movements add constraint warehouse_movements_adjustment_direction_check check (adjustment_direction is null or adjustment_direction in ('in','out'));

create or replace view public.warehouse_balances as
select i.id,i.user_id,i.item_type,i.name,i.unit,i.concentration,i.package_size,i.price_per_unit,i.supplier,i.lot,i.expiry_date,
coalesce(sum(case when m.movement_type='in' then m.quantity when m.movement_type in ('use','sale','home') then -m.quantity when m.movement_type='adjustment' and m.adjustment_direction='in' then m.quantity when m.movement_type='adjustment' and m.adjustment_direction='out' then -m.quantity else 0 end),0) balance_qty,
coalesce(sum(case when m.movement_type='in' then m.quantity else 0 end),0) received_qty,
coalesce(sum(case when m.movement_type in ('use','sale','home') then m.quantity else 0 end),0) issued_qty,
coalesce(sum(case when m.movement_type='in' then m.total_amount else 0 end),0) received_value
from public.warehouse_items i left join public.warehouse_movements m on m.item_id=i.id and m.user_id=i.user_id group by i.id;

create or replace function public.fp_get_item(p_user uuid,p_type text,p_name text,p_unit text default 'кг') returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; begin if nullif(trim(p_name),'') is null then return null; end if; select id into v_id from public.warehouse_items where user_id=p_user and lower(name)=lower(trim(p_name)) and item_type=p_type limit 1; if v_id is null then insert into public.warehouse_items(user_id,item_type,name,unit,price_per_unit) values(p_user,p_type,trim(p_name),coalesce(nullif(p_unit,''),'кг'),0) returning id into v_id; end if; return v_id; end $$;

create or replace function public.fp_sync_broiler_daily_feed() returns trigger language plpgsql security definer set search_path=public as $$
declare v_item uuid; v_new numeric:=0; begin
if tg_op in ('UPDATE','DELETE') then delete from public.warehouse_movements where user_id=old.user_id and reference_id=old.id and movement_type='use'; end if;
if tg_op in ('INSERT','UPDATE') then v_new:=coalesce(new.feed_kg,0); if v_new>0 then v_item:=public.fp_get_item(new.user_id,'feed','Корм','кг'); insert into public.warehouse_movements(user_id,item_id,movement_date,movement_type,quantity,unit_price,total_amount,batch_type,batch_id,reference_id,notes) values(new.user_id,v_item,new.record_date,'use',v_new,0,0,'broiler',new.batch_id,new.id,'Автоматично з щоденного обліку бройлерів'); end if; return new; end if; return old; end $$;
drop trigger if exists trg_fp_broiler_daily_feed on public.broiler_daily;
create trigger trg_fp_broiler_daily_feed after insert or update or delete on public.broiler_daily for each row execute function public.fp_sync_broiler_daily_feed();

create or replace function public.fp_sync_broiler_treatment() returns trigger language plpgsql security definer set search_path=public as $$
declare v_item uuid; v_qty numeric; begin
if tg_op in ('UPDATE','DELETE') then delete from public.warehouse_movements where user_id=old.user_id and reference_id=old.id and movement_type='use'; end if;
if tg_op in ('INSERT','UPDATE') then v_qty:=coalesce(new.ml_used,0); if v_qty>0 and nullif(trim(new.medicine_name),'') is not null then v_item:=public.fp_get_item(new.user_id,'medicine',new.medicine_name,'мл'); insert into public.warehouse_movements(user_id,item_id,movement_date,movement_type,quantity,unit_price,total_amount,batch_type,batch_id,reference_id,notes) values(new.user_id,v_item,new.treatment_date,'use',v_qty,coalesce(new.price_per_10ml,0)/10,coalesce(new.total_cost,0),'broiler',new.batch_id,new.id,'Автоматично з лікування бройлерів'); end if; return new; end if; return old; end $$;
drop trigger if exists trg_fp_broiler_treatment on public.broiler_treatments;
create trigger trg_fp_broiler_treatment after insert or update or delete on public.broiler_treatments for each row execute function public.fp_sync_broiler_treatment();

create or replace function public.fp_sync_broiler_sale_finance() returns trigger language plpgsql security definer set search_path=public as $$
begin
if tg_op in ('UPDATE','DELETE') then delete from public.finance where user_id=old.user_id and description like '%[AUTO_BROILER_SALE:'||old.id||']%'; end if;
if tg_op in ('INSERT','UPDATE') then insert into public.finance(user_id,operation_type,operation_date,category,amount,description) values(new.user_id,'income',new.sale_date,'Продаж бройлерів',coalesce(new.total_amount,0),'Продаж бройлерів [AUTO_BROILER_SALE:'||new.id||']'); return new; end if; return old; end $$;
drop trigger if exists trg_fp_broiler_sale_finance on public.broiler_sales;
create trigger trg_fp_broiler_sale_finance after insert or update or delete on public.broiler_sales for each row execute function public.fp_sync_broiler_sale_finance();

create or replace function public.fp_sync_home_use_stock() returns trigger language plpgsql security definer set search_path=public as $$
declare v_item uuid; v_qty numeric; begin
if tg_op in ('UPDATE','DELETE') then delete from public.warehouse_movements where user_id=old.user_id and reference_id=old.id and movement_type='home'; end if;
if tg_op in ('INSERT','UPDATE') then v_qty:=coalesce(new.weight_kg,0); if v_qty>0 then v_item:=public.fp_get_item(new.user_id,'other','Власне використання бройлера','кг'); insert into public.warehouse_movements(user_id,item_id,movement_date,movement_type,quantity,unit_price,total_amount,batch_type,batch_id,reference_id,notes) values(new.user_id,v_item,new.use_date,'home',v_qty,case when v_qty>0 then coalesce(new.estimated_value,0)/v_qty else 0 end,coalesce(new.estimated_value,0),'broiler',new.batch_id,new.id,'Власне використання'); end if; return new; end if; return old; end $$;
drop trigger if exists trg_fp_home_use_stock on public.home_uses;
create trigger trg_fp_home_use_stock after insert or update or delete on public.home_uses for each row execute function public.fp_sync_home_use_stock();

create or replace function public.fp_stock_before_movement() returns trigger language plpgsql security definer set search_path=public as $$
declare bal numeric; begin
if new.movement_type in ('use','sale','home') then select coalesce(balance_qty,0) into bal from public.warehouse_balances where id=new.item_id; if tg_op='UPDATE' then select bal + case when old.movement_type in ('use','sale','home') then old.quantity else 0 end into bal; end if; if bal < coalesce(new.quantity,0) then raise exception 'Недостатній залишок на складі: доступно %, потрібно %',bal,new.quantity; end if; end if; return new; end $$;
drop trigger if exists trg_fp_stock_before_movement on public.warehouse_movements;
create trigger trg_fp_stock_before_movement before insert or update on public.warehouse_movements for each row execute function public.fp_stock_before_movement();

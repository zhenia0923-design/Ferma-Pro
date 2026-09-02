-- FERMA PRO: синхронізація корму несучок зі складом та витратами
-- Запустити ПІСЛЯ supabase_migration.sql та supabase_integration_v2.sql

create or replace function public.fp_sync_layer_daily_feed() returns trigger language plpgsql security definer set search_path=public as $$
declare v_item uuid; v_new numeric:=0;
begin
  if tg_op in ('UPDATE','DELETE') then
    delete from public.warehouse_movements where user_id=old.user_id and reference_id=old.id and movement_type='use';
  end if;
  if tg_op in ('INSERT','UPDATE') then
    v_new:=coalesce(new.feed_kg,0);
    if v_new>0 then
      v_item:=public.fp_get_item(new.user_id,'feed','Корм несучки','кг');
      insert into public.warehouse_movements(user_id,item_id,movement_date,movement_type,quantity,unit_price,total_amount,batch_type,batch_id,reference_id,notes)
      values(new.user_id,v_item,new.record_date,'use',v_new,0,0,'layer',new.flock_id,new.id,'Автоматично з щоденного обліку несучок');
    end if;
    return new;
  end if;
  return old;
end $$;

drop trigger if exists trg_fp_layer_daily_feed on public.layer_daily;
create trigger trg_fp_layer_daily_feed after insert or update or delete on public.layer_daily
for each row execute function public.fp_sync_layer_daily_feed();

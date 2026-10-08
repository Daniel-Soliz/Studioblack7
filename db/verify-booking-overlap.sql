begin;
do $$ declare refused boolean:=false;
begin
  insert into public.appointments(service_id,service_name,professional_id,professional_name,customer_name,customer_email,customer_phone,start_at,end_at,amount_cents,hold_expires_at)
  values('audit-fixture','Fixture','audit-fixture','Fixture','Audit','audit@example.invalid','11999999999','2035-01-01 09:00:00-03','2035-01-01 10:00:00-03',100,'2035-01-01 08:00:00-03');
  begin
    insert into public.appointments(service_id,service_name,professional_id,professional_name,customer_name,customer_email,customer_phone,start_at,end_at,amount_cents,hold_expires_at)
    values('audit-fixture','Fixture','audit-fixture','Fixture','Audit','audit@example.invalid','11999999999','2035-01-01 09:30:00-03','2035-01-01 10:30:00-03',100,'2035-01-01 08:00:00-03');
  exception when exclusion_violation then refused:=true; end;
  if not refused then raise exception 'Overlapping reservation accepted'; end if;
end $$;
select 'PASS: database refuses two simultaneous reservations for the same professional and time' as result;
rollback;

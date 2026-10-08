-- A private server job reconciles payment status even after the customer closes the app.
create extension if not exists pg_cron;
do $$ begin
  if not exists (select 1 from vault.secrets where name='sb7_payment_sync') then
    perform vault.create_secret(gen_random_uuid()::text||gen_random_uuid()::text,'sb7_payment_sync','Private payment reconciliation job');
  end if;
end $$;
create or replace function public.sb7_payment_sync_key()
returns text language sql security invoker set search_path=public
as $$ select decrypted_secret from vault.decrypted_secrets where name='sb7_payment_sync' limit 1 $$;
revoke all on function public.sb7_payment_sync_key() from public,anon,authenticated;
grant execute on function public.sb7_payment_sync_key() to service_role;
grant usage on schema vault to service_role;
grant select on vault.decrypted_secrets to service_role;
select cron.schedule('sb7-payment-reconciliation','* * * * *', $job$
  select net.http_post(
    url:='https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/mercado-pago-payment',
    headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='sb7_payment_sync' limit 1)),
    body:='{"action":"sync_pending"}'::jsonb,
    timeout_milliseconds:=50000
  );
$job$);

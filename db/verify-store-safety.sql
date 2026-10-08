-- Fixtures are inside one rolled-back transaction; no real payments or records survive.
begin;
update public.site_data set value='[{"id":"audit-fixture","name":"Fixture","price":100,"stock":2,"status":"active","images":[]}]'::jsonb where key='products';
update public.site_data set value='[]'::jsonb where key='orders';
do $$
declare id uuid:=gen_random_uuid(); token uuid:=gen_random_uuid(); id2 uuid:=gen_random_uuid(); r jsonb; amount numeric; stock integer; denied boolean:=false; rev timestamptz;
begin
  r:=public.store_checkout_command('reserve',id,jsonb_build_object('clientToken',token,'shippingMethod','Entrega Expressa Zona Norte','customer',jsonb_build_object('name','Audit','email','audit@example.invalid','phone','11999999999'),'items','[{"productId":"audit-fixture","quantity":2}]'::jsonb));
  if (r->'order_data'->>'total')::numeric<>215 then raise exception 'Freight/total incorrect'; end if;
  select (value->0->>'stock')::int into stock from site_data where key='products';
  if stock<>0 then raise exception 'Stock reservation failed'; end if;
  perform public.store_checkout_command('reserve',id,jsonb_build_object('clientToken',token));
  select (value->0->>'stock')::int into stock from site_data where key='products';
  if stock<>0 then raise exception 'Retry changed stock'; end if;
  begin
    perform public.store_checkout_command('reserve',id2,jsonb_build_object('clientToken',gen_random_uuid(),'shippingMethod','Retirada no Studio Black7 (Gratuita)','customer','{}'::jsonb,'items','[{"productId":"audit-fixture","quantity":1}]'::jsonb));
  exception when others then denied:=true; end;
  if not denied then raise exception 'Overselling allowed'; end if;
  perform public.store_checkout_command('attach',id,'{"mpOrderId":"ORDAUDITFIXTURE","pix":{}}'::jsonb);
  if (select jsonb_array_length(value) from site_data where key='orders')<>1 then raise exception 'Order not saved'; end if;
  perform public.store_checkout_command('close',id);
  perform public.store_checkout_command('close',id);
  select (value->0->>'stock')::int into stock from site_data where key='products';
  if stock<>2 then raise exception 'Cancellation restored stock twice'; end if;
  if (select jsonb_array_length(value) from site_data where key='orders')<>0 then raise exception 'Cancelled order retained'; end if;
  r:=public.store_checkout_command('reserve',id2,jsonb_build_object('clientToken',token,'shippingMethod','Retirada no Studio Black7 (Gratuita)','customer','{}'::jsonb,'items','[{"productId":"audit-fixture","quantity":1}]'::jsonb));
  perform public.store_checkout_command('attach',id2,'{"mpOrderId":"ORDAUDITFIXTURE2","pix":{}}'::jsonb);
  perform public.store_checkout_command('paid',id2);
  perform public.store_checkout_command('paid',id2);
  denied:=false;
  begin perform public.store_checkout_command('close',id2); exception when others then denied:=true; end;
  if not denied then raise exception 'Paid order cancellation allowed'; end if;
  if (select value->0->>'paymentStatus' from site_data where key='orders')<>'paid' then raise exception 'Payment not stored'; end if;
  denied:=false;
  begin perform public.store_admin_order('status','ord-'||id2,'{"status":"confirmed","paymentStatus":"pending"}'); exception when others then denied:=true; end;
  if not denied then raise exception 'Admin could overwrite verified Pix'; end if;
  select updated_at into rev from site_data where key='products';
  perform public.site_data_save('products',(select value from site_data where key='products'),rev);
  denied:=false;
  begin perform public.site_data_save('products','[]',rev); exception when others then denied:=true; end;
  if not denied then raise exception 'Stale catalog write allowed'; end if;
end $$;
select 'PASS: totals, freight, stock, retry, cancellation, paid protection, stale-write protection' as result;
rollback;

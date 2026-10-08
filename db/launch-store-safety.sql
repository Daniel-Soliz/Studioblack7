-- Private checkout capabilities. Existing orders stay in site_data for dashboard compatibility.
create table if not exists public.store_checkouts (
  id uuid primary key,
  client_token uuid not null default gen_random_uuid(),
  mp_order_id text unique,
  state text not null default 'creating' check (state in ('creating','pending','paid','closed')),
  order_data jsonb not null,
  pix jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.store_checkouts enable row level security;
revoke all on public.store_checkouts from anon, authenticated;
grant all on public.store_checkouts to service_role;
create index if not exists store_checkouts_pending_idx on public.store_checkouts(created_at) where state in ('creating','pending');

-- All stock/order operations lock the same catalog row before changing anything.
-- Only the trusted Edge Functions role can invoke this transaction.
create or replace function public.store_checkout_command(p_action text, p_id uuid, p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  catalog jsonb; orders jsonb; record public.store_checkouts%rowtype;
  requested jsonb; product jsonb; items jsonb := '[]'; total_cents bigint := 0;
  unit_cents bigint; qty integer; freight integer; method text; new_order jsonb;
begin
  select value into catalog from public.site_data where key='products' for update;
  insert into public.site_data(key,value) values ('orders','[]') on conflict do nothing;
  select value into orders from public.site_data where key='orders' for update;
  select * into record from public.store_checkouts where id=p_id for update;
  if p_action='reserve' then
    if record.id is not null then
      if record.client_token::text is distinct from p_data->>'clientToken' then raise exception 'Pedido inválido.'; end if;
      return to_jsonb(record);
    end if;
    if jsonb_typeof(p_data->'items') <> 'array' or jsonb_array_length(p_data->'items') not between 1 and 30 then raise exception 'Carrinho inválido.'; end if;
    if (select count(distinct x->>'productId') from jsonb_array_elements(p_data->'items') x) <> jsonb_array_length(p_data->'items') then raise exception 'Produtos repetidos no carrinho.'; end if;
    method := p_data->>'shippingMethod';
    freight := case method when 'Retirada no Studio Black7 (Gratuita)' then 0 when 'Entrega Expressa Zona Norte' then 1500 when 'Envio Padrão São Paulo Capital' then 2500 else -1 end;
    if freight < 0 then raise exception 'Escolha uma entrega válida.'; end if;
    for requested in select x from jsonb_array_elements(p_data->'items') x loop
      if (requested->>'quantity') !~ '^[0-9]+$' then raise exception 'Quantidade inválida.'; end if;
      qty := (requested->>'quantity')::integer;
      if qty not between 1 and 20 then raise exception 'Escolha entre 1 e 20 unidades.'; end if;
      select x into product from jsonb_array_elements(catalog) x where x->>'id'=requested->>'productId';
      if product is null or product->>'status' <> 'active' or coalesce((product->>'stock')::int,0)<qty then raise exception 'Produto indisponível nessa quantidade.'; end if;
      unit_cents := round((case when coalesce((product->>'salePrice')::numeric,0)>0 and (product->>'salePrice')::numeric<(product->>'price')::numeric then (product->>'salePrice')::numeric else (product->>'price')::numeric end)*100);
      if unit_cents < 100 or unit_cents is null then raise exception 'Produto sem preço para pagamento online.'; end if;
      total_cents := total_cents + unit_cents*qty;
      items := items || jsonb_build_array(jsonb_build_object('productId',product->>'id','productName',product->>'name','name',product->>'name','quantity',qty,'unitPrice',unit_cents/100.0,'price',unit_cents/100.0,'totalPrice',unit_cents*qty/100.0,'image',coalesce(product->>'thumbnail',product->'images'->>0,''),'sku',coalesce(product->>'sku','')));
      select jsonb_agg(case when x->>'id'=product->>'id' then x || jsonb_build_object('stock',(x->>'stock')::int-qty,'status',case when (x->>'stock')::int=qty then 'out_of_stock' else 'active' end) else x end) into catalog from jsonb_array_elements(catalog) x;
    end loop;
    if total_cents+freight > 5000000 then raise exception 'Valor da compra inválido.'; end if;
    new_order := jsonb_build_object('id','ord-'||p_id,'orderNumber','SB7-'||upper(left(replace(p_id::text,'-',''),10)),'customer',p_data->'customer','items',items,'subtotal',total_cents/100.0,'shipping',freight/100.0,'shippingMethod',method,'total',(total_cents+freight)/100.0,'status','pending','paymentStatus','pending','paymentMethod','Pix Mercado Pago','notes',left(coalesce(p_data->>'notes',''),500),'createdAt',now(),'updatedAt',now());
    insert into public.store_checkouts(id,client_token,order_data) values(p_id,(p_data->>'clientToken')::uuid,new_order) returning * into record;
    update public.site_data set value=catalog,updated_at=now() where key='products';
    return to_jsonb(record);
  end if;
  if record.id is null then raise exception 'Pedido não encontrado.'; end if;
  if p_action='attach' then
    if record.state <> 'creating' then return to_jsonb(record); end if;
    new_order := record.order_data || jsonb_build_object('notes',concat(record.order_data->>'notes',' | Mercado Pago Order: ',p_data->>'mpOrderId'));
    update public.store_checkouts set mp_order_id=p_data->>'mpOrderId',pix=p_data->'pix',state='pending',order_data=new_order,updated_at=now() where id=p_id returning * into record;
    update public.site_data set value=orders||jsonb_build_array(new_order),updated_at=now() where key='orders';
  elsif p_action='paid' then
    if record.state='closed' then raise exception 'Pedido encerrado exige revisão manual.'; end if;
    if record.state<>'paid' then
      new_order := record.order_data || jsonb_build_object('status','confirmed','paymentStatus','paid','updatedAt',now());
      update public.store_checkouts set state='paid',order_data=new_order,updated_at=now() where id=p_id returning * into record;
      select coalesce(jsonb_agg(case when x->>'id'=new_order->>'id' then new_order else x end),'[]') into orders from jsonb_array_elements(orders) x;
      update public.site_data set value=orders,updated_at=now() where key='orders';
    end if;
  elsif p_action='close' then
    if record.state='paid' then raise exception 'Pedido pago não pode ser cancelado automaticamente.'; end if;
    if record.state<>'closed' then
      for requested in select x from jsonb_array_elements(record.order_data->'items') x loop
        select coalesce(jsonb_agg(case when x->>'id'=requested->>'productId' then x || jsonb_build_object('stock',(x->>'stock')::int+(requested->>'quantity')::int,'status',case when x->>'status'='out_of_stock' then 'active' else x->>'status' end) else x end),'[]') into catalog from jsonb_array_elements(catalog) x;
      end loop;
      update public.site_data set value=catalog,updated_at=now() where key='products';
      update public.store_checkouts set state='closed',updated_at=now() where id=p_id returning * into record;
      select coalesce(jsonb_agg(x),'[]') into orders from jsonb_array_elements(orders) x where x->>'id'<>record.order_data->>'id';
      update public.site_data set value=orders,updated_at=now() where key='orders';
    end if;
  else raise exception 'Operação inválida.';
  end if;
  return to_jsonb(record);
end $$;
revoke all on function public.store_checkout_command(text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.store_checkout_command(text,uuid,jsonb) to service_role;

create or replace function public.store_admin_order(p_action text,p_id text,p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare orders jsonb; old_order jsonb; next_order jsonb; catalog jsonb; item jsonb;
begin
  -- Same lock order as checkout; no entire-array writes from the browser.
  select value into catalog from public.site_data where key='products' for update;
  select value into orders from public.site_data where key='orders' for update;
  select x into old_order from jsonb_array_elements(orders) x where x->>'id'=p_id;
  if p_action='legacy_close' then
    if old_order->>'paymentStatus'='paid' then raise exception 'Pedido pago não pode ser cancelado automaticamente.'; end if;
    if old_order is not null and old_order->>'status'<>'cancelled' then
      for item in select x from jsonb_array_elements(old_order->'items') x loop
        select jsonb_agg(case when x->>'id'=item->>'productId' then x || jsonb_build_object('stock',coalesce((x->>'stock')::int,0)+(item->>'quantity')::int,'status',case when x->>'status'='out_of_stock' then 'active' else x->>'status' end) else x end) into catalog from jsonb_array_elements(catalog) x;
      end loop;
      update public.site_data set value=catalog,updated_at=now() where key='products';
    end if;
    select coalesce(jsonb_agg(x),'[]') into orders from jsonb_array_elements(orders) x where x->>'id'<>p_id;
  elsif p_action='delete' then
    select coalesce(jsonb_agg(x),'[]') into orders from jsonb_array_elements(orders) x where x->>'id'<>p_id;
  elsif p_action='provider_paid' then
    if old_order is null then raise exception 'Pedido não encontrado.'; end if;
    next_order := old_order || jsonb_build_object('status','confirmed','paymentStatus','paid','updatedAt',now());
    select jsonb_agg(case when x->>'id'=p_id then next_order else x end) into orders from jsonb_array_elements(orders) x;
  elsif p_action='status' then
    if old_order is null then raise exception 'Pedido não encontrado.'; end if;
    if old_order->>'paymentMethod'='Pix Mercado Pago' and p_data->>'paymentStatus' is distinct from old_order->>'paymentStatus' then raise exception 'O pagamento Pix é confirmado pelo Mercado Pago.'; end if;
    if p_data->>'status' in ('confirmed','processing','preparing','shipped','completed') and coalesce(old_order->>'paymentStatus','pending') <> 'paid' and old_order->>'paymentMethod'='Pix Mercado Pago' then raise exception 'Aguarde a confirmação do Pix.'; end if;
    next_order := old_order || p_data || jsonb_build_object('updatedAt',now());
    select jsonb_agg(case when x->>'id'=p_id then next_order else x end) into orders from jsonb_array_elements(orders) x;
  elsif p_action='save' then
    if old_order->>'paymentMethod'='Pix Mercado Pago' then
      next_order := old_order || jsonb_build_object('customer',p_data->'customer','notes',p_data->'notes','updatedAt',now());
    else
      next_order := p_data || jsonb_build_object('id',p_id,'createdAt',coalesce(old_order->'createdAt',to_jsonb(now())),'updatedAt',now());
    end if;
    select coalesce(jsonb_agg(x),'[]') into orders from jsonb_array_elements(orders) x where x->>'id'<>p_id;
    orders := orders || jsonb_build_array(next_order);
  else raise exception 'Operação inválida.';
  end if;
  update public.site_data set value=orders,updated_at=now() where key='orders';
  return coalesce(next_order,jsonb_build_object('deleted',true));
end $$;
revoke all on function public.store_admin_order(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.store_admin_order(text,text,jsonb) to service_role;

create or replace function public.site_data_save(p_key text,p_value jsonb,p_expected timestamptz)
returns timestamptz language plpgsql security invoker set search_path=public as $$
declare previous timestamptz; changed timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext('sb7_site_data_'||p_key));
  select updated_at into previous from public.site_data where key=p_key for update;
  if previous is distinct from p_expected then raise exception 'Os dados mudaram em outro dispositivo. Atualize antes de salvar.'; end if;
  changed := clock_timestamp();
  insert into public.site_data(key,value,updated_at) values(p_key,p_value,changed)
  on conflict(key) do update set value=excluded.value,updated_at=excluded.updated_at;
  return changed;
end $$;
revoke all on function public.site_data_save(text,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.site_data_save(text,jsonb,timestamptz) to service_role;

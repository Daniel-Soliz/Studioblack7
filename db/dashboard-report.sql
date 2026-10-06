-- Half payments: keep charge separate from full service price.
alter table public.appointments add column if not exists service_total_cents integer;

-- Studio Black7 monthly dashboard. No client access to reports or visit records.
create table if not exists public.site_visits (
 session_id uuid primary key, visitor_id uuid not null,
 started_at timestamptz not null default now()
);
alter table public.site_visits enable row level security;
revoke all on public.site_visits from public,anon,authenticated;
grant select,insert on public.site_visits to service_role;
create index if not exists site_visits_started_at_idx on public.site_visits(started_at);
CREATE OR REPLACE FUNCTION public.dashboard_report(p_month date)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
with
bounds as (select date_trunc('month',p_month)::date first_day,
 (date_trunc('month',p_month)+interval '1 month')::date next_month),
a as (select *, (start_at at time zone 'America/Sao_Paulo')::date as day,
 status in ('pending_payment','confirmed','completed') active
 from public.appointments),
order_source as (select distinct on (o->>'id') o from public.site_data
 cross join lateral jsonb_array_elements(case when jsonb_typeof(value)='array' then value else '[]'::jsonb end) o
 where key='orders' and o->>'id' is not null),
ord as (select o,
 ((o->>'createdAt')::timestamptz at time zone 'America/Sao_Paulo')::date as day,
 o->>'paymentStatus'='paid' and coalesce(o->>'status','')<>'cancelled' sold,
 greatest(0,coalesce((o->>'total')::numeric,0)) total
 from order_source where o->>'createdAt' ~ '^\d{4}-\d{2}-\d{2}T'),
items as (select day,sold,
 coalesce(it->>'productId',it->>'name',it->>'productName','produto') id,
 coalesce(it->>'name',it->>'productName','Produto') name,
 greatest(0,coalesce((it->>'quantity')::numeric,0)) quantity,
 greatest(0,coalesce((it->>'totalPrice')::numeric,
 coalesce((it->>'unitPrice')::numeric,(it->>'price')::numeric,0)*coalesce((it->>'quantity')::numeric,0))) amount
 from ord cross join lateral jsonb_array_elements(case when jsonb_typeof(o->'items')='array' then o->'items' else '[]'::jsonb end) it),
v as (select *, (started_at at time zone 'America/Sao_Paulo')::date as day from public.site_visits),
am as (select a.* from a,bounds where day>=first_day and day<next_month),
om as (select ord.* from ord,bounds where day>=first_day and day<next_month),
im as (select items.* from items,bounds where day>=first_day and day<next_month),
vm as (select v.* from v,bounds where day>=first_day and day<next_month),
service_groups as (select service_id id,service_name name,
 count(*) filter(where active) scheduled,
 count(*) filter(where status='completed') completed,
 count(*) filter(where status='pending_payment') pending,
 coalesce(sum(coalesce(service_total_cents,amount_cents)) filter(where active),0)/100.0 booked_amount,
 coalesce(sum(amount_cents) filter(where payment_status='paid'),0)/100.0 received,
 min(coalesce(service_total_cents,amount_cents))/100.0 min_price,max(coalesce(service_total_cents,amount_cents))/100.0 max_price
 from am where active or payment_status='paid' group by service_id,service_name),
product_groups as (select id,name,sum(quantity) quantity,sum(amount) amount
 from im where sold group by id,name),
days as (select generate_series(first_day,next_month-1,interval '1 day')::date as day from bounds),
monthly as (select generate_series(first_day-interval '5 months',first_day,interval '1 month')::date as day from bounds)
select jsonb_build_object(
 'month',to_char(p_month,'YYYY-MM'),
 'generatedAt',now(),
 'trackingStartedAt',(select min(started_at) from public.site_visits),
 'summary',jsonb_build_object(
 'visits',(select count(*) from vm),
 'visitors',(select count(distinct visitor_id) from vm),
 'scheduled',(select count(*) from am where active),
 'confirmed',(select count(*) from am where status in ('confirmed','completed')),
 'completed',(select count(*) from am where status='completed'),
 'pending',(select count(*) from am where status='pending_payment'),
 'cancelled',(select count(*) from am where status in ('cancelled','expired')),
 'bookedAmount',(select coalesce(sum(coalesce(service_total_cents,amount_cents)),0)/100.0 from am where active),
 'serviceRevenue',(select coalesce(sum(amount_cents),0)/100.0 from am where payment_status='paid'),
 'productUnits',(select coalesce(sum(quantity),0) from im where sold),
 'paidOrders',(select count(*) from om where sold),
 'pendingOrders',(select count(*) from om where coalesce(o->>'paymentStatus','')='pending' and coalesce(o->>'status','')<>'cancelled'),
 'productRevenue',(select coalesce(sum(amount),0) from im where sold),
 'shippingRevenue',(select coalesce(sum(greatest(0,coalesce((o->>'shipping')::numeric,0))),0) from om where sold),
 'totalReceived',(select coalesce(sum(amount_cents),0)/100.0 from am where payment_status='paid')+(select coalesce(sum(total),0) from om where sold)
 ),
 'services',coalesce((select jsonb_agg(to_jsonb(g) order by scheduled desc,name) from service_groups g),'[]'::jsonb),
 'products',coalesce((select jsonb_agg(to_jsonb(g) order by quantity desc,name) from product_groups g),'[]'::jsonb),
 'daily',(select jsonb_agg(jsonb_build_object('day',to_char(d.day,'YYYY-MM-DD'),
 'visits',(select count(*) from vm where day=d.day),
 'scheduled',(select count(*) from am where day=d.day and active),
 'productUnits',(select coalesce(sum(quantity),0) from im where day=d.day and sold)) order by d.day) from days d),
 'monthly',(select jsonb_agg(jsonb_build_object('month',to_char(m.day,'YYYY-MM'),
 'visits',(select count(*) from v where day>=m.day and day<(m.day+interval '1 month')),
 'scheduled',(select count(*) from a where day>=m.day and day<(m.day+interval '1 month') and active),
 'productUnits',(select coalesce(sum(quantity),0) from items where day>=m.day and day<(m.day+interval '1 month') and sold)) order by m.day) from monthly m)
);
$function$

revoke all on function public.dashboard_report(date) from public,anon,authenticated;
grant execute on function public.dashboard_report(date) to service_role;

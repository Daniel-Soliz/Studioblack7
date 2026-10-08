-- Public visitors can read the catalog and public business details only.
alter table public.site_data enable row level security;
drop policy if exists "Escrita pública" on public.site_data;
drop policy if exists "Leitura pública" on public.site_data;
drop policy if exists "Catálogo público" on public.site_data;
create policy "Catálogo público" on public.site_data for select to anon,authenticated
using (key in ('products','categories','services','gallery','content','settings'));
revoke insert,update,delete on public.site_data from anon,authenticated;
grant select on public.site_data to anon,authenticated;
grant all on public.site_data to service_role;
update public.site_data set value=value-'adminPasswordHash'-'cloudSyncKey'-'cloudSyncUrl'-'adminEmail',updated_at=now() where key='settings';
drop policy if exists "Imagens públicas para upload" on storage.objects;

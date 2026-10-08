create table if not exists public.admin_password_recovery (
  token_hash text primary key,
  email text not null,
  credential_version timestamptz not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes',
  consumed_at timestamptz
);
alter table public.admin_password_recovery enable row level security;
revoke all on public.admin_password_recovery from public, anon, authenticated;
grant all on public.admin_password_recovery to service_role;

create or replace function public.issue_admin_recovery(p_email text, p_token_hash text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare cfg public.admin_security_config%rowtype;
begin
  select * into cfg from public.admin_security_config where id = 1 for update;
  if lower(trim(cfg.recovery_email)) is distinct from p_email then return false; end if;
  if exists(select 1 from public.admin_password_recovery where created_at > now() - interval '1 minute')
    or (select count(*) from public.admin_password_recovery where created_at > now() - interval '1 hour') >= 3
    or (select count(*) from public.admin_password_recovery where created_at > now() - interval '1 day') >= 10 then
    return false;
  end if;
  delete from public.admin_password_recovery where created_at < now() - interval '32 days';
  insert into public.admin_password_recovery(token_hash,email,credential_version)
    values(p_token_hash,p_email,cfg.updated_at);
  return true;
end $$;

create or replace function public.consume_admin_recovery(p_token_hash text,p_password_hash text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare cfg public.admin_security_config%rowtype; rec public.admin_password_recovery%rowtype;
begin
  if p_password_hash !~ '^[0-9a-f]{64}$' then return false; end if;
  select * into cfg from public.admin_security_config where id = 1 for update;
  select * into rec from public.admin_password_recovery where token_hash = p_token_hash for update;
  if not found or rec.consumed_at is not null or rec.expires_at <= now()
    or rec.credential_version is distinct from cfg.updated_at
    or rec.email is distinct from lower(trim(cfg.recovery_email)) then return false; end if;
  update public.admin_password_recovery set consumed_at = now() where token_hash = p_token_hash;
  update public.admin_security_config set password_hash = p_password_hash, updated_at = clock_timestamp() where id = 1;
  return true;
end $$;
revoke all on function public.issue_admin_recovery(text,text) from public,anon,authenticated;
revoke all on function public.consume_admin_recovery(text,text) from public,anon,authenticated;
grant execute on function public.issue_admin_recovery(text,text) to service_role;
grant execute on function public.consume_admin_recovery(text,text) to service_role;

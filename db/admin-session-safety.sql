create table if not exists public.admin_revoked_sessions (
  token_hash text primary key,
  expires_at timestamptz not null
);
alter table public.admin_revoked_sessions enable row level security;
revoke all on public.admin_revoked_sessions from public,anon,authenticated;
grant all on public.admin_revoked_sessions to service_role;
create index if not exists admin_revoked_sessions_expiry_idx on public.admin_revoked_sessions(expires_at);

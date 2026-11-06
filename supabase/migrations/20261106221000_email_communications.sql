-- Courriels d'enregistrement, lettre d'information et journal d'envoi.
-- Le public n'a aucun accès. Le serveur utilise la clé service role.
-- Le code d'accès du responsable n'est pas copié dans ces tables.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text,
  locale text not null check (locale in ('fr', 'en')),
  consent_at timestamptz not null,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unsubscribe_token_hash text not null check (char_length(unsubscribe_token_hash) = 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_key unique (email),
  constraint newsletter_subscribers_email_chk check (
    email = lower(email)
    and char_length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint newsletter_subscribers_name_chk check (
    display_name is null or char_length(btrim(display_name)) between 1 and 80
  )
);

create index newsletter_subscribers_status_idx
  on public.newsletter_subscribers (unsubscribed_at, subscribed_at desc);

create table public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('registration', 'newsletter_confirm', 'campaign', 'publication')),
  subject text not null check (char_length(subject) between 1 and 180),
  body_note text not null default '' check (char_length(body_note) <= 8000),
  public_path text check (
    public_path is null
    or (
      char_length(public_path) <= 180
      and public_path ~ '^/(fr|en)(/[a-z0-9-]+)*$'
    )
  ),
  locale text not null check (locale in ('fr', 'en')),
  created_at timestamptz not null default now()
);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns (id) on delete cascade,
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 200),
  recipient_email text not null,
  audience text not null check (audience in ('leader', 'member', 'subscriber')),
  team_id uuid references public.teams (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0 and attempt_count <= 20),
  last_error text check (last_error is null or char_length(last_error) <= 180),
  provider_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint email_deliveries_idempotency_key unique (idempotency_key),
  constraint email_deliveries_email_chk check (
    recipient_email = lower(recipient_email)
    and char_length(recipient_email) <= 254
    and recipient_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

create index email_deliveries_status_idx
  on public.email_deliveries (status, created_at desc);

alter table public.newsletter_subscribers enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_deliveries enable row level security;

revoke all on table public.newsletter_subscribers from public, anon, authenticated;
revoke all on table public.email_campaigns from public, anon, authenticated;
revoke all on table public.email_deliveries from public, anon, authenticated;

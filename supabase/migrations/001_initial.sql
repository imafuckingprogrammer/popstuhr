-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text,
  plan text not null default 'free',
  messages_this_month integer not null default 0,
  messages_limit integer not null default 100,
  owner_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- WIDGETS
-- ============================================================
create table widgets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null default 'My Widget',
  active boolean not null default true,
  -- appearance
  primary_color text not null default '#DC2626',
  text_color text not null default '#ffffff',
  bg_color text not null default '#ffffff',
  font_family text not null default 'Inter',
  position text not null default 'bottom-right',
  welcome_message text not null default 'Hi! How can I help you today?',
  placeholder text not null default 'Type a message...',
  bot_name text not null default 'Support',
  bot_avatar_url text,
  logo_url text,
  show_branding boolean not null default true,
  -- behavior
  fallback_message text not null default 'I''m not sure about that. Please contact us directly for more help.',
  collect_email boolean not null default false,
  notify_email text,
  allowed_domains text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- KNOWLEDGE ENTRIES
-- ============================================================
create table knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null default 'Knowledge Entry',
  content text not null,
  source_type text not null default 'manual',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table conversations (
  id uuid primary key default gen_random_uuid(),
  widget_id uuid not null references widgets(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  visitor_id text not null,
  visitor_email text,
  status text not null default 'active',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null,
  content text not null,
  tokens_used integer,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on organizations(owner_id);
create index on widgets(org_id);
create index on knowledge_entries(org_id);
create index on conversations(widget_id);
create index on conversations(org_id);
create index on conversations(visitor_id);
create index on messages(conversation_id);
create index on messages(created_at);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at before update on organizations
  for each row execute function update_updated_at();
create trigger widgets_updated_at before update on widgets
  for each row execute function update_updated_at();
create trigger knowledge_entries_updated_at before update on knowledge_entries
  for each row execute function update_updated_at();
create trigger conversations_updated_at before update on conversations
  for each row execute function update_updated_at();

-- ============================================================
-- ATOMIC MESSAGE COUNTER
-- ============================================================
create or replace function increment_org_messages(p_org_id uuid)
returns void as $$
begin
  update organizations
  set messages_this_month = messages_this_month + 1
  where id = p_org_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- MONTHLY RESET
-- ============================================================
create or replace function reset_monthly_message_counts()
returns void as $$
begin
  update organizations set messages_this_month = 0;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table organizations enable row level security;
alter table widgets enable row level security;
alter table knowledge_entries enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- organizations: owner only
create policy "org_owner" on organizations
  for all using (owner_id = auth.uid());

-- widgets: org owner only
create policy "widget_owner" on widgets
  for all using (
    org_id in (select id from organizations where owner_id = auth.uid())
  );

-- knowledge entries: org owner only
create policy "knowledge_owner" on knowledge_entries
  for all using (
    org_id in (select id from organizations where owner_id = auth.uid())
  );

-- conversations: org owner only (dashboard reads)
create policy "conversation_owner" on conversations
  for all using (
    org_id in (select id from organizations where owner_id = auth.uid())
  );

-- messages: via conversation ownership
create policy "message_owner" on messages
  for all using (
    conversation_id in (
      select c.id from conversations c
      join organizations o on o.id = c.org_id
      where o.owner_id = auth.uid()
    )
  );

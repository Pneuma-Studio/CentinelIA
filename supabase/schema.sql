-- ─────────────────────────────────────────────────────────────────────────────
-- CentinelIA — Supabase Schema
-- Run this in your Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Voice Agents ─────────────────────────────────────────────────────────────────
create table if not exists voice_agents (
  id                    uuid primary key default gen_random_uuid(),
  client_name           text not null,
  business_name         text not null,
  business_description  text not null default '',
  business_address      text,
  business_phone_display text not null default '',
  phone_number          text not null default '',
  vapi_agent_id         text,
  elevenlabs_voice_id   text,
  plan                  text not null check (plan in ('basico', 'estandar', 'pro')) default 'basico',
  features              jsonb not null default '{
    "receptionist": true,
    "lead_qualification": true,
    "appointment_booking": true,
    "existing_client_support": false,
    "smart_transfer": false,
    "order_taking": false,
    "multilingual": false,
    "client_memory": false,
    "whatsapp_escalation": false
  }',
  business_hours        jsonb not null default '{
    "monday":    {"open": true,  "from": "09:00", "to": "18:00"},
    "tuesday":   {"open": true,  "from": "09:00", "to": "18:00"},
    "wednesday": {"open": true,  "from": "09:00", "to": "18:00"},
    "thursday":  {"open": true,  "from": "09:00", "to": "18:00"},
    "friday":    {"open": true,  "from": "09:00", "to": "18:00"},
    "saturday":  {"open": false},
    "sunday":    {"open": false}
  }',
  timezone              text not null default 'America/Monterrey',
  transfer_number       text,
  transfer_whatsapp     text,
  calendar_url          text,
  crm_webhook           text,
  knowledge_base        text,
  agent_name            text,
  minutes_included      integer not null default 200,
  minutes_used          integer not null default 0,
  minutes_reset_date    date not null default (date_trunc('month', now()) + interval '1 month')::date,
  notion_client_id      text,
  active                boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Voice Leads ─────────────────────────────────────────────────────────────────
create table if not exists leads_voice (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references voice_agents(id) on delete cascade,
  nombre      text,
  negocio     text,
  giro        text,
  servicio    text,
  presupuesto text,
  timeline    text,
  email       text,
  whatsapp    text,
  source      text not null default 'llamada',
  created_at  timestamptz not null default now()
);

create index if not exists leads_voice_agent_id_idx on leads_voice(agent_id);
create index if not exists leads_voice_created_at_idx on leads_voice(created_at desc);

-- Voice Calls ──────────────────────────────────────────────────────────────────
create table if not exists voice_calls (
  id                   uuid primary key default gen_random_uuid(),
  agent_id             uuid not null references voice_agents(id) on delete cascade,
  vapi_call_id         text unique,
  caller_number        text not null default '',
  duration_seconds     integer not null default 0,
  transcript           text,
  summary              text,
  outcome              text not null default 'other' check (outcome in (
    'lead_created', 'appointment_booked', 'order_taken',
    'transferred', 'info_provided', 'unanswered',
    'escalated_whatsapp', 'other'
  )),
  lead_created         boolean not null default false,
  appointment_created  boolean not null default false,
  order_created        boolean not null default false,
  transferred          boolean not null default false,
  cost_usd             numeric(8, 4),
  created_at           timestamptz not null default now()
);

-- Auto-update updated_at ───────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger voice_agents_updated_at
  before update on voice_agents
  for each row execute function update_updated_at();

-- Indexes ──────────────────────────────────────────────────────────────────────
create index if not exists voice_calls_agent_id_idx on voice_calls(agent_id);
create index if not exists voice_calls_created_at_idx on voice_calls(created_at desc);
create index if not exists voice_agents_active_idx on voice_agents(active);

-- Increment minutes used ─────────────────────────────────────────────────────
create or replace function increment_minutes_used(agent_id uuid, minutes integer)
returns void language plpgsql as $$
begin
  update voice_agents
  set minutes_used = minutes_used + minutes
  where id = agent_id;
end;
$$;

-- Monthly analytics snapshots ────────────────────────────────────────────────
-- Stores aggregated per-agent stats for each month.
-- Populated daily by /api/admin/analytics/snapshot (Vercel cron).
create table if not exists agent_monthly_stats (
  id               uuid primary key default gen_random_uuid(),
  agent_id         uuid references voice_agents(id) on delete cascade not null,
  period           text not null,              -- 'YYYY-MM'
  calls            int  not null default 0,
  leads            int  not null default 0,
  duration_seconds int  not null default 0,
  minutes_used     int  not null default 0,
  updated_at       timestamptz not null default now(),
  unique(agent_id, period)
);
create index if not exists agent_monthly_stats_agent_idx  on agent_monthly_stats(agent_id);
create index if not exists agent_monthly_stats_period_idx on agent_monthly_stats(period desc);

-- Monthly minutes reset (call via cron) ───────────────────────────────────────
create or replace function reset_monthly_minutes()
returns void language plpgsql as $$
begin
  update voice_agents
  set
    minutes_used = 0,
    minutes_reset_date = (date_trunc('month', now()) + interval '1 month')::date
  where minutes_reset_date <= current_date;
end;
$$;

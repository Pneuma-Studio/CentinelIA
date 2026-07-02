-- ─────────────────────────────────────────────────────────────────────────────
-- Centinelia — WhatsApp Agents Schema
-- Run this in your Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- WhatsApp Agents ──────────────────────────────────────────────────────────────
create table if not exists whatsapp_agents (
  id                    uuid primary key default gen_random_uuid(),
  client_name           text not null,
  business_name         text not null,
  business_description  text not null default '',
  wa_phone_number       text not null unique,  -- Twilio number, e.g. '+14155238886'
  agent_name            text,
  timezone              text not null default 'America/Monterrey',
  knowledge_base        text,
  transfer_whatsapp     text,                  -- owner WhatsApp for lead notifications
  client_email          text,
  business_hours        jsonb default '{
    "monday":    {"open": true,  "from": "09:00", "to": "18:00"},
    "tuesday":   {"open": true,  "from": "09:00", "to": "18:00"},
    "wednesday": {"open": true,  "from": "09:00", "to": "18:00"},
    "thursday":  {"open": true,  "from": "09:00", "to": "18:00"},
    "friday":    {"open": true,  "from": "09:00", "to": "18:00"},
    "saturday":  {"open": false},
    "sunday":    {"open": false}
  }',
  capture_leads         boolean not null default true,
  capture_appointments  boolean not null default false,
  capture_orders        boolean not null default false,
  active                boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger whatsapp_agents_updated_at
  before update on whatsapp_agents
  for each row execute function update_updated_at();

-- WhatsApp Conversations ───────────────────────────────────────────────────────
create table if not exists wa_conversations (
  id               uuid primary key default gen_random_uuid(),
  agent_id         uuid not null references whatsapp_agents(id) on delete cascade,
  customer_number  text not null,
  messages         jsonb not null default '[]',
  lead_captured    boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(agent_id, customer_number)
);

create index if not exists wa_conversations_agent_idx on wa_conversations(agent_id);
create index if not exists wa_conversations_customer_idx on wa_conversations(customer_number);

create trigger wa_conversations_updated_at
  before update on wa_conversations
  for each row execute function update_updated_at();

-- WhatsApp Leads ───────────────────────────────────────────────────────────────
create table if not exists wa_leads (
  id               uuid primary key default gen_random_uuid(),
  agent_id         uuid not null references whatsapp_agents(id) on delete cascade,
  customer_number  text,
  nombre           text,
  whatsapp         text,
  email            text,
  negocio          text,
  giro             text,
  servicio         text,
  presupuesto      text,
  timeline         text,
  notas            text,
  created_at       timestamptz not null default now()
);

create index if not exists wa_leads_agent_idx on wa_leads(agent_id);
create index if not exists wa_leads_created_at_idx on wa_leads(created_at desc);

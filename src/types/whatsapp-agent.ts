export interface WAAgent {
  id: string;
  client_name: string;
  business_name: string;
  business_description: string;
  wa_phone_number: string;       // e.g. '+14155238886'
  agent_name?: string;
  timezone: string;
  knowledge_base?: string;
  transfer_whatsapp?: string;    // owner notification number
  client_email?: string;
  business_hours?: {
    monday:    WADaySchedule;
    tuesday:   WADaySchedule;
    wednesday: WADaySchedule;
    thursday:  WADaySchedule;
    friday:    WADaySchedule;
    saturday:  WADaySchedule;
    sunday:    WADaySchedule;
  };
  capture_leads: boolean;
  capture_appointments: boolean;
  capture_orders: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WADaySchedule {
  open:  boolean;
  from?: string;
  to?:   string;
}

export interface WAConversation {
  id: string;
  agent_id: string;
  customer_number: string;
  messages: WAMessage[];
  lead_captured: boolean;
  created_at: string;
  updated_at: string;
}

export interface WAMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

export interface WACapturedLead {
  nombre?: string;
  whatsapp?: string;
  email?: string;
  negocio?: string;
  giro?: string;
  servicio?: string;
  presupuesto?: string;
  timeline?: string;
  notas?: string;
}

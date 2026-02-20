export type Plan = 'free' | 'starter' | 'pro' | 'business'

export interface Organization {
  id: string
  name: string
  website_url: string | null
  plan: Plan
  messages_this_month: number
  messages_limit: number
  owner_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type WidgetPosition = 'bottom-right' | 'bottom-left'

export interface Widget {
  id: string
  org_id: string
  name: string
  active: boolean
  primary_color: string
  text_color: string
  bg_color: string
  font_family: string
  position: WidgetPosition
  welcome_message: string
  placeholder: string
  bot_name: string
  bot_avatar_url: string | null
  logo_url: string | null
  show_branding: boolean
  fallback_message: string
  collect_email: boolean
  notify_email: string | null
  allowed_domains: string[]
  created_at: string
  updated_at: string
}

export type KnowledgeSourceType = 'manual' | 'scraped' | 'faq' | 'document'

export interface KnowledgeEntry {
  id: string
  org_id: string
  title: string
  content: string
  source_type: KnowledgeSourceType
  active: boolean
  created_at: string
  updated_at: string
}

export type ConversationStatus = 'active' | 'closed' | 'escalated'

export interface Conversation {
  id: string
  widget_id: string
  org_id: string
  visitor_id: string
  visitor_email: string | null
  status: ConversationStatus
  metadata: Record<string, string>
  created_at: string
  updated_at: string
}

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  tokens_used: number | null
  created_at: string
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
  widget: Pick<Widget, 'name' | 'bot_name'>
}

export const PLAN_LIMITS: Record<Plan, { messages: number; widgets: number; label: string; price: number }> = {
  free: { messages: 100, widgets: 1, label: 'Free', price: 0 },
  starter: { messages: 5000, widgets: 1, label: 'Starter', price: 49 },
  pro: { messages: 15000, widgets: 3, label: 'Pro', price: 99 },
  business: { messages: 50000, widgets: 10, label: 'Business', price: 199 },
}

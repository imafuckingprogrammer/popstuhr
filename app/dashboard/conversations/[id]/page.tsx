import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ConversationActions } from './actions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ConversationDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/dashboard')

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, widgets(name, bot_name, primary_color)')
    .eq('id', id)
    .eq('org_id', org.id)
    .single()

  if (!conversation) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const widget = conversation.widgets as { name: string; bot_name: string; primary_color: string } | null
  const primaryColor = widget?.primary_color ?? '#DC2626'

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
    active: 'default',
    closed: 'secondary',
    escalated: 'destructive',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/conversations"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">
              Visitor {conversation.visitor_id.slice(0, 8)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(conversation.created_at), 'PPp')}
              {widget && ` · ${widget.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={statusColors[conversation.status] ?? 'secondary'} className="capitalize">
            {conversation.status}
          </Badge>
          <ConversationActions conversationId={id} currentStatus={conversation.status} />
        </div>
      </div>

      {/* Metadata */}
      {(conversation.visitor_email || conversation.metadata?.referer) && (
        <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm flex flex-wrap gap-x-6 gap-y-1">
          {conversation.visitor_email && (
            <span className="text-muted-foreground">
              Email: <span className="text-foreground">{conversation.visitor_email}</span>
            </span>
          )}
          {conversation.metadata?.referer && (
            <span className="text-muted-foreground truncate max-w-xs">
              Page: <span className="text-foreground">{conversation.metadata.referer}</span>
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 rounded-xl border bg-card p-6">
        {!messages || messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No messages</p>
        ) : (
          messages
            .filter(m => m.role !== 'system')
            .map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    backgroundColor: msg.role === 'assistant' ? primaryColor : '#6b7280',
                  }}
                >
                  {msg.role === 'assistant' ? (widget?.bot_name?.slice(0, 1) ?? 'B') : 'V'}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-prose inline-block"
                    style={
                      msg.role === 'user'
                        ? { backgroundColor: '#f3f4f6', color: '#111' }
                        : { backgroundColor: `${primaryColor}14`, color: '#111' }
                    }
                  >
                    {msg.content}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 px-1">
                    {format(new Date(msg.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

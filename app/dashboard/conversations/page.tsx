import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, ArrowRight } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ConversationFilters } from './filters'

interface Props {
  searchParams: Promise<{ status?: string; widget?: string }>
}

export default async function ConversationsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/dashboard/onboarding')

  const { data: widgets } = await supabase
    .from('widgets')
    .select('id, name')
    .eq('org_id', org.id)

  let query = supabase
    .from('conversations')
    .select('*, widgets(name, bot_name)')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.status) query = query.eq('status', params.status)
  if (params.widget) query = query.eq('widget_id', params.widget)

  const { data: conversations } = await query

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
    active: 'default',
    closed: 'secondary',
    escalated: 'destructive',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Every chat your visitors have had.
        </p>
      </div>

      <ConversationFilters widgets={widgets ?? []} currentStatus={params.status} currentWidget={params.widget} />

      {!conversations || conversations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold mb-1">No conversations yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Conversations will appear here once visitors start chatting with your widget.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map(c => {
            const widget = c.widgets as { name: string; bot_name: string } | null
            return (
              <Link
                key={c.id}
                href={`/dashboard/conversations/${c.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group"
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">
                    {c.visitor_id.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate">
                      Visitor {c.visitor_id.slice(0, 8)}
                      {c.visitor_email && (
                        <span className="text-muted-foreground ml-1 font-normal">— {c.visitor_email}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {widget && <span>{widget.name}</span>}
                    <span>·</span>
                    <span title={format(new Date(c.created_at), 'PPpp')}>
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                    {c.metadata?.referer && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-32">{c.metadata.referer}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusColors[c.status] ?? 'secondary'} className="text-xs capitalize">
                    {c.status}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

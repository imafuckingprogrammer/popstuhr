import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MessageSquare, Layers, BookOpen, ArrowRight, Zap } from 'lucide-react'
import { PLAN_LIMITS } from '@/lib/types'
import type { Plan } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get or create organization
  let { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!org) {
    const { data: newOrg } = await supabase
      .from('organizations')
      .insert({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Business',
        owner_id: user.id,
      })
      .select()
      .single()
    org = newOrg
  }

  if (!org) redirect('/login')

  // Redirect to onboarding if not completed
  if (!org.onboarding_completed) {
    redirect('/dashboard/onboarding')
  }

  const planLimits = PLAN_LIMITS[org.plan as Plan]
  const usagePercent = Math.min(100, Math.round((org.messages_this_month / org.messages_limit) * 100))

  // Fetch stats
  const [widgetsRes, knowledgeRes, conversationsRes] = await Promise.all([
    supabase.from('widgets').select('id, name, active').eq('org_id', org.id),
    supabase.from('knowledge_entries').select('id').eq('org_id', org.id).eq('active', true),
    supabase.from('conversations').select('id, status, created_at, visitor_id')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const widgets = widgetsRes.data ?? []
  const knowledge = knowledgeRes.data ?? []
  const recentConversations = conversationsRes.data ?? []
  const activeWidgets = widgets.filter(w => w.active)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s how your chatbot is performing this month.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages this month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org.messages_this_month.toLocaleString()}</div>
            <div className="mt-2 space-y-1">
              <Progress value={usagePercent} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {usagePercent}% of {planLimits.messages.toLocaleString()} limit
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Active widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWidgets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {widgets.length} total / {planLimits.widgets} allowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Knowledge entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledge.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active content pieces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold capitalize">{planLimits.label}</span>
              <Badge variant="secondary" className="text-xs">{planLimits.price === 0 ? 'Free' : `$${planLimits.price}/mo`}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/dashboard/settings" className="hover:text-foreground underline transition-colors">
                Manage billing
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Recent conversations
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7 gap-1">
              <Link href="/dashboard/conversations">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentConversations.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">They&apos;ll appear here once your widget is live</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConversations.map(c => (
                  <Link
                    key={c.id}
                    href={`/dashboard/conversations/${c.id}`}
                    className="flex items-center justify-between py-2 border-b last:border-0 hover:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {c.visitor_id.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">Visitor {c.visitor_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <Badge
                      variant={c.status === 'active' ? 'default' : 'secondary'}
                      className="text-[10px] shrink-0"
                    >
                      {c.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                href: '/dashboard/knowledge',
                label: 'Add knowledge',
                description: 'Teach your bot something new',
                icon: BookOpen,
              },
              {
                href: '/dashboard/widgets',
                label: 'Customize widget',
                description: 'Update colors and messaging',
                icon: Layers,
              },
              {
                href: widgets[0] ? `/dashboard/widgets/${widgets[0].id}/install` : '/dashboard/widgets',
                label: 'Install widget',
                description: 'Get the script tag for your site',
                icon: ArrowRight,
              },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessagesChart } from './messages-chart'
import { subDays, format, startOfDay } from 'date-fns'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, messages_this_month, messages_limit, plan')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/dashboard/onboarding')

  // Last 30 days of messages
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  const [conversationsRes, widgetsRes] = await Promise.all([
    supabase
      .from('conversations')
      .select('id, status, created_at')
      .eq('org_id', org.id)
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('widgets')
      .select('id, name')
      .eq('org_id', org.id),
  ])

  const conversations = conversationsRes.data ?? []
  const convIds = conversations.map(c => c.id)

  const messagesRes = convIds.length > 0
    ? await supabase
        .from('messages')
        .select('created_at, role, conversation_id')
        .in('conversation_id', convIds)
        .eq('role', 'user')
        .gte('created_at', thirtyDaysAgo)
    : { data: [] }

  const messages = messagesRes.data ?? []

  // Build chart data — messages per day for last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    return {
      date: format(date, 'MMM d'),
      isoDate: format(startOfDay(date), 'yyyy-MM-dd'),
      messages: 0,
      conversations: 0,
    }
  })

  messages.forEach(m => {
    const day = format(new Date(m.created_at), 'MMM d')
    const entry = days.find(d => d.date === day)
    if (entry) entry.messages++
  })

  conversations.forEach(c => {
    const day = format(new Date(c.created_at), 'MMM d')
    const entry = days.find(d => d.date === day)
    if (entry) entry.conversations++
  })

  const totalMessages = messages.length
  const totalConversations = conversations.length
  const closedConversations = conversations.filter(c => c.status === 'closed').length
  const resolutionRate = totalConversations > 0
    ? Math.round((closedConversations / totalConversations) * 100)
    : 0

  // Peak day
  const peakDay = [...days].sort((a, b) => b.messages - a.messages)[0]
  const avgPerDay = totalConversations > 0
    ? (totalMessages / 30).toFixed(1)
    : '0'

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Last 30 days</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolution rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{closedConversations} closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerDay}</div>
            <p className="text-xs text-muted-foreground mt-1">Messages per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Messages over time</CardTitle>
        </CardHeader>
        <CardContent>
          <MessagesChart data={days} />
        </CardContent>
      </Card>

      {/* Peak activity + monthly usage side by side */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Peak activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {peakDay && peakDay.messages > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Busiest day</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{peakDay.date}</span>
                  <Badge variant="secondary" className="text-xs">{peakDay.messages} msgs</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not enough data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used this month</span>
              <span className="font-medium">{org.messages_this_month.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Limit</span>
              <span className="font-medium">{org.messages_limit.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-3">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (org.messages_this_month / org.messages_limit) * 100)}%`,
                  backgroundColor: 'oklch(0.527 0.224 27)',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((org.messages_this_month / org.messages_limit) * 100)}% of monthly limit
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

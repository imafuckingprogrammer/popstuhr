import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreateWidgetButton } from './create-widget-button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Layers, Settings2, Code, ArrowRight } from 'lucide-react'
import { PLAN_LIMITS } from '@/lib/types'
import type { Plan } from '@/lib/types'

export default async function WidgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/dashboard/onboarding')

  const { data: widgets } = await supabase
    .from('widgets')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  const planLimits = PLAN_LIMITS[org.plan as Plan]
  const canCreate = (widgets?.length ?? 0) < planLimits.widgets

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Widgets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Each widget gets its own script tag and can have different settings.
          </p>
        </div>
        <CreateWidgetButton orgId={org.id} canCreate={canCreate} />
      </div>

      <div className="flex gap-3">
        <Badge variant="secondary" className="py-1 px-3">
          {widgets?.length ?? 0} / {planLimits.widgets} widgets
        </Badge>
      </div>

      {!widgets || widgets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold mb-1">No widgets yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Create a widget to get your chatbot script tag.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {widgets.map(w => (
            <Card key={w.id} className="group hover:border-foreground/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-lg shrink-0"
                      style={{ backgroundColor: w.primary_color }}
                    />
                    <div>
                      <h3 className="font-semibold text-sm">{w.name}</h3>
                      <p className="text-xs text-muted-foreground">{w.bot_name}</p>
                    </div>
                  </div>
                  <Badge variant={w.active ? 'default' : 'secondary'} className="text-xs">
                    {w.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 font-mono truncate mb-4">
                  id: {w.id}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="gap-1.5 flex-1">
                    <Link href={`/dashboard/widgets/${w.id}`}>
                      <Settings2 className="h-3.5 w-3.5" />
                      Customize
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="gap-1.5 flex-1">
                    <Link href={`/dashboard/widgets/${w.id}/install`}>
                      <Code className="h-3.5 w-3.5" />
                      Install
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!canCreate && (
        <div className="rounded-xl border border-dashed p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            You&apos;ve reached the widget limit on your current plan.
          </p>
          <Button variant="outline" size="sm" asChild className="gap-1.5 shrink-0">
            <Link href="/dashboard/settings">
              Upgrade <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

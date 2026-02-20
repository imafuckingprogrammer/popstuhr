import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountForm } from './account-form'
import { DeleteAccountButton } from './delete-account-button'
import { PLAN_LIMITS } from '@/lib/types'
import type { Plan } from '@/lib/types'
import { CreditCard } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  const planLimits = org ? PLAN_LIMITS[org.plan as Plan] : PLAN_LIMITS.free

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Account section */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Account</h2>
        <AccountForm
          initialName={user.user_metadata?.full_name ?? ''}
          initialEmail={user.email ?? ''}
          orgName={org?.name ?? ''}
          orgId={org?.id ?? ''}
        />
      </div>

      <Separator />

      {/* Billing section */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Plan & Billing</h2>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Current plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{planLimits.label}</span>
                  <Badge variant="secondary">
                    {planLimits.price === 0 ? 'Free' : `$${planLimits.price}/mo`}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {planLimits.messages.toLocaleString()} messages / month · {planLimits.widgets} {planLimits.widgets === 1 ? 'widget' : 'widgets'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Stripe billing is coming soon. Upgrade options will appear here.
              </p>
              <p className="text-xs text-muted-foreground">
                Contact us to upgrade your plan in the meantime.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Danger zone */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
        <Card className="border-destructive/20">
          <CardContent className="pt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all data. This cannot be undone.
              </p>
            </div>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

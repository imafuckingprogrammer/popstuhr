'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  initialName: string
  initialEmail: string
  orgName: string
  orgId: string
}

export function AccountForm({ initialName, initialEmail, orgName, orgId }: Props) {
  const [name, setName] = useState(initialName)
  const [businessName, setBusinessName] = useState(orgName)
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const [userRes, orgRes] = await Promise.all([
      supabase.auth.updateUser({ data: { full_name: name } }),
      orgId
        ? supabase.from('organizations').update({ name: businessName }).eq('id', orgId)
        : Promise.resolve({ error: null }),
    ])

    if (userRes.error || orgRes.error) {
      toast.error('Failed to save changes')
    } else {
      toast.success('Changes saved')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={initialEmail}
            disabled
            className="opacity-60"
          />
          <p className="text-xs text-muted-foreground">Contact support to change your email</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business">Business name</Label>
        <Input
          id="business"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          placeholder="My Business"
        />
        <p className="text-xs text-muted-foreground">This is how your AI identifies your business</p>
      </div>

      <Button type="submit" disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save changes
      </Button>
    </form>
  )
}

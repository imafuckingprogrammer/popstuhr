'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  orgId: string
  canCreate: boolean
}

export function CreateWidgetButton({ orgId, canCreate }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) { toast.error('Name is required'); return }
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('widgets')
      .insert({ org_id: orgId, name: name.trim() })
      .select('id')
      .single()

    if (error || !data) {
      toast.error('Failed to create widget')
      setLoading(false)
      return
    }

    toast.success('Widget created')
    setOpen(false)
    router.push(`/dashboard/widgets/${data.id}`)
    router.refresh()
  }

  return (
    <>
      <Button
        onClick={() => canCreate ? setOpen(true) : toast.error('Upgrade to create more widgets')}
        className="gap-2 shrink-0"
      >
        <Plus className="h-4 w-4" />
        New widget
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create new widget</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label htmlFor="widget-name">Widget name</Label>
            <Input
              id="widget-name"
              placeholder="e.g. Main Site, Blog, Checkout..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

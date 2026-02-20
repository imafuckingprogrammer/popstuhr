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
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteAccountButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (confirm !== 'delete my account') return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Delete org (cascades to all data via FK)
    await supabase.from('organizations').delete().eq('owner_id', user.id)

    // Sign out
    await supabase.auth.signOut()
    toast.success('Account deleted')
    router.push('/')
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all widgets, knowledge entries, and conversation history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-delete">
              Type <strong>delete my account</strong> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="delete my account"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirm !== 'delete my account' || loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

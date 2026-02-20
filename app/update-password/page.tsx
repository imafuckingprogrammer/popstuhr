'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Flame, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error("Passwords don't match")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Password updated!')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Flame className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">RedHotChatbot</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Choose a strong password</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Same as above"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  )
}

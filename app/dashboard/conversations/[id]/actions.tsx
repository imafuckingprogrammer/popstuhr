'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  conversationId: string
  currentStatus: string
}

export function ConversationActions({ conversationId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', conversationId)

    if (error) { toast.error('Failed to update'); setLoading(false); return }
    toast.success(`Marked as ${status}`)
    router.refresh()
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} className="gap-1.5">
          <MoreHorizontal className="h-4 w-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== 'closed' && (
          <DropdownMenuItem onClick={() => updateStatus('closed')} className="gap-2">
            <CheckCircle className="h-3.5 w-3.5" />
            Mark as closed
          </DropdownMenuItem>
        )}
        {currentStatus !== 'active' && (
          <DropdownMenuItem onClick={() => updateStatus('active')} className="gap-2">
            Mark as active
          </DropdownMenuItem>
        )}
        {currentStatus !== 'escalated' && (
          <DropdownMenuItem onClick={() => updateStatus('escalated')} className="gap-2 text-destructive focus:text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            Mark as escalated
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

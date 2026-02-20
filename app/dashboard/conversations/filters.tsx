'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  widgets: Array<{ id: string; name: string }>
  currentStatus?: string
  currentWidget?: string
}

export function ConversationFilters({ widgets, currentStatus, currentWidget }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <Select
        value={currentStatus ?? 'all'}
        onValueChange={v => updateParam('status', v)}
      >
        <SelectTrigger className="w-36 h-8 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="escalated">Escalated</SelectItem>
        </SelectContent>
      </Select>

      {widgets.length > 0 && (
        <Select
          value={currentWidget ?? 'all'}
          onValueChange={v => updateParam('widget', v)}
        >
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder="Widget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All widgets</SelectItem>
            {widgets.map(w => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

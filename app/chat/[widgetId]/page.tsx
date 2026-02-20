import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { ChatInterface } from './chat-interface'
import type { Widget } from '@/lib/types'

interface Props {
  params: Promise<{ widgetId: string }>
}

export default async function ChatPage({ params }: Props) {
  const { widgetId } = await params
  const supabase = await createServiceClient()

  const { data: widget } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', widgetId)
    .eq('active', true)
    .single()

  if (!widget) notFound()

  return <ChatInterface widget={widget as Widget} />
}

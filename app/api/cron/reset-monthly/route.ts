import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const { error } = await supabase.rpc('reset_monthly_message_counts')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, reset_at: new Date().toISOString() })
}

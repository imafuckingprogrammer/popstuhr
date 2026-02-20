import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 60

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServiceClient()

  const { data: widget } = await supabase
    .from('widgets')
    .select('id, primary_color, text_color, bg_color, font_family, position, welcome_message, placeholder, bot_name, show_branding, active')
    .eq('id', id)
    .single()

  if (!widget) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json(widget, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}

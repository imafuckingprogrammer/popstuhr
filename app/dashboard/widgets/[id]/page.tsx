'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Code,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Widget } from '@/lib/types'
import { WidgetPreview } from './widget-preview'

export default function WidgetCustomizerPage() {
  const params = useParams()
  const router = useRouter()
  const widgetId = params.id as string

  const [widget, setWidget] = useState<Widget | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state mirrors widget fields
  const [form, setForm] = useState<Partial<Widget>>({})

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('widgets')
      .select('*')
      .eq('id', widgetId)
      .single()

    if (!data) { router.push('/dashboard/widgets'); return }
    setWidget(data)
    setForm(data)
    setLoading(false)
  }, [widgetId, router])

  useEffect(() => { load() }, [load])

  function update<K extends keyof Widget>(key: K, value: Widget[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('widgets')
      .update(form)
      .eq('id', widgetId)

    if (error) { toast.error('Failed to save'); setSaving(false); return }
    toast.success('Widget saved')
    setWidget(prev => prev ? { ...prev, ...form } : null)
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this widget? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('widgets').delete().eq('id', widgetId)
    toast.success('Widget deleted')
    router.push('/dashboard/widgets')
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!widget) return null

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/dashboard/widgets"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{widget.name}</h1>
            <p className="text-sm text-muted-foreground">Widget customizer</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={form.active ? 'default' : 'secondary'} className="text-xs">
            {form.active ? 'Active' : 'Inactive'}
          </Badge>
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href={`/dashboard/widgets/${widgetId}/install`}>
              <Code className="h-3.5 w-3.5" />
              Install
            </Link>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings panel */}
        <div className="space-y-6">
          <Tabs defaultValue="appearance">
            <TabsList className="w-full">
              <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="behavior" className="flex-1">Behavior</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.primary_color ?? '#DC2626'}
                      onChange={e => update('primary_color', e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-input bg-background p-0.5 shrink-0"
                    />
                    <Input
                      value={form.primary_color ?? ''}
                      onChange={e => update('primary_color', e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={form.position ?? 'bottom-right'}
                    onValueChange={v => update('position', v as Widget['position'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom right</SelectItem>
                      <SelectItem value="bottom-left">Bottom left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font family</Label>
                <Select
                  value={form.font_family ?? 'Inter'}
                  onValueChange={v => update('font_family', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="system-ui">System UI</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Show branding</p>
                  <p className="text-xs text-muted-foreground">Display "Powered by RedHotChatbot"</p>
                </div>
                <Switch
                  checked={form.show_branding ?? true}
                  onCheckedChange={v => update('show_branding', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Widget active</p>
                  <p className="text-xs text-muted-foreground">Toggle to disable the widget</p>
                </div>
                <Switch
                  checked={form.active ?? true}
                  onCheckedChange={v => update('active', v)}
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Bot name</Label>
                <Input
                  value={form.bot_name ?? ''}
                  onChange={e => update('bot_name', e.target.value)}
                  placeholder="Support"
                />
              </div>

              <div className="space-y-2">
                <Label>Welcome message</Label>
                <Textarea
                  value={form.welcome_message ?? ''}
                  onChange={e => update('welcome_message', e.target.value)}
                  placeholder="Hi! How can I help you today?"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Input placeholder</Label>
                <Input
                  value={form.placeholder ?? ''}
                  onChange={e => update('placeholder', e.target.value)}
                  placeholder="Type a message..."
                />
              </div>

              <div className="space-y-2">
                <Label>Fallback message</Label>
                <Textarea
                  value={form.fallback_message ?? ''}
                  onChange={e => update('fallback_message', e.target.value)}
                  placeholder="I'm not sure about that. Please contact us directly."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">Shown when the AI can&apos;t answer</p>
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4 pt-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Collect visitor email</p>
                  <p className="text-xs text-muted-foreground">Ask for email before chatting</p>
                </div>
                <Switch
                  checked={form.collect_email ?? false}
                  onCheckedChange={v => update('collect_email', v)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Notification email</Label>
                <Input
                  type="email"
                  value={form.notify_email ?? ''}
                  onChange={e => update('notify_email', e.target.value)}
                  placeholder="you@yourbusiness.com"
                />
                <p className="text-xs text-muted-foreground">Get notified when a new conversation starts</p>
              </div>

              <div className="space-y-2">
                <Label>Allowed domains</Label>
                <Input
                  value={(form.allowed_domains ?? []).join(', ')}
                  onChange={e => {
                    const domains = e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                    update('allowed_domains', domains)
                  }}
                  placeholder="yoursite.com, app.yoursite.com"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to allow all domains. Separate multiple with commas.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 text-destructive hover:text-destructive"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete widget
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Live preview</h3>
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs h-7">
              <Link href={`/chat/${widgetId}`} target="_blank">
                <ExternalLink className="h-3 w-3" />
                Open in new tab
              </Link>
            </Button>
          </div>
          <WidgetPreview widget={form as Widget} />
        </div>
      </div>
    </div>
  )
}

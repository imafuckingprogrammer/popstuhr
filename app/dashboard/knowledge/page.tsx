'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { extractText } from '@/lib/extract-text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import type { KnowledgeEntry } from '@/lib/types'

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [orgId, setOrgId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    if (!org) return

    setOrgId(org.id)

    const { data } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })

    setEntries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditing(null)
    setTitle('')
    setContent('')
    setDialogOpen(true)
  }

  function openEdit(entry: KnowledgeEntry) {
    setEditing(entry)
    setTitle(entry.title)
    setContent(entry.content)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!content.trim()) { toast.error('Content is required'); return }
    setSaving(true)

    const extracted = extractText(content)
    const supabase = createClient()

    if (editing) {
      const { error } = await supabase
        .from('knowledge_entries')
        .update({ title: title || 'Knowledge Entry', content: extracted })
        .eq('id', editing.id)

      if (error) { toast.error('Failed to save'); setSaving(false); return }
      toast.success('Entry updated')
    } else {
      const { error } = await supabase
        .from('knowledge_entries')
        .insert({ org_id: orgId, title: title || 'Knowledge Entry', content: extracted, source_type: 'manual' })

      if (error) { toast.error('Failed to save'); setSaving(false); return }
      toast.success('Entry added')
    }

    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleToggle(entry: KnowledgeEntry) {
    const supabase = createClient()
    await supabase
      .from('knowledge_entries')
      .update({ active: !entry.active })
      .eq('id', entry.id)
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, active: !e.active } : e))
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('knowledge_entries').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Entry deleted')
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const activeCount = entries.filter(e => e.active).length

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Everything your AI knows about your business.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add entry
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="secondary" className="gap-1.5 py-1 px-3">
          <BookOpen className="h-3 w-3" />
          {activeCount} active {activeCount === 1 ? 'entry' : 'entries'}
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1 px-3">
          {entries.length} total
        </Badge>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold mb-1">No knowledge entries yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Add your FAQs, policies, product info — anything your customers might ask about.
            </p>
            <Button onClick={openNew} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add first entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div
              key={entry.id}
              className={`group rounded-xl border bg-card p-4 flex gap-4 transition-opacity ${!entry.active ? 'opacity-60' : ''}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0 mt-0.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">{entry.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.content.slice(0, 120)}{entry.content.length > 120 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                    <Switch
                      checked={entry.active}
                      onCheckedChange={() => handleToggle(entry)}
                      className="scale-90"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(entry)} className="gap-2">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(entry.id)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit entry' : 'Add knowledge entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. FAQs, Menu, Policies..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <p className="text-xs text-muted-foreground">
                Paste plain text, JSON, or CSV — we&apos;ll extract the text automatically.
              </p>
              <Textarea
                id="content"
                placeholder="Paste your content here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={12}
                className="font-mono text-sm resize-none"
              />
              {content && (
                <p className="text-xs text-muted-foreground">{content.length.toLocaleString()} characters</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? 'Save changes' : 'Add entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

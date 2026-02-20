import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import { CopyButton } from './copy-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InstallPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: widget } = await supabase
    .from('widgets')
    .select('id, name, org_id')
    .eq('id', id)
    .single()

  if (!widget) notFound()

  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', widget.org_id)
    .single()

  if (org?.owner_id !== user.id) redirect('/dashboard/widgets')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://redhotchatbot.com'
  const scriptTag = `<script src="${appUrl}/widget.js?id=${widget.id}"></script>`

  const platforms = [
    {
      name: 'Shopify',
      badge: 'Shopify',
      steps: [
        'Go to Online Store → Themes → your active theme',
        'Click "Actions" → "Edit code"',
        'Open the theme.liquid file',
        `Find the closing </body> tag and paste the script just before it`,
        'Click Save',
      ],
    },
    {
      name: 'WordPress',
      badge: 'WordPress',
      steps: [
        'Install and activate the "Insert Headers and Footers" plugin',
        'Go to Settings → Insert Headers and Footers',
        'Paste the script into the "Footer" section',
        'Click Save',
      ],
    },
    {
      name: 'Wix',
      badge: 'Wix',
      steps: [
        'Go to your Wix dashboard → Settings',
        'Click "Custom Code" under Advanced',
        'Click "+ Add Custom Code"',
        'Paste the script and choose "Load once per page"',
        'Set placement to "Body - end", click Apply',
      ],
    },
    {
      name: 'Squarespace',
      badge: 'Squarespace',
      steps: [
        'Go to Settings → Advanced → Code Injection',
        'Paste the script into the "Footer" field',
        'Click Save',
      ],
    },
    {
      name: 'Plain HTML',
      badge: 'HTML',
      steps: [
        `Open your HTML file`,
        `Find the closing </body> tag`,
        'Paste the script just before it',
        'Save and deploy',
      ],
    },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/widgets/${widget.id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Install {widget.name}</h1>
          <p className="text-sm text-muted-foreground">Copy the script tag and paste it on your site</p>
        </div>
      </div>

      {/* Script tag */}
      <div className="rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <span className="text-sm font-medium">Your widget script tag</span>
          <CopyButton text={scriptTag} />
        </div>
        <div className="p-4 bg-muted/10">
          <pre className="text-xs sm:text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
            <code>{scriptTag}</code>
          </pre>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Note:</strong> Paste this script tag just before the{' '}
        <code className="text-xs bg-amber-100 px-1 rounded">{`</body>`}</code>{' '}
        tag on every page where you want the chat widget to appear.
      </div>

      <Separator />

      {/* Platform guides */}
      <div>
        <h2 className="text-base font-semibold mb-4">Platform-specific instructions</h2>
        <div className="space-y-4">
          {platforms.map(p => (
            <div key={p.name} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs">{p.badge}</Badge>
                <h3 className="font-medium text-sm">{p.name}</h3>
              </div>
              <ol className="space-y-2">
                {p.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

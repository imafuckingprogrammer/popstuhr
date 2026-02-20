'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { extractText } from '@/lib/extract-text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, ArrowRight, ArrowLeft, Check, Loader2, BookOpen, Palette, Code } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Business', icon: Flame },
  { id: 2, label: 'Knowledge', icon: BookOpen },
  { id: 3, label: 'Appearance', icon: Palette },
  { id: 4, label: 'Install', icon: Code },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [businessName, setBusinessName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')

  // Step 2
  const [knowledgeTitle, setKnowledgeTitle] = useState('')
  const [knowledgeContent, setKnowledgeContent] = useState('')

  // Step 3
  const [primaryColor, setPrimaryColor] = useState('#DC2626')
  const [botName, setBotName] = useState('Support')
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can I help you today?')

  // Step 4
  const [widgetId, setWidgetId] = useState('')
  const [orgId, setOrgId] = useState('')

  async function handleStep1() {
    if (!businessName.trim()) {
      toast.error('Please enter your business name')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Upsert org
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    let id: string
    if (existingOrg) {
      await supabase.from('organizations').update({
        name: businessName,
        website_url: websiteUrl || null,
      }).eq('id', existingOrg.id)
      id = existingOrg.id
    } else {
      const { data: newOrg, error } = await supabase.from('organizations').insert({
        name: businessName,
        website_url: websiteUrl || null,
        owner_id: user.id,
      }).select('id').single()
      if (error || !newOrg) { toast.error('Something went wrong'); setLoading(false); return }
      id = newOrg.id
    }

    setOrgId(id)
    setLoading(false)
    setStep(2)
  }

  async function handleStep2() {
    setLoading(true)
    const supabase = createClient()

    if (knowledgeContent.trim()) {
      const extracted = extractText(knowledgeContent)
      const { error } = await supabase.from('knowledge_entries').insert({
        org_id: orgId,
        title: knowledgeTitle.trim() || 'General Information',
        content: extracted,
        source_type: 'manual',
      })
      if (error) {
        toast.error('Failed to save knowledge entry')
        setLoading(false)
        return
      }
    }

    setLoading(false)
    setStep(3)
  }

  async function handleStep3() {
    setLoading(true)
    const supabase = createClient()

    const { data: widget, error } = await supabase.from('widgets').insert({
      org_id: orgId,
      name: `${businessName} Widget`,
      primary_color: primaryColor,
      bot_name: botName,
      welcome_message: welcomeMessage,
    }).select('id').single()

    if (error || !widget) {
      toast.error('Failed to create widget')
      setLoading(false)
      return
    }

    setWidgetId(widget.id)

    // Mark onboarding complete
    await supabase.from('organizations').update({ onboarding_completed: true }).eq('id', orgId)

    setLoading(false)
    setStep(4)
  }

  const scriptTag = `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://redhotchatbot.com'}/widget.js?id=${widgetId}"></script>`

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Let&apos;s get you set up</h1>
          <p className="text-muted-foreground text-sm">Your chatbot will be live in 4 steps.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all text-sm font-semibold',
                  step > s.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : step === s.id
                    ? 'border-primary text-primary bg-primary/8'
                    : 'border-border text-muted-foreground bg-background'
                )}>
                  {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={cn(
                  'text-[11px] font-medium',
                  step === s.id ? 'text-foreground' : 'text-muted-foreground'
                )}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'h-px w-12 sm:w-16 mx-1 mt-[-20px] transition-all',
                  step > s.id ? 'bg-primary' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card className="shadow-sm">
          <CardContent className="pt-6 pb-6">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Tell us about your business</h2>
                  <p className="text-sm text-muted-foreground">This is how your bot will introduce itself.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business name</Label>
                    <Input
                      id="business-name"
                      placeholder="Acme Salon & Spa"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yoursite.com"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleStep1} className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Add your knowledge</h2>
                  <p className="text-sm text-muted-foreground">
                    Paste anything — FAQs, product info, policies. Plain text, JSON, or CSV all work.
                    You can add more later.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="k-title">Title <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="k-title"
                      placeholder="e.g. FAQs, Menu, Policies..."
                      value={knowledgeTitle}
                      onChange={e => setKnowledgeTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="k-content">Content</Label>
                    <Textarea
                      id="k-content"
                      placeholder="Paste anything here — your FAQ, product descriptions, policies, opening hours, prices..."
                      value={knowledgeContent}
                      onChange={e => setKnowledgeContent(e.target.value)}
                      rows={8}
                      className="font-mono text-sm resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={handleStep2} className="flex-1 gap-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  No content yet? That&apos;s fine — skip and add it later.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Customize your widget</h2>
                  <p className="text-sm text-muted-foreground">Match it to your brand. You can change everything later.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Bot name</Label>
                    <Input
                      id="bot-name"
                      placeholder="Support"
                      value={botName}
                      onChange={e => setBotName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="welcome">Welcome message</Label>
                    <Input
                      id="welcome"
                      placeholder="Hi! How can I help you today?"
                      value={welcomeMessage}
                      onChange={e => setWelcomeMessage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Brand color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="color"
                        type="color"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-0.5"
                      />
                      <Input
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        placeholder="#DC2626"
                        className="font-mono text-sm max-w-36"
                      />
                      <div
                        className="h-9 w-9 rounded-md border shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={handleStep3} className="flex-1 gap-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create widget <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">You&apos;re all set!</h2>
                    <p className="text-sm text-muted-foreground">Paste this on your website.</p>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                    <span className="text-xs text-muted-foreground font-mono">Script tag</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(scriptTag)
                        toast.success('Copied!')
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="px-4 py-3 text-xs font-mono overflow-x-auto text-foreground">
                    <code>{scriptTag}</code>
                  </pre>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Where to paste it:</p>
                  <ul className="space-y-1">
                    <li><Badge variant="outline" className="text-xs mr-2">Shopify</Badge>Online Store → Themes → Edit code → theme.liquid (before <code className="text-xs">{`</body>`}</code>)</li>
                    <li><Badge variant="outline" className="text-xs mr-2">WordPress</Badge>Plugins → Insert Headers and Footers → Footer</li>
                    <li><Badge variant="outline" className="text-xs mr-2">HTML</Badge>Paste before <code className="text-xs">{`</body>`}</code> in your HTML</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/widgets/${widgetId}`)}
                    className="flex-1"
                  >
                    Customize more
                  </Button>
                  <Button onClick={() => router.push('/dashboard')} className="flex-1 gap-2">
                    Go to dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

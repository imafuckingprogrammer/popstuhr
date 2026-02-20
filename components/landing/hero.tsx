import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Flame } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Subtle background radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.527 0.224 27 / 0.06), transparent)',
        }}
      />

      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="secondary" className="mb-6 gap-1.5 py-1 px-3 text-xs font-medium">
          <Flame className="h-3 w-3 text-primary" />
          AI customer support, without the cost
        </Badge>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          Your website deserves a{' '}
          <span className="text-primary">24/7 support agent</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste one script tag. Your AI reads your content and answers customer questions instantly —
          no support team required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" className="gap-2 h-11 px-6 text-[15px]" asChild>
            <Link href="/signup">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-11 px-6 text-[15px]" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          Free plan included. No credit card required.
        </p>

        {/* Code snippet preview */}
        <div className="mt-16 mx-auto max-w-xl">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden text-left">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/30">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <span className="h-3 w-3 rounded-full bg-green-400/80" />
              <span className="ml-auto text-[11px] text-muted-foreground font-mono">index.html</span>
            </div>
            <pre className="px-5 py-4 text-xs sm:text-sm font-mono overflow-x-auto">
              <code>
                <span className="text-muted-foreground">{`<!-- Add this before </body> -->`}</span>
                {'\n'}
                <span className="text-primary">{`<script`}</span>
                {' '}
                <span className="text-foreground">{`src`}</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-green-600">{`"https://redhotchatbot.com/widget.js?id=abc123"`}</span>
                <span className="text-primary">{`></script>`}</span>
              </code>
            </pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">That&apos;s it. Your chatbot is live.</p>
        </div>
      </div>
    </section>
  )
}

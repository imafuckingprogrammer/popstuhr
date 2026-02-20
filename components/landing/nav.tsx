'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">RedHotChatbot</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-200',
          open ? 'max-h-64 pb-4' : 'max-h-0'
        )}>
          <nav className="flex flex-col gap-1 pt-2">
            <a href="#features" onClick={() => setOpen(false)} className="px-2 py-2 text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how-it-works" onClick={() => setOpen(false)} className="px-2 py-2 text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#pricing" onClick={() => setOpen(false)} className="px-2 py-2 text-sm text-muted-foreground hover:text-foreground">Pricing</a>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

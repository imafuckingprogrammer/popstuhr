import Link from 'next/link'
import { Flame } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <Flame className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">RedHotChatbot</span>
        </Link>

        <nav className="flex items-center gap-6">
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} RedHotChatbot
        </p>
      </div>
    </footer>
  )
}

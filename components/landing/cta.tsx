import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 border-t">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
          Start answering customer questions today
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Free plan. No credit card. Live in under a minute.
        </p>
        <Button size="lg" className="gap-2 h-11 px-8 text-[15px]" asChild>
          <Link href="/signup">
            Create your chatbot
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

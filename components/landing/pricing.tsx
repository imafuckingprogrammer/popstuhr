import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try it out.',
    features: [
      '100 messages/month',
      '1 widget',
      'Branding badge',
      'Knowledge base',
      'Conversation history',
    ],
    cta: 'Get started',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'For growing businesses.',
    features: [
      '5,000 messages/month',
      '1 widget',
      'No branding badge',
      'Knowledge base',
      'Conversation history',
      'Analytics',
    ],
    cta: 'Start free trial',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/month',
    description: 'For serious operators.',
    features: [
      '15,000 messages/month',
      '3 widgets',
      'No branding badge',
      'Knowledge base',
      'Full analytics',
      'Email notifications',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Business',
    price: '$199',
    period: '/month',
    description: 'For multi-site operators.',
    features: [
      '50,000 messages/month',
      '10 widgets',
      'No branding badge',
      'Knowledge base',
      'Full analytics',
      'Email notifications',
      'Priority support',
      'Domain restrictions',
    ],
    cta: 'Start free trial',
    href: '/signup',
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Simple, predictable pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            Pay for what you use. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-xl border bg-card p-6 flex flex-col gap-5',
                plan.featured && 'border-primary shadow-[0_0_0_1px] shadow-primary/20'
              )}
            >
              {plan.featured && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs">
                  Most popular
                </Badge>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <Button
                variant={plan.featured ? 'default' : 'outline'}
                className="w-full"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>

              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

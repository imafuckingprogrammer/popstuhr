import { Zap, MessageCircle, Palette, BarChart3, Globe, Lock } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Set up in 60 seconds',
    description:
      'Paste your content, pick your colors, copy the script tag. Your chatbot is live before you finish your coffee.',
  },
  {
    icon: MessageCircle,
    title: 'Trained on your content',
    description:
      'Paste your FAQs, policies, product info — anything. The AI learns it and answers from it, not from thin air.',
  },
  {
    icon: Palette,
    title: 'Fully customizable',
    description:
      'Match your brand exactly. Colors, name, welcome message, position. Live preview as you tweak.',
  },
  {
    icon: Globe,
    title: 'Works everywhere',
    description:
      'Shopify, WordPress, Wix, Squarespace, custom HTML — one script tag, any platform.',
  },
  {
    icon: BarChart3,
    title: 'Know what they ask',
    description:
      'See every conversation. Understand what your customers are confused about and fix it at the source.',
  },
  {
    icon: Lock,
    title: 'Isolated and secure',
    description:
      'Runs in an iframe. Your site\'s CSS never touches it. Your visitors\'s interactions are private.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Built for small businesses that want real results without enterprise complexity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border">
          {features.map((f) => (
            <div key={f.title} className="bg-background p-8 flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/12">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

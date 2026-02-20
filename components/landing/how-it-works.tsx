const steps = [
  {
    step: '01',
    title: 'Add your content',
    description:
      'Paste your FAQs, product descriptions, policies, or anything else. Plain text, JSON, CSV — we read it all.',
  },
  {
    step: '02',
    title: 'Customize the widget',
    description:
      'Pick your brand colors, write a welcome message, name your bot. See exactly how it will look on your site.',
  },
  {
    step: '03',
    title: 'Paste the script tag',
    description:
      'Copy one line of code and paste it on your site. Works on any platform. Takes 30 seconds.',
  },
  {
    step: '04',
    title: 'Your customers get answers',
    description:
      'The AI answers from your content 24/7. You get notified about conversations and see everything in your dashboard.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-muted/30 border-y">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            From zero to live in four steps
          </h2>
          <p className="text-muted-foreground text-lg">
            No developers. No setup calls. No bloated software.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%_-_16px)] w-8 h-px bg-border" />
              )}
              <div className="flex flex-col gap-4">
                <span className="text-3xl font-bold text-primary/20 tabular-nums">{s.step}</span>
                <div>
                  <h3 className="font-semibold text-[15px] mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

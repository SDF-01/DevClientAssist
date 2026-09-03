import { Link } from 'react-router-dom'
import { ArrowRight, PenLine, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const steps = [
  {
    mark: '01',
    title: 'Write what should change',
    text: 'Use your own words. You do not need to make it perfect.',
    tone: 'blush',
    icon: PenLine,
  },
  {
    mark: '02',
    title: 'Ask ChatGPT for a .toon file',
    text: 'Copy the prompt we give you into ChatGPT. ChatGPT should create a .toon file. Paste that file back here.',
    tone: 'mint',
    icon: Sparkles,
  },
  {
    mark: '03',
    title: 'Send it to the developer',
    text: 'Add pictures if they help, then send the .toon file to the developer.',
    tone: 'lilac',
    icon: Send,
  },
]

export function HomePage() {
  return (
    <div>
      <section className="room-hero">
        <div className="hero-atmosphere" aria-hidden>
          <span className="glow-orb glow-orb-blush" />
          <span className="glow-orb glow-orb-mint" />
          <span className="glow-orb glow-orb-lilac" />
          <span className="glow-orb glow-orb-peach" />
          <div className="shoji-screen" />
        </div>
        <div className="room-hero-copy">
          <p className="app-chip">Airmen Voice</p>
          <h1 className="font-display mt-5 text-[2rem] font-normal leading-[1.18] text-foreground sm:text-[2.55rem]">
            Tell us what to change. ChatGPT turns it into a .toon file. We pass that file to the developer.
          </h1>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
            Copy a ready-made prompt into ChatGPT with your notes, paste the .toon file back, and send a clear request.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/submit">
              <Button size="lg" className="group rounded-[var(--radius-pill)]">
                Start a request
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link
              to="/requests"
              className="text-sm tracking-wide text-accent-primary underline-offset-4 hover:underline"
            >
              See my requests
            </Link>
          </div>
        </div>
      </section>

      <hr className="oak-rule" />

      <section className="furnishing-band" aria-label="How it works">
        <p className="section-label">How it works</p>
        <h2 className="font-display mt-3 text-3xl font-normal text-foreground">Three easy steps</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.mark}>
                <article className="furnish-card ornament-card h-full" data-tone={item.tone}>
                  <div className="step-orb">
                    <span className="step-orb-icon">
                      <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden />
                    </span>
                  </div>
                  <div className="furnish-copy">
                    <p className="font-display text-2xl text-accent-primary">{item.mark}</p>
                    <h3 className="font-display mt-2 text-xl font-normal text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                </article>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

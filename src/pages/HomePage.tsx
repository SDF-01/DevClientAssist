import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const steps = [
  {
    mark: '01',
    title: 'Write what should change',
    text: 'Use your own words. You do not need to make it perfect.',
  },
  {
    mark: '02',
    title: 'Ask ChatGPT for a .toon brief',
    text: 'Copy the prompt we give you into ChatGPT. ChatGPT should reply with copy-paste .toon text. Paste that text back here.',
  },
  {
    mark: '03',
    title: 'Send it to the developer',
    text: 'Add pictures if they help, then send the .toon file to the developer.',
  },
]

export function HomePage() {
  return (
    <div className="w-full">
      <section className="room-hero">
        <div className="room-hero-copy">
          <p className="app-chip">Airmen Voice</p>
          <h1 className="font-display mt-4 text-[1.75rem] font-normal leading-[1.3] text-foreground sm:text-[2.25rem]">
            Tell us what to change. ChatGPT turns it into a .toon file. We pass that file to the developer.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            Copy a ready-made prompt into ChatGPT with your notes, paste the .toon file back, and send a clear request.
          </p>
          <div className="hero-actions mt-7">
            <Link to="/submit" className="w-full sm:w-auto">
              <Button size="lg" className="group w-full sm:w-auto">
                Start a request
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link
              to="/requests"
              className="inline-flex min-h-10 items-center justify-center text-sm tracking-wide text-accent-primary underline-offset-4 hover:underline"
            >
              See my requests
            </Link>
          </div>
        </div>
      </section>

      <hr className="oak-rule" />

      <section className="furnishing-band" aria-label="How it works">
        <p className="section-label">How it works</p>
        <h2 className="font-display mt-2 text-2xl font-normal text-foreground sm:text-3xl">Three steps</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {steps.map((item) => (
            <li key={item.mark}>
              <article className="furnish-card ornament-card">
                <p className="step-mark">{item.mark}</p>
                <h3 className="font-display mt-2 text-lg font-normal text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

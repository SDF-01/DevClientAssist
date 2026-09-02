import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const steps = [
  {
    mark: '1',
    title: 'Write what should change',
    text: 'Use your own words. Templates are there if you want a head start.',
  },
  {
    mark: '2',
    title: 'Add pictures if they help',
    text: 'Screenshots are optional. Skip them when the words are enough.',
  },
  {
    mark: '3',
    title: 'Check and send',
    text: 'Glance at the brief, then send it to the team.',
  },
]

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid items-stretch overflow-hidden border border-[rgba(143,131,122,0.16)] bg-[#fffcf6] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hero-art relative">
          <img src="/art/ink-landscape.svg" alt="" className="landscape" />
          <img src="/art/lantern.svg" alt="" className="lantern" />
          <p className="vertical-seal absolute bottom-8 left-5 hidden text-sm lg:block">Dev Generator</p>
        </div>

        <div className="flex flex-col justify-center px-6 py-10 lg:px-10">
          <p className="app-chip">Airmen Voice</p>
          <h1 className="font-display mt-5 text-4xl font-normal leading-[1.15] text-[#3f3b36] sm:text-[2.75rem]">
            Tell us what to change. We turn it into a clear build brief.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#8f837a]">
            Three short steps. No extra fields. Your request stays in one place so you can follow it after you send it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/submit">
              <Button size="lg" className="group">
                Start a request
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link to="/requests" className="text-sm tracking-wide text-[#606c5a] underline-offset-4 hover:underline">
              See my requests
            </Link>
          </div>
        </div>
      </section>

      <hr className="wave-rule" />

      <section aria-label="How it works">
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <li key={item.mark}>
              <Card className="h-full">
                <p className="font-display text-3xl text-[#dcb482]">{item.mark}</p>
                <h2 className="font-display mt-3 text-xl font-normal text-[#3f3b36]">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#8f837a]">{item.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

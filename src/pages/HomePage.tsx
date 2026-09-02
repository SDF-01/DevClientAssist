import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const steps = [
  { mark: '一', title: 'Name the work', text: 'Confirm Airmen Voice and leave your contact details.' },
  { mark: '二', title: 'Describe the change', text: 'Write in plain language, or start from a template.' },
  { mark: '三', title: 'Pin the references', text: 'Attach screenshots and mark what should move.' },
  { mark: '四', title: 'Send a clean brief', text: 'Preview the structured output, then submit.' },
]

export function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid items-stretch gap-0 overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hero-art relative border border-[rgba(143,131,122,0.18)]">
          <img src="/art/ink-landscape.svg" alt="" className="landscape" />
          <img src="/art/lantern.svg" alt="" className="lantern" />
          <p className="vertical-seal absolute right-5 top-8 hidden h-64 text-xl lg:block">静けさ</p>
        </div>

        <div className="relative flex flex-col justify-center border border-[rgba(143,131,122,0.18)] border-t-0 bg-[#fffcf6] px-6 py-10 lg:border-l-0 lg:border-t lg:px-10">
          <p className="section-label">Dev Generator</p>
          <h1 className="font-display mt-3 text-4xl font-normal leading-[1.12] text-[#3f3b36] sm:text-5xl">
            A quiet desk for Airmen Voice revisions.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#8f837a]">
            Bring the change you want. We turn notes and screenshots into a structured brief the build team can act on.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/submit">
              <Button size="lg" className="group">
                Open the desk
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link to="/requests" className="text-sm tracking-wide text-[#606c5a] underline-offset-4 hover:underline">
              View requests
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {steps.map((item) => (
          <Card key={item.mark} className="min-h-[220px] bg-[#fffcf6]/80">
            <p className="font-accent text-2xl text-[#606c5a]">{item.mark}</p>
            <h2 className="font-display mt-4 text-xl font-normal text-[#3f3b36]">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#8f837a]">{item.text}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}

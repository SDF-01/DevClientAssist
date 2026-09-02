import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const steps = [
  {
    mark: '01',
    title: 'Write what should change',
    text: 'Use your own words. You do not need to make it perfect.',
    image: '/art/table-still-life.png',
    imagePosition: '50% 62%',
  },
  {
    mark: '02',
    title: 'Format it in ChatGPT',
    text: 'Copy the prompt we give you into ChatGPT, then paste the formatted reply back here.',
    image: '/art/lamp-corner.png',
    imagePosition: '50% 30%',
  },
  {
    mark: '03',
    title: 'Send it to the developer',
    text: 'Add pictures if they help, then send the ChatGPT brief.',
    image: '/art/living-room.png',
    imagePosition: '60% 70%',
  },
]

export function HomePage() {
  return (
    <div>
      <section className="room-hero">
        <img src="/art/living-room.png" alt="" className="room-hero-photo" />
        <div className="room-hero-copy">
          <p className="app-chip">Airmen Voice</p>
          <h1 className="font-display mt-4 text-[2rem] font-normal leading-[1.15] text-[#3f3b36] sm:text-[2.45rem]">
            Tell us what to change. ChatGPT formats it. We pass that brief to the developer.
          </h1>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-[#8f837a]">
            Copy a ready-made prompt into ChatGPT with your notes, paste the answer back, and send a clear request.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
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

      <hr className="oak-rule" />

      <section className="furnishing-band" aria-label="How it works">
        <p className="section-label">The table is set</p>
        <h2 className="font-display mt-2 text-3xl font-normal text-[#3f3b36]">Three quiet steps</h2>
        <ol className="mt-7 grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <li key={item.mark}>
              <article className="furnish-card ornament-card h-full">
                <img src={item.image} alt="" style={{ objectPosition: item.imagePosition }} />
                <div className="furnish-copy">
                  <p className="font-display text-2xl text-[#dcb482]">{item.mark}</p>
                  <h3 className="font-display mt-2 text-xl font-normal text-[#3f3b36]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#8f837a]">{item.text}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export function HomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <section className="relative lg:col-span-7">
        <img
          src="/patterns/enso.svg"
          alt=""
          aria-hidden
          className="hero-enso -right-4 -top-6 h-48 w-48 sm:h-64 sm:w-64"
        />
        <Card className="relative overflow-hidden border-border/80 bg-surface-elevated/90">
          <div className="absolute inset-y-0 left-0 w-2 wood-panel" aria-hidden />
          <CardHeader className="relative pl-8">
            <p className="section-label">Airmen Voice</p>
            <CardTitle className="text-4xl font-normal leading-[1.15] sm:text-5xl">
              Share what should change. We shape it into clear build instructions.
            </CardTitle>
            <CardDescription className="max-w-xl text-base leading-relaxed">
              Describe updates, attach reference images, and follow your request from submission through review and
              export.
            </CardDescription>
          </CardHeader>
          <div className="relative pl-8">
            <Link to="/submit">
              <Button size="lg" className="group">
                Submit a revision
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <section className="lg:col-span-5">
        <Card className="h-full border-border/80 bg-surface-muted/40">
          <CardHeader>
            <p className="section-label">Flow</p>
            <CardTitle className="text-2xl font-normal">Four quiet steps</CardTitle>
          </CardHeader>
          <ol className="space-y-5">
            {[
              { step: '一', text: 'Confirm Airmen Voice and add your contact details.' },
              { step: '二', text: 'Describe the revision in plain language or use a template.' },
              { step: '三', text: 'Attach screenshots and mark areas that need attention.' },
              { step: '四', text: 'Preview, submit, and track status as the team reviews.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-4 text-sm leading-relaxed text-muted-foreground">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-surface-wood font-accent text-sm text-moss shadow-wood">
                  {item.step}
                </span>
                {item.text}
              </li>
            ))}
          </ol>
        </Card>
      </section>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export function HomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="relative overflow-hidden border-japa-sage/15 bg-surface-elevated lg:col-span-3">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-japa-sage/8" aria-hidden />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-japa-clay/6" aria-hidden />
        <CardHeader className="relative">
          <p className="japandi-kicker">Revision intake</p>
          <CardTitle className="text-4xl font-normal leading-tight sm:text-5xl">
            Calm, clear feedback for every project
          </CardTitle>
          <CardDescription className="max-w-lg text-base">
            Submit revision requests with intention. Attach references, preview structured instructions, and track
            progress as your team transforms notes into agent-ready TOON files.
          </CardDescription>
        </CardHeader>
        <Link to="/submit" className="relative inline-block">
          <Button size="lg" className="group">
            Start a revision
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
          </Button>
        </Link>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <p className="japandi-kicker">Process</p>
          <CardTitle className="text-xl">How it works</CardTitle>
        </CardHeader>
        <ol className="space-y-4">
          {[
            'Select the target application and describe your changes.',
            'Attach reference screenshots with optional annotations.',
            'Preview structured instructions and submit.',
            'Track status as your team reviews and exports TOON.',
          ].map((text, index) => (
            <li key={text} className="flex gap-4 text-sm leading-relaxed text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-surface-muted text-xs font-medium text-japa-charcoal">
                {index + 1}
              </span>
              {text}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}

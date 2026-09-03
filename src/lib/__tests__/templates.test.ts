import { describe, expect, it } from 'vitest'
import { DEFAULT_REVISION_TEMPLATES } from '@/lib/data/localStore'
import { sortTemplates, TEMPLATE_DISPLAY_ORDER } from '@/lib/templates'

describe('revision templates', () => {
  it('includes Features next to Bug Fix Report', () => {
    const names = DEFAULT_REVISION_TEMPLATES.map((template) => template.name)
    expect(names).toContain('Features')
    expect(TEMPLATE_DISPLAY_ORDER.indexOf('Features')).toBe(
      TEMPLATE_DISPLAY_ORDER.indexOf('Bug Fix Report') + 1,
    )
  })

  it('keeps Features beside Bug Fix Report after alphabetical database order', () => {
    const sorted = sortTemplates([
      { id: '3', name: 'Homepage Hero Update', description: '', template_text: '', category: 'ui' },
      { id: '2', name: 'Copy Change', description: '', template_text: '', category: 'content' },
      { id: '4', name: 'Features', description: '', template_text: '', category: 'functionality' },
      { id: '1', name: 'Bug Fix Report', description: '', template_text: '', category: 'functionality' },
    ])
    expect(sorted.map((template) => template.name)).toEqual([
      'Bug Fix Report',
      'Features',
      'Copy Change',
      'Homepage Hero Update',
    ])
  })
})

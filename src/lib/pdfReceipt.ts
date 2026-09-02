import { jsPDF } from 'jspdf'
import type { RevisionRequestWithRelations } from '@/types/database'
import { formatDate } from '@/lib/utils'

export function generatePdfReceipt(revision: RevisionRequestWithRelations): Blob {
  const doc = new jsPDF()
  const lines = doc.splitTextToSize(
    [
      'Request receipt',
      '',
      `ID: ${revision.id}`,
      `Project: ${revision.project?.name ?? revision.project_id}`,
      `Status: ${revision.status.replace(/_/g, ' ')}`,
      `Sent: ${revision.submitted_at ? formatDate(revision.submitted_at) : 'Draft'}`,
      `Brief strength: ${revision.completeness_score ?? 'N/A'}%`,
      '',
      'What you asked for:',
      revision.title,
      '',
      revision.raw_request.slice(0, 2000),
    ].join('\n'),
    180,
  )

  doc.setFontSize(16)
  doc.text('Dev Generator receipt', 14, 20)
  doc.setFontSize(10)
  doc.text(lines, 14, 30)

  return doc.output('blob')
}

export function downloadPdfReceipt(revision: RevisionRequestWithRelations) {
  const blob = generatePdfReceipt(revision)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `revision-receipt-${revision.id.slice(0, 8)}.pdf`
  anchor.click()
  URL.revokeObjectURL(url)
}

const lectureFiles = import.meta.glob('./notes/*.pdf', {
  eager: true,
  import: 'default',
  query: '?url',
})

const courseYear = 2026
const materialLabels = {
  notes: 'Notes',
  slides: 'Slides',
}
const materialOrder = ['slides', 'notes']

const materialsByDate = Object.entries(lectureFiles).reduce((materials, [path, href]) => {
  const filename = path.split('/').at(-1)
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(notes|slides)\.pdf$/i)
  if (!match) {
    throw new Error(
      `Invalid lecture material filename: ${filename}. Use YYYY-MM-DD-notes.pdf or YYYY-MM-DD-slides.pdf.`,
    )
  }

  const [, date, rawType] = match
  const type = rawType.toLowerCase()
  const easternOffset = date < `${courseYear}-11-01` ? '-04:00' : '-05:00'
  const resource = {
    href,
    label: materialLabels[type],
    releaseAt: `${date}T00:00:00${easternOffset}`,
    type,
  }

  materials[date] ||= []
  materials[date].push(resource)
  return materials
}, {})

export function lectureMaterialsForDate(monthDay) {
  const [month, day] = monthDay.split('/').map(Number)
  const date = [courseYear, month, day]
    .map((part, index) => (index === 0 ? part : String(part).padStart(2, '0')))
    .join('-')

  return [...(materialsByDate[date] || [])].sort(
    (first, second) => materialOrder.indexOf(first.type) - materialOrder.indexOf(second.type),
  )
}

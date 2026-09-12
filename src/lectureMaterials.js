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

// To move a PDF between table columns, change its value to 'notes' or 'resources'.
// Files not listed here use their filename type: notes -> Notes, slides -> Resources.
const fileColumns = {
  '2026-09-09-notes.pdf': 'notes',
  '2026-09-09-slides.pdf': 'resources',
  '2026-09-11-notes.pdf': 'notes',
}

const readingsByDate = {
  '9/9': 'Chapter 1, R&N',
  '9/11': 'Chapter 2, R&N',
  '9/14': 'Chapter 3, R&N',
  '9/16': 'Chapter 3, R&N',
  '9/18': 'Chapter 3, R&N',
}

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
  const column = fileColumns[filename] || (type === 'notes' ? 'notes' : 'resources')
  const easternOffset = date < `${courseYear}-11-01` ? '-04:00' : '-05:00'
  const resource = {
    href,
    label: materialLabels[type],
    releaseAt: `${date}T00:00:00${easternOffset}`,
    column,
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

  const materials = materialsByDate[date] || []
  const reading = readingsByDate[monthDay]
  return {
    notes: materials.filter((resource) => resource.column === 'notes'),
    resources: [
      ...materials.filter((resource) => resource.column === 'resources'),
      ...(reading ? [{ label: reading }] : []),
    ],
  }
}

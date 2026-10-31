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
const romanPartLabels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const temporaryNotesStart = '2026-09-30'
const temporaryNotesEnd = '2026-10-16'

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
  '9/18': 'Chapter 6, R&N',
  '9/21': 'Chapter 4, R&N',
  '9/23': 'Section 7.4, R&N',
  '9/25': 'Section 7.6, R&N',
  '9/28': 'Section 6.1, R&N',
}

const materialsByDate = Object.entries(lectureFiles).reduce((materials, [path, href]) => {
  const filename = path.split('/').at(-1)
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(notes|slides)(?:-([2-9]\d*))?\.pdf$/i)
  if (!match) {
    throw new Error(
      `Invalid lecture material filename: ${filename}. Use YYYY-MM-DD-notes.pdf, YYYY-MM-DD-notes-2.pdf, or the equivalent slides format.`,
    )
  }

  const [, date, rawType, rawNumber] = match
  const type = rawType.toLowerCase()
  const number = rawNumber ? Number(rawNumber) : 1
  const numberedLabel = number === 1 ? materialLabels[type] : `${materialLabels[type]} ${number}`
  const isTemporaryNotes = type === 'notes' && date >= temporaryNotesStart && date <= temporaryNotesEnd
  const column = fileColumns[filename] || (type === 'notes' ? 'notes' : 'resources')
  const easternOffset = date < `${courseYear}-11-01` ? '-04:00' : '-05:00'
  const resource = {
    href,
    label: isTemporaryNotes
      ? `${numberedLabel} (Fall '25)`
      : numberedLabel,
    releaseAt: `${date}T00:00:00${easternOffset}`,
    column,
    number,
    type,
    isTemporaryNotes,
  }

  materials[date] ||= []
  materials[date].push(resource)
  materials[date].sort((first, second) => first.number - second.number)
  return materials
}, {})

Object.values(materialsByDate).forEach((resources) => {
  const countsByType = resources.reduce((counts, resource) => {
    counts[resource.type] = (counts[resource.type] || 0) + 1
    return counts
  }, {})

  resources.forEach((resource) => {
    if (countsByType[resource.type] < 2) return

    const part = romanPartLabels[resource.number - 1] || resource.number
    const partLabel = `${materialLabels[resource.type]} Part ${part}`
    resource.label = resource.isTemporaryNotes ? `${partLabel} (Fall '25)` : partLabel
  })
})

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

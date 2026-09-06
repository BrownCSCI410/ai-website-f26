import { sections } from './content'

const destinationCoordinates = [
  { tile: 0, row: 0 },
  { tile: -1, row: 1 },
  { tile: 2, row: 2 },
  { tile: 0, row: 3 },
  { tile: -1, row: 4 },
  { tile: 1, row: 5 },
  { tile: 0, row: 6 },
]

export const navigationItems = sections.map((section, index) => ({
  label: section.label,
  index,
}))

export const sectionDestinations = sections.map((section, index) => ({
  ...destinationCoordinates[index],
  id: section.id,
  label: section.label,
  sectionIndex: index,
}))

export const blockedTiles = new Set([
  '-3,0', '3,0',
  '-3,1', '-2,1', '2,1', '3,1',
  '-2,2', '3,2',
  '-2,3', '2,3', '3,3',
  '-3,4', '2,4',
  '-2,5', '3,5',
  '-3,6', '2,6',
])

import { useEffect, useState } from 'react'
import './CourseTable.css'

export function CourseTable({ table }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!table.releaseDates) return undefined

    const nextRelease = table.releaseDates
      .map((date) => Date.parse(date))
      .find((releaseTime) => releaseTime > now)
    if (!nextRelease) return undefined

    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(nextRelease - now + 100, 60 * 60 * 1000),
    )
    return () => window.clearTimeout(timer)
  }, [now, table.releaseDates])

  return (
    <>
      <p className="course-table-caption">{table.caption}</p>
      <div className="course-table-region">
        <table className={`course-table ${table.variant ? `course-table--${table.variant}` : ''}`}>
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th key={column} scope="col">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => {
              const [name, ...cells] = row
              const href = table.links?.[name]
              const releaseDate = table.releaseDates?.[rowIndex]
              const isReleased = !releaseDate || now >= Date.parse(releaseDate)
              return (
                <tr key={name}>
                  <th scope="row">
                    {isReleased
                      ? (href ? <a href={href}>{name}</a> : name)
                      : '-'}
                  </th>
                  {cells.map((cell, index) => (
                    <td key={`${name}-${index}`}>
                      {isReleased || table.releaseVisibleColumns?.includes(index)
                        ? table.linkColumns?.includes(index) && !['-', '—'].includes(cell)
                          ? cell.split(' · ').map((linkLabel) => (
                          <a
                            key={linkLabel}
                            href="#"
                            onClick={(event) => event.preventDefault()}
                            title="Course link coming soon"
                          >
                            {linkLabel}
                          </a>
                          ))
                          : cell
                        : '-'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

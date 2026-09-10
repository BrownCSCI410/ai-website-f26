import { useEffect, useState } from 'react'
import './CourseTable.css'

function ResourceLinks({ resources }) {
  const [now, setNow] = useState(() => Date.now())
  const visibleResources = resources.filter((resource) => (
    !resource.releaseAt || now >= Date.parse(resource.releaseAt)
  ))

  useEffect(() => {
    const nextRelease = resources
      .map((resource) => Date.parse(resource.releaseAt))
      .filter((releaseTime) => Number.isFinite(releaseTime) && releaseTime > now)
      .sort((first, second) => first - second)[0]
    if (!nextRelease) return undefined

    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(nextRelease - now + 100, 60 * 60 * 1000),
    )
    return () => window.clearTimeout(timer)
  }, [now, resources])

  if (visibleResources.length === 0) return '-'
  return visibleResources.map((resource) => (
    <a
      key={`${resource.label}-${resource.href}`}
      href={resource.href}
      target="_blank"
      rel="noreferrer"
    >
      {resource.label}
    </a>
  ))
}

function renderCell(cell, table, columnIndex) {
  if (Array.isArray(cell)) {
    return <ResourceLinks resources={cell} />
  }

  if (table.linkColumns?.includes(columnIndex) && !['-', '—'].includes(cell)) {
    return cell.split(' · ').map((linkLabel) => (
      <a
        key={linkLabel}
        href="#"
        onClick={(event) => event.preventDefault()}
        title="Course link coming soon"
      >
        {linkLabel}
      </a>
    ))
  }

  return cell
}

export function CourseTable({ table }) {
  return (
    <>
      {table.caption && <p className="course-table-caption">{table.caption}</p>}
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
              return (
                <tr key={`${name}-${rowIndex}`}>
                  <th scope="row">
                    {href ? <a href={href}>{name}</a> : name}
                  </th>
                  {cells.map((cell, index) => (
                    <td key={`${name}-${index}`}>
                      {renderCell(cell, table, index)}
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

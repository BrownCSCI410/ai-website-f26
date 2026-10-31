import { useEffect, useState } from 'react'
import { Fragment } from 'react'
import './CourseTable.css'

function ResourceLinks({ resources, stacked = false }) {
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
  return (
    <span className={stacked ? 'course-resource-links course-resource-links--stacked' : 'course-resource-links'}>
      {visibleResources.map((resource, index) => (
        <Fragment key={`${resource.label}-${resource.href || index}`}>
          <span className="course-resource-link-item">
            {resource.href ? (
              <a
                href={resource.href}
                target="_blank"
                rel="noreferrer"
              >
                {resource.label}
              </a>
            ) : (
              <span>{resource.label}</span>
            )}
          </span>
          {!stacked && index < visibleResources.length - 1 ? '; ' : ''}
        </Fragment>
      ))}
    </span>
  )
}

function renderCell(cell, table, columnIndex) {
  if (Array.isArray(cell)) {
    const stackLinks = table.variant === 'lectures' && columnIndex === 1
    return <ResourceLinks resources={cell} stacked={stackLinks} />
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

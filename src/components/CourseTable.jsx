import './CourseTable.css'

export function CourseTable({ table }) {
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
            {table.rows.map((row) => {
              const [name, ...cells] = row
              const href = table.links?.[name]
              return (
                <tr key={name}>
                  <th scope="row">
                    {href ? <a href={href}>{name}</a> : name}
                  </th>
                  {cells.map((cell, index) => (
                    <td key={`${name}-${index}`}>
                      {table.linkColumns?.includes(index) && !['-', '—'].includes(cell)
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
                        : cell}
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

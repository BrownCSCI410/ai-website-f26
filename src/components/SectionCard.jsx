import chicken from '../assets/chicken.png'
import { CourseTable } from './CourseTable'
import { StaffCarousel } from './StaffCarousel'
import './SectionCard.css'

export function SectionCard({ section }) {
  return (
    <article
      className={`content-card ${section.table ? 'content-card--table' : ''} ${section.members ? 'content-card--staff' : ''}`}
      style={{ '--accent': section.accent }}
    >
      {section.table ? (
        <>
          <h1 id={`section-title-${section.id}`}>{section.title}</h1>
          <CourseTable table={section.table} />
        </>
      ) : section.members ? (
        <>
          <h1 id={`section-title-${section.id}`}>{section.title}</h1>
          <StaffCarousel members={section.members} />
        </>
      ) : (
        <div className={section.id === 'about' ? 'about-layout' : undefined}>
          <div className={section.id === 'about' ? 'about-copy' : undefined}>
            <h1 id={`section-title-${section.id}`}>{section.title}</h1>
            <p className="section-copy">{section.body}</p>
            {section.links && (
              <nav className="resource-links" aria-label="Course resources">
                {section.links.map((link) => (
                  <a
                    className="resource-link"
                    href={link.href}
                    key={link.label}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
            {section.embedUrl && (
              <div className="calendar-embed">
                <iframe
                  src={section.embedUrl}
                  title="Course Google Calendar"
                  loading="lazy"
                />
              </div>
            )}
          </div>
          {section.id === 'about' && (
            <img className="about-chicken" src={chicken} alt="Crossy Road chicken" />
          )}
        </div>
      )}
    </article>
  )
}

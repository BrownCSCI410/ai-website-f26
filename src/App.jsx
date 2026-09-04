import { useCallback, useEffect, useRef, useState } from 'react'
import { GameScene } from './GameScene'
import { sections } from './content'
import logo from './assets/logo.png'
import foundationsHero from './assets/foundations_hero.png'
import chicken from './assets/chicken.png'
import playButton from './assets/play_button.png'
import wKey from './assets/w.png'
import aKey from './assets/a.png'
import sKey from './assets/s.png'
import dKey from './assets/d.png'
import enterKey from './assets/enter.png'
import './App.css'

const navigationItems = [
  { label: 'About', index: 0 },
  { label: 'Homework', index: 1 },
  { label: 'Lectures', index: 2 },
  { label: 'Calendar', index: 3 },
  { label: 'Discussion', index: 4 },
  { label: 'Staff', index: 5 },
  { label: 'Resources', index: 6 },
]

const destinationCoordinates = [
  { tile: 0, row: 0 },
  { tile: -1, row: 1 },
  { tile: 2, row: 2 },
  { tile: 0, row: 3 },
  { tile: -1, row: 4 },
  { tile: 1, row: 5 },
  { tile: 0, row: 6 },
]

const sectionDestinations = sections.map((section, index) => ({
  ...destinationCoordinates[index],
  id: section.id,
  label: section.label,
  sectionIndex: index,
}))

const blockedTiles = new Set([
  '-3,0', '3,0',
  '-3,1', '-2,1', '2,1', '3,1',
  '-2,2', '3,2',
  '-2,3', '2,3', '3,3',
  '-3,4', '2,4',
  '-2,5', '3,5',
  '-3,6', '2,6',
])

function tileKey(tile, row) {
  return `${tile},${row}`
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function CourseTable({ table }) {
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
                    <a
                      href={href || '#'}
                      onClick={href ? undefined : (event) => event.preventDefault()}
                      title={href ? undefined : 'Link coming soon'}
                    >
                      {name}
                    </a>
                  </th>
                  {cells.map((cell, index) => (
                    <td key={`${name}-${index}`}>
                      {table.linkColumns?.includes(index) && cell !== '—'
                        ? cell.split(' · ').map((linkLabel) => (
                          <a key={linkLabel} href="#" onClick={(event) => event.preventDefault()} title="Course link coming soon">
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

function VoxelAvatar({ member }) {
  return (
    <div
      className="voxel-person"
      style={{
        '--avatar-shirt': member.shirt,
        '--avatar-detail': member.detail,
        '--avatar-skin': member.skin,
        '--avatar-hair': member.hair,
      }}
      aria-hidden="true"
    >
      <span className="voxel-hair" />
      <span className="voxel-head">
        <span className="voxel-eye voxel-eye--left" />
        <span className="voxel-eye voxel-eye--right" />
      </span>
      <span className="voxel-neck" />
      <span className="voxel-body"><span className="voxel-shirt-detail" /></span>
      <span className="voxel-arm voxel-arm--left" />
      <span className="voxel-arm voxel-arm--right" />
      <span className="voxel-leg voxel-leg--left" />
      <span className="voxel-leg voxel-leg--right" />
    </div>
  )
}

function StaffPhoto({ member }) {
  const initials = member.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="staff-photo-frame" key={member.id}>
      <span className="staff-photo-fallback" aria-hidden="true">{initials}</span>
      <img
        className="staff-photo"
        src={member.image}
        alt={`${member.name}, ${member.role}`}
        onError={(event) => {
          event.currentTarget.hidden = true
        }}
      />
    </div>
  )
}

function StaffCarousel({ members }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeMember = members[activeIndex]
  const offsets = [-2, -1, 0, 1, 2]

  const selectMember = (index) => {
    setActiveIndex((index + members.length) % members.length)
  }

  const changeMember = (direction) => {
    selectMember(activeIndex + direction)
  }

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    event.stopPropagation()
    changeMember(event.key === 'ArrowLeft' ? -1 : 1)
  }

  return (
    <div className="staff-carousel" onKeyDown={handleKeyDown}>
      <div className="staff-stage">
        <button
          className="staff-arrow"
          type="button"
          onClick={() => changeMember(-1)}
          aria-label="Previous staff member"
        >
          <img src={playButton} alt="" aria-hidden="true" />
        </button>

        <div className="staff-lineup" aria-live="polite">
          {offsets.map((offset) => {
            const memberIndex = (activeIndex + offset + members.length) % members.length
            const member = members[memberIndex]
            return (
              <button
                className={`staff-character staff-character--${offset === 0 ? 'active' : `offset-${Math.abs(offset)}`}`}
                type="button"
                key={`${member.id}-${offset}`}
                onClick={() => selectMember(memberIndex)}
                aria-label={`${member.name}, ${member.role}`}
                aria-current={offset === 0 ? 'true' : undefined}
              >
                <VoxelAvatar member={member} />
              </button>
            )
          })}
        </div>

        <button
          className="staff-arrow"
          type="button"
          onClick={() => changeMember(1)}
          aria-label="Next staff member"
        >
          <img src={playButton} alt="" aria-hidden="true" />
        </button>
      </div>

      <div className="staff-profile">
        <StaffPhoto member={activeMember} />
        <div className="staff-identity">
          <p className="staff-role">{activeMember.role}</p>
          <h2>{activeMember.name}</h2>
          <p className="staff-bio">{activeMember.bio}</p>
        </div>
      </div>

      <div className="staff-dots" aria-label="Choose a staff member">
        {members.map((member, index) => (
          <button
            type="button"
            key={member.id}
            className={index === activeIndex ? 'is-active' : ''}
            onClick={() => selectMember(index)}
            aria-label={`Show ${member.name}, ${member.role}`}
            aria-current={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  )
}

function SectionCard({ section }) {
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
          </div>
          {section.id === 'about' && (
            <img className="about-chicken" src={chicken} alt="Crossy Road chicken" />
          )}
        </div>
      )}
    </article>
  )
}

function App() {
  const [chickenPosition, setChickenPosition] = useState({ row: 0, tile: 0 })
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [activatingSectionIndex, setActivatingSectionIndex] = useState(null)
  const [activationKey, setActivationKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const positionRef = useRef(chickenPosition)
  const contentPanel = useRef(null)
  const contentSections = useRef([])
  const gameSection = useRef(null)
  const gameIsActive = useRef(false)
  const contentScrollFrame = useRef(null)
  const activationTimer = useRef(null)
  const activationInProgress = useRef(false)
  const section = sections[activeSectionIndex]
  const nearbyDestination = sectionDestinations
    .map((destination) => ({
      ...destination,
      distance: Math.abs(destination.tile - chickenPosition.tile)
        + Math.abs(destination.row - chickenPosition.row),
    }))
    .filter((destination) => destination.distance === 0)
    .sort((first, second) => first.distance - second.distance)[0] || null

  const scrollToSection = useCallback((index) => {
    const panel = contentPanel.current
    const target = contentSections.current[index]
    if (!panel || !target) return
    panel.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
  }, [])

  const scrollToStart = useCallback(() => {
    contentPanel.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const updateChickenPosition = useCallback((next) => {
    positionRef.current = next
    setChickenPosition(next)
  }, [])

  const goToSection = useCallback((index) => {
    const sectionIndex = clamp(index, 0, sections.length - 1)
    const destination = sectionDestinations[sectionIndex]
    if (activationTimer.current) clearTimeout(activationTimer.current)
    activationInProgress.current = false
    setActivatingSectionIndex(null)
    updateChickenPosition({ row: destination.row, tile: destination.tile })
    setActiveSectionIndex(sectionIndex)
    scrollToSection(sectionIndex)
  }, [scrollToSection, updateChickenPosition])

  const move = useCallback((direction) => {
    const current = positionRef.current
    const deltas = {
      up: { row: 1, tile: 0 },
      down: { row: -1, tile: 0 },
      left: { row: 0, tile: -1 },
      right: { row: 0, tile: 1 },
    }
    const delta = deltas[direction]
    if (!delta) return

    const next = {
      row: current.row + delta.row,
      tile: current.tile + delta.tile,
    }
    const isOutOfBounds = next.row < 0 || next.row > 6 || next.tile < -3 || next.tile > 3
    if (isOutOfBounds || blockedTiles.has(tileKey(next.tile, next.row))) return
    updateChickenPosition(next)
  }, [updateChickenPosition])

  const activateDestination = useCallback(() => {
    if (activationInProgress.current) return
    const current = positionRef.current
    const destination = sectionDestinations.find((item) => (
      item.row === current.row && item.tile === current.tile
    ))
    if (!destination) return

    activationInProgress.current = true
    setActivatingSectionIndex(destination.sectionIndex)
    setActivationKey((currentKey) => currentKey + 1)
    activationTimer.current = setTimeout(() => {
      setActiveSectionIndex(destination.sectionIndex)
      scrollToSection(destination.sectionIndex)
      setActivatingSectionIndex(null)
      activationInProgress.current = false
      activationTimer.current = null
    }, 450)
  }, [scrollToSection])

  const handleContentScroll = useCallback(() => {
    if (contentScrollFrame.current) cancelAnimationFrame(contentScrollFrame.current)
    contentScrollFrame.current = requestAnimationFrame(() => {
      const panel = contentPanel.current
      if (!panel) return

      const game = gameSection.current
      if (game) {
        const visibleTop = Math.max(panel.scrollTop, game.offsetTop)
        const visibleBottom = Math.min(
          panel.scrollTop + panel.clientHeight,
          game.offsetTop + game.offsetHeight,
        )
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        gameIsActive.current = visibleHeight / Math.min(game.offsetHeight, panel.clientHeight) >= 0.45
      }

      const focusPoint = panel.scrollTop + panel.clientHeight * 0.46
      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      contentSections.current.forEach((element, index) => {
        if (!element) return
        const sectionCenter = element.offsetTop + element.offsetHeight / 2
        const distance = Math.abs(sectionCenter - focusPoint)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setActiveSectionIndex((currentIndex) => (
        currentIndex === closestIndex ? currentIndex : closestIndex
      ))
    })
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsLoaded(true)
      handleContentScroll()
    })
    return () => cancelAnimationFrame(frame)
  }, [handleContentScroll])

  useEffect(() => () => {
    if (contentScrollFrame.current) cancelAnimationFrame(contentScrollFrame.current)
    if (activationTimer.current) clearTimeout(activationTimer.current)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.closest('button, a, input, textarea, select')) return
      if (!gameIsActive.current || event.repeat) return
      const directions = {
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      }
      const direction = directions[event.key.toLowerCase()]
      if (direction) {
        event.preventDefault()
        move(direction)
        return
      }
      if (event.key !== 'Enter') return
      event.preventDefault()
      activateDestination()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activateDestination, move])

  return (
    <div className={`experience ${isLoaded ? 'is-loaded' : ''}`} style={{ '--accent': section.accent }}>
      <div className="site-clouds" aria-hidden="true">
        <span className="hero-cloud hero-cloud--one" />
        <span className="hero-cloud hero-cloud--two" />
        <span className="hero-cloud hero-cloud--three" />
        <span className="hero-cloud hero-cloud--four" />
      </div>

      <header className="site-header">
        <button
          className="brand"
          type="button"
          onClick={scrollToStart}
          aria-label="CSCI 0410 and 1411, go to course landing"
        >
          <img className="brand-logo" src={logo} alt="CSCI 0410 and 1411" />
        </button>
        <nav className="top-nav" aria-label="Course sections">
          {navigationItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={activeSectionIndex === item.index ? 'is-active' : ''}
              onClick={() => goToSection(item.index)}
              aria-current={activeSectionIndex === item.index ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main ref={contentPanel} className="content-shell" onScroll={handleContentScroll}>
        <section className="hero-section" aria-labelledby="hero-title">
          <img
            className="landing-title-image"
            id="hero-title"
            src={foundationsHero}
            alt="Foundations of AI and ML"
          />
        </section>

        <section
          className="game-section"
          ref={gameSection}
          aria-label="Crossy Road course map. Use W A S D to move and Enter to open a section coin."
        >
          <div className="game-stage" aria-hidden="true">
            <GameScene
              position={chickenPosition}
              destinations={sectionDestinations}
              activatingSectionIndex={activatingSectionIndex}
              activationKey={activationKey}
            />
          </div>
          <aside className="game-guide" aria-label="Game controls">
            <div className="game-guide-movement">
              <div className="wasd-keys" aria-label="Use W A S D to move">
                <img className="key key--w" src={wKey} alt="W" />
                <img className="key key--a" src={aKey} alt="A" />
                <img className="key key--s" src={sKey} alt="S" />
                <img className="key key--d" src={dKey} alt="D" />
              </div>
              <span className="game-guide-action">Move</span>
            </div>
            <div className="game-guide-enter">
              <img className="enter-key" src={enterKey} alt="Enter" />
              <span className="game-guide-action">Open section</span>
            </div>
            <p className="game-guide-shortcut">In a hurry? Use the navigation bar above.</p>
          </aside>
          <p className="sr-only" aria-live="polite">
            {nearbyDestination
              ? `${nearbyDestination.label} coin selected. Press Enter to open it.`
              : 'Use W A S D to move toward a section coin.'}
          </p>
        </section>

        {sections.map((item, index) => (
          <section
            className={`content-section content-section--${item.id}`}
            id={item.id}
            key={item.id}
            ref={(element) => { contentSections.current[index] = element }}
            aria-labelledby={`section-title-${item.id}`}
          >
            <SectionCard section={item} />
          </section>
        ))}
      </main>

      <p className="sr-only" aria-live="polite">
        Current content section: {section.label}
      </p>
    </div>
  )
}

export default App

import { useCallback, useEffect, useRef, useState } from 'react'
import { GameScene } from './GameScene'
import { sections } from './content'
import './App.css'

const MIN_TILE = -3
const MAX_TILE = 3

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function ArrowIcon({ direction }) {
  const rotations = { up: 0, right: 90, down: 180, left: -90 }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotations[direction]}deg)` }}>
      <path d="M12 19V5m0 0L6.5 10.5M12 5l5.5 5.5" />
    </svg>
  )
}

function App() {
  const [position, setPosition] = useState({ row: 0, tile: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const wheelLock = useRef(false)
  const wheelAmount = useRef(0)
  const touchStart = useRef(null)
  const section = sections[position.row]

  const move = useCallback((direction) => {
    setPosition((current) => {
      if (direction === 'up') {
        return { ...current, row: clamp(current.row + 1, 0, sections.length - 1) }
      }
      if (direction === 'down') {
        return { ...current, row: clamp(current.row - 1, 0, sections.length - 1) }
      }
      if (direction === 'left') {
        return { ...current, tile: clamp(current.tile - 1, MIN_TILE, MAX_TILE) }
      }
      if (direction === 'right') {
        return { ...current, tile: clamp(current.tile + 1, MIN_TILE, MAX_TILE) }
      }
      return current
    })
  }, [])

  const goToSection = useCallback((index) => {
    setPosition((current) => ({ row: index, tile: current.tile }))
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsLoaded(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.closest('button, a, input, textarea, select')) return
      const directions = {
        ArrowUp: 'up',
        w: 'up',
        W: 'up',
        ArrowDown: 'down',
        s: 'down',
        S: 'down',
        ArrowLeft: 'left',
        a: 'left',
        A: 'left',
        ArrowRight: 'right',
        d: 'right',
        D: 'right',
      }
      const direction = directions[event.key]
      if (!direction || event.repeat) return
      event.preventDefault()
      move(direction)
    }

    const handleWheel = (event) => {
      event.preventDefault()
      wheelAmount.current += event.deltaY
      if (wheelLock.current || Math.abs(wheelAmount.current) < 24) return

      move(wheelAmount.current > 0 ? 'up' : 'down')
      wheelAmount.current = 0
      wheelLock.current = true
      window.setTimeout(() => {
        wheelLock.current = false
      }, 560)
    }

    const handleTouchStart = (event) => {
      const touch = event.changedTouches[0]
      touchStart.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (event) => {
      if (!touchStart.current) return
      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      touchStart.current = null
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 42) return
      if (Math.abs(deltaY) > Math.abs(deltaX)) move(deltaY < 0 ? 'up' : 'down')
      else move(deltaX < 0 ? 'left' : 'right')
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [move])

  const handleAction = () => {
    if (position.row === sections.length - 1) goToSection(0)
    else move('up')
  }

  return (
    <div className={`experience ${isLoaded ? 'is-loaded' : ''}`} style={{ '--accent': section.accent }}>
      <div className="scene" aria-hidden="true">
        <GameScene position={position} />
      </div>

      <header className="site-header">
        <button className="brand" type="button" onClick={() => goToSection(0)} aria-label="Crossing, back to start">
          <span className="brand-mark">C</span>
          <span>CROSSING®</span>
        </button>
        <div className="header-note">PLAYABLE PORTFOLIO / 2026</div>
        <div className="header-stage">
          LANE {String(position.row + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
        </div>
      </header>

      <main className="content-shell">
        <section className="content-card" key={section.id} aria-labelledby="section-title" aria-live="polite">
          <div className="section-heading">
            <span className="section-number">{section.number}</span>
            <p>{section.eyebrow}</p>
          </div>
          <h1 id="section-title">{section.title}</h1>
          <p className="section-copy">{section.body}</p>
          <ul className="section-meta" aria-label={`${section.label} details`}>
            {section.meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button className="primary-action" type="button" onClick={handleAction}>
            <span>{section.action}</span>
            <ArrowIcon direction="up" />
          </button>
        </section>
      </main>

      <nav className="section-nav" aria-label="Website sections">
        {sections.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={index === position.row ? 'is-active' : ''}
            onClick={() => goToSection(index)}
            aria-current={index === position.row ? 'page' : undefined}
          >
            <span>{item.number}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </nav>

      <div className="play-hud">
        <div className="control-copy">
          <span className="live-dot" />
          <span><strong>Scroll</strong> or use arrow keys to hop</span>
        </div>
        <div className="d-pad" aria-label="Game movement controls">
          <button type="button" className="up" onClick={() => move('up')} aria-label="Hop forward">
            <ArrowIcon direction="up" />
          </button>
          <button type="button" className="left" onClick={() => move('left')} aria-label="Move left">
            <ArrowIcon direction="left" />
          </button>
          <button type="button" className="down" onClick={() => move('down')} aria-label="Hop backward">
            <ArrowIcon direction="down" />
          </button>
          <button type="button" className="right" onClick={() => move('right')} aria-label="Move right">
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${(position.row + 1) / sections.length})` }} />
      </div>
      <p className="sr-only" aria-live="polite">
        Now on section {position.row + 1}: {section.label}
      </p>
    </div>
  )
}

export default App

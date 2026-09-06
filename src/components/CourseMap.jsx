import { GameScene } from '../GameScene'
import wKey from '../assets/w.png'
import aKey from '../assets/a.png'
import sKey from '../assets/s.png'
import dKey from '../assets/d.png'
import enterKey from '../assets/enter.png'
import './CourseMap.css'

export function CourseMap({
  activationKey,
  activatingSectionIndex,
  destinations,
  nearbyDestination,
  position,
  sectionRef,
}) {
  return (
    <section
      className="game-section"
      ref={sectionRef}
      aria-label="Crossy Road course map. Use W A S D to move and Enter to open a section coin."
    >
      <div className="game-stage" aria-hidden="true">
        <GameScene
          position={position}
          destinations={destinations}
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
        <p className="game-guide-shortcut">Use links above for faster navigation</p>
      </aside>
      <p className="sr-only" aria-live="polite">
        {nearbyDestination
          ? `${nearbyDestination.label} coin selected. Press Enter to open it.`
          : 'Use W A S D to move toward a section coin.'}
      </p>
    </section>
  )
}

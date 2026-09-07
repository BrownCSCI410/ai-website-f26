import { useState } from 'react'
import playButton from '../assets/play_button.png'
import './StaffCarousel.css'

function StaffPhoto({ member }) {
  return (
    <div className="staff-photo-frame" key={member.id}>
      {member.image && (
        <img
          className={`staff-photo ${member.id === 'professor' ? 'staff-photo--chicken' : ''}`}
          src={member.image}
          alt={`${member.name}, ${member.role}`}
          onError={(event) => {
            event.currentTarget.hidden = true
          }}
        />
      )}
    </div>
  )
}

export function StaffCarousel({ members }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeMember = members[activeIndex]

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

        <div className="staff-profile" aria-live="polite" aria-atomic="true">
          <StaffPhoto member={activeMember} />
          <div className="staff-identity">
            <p className="staff-role">{activeMember.role}</p>
            <h2>{activeMember.name}</h2>
            <p className="staff-bio">{activeMember.bio}</p>
            <p className="staff-hometown">
              <span>Hometown:</span> {activeMember.hometown || '—'}
            </p>
          </div>
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

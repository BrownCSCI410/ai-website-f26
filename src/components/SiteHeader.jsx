import logo from '../assets/logo.png'
import './SiteHeader.css'

export function SiteHeader({ activeIndex, items, onHome, onNavigate }) {
  return (
    <header className="site-header">
      <button
        className="brand"
        type="button"
        onClick={onHome}
        aria-label="CSCI 0410 and 1411, go to course landing"
      >
        <img className="brand-logo" src={logo} alt="CSCI 0410 and 1411" />
      </button>
      <nav className="top-nav" aria-label="Course sections">
        {items.map((item) => (
          <button
            type="button"
            key={item.label}
            className={activeIndex === item.index ? 'is-active' : ''}
            onClick={() => onNavigate(item.index)}
            aria-current={activeIndex === item.index ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

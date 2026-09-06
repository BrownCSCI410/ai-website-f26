import foundationsHero from '../assets/foundations_hero.png'
import './HeroSection.css'

export function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <img
        className="landing-title-image"
        id="hero-title"
        src={foundationsHero}
        alt="Foundations of AI and ML"
      />
    </section>
  )
}

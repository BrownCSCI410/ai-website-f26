import { CourseMap } from './components/CourseMap'
import { HeroSection } from './components/HeroSection'
import { SectionCard } from './components/SectionCard'
import { SiteHeader } from './components/SiteHeader'
import { navigationItems, sectionDestinations } from './courseMapConfig'
import { sections } from './content'
import { useCourseExperience } from './hooks/useCourseExperience'
import './App.css'

function App() {
  const {
    activationKey,
    activeSection,
    activeSectionIndex,
    activatingSectionIndex,
    chickenPosition,
    contentPanelRef,
    gameSectionRef,
    goToSection,
    handleContentScroll,
    isLoaded,
    nearbyDestination,
    registerContentSection,
    scrollToStart,
  } = useCourseExperience(sections)

  return (
    <div
      className={`experience ${isLoaded ? 'is-loaded' : ''}`}
      style={{ '--accent': activeSection.accent }}
    >
      <div className="site-clouds" aria-hidden="true">
        <span className="hero-cloud hero-cloud--one" />
        <span className="hero-cloud hero-cloud--two" />
        <span className="hero-cloud hero-cloud--three" />
        <span className="hero-cloud hero-cloud--four" />
      </div>

      <SiteHeader
        activeIndex={activeSectionIndex}
        items={navigationItems}
        onHome={scrollToStart}
        onNavigate={goToSection}
      />

      <main
        ref={contentPanelRef}
        className="content-shell"
        onScroll={handleContentScroll}
      >
        <HeroSection />
        <CourseMap
          activationKey={activationKey}
          activatingSectionIndex={activatingSectionIndex}
          destinations={sectionDestinations}
          nearbyDestination={nearbyDestination}
          position={chickenPosition}
          sectionRef={gameSectionRef}
        />

        {sections.map((section, index) => (
          <section
            className={`content-section content-section--${section.id}`}
            id={section.id}
            key={section.id}
            ref={(element) => registerContentSection(index, element)}
            aria-labelledby={`section-title-${section.id}`}
          >
            <SectionCard section={section} />
          </section>
        ))}
      </main>

      <p className="sr-only" aria-live="polite">
        Current content section: {activeSection.label}
      </p>
    </div>
  )
}

export default App

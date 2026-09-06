import { useCallback, useEffect, useRef, useState } from 'react'
import { blockedTiles, sectionDestinations } from '../courseMapConfig'

function tileKey(tile, row) {
  return `${tile},${row}`
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function useCourseExperience(sections) {
  const [chickenPosition, setChickenPosition] = useState({ row: 0, tile: 0 })
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [activatingSectionIndex, setActivatingSectionIndex] = useState(null)
  const [activationKey, setActivationKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const positionRef = useRef(chickenPosition)
  const contentPanelRef = useRef(null)
  const contentSectionsRef = useRef([])
  const gameSectionRef = useRef(null)
  const gameIsActiveRef = useRef(false)
  const contentScrollFrameRef = useRef(null)
  const activationTimerRef = useRef(null)
  const activationInProgressRef = useRef(false)

  const activeSection = sections[activeSectionIndex]
  const nearbyDestination = sectionDestinations.find((destination) => (
    destination.tile === chickenPosition.tile
    && destination.row === chickenPosition.row
  )) || null

  const scrollToSection = useCallback((index) => {
    const panel = contentPanelRef.current
    const target = contentSectionsRef.current[index]
    if (!panel || !target) return
    panel.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
  }, [])

  const scrollToStart = useCallback(() => {
    contentPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const registerContentSection = useCallback((index, element) => {
    contentSectionsRef.current[index] = element
  }, [])

  const updateChickenPosition = useCallback((next) => {
    positionRef.current = next
    setChickenPosition(next)
  }, [])

  const goToSection = useCallback((index) => {
    const sectionIndex = clamp(index, 0, sections.length - 1)
    const destination = sectionDestinations[sectionIndex]
    if (activationTimerRef.current) clearTimeout(activationTimerRef.current)
    activationInProgressRef.current = false
    setActivatingSectionIndex(null)
    updateChickenPosition({ row: destination.row, tile: destination.tile })
    setActiveSectionIndex(sectionIndex)
    scrollToSection(sectionIndex)
  }, [scrollToSection, sections.length, updateChickenPosition])

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
    if (activationInProgressRef.current) return
    const current = positionRef.current
    const destination = sectionDestinations.find((item) => (
      item.row === current.row && item.tile === current.tile
    ))
    if (!destination) return

    activationInProgressRef.current = true
    setActivatingSectionIndex(destination.sectionIndex)
    setActivationKey((currentKey) => currentKey + 1)
    activationTimerRef.current = setTimeout(() => {
      setActiveSectionIndex(destination.sectionIndex)
      scrollToSection(destination.sectionIndex)
      setActivatingSectionIndex(null)
      activationInProgressRef.current = false
      activationTimerRef.current = null
    }, 450)
  }, [scrollToSection])

  const handleContentScroll = useCallback(() => {
    if (contentScrollFrameRef.current) cancelAnimationFrame(contentScrollFrameRef.current)
    contentScrollFrameRef.current = requestAnimationFrame(() => {
      const panel = contentPanelRef.current
      if (!panel) return

      const game = gameSectionRef.current
      if (game) {
        const visibleTop = Math.max(panel.scrollTop, game.offsetTop)
        const visibleBottom = Math.min(
          panel.scrollTop + panel.clientHeight,
          game.offsetTop + game.offsetHeight,
        )
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        gameIsActiveRef.current = visibleHeight / Math.min(game.offsetHeight, panel.clientHeight) >= 0.45
      }

      const focusPoint = panel.scrollTop + panel.clientHeight * 0.46
      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      contentSectionsRef.current.forEach((element, index) => {
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
    if (contentScrollFrameRef.current) cancelAnimationFrame(contentScrollFrameRef.current)
    if (activationTimerRef.current) clearTimeout(activationTimerRef.current)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.closest('button, a, input, textarea, select')) return
      if (!gameIsActiveRef.current || event.repeat) return
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
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activateDestination, move])

  return {
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
  }
}

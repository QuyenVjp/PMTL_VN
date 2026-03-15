'use client'

import { useEffect, useRef, useState } from 'react'
import { ReactLenis, type LenisRef } from 'lenis/react'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const smallViewport = window.matchMedia('(max-width: 1024px)').matches

    // Disable Lenis on low-power contexts to avoid animation jank.
    setEnabled(!reducedMotion && !(coarsePointer && smallViewport))
  }, [])

  useEffect(() => {
    if (!enabled) return

    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    // Watch body[data-scroll-locked] attribute set by Radix Dialog/Sheet/Drawer
    // When any overlay locks the body, pause Lenis to prevent scroll bleed
    const observer = new MutationObserver(() => {
      const isLocked = document.body.hasAttribute('data-scroll-locked')
      if (isLocked) {
        lenis.stop()
      } else {
        lenis.start()
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    })

    return () => observer.disconnect()
  }, [enabled])

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.08,
        duration: 0.9,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
      }}
    >
      {children}
    </ReactLenis>
  )
}

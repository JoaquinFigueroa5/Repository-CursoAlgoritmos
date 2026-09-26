import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP)

export default function RouteTransition({ ruta, children }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
      )
    },
    { dependencies: [ruta], scope: ref },
  )

  return <div ref={ref}>{children}</div>
}

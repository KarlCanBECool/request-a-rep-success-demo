import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ANIMATION_TIMELINE as T } from '../animation/animation-timeline'
import { useSuccessAnimation } from '../animation/useSuccessAnimation'
import { AnimatedLoader } from './AnimatedLoader'
import { SuccessContent } from './SuccessContent'
import './RequestARepSuccessAnimation.css'

export function RequestARepSuccessAnimation() {
  const { state, replay } = useSuccessAnimation()
  const pageRef = useRef<HTMLElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const [centerOffset, setCenterOffset] = useState(0)
  const [measured, setMeasured] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      if (!loaderRef.current) return
      const rect = loaderRef.current.getBoundingClientRect()
      const loaderCenter = rect.top + rect.height / 2
      const viewportCenter = window.innerHeight / 2
      // Offset needed to move loader from its final (top) position to viewport center
      setCenterOffset(viewportCenter - loaderCenter)
      setMeasured(true)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [state.isComplete])

  const loaderY = state.circleSettled ? 0 : measured ? centerOffset : 0

  return (
    <main className="rar-success" ref={pageRef}>
      <div className="rar-success__inner">
        <div className="rar-success__text-agent">
          <motion.div
            ref={loaderRef}
            className="rar-success__loader-slot"
            initial={false}
            animate={{ y: loaderY }}
            transition={
              state.circleSettled
                ? {
                    duration: T.CIRCLE_MOVE_DURATION / 1000,
                    ease: T.CIRCLE_MOVE_EASING,
                  }
                : { duration: 0 }
            }
          >
            <AnimatedLoader
              progress={state.progress}
              showWoman={state.showWoman}
              showMan={state.showMan}
              opacity={state.circleOpacity}
              scale={state.circleScale}
            />
          </motion.div>

          <SuccessContent
            revealed={state.revealed}
            onCtaClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </div>
      </div>

      <button
        type="button"
        className="rar-success__replay"
        onClick={replay}
        aria-label="Replay animation"
      >
        Replay animation
      </button>
    </main>
  )
}

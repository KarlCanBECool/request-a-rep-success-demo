import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useReducedMotion } from 'motion/react'
import {
  ANIMATION_TIMELINE as T,
  TIMELINE_MARKS as M,
  CONTENT_REVEAL_KEYS,
  type ContentRevealKey,
} from './animation-timeline'

export type AnimationPhase =
  | 'idle'
  | 'entrance'
  | 'progress'
  | 'hold'
  | 'moving'
  | 'revealing'
  | 'complete'
  | 'stepCascade'

export interface SuccessAnimationState {
  phase: AnimationPhase
  circleOpacity: number
  circleScale: number
  progress: number
  showWoman: boolean
  showMan: boolean
  circleSettled: boolean
  revealed: Record<ContentRevealKey, boolean>
  isComplete: boolean
  /** Step cascade: step 1 pie 0.5 → 1 */
  step1Progress: number
  /** Connector between step 1 and 2: 0 → 1 (linear green fill) */
  connector1Fill: number
  /** Step 2 green ring wipe top→bottom over grey pending */
  step2RingFill: number
  /** Step 2 pie reveal bottom→top (0 → 1 masks the 0.5 semicircle) */
  step2PieReveal: number
}

const initialRevealed = (): Record<ContentRevealKey, boolean> =>
  Object.fromEntries(CONTENT_REVEAL_KEYS.map((k) => [k, false])) as Record<
    ContentRevealKey,
    boolean
  >

const initialState = (): SuccessAnimationState => ({
  phase: 'idle',
  circleOpacity: 0,
  circleScale: 0.9,
  progress: 0,
  showWoman: false,
  showMan: false,
  circleSettled: false,
  revealed: initialRevealed(),
  isComplete: false,
  step1Progress: 0.5,
  connector1Fill: 0,
  step2RingFill: 0,
  step2PieReveal: 0,
})

const finalCascadeState = {
  step1Progress: 1,
  connector1Fill: 1,
  step2RingFill: 1,
  step2PieReveal: 1,
} as const

type Stoppable = { stop: () => void }

export function useSuccessAnimation() {
  const prefersReducedMotion = useReducedMotion()
  const [state, setState] = useState<SuccessAnimationState>(initialState)
  const [runId, setRunId] = useState(0)
  const progressMv = useMotionValue(0)
  const womanTriggered = useRef(false)
  const manTriggered = useRef(false)
  const controlsRef = useRef<Stoppable[]>([])

  const stopAll = useCallback(() => {
    controlsRef.current.forEach((c) => c.stop())
    controlsRef.current = []
  }, [])

  const trackTimeout = useCallback((id: number) => {
    controlsRef.current.push({ stop: () => window.clearTimeout(id) })
  }, [])

  const startStep2Arrival = useCallback(() => {
    const ringAnim = animate(0, 1, {
      duration: T.STEP2_RING_FILL_DURATION / 1000,
      ease: T.STEP2_RING_FILL_EASING,
      onUpdate: (v) => setState((s) => ({ ...s, step2RingFill: v })),
      onComplete: () => {
        setState((s) => ({ ...s, step2RingFill: 1 }))

        const pieRevealAnim = animate(0, 1, {
          duration: T.STEP2_PIE_REVEAL_DURATION / 1000,
          ease: T.STEP2_PIE_REVEAL_EASING,
          onUpdate: (v) => setState((s) => ({ ...s, step2PieReveal: v })),
          onComplete: () => {
            setState((s) => ({
              ...s,
              step2PieReveal: 1,
              phase: 'complete',
            }))
          },
        })
        controlsRef.current.push(pieRevealAnim)
      },
    })
    controlsRef.current.push(ringAnim)
  }, [])

  const startStepCascade = useCallback(() => {
    setState((s) => ({ ...s, phase: 'stepCascade' }))

    const pieAnim = animate(0.5, 1, {
      duration: T.STEP_PIE_FILL_DURATION / 1000,
      ease: T.STEP_PIE_FILL_EASING,
      onUpdate: (v) => setState((s) => ({ ...s, step1Progress: v })),
      onComplete: () => {
        setState((s) => ({ ...s, step1Progress: 1 }))

        const lineAnim = animate(0, 1, {
          duration: T.CONNECTOR_FILL_DURATION / 1000,
          ease: T.CONNECTOR_FILL_EASING,
          onUpdate: (v) => setState((s) => ({ ...s, connector1Fill: v })),
          onComplete: () => {
            setState((s) => ({ ...s, connector1Fill: 1 }))
            startStep2Arrival()
          },
        })
        controlsRef.current.push(lineAnim)
      },
    })
    controlsRef.current.push(pieAnim)
  }, [startStep2Arrival])

  const revealContent = useCallback(
    (skipStagger: boolean) => {
      if (skipStagger) {
        setState((s) => ({
          ...s,
          phase: 'complete',
          circleSettled: true,
          revealed: Object.fromEntries(
            CONTENT_REVEAL_KEYS.map((k) => [k, true]),
          ) as Record<ContentRevealKey, boolean>,
          isComplete: true,
          ...finalCascadeState,
        }))
        return
      }

      setState((s) => ({ ...s, phase: 'revealing' }))

      CONTENT_REVEAL_KEYS.forEach((key, index) => {
        const timeout = window.setTimeout(() => {
          const isLast = index === CONTENT_REVEAL_KEYS.length - 1
          setState((s) => ({
            ...s,
            revealed: { ...s.revealed, [key]: true },
            ...(isLast ? { isComplete: true } : {}),
          }))

          if (isLast) {
            const cascadeDelay =
              T.CONTENT_REVEAL_DURATION + T.STEP_CASCADE_HOLD
            const cascadeTimeout = window.setTimeout(() => {
              startStepCascade()
            }, cascadeDelay)
            trackTimeout(cascadeTimeout)
          }
        }, index * T.CONTENT_STAGGER)
        trackTimeout(timeout)
      })
    },
    [startStepCascade, trackTimeout],
  )

  useEffect(() => {
    stopAll()
    womanTriggered.current = false
    manTriggered.current = false
    progressMv.set(0)

    if (prefersReducedMotion) {
      setState({
        phase: 'complete',
        circleOpacity: 1,
        circleScale: 1,
        progress: 1,
        showWoman: true,
        showMan: true,
        circleSettled: true,
        revealed: Object.fromEntries(
          CONTENT_REVEAL_KEYS.map((k) => [k, true]),
        ) as Record<ContentRevealKey, boolean>,
        isComplete: true,
        ...finalCascadeState,
      })
      return () => stopAll()
    }

    setState({
      ...initialState(),
      phase: 'entrance',
    })

    const entranceOpacity = animate(0, 1, {
      duration: T.CIRCLE_ENTRANCE_DURATION / 1000,
      ease: T.CIRCLE_ENTRANCE_EASING,
      onUpdate: (v) => setState((s) => ({ ...s, circleOpacity: v })),
    })
    const entranceScale = animate(0.9, 1, {
      duration: T.CIRCLE_ENTRANCE_DURATION / 1000,
      ease: T.CIRCLE_ENTRANCE_EASING,
      onUpdate: (v) => setState((s) => ({ ...s, circleScale: v })),
    })
    controlsRef.current.push(entranceOpacity, entranceScale)

    const progressStartTimeout = window.setTimeout(() => {
      setState((s) => ({ ...s, phase: 'progress' }))

      const progressAnim = animate(progressMv, 1, {
        duration: T.PROGRESS_DURATION / 1000,
        ease: T.PROGRESS_EASING,
        onUpdate: (v) => {
          const showWoman = v >= T.WOMAN_REVEAL_PROGRESS
          const showMan = v >= T.MAN_REVEAL_PROGRESS
          if (showWoman) womanTriggered.current = true
          if (showMan) manTriggered.current = true
          setState((s) => ({
            ...s,
            progress: v,
            showWoman: s.showWoman || showWoman,
            showMan: s.showMan || showMan,
          }))
        },
        onComplete: () => {
          setState((s) => ({
            ...s,
            phase: 'hold',
            progress: 1,
            showWoman: true,
            showMan: true,
          }))

          const holdTimeout = window.setTimeout(() => {
            setState((s) => ({ ...s, phase: 'moving', circleSettled: true }))

            const contentDelay = Math.max(
              0,
              M.CONTENT_REVEAL_START - M.CIRCLE_MOVE_START,
            )
            const contentTimeout = window.setTimeout(() => {
              revealContent(false)
            }, contentDelay)
            trackTimeout(contentTimeout)
          }, T.COMPLETION_HOLD)

          trackTimeout(holdTimeout)
        },
      })
      controlsRef.current.push(progressAnim)
    }, T.CIRCLE_ENTRANCE_DURATION)

    trackTimeout(progressStartTimeout)

    return () => stopAll()
  }, [runId, prefersReducedMotion, progressMv, revealContent, stopAll, trackTimeout])

  const replay = useCallback(() => {
    stopAll()
    setState(initialState())
    setRunId((n) => n + 1)
  }, [stopAll])

  return { state, replay, runId, prefersReducedMotion: !!prefersReducedMotion }
}

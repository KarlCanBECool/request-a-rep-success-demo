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
})

type Stoppable = { stop: () => void }

export function useSuccessAnimation() {
  const prefersReducedMotion = useReducedMotion()
  const [state, setState] = useState<SuccessAnimationState>(initialState)
  const [runId, setRunId] = useState(0)
  const progressMv = useMotionValue(0)
  const womanTriggered = useRef(false)
  const manTriggered = useRef(false)
  const controlsRef = useRef<Stoppable[]>([])
  const hasStartedRef = useRef(false)

  const stopAll = useCallback(() => {
    controlsRef.current.forEach((c) => c.stop())
    controlsRef.current = []
  }, [])

  const trackTimeout = useCallback((id: number) => {
    controlsRef.current.push({ stop: () => window.clearTimeout(id) })
  }, [])

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
        }))
        return
      }

      setState((s) => ({ ...s, phase: 'revealing' }))

      CONTENT_REVEAL_KEYS.forEach((key, index) => {
        const timeout = window.setTimeout(() => {
          setState((s) => ({
            ...s,
            revealed: { ...s.revealed, [key]: true },
            ...(index === CONTENT_REVEAL_KEYS.length - 1
              ? { phase: 'complete' as const, isComplete: true }
              : {}),
          }))
        }, index * T.CONTENT_STAGGER)
        trackTimeout(timeout)
      })
    },
    [trackTimeout],
  )

  useEffect(() => {
    stopAll()
    womanTriggered.current = false
    manTriggered.current = false
    progressMv.set(0)
    hasStartedRef.current = true

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

  return { state, replay, prefersReducedMotion: !!prefersReducedMotion }
}

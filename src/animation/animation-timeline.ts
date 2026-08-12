/**
 * Tunable animation constants for the Request A Rep success sequence.
 * Designers: adjust these to refine timing without hunting through components.
 */
export const ANIMATION_TIMELINE = {
  /** Phase 1: circle fade + scale in */
  CIRCLE_ENTRANCE_DURATION: 250,
  CIRCLE_ENTRANCE_EASING: [0, 0, 0.2, 1] as const,

  /** Phase 2: circular border fill — MUST stay linear so 25%/50% match visible arc */
  PROGRESS_DURATION: 1600,
  PROGRESS_EASING: 'linear' as const,

  /** Progress thresholds that reveal avatars (fractions of PROGRESS_DURATION) */
  WOMAN_REVEAL_PROGRESS: 0.25,
  MAN_REVEAL_PROGRESS: 0.5,
  AVATAR_REVEAL_DURATION: 280,
  AVATAR_REVEAL_EASING: [0, 0, 0.2, 1] as const,

  /** Brief hold at 100% before the circle moves up */
  COMPLETION_HOLD: 120,

  /** Phase 6: completed circle moves to final layout position */
  CIRCLE_MOVE_DURATION: 450,
  CIRCLE_MOVE_EASING: [0.4, 0, 0.2, 1] as const,

  /** Phase 7: staggered content entrances */
  CONTENT_STAGGER: 100,
  CONTENT_REVEAL_DURATION: 350,
  CONTENT_REVEAL_EASING: [0.4, 0, 0.2, 1] as const,
  CONTENT_TRANSLATE_Y: 10,

  /** Phase 8: step cascade after content is in */
  STEP_CASCADE_HOLD: 100,
  STEP_PIE_FILL_DURATION: 400,
  STEP_PIE_FILL_EASING: [0.4, 0, 0.2, 1] as const,
  CONNECTOR_FILL_DURATION: 2500,
  CONNECTOR_FILL_EASING: 'linear' as const,

  /** Phase 9: step 2 arrival after connector reaches it */
  STEP2_RING_FILL_DURATION: 500,
  STEP2_RING_FILL_EASING: 'linear' as const,
  STEP2_PIE_REVEAL_DURATION: 400,
  STEP2_PIE_REVEAL_EASING: [0.4, 0, 0.2, 1] as const,
} as const

/** Absolute timeline anchors (ms from animation start). */
export const TIMELINE_MARKS = {
  PROGRESS_START: ANIMATION_TIMELINE.CIRCLE_ENTRANCE_DURATION,
  WOMAN_REVEAL_AT:
    ANIMATION_TIMELINE.CIRCLE_ENTRANCE_DURATION +
    ANIMATION_TIMELINE.PROGRESS_DURATION * ANIMATION_TIMELINE.WOMAN_REVEAL_PROGRESS,
  MAN_REVEAL_AT:
    ANIMATION_TIMELINE.CIRCLE_ENTRANCE_DURATION +
    ANIMATION_TIMELINE.PROGRESS_DURATION * ANIMATION_TIMELINE.MAN_REVEAL_PROGRESS,
  PROGRESS_COMPLETE_AT:
    ANIMATION_TIMELINE.CIRCLE_ENTRANCE_DURATION + ANIMATION_TIMELINE.PROGRESS_DURATION,
  CIRCLE_MOVE_START:
    ANIMATION_TIMELINE.CIRCLE_ENTRANCE_DURATION +
    ANIMATION_TIMELINE.PROGRESS_DURATION +
    ANIMATION_TIMELINE.COMPLETION_HOLD,
  /** Content reveal overlaps circle settle (~150ms before move ends) */
  CONTENT_REVEAL_START:
    ANIMATION_TIMELINE.CIRCLE_ENTRANCE_DURATION +
    ANIMATION_TIMELINE.PROGRESS_DURATION +
    ANIMATION_TIMELINE.COMPLETION_HOLD +
    ANIMATION_TIMELINE.CIRCLE_MOVE_DURATION -
    150,
} as const

export const CONTENT_REVEAL_KEYS = [
  'heading',
  'subtext',
  'stepsTitle',
  'step1',
  'step2',
  'step3',
  'cta',
] as const

export type ContentRevealKey = (typeof CONTENT_REVEAL_KEYS)[number]

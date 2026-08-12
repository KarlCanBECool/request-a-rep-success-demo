/**
 * Concentric step progress circle.
 * Layers: green outer ring → white gap → green pie fill.
 * `progress` is 0–1 (0.5 = semicircle). Ready to animate toward 1 later.
 */
export function describePiePath(
  cx: number,
  cy: number,
  radius: number,
  progress: number,
): string {
  const clamped = Math.min(1, Math.max(0, progress))
  if (clamped <= 0) return ''
  if (clamped >= 1) {
    // Full disc
    return [
      `M ${cx} ${cy - radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}`,
      'Z',
    ].join(' ')
  }

  // Start at 12 o'clock; sweep counter-clockwise so 50% fills the left half
  const startAngle = -Math.PI / 2
  const endAngle = startAngle - clamped * Math.PI * 2
  const x1 = cx + radius * Math.cos(startAngle)
  const y1 = cy + radius * Math.sin(startAngle)
  const x2 = cx + radius * Math.cos(endAngle)
  const y2 = cy + radius * Math.sin(endAngle)
  const largeArc = clamped > 0.5 ? 1 : 0

  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`,
    'Z',
  ].join(' ')
}

interface StepProgressCircleProps {
  /** 0–1 fill amount. Active step uses 0.5 (semicircle). */
  progress?: number
  className?: string
}

const SIZE = 28
const CX = SIZE / 2
const CY = SIZE / 2
/** Outer ring sits just inside the viewBox edge */
const RING_RADIUS = 13
const RING_STROKE = 2
/** Fill inset so a white ring remains between stroke and pie */
const FILL_RADIUS = 9

export function StepProgressCircle({
  progress = 0.5,
  className,
}: StepProgressCircleProps) {
  const piePath = describePiePath(CX, CY, FILL_RADIUS, progress)

  return (
    <svg
      className={className}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
    >
      {/* White disc + green outer ring */}
      <circle
        cx={CX}
        cy={CY}
        r={RING_RADIUS}
        fill="#fff"
        stroke="#008537"
        strokeWidth={RING_STROKE}
      />
      {/* Green pie fill */}
      {piePath ? <path d={piePath} fill="#008537" /> : null}
    </svg>
  )
}

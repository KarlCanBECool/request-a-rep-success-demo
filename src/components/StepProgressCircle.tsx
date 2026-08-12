import { useId } from 'react'

/**
 * Concentric step progress circle.
 * Layers: green outer ring → white gap → green pie fill.
 *
 * `progress` — pie amount 0–1 (0.5 = left semicircle).
 * `ringReveal` — 0–1 top→bottom wipe of the whole green circle (over a grey pending underlay).
 * `pieReveal` — 0–1 bottom→top wipe of the pie fill only.
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
    return [
      `M ${cx} ${cy - radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}`,
      'Z',
    ].join(' ')
  }

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
  progress?: number
  ringReveal?: number
  pieReveal?: number
  className?: string
}

const SIZE = 28
const CX = SIZE / 2
const CY = SIZE / 2
const RING_RADIUS = 13
const RING_STROKE = 2
const FILL_RADIUS = 9

export function StepProgressCircle({
  progress = 0.5,
  ringReveal = 1,
  pieReveal = 1,
  className,
}: StepProgressCircleProps) {
  const reactId = useId()
  const clipId = `pie-reveal${reactId.replace(/:/g, '')}`
  const piePath = describePiePath(CX, CY, FILL_RADIUS, progress)
  const ringClipBottom = (1 - Math.min(1, Math.max(0, ringReveal))) * SIZE
  const pieClipTop = (1 - Math.min(1, Math.max(0, pieReveal))) * SIZE
  const pieClipHeight = SIZE - pieClipTop

  return (
    <svg
      className={className}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      style={{ clipPath: `inset(0 0 ${ringClipBottom}px 0)` }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={0}
            y={pieClipTop}
            width={SIZE}
            height={Math.max(0, pieClipHeight)}
          />
        </clipPath>
      </defs>
      <circle
        cx={CX}
        cy={CY}
        r={RING_RADIUS}
        fill="#fff"
        stroke="#008537"
        strokeWidth={RING_STROKE}
      />
      {piePath ? (
        <path d={piePath} fill="#008537" clipPath={`url(#${clipId})`} />
      ) : null}
    </svg>
  )
}

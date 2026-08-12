import { motion } from 'motion/react'
import { ANIMATION_TIMELINE as T } from '../animation/animation-timeline'
import './AnimatedLoader.css'

const SIZE = 90
const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface AnimatedLoaderProps {
  progress: number
  showWoman: boolean
  showMan: boolean
  opacity: number
  scale: number
}

export function AnimatedLoader({
  progress,
  showWoman,
  showMan,
  opacity,
  scale,
}: AnimatedLoaderProps) {
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <motion.div
      className="animated-loader"
      style={{ opacity, scale }}
      aria-hidden="true"
    >
      <svg
        className="animated-loader__ring"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
      >
        <circle
          className="animated-loader__track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
        />
        <circle
          className="animated-loader__progress"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>

      <div className="animated-loader__avatars">
        <div className="animated-loader__avatars-bg" />
        <motion.div
          className="animated-loader__avatar animated-loader__avatar--man"
          initial={false}
          animate={{ opacity: showMan ? 1 : 0 }}
          transition={{
            duration: T.AVATAR_REVEAL_DURATION / 1000,
            ease: T.AVATAR_REVEAL_EASING,
          }}
        >
          <img src={`${import.meta.env.BASE_URL}assets/agent-man.png`} alt="" />
        </motion.div>
        <motion.div
          className="animated-loader__avatar animated-loader__avatar--woman"
          initial={false}
          animate={{ opacity: showWoman ? 1 : 0 }}
          transition={{
            duration: T.AVATAR_REVEAL_DURATION / 1000,
            ease: T.AVATAR_REVEAL_EASING,
          }}
        >
          <img src={`${import.meta.env.BASE_URL}assets/agent-woman.png`} alt="" />
        </motion.div>
      </div>
    </motion.div>
  )
}

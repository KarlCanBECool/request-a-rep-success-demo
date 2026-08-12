import { motion, type HTMLMotionProps } from 'motion/react'
import type { ContentRevealKey } from '../animation/animation-timeline'
import { ANIMATION_TIMELINE as T } from '../animation/animation-timeline'
import { StepProgressCircle } from './StepProgressCircle'
import './SuccessContent.css'

interface RevealProps {
  revealed: boolean
  children: React.ReactNode
  className?: string
}

function RevealDiv({
  revealed,
  children,
  className,
  ...rest
}: RevealProps & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{
        opacity: revealed ? 1 : 0,
        y: revealed ? 0 : T.CONTENT_TRANSLATE_Y,
      }}
      transition={{
        duration: T.CONTENT_REVEAL_DURATION / 1000,
        ease: T.CONTENT_REVEAL_EASING,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

const STEPS = [
  {
    key: 'step1' as const,
    title: 'Rep assignment',
    description:
      'They will review your request and confirm they are your point of contact',
    status: 'active' as const,
  },
  {
    key: 'step2' as const,
    title: 'Rep outreach',
    description:
      'You will receive a call or email from your rep to help with your enquiry',
    status: 'pending' as const,
  },
  {
    key: 'step3' as const,
    title: 'Continued support',
    description:
      "We'll schedule a visit to your office or continue to offer tailored support for your needs",
    status: 'pending' as const,
  },
]

interface SuccessContentProps {
  revealed: Record<ContentRevealKey, boolean>
  onCtaClick?: () => void
}

export function SuccessContent({ revealed, onCtaClick }: SuccessContentProps) {
  return (
    <div className="success-content">
      <div className="success-content__heading-block">
        <RevealDiv revealed={revealed.heading}>
          <h1 className="success-content__heading">Request received!</h1>
        </RevealDiv>
        <RevealDiv revealed={revealed.subtext}>
          <p className="success-content__subtext">
            We&apos;re connecting you with a representative in your area.
          </p>
        </RevealDiv>
      </div>

      <RevealDiv
        className="success-content__steps-card"
        revealed={revealed.stepsTitle}
        aria-label="What your rep will do"
      >
        <div className="success-content__steps-title">What your rep will do</div>

        <div className="success-content__steps">
          <div className="success-content__progress-line" aria-hidden="true" />
          {STEPS.map((step) => (
            <RevealDiv
              key={step.key}
              className="success-content__step"
              revealed={revealed[step.key]}
            >
              {step.status === 'active' ? (
                <StepProgressCircle
                  progress={0.5}
                  className="success-content__step-icon success-content__step-icon--active"
                />
              ) : (
                <div
                  className="success-content__step-icon success-content__step-icon--pending"
                  aria-hidden="true"
                />
              )}
              <div className="success-content__step-text">
                <p className="success-content__step-title">{step.title}</p>
                <p className="success-content__step-desc">{step.description}</p>
              </div>
            </RevealDiv>
          ))}
        </div>
      </RevealDiv>

      <RevealDiv revealed={revealed.cta}>
        <button
          type="button"
          className="success-content__cta"
          tabIndex={revealed.cta ? 0 : -1}
          onClick={onCtaClick}
        >
          Go to home
        </button>
      </RevealDiv>
    </div>
  )
}

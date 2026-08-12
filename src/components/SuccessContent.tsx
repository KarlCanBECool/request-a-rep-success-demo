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

interface StepConnectorProps {
  fill: number
}

function StepConnector({ fill }: StepConnectorProps) {
  return (
    <div className="success-content__step-connector" aria-hidden="true">
      <div className="success-content__step-connector-track" />
      <div
        className="success-content__step-connector-fill"
        style={{ transform: `scaleY(${fill})` }}
      />
    </div>
  )
}

const STEPS = [
  {
    key: 'step1' as const,
    title: 'Rep assignment',
    description:
      'We will process your request and link you to a representative in your area',
  },
  {
    key: 'step2' as const,
    title: 'Rep outreach',
    description:
      'You will receive a call or email from your rep to help with your enquiry',
  },
  {
    key: 'step3' as const,
    title: 'Continued support',
    description:
      "We'll schedule a visit to your office or continue to offer tailored support for your needs",
  },
]

export interface StepCascadeState {
  step1Progress: number
  connector1Fill: number
  step2RingFill: number
  step2PieReveal: number
}

interface SuccessContentProps {
  revealed: Record<ContentRevealKey, boolean>
  cascade: StepCascadeState
  onCtaClick?: () => void
}

function StepIcon({
  stepKey,
  cascade,
}: {
  stepKey: 'step1' | 'step2' | 'step3'
  cascade: StepCascadeState
}) {
  if (stepKey === 'step1') {
    return (
      <StepProgressCircle
        progress={cascade.step1Progress}
        className="success-content__step-icon success-content__step-icon--active"
      />
    )
  }

  if (stepKey === 'step2') {
    return (
      <div className="success-content__step-icon-stack">
        <div
          className="success-content__step-icon success-content__step-icon--pending"
          aria-hidden="true"
        />
        {cascade.step2RingFill > 0 && (
          <StepProgressCircle
            progress={0.5}
            ringReveal={cascade.step2RingFill}
            pieReveal={cascade.step2PieReveal}
            className="success-content__step-icon success-content__step-icon--active success-content__step-icon--overlay"
          />
        )}
      </div>
    )
  }

  return (
    <div
      className="success-content__step-icon success-content__step-icon--pending"
      aria-hidden="true"
    />
  )
}

export function SuccessContent({
  revealed,
  cascade,
  onCtaClick,
}: SuccessContentProps) {
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
        aria-label="What happens next?"
      >
        <div className="success-content__steps-title">What happens next?</div>

        <div className="success-content__steps">
          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1
            const connectorFill = index === 0 ? cascade.connector1Fill : 0

            return (
              <RevealDiv
                key={step.key}
                className="success-content__step"
                revealed={revealed[step.key]}
              >
                <div className="success-content__step-rail">
                  <StepIcon stepKey={step.key} cascade={cascade} />
                  {!isLast && <StepConnector fill={connectorFill} />}
                </div>
                <div className="success-content__step-text">
                  <p className="success-content__step-title">{step.title}</p>
                  <p className="success-content__step-desc">{step.description}</p>
                </div>
              </RevealDiv>
            )
          })}
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

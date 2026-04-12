import type { FormTemplate } from '@/types/app'
import type { FormTemplateProps } from './types'

import { CleanTemplate } from './clean'
import { NeonTemplate } from './neon'
import { GradientTemplate } from './gradient'
import { PartyTemplate } from './party'
import { LuxuryTemplate } from './luxury'
import { BrutalTemplate } from './brutal'
import { GlassTemplate } from './glass'
import { SplitTemplate } from './split'
import { ArcadeTemplate } from './arcade'
import { ConversationalTemplate } from './conversational'
import { TerminalTemplate } from './terminal'
import { HolographicTemplate } from './holographic'

const TEMPLATE_MAP: Record<FormTemplate, React.ComponentType<FormTemplateProps>> = {
  clean:          CleanTemplate,
  neon:           NeonTemplate,
  gradient:       GradientTemplate,
  party:          PartyTemplate,
  luxury:         LuxuryTemplate,
  brutal:         BrutalTemplate,
  glass:          GlassTemplate,
  split:          SplitTemplate,
  arcade:         ArcadeTemplate,
  conversational: ConversationalTemplate,
  terminal:       TerminalTemplate,
  holographic:    HolographicTemplate,
}

export function FormTemplateRenderer(props: FormTemplateProps) {
  const Component = TEMPLATE_MAP[props.form.template] ?? CleanTemplate
  return (
    <div style={{ '--accent': props.form.accent_color } as React.CSSProperties}>
      <Component {...props} />
    </div>
  )
}

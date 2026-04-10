import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WinnerNotificationProps {
  formName: string
  winnerName: string
  winnerEmail: string
  formUrl: string
  accentColor: string
  logoUrl?: string | null
  workspaceName: string
}

export function WinnerNotificationEmail({
  formName,
  winnerName,
  winnerEmail,
  formUrl,
  accentColor,
  logoUrl,
  workspaceName,
}: WinnerNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>🏆 You won {formName}!</Preview>
      <Body style={{ backgroundColor: '#09090b', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
          {/* Logo */}
          {logoUrl && (
            <Section style={{ textAlign: 'center', marginBottom: 24 }}>
              <Img src={logoUrl} width={48} height={48} alt={workspaceName} style={{ borderRadius: 8 }} />
            </Section>
          )}

          {/* Trophy */}
          <Section style={{ textAlign: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 48, margin: 0 }}>🏆</Text>
          </Section>

          {/* Heading */}
          <Heading style={{ color: '#fafafa', fontSize: 28, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>
            You won!
          </Heading>
          <Text style={{ color: '#a1a1aa', textAlign: 'center', margin: '0 0 32px', fontSize: 16 }}>
            Congratulations {winnerName} — you were selected as a winner in <strong style={{ color: '#fafafa' }}>{formName}</strong>.
          </Text>

          {/* Winner card */}
          <Section style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '24px', marginBottom: 32, textAlign: 'center' }}>
            <Text style={{ color: '#71717a', fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Selected Winner</Text>
            <Text style={{ color: '#fafafa', fontSize: 22, fontWeight: 700, margin: 0 }}>{winnerName}</Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', marginBottom: 32 }}>
            <Button
              href={formUrl}
              style={{
                backgroundColor: accentColor,
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 10,
                padding: '12px 32px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              View the Giveaway →
            </Button>
          </Section>

          <Hr style={{ borderColor: '#27272a', margin: '0 0 24px' }} />

          <Text style={{ color: '#52525b', fontSize: 12, textAlign: 'center', margin: 0 }}>
            Sent by {workspaceName} via DrawVault
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

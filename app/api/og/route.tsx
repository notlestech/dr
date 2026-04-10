import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subdomain = searchParams.get('form')

  let formName = 'DrawVault Giveaway'
  let accent = '#6366f1'
  let entryCount = 0

  if (subdomain) {
    const { data: form } = await supabase
      .from('forms')
      .select('name, accent_color')
      .eq('subdomain', subdomain)
      .single()

    if (form) {
      formName = form.name
      accent = form.accent_color

      const { count } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', subdomain)

      entryCount = count ?? 0
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Accent glow */}
        <div style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: accent,
          opacity: 0.15,
          filter: 'blur(80px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* Trophy icon text */}
        <div style={{ fontSize: 64, marginBottom: 24 }}>🎰</div>

        {/* Form name */}
        <div style={{
          fontSize: 52,
          fontWeight: 700,
          color: '#fafafa',
          textAlign: 'center',
          maxWidth: 900,
          lineHeight: 1.2,
          marginBottom: 16,
        }}>
          {formName}
        </div>

        {/* Entry count */}
        {entryCount > 0 && (
          <div style={{
            fontSize: 24,
            color: accent,
            fontWeight: 600,
            marginBottom: 32,
          }}>
            {entryCount.toLocaleString()} entries
          </div>
        )}

        {/* Brand */}
        <div style={{
          fontSize: 20,
          color: '#52525b',
          marginTop: 8,
        }}>
          Powered by DrawVault
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

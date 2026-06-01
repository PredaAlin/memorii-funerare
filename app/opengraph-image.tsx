import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Eternal Memories — Plăci Memoriale QR'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1c1917',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'serif',
        }}
      >
        {/* Diamond logo */}
        <div
          style={{
            width: '56px',
            height: '56px',
            border: '3px solid #e7e5e4',
            transform: 'rotate(45deg)',
            marginBottom: '48px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '30px', height: '30px', border: '2px solid #d97706' }} />
        </div>

        <p
          style={{
            color: '#d97706',
            fontSize: '18px',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            margin: '0 0 24px',
          }}
        >
          ETERNAL MEMORIES
        </p>

        <h1
          style={{
            color: '#fafaf9',
            fontSize: '64px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '0 0 28px',
            lineHeight: 1.15,
          }}
        >
          Plăci Memoriale QR
        </h1>

        <p
          style={{
            color: '#a8a29e',
            fontSize: '26px',
            textAlign: 'center',
            margin: '0',
            fontFamily: 'sans-serif',
          }}
        >
          Oțel inoxidabil premium · Pagină digitală pe viață
        </p>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            width: '80px',
            height: '3px',
            background: '#d97706',
            borderRadius: '2px',
          }}
        />
      </div>
    ),
    { ...size }
  )
}

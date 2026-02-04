// src/app/opengraph-image.tsx
// Dynamic OG image generation using Next.js ImageResponse
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MietCheck.ch - Miete senken in 3 Minuten';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: '20px' }}
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 22V12h6v10"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 72, fontWeight: 'bold' }}>MietCheck.ch</span>
        </div>
        <div
          style={{
            fontSize: 36,
            opacity: 0.9,
            marginBottom: '40px',
          }}
        >
          Miete senken in 3 Minuten
        </div>
        <div
          style={{
            display: 'flex',
            gap: '30px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '20px 30px',
              borderRadius: '12px',
              fontSize: 28,
            }}
          >
            CHF 300-700 sparen
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '20px 30px',
              borderRadius: '12px',
              fontSize: 28,
            }}
          >
            100% legal
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '20px 30px',
              borderRadius: '12px',
              fontSize: 28,
            }}
          >
            Schweizer Mietrecht
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

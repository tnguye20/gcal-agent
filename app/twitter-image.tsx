import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'CalSnap - Snap Any Content Into Calendar Events with AI';
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
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            width: 120,
            height: 120,
            backgroundColor: '#6366f1',
            borderRadius: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              color: 'white',
            }}
          >
            📅
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            marginBottom: 20,
          }}
        >
          CalSnap
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          Snap Any Content Into Calendar Events with AI
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 20 }}>
            <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' }} />
            Instagram Posts
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 20 }}>
            <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' }} />
            Text & Images
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 20 }}>
            <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' }} />
            AI Powered
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

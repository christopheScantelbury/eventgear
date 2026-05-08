import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0C1220',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            border: '2px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Center hub */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Inner hole */}
            <div
              style={{
                width: 3,
                height: 3,
                borderRadius: 2,
                background: '#0C1220',
              }}
            />
          </div>
        </div>
        {/* Top tooth */}
        <div style={{ position: 'absolute', top: 1, left: 14, width: 4, height: 5, background: '#F59E0B', borderRadius: 1 }} />
        {/* Bottom tooth */}
        <div style={{ position: 'absolute', bottom: 1, left: 14, width: 4, height: 5, background: '#F59E0B', borderRadius: 1 }} />
        {/* Left tooth */}
        <div style={{ position: 'absolute', left: 1, top: 14, width: 5, height: 4, background: '#F59E0B', borderRadius: 1 }} />
        {/* Right tooth */}
        <div style={{ position: 'absolute', right: 1, top: 14, width: 5, height: 4, background: '#F59E0B', borderRadius: 1 }} />
      </div>
    ),
    { ...size },
  );
}

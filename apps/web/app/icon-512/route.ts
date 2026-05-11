import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Ícone 512×512 referenciado no manifest.json como ícone principal do PWA.
// Serve também como splash screen icon no Android.
export function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#0C1220',
          borderRadius: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: 170,
            border: '22px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Center hub */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Inner hole */}
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                background: '#0C1220',
              }}
            />
          </div>
        </div>
        {/* Top tooth */}
        <div style={{ position: 'absolute', top: 14, left: 228, width: 56, height: 72, background: '#F59E0B', borderRadius: 10 }} />
        {/* Bottom tooth */}
        <div style={{ position: 'absolute', bottom: 14, left: 228, width: 56, height: 72, background: '#F59E0B', borderRadius: 10 }} />
        {/* Left tooth */}
        <div style={{ position: 'absolute', left: 14, top: 228, width: 72, height: 56, background: '#F59E0B', borderRadius: 10 }} />
        {/* Right tooth */}
        <div style={{ position: 'absolute', right: 14, top: 228, width: 72, height: 56, background: '#F59E0B', borderRadius: 10 }} />
        {/* Top-left diagonal tooth */}
        <div style={{ position: 'absolute', top: 56, left: 56, width: 46, height: 46, background: '#F59E0B', borderRadius: 8, transform: 'rotate(45deg)' }} />
        {/* Top-right diagonal tooth */}
        <div style={{ position: 'absolute', top: 56, right: 56, width: 46, height: 46, background: '#F59E0B', borderRadius: 8, transform: 'rotate(45deg)' }} />
        {/* Bottom-left diagonal tooth */}
        <div style={{ position: 'absolute', bottom: 56, left: 56, width: 46, height: 46, background: '#F59E0B', borderRadius: 8, transform: 'rotate(45deg)' }} />
        {/* Bottom-right diagonal tooth */}
        <div style={{ position: 'absolute', bottom: 56, right: 56, width: 46, height: 46, background: '#F59E0B', borderRadius: 8, transform: 'rotate(45deg)' }} />
      </div>
    ),
    { width: 512, height: 512 },
  );
}

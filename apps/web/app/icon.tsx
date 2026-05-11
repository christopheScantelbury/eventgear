import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

// Gear icon usada tanto como favicon (browser escala para 32px) quanto
// como ícone PWA de 192×192 no manifest.json → /icon
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: '#0C1220',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: 65,
            border: '9px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Center hub */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Inner hole */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: '#0C1220',
              }}
            />
          </div>
        </div>
        {/* Top tooth */}
        <div style={{ position: 'absolute', top: 6, left: 86, width: 20, height: 28, background: '#F59E0B', borderRadius: 4 }} />
        {/* Bottom tooth */}
        <div style={{ position: 'absolute', bottom: 6, left: 86, width: 20, height: 28, background: '#F59E0B', borderRadius: 4 }} />
        {/* Left tooth */}
        <div style={{ position: 'absolute', left: 6, top: 86, width: 28, height: 20, background: '#F59E0B', borderRadius: 4 }} />
        {/* Right tooth */}
        <div style={{ position: 'absolute', right: 6, top: 86, width: 28, height: 20, background: '#F59E0B', borderRadius: 4 }} />
        {/* Top-left diagonal tooth */}
        <div style={{ position: 'absolute', top: 22, left: 22, width: 18, height: 18, background: '#F59E0B', borderRadius: 3, transform: 'rotate(45deg)' }} />
        {/* Top-right diagonal tooth */}
        <div style={{ position: 'absolute', top: 22, right: 22, width: 18, height: 18, background: '#F59E0B', borderRadius: 3, transform: 'rotate(45deg)' }} />
        {/* Bottom-left diagonal tooth */}
        <div style={{ position: 'absolute', bottom: 22, left: 22, width: 18, height: 18, background: '#F59E0B', borderRadius: 3, transform: 'rotate(45deg)' }} />
        {/* Bottom-right diagonal tooth */}
        <div style={{ position: 'absolute', bottom: 22, right: 22, width: 18, height: 18, background: '#F59E0B', borderRadius: 3, transform: 'rotate(45deg)' }} />
      </div>
    ),
    { ...size },
  );
}

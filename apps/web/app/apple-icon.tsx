import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Aparece como ícone no iOS quando o usuário faz "Adicionar à tela inicial"
// Next.js automaticamente injeta <link rel="apple-touch-icon" href="/apple-icon">
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0C1220',
          borderRadius: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            width: 122,
            height: 122,
            borderRadius: 61,
            border: '8px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Center hub */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Inner hole */}
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                background: '#0C1220',
              }}
            />
          </div>
        </div>
        {/* Top tooth */}
        <div style={{ position: 'absolute', top: 5, left: 80, width: 19, height: 26, background: '#F59E0B', borderRadius: 4 }} />
        {/* Bottom tooth */}
        <div style={{ position: 'absolute', bottom: 5, left: 80, width: 19, height: 26, background: '#F59E0B', borderRadius: 4 }} />
        {/* Left tooth */}
        <div style={{ position: 'absolute', left: 5, top: 80, width: 26, height: 19, background: '#F59E0B', borderRadius: 4 }} />
        {/* Right tooth */}
        <div style={{ position: 'absolute', right: 5, top: 80, width: 26, height: 19, background: '#F59E0B', borderRadius: 4 }} />
        {/* Diagonal teeth */}
        <div style={{ position: 'absolute', top: 20, left: 20, width: 17, height: 17, background: '#F59E0B', borderRadius: 3, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, width: 17, height: 17, background: '#F59E0B', borderRadius: 3, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', bottom: 20, left: 20, width: 17, height: 17, background: '#F59E0B', borderRadius: 3, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', bottom: 20, right: 20, width: 17, height: 17, background: '#F59E0B', borderRadius: 3, transform: 'rotate(45deg)' }} />
      </div>
    ),
    { ...size },
  );
}

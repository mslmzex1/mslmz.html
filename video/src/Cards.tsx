import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, SCENES, sceneAt} from './theme';

type Card = {label: string; value: string; strong?: boolean};

const CARDS: Record<string, Card[]> = {
  giris: [
    {label: 'Piston çapı', value: 'D = 100 mm'},
    {label: 'Çalışma basıncı', value: 'P = 160 bar'},
    {label: 'Aranan', value: 'F = ? ton', strong: true},
  ],
  alan: [
    {label: 'Piston alanı', value: 'A = π · D² / 4', strong: true},
    {label: 'D = 10 cm', value: 'A = π · 10² / 4'},
    {label: 'Sonuç', value: 'A ≈ 78,54 cm²', strong: true},
  ],
  kuvvet: [
    {label: 'Temel bağıntı', value: 'F = P × A', strong: true},
    {label: '160 bar = 16 MPa', value: '16·10⁶ Pa × 0,007854 m²'},
    {label: 'İtme kuvveti', value: 'F ≈ 125 664 N ≈ 12,8 t', strong: true},
  ],
  cekme: [
    {label: 'Halka alan', value: 'Ah = π (D² − d²) / 4', strong: true},
    {label: 'Mil çapı d = 56 mm', value: 'Ah ≈ 53,91 cm²'},
    {label: 'Çekme kuvveti', value: 'F ≈ 86 256 N ≈ 8,8 t', strong: true},
  ],
  ozet: [
    {label: 'İtme (A portu)', value: '≈ 12,8 ton', strong: true},
    {label: 'Çekme (B portu)', value: '≈ 8,8 ton', strong: true},
    {label: 'Pratik', value: '−%10 sürtünme / verim payı'},
  ],
};

export const Cards: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = SCENES[sceneAt(frame)];
  const local = frame - scene.from;
  const cards = CARDS[scene.id];
  const step = (scene.voiceFrames * 0.8) / cards.length;
  const exit = interpolate(local, [scene.duration - 10, scene.duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div style={{position: 'absolute', top: 1090, left: 80, right: 110, display: 'flex', flexDirection: 'column', gap: 26, opacity: exit}}>
      {cards.map((c, i) => {
        const p = spring({frame: local - 8 - i * step, fps, config: {damping: 15, stiffness: 120}});
        const glow = c.strong ? interpolate(spring({frame: local - 8 - i * step - 12, fps}), [0, 1], [0, 1]) : 0;
        return (
          <div
            key={scene.id + i}
            style={{
              opacity: p,
              transform: `translateX(${(1 - p) * 120}px) scale(${0.94 + 0.06 * p})`,
              border: `3px solid ${c.strong ? C.yellow : C.lineDim}`,
              background: c.strong ? `rgba(255,200,61,${0.08 + 0.06 * glow})` : 'rgba(10,32,58,0.85)',
              boxShadow: c.strong ? `0 0 ${36 * glow}px rgba(255,200,61,0.35)` : 'none',
              padding: '22px 32px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            <div style={{fontFamily: FONT, fontSize: 28, color: C.muted, letterSpacing: 1}}>{c.label}</div>
            <div style={{fontFamily: MONO, fontSize: c.strong ? 52 : 42, fontWeight: 700, color: c.strong ? C.yellow : C.text}}>{c.value}</div>
          </div>
        );
      })}
    </div>
  );
};

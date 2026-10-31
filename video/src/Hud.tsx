import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, SCENES, sceneAt} from './theme';

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = sceneAt(frame);
  const scene = SCENES[idx];
  const local = frame - scene.from;
  const titleIn = spring({frame: local, fps, config: {damping: 200}});
  const intro = spring({frame, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
      {/* kategori etiketi */}
      <div
        style={{
          position: 'absolute', top: 90, left: 80, padding: '10px 26px', border: `3px solid ${C.yellow}`,
          color: C.yellow, fontFamily: MONO, fontSize: 34, fontWeight: 700, letterSpacing: 8,
          opacity: intro, transform: `translateX(${(1 - intro) * -60}px)`,
        }}
      >
        HİDROLİK
      </div>
      <div style={{position: 'absolute', top: 100, right: 80, fontFamily: MONO, fontSize: 28, color: C.muted, opacity: intro}}>
        Ø100 · 160 bar
      </div>
      <div style={{position: 'absolute', top: 190, left: 80, right: 80, fontSize: 64, fontWeight: 800, lineHeight: 1.1, opacity: intro}}>
        Silindir kaç ton
        <br />
        <span style={{color: C.yellow}}>kuvvet</span> üretir?
      </div>

      {/* adım başlığı */}
      <div
        style={{
          position: 'absolute', top: 380, left: 80, fontFamily: MONO, fontSize: 30, color: C.line,
          opacity: titleIn, transform: `translateY(${(1 - titleIn) * 20}px)`,
        }}
      >
        ADIM {String(idx + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')} — {scene.title.toLocaleUpperCase('tr-TR')}
      </div>

      {/* pagination: alt alta noktalar */}
      <div style={{position: 'absolute', right: 52, top: 1110, display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'center'}}>
        {SCENES.map((s, i) => {
          const active = i === idx;
          const p = active ? spring({frame: local, fps, config: {damping: 14}}) : 0;
          const h = interpolate(p, [0, 1], [16, 56]);
          return (
            <div
              key={s.id}
              style={{
                width: 16, height: active ? h : 16, borderRadius: 8,
                background: i < idx ? C.line : active ? C.yellow : 'transparent',
                border: `2px solid ${i <= idx ? 'transparent' : C.lineDim}`,
              }}
            />
          );
        })}
      </div>

      {/* ilerleme çubuğu */}
      <div style={{position: 'absolute', left: 80, right: 80, bottom: 150, height: 6, background: 'rgba(143,195,255,0.15)'}}>
        <div
          style={{
            height: '100%', background: C.yellow,
            width: `${interpolate(frame, [0, SCENES[SCENES.length - 1].from + SCENES[SCENES.length - 1].duration], [0, 100], {extrapolateRight: 'clamp'})}%`,
          }}
        />
      </div>

      {/* teknik kod */}
      <div style={{position: 'absolute', right: 80, bottom: 80, fontFamily: MONO, fontSize: 30, color: C.muted, letterSpacing: 4}}>
        TM-867
      </div>
      <div style={{position: 'absolute', left: 80, bottom: 80, fontFamily: MONO, fontSize: 24, color: C.muted}}>
        F = P × A
      </div>
    </AbsoluteFill>
  );
};

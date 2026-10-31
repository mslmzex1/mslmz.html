import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, SCENES, sceneAt} from './theme';

const [GIRIS, ALAN, KUVVET, CEKME, OZET] = SCENES;
const ease = {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// geometri (viewBox birimleri)
const BARREL = {x: 120, y: 290, w: 520, h: 160};
const CY = BARREL.y + BARREL.h / 2;
const PISTON_W = 40;
const STROKE = {min: 170, max: 430};
const ROD_LEN = 480;
const ROD_H = Math.round((BARREL.h - 16) * 0.56); // d/D = 56/100
const GAUGE = {x: 385, y: 120, r: 92};

const pistonX = (f: number) => {
  const base = interpolate(
    f,
    [0, GIRIS.voiceFrames, ALAN.from, KUVVET.from + 20, KUVVET.from + KUVVET.voiceFrames, CEKME.from + 20, CEKME.from + CEKME.voiceFrames, OZET.from],
    [0.15, 0.4, 0.4, 0.05, 1, 1, 0.08, 0.08],
    ease,
  );
  const cycle = f >= OZET.from ? (1 - Math.cos(((f - OZET.from) / 90) * Math.PI)) / 2 : 0;
  const p = f >= OZET.from ? 0.08 + 0.84 * cycle : base;
  return STROKE.min + p * (STROKE.max - STROKE.min);
};

const pressure = (f: number) =>
  interpolate(
    f,
    [0, 40, GIRIS.voiceFrames, ALAN.from, ALAN.from + 30, KUVVET.from, KUVVET.from + 45, CEKME.from, CEKME.from + 12, CEKME.from + 45],
    [0, 40, 40, 40, 0, 0, 160, 160, 60, 160],
    ease,
  );

const Arrow: React.FC<{x: number; y: number; dir: 1 | -1; len: number; color: string; label: string; o: number}> = ({x, y, dir, len, color, label, o}) => (
  <g opacity={o}>
    <line x1={x} y1={y} x2={x + dir * len} y2={y} stroke={color} strokeWidth={10} />
    <path d={`M${x + dir * (len + 34)} ${y} l${-dir * 38} -24 v48 z`} fill={color} />
    <text x={x + dir * (len / 2)} y={y - 30} fill={color} fontFamily={MONO} fontSize={40} fontWeight={700} textAnchor="middle">
      {label}
    </text>
  </g>
);

export const Cylinder: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = sceneAt(f);
  const local = f - SCENES[idx].from;
  const draw = spring({frame: f, fps, config: {damping: 200}, durationInFrames: 50});

  const px = pistonX(f);
  const rodEnd = px + PISTON_W + ROD_LEN;
  const bar = pressure(f);
  const jitter = bar > 5 ? Math.sin(f * 0.9) * 1.2 : 0;
  const needle = -135 + ((bar + jitter) / 250) * 270;

  const aActive = idx === 2 || (idx === 4 && Math.sin(((f - OZET.from) / 90) * Math.PI) > 0) || idx === 0;
  const bActive = idx === 3 || (idx === 4 && !aActive);
  const flowShift = (f * 4) % 40;
  const inset = idx === 1 || idx === 3 ? spring({frame: local - 10, fps, config: {damping: 16}}) : 0;
  const arrowOpacity = (s: number) => (idx === s ? interpolate(local, [30, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0);

  const inner = {y: BARREL.y + 8, h: BARREL.h - 16};
  const dash = 2400;

  return (
    <svg viewBox="0 0 1040 640" width={1000} style={{position: 'absolute', top: 470, left: 30}}>
      <defs>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="14" stroke={C.yellow} strokeWidth="4" />
        </pattern>
        <linearGradient id="rod" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe3f7" />
          <stop offset="0.5" stopColor="#7d97b3" />
          <stop offset="1" stopColor="#3b526b" />
        </linearGradient>
      </defs>

      {/* hidrolik hatlar + manometre bağlantısı */}
      <g stroke={C.lineDim} strokeWidth={6} fill="none" strokeDasharray={dash} strokeDashoffset={dash * (1 - draw)}>
        <path d={`M170 ${BARREL.y} V215 H600 V${BARREL.y}`} />
        <path d={`M${GAUGE.x} 215 V${GAUGE.y + GAUGE.r}`} />
      </g>
      {/* yağ akışı */}
      {aActive && <path d={`M170 215 V${BARREL.y}`} stroke={C.oilA} strokeWidth={8} strokeDasharray="20 20" strokeDashoffset={-flowShift} />}
      {bActive && <path d={`M600 215 V${BARREL.y}`} stroke={C.oilB} strokeWidth={8} strokeDasharray="20 20" strokeDashoffset={-flowShift} />}
      {[
        {x: 170, l: 'A', c: C.oilA, on: aActive},
        {x: 600, l: 'B', c: C.oilB, on: bActive},
      ].map((p) => (
        <g key={p.l}>
          <rect x={p.x - 22} y={BARREL.y - 26} width={44} height={26} fill={C.steel} stroke={p.on ? p.c : C.line} strokeWidth={3} />
          <circle cx={p.x} cy={190} r={26} fill={C.bg} stroke={p.on ? p.c : C.line} strokeWidth={4} />
          <text x={p.x} y={202} fill={p.on ? p.c : C.text} fontFamily={MONO} fontSize={32} fontWeight={700} textAnchor="middle">
            {p.l}
          </text>
        </g>
      ))}

      {/* gövde */}
      <rect x={BARREL.x - 30} y={BARREL.y - 14} width={30} height={BARREL.h + 28} fill={C.steel} stroke={C.line} strokeWidth={4} />
      <circle cx={BARREL.x - 52} cy={CY} r={20} fill="none" stroke={C.line} strokeWidth={6} />
      <rect x={BARREL.x} y={BARREL.y} width={BARREL.w} height={BARREL.h} fill="#0c2340" stroke={C.line} strokeWidth={5} />
      {/* A odası */}
      <rect x={BARREL.x} y={inner.y} width={Math.max(0, px - BARREL.x)} height={inner.h} fill={C.oilA} opacity={aActive ? 0.55 : 0.18} />
      {/* B odası (halka) */}
      <rect x={px + PISTON_W} y={inner.y} width={Math.max(0, BARREL.x + BARREL.w - px - PISTON_W)} height={inner.h} fill={C.oilB} opacity={bActive ? 0.55 : 0.15} />
      {/* piston */}
      <rect x={px} y={inner.y} width={PISTON_W} height={inner.h} fill={idx === 1 ? 'url(#hatch)' : C.steel} stroke={idx === 1 ? C.yellow : C.line} strokeWidth={4} />
      {/* mil */}
      <rect x={px + PISTON_W} y={CY - ROD_H / 2} width={ROD_LEN} height={ROD_H} fill="url(#rod)" stroke={idx === 3 ? C.yellow : C.line} strokeWidth={idx === 3 ? 5 : 3} />
      {/* rakor / keçe */}
      <rect x={BARREL.x + BARREL.w} y={CY - ROD_H / 2 - 22} width={34} height={ROD_H + 44} fill={C.steel} stroke={C.line} strokeWidth={4} />
      {/* mil ucu göz */}
      <circle cx={rodEnd + 26} cy={CY} r={30} fill={C.steel} stroke={C.line} strokeWidth={5} />
      <circle cx={rodEnd + 26} cy={CY} r={12} fill={C.bg} />

      {/* ölçü: D */}
      <g opacity={draw} stroke={C.muted} strokeWidth={2} fill={C.muted} fontFamily={MONO} fontSize={26}>
        <line x1={BARREL.x} y1={BARREL.y + BARREL.h + 30} x2={BARREL.x + BARREL.w} y2={BARREL.y + BARREL.h + 30} />
        <text x={BARREL.x} y={BARREL.y + BARREL.h + 66} stroke="none">Ø100 mm</text>
      </g>

      {/* kuvvet okları */}
      <g opacity={arrowOpacity(2)}>
        <Arrow x={Math.min(rodEnd + 66, 870)} y={CY + 140} dir={1} len={70} color={C.yellow} label="12,8 t" o={1} />
      </g>
      <g opacity={arrowOpacity(3)}>
        <Arrow x={700} y={CY + 140} dir={-1} len={70} color={C.oilB} label="8,8 t" o={1} />
      </g>

      {/* manometre */}
      <g>
        <circle cx={GAUGE.x} cy={GAUGE.y} r={GAUGE.r} fill="#0b1f37" stroke={C.line} strokeWidth={6} />
        {Array.from({length: 11}).map((_, i) => {
          const a = ((-135 + i * 27 - 90) * Math.PI) / 180;
          const r1 = GAUGE.r - 10;
          const r2 = GAUGE.r - (i % 2 === 0 ? 28 : 20);
          return (
            <line key={i} x1={GAUGE.x + r1 * Math.cos(a)} y1={GAUGE.y + r1 * Math.sin(a)} x2={GAUGE.x + r2 * Math.cos(a)} y2={GAUGE.y + r2 * Math.sin(a)}
              stroke={i >= 8 ? '#ff5d5d' : C.text} strokeWidth={i % 2 === 0 ? 4 : 2} />
          );
        })}
        <g transform={`rotate(${needle} ${GAUGE.x} ${GAUGE.y})`}>
          <path d={`M${GAUGE.x - 6} ${GAUGE.y + 14} L${GAUGE.x} ${GAUGE.y - GAUGE.r + 22} L${GAUGE.x + 6} ${GAUGE.y + 14} Z`} fill={C.yellow} />
        </g>
        <circle cx={GAUGE.x} cy={GAUGE.y} r={10} fill={C.text} />
        <text x={GAUGE.x} y={GAUGE.y + 52} fill={C.yellow} fontFamily={MONO} fontSize={26} fontWeight={700} textAnchor="middle">
          {Math.round(bar)} bar
        </text>
      </g>

      {/* kesit: alan / halka alan */}
      <g opacity={inset} transform={`translate(830 150) scale(${0.6 + 0.4 * inset})`}>
        <circle r={90} fill={idx === 1 ? 'url(#hatch)' : C.oilB} fillOpacity={idx === 1 ? 1 : 0.55} stroke={C.yellow} strokeWidth={5} />
        {idx === 3 && <circle r={50} fill="url(#rod)" stroke={C.text} strokeWidth={3} />}
        <text y={128} fill={C.yellow} fontFamily={MONO} fontSize={30} fontWeight={700} textAnchor="middle">
          {idx === 1 ? 'A = 78,54 cm²' : 'Ah = 53,91 cm²'}
        </text>
        {idx === 3 && (
          <text y={8} fill={C.bg} fontFamily={MONO} fontSize={24} fontWeight={700} textAnchor="middle">
            Ø56
          </text>
        )}
      </g>
    </svg>
  );
};

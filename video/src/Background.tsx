import {AbsoluteFill} from 'remotion';
import {C} from './theme';

export const Background: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <pattern id="minor" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke={C.grid} strokeWidth="1" />
        </pattern>
        <pattern id="major" width="200" height="200" patternUnits="userSpaceOnUse">
          <rect width="200" height="200" fill="url(#minor)" />
          <path d="M200 0H0V200" fill="none" stroke={C.gridMajor} strokeWidth="1.5" />
        </pattern>
        <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor={C.bg} stopOpacity="0" />
          <stop offset="100%" stopColor="#020a14" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#major)" />
      <rect width="1080" height="1920" fill="url(#vignette)" />
      <rect x="24" y="24" width="1032" height="1872" fill="none" stroke={C.lineDim} strokeWidth="2" />
      {[
        [24, 24, 1, 1],
        [1056, 24, -1, 1],
        [24, 1896, 1, -1],
        [1056, 1896, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + 60 * sy}V${y}H${x + 60 * sx}`} fill="none" stroke={C.line} strokeWidth="5" />
      ))}
    </svg>
  </AbsoluteFill>
);

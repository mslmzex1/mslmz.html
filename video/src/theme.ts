import timeline from './timeline.json';

export const C = {
  bg: '#07172b',
  grid: 'rgba(120,180,255,0.07)',
  gridMajor: 'rgba(120,180,255,0.16)',
  line: '#8fc3ff',
  lineDim: 'rgba(143,195,255,0.45)',
  text: '#e6f1ff',
  muted: '#7f9bbd',
  yellow: '#ffc83d',
  oilA: '#ff7a45',
  oilB: '#3ddc97',
  steel: '#20405f',
};

export const FONT = 'Inter, "DejaVu Sans", sans-serif';
export const MONO = '"DejaVu Sans Mono", monospace';

export type Scene = (typeof timeline.scenes)[number];
export const SCENES = timeline.scenes;

export const sceneAt = (frame: number) => {
  let idx = 0;
  SCENES.forEach((s, i) => {
    if (frame >= s.from) idx = i;
  });
  return idx;
};

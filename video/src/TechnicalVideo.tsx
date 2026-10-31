import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Background} from './Background';
import {Cards} from './Cards';
import {Cylinder} from './Cylinder';
import {Hud} from './Hud';

export const TechnicalVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Cylinder />
    <Cards />
    <Hud />
    <Audio src={staticFile('audio.mp3')} />
  </AbsoluteFill>
);

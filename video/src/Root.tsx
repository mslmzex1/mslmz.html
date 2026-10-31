import {Composition} from 'remotion';
import {TechnicalVideo} from './TechnicalVideo';
import timeline from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TechnicalVideo"
    component={TechnicalVideo}
    durationInFrames={timeline.totalFrames}
    fps={timeline.fps}
    width={1080}
    height={1920}
  />
);

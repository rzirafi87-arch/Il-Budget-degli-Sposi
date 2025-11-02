'use client';
import { Composition } from 'remotion';
import { Player } from '@remotion/player';
import React from 'react';
import SaveTheDateVideo, { SaveTheDateVideoProps } from './SaveTheDateVideo';

// Remotion root used by the Remotion renderer/CLI
// Ensure TS sees the component as a compatible type for Remotion (React 19 vs Remotion v4 typings)
type AnyComponent = React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VideoComponent = SaveTheDateVideo as unknown as AnyComponent;

const DEFAULT_PROPS: SaveTheDateVideoProps = {
  names: 'Nome Sposi',
  date: '28 Ottobre 2025',
  location: 'Location Evento',
  lang: 'it',
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SaveTheDateVideo"
    component={VideoComponent}
    durationInFrames={180}
    fps={30}
    width={1280}
    height={720}
    defaultProps={DEFAULT_PROPS}
  />
);

// Default export: Next.js preview using Remotion Player (provides composition context)
const RemotionPreview: React.FC<SaveTheDateVideoProps> = (props) => (
  <Player
    component={VideoComponent}
    inputProps={props}
    durationInFrames={180}
    fps={30}
    compositionWidth={1280}
    compositionHeight={720}
    controls
    loop
  />
);

export default RemotionPreview;

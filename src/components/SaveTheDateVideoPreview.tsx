"use client";
import { Player } from '@remotion/player';
import { SaveTheDateVideo } from './SaveTheDateVideo';

export default function SaveTheDateVideoPreview(props: any) {
  return (
    <Player
      component={SaveTheDateVideo}
      durationInFrames={150}
      fps={30}
      compositionWidth={800}
      compositionHeight={450}
      inputProps={props}
    />
  );
}

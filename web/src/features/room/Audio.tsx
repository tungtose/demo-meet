import { useEffect, useRef } from "react";

interface IAudio {
  volume: number;
  key: any;
  playsInline: boolean
  controls: boolean
  onRef: Function
}

const Audio = (props: IAudio): JSX.Element => {
  const { volume, key, playsInline, controls, onRef } = props;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div>
      <audio
        key={key}
        playsInline={playsInline}
        controls={controls}
        ref={r => {
          if (!!r && !audioRef.current) {
            audioRef.current = r;
            onRef(r);
          }
        }}
      />
    </div>
  );
};

export default Audio;

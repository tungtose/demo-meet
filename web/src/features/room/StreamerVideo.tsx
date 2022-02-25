import { Box, HStack, Text } from '@chakra-ui/react';
import { useRef, useEffect } from 'react';

interface IStreammerVideo {
  track: any
  width: string | number;
  height: string | number;
  userName?: string | undefined;
}

function StreammerVideo(props: IStreammerVideo) {
  const { track, width, height, userName } = props;
  const videoRefs = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!track) return;
    const videoElement = videoRefs.current;
    if (!videoElement) return;
    const stream = new MediaStream();
    stream.addTrack(track);
    videoElement.srcObject = stream;
    videoElement.play().catch(error => console.log('Cant play video: ', error));
  }, [track]);

  return (
    <Box display="flex" alignItems="center" borderRadius="2xl" overflow="hidden">
      <HStack pos="absolute" bottom={0} p={2} pb={4} >
        <Text as="b" color="cyan.200">{userName || 'Unknown'}</Text>
      </HStack>
      <video
        style={{ backgroundColor: 'black', padding: 0 }}
        width={width}
        height={height}
        autoPlay
        playsInline
        ref={videoRefs}
        muted={true}
        controls={false}
      />
    </Box>
  );
};

export default StreammerVideo;

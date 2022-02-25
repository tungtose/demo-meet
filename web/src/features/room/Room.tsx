import React, { useEffect, useState, useRef } from 'react';
import { Button, HStack, VStack } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import { useStore } from './store';
import { RoomController } from './useRoomSocket';
import { useMyWebcamStore } from './store/useMyWebcam';
import { InitWS } from './InitWS';
import Audio from './Audio';
import WSProvider from './wsProvider';
import { useRouter } from 'next/router';
import ControlBar from './ControlBar';
import StreamerVideo from './StreamerVideo';
import VideoLayout from './VideoLayout';

export const Room = () => {
  const router = useRouter();
  const { slug } = router.query;
  const notAllowedErrorCountRef = useRef(0);
  const { audioConsumerMap, setAudioRef, videoConsumerMap, setRoomId, setPeerId, peerId, roomId } = useStore();
  const { track } = useMyWebcamStore();
  const [showAutoPlayModal, setShowAutoPlayModal] = useState(false);
  const audioRefs = useRef<any>([]);

  useEffect(() => {
    setRoomId(slug);
    if (!peerId)
      setPeerId(nanoid(4));
  }, [slug, peerId])

  if (!roomId || !peerId) return null;
  return (
    <InitWS>
      <VStack h="100vh" w="full">
        <RoomController />
        {Object.keys(audioConsumerMap).map(k => {
          const { consumer } = audioConsumerMap[k];
          if (!consumer) return null;
          return (
            <Audio
              volume={1}
              playsInline
              controls={false}
              key={k}
              onRef={(a: any) => {
                setAudioRef(k, a);
                audioRefs.current.push([k, a]);
                a.srcObject = new MediaStream([consumer.track]);
                // prevent modal from showing up more than once in a single render cycle
                const notAllowedErrorCount = notAllowedErrorCountRef.current;
                a.play().catch((error: any) => {
                  if (
                    error.name === 'NotAllowedError' &&
                    notAllowedErrorCountRef.current === notAllowedErrorCount
                  ) {
                    notAllowedErrorCountRef.current++;
                    setShowAutoPlayModal(true);
                  }
                  console.warn('audioElem.play() failed:%o', error);
                });
              }}
            />
          );
        })}
        {/* ME */}
        <HStack pos="absolute" p={4} bottom={10} left={0} w="full" justifyContent="end">
          <StreamerVideo track={track} width={180} height={200} />
        </HStack>
        <VideoLayout />
        <ControlBar />
      </VStack>
    </InitWS>
  );
};

export default Room;

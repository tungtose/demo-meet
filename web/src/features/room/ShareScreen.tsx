import React, { useCallback, useContext, useEffect } from 'react';
import { Box, IconButton } from '@chakra-ui/react';
import { MdCamera, MdMessage, MdVideocam } from 'react-icons/md';
import useStore from './store';
import { WebSocketContext } from './wsProvider';
import { SCREEN_SHARING_SVC_ENCODINGS } from './config';

function ShareScreen() {
  const {
    screenProducer,
    addScreenProducer,
    isShareScreen,
    setIsShareScreen,
    // sendTransport
  } = useStore();

  const { connection } = useContext(WebSocketContext);

  useEffect(() => {
    if (isShareScreen) {
      // TODO: add toast here
      return;
    }

    if (!connection) return;

  }, [])

  const handleShareScreen = useCallback(async () => {
    if (isShareScreen) {
      // TODO: add toast here
      return;
    }

    if (!connection) return;
    const shareScreenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        aspectRatio: 1.777, // 16:9
        frameRate: 24
      },
      audio: true,
    });

    const { sendTransport } = useStore.getState();
    if (!sendTransport) {
      // TODO: notify need > 1 user to using sharescreen
      return;
    }

    const [track] = shareScreenStream.getVideoTracks();
    await sendTransport.produce({
      track,
      encodings: SCREEN_SHARING_SVC_ENCODINGS,
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
      appData: {
        mediaTag: 'screensharing'
      }
    })

  }, [connection])

  return (
    <Box>
      <IconButton
        aria-label="share-screen"
        onClick={handleShareScreen}
        icon={<MdVideocam />}
        isRound={true}
        color={true ? "cyan.100" : "gray"}
        size="lg"
      />

    </Box>
  )
}


export default ShareScreen;

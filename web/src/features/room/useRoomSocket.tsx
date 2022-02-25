import { useEffect, useContext, useCallback } from 'react';
import useStore from './store';
import { useMyWebcamStore } from './store/useMyWebcam';
import { SCREEN_SHARING_SVC_ENCODINGS, VIDEO_CONSTRAINS, VIDEO_SIMULCAST_ENCODINGS } from './config';
import { WebSocketContext } from './wsProvider';
import { createTransport } from './createTransport';
import { loadDevice } from './loadDevice';
import { Button } from '@chakra-ui/react';
import { consumeData } from './consumeData';


export function RoomController() {
  const { connection } = useContext(WebSocketContext);
  const { closePeer, device, roomId, peerId } = useStore();
  const { addTrack } = useMyWebcamStore();

  const getLogs = useCallback(() => {
    if (!connection) return;

    connection.emit('debug-room', { peerId: connection.id });
  }, [connection]);

  useEffect(() => {
    if (!connection || !roomId || !peerId) return;

    const roomSocket = connection;

    roomSocket.on('room-state', data => {
      console.log('====ROOMS', data);
    });

    console.log("==== DEBUG:", "checking running", roomId, peerId)
    roomSocket.emit('join-room', {
      roomId,
      peerId
    });

    roomSocket.on('peer-leave-room', ({ peerId }) => {
      closePeer(peerId);
    });

    roomSocket.on('joined-room', async data => {
      console.log('Joined:', data);
      const { roomId, routerRtpCapabilities, recvTransportOptions, sendTransportOptions } = data;

      await loadDevice(routerRtpCapabilities);

      // Create transport!!!
      try {
        await createTransport({
          roomSocket: roomSocket,
          transportOptions: sendTransportOptions,
          direction: 'send',
          roomId,
          peerId
        });
      } catch (error) {
        console.log(error);
      }

      try {
        const { sendTransport } = useStore.getState();
        let videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...VIDEO_CONSTRAINS['qvga'],
            frameRate: 24
          }
        });

        const [track] = videoStream.getVideoTracks();

        if (!track) console.error('NOT FOUND ANY VIDEO TRACK!!!');

        // Stream to local
        addTrack(track);

        await sendTransport.produce({
          track,
          encodings: [{ maxBitrate: 100000 }, { maxBitrate: 300000 }, { maxBitrate: 900000 }],
          codecOptions: {
            videoGoogleStartBitrate: 1000
          },
          appData: {
            mediaTag: 'webcam'
          }
        });

        let micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const audioTracks = micStream.getAudioTracks();
        if (audioTracks.length) {
          console.log('creating producer...');
          const [track] = audioTracks;
          const audioProducer = await sendTransport.produce({
            track,
            appData: { mediaTag: 'cam-audio' }
          });
        }
      } catch (error) {
        console.log(error);
        return;
      }

      // RECEIVE TRANSPORT!!!
      await createTransport({
        roomSocket,
        transportOptions: recvTransportOptions,
        direction: 'recv',
        roomId,
        peerId
      });

      // RECEIVE VOICE
      roomSocket.on('@get-recv-tracks-done', async data => {
        try {
          const { consumerParametersArr, peerId } = data;
          for (const { peerId, consumerParameters } of consumerParametersArr) {
            const consume = await consumeData(consumerParameters, peerId);
            if (consume?.id)
              roomSocket.emit('resume-consumer', { roomId, peerId, consumerId: consume.id });
          }
        } catch (error) {
          console.log(error);
        }
      });
      roomSocket.emit('@get-recv-tracks', {
        roomId,
        peerId,
        rtpCapabilities: device.rtpCapabilities
      });
    });
    // END OF EVENT JOIN ROOM!!!

    roomSocket.on('share-screen', async data => {
      const shareScreenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          aspectRatio: 1.777, // 16:9
          frameRate: 24
        },
        audio: true,
      });

      const { sendTransport } = useStore.getState();

      const [track] = shareScreenStream.getVideoTracks();
      await sendTransport.produce({
        track,
        encodings: SCREEN_SHARING_SVC_ENCODINGS,
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
        appData: {
          mediaTag: 'screen-sharing'
        }
      })
    });

    roomSocket.on('new-peer-consumer', async data => {
      console.log('HI IM GET DATA', data);
      const { consumerParameters, peerId } = data;
      const { recvTransport } = useStore.getState();
      if (recvTransport) {
        const consume = await consumeData(consumerParameters, peerId)!;
        if (consume?.id)
          roomSocket.emit('resume-consumer', { roomId, peerId, consumerId: consume.id });
      }
    });

    const cleanSocket = () => {
      console.log('CLEANING!!!');
      roomSocket.disconnect();
    };

    return cleanSocket;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, roomId, peerId]);

  return null;
  // return <Button onClick={getLogs}>GET LOGS</Button>;
}

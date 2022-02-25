import { Transport } from 'mediasoup-client/lib/Transport';
import useStore from './store';

export const consumeData = async (consumerParameters: any, peerId: string) => {
  try {
    const {
      recvTransport,
      addSharescreenConsumer,
      addVideoConsumer,
      addAudioConsumer
    } = useStore.getState();

    const consume: Transport = await recvTransport.consume({
      ...consumerParameters,
      appData: {
        peerId,
        producerId: consumerParameters.producerId,
        mediaTag: consumerParameters.kind === 'video' ? 'webcam' : 'cam-audio'
      }
    });
    // send data to store...
    if (consumerParameters.kind === 'video') {
      addVideoConsumer(consume, peerId);
    }
    if (consumerParameters.kind === 'audio') {
      addAudioConsumer(consume, peerId);
    }

    if (consumerParameters.kind === 'sharescreen') {
      addSharescreenConsumer(consume, peerId);
    }

    return consume;
  } catch (error) {
    console.error("Can't consume data", error);
  }
};

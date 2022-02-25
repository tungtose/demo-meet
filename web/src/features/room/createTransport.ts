import { DtlsParameters, Transport, TransportOptions } from 'mediasoup-client/lib/Transport';
import useStore from './store';

interface ICreateTransport {
  roomSocket: any;
  transportOptions: TransportOptions;
  direction: 'send' | 'recv';
  roomId: string;
  peerId: string;
}

export async function createTransport({ roomSocket, transportOptions, direction, roomId, peerId }: ICreateTransport) {
  try {
    const { device, updateRecvTransport, updateSendTransport } = useStore.getState();

    console.log(`create ${direction} transport`);
    console.log('transport options', transportOptions);

    const transport: Transport =
      direction === 'send'
        ? await device.createSendTransport(transportOptions)
        : await device.createRecvTransport(transportOptions);

    transport.on('connect', ({ dtlsParameters }, callback, errback) => {
      roomSocket.on(`@connect-transport-${direction}-done`, (data: any) => {
        if (data.error) {
          console.log(`connect-transport ${direction} failed`, data.error);
          if (data.error.includes('already called')) {
            callback();
          } else {
            errback();
          }
        } else {
          console.log(`connect-transport ${direction} success`);
          callback();
        }
      });

      roomSocket.emit(
        `@connect-transport`,
        {
          transportId: transportOptions.id,
          dtlsParameters,
          direction,
          roomId,
          peerId
        },
        () => console.log('error on connect transport!!!')
      );
    });

    if (direction === 'send') {
      transport.on('produce', ({ kind, rtpParameters, appData }, callback, errback) => {
        roomSocket.on(`@send-track-${direction}-done`, (data: any) => {
          if (data.error) {
            console.log(`send-track ${direction} failed`, data.error);
            errback();
          }
          console.log(`send-track-transport ${direction} success`);
          callback({ id: data.id });
        });

        roomSocket.emit(
          '@send-track',
          {
            transportId: transportOptions.id,
            kind,
            rtpParameters,
            rtpCapabilities: device.rtpCapabilities,
            paused: false,
            appData,
            direction,
            roomId,
            peerId
          },
          (error: any) => console.log(error)
        );
      });
    }

    transport.on('connectionstatechange', state => {
      console.log(`${direction} transport ${transport.id} connectionstatechange ${state}`);
    });

    if (direction === 'recv') updateRecvTransport(transport);
    else updateSendTransport(transport);
  } catch (error) {
    console.error(error);
  }
}

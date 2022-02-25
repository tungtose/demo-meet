import { Device } from 'mediasoup-client';
import { detectDevice } from 'mediasoup-client/lib/types';

export const getDevice = () => {
  try {
    let handlerName = detectDevice();
    if (!handlerName) {
      console.warn('mediasoup does not recognize this device, so ben has defaulted it to Chrome74');
      handlerName = 'Chrome74';
    }
    return new Device({ handlerName });
  } catch (error) {
    console.error(error)
    return null;
  }
};

export const rtcSlice = (set, get) => ({
  recvTransport: null,
  sendTransport: null,
  device: getDevice(),

  nullify: () =>
    set({
      recvTransport: null,
      sendTransport: null,
      roomId: '',
      mic: null,
      micStream: null
    }),

  updateRecvTransport: recvTransport => {
    set(state => ({ ...state, recvTransport }));
  },
  updateSendTransport: sendTransport => {
    set(state => ({ ...state, sendTransport }));
  }
});

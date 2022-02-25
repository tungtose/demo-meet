import { MyPeer } from './peer';

export const closePeer = (state: MyPeer) => {
  state.producers.forEach(producer => producer.close());
  state.recvTransport?.close();
  state.sendTransport?.close();
  state.consumers.forEach(consumers => consumers.close());
};

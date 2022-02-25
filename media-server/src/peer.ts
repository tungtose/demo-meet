import { Consumer, Producer, Transport } from "mediasoup/node/lib/types";

export type MyPeer = {
  socketId: string | null;
  sendTransport: Transport | null;
  recvTransport: Transport | null;
  producers: Producer[];
  consumers: Consumer[];
};
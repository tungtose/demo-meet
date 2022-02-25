import { Router, Worker } from 'mediasoup/node/lib/types';
import { MyPeer } from './peer';

export type Then<T> = T extends PromiseLike<infer U> ? U : T;

export type MyRoomState = Record<string, MyPeer>;

export type Chat = {
  date: Date;
  by: string;
  content: string;
};

export type MyRooms = Record<
  string,
  {
    worker: Worker;
    router: Router;
    state: {
      // peerId
      host: string
      peer: MyRoomState;
      chatHistory: Chat[];
      isShareScreen: boolean;
    };
  }
>;

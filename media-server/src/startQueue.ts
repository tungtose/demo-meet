import { DtlsParameters, MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup/node/lib/types';
import { Consumer } from './createConsumer';
import { TransportOptions } from './createTransport';

type VoiceSendDirection = 'recv' | 'send';

export interface HandlerDataMap {
  'remove-speaker': { roomId: string; peerId: string };
  'destroy-room': { roomId: string };
  'close-peer': { roomId: string; peerId: string; kicked?: boolean };
  '@get-recv-tracks': {
    roomId: string;
    peerId: string;
    rtpCapabilities: RtpCapabilities;
  };
  '@send-track': {
    roomId: string;
    peerId: string;
    transportId: string;
    direction: VoiceSendDirection;
    paused: boolean;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    rtpCapabilities: RtpCapabilities;
    appData: any;
  };
  '@connect-transport': {
    roomId: string;
    dtlsParameters: DtlsParameters;
    peerId: string;
    direction: VoiceSendDirection;
  };
  '@resume': {
    roomId: string;
    peerId: string;
  }
  'create-room': {
    roomId: string;
    peerId: string;
  };
  'add-speaker': {
    roomId: string;
    peerId: string;
  };
  'join-room': {
    roomId: string;
    peerId: string;
  };
  'join-as-new-peer': {
    roomId: string;
    peerId: string;
  };
}

// export type SocketEvent =
//   | 'close-peer'
//   | 'destroy-room'
//   | 'create-room'
//   | 'join-as-new-peer'
//   | 'join-as-speaker'
//   | 'add-speaker'
//   | '@connect-transport'
//   | '@get-recv-tracks'
//   | '@send-track';

export let send = <Key extends keyof OutgoingMessageDataMap>(_obj: OutgoingMessage<Key>) => { };

export type HandlerMap = {
  [Key in keyof HandlerDataMap]: (
    d: HandlerDataMap[Key],
    uid: string,
    send: <Key extends keyof OutgoingMessageDataMap>(obj: OutgoingMessage<Key>) => void,
    errBack: () => void
  ) => void;
};

export type SocketEvent = keyof HandlerDataMap;
export type SocketEmit = keyof OutgoingMessageDataMap;
type SendTrackDoneOperationName = `@send-track-${VoiceSendDirection}-done`;
type ConnectTransportDoneOperationName = `@connect-transport-${VoiceSendDirection}-done`;

export type OutgoingMessageDataMap = {
  'joined-room': {
    roomId: string;
    peerId: string;
    routerRtpCapabilities: RtpCapabilities;
    recvTransportOptions: TransportOptions;
    sendTransportOptions: TransportOptions;
  };
  error: string;
  'room-created': {
    roomId: string;
    peerId: string;
  };
  '@get-recv-tracks-done': {
    consumerParametersArr: Consumer[];
    roomId: string;
  };
  'close_consumer': {
    producerId: string;
    roomId: string;
  };
  'new-peer-consumer': {
    roomId: string;
  } & Consumer;
  you_left_room: {
    roomId: string;
    kicked: boolean;
  };
  'you-are-now-a-speaker': {
    sendTransportOptions: TransportOptions;
    roomId: string;
  };
  'you-joined-as-peer': {
    roomId: string;
    peerId: string;
    routerRtpCapabilities: RtpCapabilities;
    recvTransportOptions: TransportOptions;
  };
} & {
    [Key in SendTrackDoneOperationName]: {
      error?: string;
      id?: string;
      roomId: string;
    };
  } & {
    [Key in ConnectTransportDoneOperationName]: {
      error?: string;
      roomId: string;
    };
  };

type OutgoingMessage<Key extends keyof OutgoingMessageDataMap> = {
  op: Key;
  d: OutgoingMessageDataMap[Key];
} & ({ uid: string } | { rid: string });

interface IncomingChannelMessageData<Key extends keyof HandlerMap> {
  op: Key;
  d: HandlerDataMap[Key];
  uid: string;
}

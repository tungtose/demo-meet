import {
  RtpCodecCapability,
  TransportListenIp,
  WorkerLogTag,
} from 'mediasoup/node/lib/types';

export const config = {
  // http server ip, port, and peer timeout constant
  sslKey: '../src/certs/key.pem',
  sslCrt: '../src/certs/cert.pem',
  httpIp: process.env.LISTEN_IP,
  httpPort: process.env.PORT,
  httpPeerStale: 360000,

  mediasoup: {
    worker: {
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: 'debug',
      logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp',
        // 'rtx',
        // 'bwe',
        // 'score',
        // 'simulcast',
        // 'svc'
      ] as WorkerLogTag[],
    },
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000,
          },
        },
        {
          kind: 'video',
          mimeType: 'video/VP9',
          clockRate: 90000,
          parameters: {
            'profile-id': 2,
            'x-google-start-bitrate': 1000,
          },
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '4d0032',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000,
          },
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000,
          },
        },
      ] as RtpCodecCapability[],
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on localhost
    webRtcTransport: {
      listenIps: [
        {
          ip: process.env.LISTEN_IP,
          announcedIp: process.env.ANNOUNCED_IP,
        },
      ] as TransportListenIp[],
      initialAvailableOutgoingBitrate: 800000,
      minimumAvailableOutgoingBitrate: 600000,
      // Additional options that are not part of WebRtcTransportOptions.
      maxIncomingBitrate: 1500000,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    },
    listenIp: process.env.LISTEN_IP,
    listenPort: process.env.PORT,
  },
} as const;

import 'dotenv/config';
import path from 'path';
import { Router, Worker } from 'mediasoup/node/lib/types';
import { MyRooms } from './RoomState';
import { closePeer } from './closePeer';
import { createConsumer } from './createConsumer';
import { createTransport, transportToOptions } from './createTransport';
import { deleteRoom } from './deleteRoom';
import { startMediasoup } from './startServer';
import {
  SocketEvent,
  HandlerDataMap,
  OutgoingMessageDataMap,
  SocketEmit,
} from './startQueue';
import Logger from './utils/Logger';
import fs from 'fs';
import https from 'https';
import http from 'http';
import express from 'express';
import { config } from './config';
import { Server as SocketIO } from 'socket.io';

const log = new Logger('Main');

var rooms: MyRooms = {};

async function runExpressApp() {
  log.info('IAM RUNNING!!!!');
  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(express.static(__dirname));

  expressApp.use((error: any, req: any, res: any, next: Function) => {
    if (error) {
      console.warn('Express app error,', error.message);
      error.status = error.status || (error.name === 'TypeError' ? 400 : 500);

      res.statusMessage = error.message;
      res.status(error.status).send(String(error));
    } else {
      next();
    }
  });
  return expressApp;
}

async function createWebServer(expressApp: express.Express) {
  console.log("ENV:", process.env.ENV);
  if (process.env.ENV === 'production') {
    return http.createServer(expressApp);
  }

  const { sslKey, sslCrt } = config;
  const sslKeyPath = path.resolve(__dirname, sslCrt);
  const sslCrtPath = path.resolve(__dirname, sslKey);
  console.log("=== sslKeyPath", sslKeyPath);
  if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCrtPath)) {
    console.error('SSL files are not found. check your config.js file');
    process.exit(0);
  }
  const tls = {
    cert: fs.readFileSync(sslKeyPath),
    key: fs.readFileSync(sslCrtPath),
  };
  return https.createServer(tls, expressApp);
}

async function runWebServer() {
  const expressApp = await runExpressApp();

  expressApp.use('/ping', (req, res) => res.send('Pong'));

  const webServer = await createWebServer(expressApp);

  webServer.on('error', (err) => {
    console.error('starting web server failed:', err.message);
  });

  await new Promise<void>(resolve => {
    const { httpIp, httpPort } = config;
    webServer.listen(httpPort, () => {
      const listenIps = config.mediasoup.webRtcTransport.listenIps[0];
      const ip = listenIps.announcedIp || listenIps.ip;
      console.log('server is running');
      console.log(`open https://${ip}:${httpPort} in your web browser`);
      resolve();
    });
  });

  return webServer;
}

async function getWorkers() {
  let workers: Array<{
    worker: Worker;
    router: Router;
  }>;

  try {
    workers = await startMediasoup();

    return workers;
  } catch (error: any) {
    log.error('get workers', error.message);
    throw error;
  }
}

export async function main() {
  const workers = await getWorkers();
  let workerIdx = 0;

  const getNextWorker = () => {
    const w = workers[workerIdx];
    workerIdx++;
    workerIdx %= workers.length;
    return w;
  };

  const getRoom = (roomId: string, peerId: string) => {
    if (!rooms[roomId]) {
      const { worker, router } = getNextWorker();
      rooms[roomId] = {
        worker,
        router,
        state: { peer: {}, chatHistory: [], host: peerId, isShareScreen: false },
      };
      return rooms[roomId];
    }
    return rooms[roomId];
  };

  const webServer = await runWebServer();

  const socketIO = new SocketIO(webServer, {
    serveClient: false,
  });

  socketIO.on('connection', socket => {

    socket.on<SocketEvent>('create-room', async (data: HandlerDataMap['create-room']) => {
      const { roomId, peerId } = data;
      const room = getRoom(roomId, peerId);
      console.log('Created A ROOM:', roomId);
      socket.emit<SocketEmit>('room-created', {
        roomId,
        peerId,
      } as OutgoingMessageDataMap['room-created']);
    });

    socket.on('disconnect', () => {
      // Find and close peer
      const getPeerBySocketId = (socketId: string) => {
        for (const roomId of Object.keys(rooms)) {
          const peerMap = rooms[roomId].state.peer;
          const peerId = Object.keys(peerMap).find(peerId => peerMap[peerId].socketId === socketId)
          if (peerId) return { peerId, roomId };
        }
        return { peerId: null, roomId: null }
      }

      const { peerId, roomId } = getPeerBySocketId(socket.id);
      if (peerId && roomId) {
        const state = rooms[roomId].state.peer[peerId];
        if (state) {
          log.warn('FOUND ANC CLOSING PEER:', peerId);
          closePeer(state);
        }
        socket.to(roomId).emit('peer-leave-room', { peerId });
        // if (Object.keys(rooms[roomId].state).length === 0) deleteRoom(roomId, rooms);
      }
    });

    socket.on<SocketEvent>('@get-recv-tracks', async (data, callback) => {
      const { roomId, rtpCapabilities, peerId } = data;

      if (!rooms[roomId]?.state.peer[peerId].recvTransport) {
        console.log('Not found any recvTransport', { peerId, roomId });
        callback();
        return;
      }

      const { state, router } = rooms[roomId];
      const transport = state.peer[peerId].recvTransport;
      if (!transport) {
        callback();
        return;
      }

      const consumerParametersArr = [];

      for (const theirPeerId of Object.keys(state.peer)) {
        const peerState = state.peer[theirPeerId];
        if (!peerState || peerState.producers.length === 0 || theirPeerId === peerId) {
          continue;
        }
        try {
          const { producers } = peerState;
          for (const producer of producers) {
            const consumer = await createConsumer(
              router,
              producer,
              rtpCapabilities,
              transport,
              peerId,
              state.peer[theirPeerId]
            );
            consumerParametersArr.push(consumer);
          }
          log.info('PRODUCERS:', producers);
        } catch (e: any) {
          console.log(e.message);
          continue;
        }
      }

      socket.emit<SocketEmit>('@get-recv-tracks-done', {
        consumerParametersArr,
        roomId,
        peerId,
      });
    });

    socket.on<SocketEvent>(
      '@send-track',
      async (data: HandlerDataMap['@send-track'], callback) => {
        const {
          roomId,
          transportId,
          direction,
          peerId,
          kind,
          rtpParameters,
          rtpCapabilities,
          paused,
          appData,
        } = data;

        if (!(roomId in rooms)) {
          console.log('room:', { rooms: Object.keys(rooms), roomId });
          callback({ error: 'not found any with given roomId', rooms });
          return;
        }

        const { state } = rooms[roomId];

        const { sendTransport } = state.peer[peerId];
        const transport = sendTransport;

        if (!transport) {
          callback({ error: 'not found transport!' });
          return;
        }

        try {
          const producer = await transport.produce({
            kind,
            rtpParameters,
            paused,
            appData: { ...appData, peerId, transportId },
          });

          if (appData.mediaTag === 'sharescreen') {
            rooms[roomId].state.isShareScreen = true;

          }
          rooms[roomId].state.peer[peerId].producers?.push(producer);

          for (const theirPeerId of Object.keys(state.peer)) {
            if (theirPeerId === peerId) {
              continue;
            }
            const peerTransport = state.peer[theirPeerId]?.recvTransport;
            if (!peerTransport) {
              continue;
            }
            try {
              const consumerData = await createConsumer(
                rooms[roomId].router,
                producer,
                rtpCapabilities,
                peerTransport,
                peerId,
                state.peer[peerId]
              );

              const socketId = state.peer[theirPeerId].socketId;
              if (socketId) {
                socket.to(socketId).emit<SocketEmit>('new-peer-consumer', {
                  ...consumerData,
                  roomId,
                });
                log.info('SENDED NEW PEER SPEAKER!', theirPeerId);
              } else {
                log.error('not found socket id', { theirPeerId, roomId });
              }
            } catch (error) {
              if (error instanceof Error) log.error(error.message);
            }
          }

          socket.emit<SocketEmit>(`@send-track-${direction}-done`, {
            id: producer.id,
            roomId,
          });
        } catch (error: any) {
          log.error(error.message);
          socket.emit<SocketEmit>(`@send-track-${direction}-done`, {
            error: error.message,
            roomId,
          });

          socket.emit<SocketEmit>('error', {
            error: 'error connecting to voice server |' + error.message,
          });

          return;
        }
      }
    );

    socket.on<SocketEvent>(
      '@connect-transport',
      async (data: HandlerDataMap['@connect-transport'], callback) => {
        const { roomId, dtlsParameters, direction, peerId } = data;
        log.info(roomId);
        if (!rooms[roomId]?.state.peer[peerId]) {
          log.error('not found room with peer', { roomId, peerId });
          callback();
          return;
        }
        const { state } = rooms[roomId];
        const transport =
          direction === 'recv'
            ? state.peer[peerId].recvTransport
            : state.peer[peerId].sendTransport;

        if (!transport) {
          console.log('not found transport', { roomId, peerId });
          callback();
          return;
        }

        log.info('connect-transport', peerId, transport.appData);

        try {
          await transport.connect({ dtlsParameters });
          socket.emit<SocketEmit>(`@connect-transport-${direction}-done`, {
            roomId,
          });
        } catch (error: any) {
          log.error('connect-transport', error.message);

          socket.emit<SocketEmit>(`@connect-transport-${direction}-done`, {
            error: error.message,
            roomId,
          });
          socket.emit<SocketEmit>('error', {
            error: 'error connecting to voice server |' + error.message,
          });
        }
      }
    );

    socket.on<SocketEvent>(
      'join-room',
      async (data: HandlerDataMap['join-room'], callback: Function) => {
        const { roomId, peerId } = data;
        if (!roomId || !peerId) {
          log.error("Missing roomId or peerId");
          return;
        }
        socket.join(roomId);
        const { state, router } = rooms[roomId];
        const [recvTransport, sendTransport] = await Promise.all([
          createTransport('recv', router, peerId),
          createTransport('send', router, peerId),
        ]);
        if (state.peer[peerId]) {
          closePeer(state.peer[peerId]);
        }

        rooms[roomId].state.peer[peerId] = {
          socketId: socket.id,
          recvTransport: recvTransport,
          sendTransport: sendTransport,
          consumers: [],
          producers: [],
        };
        const routerRtpCapabilities = rooms[roomId].router.rtpCapabilities;
        const recvTransportOptions = transportToOptions(recvTransport);
        const sendTransportOptions = transportToOptions(sendTransport);

        socket.emit<SocketEmit>('joined-room', {
          roomId,
          peerId,
          routerRtpCapabilities,
          recvTransportOptions,
          sendTransportOptions,
        });
      }
    );

    socket.on('resume-consumer', async data => {
      try {
        const { roomId, peerId, consumerId } = data;

        log.info('data resume consumer:', data);

        const consumer = rooms[roomId].state.peer[peerId].consumers.find(
          (consumer: any) => consumer.id === consumerId
        );
        await consumer?.resume();
      } catch (error: any) {
        log.error('error on resume consumer:', error);
      }
    });

    socket.on('debug-room', ({ peerId }) => {
      socket.emit('room-state', { msg: 'HIHIHI', rooms });
    });

    socket.on('send-new-message', async (data) => {
      try {
        const { content, by, roomId } = data;
        const date = new Date();
        log.info("send new message: %o", data);

        rooms[roomId].state.chatHistory.push({ content, by, date });

        socket.to(roomId).emit("new-message", { content, by, date });

      } catch (error: any) {
        log.error("error on send-new-message: ", error);
      }
    })

    socket.on('get-room-message', async (data) => {
      log.info("get-room-message", data)
      const { roomId } = data;
      if (!rooms[roomId]) return;
      const chatHistory = rooms[roomId].state.chatHistory;
      socket.emit('room-message', chatHistory);
    })
  });

}

import React, { useRef, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import socketIO, { Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';


interface IWsProvider {
  shouldConnect: boolean;
  children: ReactNode;
}

interface IWebSocketProvider {
  connection: Socket | null;
  setConnection: Function;
  isConnecting: boolean;
}

/**
 * connection: ws connection
 * setConnection: update ws connection
 */
export const WebSocketContext = React.createContext<IWebSocketProvider>({
  connection: null,
  // setUser: () => {},
  setConnection: () => { },
  isConnecting: true
});

function wsProvider({ shouldConnect, children }: IWsProvider) {
  const isConnecting = useRef(false);
  const [connection, setConnection] = useState<Socket | null>(null);
  const [socketUrl, setSocketUrl] = useState(SOCKET_URL);

  useEffect(() => {
    console.log("socketUrl, ", socketUrl);
    if (!isConnecting.current && !connection) {
      isConnecting.current = true;
      const socket = socketIO(socketUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      socket.on('connect', async () => {
        console.log('new socket connected: ', socket.id);
        setConnection(socket);
      });

      socket.on('disconnect', () => {
        console.log('TODO: handle disconnection!');
      });
    }
  }, [connection]);

  return (
    <WebSocketContext.Provider
      value={useMemo(
        () => ({
          connection,
          setConnection,
          isConnecting: isConnecting.current,
          setSocketUrl
        }),
        [connection]
      )}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export default wsProvider;

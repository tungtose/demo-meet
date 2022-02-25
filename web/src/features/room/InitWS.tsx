import React, { ReactNode, useContext } from 'react';
import { WebSocketContext } from './wsProvider';

interface IInitWS {
  children: ReactNode;
}

export const InitWS = ({ children }: IInitWS) => {
  const { connection } = useContext(WebSocketContext);

  if (!connection) {
    return <div>Init WebSocket...</div>;
  }

  return <>{children}</>;
};

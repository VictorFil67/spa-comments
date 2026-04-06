import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Comment } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL
  || (import.meta.env.DEV ? 'http://localhost:3010' : window.location.origin);

export function useSocket(onNewComment: (comment: Comment) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('newComment', (comment: Comment) => {
      onNewComment(comment);
    });

    return () => {
      socket.disconnect();
    };
  }, [onNewComment]);

  return socketRef;
}

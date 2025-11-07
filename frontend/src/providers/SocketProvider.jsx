import { useEffect } from 'react';
import { initializeSocket } from '@/store/slices/socketThunks.js';

const SocketProvider = ({ children }) => {
  useEffect(() => {
    const cleanup = initializeSocket();
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  return children;
};

export default SocketProvider;

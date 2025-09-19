import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeSocket } from '../features/socket/socketThunks.js';

const SocketProvider = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const cleanup = dispatch(initializeSocket());
        return () => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        };
    }, [dispatch]);

    return children;
};

export default SocketProvider;

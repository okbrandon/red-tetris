import { ANIMATION_MS } from '@/components/Notification/Notification.styles';
import { hideNotification } from '@/store/slices/notificationSlice';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useNotification = () => {
  const { isVisible, duration, id } = useSelector(
    (state) => state.notification
  );
  const [shouldRender, setShouldRender] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isVisible) return undefined;
    const timeout = setTimeout(() => {
      dispatch(hideNotification());
    }, duration);
    return () => clearTimeout(timeout);
  }, [dispatch, duration, id, isVisible]);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => setIsOpen(true));
      return () => cancelAnimationFrame(raf);
    }

    if (!shouldRender) return undefined;

    setIsOpen(false);
    const timeout = setTimeout(() => setShouldRender(false), ANIMATION_MS);
    return () => clearTimeout(timeout);
  }, [isVisible, shouldRender, setIsOpen]);

  return { isOpen, shouldRender };
};

export default useNotification;

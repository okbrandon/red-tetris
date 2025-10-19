import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../features/notification/notificationSlice';
import {
  NotificationShell,
  Label,
  Message,
  Content,
  DismissButton,
  accentByType,
  ANIMATION_MS,
} from './Notification.styled.js';

const Notification = () => {
  const dispatch = useDispatch();
  const { isVisible, message, type, duration, id } = useSelector((state) => state.notification);
  const [shouldRender, setShouldRender] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
  }, [isVisible, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  const variant = accentByType[type] ? type : 'info';
  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <NotificationShell role={role} aria-live="assertive" $variant={variant} $open={isOpen}>
      <Content>
        <Label $variant={variant}>{variant}</Label>
        <Message>{message}</Message>
      </Content>
      <DismissButton onClick={() => dispatch(hideNotification())} aria-label="Dismiss notification">
        ×
      </DismissButton>
    </NotificationShell>
  );
};

export default Notification;

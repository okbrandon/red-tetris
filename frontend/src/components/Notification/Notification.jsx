import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '@/store/slices/notificationSlice';
import {
  NotificationShell,
  Label,
  Message,
  Content,
  DismissButton,
  accentByType,
} from './Notification.styles.js';
import useNotification from '@/hooks/useNotification.js';

const Notification = () => {
  const dispatch = useDispatch();
  const { message, type } = useSelector((state) => state.notification);

  const { isOpen, shouldRender } = useNotification();

  if (!shouldRender) {
    return null;
  }

  const variant = accentByType[type] ? type : 'info';
  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <NotificationShell
      role={role}
      aria-live="assertive"
      $variant={variant}
      $open={isOpen}
    >
      <Content>
        <Label $variant={variant}>{variant}</Label>
        <Message>{message}</Message>
      </Content>
      <DismissButton
        onClick={() => dispatch(hideNotification())}
        aria-label="Dismiss notification"
      >
        ×
      </DismissButton>
    </NotificationShell>
  );
};

export default Notification;

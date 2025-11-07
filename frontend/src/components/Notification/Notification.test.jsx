import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { hideNotificationMock, mockUseNotification } = vi.hoisted(() => ({
  hideNotificationMock: vi.fn(() => ({ type: 'notification/hide' })),
  mockUseNotification: vi.fn(),
}));

const dispatchSpy = vi.fn();
let selectorState = { notification: { message: '', type: 'info' } };

vi.mock('react-redux', () => ({
  __esModule: true,
  useDispatch: () => dispatchSpy,
  useSelector: (selector) => selector(selectorState),
}));

vi.mock('@/hooks/useNotification.js', () => ({
  __esModule: true,
  default: () => mockUseNotification(),
}));

vi.mock('@/store/slices/notificationSlice', () => ({
  __esModule: true,
  hideNotification: hideNotificationMock,
}));

import Notification from './Notification.jsx';
import { NotificationShell, Label } from './Notification.styles.js';

describe('Notification', () => {
  beforeEach(() => {
    dispatchSpy.mockClear();
    hideNotificationMock.mockClear();
    mockUseNotification.mockReset();
    selectorState = { notification: { message: '', type: 'info' } };
    mockUseNotification.mockReturnValue({ isOpen: false, shouldRender: false });
  });

  it('returns null when there is nothing to show', () => {
    mockUseNotification.mockReturnValue({ isOpen: false, shouldRender: false });
    selectorState = { notification: { message: 'hidden', type: 'success' } };

    const { container } = render(<Notification />);

    expect(container.firstChild).toBeNull();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('renders an alert for error notifications and supports dismissal', () => {
    mockUseNotification.mockReturnValue({ isOpen: true, shouldRender: true });
    selectorState = { notification: { message: 'System failure', type: 'error' } };

    render(<Notification />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('System failure')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));

    expect(hideNotificationMock).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'notification/hide' });
  });

  it('falls back to the info variant when an unknown type is provided', () => {
    mockUseNotification.mockReturnValue({ isOpen: false, shouldRender: true });
    selectorState = { notification: { message: 'Heads up', type: 'mystery' } };

    render(<Notification />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('uses info accents when the styled components receive an unknown variant', () => {
    const { getByText, container } = render(
      <NotificationShell $variant="missing" $open>
        <Label $variant="missing">accent</Label>
      </NotificationShell>
    );

    const label = getByText('accent');
    expect(window.getComputedStyle(label).color).toBe('rgb(96, 165, 250)');

    const shell = container.firstChild;
    expect(window.getComputedStyle(shell).borderLeftColor).toBe('rgb(96, 165, 250)');
  });
});

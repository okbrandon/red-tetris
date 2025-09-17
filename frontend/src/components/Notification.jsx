import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { hideNotification } from '../features/notification/notificationSlice';

const accentByType = {
    success: '#4ade80',
    error: '#f87171',
    info: '#60a5fa',
};

const NotificationShell = styled.div`
    position: fixed;
    top: clamp(1rem, 3vw, 1.5rem);
    right: clamp(1rem, 3vw, 1.5rem);
    z-index: 1000;
    padding: 0.95rem 1.15rem;
    border-radius: 14px;
    background: rgba(12, 11, 19, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(12px) saturate(130%);
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    min-width: 240px;
    max-width: min(90vw, 360px);
    border-left: 4px solid ${({ $variant }) => accentByType[$variant] || accentByType.info};
    color: #f5f5ff;
`;

const Label = styled.span`
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ $variant }) => accentByType[$variant] || accentByType.info};
    opacity: 0.9;
`;

const Message = styled.span`
    display: block;
    font-size: 0.95rem;
    line-height: 1.35;
    color: inherit;
`;

const Content = styled.div`
    display: grid;
    gap: 0.25rem;
    flex: 1;
`;

const DismissButton = styled.button`
    appearance: none;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    margin: 0;
    transition: color 0.2s ease;

    &:hover {
        color: rgba(255, 255, 255, 0.9);
    }
`;

const Notification = () => {
    const dispatch = useDispatch();
    const { isVisible, message, type, duration, id } = useSelector((state) => state.notification);

    useEffect(() => {
        if (!isVisible) return undefined;
        const timeout = setTimeout(() => {
            dispatch(hideNotification());
        }, duration);
        return () => clearTimeout(timeout);
    }, [dispatch, duration, id, isVisible]);

    if (!isVisible) {
        return null;
    }

    const variant = accentByType[type] ? type : 'info';
    const role = variant === 'error' ? 'alert' : 'status';

    return (
        <NotificationShell role={role} aria-live='assertive' $variant={variant}>
            <Content>
                <Label $variant={variant}>{variant}</Label>
                <Message>{message}</Message>
            </Content>
            <DismissButton onClick={() => dispatch(hideNotification())} aria-label='Dismiss notification'>
                ×
            </DismissButton>
        </NotificationShell>
    );
};

export default Notification;

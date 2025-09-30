import styled from 'styled-components';

export const accentByType = {
    success: '#4ade80',
    error: '#f87171',
    info: '#60a5fa',
};

export const ANIMATION_MS = 280;

export const NotificationShell = styled.div`
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
    transform: translateX(${({ $open }) => ($open ? '0' : '120%')});
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    transition:
        transform ${ANIMATION_MS}ms cubic-bezier(0.24, 0.82, 0.25, 1),
        opacity ${ANIMATION_MS}ms ease;
    will-change: transform, opacity;
`;

export const Label = styled.span`
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ $variant }) => accentByType[$variant] || accentByType.info};
    opacity: 0.9;
`;

export const Message = styled.span`
    display: block;
    font-size: 0.95rem;
    line-height: 1.35;
    color: inherit;
`;

export const Content = styled.div`
    display: grid;
    gap: 0.25rem;
    flex: 1;
`;

export const DismissButton = styled.button`
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

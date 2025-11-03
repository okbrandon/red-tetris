import styled from 'styled-components';

export const PlayerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem 0;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const Player = styled.li`
  background: rgba(20, 20, 20, 0.55);
  border: 1px solid rgba(162, 89, 255, 0.35);
  color: #ffffff;
  padding: 0.8rem 1rem;
  font-size: 0.95rem;
  border-radius: 10px;
  text-align: left;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 8px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
`;

export const ModeSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 1rem 0 1.5rem;
`;

export const ModeSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.4vw, 0.9rem);
`;

export const ModeSelectWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: clamp(240px, 60vw, 360px);

  &::after {
    content: '';
    position: absolute;
    pointer-events: none;
    top: 50%;
    right: 1rem;
    transform: translateY(-35%);
    border-width: 0.4rem 0.35rem 0;
    border-style: solid;
    border-color: rgba(210, 179, 255, 0.92) transparent transparent transparent;
    opacity: 0.9;
  }
`;

export const ModeSelect = styled.select`
  width: 100%;
  appearance: none;
  border-radius: 12px;
  border: 1px solid rgba(162, 89, 255, 0.28);
  background: rgba(26, 20, 45, 0.72);
  color: #f6f0ff;
  padding: 0.65rem 2.6rem 0.65rem 0.95rem;
  font-size: 0.94rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.2s ease,
    transform 0.14s ease;

  &:hover:not(:disabled) {
    border-color: rgba(210, 179, 255, 0.75);
    box-shadow: 0 12px 26px rgba(162, 89, 255, 0.18);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(210, 179, 255, 0.95);
    box-shadow:
      0 0 0 3px rgba(162, 89, 255, 0.32),
      0 12px 28px rgba(20, 12, 40, 0.45);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
    border-color: rgba(162, 89, 255, 0.2);
    box-shadow: none;
  }
`;

export const ModeDetailCard = styled.div`
  border-radius: 12px;
  border: 1px solid rgba(162, 89, 255, 0.22);
  background: rgba(22, 18, 36, 0.66);
  padding: clamp(0.7rem, 1.6vw, 0.9rem);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const ModeDetailTitle = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const ModeDetailDescription = styled.p`
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.4;
  color: rgba(231, 224, 255, 0.78);
`;

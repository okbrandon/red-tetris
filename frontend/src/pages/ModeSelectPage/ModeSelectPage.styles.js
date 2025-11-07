import { styled } from 'styled-components';

export const ButtonGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
  width: min(380px, 80vw);
  margin: 0 auto;
`;

export const ModeGrid = styled.div`
  display: grid;
  gap: 1rem;
  width: 100%;
  margin: 0.5rem auto 0;
  grid-template-columns: 1fr;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const ModeOption = styled.button`
  background: rgba(18, 14, 24, 0.7);
  border: 1px solid rgba(162, 89, 255, 0.28);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  color: #f6f0ff;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
  box-shadow:
    0 14px 32px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 0;
  overflow: hidden;

  & > * {
    position: relative;
    z-index: 1;
  }

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      145deg,
      rgba(162, 89, 255, 0.08),
      rgba(111, 66, 193, 0.04)
    );
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(162, 89, 255, 0.58);
    box-shadow:
      0 18px 40px rgba(162, 89, 255, 0.22),
      inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  &:hover:before {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(210, 180, 255, 0.95);
    box-shadow:
      0 0 0 3px rgba(162, 89, 255, 0.35),
      0 12px 28px rgba(0, 0, 0, 0.4);
  }

  &[data-selected='true'] {
    border-color: rgba(210, 179, 255, 0.9);
    box-shadow:
      0 18px 42px rgba(210, 179, 255, 0.25),
      inset 0 0 0 1px rgba(255, 255, 255, 0.12);

    &:before {
      opacity: 1;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
    transform: none;
    border-color: rgba(162, 89, 255, 0.2);
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.25),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  &:disabled[data-selected='true'] {
    opacity: 1;
    border-color: rgba(210, 179, 255, 0.65);
    box-shadow:
      0 14px 34px rgba(210, 179, 255, 0.22),
      inset 0 0 0 1px rgba(255, 255, 255, 0.09);
  }
`;

export const ModeBadge = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c8b0ff;
  background: rgba(162, 89, 255, 0.18);
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
`;

export const ModeTitle = styled.span`
  font-size: 1.15rem;
  font-weight: 600;
  color: #ffffff;
`;

export const ModeDescription = styled.span`
  font-size: 0.9rem;
  line-height: 1.45;
  color: rgba(239, 232, 255, 0.78);
`;

export const ModeActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

export const SecondaryButton = styled.button`
  background: transparent;
  border: 1px solid rgba(203, 179, 255, 0.45);
  color: #d8c5ff;
  padding: 0.7rem 1.6rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.18s ease;

  &:hover {
    color: #ffffff;
    border-color: rgba(203, 179, 255, 0.8);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(203, 179, 255, 1);
    box-shadow: 0 0 0 3px rgba(162, 89, 255, 0.32);
  }
`;

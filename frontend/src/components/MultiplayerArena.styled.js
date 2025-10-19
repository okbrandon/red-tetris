import styled, { css } from 'styled-components';

export const ArenaContainer = styled.div`
  width: min(100%, 94vw);
  max-width: 1600px;
  height: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: stretch;
  margin: 0 auto;
  box-sizing: border-box;
`;

export const ArenaLayout = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(12px, 2vw, 24px);
  padding: clamp(16px, 2vw, 24px);
  box-sizing: border-box;

  @media (min-width: 880px) {
    display: grid;
    grid-template-columns: clamp(340px, 40vw, 520px) minmax(0, 1fr);
    align-items: stretch;
  }
`;

export const OpponentColumn = styled.section`
  --card-scale: 1;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: start;
  gap: clamp(0.7rem, 1.4vw, 1.1rem);
  min-height: 0;
  max-height: 100%;
  padding: 0;
  flex: 1 1 auto;
`;

export const SectionLabel = styled.h3`
  margin: 0;
  font-size: 0.76rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(215, 206, 246, 0.72);
  text-align: left;
`;

export const OpponentGrid = styled.div`
  --card-min: clamp(140px, 20vw, 200px);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--card-min), 1fr));
  gap: clamp(0.7rem, 1.2vw, 1.2rem);
  flex: 1 1 auto;
  justify-items: stretch;
`;

export const OpponentCard = styled.div`
  width: 100%;
  min-width: 0;
  border-radius: calc(12px * var(--card-scale, 1));
  border: 1px solid rgba(142, 107, 225, 0.2);
  background: rgba(26, 22, 44, 0.92);
  padding: clamp(0.9rem, 1.8vw, 1.1rem);
  display: grid;
  gap: calc(0.5rem * var(--card-scale, 1));
  justify-items: center;
  box-sizing: border-box;
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &[data-active='true'] {
    border-color: rgba(198, 160, 255, 0.55);
    background: linear-gradient(160deg, rgba(42, 33, 72, 0.95), rgba(24, 20, 46, 0.96));
    box-shadow: 0 24px 38px rgba(14, 9, 30, 0.46);
  }

  ${({ $interactive }) =>
    $interactive &&
    css`
      &:hover,
      &:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 20px 34px rgba(18, 13, 34, 0.45);
        border-color: rgba(198, 160, 255, 0.45);
        outline: none;
      }
    `}
`;

export const OpponentBadge = styled.span`
  padding: calc(0.18rem * var(--card-scale, 1)) calc(0.55rem * var(--card-scale, 1));
  border-radius: 999px;
  border: 1px solid rgba(162, 130, 235, 0.28);
  background: rgba(28, 24, 46, 0.5);
  font-size: calc(0.62rem * var(--card-scale, 1));
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(190, 183, 232, 0.78);
`;

export const OpponentName = styled.span`
  font-size: calc(0.78rem * var(--card-scale, 1));
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(229, 222, 255, 0.88);
`;

export const OpponentHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(0.35rem * var(--card-scale, 1));
  align-items: center;
  text-align: center;
`;

export const MiniBoard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-radius: calc(12px * var(--card-scale, 1));
  border: 1px solid rgba(162, 130, 235, 0.2);
  background: rgba(16, 13, 28, 0.9);
  overflow: hidden;
  pointer-events: none;
`;

export const EmptyNotice = styled.p`
  margin: 0;
  padding: clamp(0.6rem, 1.2vw, 0.8rem);
  border-radius: 10px;
  border: 1px solid rgba(142, 107, 225, 0.2);
  background: rgba(21, 19, 34, 0.5);
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.68);
  text-align: center;
  width: 100%;
`;

export const MainColumn = styled.section`
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.4vw, 1rem);
  min-height: 0;
  align-items: stretch;
  justify-content: center;
  max-height: 100%;
`;

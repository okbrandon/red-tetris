export {
  ArenaContainer,
  ArenaLayout,
  OpponentColumn,
  SectionLabel,
  OpponentGrid,
  OpponentCard,
  OpponentBadge,
  OpponentName,
  OpponentHeader,
  MiniBoard,
  EmptyNotice,
  MainColumn,
} from '../MultiArenaPage/MultiArenaPage.styles.js';

import styled from 'styled-components';
import { BoardFrame as BaseBoardFrame } from '@/components/GameView/GameView.styles.js';

export const SpectatorActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-self: flex-end;
  width: 100%;
  margin-top: clamp(0.4rem, 1vw, 0.8rem);
`;

export const ExitButton = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 118, 137, 0.5);
  border-radius: 999px;
  padding: 0.55rem 1.3rem;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 182, 194, 0.86);
  background: rgba(44, 22, 36, 0.72);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(255, 182, 194, 0.85);
    color: rgba(255, 214, 222, 0.95);
    background: rgba(62, 26, 40, 0.82);
    outline: none;
  }

  &:active {
    transform: translateY(0);
    background: rgba(58, 24, 36, 0.74);
  }
`;

export const FocusedPanel = styled.div`
  width: 100%;
  display: grid;
  gap: clamp(0.9rem, 2vw, 1.5rem);
  border-radius: 20px;
  border: 1px solid rgba(142, 107, 225, 0.26);
  background: linear-gradient(
    160deg,
    rgba(26, 22, 45, 0.9),
    rgba(13, 11, 24, 0.96)
  );
  box-shadow: 0 24px 46px rgba(8, 5, 18, 0.52);
  padding: 1rem 2rem;
  box-sizing: border-box;
`;

export const FocusedHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

export const FocusedBadge = styled.span`
  align-self: flex-start;
  padding: 0.28rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(174, 145, 245, 0.38);
  background: rgba(34, 28, 58, 0.78);
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(207, 198, 248, 0.84);
`;

export const FocusedName = styled.h2`
  margin: 0;
  font-size: clamp(1.2rem, 3vw, 1.7rem);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f6f1ff;
`;

export const FocusedBody = styled.div`
  display: grid;
  gap: clamp(0.9rem, 2vw, 1.4rem);

  @media (min-width: 760px) {
    grid-template-columns: minmax(0, 1fr) clamp(220px, 28vw, 270px);
    align-items: start;
  }
`;

export const SpectatorBoardFrame = styled(BaseBoardFrame)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FocusedStats = styled.dl`
  margin: 0;
  display: grid;
  gap: clamp(0.6rem, 1.2vw, 0.9rem);
  padding: clamp(0.9rem, 2vw, 1.2rem);
  border-radius: 16px;
  border: 1px solid rgba(162, 130, 235, 0.22);
  background: rgba(21, 18, 36, 0.72);
  box-shadow: 0 18px 32px rgba(10, 7, 20, 0.32);
`;

export const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
`;

export const StatLabel = styled.dt`
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.72);
`;

export const StatValue = styled.dd`
  margin: 0;
  font-size: clamp(1rem, 2.4vw, 1.3rem);
  letter-spacing: 0.06em;
  color: #f6f1ff;
`;

export const EmptyState = styled.p`
  margin: 0;
  padding: clamp(0.9rem, 2vw, 1.4rem);
  border-radius: 16px;
  border: 1px solid rgba(142, 107, 225, 0.22);
  background: rgba(21, 19, 34, 0.58);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.68);
  text-align: center;
  width: 100%;
`;

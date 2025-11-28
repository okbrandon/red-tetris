import styled from 'styled-components';

export const Layout = styled.div`
  --board-base-height: 690;
  --board-base-width: 345;
  --board-height-scale: calc((80vh - 40px) / (var(--board-base-height) * 1px));
  --board-width-scale: calc((100vw - 320px) / (var(--board-base-width) * 1px));
  --board-scale: clamp(
    0.85,
    min(var(--board-height-scale), var(--board-width-scale)),
    1.25
  );

  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'board'
    'panel';
  gap: clamp(0.45rem, 1.4vw, 0.9rem);
  box-sizing: border-box;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  place-content: center;
  place-items: center;

  @media (max-width: 640px) {
    --board-height-scale: calc(
      (78vh - 32px) / (var(--board-base-height) * 1px)
    );
    --board-width-scale: calc((100vw - 40px) / (var(--board-base-width) * 1px));
    --board-scale: clamp(
      0.78,
      min(var(--board-height-scale), var(--board-width-scale)),
      0.98
    );
  }

  @media (min-width: 920px) {
    grid-template-columns: minmax(0, 1.7fr) clamp(220px, 18vw, 300px);
    grid-template-areas: 'board panel';
    place-content: center;
    place-items: center;
    --board-height-scale: calc(
      (82vh - 48px) / (var(--board-base-height) * 1px)
    );
    --board-width-scale: calc(
      (100vw - 340px) / (var(--board-base-width) * 1px)
    );
    --board-scale: clamp(
      0.95,
      min(var(--board-height-scale), var(--board-width-scale)),
      1.35
    );
  }

  @media (min-width: 1280px) {
    grid-template-columns: minmax(0, 1.8fr) clamp(230px, 16vw, 320px);
    --board-height-scale: calc(
      (84vh - 52px) / (var(--board-base-height) * 1px)
    );
    --board-width-scale: calc(
      (100vw - 380px) / (var(--board-base-width) * 1px)
    );
    --board-scale: clamp(
      1,
      min(var(--board-height-scale), var(--board-width-scale)),
      1.4
    );
  }
`;

export const BoardArea = styled.section`
  grid-area: board;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const BoardFrame = styled.div`
  position: relative;
  padding: clamp(0.4rem, 1vw, 0.8rem);
  border-radius: 18px;
  border: 1px solid rgba(162, 130, 235, 0.25);
  background: rgba(18, 15, 32, 0.84);
  box-shadow: inset 0 1px 0 rgba(217, 206, 255, 0.12);
  overflow: hidden;
  transform-origin: top center;
  margin: 0 auto;
  max-width: 100%;
  max-height: 82vh;
`;

export const PanelArea = styled.section`
  grid-area: panel;
  display: flex;
  flex-direction: column;
  gap: clamp(0.7rem, 2vw, 1.2rem);
  align-items: stretch;
  justify-content: flex-start;
`;

export const PanelHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.1rem, 2.4vw, 1.5rem);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f6f1ff;
`;

export const PanelCaption = styled.p`
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(215, 206, 246, 0.68);
`;

export const InfoCard = styled.div`
  border-radius: 14px;
  border: 1px solid rgba(162, 130, 235, 0.22);
  background: rgba(21, 18, 36, 0.72);
  box-shadow: 0 14px 28px rgba(10, 7, 20, 0.3);
  padding: clamp(0.8rem, 2vw, 1.1rem);
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.6vw, 0.9rem);
`;

export const EventLogListCard = styled(InfoCard)`
  height: 5.5rem;
`;

export const InfoLabel = styled.span`
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.72);
`;

export const ScoreValue = styled.span`
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #f6f1ff;
`;

export const InfoStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(0.3rem, 0.8vw, 0.5rem);
`;

export const PreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.6rem, 1.6vw, 1rem);
  width: 100%;
`;

export const PrimaryPreviewCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(0.35rem, 1vw, 0.6rem);
`;

export const PrimaryPreviewInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

export const PreviewTitle = styled.span`
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(246, 241, 255, 0.82);
`;

export const PreviewMeta = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.05rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(162, 130, 235, 0.26);
  background: rgba(54, 38, 94, 0.28);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgba(246, 241, 255, 0.82);
  white-space: nowrap;
`;

export const PrimaryPreviewCanvas = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: clamp(54px, 7.5vw, 68px);
  height: clamp(54px, 7.5vw, 68px);
  padding: clamp(0.18rem, 0.5vw, 0.3rem);
  border-radius: 10px;
  border: 1px solid rgba(162, 130, 235, 0.24);
  background: rgba(54, 38, 94, 0.22);
  box-shadow: inset 0 4px 18px rgba(24, 18, 42, 0.45);
`;

export const QueueList = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0 clamp(0.3rem, 1vw, 0.6rem);
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(0.4rem, 1.2vw, 0.7rem);
`;

export const QueueListItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.2rem, 0.7vw, 0.35rem);
`;

export const QueueIndex = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(1.05rem, 1.6vw, 1.35rem);
  height: clamp(1.05rem, 1.6vw, 1.35rem);
  border-radius: 999px;
  border: 1px solid rgba(162, 130, 235, 0.32);
  background: rgba(33, 25, 58, 0.4);
  font-size: 0.52rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(246, 241, 255, 0.7);
`;

export const QueuePreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: clamp(42px, 6vw, 52px);
  height: clamp(42px, 6vw, 52px);
  padding: clamp(0.1rem, 0.35vw, 0.2rem);
  border-radius: 8px;
  border: 1px solid rgba(162, 130, 235, 0.22);
  background: rgba(54, 38, 94, 0.16);
  box-shadow: inset 0 3px 12px rgba(20, 15, 36, 0.45);
`;

export const QueuePieceLabel = styled.span`
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(246, 241, 255, 0.68);
  text-align: center;
`;

export const EmptyQueue = styled.p`
  margin: 0;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.58);
  text-align: center;
`;

export const EventLogList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: clamp(0.35rem, 0.9vw, 0.5rem);
  max-width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.2rem;

  scrollbar-width: thin;
  scrollbar-color: rgba(162, 130, 235, 0.35) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(162, 130, 235, 0.35);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const EventLogItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.7vw, 0.4rem);
  border-radius: 10px;
  border: 1px solid rgba(162, 130, 235, 0.2);
  background: rgba(33, 25, 58, 0.68);
  box-shadow: inset 0 1px 0 rgba(217, 206, 255, 0.08);
  padding: clamp(0.42rem, 1.1vw, 0.6rem) clamp(0.55rem, 1.2vw, 0.75rem);
  color: rgba(246, 241, 255, 0.92);
  line-height: 1.35;
  min-width: 0;
`;

export const EventLogHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
  min-width: 0;
`;

export const EventLogScorer = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: rgba(246, 241, 255, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EventLogTimestamp = styled.time`
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.66);
  margin-left: auto;
`;

export const EventLogMessage = styled.p`
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  word-break: break-word;
  hyphens: auto;
`;

export const EventLogDetails = styled.p`
  margin: 0;
  font-size: 0.64rem;
  letter-spacing: 0.07em;
  color: rgba(199, 191, 234, 0.72);
  word-break: break-word;
  hyphens: auto;
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

export const SpectatorActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-self: flex-end;
  width: 100%;
  margin-top: clamp(0.4rem, 1vw, 0.8rem);
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

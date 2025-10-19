import styled from 'styled-components';

export const Layout = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'board'
    'panel';
  gap: clamp(0.9rem, 2.4vw, 1.6rem);
  border-radius: 20px;
  border: 1px solid rgba(142, 107, 225, 0.26);
  background: linear-gradient(160deg, rgba(26, 22, 45, 0.88), rgba(13, 11, 24, 0.96));
  box-shadow: 0 24px 46px rgba(8, 5, 18, 0.52);
  padding: clamp(1rem, 2.6vw, 1.8rem) clamp(1.2rem, 3.8vw, 3rem);
  box-sizing: border-box;

  @media (min-width: 920px) {
    grid-template-columns: minmax(0, 1fr) clamp(220px, 24vw, 320px);
    grid-template-areas: 'board panel';
    align-items: stretch;
  }
`;

export const BoardArea = styled.section`
  grid-area: board;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const BoardFrame = styled.div`
  position: relative;
  padding: clamp(0.6rem, 1.4vw, 1rem);
  border-radius: 18px;
  border: 1px solid rgba(162, 130, 235, 0.25);
  background: rgba(18, 15, 32, 0.84);
  box-shadow: inset 0 1px 0 rgba(217, 206, 255, 0.12);
  overflow: hidden;
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

export const VerticalPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.2vw, 0.8rem);
  width: 100%;
`;

export const PreviewSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(64px, 10vw, 96px);
  width: 100%;
  padding: 0.2rem 0;
`;

export const EmptyQueue = styled.p`
  margin: 0;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.58);
`;

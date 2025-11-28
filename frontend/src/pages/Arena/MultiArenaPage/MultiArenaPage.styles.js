import styled from 'styled-components';

export const ArenaContainer = styled.div`
  width: min(100%, 94vw);
  max-width: 1600px;
  height: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: stretch;
  margin: 0 auto;
  box-sizing: border-box;
  overflow: hidden;
`;

export const ArenaLayout = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
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

export const MainColumn = styled.section`
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.4vw, 1rem);
  min-height: 0;
  align-items: stretch;
  justify-content: center;
  max-height: 100%;
`;

export const SectionLabel = styled.h3`
  margin: 0;
  font-size: 0.76rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(215, 206, 246, 0.72);
  text-align: left;
`;

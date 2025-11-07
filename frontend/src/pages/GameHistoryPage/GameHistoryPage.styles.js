import styled from 'styled-components';

export const HistoryContainer = styled.section`
  width: min(92vw, 600px);
  margin: clamp(1.5rem, 4vw, 2.5rem) auto clamp(2rem, 6vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.4vw, 1.6rem);
  align-items: stretch;
`;

export const HistoryCard = styled.div`
  border-radius: 20px;
  border: 1px solid rgba(203, 179, 255, 0.18);
  background:
    radial-gradient(
      140% 160% at 20% 0%,
      rgba(111, 66, 193, 0.22) 0%,
      rgba(162, 89, 255, 0.08) 38%,
      rgba(10, 10, 10, 0.6) 72%
    ),
    rgba(15, 15, 15, 0.58);
  box-shadow:
    0 22px 54px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(11px) saturate(130%);
  padding: clamp(1.6rem, 3.2vw, 2.3rem) clamp(1.2rem, 3vw, 1.9rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.2vw, 1.4rem);
`;

export const HistoryHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: clamp(0.4rem, 1vw, 0.6rem);
  align-items: flex-start;
`;

export const HistoryTopRow = styled.div`
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
`;

export const HistoryTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.8rem);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f6f0ff;
`;

export const HistoryNote = styled.time`
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(203, 191, 246, 0.72);
`;

export const HistorySubtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(216, 205, 245, 0.78);
`;

export const HistoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.7rem, 1.8vw, 1rem);
  max-height: clamp(16rem, 52vh, 28rem);
  overflow-y: auto;
  padding-right: 0.25rem;

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

export const HistoryItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: clamp(0.4rem, 1vw, 0.6rem);
  padding: clamp(0.75rem, 1.8vw, 1.05rem) clamp(0.85rem, 2.1vw, 1.2rem);
  border-radius: 16px;
  border: 1px solid rgba(162, 130, 235, 0.24);
  background: rgba(28, 20, 46, 0.62);
  box-shadow: inset 0 1px 0 rgba(217, 206, 255, 0.1);
  min-width: 0;
`;

export const HistoryItemHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
`;

export const HistoryOutcome = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(246, 241, 255, 0.92);

  &[data-outcome='win'] {
    color: #82ffc5;
  }

  &[data-outcome='loss'] {
    color: #ff9bb8;
  }

  &[data-outcome='neutral'] {
    color: rgba(211, 199, 255, 0.82);
  }
`;

export const HistoryTimestamp = styled.time`
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.68);
  margin-left: auto;
`;

export const HistorySummary = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(246, 241, 255, 0.92);
  word-break: break-word;
  hyphens: auto;
`;

export const HistoryMeta = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.74);
  word-break: break-word;
  hyphens: auto;
`;

export const HistoryMessage = styled.span`
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  color: rgba(246, 241, 255, 0.78);
  word-break: break-word;
  hyphens: auto;
`;

export const HistoryEmpty = styled.p`
  margin: 0;
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(199, 191, 234, 0.7);
  text-align: center;
`;

import styled from 'styled-components';

export const JoinForm = styled.form`
  width: min(420px, 100%);
  display: grid;
  gap: 0.85rem;
  margin: 0 auto;
  grid-template-columns: 1fr;

  @media (min-width: 560px) {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
`;

export const JoinHint = styled.span`
  text-align: center;
  font-size: 0.85rem;
  color: #b79cff;
  opacity: 0.8;
`;

export const RoomsSection = styled.section`
  margin-top: 1.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1 1 auto;
`;

export const RoomsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #f5f2ff;
  margin: 0;
  text-align: left;
`;

export const RoomsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 0.35rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: clamp(220px, 45vh, 340px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(167, 139, 255, 0.35) transparent;

  &::-webkit-scrollbar {
    width: 0.45rem;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #8f6bff 0%, #5a41c7 100%);
    border-radius: 999px;
  }
`;

export const RoomButton = styled.button`
  width: 100%;
  border: 1px solid rgba(147, 110, 255, 0.4);
  background: rgba(34, 14, 76, 0.7);
  color: #ffffff;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease,
    background 0.15s ease;

  &:hover,
  &:focus-visible {
    border-color: #b79cff;
    background: rgba(60, 24, 125, 0.85);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid #b79cff;
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const RoomHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const RoomName = styled.span`
  font-size: 1.05rem;
  font-weight: 600;
  word-break: break-word;
`;

export const RoomBadge = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: rgba(183, 156, 255, 0.25);
  color: #dfccff;
`;

export const RoomMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: rgba(239, 233, 255, 0.85);
`;

export const JoinSection = styled.section`
  padding-bottom: 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(183, 156, 255, 0.2);
`;

export const RoomsEmpty = styled.p`
  margin: 0.25rem 0 0;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(183, 156, 255, 0.8);
`;

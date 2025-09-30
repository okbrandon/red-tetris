import styled from 'styled-components';

export const ArenaContainer = styled.div`
    width: 80%;
    height: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
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
        grid-template-columns: clamp(280px, 34vw, 380px) minmax(0, 1fr);
        align-items: stretch;
    }
`;

export const OpponentColumn = styled.section`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(0.8rem, 1.6vw, 1.2rem);
    min-height: 0;
    max-height: 100%;
    padding: clamp(1rem, 1.8vw, 1.6rem);
    border-radius: 18px;
    border: 1px solid rgba(142, 107, 225, 0.25);
    background: linear-gradient(160deg, rgba(24, 21, 39, 0.96), rgba(18, 15, 32, 0.9));
    box-shadow: 0 20px 34px rgba(8, 6, 18, 0.36);
`;

export const SectionLabel = styled.h3`
    margin: 0;
    font-size: 0.76rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(215, 206, 246, 0.72);
    text-align: left;
`;

export const OpponentList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: clamp(0.75rem, 1.3vw, 1rem);
    flex: 1 1 auto;
    min-height: 0;
    align-content: start;
    justify-items: center;

    @media (max-width: 679px) {
        grid-template-columns: 1fr;
        justify-items: stretch;
    }
`;

export const OpponentCard = styled.div`
    width: min(100%, 220px);
    min-width: 0;
    border-radius: 16px;
    border: 1px solid rgba(142, 107, 225, 0.18);
    background: linear-gradient(155deg, rgba(28, 24, 46, 0.92), rgba(16, 13, 28, 0.96));
    padding: 14px 18px 18px;
    display: grid;
    gap: 0.6rem;
    justify-items: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 18px 30px rgba(10, 7, 20, 0.32);
    box-sizing: border-box;
    flex: 0 0 auto;
`;

export const OpponentBadge = styled.span`
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    border: 1px solid rgba(162, 130, 235, 0.32);
    background: rgba(28, 24, 46, 0.6);
    font-size: 0.65rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(190, 183, 232, 0.8);
`;

export const OpponentName = styled.span`
    font-size: 0.8rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(229, 222, 255, 0.88);
`;

export const OpponentHeader = styled.div`
    display: grid;
    gap: 0.4rem;
    justify-items: center;
    text-align: center;
`;

export const MiniBoard = styled.div`
    display: flex;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    opacity: 0.95;
    pointer-events: none;
    width: 100%;
`;

export const EmptyNotice = styled.p`
    margin: 0;
    padding: clamp(0.6rem, 1.4vw, 0.85rem);
    border-radius: 12px;
    border: 1px solid rgba(142, 107, 225, 0.2);
    background: rgba(21, 19, 34, 0.54);
    font-size: 0.76rem;
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
    align-items: center;
    justify-content: center;
    max-height: 100%;
`;

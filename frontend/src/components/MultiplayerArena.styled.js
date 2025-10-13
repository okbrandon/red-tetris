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
        grid-template-columns: clamp(340px, 42vw, 520px) minmax(0, 1fr);
        align-items: stretch;
    }
`;

export const OpponentColumn = styled.section`
    --card-scale: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(0.75rem, 1.4vw, 1.1rem);
    min-height: 0;
    max-height: 100%;
    padding: clamp(0.9rem, 1.8vw, 1.4rem);
    border-radius: 16px;
    border: 1px solid rgba(142, 107, 225, 0.2);
    background: rgba(20, 17, 33, 0.82);
    box-shadow: 0 12px 24px rgba(10, 8, 18, 0.28);
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(calc(150px * var(--card-scale, 1)), 1fr));
    gap: calc(0.7rem * var(--card-scale, 1));
    flex: 0 0 auto;
    justify-items: stretch;
`;

export const OpponentCard = styled.div`
    width: 100%;
    min-width: 0;
    border-radius: calc(12px * var(--card-scale, 1));
    border: 1px solid rgba(142, 107, 225, 0.18);
    background: rgba(30, 27, 45, 0.92);
    padding: calc(12px * var(--card-scale, 1));
    display: grid;
    gap: calc(0.55rem * var(--card-scale, 1));
    justify-items: center;
    box-sizing: border-box;
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
    border-radius: calc(10px * var(--card-scale, 1));
    overflow: hidden;
    opacity: 0.95;
    pointer-events: none;
    width: 100%;
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
    align-items: center;
    justify-content: center;
    max-height: 100%;
`;

import styled from 'styled-components';

export const SpectatorContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    padding: clamp(1rem, 3vw, 2.4rem);
    box-sizing: border-box;
`;

export const SpectatorLayout = styled.div`
    width: min(1100px, 100%);
    display: grid;
    gap: clamp(1rem, 2vw, 1.6rem);
    grid-template-columns: minmax(0, 1fr);

    @media (min-width: 960px) {
        grid-template-columns: minmax(0, 1fr) clamp(280px, 30%, 340px);
        align-items: start;
    }
`;

export const SpectatorActions = styled.div`
    display: flex;
    justify-content: flex-end;
    grid-column: 1 / -1;
`;

export const ExitButton = styled.button`
    appearance: none;
    border: none;
    border-radius: 12px;
    padding: 0.7rem 1.4rem;
    font-size: 0.78rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #120a28;
    background: linear-gradient(135deg, #c9a9ff 0%, #94a8ff 100%);
    box-shadow: 0 18px 28px rgba(58, 36, 110, 0.32);
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 34px rgba(58, 36, 110, 0.38);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 14px 22px rgba(58, 36, 110, 0.3);
    }
`;

export const FocusedPanel = styled.section`
    border-radius: 22px;
    border: 1px solid rgba(142, 107, 225, 0.26);
    background: linear-gradient(165deg, rgba(28, 24, 48, 0.94), rgba(16, 13, 30, 0.96));
    box-shadow: 0 26px 44px rgba(8, 6, 18, 0.46);
    padding: clamp(1.2rem, 3vw, 1.8rem);
    display: grid;
    gap: clamp(0.8rem, 1.6vw, 1.2rem);
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

export const FocusedContent = styled.div`
    display: grid;
    gap: clamp(0.8rem, 1.5vw, 1.2rem);

    @media (min-width: 640px) {
        grid-template-columns: minmax(0, 1fr) clamp(200px, 28vw, 260px);
        align-items: start;
    }
`;

export const SpectatorBoard = styled.div`
    position: relative;
    padding: clamp(0.6rem, 1.6vw, 1rem);
    border-radius: 18px;
    border: 1px solid rgba(162, 130, 235, 0.28);
    background: rgba(18, 15, 32, 0.9);
    box-shadow: inset 0 1px 0 rgba(217, 206, 255, 0.12);
    overflow: hidden;
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

export const SpectatorList = styled.section`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: clamp(0.8rem, 1.4vw, 1.1rem);
`;

export const SpectatorCard = styled.div`
    position: relative;
    border-radius: 18px;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(198, 160, 255, 0.55)' : 'rgba(142, 107, 225, 0.22)')};
    background: ${({ $active }) => ($active
        ? 'linear-gradient(160deg, rgba(42, 33, 72, 0.95), rgba(24, 20, 46, 0.96))'
        : 'linear-gradient(160deg, rgba(26, 22, 45, 0.9), rgba(16, 14, 30, 0.92))')};
    box-shadow: ${({ $active }) => ($active
        ? '0 24px 38px rgba(14, 9, 30, 0.46)'
        : '0 16px 28px rgba(10, 7, 20, 0.34)')};
    padding: 1rem;
    display: grid;
    gap: 0.7rem;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    outline: none;

    &:hover,
    &:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 20px 34px rgba(18, 13, 34, 0.45);
        border-color: rgba(198, 160, 255, 0.45);
    }
`;

export const SpectatorLabel = styled.span`
    font-size: 0.64rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(190, 183, 232, 0.78);
`;

export const SpectatorName = styled.span`
    font-size: 0.82rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(229, 222, 255, 0.92);
`;

export const SpectatorMiniBoard = styled.div`
    width: 100%;
    border-radius: 14px;
    overflow: hidden;
    pointer-events: none;
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
    grid-column: 1 / -1;
`;

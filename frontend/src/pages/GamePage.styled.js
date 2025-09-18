import styled from 'styled-components';
import { Subtitle, Wrapper } from './HomePage.styled';

export const PageWrapper = styled(Wrapper)`
    justify-content: center;
    align-items: center;
    padding: clamp(1rem, 4vh, 1.75rem) 0;
    overflow: hidden;
    box-sizing: border-box;
`;

export const Row = styled.div`
    display: flex;
    gap: clamp(1rem, 3vw, 2rem);
    align-items: stretch;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
    flex: 1;
    min-height: 0;

    @media (min-width: 1024px) {
        flex-wrap: nowrap;
        align-items: flex-start;
    }
`;

export const SidePanel = styled.div`
    min-width: clamp(140px, 16vw, 200px);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 0 0 auto;
    align-self: flex-start;
`;

export const PanelTitle = styled(Subtitle)`
    margin: 0;
    text-align: left;
`;

export const NextBox = styled.div`
    height: clamp(120px, 18vh, 180px);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15,15,20,0.45);
    backdrop-filter: blur(8px);
    display: grid;
    place-items: center;
    padding: 4px;
    box-sizing: border-box;
`;

export const ScoreBox = styled.div`
    padding: 0.9rem 1.1rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15,15,20,0.45);
    backdrop-filter: blur(8px);
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
`;

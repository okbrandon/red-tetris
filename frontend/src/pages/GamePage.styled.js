import styled from 'styled-components';
import { Subtitle } from './HomePage.styled';

export const Row = styled.div`
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
`;

export const SidePanel = styled.div`
    min-width: 180px;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
`;

export const PanelTitle = styled(Subtitle)`
    margin: 0;
    text-align: left;
`;

export const NextBox = styled.div`
    height: 120px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15,15,20,0.45);
    backdrop-filter: blur(8px);
`;

export const ScoreBox = styled.div`
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15,15,20,0.45);
    backdrop-filter: blur(8px);
    color: #fff;
    font-size: 1.15rem;
`;

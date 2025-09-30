import { styled } from 'styled-components';
import { StartButton } from '../pages/HomePage.styled.js';

export const BackButtonContainer = styled.div`
    position: absolute;
    top: clamp(1rem, 3vw, 1.75rem);
    left: clamp(1rem, 3vw, 1.75rem);
    z-index: 3;
`;

export const BackButton = styled(StartButton)`e
    padding: 0.6rem 1rem;
    min-width: auto;
    font-size: 0.9rem;
    width: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
`;

import styled from 'styled-components';
import { Wrapper, LogoTitle } from './HomePage.styled';

export const PageWrapper = styled(Wrapper)`
    justify-content: flex-start;
    align-items: stretch;
    gap: clamp(1.2rem, 3vw, 2.4rem);
    padding: clamp(1rem, 3vh, 1.8rem) clamp(1rem, 4vw, 2.6rem);
    overflow: hidden;
    box-sizing: border-box;
`;

export const SoloArena = styled.div`
    width: min(100%, 94vw);
    max-width: 1500px;
    height: 100%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    padding: clamp(0.8rem, 2.6vw, 1.8rem);
    box-sizing: border-box;
`;

export const GameLogoTitle = styled(LogoTitle)`
    font-size: clamp(2.1rem, 4vw, 2.8rem);
    margin: 0;
    align-self: center;
`;

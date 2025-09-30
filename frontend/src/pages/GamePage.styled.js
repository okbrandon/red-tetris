import styled from 'styled-components';
import { Wrapper, LogoTitle } from './HomePage.styled';

export const PageWrapper = styled(Wrapper)`
    justify-content: center;
    align-items: center;
    padding: clamp(1rem, 4vh, 1.75rem) 0;
    overflow: hidden;
    box-sizing: border-box;
`;

export const SoloArena = styled.div`
    width: min(96vw, 1040px);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    padding: clamp(0.8rem, 3vw, 1.6rem);
    box-sizing: border-box;
`;

export const GameLogoTitle = styled(LogoTitle)`
    font-size: clamp(2.1rem, 4vw, 2.8rem);
    margin: 0;
`;

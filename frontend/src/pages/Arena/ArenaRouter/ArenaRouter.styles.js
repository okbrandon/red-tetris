import styled from 'styled-components';
import {
  Wrapper,
  LogoTitle,
} from '../../UsernameSetupPage/UsernameSetupPage.styles';

export const PageWrapper = styled(Wrapper)`
  justify-content: flex-start;
  padding: clamp(1rem, 3vh, 1.8rem) clamp(1rem, 4vw, 2.6rem);
  overflow: hidden;
  box-sizing: border-box;
`;

export const GameLogoTitle = styled(LogoTitle)`
  font-size: clamp(2.1rem, 4vw, 2.8rem);
  margin: 20px 0;
  align-self: center;
`;

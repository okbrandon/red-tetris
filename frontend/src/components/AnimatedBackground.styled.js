import styled, { keyframes } from 'styled-components';

const floatA = keyframes`
    0% { transform: translate(-20%, -15%) scale(1); }
    50% { transform: translate(5%, 10%) scale(1.05); }
    100% { transform: translate(-20%, -15%) scale(1); }
`;

const floatB = keyframes`
    0% { transform: translate(15%, 5%) scale(1.1); }
    50% { transform: translate(-10%, -10%) scale(1.03); }
    100% { transform: translate(15%, 5%) scale(1.1); }
`;

const panGrid = keyframes`
    0% { background-position: 0 0, 0 0; }
    100% { background-position: 0 480px, 480px 0; }
`;

const fall = keyframes`
    0% { transform: translate(calc(var(--x, 0vw)), -20vh) rotate(var(--rStart, 0deg)) scale(var(--scale, 1)); opacity: 0; }
    5% { opacity: var(--alpha, 0.7); }
    100% { transform: translate(calc(var(--xEnd, 0vw)), 120vh) rotate(var(--rEnd, 15deg)) scale(var(--scale, 1)); opacity: 0; }
`;

export const Background = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
      120% 80% at 50% 0%,
      rgba(255, 255, 255, 0.04),
      rgba(14, 14, 14, 0) 60%
    ),
    linear-gradient(180deg, #0b0b0f 0%, #0e0e13 100%);

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: min(70vw, 700px);
    height: min(70vh, 700px);
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.35;
    will-change: transform;
  }

  &::before {
    top: -10vh;
    left: -10vw;
    background: radial-gradient(closest-side, rgba(162, 89, 255, 0.65), rgba(162, 89, 255, 0) 70%);
    animation: ${floatA} 28s ease-in-out infinite alternate;
  }

  &::after {
    bottom: -15vh;
    right: -10vw;
    background: radial-gradient(closest-side, rgba(111, 66, 193, 0.6), rgba(111, 66, 193, 0) 70%);
    animation: ${floatB} 36s ease-in-out infinite alternate;
  }
`;

export const Grid = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.14;
  filter: saturate(110%);
  background-image: repeating-linear-gradient(
      to bottom,
      rgba(199, 168, 255, 0.12) 0px,
      rgba(199, 168, 255, 0.12) 1px,
      transparent 1px,
      transparent 40px
    ),
    repeating-linear-gradient(
      to right,
      rgba(199, 168, 255, 0.12) 0px,
      rgba(199, 168, 255, 0.12) 1px,
      transparent 1px,
      transparent 40px
    );
  animation: ${panGrid} 60s linear infinite;
`;

export const Pieces = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

export const Piece = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  opacity: 0;
  animation: ${fall} linear infinite;
  animation-duration: var(--dur, 22s);
  animation-delay: var(--delay, 0s);
  will-change: transform, opacity;
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.45));
`;

export const Tile = styled.div`
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: ${({ $color }) => `${$color}`};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 rgba(0, 0, 0, 0.45),
    0 0 10px rgba(162, 89, 255, 0.25);
  outline: 1px solid rgba(255, 255, 255, 0.06);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
        120% 80% at 25% 20%,
        rgba(255, 255, 255, 0.35),
        rgba(255, 255, 255, 0) 55%
      ),
      linear-gradient(160deg, rgba(255, 255, 255, 0.15), rgba(0, 0, 0, 0.2));
    mix-blend-mode: screen;
    pointer-events: none;
  }
`;

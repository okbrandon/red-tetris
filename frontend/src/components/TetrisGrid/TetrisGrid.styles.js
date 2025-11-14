import styled, { keyframes } from 'styled-components';

const heavyDropShake = keyframes`
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  20% {
    transform: translate3d(-3px, 2px, 0) scale(1.005);
  }
  40% {
    transform: translate3d(3px, -2px, 0) scale(0.998);
  }
  60% {
    transform: translate3d(-2px, 1px, 0) scale(1.003);
  }
  80% {
    transform: translate3d(2px, -1px, 0) scale(1);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
`;

export const Board = styled.div`
  display: grid;
  place-content: center;
  background: rgba(15, 15, 20, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 20px 60px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px) saturate(120%);
  border-radius: 0.2rem;
  overflow: hidden;
  position: relative;
  will-change: transform;

  &[data-shake='true'] {
    animation: ${heavyDropShake} 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-shake='true'] {
      animation: none;
    }
  }
`;

export const Cell = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  box-sizing: border-box;
  position: relative;
  background: ${({ $filled, $ghost }) => {
    if ($ghost) {
      return 'linear-gradient(145deg, rgba(230,229,255,0.08) 0%, rgba(180,175,230,0.02) 100%)';
    }
    return $filled
      ? 'linear-gradient(145deg, var(--cell-color, rgba(191,90,242,1)) 0%, rgba(255,255,255,0.9) 140%)'
      : 'rgba(20,20,25,0.35)';
  }};
  border: ${({ $showGrid, $ghost }) => {
    if ($ghost) return '1px dashed rgba(210,198,255,0.28)';
    return $showGrid
      ? '1px solid rgba(199,168,255,0.08)'
      : '1px solid transparent';
  }};
  border-radius: ${({ $filled, $ghost }) => ($ghost ? 2 : $filled ? 3 : 0)}px;
  box-shadow: ${({ $filled, $ghost }) => {
    if ($ghost) return 'inset 0 0 0 1px rgba(210,198,255,0.22)';
    return $filled
      ? '0 0 12px var(--cell-shadow, rgba(0,0,0,0.45)), inset 0 0 1px rgba(255,255,255,0.25)'
      : 'none';
  }};
`;

export const ActivePieceLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform;
  transition: ${({ $animate }) =>
    $animate ? 'transform 120ms cubic-bezier(0.37, 0, 0.63, 1)' : 'none'};
`;

export const ActivePieceCell = styled.div`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  pointer-events: none;
  border-radius: 3px;
  background: linear-gradient(
    145deg,
    var(--piece-color, rgba(191, 90, 242, 1)) 0%,
    rgba(255, 255, 255, 0.9) 140%
  );
  box-shadow:
    0 0 12px var(--piece-shadow, rgba(0, 0, 0, 0.45)),
    inset 0 0 1px rgba(255, 255, 255, 0.25);
`;

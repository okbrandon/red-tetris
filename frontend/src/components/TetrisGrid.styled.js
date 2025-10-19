import styled from 'styled-components';

export const Board = styled.div`
  display: grid;
  place-content: center;
  background: rgba(15, 15, 20, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 20px 60px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px) saturate(120%);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
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
    return $showGrid ? '1px solid rgba(199,168,255,0.08)' : '1px solid transparent';
  }};
  border-radius: ${({ $filled, $ghost }) => ($ghost ? 2 : $filled ? 3 : 0)}px;
  box-shadow: ${({ $filled, $ghost }) => {
    if ($ghost) return 'inset 0 0 0 1px rgba(210,198,255,0.22)';
    return $filled
      ? '0 0 12px var(--cell-shadow, rgba(0,0,0,0.45)), inset 0 0 1px rgba(255,255,255,0.25)'
      : 'none';
  }};
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

export const OverlayInner = styled.div`
  position: absolute;
`;

export const Block = styled.div`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 3px;
  background: linear-gradient(
    145deg,
    var(--block-color, rgba(191, 90, 242, 1)) 0%,
    rgba(255, 255, 255, 0.9) 140%
  );
  box-shadow: 0 0 12px var(--block-shadow, rgba(0, 0, 0, 0.45)),
    inset 0 0 1px rgba(255, 255, 255, 0.25);
`;

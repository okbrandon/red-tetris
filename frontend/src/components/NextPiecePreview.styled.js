import styled from 'styled-components';

export const Board = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  place-content: center;
  position: relative;
  margin: auto;
`;

export const Cell = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  box-sizing: border-box;
  background: ${({ $filled, $color }) =>
    $filled ? `linear-gradient(145deg, ${$color} 0%, rgba(255,255,255,0.9) 140%)` : 'transparent'};
  border: ${({ $filled }) =>
    $filled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'};
  border-radius: ${({ $filled }) => ($filled ? 3 : 0)}px;
  box-shadow: ${({ $filled, $color }) =>
    $filled ? `0 0 8px ${$color.replace('1)', '0.35)')}` : 'none'};
`;

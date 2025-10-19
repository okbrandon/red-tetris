import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

export const Overlay = styled.div`
  position: ${({ $scope }) => ($scope === 'page' ? 'fixed' : 'absolute')};
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.8rem, 3vw, 1.6rem);
  border-radius: ${({ $scope }) => ($scope === 'page' ? '0' : 'inherit')};
  background: ${({ $scope }) =>
    $scope === 'page' ? 'rgba(5, 4, 12, 0.78)' : 'rgba(6, 4, 14, 0.82)'};
  backdrop-filter: blur(6px);
  z-index: ${({ $scope }) => ($scope === 'page' ? 2000 : 5)};
  box-sizing: border-box;
`;

export const Dialog = styled.div`
  width: min(360px, 100%);
  border-radius: 20px;
  border: 1px solid rgba(162, 130, 235, 0.28);
  background: linear-gradient(
    160deg,
    rgba(30, 26, 54, 0.95),
    rgba(16, 13, 30, 0.96)
  );
  box-shadow: 0 28px 60px rgba(8, 5, 20, 0.6);
  padding: clamp(1.2rem, 3vw, 1.8rem);
  display: grid;
  gap: clamp(0.7rem, 1.6vw, 1rem);
  text-align: center;
  animation: ${fadeIn} 220ms ease forwards;
`;

export const OutcomeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 0.35rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: ${({ $variant }) => $variant?.color || '#f5efff'};
  background: ${({ $variant }) =>
    $variant?.background || 'rgba(255,255,255,0.08)'};
  box-shadow: ${({ $variant }) =>
    $variant?.shadow || '0 12px 20px rgba(0, 0, 0, 0.25)'};
`;

export const Title = styled.h2`
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 2rem);
  letter-spacing: 0.08em;
  color: #f6f1ff;
`;

export const Message = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(215, 206, 246, 0.84);
`;

export const ActionButton = styled.button`
  appearance: none;
  border: none;
  cursor: pointer;
  padding: 0.85rem 1.6rem;
  border-radius: 12px;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #190f32;
  background: linear-gradient(135deg, #f9d8ff 0%, #c9a9ff 100%);
  box-shadow: 0 18px 34px rgba(94, 66, 188, 0.35);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 22px 38px rgba(94, 66, 188, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 12px 24px rgba(94, 66, 188, 0.32);
  }
`;

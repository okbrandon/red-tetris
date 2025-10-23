import { useEffect } from 'react';
import { requestPieceMove } from '@/store/slices/socketThunks.js';
import {
  extractMoveDirection,
  shouldIgnoreForGameControls,
} from '@/utils/keyboard.js';

const usePieceControls = ({ isResultModalOpen = false } = {}) => {
  useEffect(() => {
    if (typeof window === 'undefined' || isResultModalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (!event || shouldIgnoreForGameControls(event.target)) return;

      const direction = extractMoveDirection(event);
      if (!direction) return;

      event.preventDefault();
      requestPieceMove({ direction });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isResultModalOpen]);
};

export default usePieceControls;

import { useEffect } from 'react';
import { requestPieceMove } from '@/store/slices/socketThunks.js';
import {
  extractMoveDirection,
  shouldIgnoreForGameControls,
} from '@/utils/keyboard.js';

const usePieceControls = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

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
  }, []);
};

export default usePieceControls;


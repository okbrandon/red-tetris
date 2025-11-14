import { useEffect } from 'react';
import { requestPieceMove } from '@/store/slices/socketThunks.js';
import {
  extractMoveDirection,
  shouldIgnoreForGameControls,
} from '@/utils/keyboard.js';

const AUTO_REPEAT_DIRECTIONS = new Set(['left', 'right', 'down']);
const AUTO_REPEAT_INTERVAL_MS = 50;
const AUTO_REPEAT_DELAY_MS = 250;

const getKeyIdentifier = (event) => event?.code || event?.key;

const usePieceControls = ({ isResultModalOpen = false } = {}) => {
  useEffect(() => {
    if (typeof window === 'undefined' || isResultModalOpen) return undefined;

    const activeRepeats = new Map();

    const stopRepeat = (key) => {
      if (!key || !activeRepeats.has(key)) return;
      const handles = activeRepeats.get(key);
      if (handles?.timeoutId != null) {
        window.clearTimeout(handles.timeoutId);
      }
      if (handles?.intervalId != null) {
        window.clearInterval(handles.intervalId);
      }
      activeRepeats.delete(key);
    };

    const stopAllRepeats = () => {
      activeRepeats.forEach((handles) => {
        if (handles?.timeoutId != null) {
          window.clearTimeout(handles.timeoutId);
        }
        if (handles?.intervalId != null) {
          window.clearInterval(handles.intervalId);
        }
      });
      activeRepeats.clear();
    };

    const handleKeyDown = (event) => {
      if (!event || shouldIgnoreForGameControls(event.target)) return;

      const direction = extractMoveDirection(event);
      if (!direction) return;

      event.preventDefault();

      const keyIdentifier = getKeyIdentifier(event);
      if (event.repeat && activeRepeats.has(keyIdentifier)) {
        return;
      }

      requestPieceMove({ direction });

      if (!AUTO_REPEAT_DIRECTIONS.has(direction)) return;
      if (activeRepeats.has(keyIdentifier)) return;

      const handles = { timeoutId: null, intervalId: null };

      const timeoutId = window.setTimeout(() => {
        requestPieceMove({ direction });
        const intervalId = window.setInterval(() => {
          requestPieceMove({ direction });
        }, AUTO_REPEAT_INTERVAL_MS);

        activeRepeats.set(keyIdentifier, {
          timeoutId: null,
          intervalId,
        });
      }, AUTO_REPEAT_DELAY_MS);

      handles.timeoutId = timeoutId;
      activeRepeats.set(keyIdentifier, handles);
    };

    const handleKeyUp = (event) => {
      if (!event) return;
      const keyIdentifier = getKeyIdentifier(event);
      stopRepeat(keyIdentifier);
    };

    const handleWindowBlur = () => {
      stopAllRepeats();
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        stopAllRepeats();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      if (typeof document !== 'undefined') {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
      }
      stopAllRepeats();
    };
  }, [isResultModalOpen]);
};

export default usePieceControls;

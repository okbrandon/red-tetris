import { deriveCardScale, estimateOpponentCellSize } from '@/utils/arenaSizing';
import propTypes from 'prop-types';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import TetrisGrid from '../TetrisGrid/TetrisGrid';
import {
  EmptyNotice,
  MiniBoard,
  SpecterBadge,
  SpecterCard,
  SpecterColumnContainer,
  SpecterMarquee,
  SpecterScroller,
  SpecterHeader,
  SpecterName,
} from './SpecterColumn.styles';
import { SectionLabel } from '@/pages/Arena/MultiArenaPage/MultiArenaPage.styles';

const SpecterBoard = ({
  opponent,
  index,
  cellSize,
  isActive,
  isInteractive,
  setSelectedId,
}) => {
  return (
    <SpecterCard
      key={`opponent-${index}`}
      data-active={Boolean(isActive)}
      data-interactive={Boolean(isInteractive)}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? Boolean(isActive) : undefined}
      onClick={
        isInteractive ? () => setSelectedId(opponent?.id || null) : undefined
      }
    >
      <SpecterHeader>
        <SpecterBadge>{`Player ${index + 1}`}</SpecterBadge>
        <SpecterName>{opponent.username}</SpecterName>
      </SpecterHeader>
      <MiniBoard>
        <TetrisGrid cellSize={cellSize} grid={opponent.specter} />
      </MiniBoard>
    </SpecterCard>
  );
};

SpecterBoard.propTypes = {
  opponent: propTypes.shape({
    id: propTypes.string,
    username: propTypes.string,
    name: propTypes.string,
    specter: propTypes.arrayOf(propTypes.array),
  }),
  index: propTypes.number.isRequired,
  cellSize: propTypes.number.isRequired,
  isActive: propTypes.bool,
  isInteractive: propTypes.bool,
  setSelectedId: propTypes.func,
};

const SpecterColumn = ({
  isInteractive = false,
  opponents,
  selectedId,
  setSelectedId,
}) => {
  const opponentCount = opponents.length;
  const scrollerRef = useRef(null);
  const marqueeRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const userPausedRef = useRef(false);
  const [scrollMeta, setScrollMeta] = useState({
    overflow: 0,
    enabled: false,
  });
  const [isAutoActive, setIsAutoActive] = useState(false);

  const cardScale = useMemo(
    () => deriveCardScale(opponentCount),
    [opponentCount]
  );
  const cardScaleStyle = useMemo(
    () => ({ '--card-scale': cardScale }),
    [cardScale]
  );
  const specterCellSize = useMemo(
    () => estimateOpponentCellSize(opponentCount),
    [opponentCount]
  );

  useLayoutEffect(() => {
    const container = scrollerRef.current;
    const content = marqueeRef.current;

    if (!container || !content) {
      return undefined;
    }

    const measureScroll = () => {
      const availableHeight = container.clientHeight || 0;
      const contentHeight = content.scrollHeight || 0;
      const overflow = Math.max(0, contentHeight - availableHeight);

      setScrollMeta((prev) => {
        if (prev.overflow === overflow && prev.enabled === overflow > 12) {
          return prev;
        }

        if (overflow <= 12) {
          return {
            overflow: 0,
            enabled: false,
          };
        }

        return {
          overflow,
          enabled: true,
        };
      });

      if (overflow > 0) {
        container.scrollTop = Math.min(container.scrollTop, overflow);
      }
    };

    measureScroll();

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(() => {
        measureScroll();
      });

      observer.observe(container);
      observer.observe(content);

      return () => observer.disconnect();
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', measureScroll);

      return () => {
        window.removeEventListener('resize', measureScroll);
      };
    }

    return undefined;
  }, [opponents, opponentCount]);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, []);

  const pauseAutoScroll = useCallback(() => {
    if (!scrollMeta.enabled) {
      return;
    }

    userPausedRef.current = true;
    setIsAutoActive(false);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    const scheduleTimeout =
      typeof window !== 'undefined' && window.setTimeout
        ? window.setTimeout
        : setTimeout;

    pauseTimeoutRef.current = scheduleTimeout(() => {
      pauseTimeoutRef.current = null;
      userPausedRef.current = false;
      if (scrollMeta.enabled) {
        setIsAutoActive(true);
      }
    }, 4000);
  }, [scrollMeta.enabled]);

  const resumeAutoScroll = useCallback(() => {
    if (!scrollMeta.enabled) {
      return;
    }

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    userPausedRef.current = false;
    setIsAutoActive(true);
  }, [scrollMeta.enabled]);

  useEffect(() => {
    const container = scrollerRef.current;
    const requestFrame =
      typeof window !== 'undefined' && window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : null;
    const cancelFrame =
      typeof window !== 'undefined' && window.cancelAnimationFrame
        ? window.cancelAnimationFrame.bind(window)
        : null;

    if (
      !container ||
      !scrollMeta.enabled ||
      scrollMeta.overflow <= 0 ||
      !requestFrame ||
      !cancelFrame
    ) {
      setIsAutoActive(false);
      return undefined;
    }

    let frameId = 0;
    let lastTimestamp;
    let direction = 1;
    const speed = 20; // pixels per second

    setIsAutoActive(!userPausedRef.current);

    const step = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!userPausedRef.current) {
        const maxScroll = Math.max(
          0,
          container.scrollHeight - container.clientHeight
        );

        if (maxScroll > 0) {
          const distance = (delta / 1000) * speed * direction;
          let next = container.scrollTop + distance;

          if (next <= 0) {
            next = 0;
            direction = 1;
          } else if (next >= maxScroll) {
            next = maxScroll;
            direction = -1;
          }

          container.scrollTop = next;
        }
      }

      frameId = requestFrame(step);
    };

    frameId = requestFrame(step);

    return () => {
      cancelFrame(frameId);
      setIsAutoActive(false);
    };
  }, [scrollMeta.enabled, scrollMeta.overflow]);

  useEffect(() => {
    if (!scrollMeta.enabled) {
      userPausedRef.current = false;
      setIsAutoActive(false);
    }
  }, [scrollMeta.enabled]);

  return (
    <SpecterColumnContainer style={cardScaleStyle}>
      <SectionLabel>{`Opponents ${opponentCount ? `(${opponentCount})` : ''}`}</SectionLabel>
      <SpecterScroller
        ref={scrollerRef}
        data-animated={scrollMeta.enabled && isAutoActive}
        aria-live="polite"
        onWheel={pauseAutoScroll}
        onPointerDown={pauseAutoScroll}
        onTouchStart={pauseAutoScroll}
        onKeyDown={pauseAutoScroll}
        onPointerLeave={resumeAutoScroll}
      >
        <SpecterMarquee
          ref={marqueeRef}
          data-animated={scrollMeta.enabled && isAutoActive}
          aria-label="Opponent boards"
        >
          {opponentCount ? (
            opponents.map((opponent, index) => (
              <SpecterBoard
                key={
                  opponent?.id ||
                  opponent?.username ||
                  opponent?.name ||
                  `opponent-${index}`
                }
                opponent={opponent}
                index={index}
                cellSize={specterCellSize}
                isInteractive={isInteractive}
                isActive={isInteractive ? opponent?.id === selectedId : false}
                setSelectedId={setSelectedId}
              />
            ))
          ) : (
            <EmptyNotice>Waiting for challengers...</EmptyNotice>
          )}
        </SpecterMarquee>
      </SpecterScroller>
    </SpecterColumnContainer>
  );
};

SpecterColumn.propTypes = {
  isInteractive: propTypes.bool,
  opponents: propTypes.arrayOf(propTypes.object).isRequired,
  selectedId: propTypes.string,
  setSelectedId: propTypes.func,
};

export default SpecterColumn;

import {
  Background,
  Grid,
  Pieces,
  Piece,
  Tile,
} from './AnimatedBackground.styles.js';

const SHAPES = {
  I: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  L: [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  J: [
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 2],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  S: [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  T: [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  O: [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
};

const size = 14;

const AnimatedBackground = () => {
  const items = [
    // Far left to center-left
    {
      shape: 'I',
      color: 'rgba(162,89,255,0.95)',
      vars: {
        x: '-48vw',
        xEnd: '-44vw',
        dur: '26s',
        delay: '0s',
        rStart: '-4deg',
        rEnd: '12deg',
        scale: '1.0',
        alpha: '0.6',
      },
    },
    {
      shape: 'J',
      color: 'rgba(173,115,255,0.95)',
      vars: {
        x: '-30vw',
        xEnd: '-26vw',
        dur: '32s',
        delay: '8s',
        rStart: '8deg',
        rEnd: '-6deg',
        scale: '0.9',
        alpha: '0.55',
      },
    },
    {
      shape: 'L',
      color: 'rgba(140,70,230,0.95)',
      vars: {
        x: '-16vw',
        xEnd: '-12vw',
        dur: '24s',
        delay: '6s',
        rStart: '2deg',
        rEnd: '-10deg',
        scale: '1.1',
        alpha: '0.7',
      },
    },

    // Center area (both small and large for depth)
    {
      shape: 'Z',
      color: 'rgba(186,120,255,0.95)',
      vars: {
        x: '-2vw',
        xEnd: '2vw',
        dur: '28s',
        delay: '3s',
        rStart: '-6deg',
        rEnd: '8deg',
        scale: '1.6',
        alpha: '0.5',
      },
    },
    {
      shape: 'O',
      color: 'rgba(150,80,240,0.95)',
      vars: {
        x: '0vw',
        xEnd: '0vw',
        dur: '40s',
        delay: '18s',
        rStart: '0deg',
        rEnd: '0deg',
        scale: '0.85',
        alpha: '0.45',
      },
    },

    // Right side
    {
      shape: 'T',
      color: 'rgba(132,88,255,0.95)',
      vars: {
        x: '18vw',
        xEnd: '24vw',
        dur: '30s',
        delay: '12s',
        rStart: '0deg',
        rEnd: '15deg',
        scale: '1.0',
        alpha: '0.65',
      },
    },
    {
      shape: 'S',
      color: 'rgba(155,95,255,0.95)',
      vars: {
        x: '32vw',
        xEnd: '36vw',
        dur: '26s',
        delay: '9s',
        rStart: '-3deg',
        rEnd: '10deg',
        scale: '1.25',
        alpha: '0.6',
      },
    },
    {
      shape: 'O',
      color: 'rgba(150,80,240,0.95)',
      vars: {
        x: '46vw',
        xEnd: '44vw',
        dur: '34s',
        delay: '15s',
        rStart: '5deg',
        rEnd: '-8deg',
        scale: '0.85',
        alpha: '0.55',
      },
    },

    // Foreground large pieces for depth effect (left and right)
    {
      shape: 'I',
      color: 'rgba(162,89,255,0.9)',
      vars: {
        x: '-22vw',
        xEnd: '-18vw',
        dur: '36s',
        delay: '2s',
        rStart: '-2deg',
        rEnd: '6deg',
        scale: '2.2',
        alpha: '0.38',
      },
    },
    {
      shape: 'T',
      color: 'rgba(132,88,255,0.9)',
      vars: {
        x: '22vw',
        xEnd: '18vw',
        dur: '42s',
        delay: '5s',
        rStart: '4deg',
        rEnd: '-4deg',
        scale: '3.0',
        alpha: '0.32',
      },
    },
  ];

  return (
    <Background>
      <Grid />
      <Pieces>
        {items.map((p, i) => {
          const coords = SHAPES[p.shape] || SHAPES.O;
          const maxX = Math.max(...coords.map(([x]) => x));
          const maxY = Math.max(...coords.map(([, y]) => y));
          const width = (maxX + 1) * size;
          const height = (maxY + 1) * size;

          return (
            <Piece
              key={i}
              style={{
                '--x': p.vars.x,
                '--xEnd': p.vars.xEnd,
                '--dur': p.vars.dur,
                '--delay': p.vars.delay,
                '--rStart': p.vars.rStart,
                '--rEnd': p.vars.rEnd,
                '--scale': p.vars.scale,
                '--alpha': p.vars.alpha,
                width: `${width}px`,
                height: `${height}px`,
              }}
            >
              {coords.map(([x, y], idx) => (
                <Tile
                  key={idx}
                  $color={p.color}
                  style={{ left: `${x * size}px`, top: `${y * size}px` }}
                />
              ))}
            </Piece>
          );
        })}
      </Pieces>
    </Background>
  );
};

export default AnimatedBackground;

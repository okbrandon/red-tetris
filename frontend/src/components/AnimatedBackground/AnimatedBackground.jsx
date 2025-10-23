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

const TILE_SIZE = 14;
const DEFAULT_SHAPE = 'O';

const PIECE_DEFINITIONS = [
  {
    id: 'far-left-primary',
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
    id: 'mid-left',
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
    id: 'inner-left',
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
  {
    id: 'center-large',
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
    id: 'center-small',
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
  {
    id: 'right-primary',
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
    id: 'right-secondary',
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
    id: 'far-right',
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
  {
    id: 'foreground-left',
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
    id: 'foreground-right',
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

const getShapeCoordinates = (shape) => SHAPES[shape] ?? SHAPES[DEFAULT_SHAPE];

const computeDimensions = (coordinates) => {
  const [maxX, maxY] = coordinates.reduce(
    ([largestX, largestY], [x, y]) => [
      Math.max(largestX, x),
      Math.max(largestY, y),
    ],
    [0, 0]
  );

  return {
    width: (maxX + 1) * TILE_SIZE,
    height: (maxY + 1) * TILE_SIZE,
  };
};

const createPieceStyle = (vars, { width, height }) => ({
  '--x': vars.x,
  '--xEnd': vars.xEnd,
  '--dur': vars.dur,
  '--delay': vars.delay,
  '--rStart': vars.rStart,
  '--rEnd': vars.rEnd,
  '--scale': vars.scale,
  '--alpha': vars.alpha,
  width: `${width}px`,
  height: `${height}px`,
});

const createTileStyle = ([x, y]) => ({
  left: `${x * TILE_SIZE}px`,
  top: `${y * TILE_SIZE}px`,
});

const PIECES = PIECE_DEFINITIONS.map((piece) => {
  const coordinates = getShapeCoordinates(piece.shape);
  const dimensions = computeDimensions(coordinates);

  return {
    ...piece,
    coordinates,
    style: createPieceStyle(piece.vars, dimensions),
    tileOffsets: coordinates.map(createTileStyle),
  };
});

const AnimatedBackground = () => (
  <Background>
    <Grid />
    <Pieces>
      {PIECES.map((piece) => (
        <Piece key={piece.id} style={piece.style}>
          {piece.coordinates.map(([x, y]) => (
            <Tile
              key={`${piece.id}-${x}-${y}`}
              $color={piece.color}
              style={createTileStyle([x, y])}
            />
          ))}
        </Piece>
      ))}
    </Pieces>
  </Background>
);

export default AnimatedBackground;

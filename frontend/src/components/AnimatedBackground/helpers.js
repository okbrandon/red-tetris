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

export {
  getShapeCoordinates,
  computeDimensions,
  createPieceStyle,
  createTileStyle,
};

export const deriveCardScale = (count) => {
  if (count <= 1) return 1;
  if (count === 2) return 0.95;
  if (count === 3) return 0.9;
  const scaled = 0.9 - (count - 3) * 0.045;
  return Math.max(scaled, 0.6);
};

export const estimateOpponentCellSize = (
  baseCellSize,
  opponentCount,
  tallestBoardRows = 20
) => {
  const preferred = Math.max(10, Math.floor(baseCellSize * 0.45));
  const minimum = Math.max(4, Math.floor(baseCellSize * 0.18));
  const maximum = Math.max(preferred, Math.floor(baseCellSize * 0.55));

  if (!opponentCount) {
    return Math.max(minimum, Math.min(preferred, maximum));
  }

  if (typeof window === 'undefined') {
    return Math.max(minimum, Math.min(preferred, maximum));
  }

  const { innerHeight: height, innerWidth: width } = window;
  const arenaPadding = width >= 880 ? 80 : 48;
  const columnPadding = width >= 880 ? 56 : 40;
  const spacing = width >= 880 ? 18 : 14;
  const paddingAdjustedHeight =
    Math.max(height - arenaPadding, 320) - columnPadding;
  const availablePerCard =
    (paddingAdjustedHeight - spacing * Math.max(opponentCount - 1, 0)) /
    opponentCount;

  const chromeAllowance = 64;
  const heightRatio = (availablePerCard - chromeAllowance) / tallestBoardRows;
  const heightBound = Number.isFinite(heightRatio)
    ? Math.floor(heightRatio)
    : preferred;
  const safeCandidate = heightBound > 0 ? heightBound : minimum;

  const soloCap = Math.max(minimum, Math.floor(baseCellSize * 0.42));
  const duoCap = Math.max(minimum, Math.floor(baseCellSize * 0.36));
  const tierCap =
    opponentCount === 1
      ? Math.min(maximum, soloCap)
      : opponentCount === 2
        ? Math.min(maximum, duoCap)
        : maximum;

  return Math.max(minimum, Math.min(safeCandidate, tierCap));
};

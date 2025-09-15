import { useEffect, useMemo, useRef, useState } from 'react';

/*
** TO REMOVE when backend integration is done
*/

const PIECES = [
    { id: 1, name: 'I', blocks: [[0,1],[1,1],[2,1],[3,1]] },
    { id: 2, name: 'L', blocks: [[0,0],[0,1],[1,1],[2,1]] },
    { id: 3, name: 'J', blocks: [[2,0],[0,1],[1,1],[2,1]] },
    { id: 4, name: 'Z', blocks: [[0,0],[1,0],[1,1],[2,1]] },
    { id: 5, name: 'O', blocks: [[1,0],[2,0],[1,1],[2,1]] },
    { id: 6, name: 'T', blocks: [[1,0],[0,1],[1,1],[2,1]] },
    { id: 7, name: 'S', blocks: [[1,0],[2,0],[0,1],[1,1]] },
];

const createEmptyGrid = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(0));

const getPieceWidth = (blocks) => {
    let minX = Infinity, maxX = -Infinity;
    for (const [x] of blocks) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
    return { minX, maxX, width: maxX - minX + 1 };
};

const randomPiece = () => {
    const idx = Math.floor(Math.random() * PIECES.length);
    return { ...PIECES[idx], blocks: PIECES[idx].blocks.map(([x,y]) => [x,y]), orientation: 0 };
};

const canPlace = (grid, piece, pos) => {
    const rows = grid.length, cols = grid[0].length;
    for (const [bx, by] of piece.blocks) {
        const x = pos.x + bx; const y = pos.y + by;
        if (x < 0 || x >= cols || y < 0 || y >= rows) return false;
        if (grid[y][x] !== 0) return false;
    }
    return true;
};

const mergePiece = (grid, piece, pos) => {
    const next = grid.map((row) => row.slice());
    for (const [bx, by] of piece.blocks) {
        const x = pos.x + bx; const y = pos.y + by;
        if (y >= 0 && y < next.length && x >= 0 && x < next[0].length) {
            next[y][x] = piece.id;
        }
    }
    return next;
};

const clearLines = (grid) => {
    const cols = grid[0].length;
    const remaining = grid.filter((row) => row.some((v) => v === 0));
    const cleared = grid.length - remaining.length;
    const newRows = Array.from({ length: cleared }, () => Array(cols).fill(0));
    return { grid: [...newRows, ...remaining], cleared };
};

export function useMockTetris({ rows = 20, cols = 10, speedMs = 650 } = {}) {
    const [landedGrid, setLandedGrid] = useState(() => createEmptyGrid(rows, cols));
    const [matrix, setMatrix] = useState(() => createEmptyGrid(rows, cols));
    const [score, setScore] = useState(0);
    const [nextQueue, setNextQueue] = useState(() => Array.from({ length: 5 }, randomPiece));
    const [dropAnimMs, setDropAnimMs] = useState(0);
    const [justSpawned, setJustSpawned] = useState(false);
    const [clearingRows, setClearingRows] = useState([]);
    const [clearAnimMs] = useState(220);

    const pieceRef = useRef(null);
    const posRef = useRef({ x: 0, y: 0 });
    const droppingRef = useRef(false);
    const clearingRef = useRef(false);
    const rowsCols = useMemo(() => ({ rows, cols }), [rows, cols]);

    const redraw = () => {
        // Keep only landed cells in matrix; active piece is rendered as overlay.
        // Force re-render even when landedGrid reference is unchanged.
        setMatrix(landedGrid.slice());
    };

    const attemptMove = (dx, dy) => {
        const piece = pieceRef.current; if (!piece) return false;
        const pos = posRef.current; const grid = landedGrid;
        const nextPos = { x: pos.x + dx, y: pos.y + dy };
        if (canPlace(grid, piece, nextPos)) {
            posRef.current = nextPos;
            redraw();
            return true;
        }
        return false;
    };

    const rotateBlocksCW = (blocks) => blocks.map(([x, y]) => [y, 3 - x]);
    const rotateBlocksCCW = (blocks) => blocks.map(([x, y]) => [3 - y, x]);

    // SRS kick tables for JLSTZ and I pieces
    const getJLSTZKicks = (from, to) => {
        if (from === 0 && to === 1) return [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]];
        if (from === 1 && to === 2) return [[0,0], [1,0], [1,-1], [0,2], [1,2]];
        if (from === 2 && to === 3) return [[0,0], [1,0], [1,1], [0,-2], [1,-2]];
        if (from === 3 && to === 0) return [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]];
        if (from === 0 && to === 3) return [[0,0], [1,0], [1,1], [0,-2], [1,-2]];
        if (from === 3 && to === 2) return [[0,0], [1,0], [1,-1], [0,2], [1,2]];
        if (from === 2 && to === 1) return [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]];
        if (from === 1 && to === 0) return [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]];
        return [[0,0]];
    };

    const getIKicks = (from, to) => {
        if (from === 0 && to === 1) return [[0,0], [-2,0], [1,0], [-2,-1], [1,2]];
        if (from === 1 && to === 2) return [[0,0], [-1,0], [2,0], [-1,2], [2,-1]];
        if (from === 2 && to === 3) return [[0,0], [2,0], [-1,0], [2,1], [-1,-2]];
        if (from === 3 && to === 0) return [[0,0], [1,0], [-2,0], [1,-2], [-2,1]];
        if (from === 0 && to === 3) return [[0,0], [-1,0], [2,0], [-1,2], [2,-1]];
        if (from === 3 && to === 2) return [[0,0], [2,0], [-1,0], [2,1], [-1,-2]];
        if (from === 2 && to === 1) return [[0,0], [1,0], [-2,0], [1,-2], [-2,1]];
        if (from === 1 && to === 0) return [[0,0], [-2,0], [1,0], [-2,-1], [1,2]];
        return [[0,0]];
    };

    const attemptRotate = (dir = 'cw') => {
        const piece = pieceRef.current; if (!piece) return false;
        if (piece.id === 5) return true; // O piece: rotation does not change shape
        const grid = landedGrid; const pos = posRef.current;
        const from = piece.orientation || 0;
        const to = dir === 'cw' ? (from + 1) % 4 : (from + 3) % 4;
        const rotatedBlocks = dir === 'cw' ? rotateBlocksCW(piece.blocks) : rotateBlocksCCW(piece.blocks);
        const candidate = { ...piece, blocks: rotatedBlocks, orientation: to };
        const kicks = (piece.id === 1 ? getIKicks : getJLSTZKicks)(from, to);
        for (const [dx, dy] of kicks) {
            const testPos = { x: pos.x + dx, y: pos.y + dy };
            if (canPlace(grid, candidate, testPos)) {
                pieceRef.current = candidate;
                posRef.current = testPos;
                redraw();
                return true;
            }
        }
        return false;
    };

    const spawnPiece = () => {
        const queue = [...nextQueue];
        const piece = queue.shift() || randomPiece();
        while (queue.length < 5) queue.push(randomPiece());
        setNextQueue(queue);

        const { minX, width } = getPieceWidth(piece.blocks);
        const startX = Math.floor((rowsCols.cols - width) / 2) - minX;
        const startY = 0;
        pieceRef.current = piece;
        posRef.current = { x: startX, y: startY };
        // Disable animation for the initial appearance of a new piece
        setJustSpawned(true);

        setLandedGrid((g) => {
            if (!canPlace(g, piece, posRef.current)) {
                setScore(0);
                return createEmptyGrid(rowsCols.rows, rowsCols.cols);
            }
            return g;
        });
        // After the new piece has appeared, re-enable animation on next frame
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            requestAnimationFrame(() => setJustSpawned(false));
        } else {
            setTimeout(() => setJustSpawned(false), 0);
        }
    };

    const step = () => {
        if (droppingRef.current || clearingRef.current) return;
        const piece = pieceRef.current;
        if (!piece) { spawnPiece(); return; }

        const grid = landedGrid;
        const pos = posRef.current;
        const nextPos = { x: pos.x, y: pos.y + 1 };

        if (canPlace(grid, piece, nextPos)) {
            posRef.current = nextPos;
            redraw();
        } else {
            const locked = mergePiece(grid, piece, pos);
            // identify full rows
            const full = [];
            for (let y = 0; y < locked.length; y++) {
                if (locked[y].every((v) => v !== 0)) full.push(y);
            }

            setLandedGrid(locked);
            pieceRef.current = null;
            posRef.current = { x: 0, y: 0 };

            if (full.length > 0) {
                setClearingRows(full);
                clearingRef.current = true;
                setTimeout(() => {
                    const remaining = locked.filter((_, y) => !full.includes(y));
                    const extra = Array.from({ length: full.length }, () => Array(locked[0].length).fill(0));
                    const finalGrid = [...extra, ...remaining];
                    setLandedGrid(finalGrid);
                    setClearingRows([]);
                    clearingRef.current = false;
                    setScore((s) => s + full.length * 100);
                    spawnPiece();
                }, clearAnimMs);
            } else {
                spawnPiece();
            }
        }
    };

    useEffect(() => { spawnPiece(); }, []);

    useEffect(() => {
        redraw();
        const id = setInterval(() => {
            step();
        }, speedMs);
        return () => clearInterval(id);
    }, [landedGrid, speedMs]);

    return {
        matrix,
        score,
        nextPieces: nextQueue.slice(0, 3),
        moveLeft: () => attemptMove(-1, 0),
        moveRight: () => attemptMove(1, 0),
        rotateCW: () => attemptRotate('cw'),
        rotateCCW: () => attemptRotate('ccw'),
        currentPiece: pieceRef.current,
        position: posRef.current,
        animateMs: justSpawned ? 0 : (dropAnimMs || 180),
        clearingRows,
        clearAnimMs,
        hardDrop: () => {
            const piece = pieceRef.current; if (!piece) return false;
            if (droppingRef.current) return false;
            const x = posRef.current.x;
            let y = posRef.current.y;
            while (canPlace(landedGrid, piece, { x, y: y + 1 })) y += 1;
            const distance = y - posRef.current.y;

            if (distance <= 0) {
                const locked = mergePiece(landedGrid, piece, posRef.current);
                // determine full rows and animate
                const full = [];
                for (let yy = 0; yy < locked.length; yy++) {
                    if (locked[yy].every((v) => v !== 0)) full.push(yy);
                }
                setLandedGrid(locked);
                pieceRef.current = null;
                posRef.current = { x: 0, y: 0 };
                setDropAnimMs(0);
                if (full.length > 0) {
                    setClearingRows(full);
                    clearingRef.current = true;
                    setTimeout(() => {
                        const remaining = locked.filter((_, yy) => !full.includes(yy));
                        const extra = Array.from({ length: full.length }, () => Array(locked[0].length).fill(0));
                        const finalGrid = [...extra, ...remaining];
                        setLandedGrid(finalGrid);
                        setClearingRows([]);
                        clearingRef.current = false;
                        setScore((s) => s + full.length * 100);
                        spawnPiece();
                    }, clearAnimMs);
                } else {
                    spawnPiece();
                }
                return true;
            }

            const duration = Math.min(600, 60 + distance * 22);
            droppingRef.current = true;
            setDropAnimMs(duration);
            posRef.current = { x, y };
            redraw();
            setTimeout(() => {
                if (!pieceRef.current || droppingRef.current === false) return;
                const locked = mergePiece(landedGrid, piece, posRef.current);
                // determine full rows and animate
                const full = [];
                for (let yy = 0; yy < locked.length; yy++) {
                    if (locked[yy].every((v) => v !== 0)) full.push(yy);
                }
                setLandedGrid(locked);
                pieceRef.current = null;
                posRef.current = { x: 0, y: 0 };
                setDropAnimMs(0);
                droppingRef.current = false;
                if (full.length > 0) {
                    setClearingRows(full);
                    clearingRef.current = true;
                    setTimeout(() => {
                        const remaining = locked.filter((_, yy) => !full.includes(yy));
                        const extra = Array.from({ length: full.length }, () => Array(locked[0].length).fill(0));
                        const finalGrid = [...extra, ...remaining];
                        setLandedGrid(finalGrid);
                        setClearingRows([]);
                        clearingRef.current = false;
                        setScore((s) => s + full.length * 100);
                        spawnPiece();
                    }, clearAnimMs);
                } else {
                    spawnPiece();
                }
            }, duration);
            return true;
        },
    };
}

export default useMockTetris;

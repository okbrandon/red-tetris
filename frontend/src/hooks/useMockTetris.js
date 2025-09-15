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
    return { ...PIECES[idx], blocks: PIECES[idx].blocks.map(([x,y]) => [x,y]) };
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

    const pieceRef = useRef(null);
    const posRef = useRef({ x: 0, y: 0 });
    const rowsCols = useMemo(() => ({ rows, cols }), [rows, cols]);

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

        setLandedGrid((g) => {
            if (!canPlace(g, piece, posRef.current)) {
                setScore(0);
                return createEmptyGrid(rowsCols.rows, rowsCols.cols);
            }
            return g;
        });
    };

    const step = () => {
        const piece = pieceRef.current;
        if (!piece) { spawnPiece(); return; }

        const grid = landedGrid;
        const pos = posRef.current;
        const nextPos = { x: pos.x, y: pos.y + 1 };

        if (canPlace(grid, piece, nextPos)) {
            posRef.current = nextPos;
            setMatrix(mergePiece(grid, piece, nextPos));
        } else {
            const locked = mergePiece(grid, piece, pos);
            const { grid: clearedGrid, cleared } = clearLines(locked);
            if (cleared > 0) setScore((s) => s + cleared * 100);
            setLandedGrid(clearedGrid);
            pieceRef.current = null;
            posRef.current = { x: 0, y: 0 };
            spawnPiece();
        }
    };

    useEffect(() => { spawnPiece(); }, []);

    useEffect(() => {
        if (pieceRef.current) {
            setMatrix(mergePiece(landedGrid, pieceRef.current, posRef.current));
        } else {
            setMatrix(landedGrid);
        }
        const id = setInterval(() => {
            step();
        }, speedMs);
        return () => clearInterval(id);
    }, [landedGrid, speedMs]);

    return {
        matrix,
        score,
        nextPieces: nextQueue.slice(0, 3),
    };
}

export default useMockTetris;

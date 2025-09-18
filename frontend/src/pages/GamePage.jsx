import { useMemo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { LogoTitle } from './HomePage.styled';
import BackButton from '../components/BackButton';
import SoloGameView from '../components/SoloGameView';
import MultiplayerArena from '../components/MultiplayerArena';
import { PageWrapper } from './GamePage.styled';

const ROWS = 20;
const COLS = 10;

const PIECE_SHAPES = {
    I: { id: 1, name: 'I', blocks: [[0,1],[1,1],[2,1],[3,1]] },
    L: { id: 2, name: 'L', blocks: [[0,0],[0,1],[1,1],[2,1]] },
    J: { id: 3, name: 'J', blocks: [[2,0],[0,1],[1,1],[2,1]] },
    Z: { id: 4, name: 'Z', blocks: [[0,0],[1,0],[1,1],[2,1]] },
    O: { id: 5, name: 'O', blocks: [[1,0],[2,0],[1,1],[2,1]] },
    T: { id: 6, name: 'T', blocks: [[1,0],[0,1],[1,1],[2,1]] },
    S: { id: 7, name: 'S', blocks: [[1,0],[2,0],[0,1],[1,1]] },
};

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const createBoardFromProfile = ({ heights = [], penaltyLines = 0 }) => {
    const board = createEmptyBoard();
    const clampedPenalty = Math.max(0, Math.min(ROWS, penaltyLines));
    for (let i = 0; i < clampedPenalty; i += 1) {
        board[ROWS - 1 - i] = Array(COLS).fill(8);
    }

    heights.forEach((height, column) => {
        const clampedHeight = Math.max(0, Math.min(ROWS - clampedPenalty, height || 0));
        const fillValue = ((column % 7) + 1);
        for (let offset = 0; offset < clampedHeight; offset += 1) {
            const rowIndex = ROWS - 1 - clampedPenalty - offset;
            if (rowIndex >= 0 && rowIndex < ROWS) {
                board[rowIndex][column] = fillValue;
            }
        }
    });

    return board;
};

const computeSpectrumFromBoard = (board) => {
    const spectrum = Array(COLS).fill(0);
    for (let x = 0; x < COLS; x += 1) {
        for (let y = 0; y < ROWS; y += 1) {
            if (board[y][x] > 0) {
                spectrum[x] = ROWS - y;
                break;
            }
        }
    }
    return spectrum;
};

const createMockPlayer = ({
    id,
    name,
    heights,
    penaltyLines,
    isSelf = false,
    stats = {},
    status,
    activePieceKey,
    activePos,
}) => {
    const board = createBoardFromProfile({ heights, penaltyLines });
    return {
        id,
        name,
        isSelf,
        board,
        stats,
        status,
        activePiece: activePieceKey ? PIECE_SHAPES[activePieceKey] : undefined,
        activePos,
        spectrum: computeSpectrumFromBoard(board),
        clearingRows: [],
    };
};

const buildMockMultiplayer = () => ({
    sharedPieceQueue: ['T', 'S', 'O', 'I', 'L'],
    players: [
        createMockPlayer({
            id: 'you',
            name: 'You',
            isSelf: true,
            heights: [4, 7, 6, 9, 5, 4, 8, 6, 5, 7],
            penaltyLines: 0,
            stats: { linesCleared: 12, penaltiesSent: 8, penaltiesReceived: 2 },
            activePieceKey: 'T',
            activePos: { x: 3, y: 4 },
        }),
        createMockPlayer({
            id: 'kai',
            name: 'Kai',
            heights: [8, 9, 9, 10, 11, 8, 12, 11, 10, 8],
            penaltyLines: 2,
            stats: { linesCleared: 9, penaltiesSent: 6, penaltiesReceived: 5 },
            activePieceKey: 'L',
            activePos: { x: 4, y: 2 },
        }),
        createMockPlayer({
            id: 'mira',
            name: 'Mira',
            heights: [5, 4, 7, 6, 5, 9, 12, 11, 9, 7],
            penaltyLines: 1,
            stats: { linesCleared: 14, penaltiesSent: 10, penaltiesReceived: 3 },
            activePieceKey: 'S',
            activePos: { x: 2, y: 3 },
        }),
        createMockPlayer({
            id: 'zoe',
            name: 'Zoe',
            heights: [3, 5, 4, 3, 6, 4, 5, 4, 3, 2],
            penaltyLines: 0,
            stats: { linesCleared: 7, penaltiesSent: 3, penaltiesReceived: 1 },
            activePieceKey: 'I',
            activePos: { x: 5, y: 1 },
        }),
        createMockPlayer({
            id: 'caca',
            name: 'caca',
            heights: [3, 5, 4, 3, 6, 4, 5, 4, 3, 2],
            penaltyLines: 0,
            stats: { linesCleared: 7, penaltiesSent: 3, penaltiesReceived: 1 },
            activePieceKey: 'I',
            activePos: { x: 5, y: 1 },
        }),
        createMockPlayer({
            id: 'mira',
            name: 'Mira',
            heights: [5, 4, 7, 6, 5, 9, 12, 11, 9, 7],
            penaltyLines: 1,
            stats: { linesCleared: 14, penaltiesSent: 10, penaltiesReceived: 3 },
            activePieceKey: 'S',
            activePos: { x: 2, y: 3 },
        }),
    ],
});

const GamePage = () => {
    const mode = useSelector((state) => state.game.mode);
    const multiplayer = useSelector((state) => state.game.multiplayer);

    const fallbackMultiplayer = useMemo(() => buildMockMultiplayer(), []);
    const players = multiplayer?.players?.length ? multiplayer.players : fallbackMultiplayer.players;

    return (
        <PageWrapper>
            <BackButton />
            <GameLogoTitle>{mode === 'multiplayer' ? 'Multiplayer' : 'Game'}</GameLogoTitle>
            {mode === 'multiplayer'
                ? <MultiplayerArena players={players} />
                : <SoloGameView />}
        </PageWrapper>
    );
};

const GameLogoTitle = styled(LogoTitle)`
    font-size: clamp(2.1rem, 4vw, 2.8rem);
    margin-bottom: clamp(0.5rem, 1.8vh, 1.2rem);
`;

export default GamePage;

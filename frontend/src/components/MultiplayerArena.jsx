import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import TetrisGrid from './TetrisGrid';
import { useSelector } from 'react-redux';
import GameView from './GameView.jsx';
import useResponsiveValue from '../hooks/useResponsiveValue.js';
import { deriveBoardDimensions } from '../utils/tetris.js';
import { parsePath } from 'react-router-dom';

const ArenaContainer = styled.div`
    width: 80%;
    height: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    box-sizing: border-box;
`;

const ArenaLayout = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-shrink: 2 1;
    box-sizing: border-box;
    align-items: center;
    justify-items: center;
    overflow: hidden;
    gap: clamp(12px, 2vw, 20px);
    padding: clamp(12px, 2vw, 20px);
    box-sizing: border-box;

    @media (min-width: 880px) {
        grid-template-columns: clamp(220px, 24vw, 280px) minmax(0, 1fr);
        grid-template-areas: 'side main';
        align-items: stretch;
        justify-items: stretch;
    }
`;

const OpponentColumn = styled.section`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 0;
    max-height: 100%;
    padding: 20px 0;
    border: 1px solid red;
`;

const SectionLabel = styled.h3`
    margin: 0;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(215, 206, 246, 0.7);
    text-align: center;
`;

const OpponentScroller = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.55rem;
    padding-right: 0.25rem;
    height: 100%;
    width: 100%;
    box-sizing: border-box;

    & > * {
        flex-shrink: 0;
        height: fit-content;
    }

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(162, 130, 235, 0.32);
        border-radius: 4px;
    }

    @media (max-width: 879px) {
        padding-right: 0;
    }
`;

const OpponentCard = styled.div`
    border-radius: 14px;
    height: fit-content;
    border: 1px solid rgba(142, 107, 225, 0.22);
    background: linear-gradient(155deg, rgba(26, 22, 45, 0.85), rgba(16, 13, 28, 0.92));
    padding: 10px 15px;
    display: grid;
    gap: 0.4rem;
    justify-items: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 16px 26px rgba(10, 7, 20, 0.34);
    width: 150px;
    box-sizing: border-box;
`;

const OpponentName = styled.span`
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(229, 222, 255, 0.88);
`;

const OpponentHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    text-align: center;
`;

const MiniBoard = styled.div`
    border-radius: 10px;
    overflow: hidden;
    opacity: 0.9;
    pointer-events: none;
`;

const EmptyNotice = styled.p`
    margin: 0;
    padding: clamp(0.6rem, 1.4vw, 0.85rem);
    border-radius: 12px;
    border: 1px solid rgba(142, 107, 225, 0.2);
    background: rgba(21, 19, 34, 0.54);
    font-size: 0.76rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(199, 191, 234, 0.68);
`;

const MainColumn = styled.section`
    display: flex;
    flex-direction: column;
    gap: clamp(0.6rem, 1.4vw, 1rem);
    min-height: 0;
    align-items: center;
    justify-content: center;
    max-height: 100%;
`;

const OpponentBoard = ({ opponent, index, cellSize }) => {
    const board = opponent?.specter ?? [];
    const { rows, cols } = deriveBoardDimensions(board);
    const name = opponent?.username ?? `Opponent ${index + 1}`;

    return (
        <OpponentCard>
            <OpponentHeader>
                <OpponentName>{name}</OpponentName>
            </OpponentHeader>
            <MiniBoard>
                <TetrisGrid
                    rows={rows}
                    cols={cols}
                    cellSize={cellSize}
                    showGrid={false}
                    grid={board}
                />
            </MiniBoard>
        </OpponentCard>
    );
};

OpponentBoard.propTypes = {
    opponent: PropTypes.shape({
        id: PropTypes.string,
        username: PropTypes.string,
        name: PropTypes.string,
        specter: PropTypes.array,
        board: PropTypes.array,
        stats: PropTypes.object,
    }).isRequired,
    index: PropTypes.number.isRequired,
    cellSize: PropTypes.number.isRequired,
};

const computePrimaryCellSize = () => {
    if (typeof window === 'undefined') return 32;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sidebarWidth = w >= 880 ? Math.min(Math.max(w * 0.24, 220), 320) : 0;
    const layoutPadding = w >= 880 ? 56 : 32;
    const availableWidth = w - sidebarWidth - layoutPadding;
    const widthBased = availableWidth / 10;
    const verticalPadding = Math.max(h * 0.3, 260);
    const availableHeight = Math.max(h - verticalPadding, 240);
    const heightBased = availableHeight / 20;
    const raw = Math.floor(Math.min(widthBased, heightBased));
    return Math.max(20, Math.min(raw, 42));
};

const you = {
    "id": "j7yvRqSOIVlKY2TfAAAr",
    "username": "test",
    "hasLost": false,
    "specter": [
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            }
        ],
        [
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": false,
                "color": "transparent",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            },
            {
                "filled": true,
                "color": "gray",
                "indestructible": false,
                "ghost": false
            }
        ]
    ]
}

const multiplayer = {
    "players": [
        {
            "id": "ljdqYo-P00VOmxygAAAp",
            "username": "test",
            "specter": [
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ]
            ]
        },
        {
            "id": "ljdqYo-P00VOmxygAAAt",
            "username": "testo",
            "specter": [
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ]
            ]
        },
        {
            "id": "ljdqYo-P00VOmxygAAAu",
            "username": "testote",
            "specter": [
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ],
                [
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": true,
                        "color": "gray",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    },
                    {
                        "filled": false,
                        "color": "transparent",
                        "indestructible": false,
                        "ghost": false
                    }
                ]
            ]
        },
    ],
    "maxPlayers": 4,
};

const MultiplayerArena = ({ grid }) => {
    const cellSize = useResponsiveValue(useCallback(computePrimaryCellSize, []));

    // const { you, multiplayer } = useSelector((state) => state.game);

    const player = you ?? null;

    const yourId = player?.id;
    const opponents = Array.isArray(multiplayer?.players)
        ? multiplayer.players.filter((opponent) => (yourId ? opponent?.id !== yourId : true))
        : [];

    const opponentCellSize = useMemo(() => Math.max(10, Math.floor(cellSize * 0.4)), [cellSize]);

    return (
        <ArenaContainer>
            <ArenaLayout>
                <OpponentColumn>
                    <SectionLabel>{`Opponents${opponents.length ? ` (${opponents.length})` : ''}`}</SectionLabel>
                    {opponents.length ? (
                        <OpponentScroller aria-label='Opponent boards'>
                            {opponents.map((opponent, index) => (
                                <OpponentBoard
                                    key={opponent?.id || opponent?.username || opponent?.name || `opponent-${index}`}
                                    opponent={opponent}
                                    index={index}
                                    cellSize={opponentCellSize}
                                />
                            ))}
                        </OpponentScroller>
                    ) : (
                        <EmptyNotice>Waiting for challengers…</EmptyNotice>
                    )}
                </OpponentColumn>

                <MainColumn>
                    <GameView grid={grid} />
                </MainColumn>
            </ArenaLayout>
        </ArenaContainer>
    );
};

export default MultiplayerArena;

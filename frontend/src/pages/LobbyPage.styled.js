import styled from 'styled-components';

export const Wrapper = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: #0e0e0e;
    color: #f0f0f0;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
`;

export const Glow = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;
    z-index: 0;
    background: radial-gradient(circle, #a259ff, transparent);
    pointer-events: none;

    &.top-right {
        top: -100px;
        right: -100px;
        width: 300px;
        height: 300px;
    }

    &.bottom-left {
        bottom: -100px;
        left: -100px;
        width: 400px;
        height: 400px;
    }
`;

export const Title = styled.h2`
    font-size: 2.5rem;
    color: #ffffff;
    text-shadow: 0 0 8px #a259ff88;
    z-index: 1;
    margin-bottom: 2rem;
`;

export const Username = styled.p`
    font-size: 1.2rem;
    color: #cccccc;
    margin-bottom: 1rem;
    z-index: 1;
`;

export const PlayerList = styled.ul`
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
    z-index: 1;
`;

export const Player = styled.li`
    background-color: #1a1a1a;
    border: 1px solid #a259ff55;
    border-radius: 8px;
    padding: 0.8rem 1.2rem;
    margin: 0.5rem 0;
    box-shadow: 0 0 6px #a259ff22;
    text-align: center;
`;

export const StartButton = styled.button`
    background: none;
    border: 2px solid #a259ff;
    color: #a259ff;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-shadow: 0 0 5px #a259ff88;
    z-index: 1;

    &:hover {
        background-color: #a259ff11;
        box-shadow: 0 0 10px #a259ff, 0 0 20px #a259ff44;
    }
`;

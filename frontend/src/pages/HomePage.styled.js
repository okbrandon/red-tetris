import styled, { keyframes } from 'styled-components';

export const Wrapper = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: #0e0e0e;
    color: #f0f0f0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
`;

const glow = keyframes`
    0% { text-shadow: 0 0 10px #a259ff, 0 0 20px #6f42c1, 0 0 30px #a259ff; }
    50% { text-shadow: 0 0 20px #a259ff, 0 0 30px #6f42c1, 0 0 40px #a259ff; }
    100% { text-shadow: 0 0 10px #a259ff, 0 0 20px #6f42c1, 0 0 30px #a259ff; }
`;

export const LogoTitle = styled.h1`
    font-family: 'Press Start 2P', monospace;
    font-size: 3rem;
    color: #ffffff;
    text-align: center;
    margin-bottom: 2rem;
    animation: ${glow} 3s ease-in-out infinite;
    letter-spacing: 4px;
    text-transform: uppercase;
    z-index: 1;
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

export const Input = styled.input`
    background: none;
    border: 2px solid #a259ff;
    color: #ffffff;
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    outline: none;
    z-index: 1;
    text-align: center;

    &::placeholder {
        color: #a259ff88;
    }

    &:focus {
        box-shadow: 0 0 8px #a259ffcc;
    }
`;

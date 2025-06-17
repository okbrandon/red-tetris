import styled from 'styled-components';

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

export const Glow = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;
    z-index: 0;
    background: radial-gradient(circle, #a259ff, transparent);
    pointer-events: none;

    &.top-left {
        top: -100px;
        left: -100px;
        width: 300px;
        height: 300px;
    }

    &.bottom-right {
        bottom: -100px;
        right: -100px;
        width: 400px;
        height: 400px;
    }
`;

export const Title = styled.h1`
    font-size: 3rem;
    margin-bottom: 2rem;
    color: #ffffff;
    text-shadow: 0 0 10px #a259ff, 0 0 20px #a259ff33;
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

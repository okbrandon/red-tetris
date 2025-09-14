import styled, { keyframes } from 'styled-components';

export const Wrapper = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: transparent;
    color: #f0f0f0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 1; /* sit above fixed background */
    overflow: hidden;
`;

const glow = keyframes`
    0% { text-shadow: 0 0 6px #a259ffb0, 0 0 12px #6f42c180, 0 0 18px #a259ff60; }
    50% { text-shadow: 0 0 10px #a259ffcc, 0 0 18px #6f42c1a0, 0 0 26px #a259ff80; }
    100% { text-shadow: 0 0 6px #a259ffb0, 0 0 12px #6f42c180, 0 0 18px #a259ff60; }
`;

export const LogoTitle = styled.h1`
    font-family: 'Press Start 2P', monospace;
    font-size: 2.5rem;
    color: transparent;
    background-image: linear-gradient(90deg, #ffffff 0%, #e9e1ff 50%, #ffffff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    text-align: center;
    margin: 0 0 1.5rem 0;
    animation: ${glow} 3s ease-in-out infinite;
    letter-spacing: 4px;
    text-transform: uppercase;
    z-index: 2;

    @media (min-width: 640px) {
        font-size: 3rem;
        margin-bottom: 2rem;
    }
`;

export const StartButton = styled.button`
    --accent: #a259ff;
    background: linear-gradient(135deg, #a259ff 0%, #6f42c1 100%);
    border: 0;
    color: #ffffff;
    padding: 0.9rem 1.5rem;
    font-size: 1.05rem;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
    text-shadow: 0 1px 0 rgba(0,0,0,0.25);
    z-index: 2;
    box-shadow: 0 6px 20px rgba(162, 89, 255, 0.35), inset 0 0 0 1px rgba(255,255,255,0.15);
    white-space: nowrap;
    min-width: 120px;

    /* Full width on small screens when stacked */
    width: 100%;
    @media (min-width: 480px) {
        width: auto;
    }

    &:hover {
        transform: translateY(-1px);
        filter: brightness(1.05);
        box-shadow: 0 10px 26px rgba(162, 89, 255, 0.45), inset 0 0 0 1px rgba(255,255,255,0.2);
    }

    &:active {
        transform: translateY(0);
        filter: brightness(0.98);
    }

    &:disabled {
        cursor: not-allowed;
        filter: grayscale(0.4) brightness(0.8);
        opacity: 0.75;
        box-shadow: 0 0 0 rgba(0,0,0,0);
    }
`;

export const Input = styled.input`
    background: rgba(20, 20, 20, 0.55);
    border: 1px solid rgba(162, 89, 255, 0.55);
    color: #ffffff;
    padding: 0.85rem 1rem;
    font-size: 1rem;
    border-radius: 10px;
    outline: none;
    z-index: 2;
    /* Allow shrinking inside CSS grid to avoid overflow */
    min-width: 0;
    text-align: left;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 8px 20px rgba(0,0,0,0.3);
    backdrop-filter: blur(6px);

    &::placeholder {
        color: #a259ffaa;
    }

    &:focus {
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 0 3px rgba(162, 89, 255, 0.35);
        border-color: #a259ff;
    }
`;

export const Card = styled.div`
    position: relative;
    z-index: 2;
    width: min(92vw, 540px);
    padding: 2rem 1.25rem;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: radial-gradient(120% 140% at 0% 0%, rgba(111, 66, 193, 0.18) 0%, rgba(162, 89, 255, 0.08) 35%, rgba(10,10,10,0.6) 70%), rgba(15, 15, 15, 0.5);
    box-shadow: 0 20px 60px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06);
    backdrop-filter: blur(12px) saturate(120%);
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (min-width: 640px) {
        padding: 2.25rem 1.75rem;
        gap: 1.25rem;
    }
`;

export const Subtitle = styled.p`
    margin: 0 0 0.25rem 0;
    text-align: center;
    color: #cbb3ff;
    opacity: 0.9;
    font-size: 0.95rem;

    @media (min-width: 640px) {
        font-size: 1rem;
    }
`;

export const FormRow = styled.div`
    display: grid;
    gap: 0.75rem;
    align-items: center;
    grid-template-columns: 1fr;

    @media (min-width: 480px) {
        grid-template-columns: 1fr auto;
    }
`;

export const HintText = styled.div`
    text-align: center;
    color: #b79cff;
    opacity: 0.7;
    font-size: 0.85rem;
`

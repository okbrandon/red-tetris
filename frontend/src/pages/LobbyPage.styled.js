import styled from 'styled-components';

export const PlayerList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 1.25rem 0;
    z-index: 2;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

export const Player = styled.li`
    background: rgba(20, 20, 20, 0.55);
    border: 1px solid rgba(162, 89, 255, 0.35);
    color: #ffffff;
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
    border-radius: 10px;
    text-align: left;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05), 0 8px 20px rgba(0,0,0,0.3);
    backdrop-filter: blur(6px);
`;

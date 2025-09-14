import styled, { keyframes } from 'styled-components';

const floatA = keyframes`
    0% { transform: translate(-20%, -15%) scale(1); }
    50% { transform: translate(5%, 10%) scale(1.05); }
    100% { transform: translate(-20%, -15%) scale(1); }
`;

const floatB = keyframes`
    0% { transform: translate(15%, 5%) scale(1.1); }
    50% { transform: translate(-10%, -10%) scale(1.03); }
    100% { transform: translate(15%, 5%) scale(1.1); }
`;

const panGrid = keyframes`
    0% { background-position: 0 0, 0 0; }
    100% { background-position: 0 480px, 480px 0; }
`;

const fall = keyframes`
    0% { transform: translate(calc(var(--x, 0vw)), -20vh) rotate(var(--rStart, 0deg)) scale(var(--scale, 1)); opacity: 0; }
    5% { opacity: var(--alpha, 0.7); }
    100% { transform: translate(calc(var(--xEnd, 0vw)), 120vh) rotate(var(--rEnd, 15deg)) scale(var(--scale, 1)); opacity: 0; }
`;

const Background = styled.div`
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.04), rgba(14,14,14,0.0) 60%),
                linear-gradient(180deg, #0b0b0f 0%, #0e0e13 100%);

    &::before,
    &::after {
        content: '';
        position: absolute;
        width: min(70vw, 700px);
        height: min(70vh, 700px);
        border-radius: 50%;
        filter: blur(60px);
        opacity: 0.35;
        will-change: transform;
    }

    &::before {
        top: -10vh;
        left: -10vw;
        background: radial-gradient(closest-side, rgba(162, 89, 255, 0.65), rgba(162, 89, 255, 0) 70%);
        animation: ${floatA} 28s ease-in-out infinite alternate;
    }

    &::after {
        bottom: -15vh;
        right: -10vw;
        background: radial-gradient(closest-side, rgba(111, 66, 193, 0.6), rgba(111, 66, 193, 0) 70%);
        animation: ${floatB} 36s ease-in-out infinite alternate;
    }
`;

const Grid = styled.div`
    position: absolute;
    inset: 0;
    opacity: 0.14;
    filter: saturate(110%);
    background-image:
        repeating-linear-gradient(
            to bottom,
            rgba(199, 168, 255, 0.12) 0px,
            rgba(199, 168, 255, 0.12) 1px,
            transparent 1px,
            transparent 40px
        ),
        repeating-linear-gradient(
            to right,
            rgba(199, 168, 255, 0.12) 0px,
            rgba(199, 168, 255, 0.12) 1px,
            transparent 1px,
            transparent 40px
        );
    animation: ${panGrid} 60s linear infinite;
`;

const Pieces = styled.div`
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
`;

const Piece = styled.div`
    position: absolute;
    top: 0;
    left: 50%;
    opacity: 0;
    animation: ${fall} linear infinite;
    animation-duration: var(--dur, 22s);
    animation-delay: var(--delay, 0s);
    will-change: transform, opacity;
    filter: drop-shadow(0 8px 12px rgba(0,0,0,0.45));
`;

const Tile = styled.div`
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 4px;
    background: ${({ color }) => `${color}`};
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.45),
        inset 0 -1px 0 rgba(0,0,0,0.45),
        0 0 10px rgba(162,89,255,0.25);
    outline: 1px solid rgba(255,255,255,0.06);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background:
        radial-gradient(120% 80% at 25% 20%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%),
        linear-gradient(160deg, rgba(255,255,255,0.15), rgba(0,0,0,0.2));
        mix-blend-mode: screen;
        pointer-events: none;
    }
`;

const SHAPES = {
    I: [[0,0],[1,0],[2,0],[3,0]],
    L: [[0,0],[0,1],[1,1],[2,1]],
    J: [[1,0],[1,1],[0,1],[0,2]],
    Z: [[0,0],[1,0],[1,1],[2,1]],
    S: [[1,0],[2,0],[0,1],[1,1]],
    T: [[1,0],[0,1],[1,1],[2,1]],
    O: [[0,0],[1,0],[0,1],[1,1]],
};

const size = 14;

const AnimatedBackground = () => {
    const items = [
        // Far left to center-left
        { shape: 'I', color: 'rgba(162,89,255,0.95)', vars: { x: '-48vw', xEnd: '-44vw', dur: '26s', delay: '0s', rStart: '-4deg', rEnd: '12deg', scale: '1.0', alpha: '0.6' } },
        { shape: 'J', color: 'rgba(173,115,255,0.95)', vars: { x: '-30vw', xEnd: '-26vw', dur: '32s', delay: '8s', rStart: '8deg', rEnd: '-6deg', scale: '0.9', alpha: '0.55' } },
        { shape: 'L', color: 'rgba(140,70,230,0.95)', vars: { x: '-16vw', xEnd: '-12vw', dur: '24s', delay: '6s', rStart: '2deg', rEnd: '-10deg', scale: '1.1', alpha: '0.7' } },

        // Center area (both small and large for depth)
        { shape: 'Z', color: 'rgba(186,120,255,0.95)', vars: { x: '-2vw', xEnd: '2vw', dur: '28s', delay: '3s', rStart: '-6deg', rEnd: '8deg', scale: '1.6', alpha: '0.5' } },
        { shape: 'O', color: 'rgba(150,80,240,0.95)', vars: { x: '0vw', xEnd: '0vw', dur: '40s', delay: '18s', rStart: '0deg', rEnd: '0deg', scale: '0.85', alpha: '0.45' } },

        // Right side
        { shape: 'T', color: 'rgba(132,88,255,0.95)', vars: { x: '18vw', xEnd: '24vw', dur: '30s', delay: '12s', rStart: '0deg', rEnd: '15deg', scale: '1.0', alpha: '0.65' } },
        { shape: 'S', color: 'rgba(155,95,255,0.95)', vars: { x: '32vw', xEnd: '36vw', dur: '26s', delay: '9s', rStart: '-3deg', rEnd: '10deg', scale: '1.25', alpha: '0.6' } },
        { shape: 'O', color: 'rgba(150,80,240,0.95)', vars: { x: '46vw', xEnd: '44vw', dur: '34s', delay: '15s', rStart: '5deg', rEnd: '-8deg', scale: '0.85', alpha: '0.55' } },

        // Foreground large pieces for depth effect (left and right)
        { shape: 'I', color: 'rgba(162,89,255,0.9)', vars: { x: '-22vw', xEnd: '-18vw', dur: '36s', delay: '2s', rStart: '-2deg', rEnd: '6deg', scale: '2.2', alpha: '0.38' } },
        { shape: 'T', color: 'rgba(132,88,255,0.9)', vars: { x: '22vw', xEnd: '18vw', dur: '42s', delay: '5s', rStart: '4deg', rEnd: '-4deg', scale: '3.0', alpha: '0.32' } },
    ];

    return (
        <Background>
            <Grid />
            <Pieces>
                {items.map((p, i) => {
                const coords = SHAPES[p.shape] || SHAPES.O;
                const maxX = Math.max(...coords.map(([x]) => x));
                const maxY = Math.max(...coords.map(([, y]) => y));
                const width = (maxX + 1) * size;
                const height = (maxY + 1) * size;

                return (
                    <Piece
                    key={i}
                    style={{
                        '--x': p.vars.x,
                        '--xEnd': p.vars.xEnd,
                        '--dur': p.vars.dur,
                        '--delay': p.vars.delay,
                        '--rStart': p.vars.rStart,
                        '--rEnd': p.vars.rEnd,
                        '--scale': p.vars.scale,
                        '--alpha': p.vars.alpha,
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                    >
                    {coords.map(([x, y], idx) => (
                        <Tile
                        key={idx}
                        color={p.color}
                        style={{ left: `${x * size}px`, top: `${y * size}px` }}
                        />
                    ))}
                    </Piece>
                );
                })}
            </Pieces>
        </Background>
    );
};

export default AnimatedBackground;

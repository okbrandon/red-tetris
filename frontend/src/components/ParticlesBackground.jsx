import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const ParticlesBackground = () => {
    const particlesInit = async (main) => {
        await loadFull(main);
    };

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fullScreen: { enable: false },
                background: { color: '#0e0e0e' },
                particles: {
                number: { value: 40, density: { enable: true, area: 800 } },
                color: { value: '#a259ff' },
                shape: { type: 'circle' },
                opacity: { value: 0.15 },
                size: { value: 3 },
                links: {
                    enable: true,
                    distance: 130,
                    color: '#a259ff33',
                    opacity: 0.2,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 0.3,
                    direction: 'none',
                    random: true,
                    straight: false,
                    outMode: 'bounce',
                },
                },
                interactivity: {
                events: {
                    onHover: { enable: true, mode: 'repulse' },
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                },
                },
                detectRetina: true,
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
            }}
        />
    );
};

export default ParticlesBackground;

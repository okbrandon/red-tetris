import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import MultiplayerGamePage from './pages/MultiplayerGamePage';
import AnimatedBackground from './components/AnimatedBackground';
import Notification from './components/Notification';

const ReloadRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialPath = useRef(location.pathname);
    const handled = useRef(false);

    useEffect(() => {
        if (handled.current) return;
        handled.current = true;

        if (!isReload()) return;

        if (initialPath.current === '/') return;

        navigate('/', { replace: true });
    }, [navigate]);

    return null;
};

const isReload = () => {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
        return false;
    }

    if (typeof performance.getEntriesByType === 'function') {
        const entries = performance.getEntriesByType('navigation');
        if (entries && entries.length > 0) {
            return entries[0].type === 'reload';
        }
    }

    return false;
};

function App() {
    return (
        <Router>
            <ReloadRedirect />
            <AnimatedBackground />
            <Notification />
            <Routes>
                <Route path='/' element={ <HomePage /> } />
                <Route path='/menu' element={ <MenuPage /> } />
                <Route path='/join' element={ <MultiplayerGamePage /> } />
                <Route path='/lobby' element={ <LobbyPage /> } />
                <Route path='/game' element={ <GamePage /> } />
            </Routes>
        </Router>
    )
}

export default App

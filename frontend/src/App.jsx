import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import MultiplayerGamePage from './pages/MultiplayerGamePage';
import AnimatedBackground from './components/AnimatedBackground';
import Notification from './components/Notification';

function App() {
    return (
        <Router>
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

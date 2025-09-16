import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import JoinGamePage from './pages/JoinGamePage';
import HostGamePage from './pages/HostGamePage';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
    return (
        <Router>
            <AnimatedBackground />
            <Routes>
                <Route path='/' element={ <HomePage /> } />
                <Route path='/menu' element={ <MenuPage /> } />
                <Route path='/join' element={ <JoinGamePage /> } />
                <Route path='/host' element={ <HostGamePage /> } />
                <Route path='/lobby' element={ <LobbyPage /> } />
                <Route path='/game' element={ <GamePage /> } />
            </Routes>
        </Router>
    )
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
    return (
        <Router>
            {/* Keep background mounted across routes to avoid animation reset */}
            <AnimatedBackground />
            <Routes>
                <Route path='/' element={ <HomePage /> } />
                <Route path='/lobby' element={ <LobbyPage /> } />
                <Route path='/game' element={ <GamePage /> } />
            </Routes>
        </Router>
    )
}

export default App

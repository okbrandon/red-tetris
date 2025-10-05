import { useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import LobbyPage from './pages/LobbyPage'
import GamePage from './pages/GamePage'
import JoinPage from './pages/JoinPage'
import AnimatedBackground from './components/AnimatedBackground'
import Notification from './components/Notification'

function RedirectOnRefresh() {
    const navigate = useNavigate()
    const initialHandledRef = useRef(false)

    useEffect(() => {
        if (initialHandledRef.current) {
            return
        }
        initialHandledRef.current = true
        navigate('/', { replace: true })
    }, [navigate])

    return null
}

function App() {
    return (
        <Router>
            <RedirectOnRefresh />
            <AnimatedBackground />
            <Notification />
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/menu' element={<MenuPage />} />
                <Route path='/join' element={<JoinPage />} />
                <Route path='/:room/:player_name' element={<GamePage />} />
            </Routes>
        </Router>
    )
}

export default App

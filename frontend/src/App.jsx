import { useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import GamePage from './pages/GamePage'
import JoinPage from './pages/JoinPage'
import AnimatedBackground from './components/AnimatedBackground'
import Notification from './components/Notification'
import { updateUsername } from './features/user/userThunks.js'

function RedirectOnRefresh() {
    const navigate = useNavigate()
    const initialHandledRef = useRef(false)

    useEffect(() => {
        if (initialHandledRef.current) {
            return
        }
        initialHandledRef.current = true

        const knownPages = ['/', '/menu', '/join'];
        const storedUsername = window.localStorage.getItem('username');
        const currentPath = window.location.pathname;

        if (storedUsername && knownPages.includes(currentPath)) {
            return;
        }
        navigate('/', { replace: true })
    }, [navigate])

    return null
}

function App() {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const storedUsername = window.localStorage.getItem('username')
        if (!storedUsername) {
            return;
        }

        const legacyNavigationType = window.performance?.navigation?.type;
        const isReload = legacyNavigationType === 'reload';

        if (!isReload) {
            return;
        }

        updateUsername(storedUsername);
    }, [])

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

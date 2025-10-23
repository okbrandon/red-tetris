import { useEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import UsernameSetupPage from '@/pages/UsernameSetupPage/UsernameSetupPage';
import ModeSelectPage from '@/pages/ModeSelectPage/ModeSelectPage';
import RoomAccessPage from '@/pages/RoomAccessPage/RoomAccessPage';
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground';
import Notification from '@/components/Notification/Notification';
import { updateUsername } from '@/store/slices/userThunks.js';
import ArenaRouter from './pages/Arena/ArenaRouter/ArenaRouter';

function RedirectOnRefresh() {
  const navigate = useNavigate();
  const initialHandledRef = useRef(false);

  useEffect(() => {
    if (initialHandledRef.current) {
      return;
    }
    initialHandledRef.current = true;

    const knownPages = ['/', '/menu', '/join'];
    const storedUsername = window.localStorage.getItem('username');
    const currentPath = window.location.pathname;

    if (storedUsername && knownPages.includes(currentPath)) {
      return;
    }
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}

function App() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedUsername = window.localStorage.getItem('username');
    if (!storedUsername) {
      return;
    }

    const legacyNavigationType = window.performance?.navigation?.type;
    const isReload = legacyNavigationType === 'reload';

    if (!isReload) {
      return;
    }

    updateUsername(storedUsername);
  }, []);

  return (
    <Router>
      <RedirectOnRefresh />
      <AnimatedBackground />
      <Notification />
      <Routes>
        <Route path="/" element={<UsernameSetupPage />} />
        <Route path="/menu" element={<ModeSelectPage />} />
        <Route path="/join" element={<RoomAccessPage />} />
        <Route path="/:room/:player_name" element={<ArenaRouter />} />
      </Routes>
    </Router>
  );
}

export default App;

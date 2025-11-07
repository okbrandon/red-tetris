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
import ArenaRouter from './pages/Arena/ArenaRouter/ArenaRouter';
import { useEffect, useRef } from 'react';
import { updateUsername } from './store/slices/userThunks';
import { requestRoomJoin } from './store/slices/socketThunks';
import GameHistoryPage from '@/pages/GameHistoryPage/GameHistoryPage';

function HandleRoute() {
  const navigate = useNavigate();
  const hasReset = useRef(false);

  useEffect(() => {
    if (hasReset.current) return;
    hasReset.current = true;

    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    const isArenaRoute = pathSegments.length === 2;
    if (isArenaRoute) {
      const [navigationEntry] =
        window.performance.getEntriesByType('navigation');
      const isReload =
        navigationEntry?.type === 'reload' ||
        window.performance.navigation?.type ===
          window.performance.navigation?.TYPE_RELOAD;

      let usernameFromPath = null;
      let roomName = null;

      const rawPlayerName = pathSegments[1];
      const rawRoomName = pathSegments[0];
      try {
        usernameFromPath = decodeURIComponent(rawPlayerName).trim();
        roomName = decodeURIComponent(rawRoomName).trim();
      } catch {
        usernameFromPath = rawPlayerName.trim();
        roomName = rawRoomName.trim();
      }

      if (!usernameFromPath || !roomName || usernameFromPath.length > 16) {
        navigate('/', { replace: true });
      } else if (isReload) {
        updateUsername(usernameFromPath);
        navigate('/menu', { replace: true });
      } else {
        updateUsername(usernameFromPath);
        requestRoomJoin({ roomName, soloJourney: false });
      }
      return;
    }

    const knownPages = ['/', '/menu', '/join', '/history'];
    const storedUsername = window.localStorage.getItem('username');

    if (
      storedUsername &&
      knownPages.includes(currentPath) &&
      storedUsername.length < 17
    ) {
      updateUsername(storedUsername);
      return;
    }
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <HandleRoute />
      <AnimatedBackground />
      <Notification />
      <Routes>
        <Route path="/" element={<UsernameSetupPage />} />
        <Route path="/menu" element={<ModeSelectPage />} />
        <Route path="/join" element={<RoomAccessPage />} />
        <Route path="/history" element={<GameHistoryPage />} />
        <Route path="/:room/:player_name" element={<ArenaRouter />} />
      </Routes>
    </Router>
  );
}

export default App;

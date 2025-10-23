import { useEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UsernameSetupPage from '@/pages/UsernameSetupPage/UsernameSetupPage';
import ModeSelectPage from '@/pages/ModeSelectPage/ModeSelectPage';
import RoomAccessPage from '@/pages/RoomAccessPage/RoomAccessPage';
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground';
import Notification from '@/components/Notification/Notification';
import { updateUsername } from '@/store/slices/userThunks.js';
import ArenaRouter from './pages/Arena/ArenaRouter/ArenaRouter';
import { resetGameState } from '@/store/slices/gameSlice.js';
import { resetUser } from '@/store/slices/userSlice.js';
import { resetSocketState } from '@/store/slices/socketSlice.js';

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

function UsernameGuard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const username = useSelector((state) => state.user.username);
  const hasResetRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedUsername = window.localStorage.getItem('username');

    if (username || storedUsername) {
      hasResetRef.current = false;
      return;
    }

    if (!hasResetRef.current) {
      hasResetRef.current = true;
      window.localStorage.removeItem('username');
      dispatch(resetGameState());
      dispatch(resetUser());
      dispatch(resetSocketState());
    }

    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [dispatch, navigate, location.pathname, username]);

  return null;
}

function App() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedUsername = window.localStorage.getItem('username');
    if (storedUsername) {
      updateUsername(storedUsername);
    }
  }, []);

  return (
    <Router>
      <UsernameGuard />
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

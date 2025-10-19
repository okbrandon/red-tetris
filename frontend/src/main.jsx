import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store.js';
import './index.css';
import App from './App.jsx';
import SocketProvider from './providers/SocketProvider.jsx';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <SocketProvider>
      <App />
    </SocketProvider>
  </Provider>
);

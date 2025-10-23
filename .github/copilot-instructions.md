# Copilot Instructions for red-tetris

## Project Overview
- **red-tetris** is a multiplayer Tetris game with a React/Vite frontend and a Node.js/Socket.IO backend.
- The backend manages game state, rooms, and player logic. The frontend handles UI, state management (Redux Toolkit), and real-time communication via Socket.IO.
- Communication between frontend and backend is event-driven using defined constants for incoming/outgoing events.

## Key Components
- **backend/**: Node.js server (see `main.js`), game logic (`game.js`, `player.js`, `tetromino.js`), and event constants in `constants/`.
- **frontend/**: React app (entry: `src/main.jsx`), Redux store (`src/store.js`), slices for game/user/notification/socket, and UI components in `src/components/`.
- **docker-compose.yml**: Defines backend (and optionally frontend) services for local development.

## Developer Workflows
- **Backend**
  - Start: `npm start` in `backend/` (runs `main.js`)
  - Test: `npm test` in `backend/` (Jest, coverage enabled)
- **Frontend**
  - Start: `npm run dev` in `frontend/` (Vite dev server)
  - Test: `npm run test` or `npm run test:watch` in `frontend/` (Vitest)
  - Lint: `npm run lint` in `frontend/`
- **CI**: Frontend tests run on push/PR to `main`/`dev` (see `.github/workflows/ci.yml`).

## Project-Specific Patterns
- **Socket Events**: All client-server communication uses event names/constants from `backend/constants/incoming-events.js` and `outgoing-events.js`. Update these files to add new events.
- **Redux State**: Game, user, notification, and socket state are managed in separate slices. Use actions/selectors from these slices for state changes.
- **Testing**: Backend uses Jest (with mocks in `__mocks__/`). Frontend uses Vitest and React Testing Library (setup in `src/setupTests.js`).
- **Solo vs Multiplayer**: Game logic supports both solo and multiplayer modes, with room and player management handled in backend `Game` and `Player` classes.

## Integration Points
- **Socket.IO**: Frontend connects to backend via Socket.IO (default port 3000 for backend, 5173 for frontend). CORS is configured in backend for local dev.
- **Docker**: Use `docker-compose up` to start backend (and optionally frontend) in containers. Adjust ports as needed.

## Conventions
- Use ES modules (`type: module` in `package.json`).
- Keep event names and payloads in sync between frontend and backend.
- Place new backend tests in `backend/tests/`, frontend tests in `frontend/src/__tests__/`.
- Use `constants/` for all shared backend event names and settings.

## Examples
- To add a new game event:
  1. Define the event in `backend/constants/incoming-events.js` and/or `outgoing-events.js`.
  2. Handle the event in backend logic (`main.js`, `game.js`, etc).
  3. Emit/listen for the event in frontend via socket service and Redux actions.

---
For questions or unclear patterns, check the main files listed above or ask for clarification.

# Red Tetris - Copilot Instructions

## Project Overview

Red Tetris is a multiplayer Tetris clone built with a lightweight Node.js backend and modern React frontend. The project consists of three main components:

- **Backend**: Node.js server with Socket.IO for real-time multiplayer game logic (Port 3000)
- **Frontend**: React + Vite application with Redux Toolkit state management (Port 8080 in Docker, 5173 in dev)
- **CLI**: Terminal-based client using blessed for text-based gameplay

**Tech Stack**: Node.js v20+, React 18, Socket.IO, Redux Toolkit, Vite, Vitest, ESLint, Docker
**Project Type**: Real-time multiplayer game, ~90 files, JavaScript/JSX
**Repository Size**: Small-medium with clear separation of concerns

## Build & Validation Commands

### Prerequisites
- Node.js 20+ and npm 10+
- All commands must be run from their respective component directories

### Frontend (React + Vite)
```bash
cd frontend
npm ci                    # Install dependencies (30s)
npm run test -- --run     # Run tests (11s, 11 tests pass)
npm run build             # Production build (4s)
npm run lint              # ESLint check (has issues with test globals)
npm run dev               # Development server (localhost:5173)
npm run preview           # Preview production build
```

**Known Issues**: 
- ESLint fails on test files due to missing vitest globals (describe, it, expect) - tests still run fine
- Always run `npm ci` before any other command to ensure dependencies are installed

### Backend (Node.js + Socket.IO)
```bash
cd backend
npm ci                    # Install dependencies (11s)
node main.js              # Start server (Port 3000)
npm start                 # Alternative start command
npm test                  # No tests configured (returns error)
```

**Environment Variables**:
- `PORT`: Server port (default: 3000)
- `SOCKET_ALLOWED_ORIGINS`: Comma-separated CORS origins (default: localhost:5173)
- `DEBUG`: Set to `backend:*` for detailed logging

### CLI Client
```bash
cd cli
npm ci                    # Install dependencies (1s)
node main.js              # Start terminal client
npm start                 # Alternative start command
```

**Note**: CLI connects to `http://localhost:3000` by default and requires backend to be running.

### Docker (Optional)
Docker is supported via `docker-compose.yml` but Docker may not be available in all environments.

### CI/CD
GitHub Actions runs frontend tests on push/PR to `main` and `dev` branches:
- Node.js 20 setup
- `npm ci` and `npm run test -- --run` in frontend directory
- Only frontend is tested in CI

## Project Architecture

### Directory Structure
```
/
├── backend/              # Node.js Socket.IO server
│   ├── constants/        # Game settings, events, status enums
│   ├── main.js          # Main server file with Socket.IO handlers
│   ├── game.js          # Game class for room management
│   ├── player.js        # Player class
│   ├── piece.js         # Tetris piece logic
│   └── tetromino.js     # Tetromino shapes and rotations
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── features/    # Redux slices (game, user, lobby, notification)
│   │   ├── pages/       # React Router pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── __tests__/   # Vitest test files
│   ├── public/          # Static assets
│   └── dist/            # Build output (generated)
├── cli/                 # Terminal client
└── .github/workflows/   # GitHub Actions CI
```

### Key Configuration Files
- `frontend/vite.config.js`: Vite build config with Vitest setup
- `frontend/eslint.config.js`: ESLint flat config (React, hooks, refresh)
- `frontend/package.json`: Scripts, dependencies, React 18 + Vite 6
- `backend/package.json`: Minimal setup with Socket.IO dependency
- `docker-compose.yml`: Multi-service Docker setup
- `.github/workflows/ci.yml`: Frontend-only CI pipeline

### Game Architecture
- **Real-time multiplayer**: Socket.IO events for game state synchronization
- **Room-based**: Players join/create rooms with configurable max players
- **Game states**: WAITING, PLAYING (defined in backend/constants/game-status.js)
- **Event system**: Incoming/outgoing events defined in backend/constants/
- **Redux state**: Frontend uses Redux Toolkit for game, user, lobby, notification state

### Development Workflow
1. **Branching**: Use dev-based flow, branch from `dev`, PR to `dev`, releases `dev` → `main`
2. **Commits**: Conventional commits format: `type(scope): description`
3. **Testing**: Frontend has comprehensive Vitest tests, backend has no tests
4. **Linting**: ESLint configured for frontend only
5. **CI**: Only frontend tests run in GitHub Actions

## Common Development Tasks

### Adding New Features
1. Backend changes: Update event constants, modify game.js or main.js handlers
2. Frontend changes: Add Redux slices in features/, create components, add pages
3. Always test socket communication between frontend and backend
4. Follow Conventional Commits: `feat(frontend):` or `feat(backend):`

### Running Full Development Environment
```bash
# Terminal 1 - Backend
cd backend && npm ci && node main.js

# Terminal 2 - Frontend  
cd frontend && npm ci && npm run dev

# Terminal 3 - CLI (optional)
cd cli && npm ci && node main.js
```

### Making Safe Changes
- Frontend tests must pass: `npm run test -- --run`
- Frontend must build: `npm run build`
- Backend must start without errors: `node main.js`
- Always run `npm ci` after changing dependencies
- Check Socket.IO connectivity between frontend/backend when making networking changes

### Validation Checklist
- [ ] Frontend tests pass (11 tests in ~11 seconds)
- [ ] Frontend builds successfully (~4 seconds)
- [ ] Backend starts and listens on port 3000
- [ ] No console errors in browser or terminal
- [ ] Socket.IO events work between components (test manually)

## Important Notes for Coding Agents

**Always run `npm ci` before any other commands** - dependencies must be installed first.

**ESLint test globals issue**: The frontend ESLint config has a known issue with test file globals. Tests run fine, but ESLint will show errors for `describe`, `it`, `expect` in test files. This is non-blocking.

**No backend testing**: Backend has no test suite configured. Manual testing required for backend changes.

**Socket.IO CORS**: Backend is configured for localhost:5173 (Vite dev server) by default. Update `SOCKET_ALLOWED_ORIGINS` for other origins.

**Development ports**: Frontend dev (5173), Backend (3000), Frontend Docker (8080).

**Trust these instructions** - only explore/search if information is incomplete or incorrect. All commands have been validated and timing documented.
# Contributing Guidelines - Red Tetris

This document explains how we work together on this project.

---

## Branching

We use two permanent branches:
- **`main`** -> always stable, release-ready
- **`dev`** -> integration branch for all features

All work is done in **feature branches** branched from `dev`.

**Branch naming convention**

> \<area>/\<issue>-\<short-name>

- `fe/12-polish-homepage`
- `be/21-lobby-socket`
- `full/33-multiplayer-sync`

`fe` = frontend | `be` = backend | `full` = fullstack

---

## Commits

We keep commits **short, clear, and consistent**.

**Format (lightweight)**

[AREA][TYPE] short description

- **AREA** = `FE` (frontend), `BE` (backend), `FULL` (fullstack). If the change isn't FE/BE/FULL (e.g., docs, tooling), you may **omit AREA**.
- **TYPE** = one of the types below.
- If the commit relates to an issue, append `(#id)` at the end: `... (#12)`

**Examples**

[FE][FEAT] add tetris grid component (#12)<br/>
[FE][STYLE] polish homepage layout<br/>
[BE][FIX] correct lobby join payload (#21)<br/>
[FULL][CHORE] align FE services with BE socket events<br/>
[DOCS] add contributing guidelines<br/>

### Commit Types (what to choose and when)
- **FEAT** – user-visible feature; adds new functionality
  _e.g., render falling tetrominoes, add lobby UI_
- **FIX** – bug fix; corrects incorrect behavior
  _e.g., rotation collision bug_
- **CHORE** – maintenance, dependencies, configs, scripts, repo hygiene
  _e.g., update ESLint/Prettier, GitHub Actions, .gitignore_
- **REFACTOR** – improve code structure without changing behavior
  _e.g., split Game.jsx, extract helpers_
- **TEST** – add/update tests (unit/integration/e2e)
- **STYLE** – visual/UI polish or code formatting (no logic changes)
  _e.g., CSS tweaks, layout spacing_
- **DOCS** – documentation only
  _e.g., README, CONTRIBUTING, API notes_
- **PERF** – performance improvements
  _e.g., memoization, reduce renders_
- **BUILD** – build tooling changes (Vite/Webpack, npm scripts)
- **CI** – CI/CD pipeline changes
- **CONFIG** – environment or project config changes
- **REVERT** – revert a previous commit
- **WIP** – work in progress (use on feature branches; avoid merging WIP)

**CHORE vs REFACTOR (quick rule)**
- Touching configs/tooling/docs/deps? → **CHORE**
- Restructuring app code with same behavior? → **REFACTOR**

---

## Pull Requests (PRs)
- Open PRs **into `dev`**, not `main`
- PR title format:
[AREA] short description (#issue)
- PR description:
- Short bullet list of changes
- Link the issue:
  - Feature PRs to `dev`: `Relates to #id`
  - Sprint/release PR (`dev → main`): `Closes #id, #id, ...`

**Example PR body**

Title: [FE] Polish homepage (#12)

Description:

Improved header layout

Added CTA button navigation

Responsive design

Relates to #12

---

## Issues & Project Board

We manage tasks with the GitHub Project board.

**Columns**
- **Backlog** – ideas, drafts, future tasks (use Draft issues)
- **Todo** – selected issues for this sprint
- **In Progress** – someone is actively working on it
- **Review** – PR is open, waiting for review/merge
- **Done** – merged into `dev`
  (we close issues only when merged into `main`)

**Workflow**
1. Pick an issue → move it to **In Progress**
2. Create a feature branch → work & commit
3. Open a PR into `dev`, move issue to **Review**
4. After merge into `dev`, issue stays open until `dev` → `main`
5. On sprint release PR (`dev → main`), add `Closes #id` → issues auto-close

---

## Labels

We use labels to quickly filter issues:

- `frontend` → UI, React, styling, Redux
- `backend` → server, WebSocket, API, game logic
- `fullstack` → touches both FE & BE
- `bug` → unexpected behavior
- `enhancement` → nice-to-have improvements
- `testing` → tests (unit, integration, e2e)

---

## Releases

- We tag a release at the end of each sprint or major milestone
- Tag format: `v0.1.0`, `v0.2.0`, … (Semantic Versioning)
- Release notes include new features, fixes, and setup instructions

---

With this setup:
- Issues → track all tasks
- Branches → isolate work
- Commits → simple + readable
- PRs → always clear and linked
- Project board → shows progress at a glance
- Issues close only when shipped to `main`

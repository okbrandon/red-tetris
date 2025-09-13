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

**Format**

[AREA] short description

- AREA = `FE` (frontend), `BE` (backend), `FULL` (fullstack)
- Keep the description imperative: "add", "fix", "polish", "refactor"
- If the commit relates to an issue, include `(#id)` at the end

**Examples**

[FE] add tetris grid component (#12)<br/>
[BE] implement lobby join endpoint (#21)<br>
[FULL] sync game state between frontend and backend (#33)<br/>
[FE] polish homepage layout<br/>

---

## Pull Requests (PRs)
- Always open PRs **into `dev`**, not `main`
- PR title format:
[AREA] short description (#issue)
- PR description:
- Short bullet list of changes
- Link the issue:
  - Feature PRs to `dev`: `Relates to #id`
  - Sprint/release PR (`dev → main`): `Closes #id, #id, ...`

**Example**

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

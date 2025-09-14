# Contributing Guidelines — Red Tetris

This guide standardizes how we collaborate using a dev‑based GitHub workflow, Conventional Commits, and pull requests. It covers branch names, commit messages, and PR conventions so automation (links, changelogs) works smoothly.

---

## Branching (Dev‑based Flow)

- Branch from `dev` (integration branch).
- Open a PR from your feature branch into `dev` when ready.
- Keep branches small and short‑lived; rebase/sync from `dev` as needed.

Branch naming convention

> \<type>/\<issue-id-optional>-\<short-kebab-summary>

Types: `feature`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`.

Examples

- `feature/123-polish-homepage`
- `fix/lobby-socket-timeout`
- `docs/update-contributing`

Rules

- Use lowercase kebab‑case for the summary.
- Include an issue ID when available (preferred).

---

## Commits (Conventional Commits 1.0)

Format

> type(scope)!: short, imperative subject<br/>
> body (motivation, contrast)<br/>
> footer (Closes #123, Co-authored-by, BREAKING CHANGE, etc.)

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Guidelines

- Subject ≤ 72 chars, no period. Use imperative mood ("add", "fix").
- Use `scope` to denote area like `frontend`, `backend`, `lobby`, `game`.
- Reference issues in the footer with keywords: `Closes #123`, `Relates to #456`.
- For breaking changes add `!` after type/scope and a `BREAKING CHANGE:` footer.

Examples

- `feat(frontend): add animated tetris background`
- `fix(backend): correct lobby join payload (Closes #21)`
- `refactor(game): extract rotation helpers`
- `docs: update contributing with GitHub Flow`

Squash merging

- Prefer "Squash and merge". The PR title will become the single commit message; keep it Conventional.

---

## Pull Requests

Target branch

- Open feature PRs into `dev`.

Title (Conventional Commit style)

> type(scope): short description (Closes #id)

Description checklist

- What changed and why (bullets ok)
- Screenshots/GIFs for UI changes
- Any breaking changes or follow‑ups
- Link issues with `Closes #id` or `Relates to #id`

Process

- Draft the PR early if helpful; convert to Ready for review when stable.
- Ensure checks pass (lint, tests, build).
- Keep diffs focused; out‑of‑scope changes should go to a separate PR.
- Use "Squash and merge" and delete the branch.

Release PRs (dev → main)

- When releasing, open a PR from `dev` to `main`.
- Title: `chore(release): vX.Y.Z` (SemVer).
- Body: high‑level changelog (features, fixes, breaking), and reference issues with `Closes #id` so they auto‑close on merge to `main`.
- After merge, tag `main` with `vX.Y.Z` and publish a GitHub Release.

Example PR

Title: `feat(frontend): polish homepage hero (Closes #123)`

Body:
- Add glassmorphic card and CTA grid
- Subtle grid background and drifting pieces
- Keyboard: Enter to start

---

## Issues & Labels (brief)

- Use issues for all work. Keep them small, outcome‑oriented, and label them.
- Suggested labels: `frontend`, `backend`, `fullstack`, `bug`, `enhancement`, `good first issue`, `help wanted`.

---

## Releases

- Releases are cut from `main` using SemVer (e.g., `v0.1.0`).
- Use a release PR (`dev` → `main`) titled `chore(release): vX.Y.Z`.
- After merging the release PR, tag `main` and publish a GitHub Release.
- Conventional Commits allow automated changelog generation if desired.

# Contributing to DAIRA

- Use Conventional Commits.
- Create feature branches: feat/<desc>, fix/<desc>, chore/<desc>.
- PRs must link issues, pass CI, and get 2 approvals for core modules.

Developers on Windows (where disk space may be limited): you can use `X:\DAIRA\pnpm-store` as a pnpm store directory to avoid local ENOSPC errors. There's a helper script `scripts/fix-pnpm-store.ps1` to create the directory and move the store.

If you run into push permission errors (HTTP 403) when pushing feature branches, see `docs/git-push-troubleshooting.md` for troubleshooting and an automated PowerShell helper: `./scripts/fix-remote.ps1`.

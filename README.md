# Royal Organics

This repository contains the current `frontend/` and `backend/` project structure for Royal Organics.

## Push Current Project To GitHub

Use these commands from the project root to push the current local files and folders to GitHub:

```bash
git add -A
git commit -m "Prepare Royal Organics project for GitHub"
git push origin main
```

## Important

`git add -A` stages:

- new files
- modified files
- deleted files

That means files already present on GitHub will be replaced if changed, and removed from GitHub if they were deleted locally and then pushed.

## First-Time Remote Setup

If this repository is not connected to GitHub yet, use:

```bash
git init
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git add -A
git commit -m "Initial Royal Organics commit"
git push -u origin main
```

## Before Pushing

- Keep `.env` files out of Git
- Keep `node_modules` out of Git
- Review `git status` before each commit

## If GitHub Rejects Large Files

If `git push` fails because old commits still contain files from `node_modules` or other large generated files, rebuild `main` from the current project snapshot and then force-push it:

```bash
git branch backup-main-before-cleanup
git checkout --orphan clean-main
git add .gitignore README.md backend frontend
git commit -m "Clean Royal Organics project for GitHub"
git branch -M clean-main main
git push --force origin main
```

Notes:

- This keeps only the current project files and removes old local history that GitHub is rejecting.
- `git push --force origin main` replaces the current GitHub branch with your cleaned local branch.
- The backup branch lets you recover the old local history if you ever need it.

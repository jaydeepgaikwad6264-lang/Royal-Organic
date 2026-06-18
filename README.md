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

## Host Backend On Vercel

The backend is an Express app inside `backend/`. For Vercel, deploy it as a separate project with `backend` as the root directory.

### Backend Steps

1. Go to Vercel and click `Add New Project`
2. Import this GitHub repository
3. Set `Root Directory` to `backend`
4. Add the production environment variables in Vercel
5. Deploy the backend project
6. Copy the backend URL, for example `https://royal-organics-api.vercel.app`

### Backend Environment Variables

Add these in the Vercel dashboard for the backend project:

```env
MONGO_URI=mongodb+srv://<db-user>:<db-password>@<cluster-url>/<db-name>
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.vercel.app/api/auth/google/callback
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NODE_ENV=production
```

### Backend Code Changes Required

Vercel does not run `backend/src/server.js` like a normal Node server. It needs a serverless entry file.

Create `backend/api/index.js` with:

```js
import mongoose from 'mongoose'
import app from '../src/app.js'

let isConnected = false

async function connectToDatabase() {
  if (isConnected) return

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in production')
  }

  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: false,
  })

  isConnected = true
}

export default async function handler(req, res) {
  await connectToDatabase()
  return app(req, res)
}
```

Create `backend/vercel.json` with:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### Backend Notes

- Keep `backend/src/server.js` only for local development.
- Do not rely on `mongodb-memory-server` in production.
- Set `CORS_ORIGIN` and `FRONTEND_URL` to your frontend Vercel URL.
- Set `GOOGLE_CALLBACK_URL` to your backend Vercel URL plus `/api/auth/google/callback`.

## Host Frontend On Vercel

The frontend is a Next.js app inside `frontend/`. Deploy it as a separate Vercel project with `frontend` as the root directory.

### Frontend Steps

1. Go to Vercel and click `Add New Project`
2. Import the same GitHub repository again
3. Set `Root Directory` to `frontend`
4. Add the frontend environment variables
5. Deploy the frontend project
6. Copy the frontend URL, for example `https://royal-organics.vercel.app`
7. Update the backend Vercel env values to use this frontend URL if needed
8. Redeploy the backend after updating its environment variables

### Frontend Environment Variables

Add this in the Vercel dashboard for the frontend project:

```env
NEXT_PUBLIC_API_BASE=https://your-backend-domain.vercel.app
```

### Frontend Code Changes Required

The frontend already supports a production API URL through `frontend/src/lib/api.ts`:

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
```

Because of that, no extra frontend code change is required if `NEXT_PUBLIC_API_BASE` is set correctly in Vercel.

## Google OAuth Changes

If you are using Google login, also update your Google Cloud Console settings:

- Add the backend callback URL as an authorized redirect URI:
  - `https://your-backend-domain.vercel.app/api/auth/google/callback`
- Add your deployed frontend and backend domains where required in Google Cloud Console
- Make sure the backend `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match the same Google app

## Deployment Order

Use this order to avoid broken links between frontend and backend:

1. Deploy the backend first
2. Copy the backend Vercel URL
3. Deploy the frontend with `NEXT_PUBLIC_API_BASE` set to that backend URL
4. Copy the frontend Vercel URL
5. Update backend `CORS_ORIGIN`, `FRONTEND_URL`, and `GOOGLE_CALLBACK_URL`
6. Redeploy the backend

## Summary Of What You Need To Change

- Add `backend/api/index.js`
- Add `backend/vercel.json`
- Set backend environment variables in Vercel
- Set frontend `NEXT_PUBLIC_API_BASE` in Vercel
- Update Google OAuth redirect settings
- Keep `src/server.js` for local only

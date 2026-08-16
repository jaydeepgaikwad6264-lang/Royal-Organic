[OPEN] Backend Vercel Crash Debug Session

- Session ID: `backend-vercel-crash`
- Symptom: Vercel backend deployment returns `500 INTERNAL_SERVER_ERROR` with `FUNCTION_INVOCATION_FAILED`
- Goal: Identify the serverless runtime crash cause and apply the smallest safe fix
- Status: Investigating

## Hypotheses

1. The backend serverless entrypoint or Vercel routing config is missing or incorrect, so requests never reach the Express app correctly.
2. The serverless function crashes during module import because a dependency or environment variable required at startup is missing in Vercel.
3. MongoDB connection setup is failing in the serverless runtime, causing the function to terminate before sending a response.
4. The Express app imports code that behaves differently in Vercel serverless mode than in local `node src/server.js`.
5. The deployed backend URL or route path is correct, but the function is throwing during request handling due to production-only configuration.

## Evidence Log

- Confirmed: `backend/vercel.json` exists and routes `/(.*)` to `/api/index.js`
- Confirmed: `backend/api/index.js` imports locally without crashing
- Confirmed: `backend/src/app.js` imports locally without crashing
- Confirmed by runtime evidence from deployed backend:
  - `stage: "connectToDatabase"`
  - `details: "Could not connect to any servers in your MongoDB Atlas cluster... IP that isn't whitelisted"`
  - `hasMongoUri: true`
  - `hasJwtSecret: true`
  - `hasStripeSecret: true`
  - `hasFrontendUrl: true`
  - `hasCorsOrigin: true`
  - `mongooseReadyState: 0`
- Conclusion:
  - The backend serverless function is not crashing because of missing app code or missing env vars.
  - The root cause is MongoDB Atlas network access blocking the Vercel runtime from reaching the cluster.
- Instrumentation remains in `backend/api/index.js` until user confirms the fix.
- Additional runtime evidence from frontend:
  - Browser request URL was `https://royal-organic-ten.vercel.app//api/cart`
  - Browser error: `Redirect is not allowed for a preflight request`
- Secondary conclusion:
  - `NEXT_PUBLIC_API_BASE` on the frontend likely includes a trailing slash
  - That trailing slash produced a double-slash API URL and a redirect on CORS preflight
  - Fixed in `frontend/src/lib/api.ts` by trimming trailing slashes from `NEXT_PUBLIC_API_BASE`

## Next Steps

1. Inspect backend deployment files and startup path
2. Collect runtime/build evidence
3. Add minimal instrumentation if needed
4. Confirm root cause
5. Apply minimal fix

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
- Current strongest hypotheses:
  - Missing or incorrect Vercel environment variables
  - MongoDB connection failure in serverless runtime
  - Request-time failure after DB connect in the Express app
- Instrumentation added to `backend/api/index.js` to surface crash stage and env presence in the HTTP response

## Next Steps

1. Inspect backend deployment files and startup path
2. Collect runtime/build evidence
3. Add minimal instrumentation if needed
4. Confirm root cause
5. Apply minimal fix

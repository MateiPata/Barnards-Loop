# Stage 6: AI log

## Tools
- Gemini Argon (4.0)

## Conversations
- <share-link> (Moving satellite data to `frontend/db.json` and handling `useEffect` loading/error states)

## Key requests

### 1. Moving hardcoded satellite data to `db.json` and centralizing `fetch` in `src/api.js`
- Asked: Help me move satellite data from `db.json` via `json-server` and `fetch` only appears inside `src/api.js`.
- Got: `frontend/db.json` with 5 satellites, `frontend/.env.example` and `useEffect` in `App.jsx` with the `ignore` cleanup flag.

## What I learned / what did not work
I learned how to fetch data asynchronously on component mount using `useEffect` with an `ignore` cleanup boolean to prevent race conditions during React's StrictMode double mount. I also learned how to handle the three states of an HTTP request (`loading`, `error`, and data success).
# Stage 7: AI log

## Tools
- Gemini Argon (4.0)

## Key requests

### 1. Extracting `SatelitForm.jsx` and persisting CRUD operations on the server
- Asked: Help me implement server persistence for add/toggle/delete
- Got: `src/api.js` with `request`, `createSatelit`, `updateSatelit`, `deleteSatelit`, `SatelitForm.jsx` with `valideaza()` and `trimite` loading lock

## What I learned / what did not work
I learned how to centralize `fetch` calls through a reusable `request(path, options)` helper that handles `204 No Content` responses and HTTP errors uniformly. I also learned why `handleAdd` should let errors bubble up to `SatelitForm` so the user's input is preserved when the server is down.
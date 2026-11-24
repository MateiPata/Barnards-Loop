# Stage 8: AI log

## Tools
- Gemini Argon (4.0)

## Key requests

### 1. Fixing `NavLink` active state on `/` and ESLint `set-state-in-effect` in the detail page
- Asked: Why does the Home `NavLink` stay highlighted when navigating to `/despre`, and why does `npm run lint` flag `setLoading(true)` inside `useEffect` in `SatelitDetaliuPage.jsx`?
- Got: Added the `end` prop to `<NavLink to="/" end>` for exact route matching and removed the synchronous `setLoading(true)` call from `useEffect`, relying on initial `useState(true)` and clearing `error` in `.then()`.

## What I learned / what did not work
Without the `end` prop, React Router treats `/` as a prefix match for every URL, which kept the Home tab styled as active across all pages. I also learned that calling `setState` synchronously at the top of `useEffect` triggers the `react-hooks/set-state-in-effect` lint error in Vite's ESLint config, whereas resetting state inside the async callback keeps both linting and 404 error handling clean.
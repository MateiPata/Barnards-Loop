# Stage 5: AI log

## Tools
- Gemini =Argon 4.0

## Key requests

### 1. Implementing `useState`, `handleToggle`, `handleDelete`, and `handleTema`
- Asked: Update Barnard's Loop for Stage 5 with local state, checkbox status toggling, item deletion, and a theme switch button in the header.
- Got: Updated `App.jsx`, `SatelitList.jsx`, `SatelitCard.jsx`, and `App.css` using functional state updates `setSateliti((prev) => ...)` and `document.documentElement.dataset.theme`.
- Changed or rejected: Also bound the header logo `src` directly to the `tema` state so the logo switches immediately when clicking the theme toggle button, and restored the two-column layout with the add-satellite form on the left.

## What I learned / what did not work
I learned how state flows down as props while user actions flow up through callback functions (`onToggle`, `onDelete`), and why derived values like the operational satellite counter should be computed during render rather than stored in a separate `useState`. I also learned how to combine `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])` and `:root[data-theme="dark"]` so manual theme selection overrides the OS default in both directions.
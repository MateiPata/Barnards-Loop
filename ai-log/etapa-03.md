# Stage 3: AI log

## Tools
- Gemini Argon 4.0

## Key requests

### 2. Debugging missing logo images in Vite
- Asked: Why is the logo not showing up in the header after moving to React and Vite?
- Got: Explained that Vite serves static files from `frontend/public/` at the root path `/` and pointed out that the dark/light logo filenames were inverted.S

## What I learned / what did not work
I learned how Vite structures a React project, why `node_modules/` and `dist/` must be excluded via `.gitignore`, and how JSX differs from plain HTML (`className`, self-closing tags, and JavaScript expressions inside `{}`). Initially, the logo did not load because the `assets/` folder was outside `frontend/`; moving the images into `frontend/public/` and using root-relative paths fixed the issue.
# Barnard's Loop

A satellite constellation fleet manager to track telemetry status, operational modes, and orbital parameters for mission control operators.

## Data model (work in progress)

| Field | Type | Notes |
| ----------- | ------------ | ------------------------------------ |
| name | text | required, max 100 chars (Satellite ID/Name) |
| noradId | number | unique catalog number, positive integer |
| isOperational | boolean | toggled from the list, default true (Operational vs Maintenance) |
| orbitType | fixed values | LEO, MEO, GEO, HEO, SSO (with dedicated CSS badges) |
| altitudeKm | number | mean orbital altitude in km (positive integer) |
| missionType | relation | Communications, Earth Observation, Navigation, Scientific (week 10) |
| user | relation | ground flight operator owning the entry (week 11) |

Sample data used across all stages:
1. AeroSat-1X, NORAD: 54891, active, LEO, Alt: 550 km, Communications, 2024
2. Sentinel-Alpha, NORAD: 43120, done, MEO, Alt: 20200 km, Earth Observation, 2021
3. GeoRelay-01, NORAD: 39845, active, GEO, Alt: 35786 km, Navigation, 2019

## How to run
cd frontend
npm install
npm run dev
Then open the address printed in the terminal (http://localhost:5173).

## AI usage

| Tool | Used for |
| -------------- | ----------------------------------------- |
| ChatGPT / Gemini | Theme data modeling, CSS Grid/Flexbox layout, dark/light theme calibration, immutable JavaScript functions, React component extraction, and state/event debugging |

Details per stage: see the `ai-log/` folder.

## Verification table (Stage 1)

| ID | Requirement | Where (permalink) | How to check |
| :--- | :--- | :--- | :--- |
| S1-R1 | README: description, fields, sample data, how to run | [README.md](https://github.com/MateiPata/Barnards-Loop/blob/1497d6ffe00948e2da58433717b92810d6cbdcb6/README.md?plain=1#L1-L35) | read |
| S1-R2 | AI usage section | [README.md#ai-usage](https://github.com/MateiPata/Barnards-Loop/blob/1497d6ffe00948e2da58433717b92810d6cbdcb6/README.md?plain=1#L25-L28) | read |
| S1-R3 | AI log for stage 1 | [ai-log/etapa-01.md](https://github.com/MateiPata/Barnards-Loop/blob/1497d6ffe00948e2da58433717b92810d6cbdcb6/ai-log/stage-01.md?plain=1#L1-L7) | read |
| S1-R4 | header, form (text + select), 3 cards with own data | [index.html#L18-L105](https://github.com/MateiPata/Barnards-Loop/blob/1497d6ffe00948e2da58433717b92810d6cbdcb6/index.html#L1-L148) | open the page |
| S1-R5 | finished card looks different | [style.css#L316-L324](https://github.com/MateiPata/Barnards-Loop/blob/1497d6ffe00948e2da58433717b92810d6cbdcb6/style.css#L316-L324) | look at the card (`.done`) |
| S1-R6 | 2 columns on desktop, 1 under 700px | [style.css#L364-L383](https://github.com/MateiPata/Barnards-Loop/blob/1497d6ffe00948e2da58433717b92810d6cbdcb6/style.css#L364-L383) | resize < 700px |
| S1-R7 | visible focus, readable dark theme | [style.css#L33-L51](https://github.com/MateiPata/Barnards-Loop/blob/1497d6ffe00948e2da58433717b92810d6cbdcb6/style.css#L33-L51) | Tab; dark mode |
| S1-R8 | commit "Stage 1" pushed | [Commit Link](https://github.com/MateiPata/Barnards-Loop/commit/1497d6ffe00948e2da58433717b92810d6cbdcb6) | commit history |

---

## Stage 2: data logic
Plain JavaScript, no DOM. `sateliti.js` holds the array and the functions
that read and change it. Results are printed in the browser console (F12).

## Verification table (Stage 2)

| ID | Requirement | Where (permalink) | How to check |
| :--- | :--- | :--- | :--- |
| S2-R1 | JS file linked, logs on page load | [index.html#L140](index.html) | open page, F12 |
| S2-R2 | 3+ items with id, name, state, tag | [sateliti.js#L6-L35](sateliti.js) | read |
| S2-R3 | list, count, search, add, toggle, delete | [sateliti.js#L44-L126](sateliti.js) | console output |
| S2-R4 | add rejects empty name and invalid tag | [sateliti.js#L73-L87](sateliti.js) | last console lines |
| S2-R5 | original array unchanged after add | [sateliti.js#L143-L144](sateliti.js) | console line |
| S2-R6 | README Stage 2 section + AI log | [README.md](README.md), [ai-log/etapa-02.md](ai-log/etapa-02.md) | read |
| S2-R7 | commit "Stage 2" pushed | [Commit Link](https://github.com/) | commit history |

---

## Stage 3: Vite and React project
The app now lives in `frontend/`, built with Vite. The data from stage 2 moved into the main component; the list is still printed raw.

| ID | Requirement | Where (permalink) | How to check |
| :--- | :--- | :--- | :--- |
| S3-R1 | npm run dev starts without errors | [frontend/package.json](frontend/package.json) | npm install, npm run dev |
| S3-R2 | app name and counter computed from data | [frontend/src/App.jsx#L295](frontend/src/App.jsx#L295), [frontend/src/App.jsx#L466-L476](frontend/src/App.jsx#L466-L476) | edit data, save |
| S3-R3 | data from README, not from the example | [frontend/src/App.jsx#L5-L60](frontend/src/App.jsx#L5-L60) | compare with README |
| S3-R4 | stage 1 styles reused | [frontend/src/App.css](frontend/src/App.css) | look at the page |
| S3-R5 | node_modules ignored, build passes | [frontend/.gitignore](frontend/.gitignore) | npm run build |
| S3-R6 | README Stage 3 section + AI log | [README.md](README.md), [ai-log/etapa-03.md](ai-log/etapa-03.md) | read |
| S3-R7 | commit “Stage 3” pushed | [Commits](../../commits/main) | commit history |

---
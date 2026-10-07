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
Open `index.html` in a browser. No build step, no server.

## AI usage
| Tool | Used for |
| -------------- | ----------------------------------------- |
| Google Gemini | Temporary logo creation, font implementation, temporary images sourcing, CSS layout, dark/light theme palette calibration |

Details per stage: see the `ai-log/` folder.

## Status
- [x] Stage 1: static mockup
- [ ] Stage 2: data logic in JavaScript
- [ ] Stage 3: Vite and React project
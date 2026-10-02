# Barnard's Loop

A satellite fleet manager to track telemetry status, operational modes, and orbital parameters for mission control operators.

## Data model

| Field | Type | Notes |
| ----------- | ------------ | ------------------------------------ |
| isMaintenance | boolean | toggled from the list, default false (Operational / Maintenance) |
| orbitType | fixed values | LEO, MEO, GEO, HEO, SSO |
| missionType | relation | Communications, Earth Observation, Navigation, Astronomy |
| user | relation | the ground operator of the satellite (from week 11) |

Sample data used across all stages:
1. AeroSat-1X, active, LEO
2. Sentinel-Alpha, done, MEO
3. GeoRelay-01, active, GEO

## How to run
Open `index.html` in a browser. No build step, no server.

## AI usage
| Tool | Used for |
| -------------- | ----------------------------------------- |

## Status
- [x] Stage 1: static mockup
- [ ] Stage 2: data logic in JavaScript
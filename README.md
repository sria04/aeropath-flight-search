# Aeropath — Flight Route Explorer

A responsive React interface for a Java flight route planner. Choose two cities, compare up to three paths by total sample cost or time, and see every connection. This repository reconstructs the project before the later data-estimate update from the preserved original flight data and preview images.

## Run locally

Requires Node.js 20+, npm, and JDK 17+.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173. The command compiles and starts the Java API on port 8080 and Vite on port 5173. Stop both with Ctrl+C.

## How it works

- `src/main.jsx` contains the search form, route cards, ranking controls, and API calls.
- `src/styles.css` contains the responsive layout.
- `backend/src/Graph.java` loads city connections from `backend/data/flight_data.txt`.
- `backend/src/RouteService.java` finds up to three paths ranked by sample cost or time.
- `backend/src/FlightApiServer.java` serves `/api/cities` and `/api/routes` to the React page.

The flight connections, costs, and times are **sample data**, not real fares, flight schedules, or bookable itineraries. The values are shown to demonstrate route comparison.

## Check

```bash
npm run build
npm run check:backend
```

The older interface previews are in [preview.png](preview.png) and [preview-results.png](preview-results.png).

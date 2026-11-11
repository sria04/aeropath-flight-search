# Aeropath — Flight Route Explorer

A responsive React interface for the provided Java flight planner. Search between cities in the sample network, compare the top three paths by estimated cost or trip time, and see each route's stops. The app runs locally without an account or internet.

## Run locally

Requirements: Node.js 20+, npm, and JDK 17+.

```bash
cd flight-search
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. The single `dev` command starts the Java API on port 8080 and Vite on port 5173. Stop both with Ctrl+C.

## Project structure

```text
flight-search/
├── backend/
│   ├── data/flight_data.txt               # Generated route inputs
│   ├── data/observed_nonstop_routes_2026_08.json # Observed links and times
│   ├── data/dot_market_fares_2026q1.json  # Historical DOT fare benchmarks
│   ├── data/reference_flight_data.txt     # Original sample, kept for reference
│   ├── src/                     # Graph, route search, and HTTP API
│   └── test/                    # Small route-search check
├── scripts/                     # Local startup and data generation
├── src/                         # React components and responsive styles
├── index.html
└── vite.config.js               # Proxies /api to the Java server
```

## API

- `GET /api/cities` returns the available city names.
- `GET /api/routes?from=Boston&to=San%20Francisco&sort=cost` returns up to three routes. `sort=time` ranks by estimated trip time instead.

## Data and estimates

The original arbitrary connections and values are preserved in `backend/data/reference_flight_data.txt`. The active network instead uses **407 observed nonstop links** among 30 selected U.S. airports from the [BTS August 2026 on-time reporting archive](https://transtats.bts.gov/PREZIP/On_Time_Reporting_Carrier_On_Time_Performance_1987_present_2026_8.zip). Each link had at least 30 completed flights in each direction that month. Flight time is the average reported scheduled elapsed time, rounded to five minutes. Each city represents one airport, such as New York = JFK and Chicago = ORD. The saved JSON snapshot lets the demo run offline.

For **380 of those 407 links**, cost uses a historical **2026 Q1 average each-way city-market fare** from the [U.S. DOT Domestic Airfare Consumer Report, Table 6](https://data.transportation.gov/Aviation/Consumer-Airfare-Report-Table-6-Contiguous-State-C/yj5y-b2ir). The other 27, mainly Baltimore links without a matching fare market, use a distance-based estimate fitted from the 380 matches. These market averages can include connecting travelers and multiple airports; they are **not fares for a particular flight**. Adding them across stops is only a comparison estimate.

The route search adds a 60-minute connection allowance, limits results to two stops, and excludes options that exceed the larger of two limits: 60% or two hours longer than the fastest found trip. This removes extreme detours but does not model exact layovers, airline schedules, or availability. The network is a selected historical sample, not a live booking service.

Run `npm run generate:data` if either saved source snapshot changes. Run `npm run check:data` to confirm the generated file matches them.

## Presentation walkthrough

1. Start with the default Boston → San Francisco search to show a direct route and alternatives.
2. Try Chicago → San Diego or Charlotte → Salt Lake City to show that observed nonstop links replace artificial detours. Switch between **Lowest cost** and **Shortest time** to compare alternatives.
3. Choose another city pair or use the swap control to show dynamic multi-leg paths.
4. Resize the browser to demonstrate the mobile layout.

See `AI_WORKFLOW.md` for a truthful explanation of how AI assisted the project and what was reviewed or changed. Run `npm run build`, `npm run check:backend`, and `npm run check:data` before presenting.

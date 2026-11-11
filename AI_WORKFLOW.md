# AI-assisted development: what to show in the A4A interview

This project uses AI in the **development process**. There is no AI model running inside the flight-search app.

## Input and AI assistance

- The starting point was a supplied Java flight planner and sample flight connections.
- Codex helped organize the local React frontend, Java REST API, and one-command development setup.
- Codex generated and revised interface code, including the responsive ticket-style design.
- Codex helped replace the arbitrary connection graph with 407 observed nonstop links and typical scheduled times from BTS reporting data. It matched historical U.S. DOT market fare benchmarks to 380 links and estimated costs for 27 unmatched links. Full route totals remain estimates, not real itineraries or ticket prices.

## Human review and decisions

- The project owner kept the original scope focused on route search and comparison.
- The project owner noticed that an early route illustration showed fixed city labels even when the selected cities changed, and requested a generic redesign.
- The project owner requested removal of an unnecessary caption from that design.
- The project owner also noticed that some multi-city connections were implausible and asked for observed links and fewer extreme detours.
- For the final-round demo, the project owner chose to show AI as a development tool instead of adding a live model dependency to the app.

## Checks and limits

- Codex checked city changes, swap, cost/time ranking, and same-city validation in the browser during development.
- The frontend build, Java compilation and route-search check, and data-generation check can be rerun with `npm run build`, `npm run check:backend`, and `npm run check:data`.
- Before presenting, the project owner should personally run the demo and be ready to explain the code and the estimates.

## A concise explanation to practice

> “I used AI to speed up building the interface and connecting it to my Java route-planning reference. I reviewed the output instead of accepting it blindly. I caught a graphic with fixed city labels that no longer matched the search and asked for a generic design. I also saw implausible connections in the original data, so I asked for observed nonstop links and checked how the route search handles detours. I can explain the data flow, the route search, and the limits of the historical fare estimates.”

Describe any earlier Cursor work only with specific examples you can verify. This file documents the Codex-assisted work in this local version.

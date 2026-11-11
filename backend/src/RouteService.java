import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

final class RouteService {
    private static final int CONNECTION_MINUTES = 60;
    private static final int MAX_LEGS = 3;
    private final Graph graph;

    RouteService(Graph graph) {
        this.graph = graph;
    }

    // Find up to three routes, prioritizing either total time or total cost.
    List<FlightPath> findRoutes(String start, String end, boolean byTime) {
        List<FlightPath> fastest = search(start, end, true, Integer.MAX_VALUE);
        if (fastest.isEmpty()) return fastest;
        int shortest = fastest.get(0).totalTime;
        // Keep trips within 60% or two hours of the fastest path; these are estimates, not scheduled itineraries.
        int maxMinutes = Math.max(shortest + 120, Math.round(shortest * 1.6f));
        return search(start, end, byTime, maxMinutes);
    }

    private List<FlightPath> search(String start, String end, boolean byTime, int maxMinutes) {
        Comparator<FlightPath> comparator = byTime
            ? Comparator.comparingInt(path -> path.totalTime)
            : Comparator.comparingInt(path -> path.totalCost);
        PriorityQueue<FlightPath> queue = new PriorityQueue<>(comparator);
        List<FlightPath> results = new ArrayList<>();
        queue.offer(new FlightPath(List.of(start), 0, 0));

        // Expand the next best partial path until three paths reach the destination.
        while (!queue.isEmpty() && results.size() < 3) {
            FlightPath path = queue.poll();
            if (path.totalTime > maxMinutes) continue;
            String current = path.cities.get(path.cities.size() - 1);
            if (current.equals(end)) {
                results.add(path);
                continue;
            }
            if (path.cities.size() > MAX_LEGS) continue;
            for (Flight flight : graph.getFlightsFrom(current)) {
                // Do not revisit a city already in this path.
                if (!path.cities.contains(flight.destination)) {
                    List<String> cities = new ArrayList<>(path.cities);
                    cities.add(flight.destination);
                    queue.offer(new FlightPath(
                        cities,
                        path.totalCost + flight.cost,
                        path.totalTime + flight.time + (path.cities.size() > 1 ? CONNECTION_MINUTES : 0)
                    ));
                }
            }
        }
        results.sort(comparator);
        return results;
    }
}

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

final class RouteService {
    private final Graph graph;

    RouteService(Graph graph) {
        this.graph = graph;
    }

    // Find up to three routes, prioritizing either total time or total cost.
    List<FlightPath> findRoutes(String start, String end, boolean byTime) {
        Comparator<FlightPath> comparator = byTime
            ? Comparator.comparingInt(path -> path.totalTime)
            : Comparator.comparingInt(path -> path.totalCost);
        PriorityQueue<FlightPath> queue = new PriorityQueue<>(comparator);
        List<FlightPath> results = new ArrayList<>();
        queue.offer(new FlightPath(List.of(start), 0, 0));

        // Expand the next best partial path until three paths reach the destination.
        while (!queue.isEmpty() && results.size() < 3) {
            FlightPath path = queue.poll();
            String current = path.cities.get(path.cities.size() - 1);
            if (current.equals(end)) {
                results.add(path);
                continue;
            }
            for (Flight flight : graph.getFlightsFrom(current)) {
                // Do not revisit a city already in this path.
                if (!path.cities.contains(flight.destination)) {
                    List<String> cities = new ArrayList<>(path.cities);
                    cities.add(flight.destination);
                    queue.offer(new FlightPath(
                        cities,
                        path.totalCost + flight.cost,
                        path.totalTime + flight.time
                    ));
                }
            }
        }
        results.sort(comparator);
        return results;
    }
}

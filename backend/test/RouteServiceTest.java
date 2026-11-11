import java.nio.file.Path;
import java.util.List;

public final class RouteServiceTest {
    public static void main(String[] args) throws Exception {
        Graph graph = new Graph();
        graph.loadFlightData(Path.of("backend/test/route_test_data.txt"));
        RouteService routes = new RouteService(graph);

        List<FlightPath> byCost = routes.findRoutes("A", "C", false);
        check(byCost.get(0).cities.equals(List.of("A", "B", "C")), "Cheapest path should connect via B");
        check(byCost.get(0).totalCost == 200, "Connected path should add leg costs");
        check(byCost.get(0).totalTime == 120, "Connected path should add leg times");

        List<FlightPath> byTime = routes.findRoutes("A", "C", true);
        check(byTime.get(0).cities.equals(List.of("A", "C")), "Direct path should be fastest");
        check(byTime.get(0).totalTime == 100, "Direct path should have no layover");
        System.out.println("Route search checks passed");
    }

    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}

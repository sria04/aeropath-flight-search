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
        check(byCost.get(0).totalTime == 180, "Connected path should add a 60-minute layover");
        check(byCost.stream().noneMatch(path -> path.cities.contains("D")), "Very slow detours should be excluded");

        List<FlightPath> byTime = routes.findRoutes("A", "C", true);
        check(byTime.get(0).cities.equals(List.of("A", "C")), "Direct path should be fastest");
        check(byTime.get(0).totalTime == 100, "Direct path should have no layover");

        Graph sampleGraph = new Graph();
        sampleGraph.loadFlightData(Path.of("backend/data/flight_data.txt"));
        check(sampleGraph.getCities().size() == 30, "The observed sample should include 30 cities");
        List<FlightPath> shortTrip = new RouteService(sampleGraph).findRoutes("Boston", "New York", false);
        check(shortTrip.size() == 1 && shortTrip.get(0).cities.equals(List.of("Boston", "New York")),
            "A short nonstop trip should not show implausible detours");
        List<FlightPath> observedNonstop = new RouteService(sampleGraph).findRoutes("Chicago", "San Diego", true);
        check(observedNonstop.get(0).cities.equals(List.of("Chicago", "San Diego")),
            "An observed nonstop should appear instead of an artificial connection");
        System.out.println("Route search checks passed");
    }

    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}

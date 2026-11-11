import java.util.ArrayList;
import java.util.List;

// One partial or complete route with running totals.
final class FlightPath {
    final List<String> cities;
    final int totalCost;
    final int totalTime;

    FlightPath(List<String> cities, int cost, int time) {
        this.cities = new ArrayList<>(cities);
        this.totalCost = cost;
        this.totalTime = time;
    }
}

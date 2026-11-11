import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Stores each city with the flights reachable from it.
final class Graph {
    private final Map<String, List<Flight>> adjList = new HashMap<>();

    // Each data row is from|to|cost in dollars|time in minutes.
    void loadFlightData(Path filename) throws IOException {
        for (String line : Files.readAllLines(filename)) {
            if (line.isBlank()) continue;
            String[] parts = line.split("\\|");
            if (parts.length != 4) throw new IOException("Invalid flight data row: " + line);
            String from = parts[0].trim();
            String to = parts[1].trim();
            int cost = Integer.parseInt(parts[2].trim());
            int time = Integer.parseInt(parts[3].trim());
            // The sample network treats every connection as bidirectional.
            adjList.computeIfAbsent(from, ignored -> new ArrayList<>()).add(new Flight(to, cost, time));
            adjList.computeIfAbsent(to, ignored -> new ArrayList<>()).add(new Flight(from, cost, time));
        }
    }

    List<Flight> getFlightsFrom(String city) {
        return adjList.getOrDefault(city, Collections.emptyList());
    }

    List<String> getCities() {
        List<String> cities = new ArrayList<>(adjList.keySet());
        Collections.sort(cities);
        return cities;
    }
}

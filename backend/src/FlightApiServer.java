import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Local REST API connecting the React page to the flight graph and route search.
public final class FlightApiServer {
    private FlightApiServer() {}

    public static void main(String[] args) throws IOException {
        Graph graph = new Graph();
        graph.loadFlightData(Path.of("backend/data/flight_data.txt"));
        RouteService routes = new RouteService(graph);

        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8080), 0);
        // Supplies the city dropdown options.
        server.createContext("/api/cities", exchange -> {
            if (!requireGet(exchange)) return;
            StringBuilder json = new StringBuilder("{\"cities\":[");
            List<String> cities = graph.getCities();
            for (int i = 0; i < cities.size(); i++) {
                if (i > 0) json.append(',');
                json.append(quote(cities.get(i)));
            }
            send(exchange, 200, json.append("]}").toString());
        });

        // Validates a search and returns ranked routes as JSON.
        server.createContext("/api/routes", exchange -> {
            if (!requireGet(exchange)) return;
            Map<String, String> params = queryParams(exchange.getRequestURI().getRawQuery());
            String from = params.getOrDefault("from", "");
            String to = params.getOrDefault("to", "");
            String sort = params.getOrDefault("sort", "cost");
            List<String> cities = graph.getCities();
            if (!cities.contains(from) || !cities.contains(to) || from.equals(to)
                    || (!sort.equals("cost") && !sort.equals("time"))) {
                send(exchange, 400, "{\"error\":\"Choose two different cities and sort by cost or time.\"}");
                return;
            }

            List<FlightPath> matches = routes.findRoutes(from, to, sort.equals("time"));
            StringBuilder json = new StringBuilder("{\"from\":")
                .append(quote(from)).append(",\"to\":").append(quote(to))
                .append(",\"sort\":").append(quote(sort)).append(",\"routes\":[");
            for (int i = 0; i < matches.size(); i++) {
                if (i > 0) json.append(',');
                FlightPath path = matches.get(i);
                json.append("{\"cities\":[");
                for (int j = 0; j < path.cities.size(); j++) {
                    if (j > 0) json.append(',');
                    json.append(quote(path.cities.get(j)));
                }
                json.append("],\"totalCost\":").append(path.totalCost)
                    .append(",\"totalTime\":").append(path.totalTime).append('}');
            }
            send(exchange, 200, json.append("]}").toString());
        });

        server.start();
        System.out.println("Flight API ready at http://127.0.0.1:8080");
    }

    private static boolean requireGet(HttpExchange exchange) throws IOException {
        if (exchange.getRequestMethod().equals("GET")) return true;
        send(exchange, 405, "{\"error\":\"Method not allowed.\"}");
        return false;
    }

    private static Map<String, String> queryParams(String rawQuery) {
        Map<String, String> params = new HashMap<>();
        if (rawQuery == null) return params;
        for (String part : rawQuery.split("&")) {
            String[] pair = part.split("=", 2);
            if (pair.length == 2) {
                params.put(URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                    URLDecoder.decode(pair[1], StandardCharsets.UTF_8));
            }
        }
        return params;
    }

    private static String quote(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    private static void send(HttpExchange exchange, int status, String json) throws IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.sendResponseHeaders(status, body.length);
        try (var stream = exchange.getResponseBody()) {
            stream.write(body);
        }
    }
}

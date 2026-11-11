// One connection to another city, with its cost and travel time.
final class Flight {
    final String destination;
    final int cost;
    final int time;

    Flight(String destination, int cost, int time) {
        this.destination = destination;
        this.cost = cost;
        this.time = time;
    }
}

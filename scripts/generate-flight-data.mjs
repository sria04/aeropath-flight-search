import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'backend/data/flight_data.txt');
const nonstopData = JSON.parse(readFileSync(resolve(root, 'backend/data/observed_nonstop_routes_2026_08.json'), 'utf8'));
const dotData = JSON.parse(readFileSync(resolve(root, 'backend/data/dot_market_fares_2026q1.json'), 'utf8'));
const pairKey = (from, to) => [from, to].sort().join('|');
const observedFares = new Map(dotData.records.map(record => [pairKey(record.from, record.to), record]));
if (observedFares.size !== dotData.records.length) throw new Error('Duplicate DOT city pairs in source data.');

// Fit missing market fares to the observed DOT fare/distance relationship.
const count = dotData.records.length;
const sumMiles = dotData.records.reduce((sum, row) => sum + row.distanceMiles, 0);
const sumFare = dotData.records.reduce((sum, row) => sum + row.averageFare, 0);
const sumMilesSquared = dotData.records.reduce((sum, row) => sum + row.distanceMiles ** 2, 0);
const sumMilesFare = dotData.records.reduce((sum, row) => sum + row.distanceMiles * row.averageFare, 0);
const farePerMile = (count * sumMilesFare - sumMiles * sumFare) / (count * sumMilesSquared - sumMiles ** 2);
const baseFare = (sumFare - farePerMile * sumMiles) / count;

// Approximate coordinates near each city's main airport, used for missing fare estimates.
const coordinates = {
  Atlanta: [33.64, -84.43], Austin: [30.19, -97.67], Baltimore: [39.18, -76.67],
  Boston: [42.36, -71.01], Charlotte: [35.21, -80.94], Chicago: [41.98, -87.90],
  Cincinnati: [39.05, -84.67], Cleveland: [41.41, -81.85], Dallas: [32.90, -97.04],
  Denver: [39.86, -104.67], Detroit: [42.21, -83.35], Houston: [29.99, -95.34],
  'Kansas City': [39.30, -94.71], 'Las Vegas': [36.08, -115.15],
  'Los Angeles': [33.94, -118.40], Miami: [25.79, -80.29],
  Minneapolis: [44.88, -93.22], Nashville: [36.13, -86.67],
  'New York': [40.64, -73.78], Orlando: [28.43, -81.31],
  Philadelphia: [39.87, -75.24], Phoenix: [33.43, -112.01],
  Portland: [45.59, -122.60], 'Salt Lake City': [40.79, -111.98],
  'San Antonio': [29.53, -98.47], 'San Diego': [32.73, -117.19],
  'San Francisco': [37.62, -122.38], Seattle: [47.45, -122.31],
  'St. Louis': [38.75, -90.37], Tampa: [27.98, -82.53],
};

const radians = degrees => degrees * Math.PI / 180;
const round5 = value => Math.round(value / 5) * 5;

function milesBetween([lat1, lon1], [lat2, lon2]) {
  const latDiff = radians(lat2 - lat1);
  const lonDiff = radians(lon2 - lon1);
  const a = Math.sin(latDiff / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(lonDiff / 2) ** 2;
  return 3959 * 2 * Math.asin(Math.sqrt(a));
}

let matchedFares = 0;
const rows = nonstopData.routes.map(route => {
  const { from, to } = route;
  if (!coordinates[from] || !coordinates[to]) throw new Error(`Missing coordinates: ${from} or ${to}`);
  if (!Number.isFinite(route.scheduledMinutes) || route.scheduledMinutes <= 0 || route.completedFlights <= 0) throw new Error(`Invalid observed route: ${from} to ${to}`);
  const market = observedFares.get(pairKey(from, to));
  if (market) matchedFares++;
  const miles = market?.distanceMiles ?? milesBetween(coordinates[from], coordinates[to]);
  const flightMinutes = round5(route.scheduledMinutes);
  const estimatedCost = market ? Math.round(market.averageFare) : round5(baseFare + farePerMile * miles);
  return `${from}|${to}|${estimatedCost}|${flightMinutes}`;
});
if (matchedFares !== observedFares.size) throw new Error('DOT fare source contains a city pair outside the observed route network.');

const content = `${rows.join('\n')}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== content) throw new Error('Flight estimates are out of date; run npm run generate:data.');
  console.log(`Checked ${rows.length} route inputs (${matchedFares} historical DOT fares)`);
} else {
  writeFileSync(output, content);
  console.log(`Wrote ${rows.length} route inputs (${matchedFares} historical DOT fares) to ${output}`);
}

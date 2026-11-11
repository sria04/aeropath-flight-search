import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const buildDir = resolve(root, 'backend/build');
mkdirSync(buildDir, { recursive: true });
const result = spawnSync('javac', [
  '-d', buildDir,
  'backend/src/Flight.java',
  'backend/src/FlightPath.java',
  'backend/src/Graph.java',
  'backend/src/RouteService.java',
  'backend/src/FlightApiServer.java',
  'backend/test/RouteServiceTest.java',
], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
const test = spawnSync('java', ['-cp', buildDir, 'RouteServiceTest'], { cwd: root, stdio: 'inherit' });
process.exit(test.status ?? 1);

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const buildDir = resolve(root, 'backend/build');
mkdirSync(buildDir, { recursive: true });

const compile = spawnSync('javac', [
  '-d', buildDir,
  'backend/src/Flight.java',
  'backend/src/FlightPath.java',
  'backend/src/Graph.java',
  'backend/src/RouteService.java',
  'backend/src/FlightApiServer.java',
], { cwd: root, stdio: 'inherit' });

if (compile.status !== 0) {
  process.exit(compile.status ?? 1);
}

const backend = spawn('java', ['-cp', buildDir, 'FlightApiServer'], {
  cwd: root,
  stdio: 'inherit',
});
const frontend = spawn(resolve(root, 'node_modules/.bin/vite'), [], {
  cwd: root,
  stdio: 'inherit',
});

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exitCode = code;
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
backend.on('exit', (code) => stop(code ?? 1));
frontend.on('exit', (code) => stop(code ?? 1));

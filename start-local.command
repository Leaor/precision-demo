#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  printf '%s\n' 'Node.js and npm are needed to run this website.'
  printf '%s\n' 'Install Node.js 24 LTS from https://nodejs.org, then run this script again.'
  exit 1
fi

if ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 20 ? 0 : 1)'; then
  printf '%s\n' 'This local server needs Node.js 20 or newer. Node.js 24 LTS is recommended.'
  exit 1
fi

if [ ! -f dist/index.html ]; then
  printf '%s\n' 'The built website is missing. Use the complete local download, or run npm ci and npm run build first.'
  exit 1
fi

export PORT="${PORT:-5173}"
export HOST=127.0.0.1

node --input-type=module <<'NODE'
import net from 'node:net';
const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be a number between 1 and 65535.');
  process.exit(1);
}
const probe = net.createServer();
probe.once('error', () => {
  console.error(`Port ${port} is already in use or unavailable. Close the app using it, or run PORT=5174 bash start-local.command.`);
  process.exit(1);
});
probe.listen(port, '127.0.0.1', () => probe.close());
NODE

if [ ! -f node_modules/express/package.json ]; then
  printf '%s\n' 'Installing the website runtime. This first start requires an internet connection.'
  npm ci --omit=dev --no-audit --no-fund
fi

browser_waiter=''
cleanup() {
  if [ -n "$browser_waiter" ]; then
    kill "$browser_waiter" 2>/dev/null || true
  fi
}
trap cleanup EXIT

printf '\nPrecision Demolition will open at http://localhost:%s/\n' "$PORT"
printf '%s\n\n' 'Keep this Terminal window open. Press Control-C to stop the website.'

if [ "$(uname -s)" = Darwin ] && command -v open >/dev/null 2>&1; then
  (
    if node --input-type=module <<'NODE'
const address = `http://127.0.0.1:${process.env.PORT}/api/estimate/status`;
for (let attempt = 0; attempt < 60; attempt += 1) {
  try {
    const response = await fetch(address, { signal: AbortSignal.timeout(1000) });
    if (response.ok) process.exit(0);
  } catch {}
  await new Promise(resolve => setTimeout(resolve, 500));
}
process.exit(1);
NODE
    then
      open "http://localhost:$PORT/"
    fi
  ) &
  browser_waiter=$!
fi

npm start

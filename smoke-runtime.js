const { spawn } = require('node:child_process');

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  const server = spawn('pnpm', ['--filter', 'web', 'start', '--', '--port', '4010'], {
    cwd: 'D:/BK-poli',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  let ready = false;
  server.stdout.on('data', (d) => {
    const t = d.toString();
    if (t.includes('Ready') || t.includes('localhost:4010')) ready = true;
  });

  server.stderr.on('data', () => {});

  for (let i = 0; i < 25; i += 1) {
    if (ready) break;
    await sleep(500);
  }

  const urls = [
    'http://localhost:4010/',
    'http://localhost:4010/jadwal-dokter',
    'http://localhost:4010/daftar-pengobatan',
    'http://localhost:4010/poli',
    'http://localhost:4010/login',
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(`${u} -> ${res.status}`);
    } catch (e) {
      console.log(`${u} -> ERROR`);
    }
  }

  server.kill('SIGTERM');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

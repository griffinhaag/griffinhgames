// Runs every end-to-end test in a real browser and prints a PASS/FAIL report.
//
//   cd tests/e2e
//   npm install && npx playwright install chromium   (first time only)
//   npm test                 # everything
//   npm test -- local        # only Truth or Griddy, Kings Dice, homepage
//   npm test -- locked-in    # only LOCKED IN
//
// It starts its own copy of the site (port 8080) and of the game server (port 3000)
// from the griffinhgames-server folder next to this repo. Set SERVER_DIR to use another path.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '../..');
const serverDir = path.resolve(process.env.SERVER_DIR || path.join(siteRoot, '../griffinhgames-server'));
const only = process.argv[2];

const suites = [
    { key: 'local', title: 'Truth or Griddy, Kings Dice, and the homepage', file: './local-games.test.mjs' },
    { key: 'locked-in', title: 'LOCKED IN (multiplayer trivia)', file: './locked-in.test.mjs' },
].filter(s => !only || s.key === only);

// --- A tiny static file server for the site (stands in for Netlify) ---
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
function startSite(port) {
    const server = createServer(async (req, res) => {
        try {
            let file = path.join(siteRoot, decodeURIComponent(new URL(req.url, 'http://x').pathname));
            if (!file.startsWith(siteRoot)) throw new Error('outside site');
            if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
            res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
            res.end(await readFile(file));
        } catch {
            res.writeHead(404).end('Not found');
        }
    });
    return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}

// --- The real game server, started from the griffinhgames-server repo ---
async function startGameServer(port) {
    if (!existsSync(path.join(serverDir, 'server.js'))) {
        throw new Error(`Game server not found at ${serverDir}. Clone griffinhgames-server next to this repo or set SERVER_DIR.`);
    }
    if (!existsSync(path.join(serverDir, 'node_modules'))) {
        throw new Error(`Run "npm install" in ${serverDir} first.`);
    }
    const proc = spawn(process.execPath, ['server.js'], { cwd: serverDir, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
    for (let i = 0; i < 50; i++) {
        try { if ((await fetch(`http://localhost:${port}/`)).ok) return proc; } catch {}
        await new Promise(r => setTimeout(r, 200));
    }
    proc.kill();
    throw new Error('Game server did not start on port ' + port);
}

const site = await startSite(8080);
const needsServer = suites.some(s => s.key === 'locked-in');
const gameServer = needsServer ? await startGameServer(3000) : null;

// The music tests check which track the game *tells* YouTube to play. Real browsers also
// apply their own autoplay rules on top of that, which a test browser can't reproduce,
// so autoplay restrictions are turned off here.
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

let failedTotal = 0;
try {
    for (const suite of suites) {
        const tests = (await import(suite.file)).default;
        console.log(`\n${suite.title}`);
        for (const t of tests) {
            const checks = [];
            const check = (description, ok, detail = '') => checks.push({ description, ok: !!ok, detail });
            const pages = [];
            const errors = [];
            const newPage = async (label = 'page') => {
                const p = await context.newPage();
                p.on('pageerror', e => errors.push(`[${label}] ${e.message}`));
                p.on('dialog', d => { p.lastDialog = d.message(); d.accept(); });
                p.label = label;
                pages.push(p);
                return p;
            };
            try {
                await t.run({ newPage, check, sleep: ms => new Promise(r => setTimeout(r, ms)) });
            } catch (e) {
                check('test finished without crashing', false, e.message.split('\n')[0]);
            }
            if (errors.length) check('no errors in the browser console', false, errors.join(' | '));
            for (const p of pages) await p.close().catch(() => {});

            const failed = checks.filter(c => !c.ok);
            failedTotal += failed.length;
            console.log(`  ${failed.length ? '✗' : '✓'} ${t.name}`);
            for (const c of checks) {
                if (!c.ok) console.log(`      FAIL: ${c.description}${c.detail ? `  (${typeof c.detail === 'string' ? c.detail : JSON.stringify(c.detail)})` : ''}`);
            }
        }
    }
} finally {
    await browser.close();
    site.close();
    gameServer?.kill();
}

console.log(failedTotal ? `\n${failedTotal} check(s) failed.` : '\nAll tests passed.');
process.exit(failedTotal ? 1 : 0);

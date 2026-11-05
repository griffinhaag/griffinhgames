// End-to-end tests for LOCKED IN, the multiplayer trivia game.
// Each test opens several browser tabs (one host, some players) against a real game server.

const GAME = 'http://localhost:8080/games/buzzin';

// ---------- Helpers ----------

// What a tab currently shows: game phase, whether it's the host, and the visible screen.
const state = (page) => page.evaluate(() => ({
    phase: typeof gameState !== 'undefined' && gameState ? gameState.phase : null,
    isHost: typeof isHost !== 'undefined' ? isHost : null,
    screen: document.querySelector('.screen.active')?.id || null,
})).catch(() => ({}));

async function waitUntil(page, condition, ms = 15000) {
    const start = Date.now();
    while (Date.now() - start < ms) {
        const s = await state(page);
        if (condition(s)) return s;
        await page.waitForTimeout(250);
    }
    return state(page);
}

// Create a room from the setup page. Short timers and no 3-2-1 countdown keep tests fast.
async function hostRoom(newPage, { name = 'Hosty', hostPlays = false, questions = 5, offTheDome = 1 } = {}) {
    const host = await newPage('host');
    await host.goto(`${GAME}/setup.html`);
    await host.evaluate(() => sessionStorage.clear());
    await host.waitForTimeout(700);
    await host.fill('#host-name', name);
    const setSlider = (id, value) => host.evaluate(([id, value]) => {
        const el = document.getElementById(id);
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }, [id, value]);
    await setSlider('q-count-slider', questions);
    await setSlider('otd-count-slider', offTheDome);
    await setSlider('timer-slider', 10);
    await setSlider('otd-timer-slider', 10);
    if (!hostPlays) await host.uncheck('#host-plays-toggle');
    await host.uncheck('#countdown-toggle');
    await host.click('#btn-create-room');
    await host.waitForURL(/index\.html\?room=/, { timeout: 10000 });
    await waitUntil(host, s => s.screen === 'screen-lobby', 8000);
    return { host, room: new URL(host.url()).searchParams.get('room') };
}

async function joinRoom(newPage, room, name) {
    const player = await newPage(name);
    await player.goto(`${GAME}/join.html`);
    await player.fill('#player-name', name);
    await player.fill('#room-code', room);
    await player.click('#btn-join');
    await player.waitForURL(/index\.html\?room=/, { timeout: 10000 }).catch(() => {});
    await player.waitForTimeout(1200);
    return player;
}

// Play the game like real people: the host advances rounds, players answer, everyone
// taps through the results. Stops at `until` (a phase name) or when the game ends.
async function play(host, players, { until = 'end', typedAnswers = {}, maxMs = 120000 } = {}) {
    const start = Date.now();
    let roundsWithResults = 0;
    let lastPhase = null;
    while (Date.now() - start < maxMs) {
        const s = await state(host);
        if (s.phase === until) return { reached: true, roundsWithResults };
        if (s.phase === 'end') return { reached: until === 'end', roundsWithResults };
        if (s.phase === 'result' && lastPhase !== 'result') roundsWithResults++;
        lastPhase = s.phase;

        for (const button of ['#btn-show-question', '#btn-next-question']) {
            const b = host.locator(button);
            if (await b.isVisible().catch(() => false)) await b.click({ timeout: 3000 }).catch(() => {});
        }
        for (const page of [host, ...players]) {
            const results = page.locator('#results-overlay');
            if (await results.isVisible().catch(() => false)) await results.click({ position: { x: 5, y: 5 } }).catch(() => {});
        }
        if (s.phase === 'question') {
            for (const [i, player] of players.entries()) {
                if (await player.locator('#player-answer-section').isVisible().catch(() => false)) {
                    await player.fill('#player-answer-input', typedAnswers[player.label] ?? 'paris').catch(() => {});
                    await player.click('#btn-submit-answer', { timeout: 3000 }).catch(() => {});
                } else {
                    const choice = player.locator('.choice-btn:not([disabled])').nth(i % 2);
                    if (await choice.isVisible().catch(() => false)) await choice.click({ timeout: 3000 }).catch(() => {});
                }
            }
        }
        await host.waitForTimeout(400);
    }
    return { reached: false, roundsWithResults, stuckAt: await state(host) };
}

// YouTube player states: 1 = playing, 2 = paused, 5 = loaded but not started
const musicState = (page) => page.evaluate(() => ({
    musicOn: musicEnabled,
    lobbyMusic: lobbyPlayer?.getPlayerState?.(),
    questionMusic: questionMusicPlayer?.getPlayerState?.(),
}));

// ---------- Tests ----------

const tests = [
    {
        name: 'A full game: multiple choice and OFF THE DOME rounds, end screen, Play Again',
        async run({ newPage, check, sleep }) {
            const { host, room } = await hostRoom(newPage, { questions: 5, offTheDome: 2 });
            const alice = await joinRoom(newPage, room, 'Alice');
            const bob = await joinRoom(newPage, room, '<b>Bob</b>'); // a name containing HTML

            const lobby = await host.locator('[data-player-sid]').allInnerTexts();
            check('the host sees both players in the lobby, names as plain text', lobby.some(t => t.includes('Alice')) && lobby.some(t => t.includes('<b>Bob</b>')), lobby);

            await host.click('#btn-start-game');
            const game = await play(host, [alice, bob], {
                typedAnswers: { '<b>Bob</b>': '<img src=x onerror="window.hacked=1">' }, // tries to run code
            });
            check('the game reaches the end screen', game.reached, game);
            check('round results appear after each question', game.roundsWithResults >= 3, game);

            const hacked = await Promise.all([host, alice, bob].map(p => p.evaluate(() => !!window.hacked)));
            check('a typed answer containing HTML is shown as text, not run as code', hacked.every(h => !h), hacked);

            const podium = await host.locator('#screen-end').innerText();
            check('the end screen lists the players', podium.includes('Alice') && podium.includes('<b>Bob</b>'));

            await alice.close(); // a player leaves from the end screen
            await sleep(2500);
            const afterLeave = await state(host);
            const hostText = await host.locator('body').innerText();
            check('the host stays on the end screen when a player leaves', afterLeave.screen === 'screen-end' && !/Game in progress, loading/.test(hostText), afterLeave);

            await host.click('#btn-play-again');
            await sleep(500);
            await host.click('#pa-start');
            const again = await waitUntil(host, s => ['countdown', 'waiting', 'question'].includes(s.phase), 8000);
            check('Play Again starts a new game', ['countdown', 'waiting', 'question'].includes(again.phase), again);
        },
    },

    {
        name: 'A broken answer does not freeze the round, and the Flag toast stays on screen',
        async run({ newPage, check, sleep }) {
            const { host, room } = await hostRoom(newPage, { offTheDome: 0 });
            const ann = await joinRoom(newPage, room, 'Ann');
            const ben = await joinRoom(newPage, room, 'Ben');
            await host.click('#btn-start-game');
            await play(host, [], { until: 'question', maxMs: 25000 });

            await ben.evaluate(() => socket.emit('player:submitAnswer', { roomCode, answer: 123 })); // not text
            await ann.locator('.choice-btn').first().click();
            const afterBadAnswer = await waitUntil(host, s => s.phase === 'result', 15000);
            check('the round still finishes after a non-text answer', afterBadAnswer.phase === 'result', afterBadAnswer);

            await play(host, [ann, ben], { until: 'question', maxMs: 25000 });
            await host.evaluate(() => socket.emit('host:flagQuestion', { roomCode }));
            await sleep(700);
            check('"Question flagged" toast is still visible after 0.7 seconds', await ann.locator('#void-round-toast').isVisible());
        },
    },

    {
        name: 'Host drops while the game is paused: the new host can resume',
        async run({ newPage, check }) {
            const { host, room } = await hostRoom(newPage, { hostPlays: true, offTheDome: 0 });
            const amy = await joinRoom(newPage, room, 'Amy');
            await joinRoom(newPage, room, 'Ray');
            await host.click('#btn-start-game');
            await play(host, [], { until: 'question', maxMs: 25000 });

            await host.evaluate(() => socket.emit('host:pauseGame', { roomCode }));
            await waitUntil(amy, s => s.phase === 'paused', 5000);
            await host.close();

            const promoted = await waitUntil(amy, s => s.isHost === true, 40000);
            await amy.waitForTimeout(800);
            const resume = amy.locator('#pause-resume-btn');
            check('the promoted player sees a Resume button', promoted.isHost && await resume.isVisible(), promoted);
            await resume.click();
            const resumed = await waitUntil(amy, s => s.phase !== 'paused', 8000);
            check('pressing Resume continues the game', resumed.phase !== 'paused', resumed);
        },
    },

    {
        name: 'Host leaves the lobby: the new host gets the crown and kick buttons',
        async run({ newPage, check, sleep }) {
            const { host, room } = await hostRoom(newPage, { hostPlays: true });
            const kim = await joinRoom(newPage, room, 'Kim');
            await joinRoom(newPage, room, 'Lee');
            await host.close();
            await waitUntil(kim, s => s.isHost === true, 40000);
            await sleep(1000);
            const entries = await kim.locator('[data-player-sid]').allInnerTexts();
            check('the new host has the crown', entries.some(t => t.includes('Kim') && t.includes('👑')), entries);
            check('the new host can kick other players', (await kim.locator('.kick-btn').count()) >= 1);
        },
    },

    {
        name: 'A kicked player cannot rejoin the same room',
        async run({ newPage, check, sleep }) {
            const { host, room } = await hostRoom(newPage);
            await joinRoom(newPage, room, 'Max');
            const zoe = await joinRoom(newPage, room, 'Zoe');
            const zoeId = await zoe.evaluate(() => socket.id);
            await host.evaluate((id) => socket.emit('host:kickPlayer', { roomCode, socketId: id }), zoeId);
            await sleep(1000);
            await joinRoom(newPage, room, 'Zoe');
            await sleep(1500);
            const names = await host.locator('[data-player-sid]').allInnerTexts();
            check('Zoe is not back in the room', !names.some(n => n.includes('Zoe')), names);
        },
    },

    {
        name: 'Switching devices: the old tab shows a Rejoin button that works',
        async run({ newPage, check, sleep }) {
            const { host, room } = await hostRoom(newPage, { name: 'Dev', hostPlays: true });
            await joinRoom(newPage, room, 'Pat');
            await joinRoom(newPage, room, 'Dev'); // same name on the same network = device switch
            await sleep(1500);
            const rejoin = host.locator('#device-changed-banner button');
            check('the old tab shows a "session moved" banner with Rejoin', await rejoin.isVisible());
            await rejoin.click();
            let connected = false;
            for (let i = 0; i < 40 && !connected; i++) { await sleep(250); connected = await host.evaluate(() => socket.connected); }
            const back = await waitUntil(host, s => s.isHost === true, 5000);
            check('Rejoin reconnects the old tab as host', connected && back.isHost, back);
        },
    },

    {
        name: 'Music: Music On plays right away, question music plays by itself, Music Off is silent',
        async run({ newPage, check, sleep }) {
            const { host, room } = await hostRoom(newPage, { hostPlays: true });
            await host.evaluate(() => localStorage.removeItem('buzzin_music')); // music starts off
            await host.reload();
            await sleep(4000);

            await host.click('#btn-music-toggle');
            await sleep(2500);
            const on = await musicState(host);
            check('clicking Music On starts the lobby music right away', on.musicOn && on.lobbyMusic === 1, on);

            await host.click('#btn-music-toggle');
            await sleep(1000);
            const off = await musicState(host);
            check('clicking Music Off stops all music', !off.musicOn && off.lobbyMusic !== 1 && off.questionMusic !== 1, off);

            await host.click('#btn-music-toggle'); // back on for the game
            await joinRoom(newPage, room, 'Mo');
            await host.bringToFront();
            await host.click('#btn-start-game');
            await play(host, [], { until: 'question', maxMs: 25000 });
            await sleep(2000);
            const inQuestion = await musicState(host);
            check('question music plays during a question with no extra clicks', inQuestion.questionMusic === 1 && inQuestion.lobbyMusic !== 1, inQuestion);

            await host.reload();
            await sleep(6000);
            const afterReload = { ...(await state(host)), ...(await musicState(host)) };
            check('question music comes back after reloading mid-question', afterReload.phase !== 'question' || afterReload.questionMusic === 1, afterReload);
        },
    },

    {
        name: 'Music: round music is never heard in the lobby, even on a slow connection',
        async run({ newPage, check, sleep }) {
            const { host } = await hostRoom(newPage, { hostPlays: true });
            await host.evaluate(() => localStorage.removeItem('buzzin_music'));
            await host.reload();
            await sleep(4000);
            // Record every time the round-music player starts, and whether it's muted
            await host.evaluate(() => {
                window.roundMusicStarts = [];
                questionMusicPlayer.addEventListener('onStateChange', (e) => {
                    if (e.data === 1) window.roundMusicStarts.push({ muted: questionMusicPlayer.isMuted() });
                });
            });
            // A very slow connection makes the player buffer, which used to let it start un-muted
            const network = await host.context().newCDPSession(host);
            await network.send('Network.enable');
            await network.send('Network.emulateNetworkConditions', { offline: false, latency: 1500, downloadThroughput: 20 * 1024, uploadThroughput: 20 * 1024 });
            await host.click('#btn-music-toggle');
            await sleep(4000);
            await network.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

            const samples = [];
            for (let i = 0; i < 16; i++) {
                await sleep(500);
                samples.push(await musicState(host).then(m => ({ ...m, roundMuted: host.evaluate(() => questionMusicPlayer.isMuted()) })));
            }
            for (const s of samples) s.roundMuted = await s.roundMuted;
            const starts = await host.evaluate(() => window.roundMusicStarts);
            const audible = samples.some(s => s.questionMusic === 1 && !s.roundMuted) || starts.some(s => !s.muted);
            check('round music is never playing out loud while in the lobby', !audible, { starts, last: samples.at(-1) });
            check('lobby music is playing', samples.at(-1).lobbyMusic === 1, samples.at(-1));
        },
    },

    {
        name: 'Flags: every flag is shown big (but not oversized) on the host screen and phones',
        async run({ newPage, check, sleep }) {
            const host = await newPage('host');
            await host.goto(`${GAME}/setup.html`);
            await host.evaluate(() => sessionStorage.clear());
            await sleep(800);
            await host.fill('#host-name', 'Host');
            const boxes = host.locator('#category-checkboxes input');
            for (let i = 0; i < await boxes.count(); i++) {
                const box = boxes.nth(i);
                if ((await box.getAttribute('value')) !== 'Flags' && await box.isChecked()) await box.uncheck();
            }
            for (const [id, value] of [['q-count-slider', 8], ['otd-count-slider', 3], ['timer-slider', 10], ['otd-timer-slider', 10]]) {
                await host.evaluate(([id, value]) => {
                    const el = document.getElementById(id);
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }, [id, value]);
            }
            await host.uncheck('#countdown-toggle');
            await host.click('#btn-create-room');
            await host.waitForURL(/index\.html\?room=/, { timeout: 10000 });
            const room = new URL(host.url()).searchParams.get('room');
            const phone = await joinRoom(newPage, room, 'Pia');
            await phone.setViewportSize({ width: 390, height: 844 });

            // Measure the flag wherever it's showing: the question view and the host's results panel
            const flagSizes = (page) => page.evaluate(() => {
                const found = [];
                for (const id of ['player-image-display', 'host-image-display']) {
                    const box = document.getElementById(id);
                    if (!box || !box.offsetParent) continue;
                    const img = box.querySelector('img');
                    const r = (img || box).getBoundingClientRect();
                    found.push({ where: id, isImage: !!img, width: Math.round(r.width), height: Math.round(r.height) });
                }
                const emojiInText = /[\u{1F1E6}-\u{1F1FF}]{2}/u.test(document.body.innerText);
                return { phase: gameState?.phase, question: gameState?.currentQuestion?.question, found, emojiInText };
            });

            await host.bringToFront();
            await host.click('#btn-start-game');
            const problems = [];
            let picturesChecked = 0;
            for (let i = 0; i < 200; i++) {
                const phase = await host.evaluate(() => gameState?.phase);
                if (phase === 'end') break;
                for (const button of ['#btn-show-question', '#btn-next-question']) {
                    const b = host.locator(button);
                    if (await b.isVisible().catch(() => false)) await b.click({ timeout: 2000 }).catch(() => {});
                }
                if (phase === 'question' || phase === 'result') {
                    // [who, page, smallest allowed long side, largest allowed width, largest allowed height]
                    for (const [who, page, minSide, maxWidth, maxHeight] of [['host', host, 140, 220, 150], ['phone', phone, 120, 160, 150]]) {
                        const m = await flagSizes(page);
                        // Only judge a device while it is itself showing the question or its result
                        const isPictureQuestion = ['question', 'result'].includes(m.phase) && /this flag/i.test(m.question || '');
                        if (m.emojiInText) problems.push(`${who}: flag emoji left in the text (${m.question})`);
                        if (isPictureQuestion) {
                            if (!m.found.length) problems.push(`${who}: no flag shown for "${m.question}" (${m.phase})`);
                            for (const f of m.found) {
                                picturesChecked++;
                                if (!f.isImage) problems.push(`${who} ${f.where}: shown as text, not a picture`);
                                else if (Math.max(f.width, f.height) < minSide) problems.push(`${who} ${f.where}: too small (${f.width}×${f.height})`);
                                else if (f.width > maxWidth + 1 || f.height > maxHeight + 1) problems.push(`${who} ${f.where}: too big (${f.width}×${f.height})`);
                            }
                        }
                    }
                }
                for (const page of [host, phone]) {
                    const results = page.locator('#results-overlay');
                    if (await results.isVisible().catch(() => false)) await results.click({ position: { x: 5, y: 5 } }).catch(() => {});
                }
                if (phase === 'question') {
                    if (await phone.locator('#player-answer-section').isVisible().catch(() => false)) {
                        await phone.fill('#player-answer-input', 'france').catch(() => {});
                        await phone.click('#btn-submit-answer', { timeout: 2000 }).catch(() => {});
                    } else {
                        const choice = phone.locator('.choice-btn:not([disabled])').first();
                        if (await choice.isVisible().catch(() => false)) await choice.click({ timeout: 2000 }).catch(() => {});
                    }
                }
                await sleep(400);
            }
            check('flags were checked on several questions', picturesChecked >= 6, `${picturesChecked} flag views checked`);
            check('every flag is a big picture that fits its frame (host 220×150, phone 160×150), never a tiny emoji', problems.length === 0, [...new Set(problems)].slice(0, 5).join(' | '));

            // Safety net: even a question that arrives with the flag still in its text is shown big
            const split = await phone.evaluate(() => splitQuestionImage({ question: 'Which country does this flag belong to? 🇰🇭' }));
            check('a flag left at the end of the question text is pulled out and shown as the picture', split.image === '🇰🇭' && split.text === 'Which country does this flag belong to?', split);
        },
    },

    {
        name: 'Creating a lobby never says "Host status restored", even on a slow connection',
        async run({ newPage, check, sleep }) {
            const host = await newPage('host');
            const hostToasts = () => host.evaluate(() => [...document.querySelectorAll('body *')]
                .filter(el => el.children.length === 0 && /Host status restored/i.test(el.textContent)).length);

            // Normal speed, several lobbies in a row with different names
            for (const name of ['Alpha', 'Bravo', 'Charlie']) {
                await host.goto(`${GAME}/setup.html`);
                await sleep(600);
                await host.fill('#host-name', name);
                await host.click('#btn-create-room');
                await host.waitForURL(/index\.html\?room=/, { timeout: 10000 });
                await sleep(2500);
                check(`no "Host status restored" after creating a lobby as ${name}`, (await hostToasts()) === 0);
            }

            // Slow connection: hold the game page's connection back for 6 seconds
            await host.goto(`${GAME}/setup.html`);
            await sleep(600);
            await host.fill('#host-name', 'Slowpoke');
            await host.route('**/socket.io/**', async (route) => {
                if (route.request().frame().url().includes('index.html')) await new Promise(r => setTimeout(r, 6000));
                await route.continue();
            });
            await host.click('#btn-create-room');
            await host.waitForURL(/index\.html\?room=/, { timeout: 10000 });
            const joined = await waitUntil(host, s => s.isHost === true && s.screen === 'screen-lobby', 20000);
            await sleep(2000);
            check('a slow page load still joins as host', joined.isHost === true, joined);
            check('no "Host status restored" after a slow page load', (await hostToasts()) === 0);
            await host.unroute('**/socket.io/**');

            // A host who really leaves and comes back still gets the message
            const room = new URL(host.url()).searchParams.get('room');
            await host.goto('about:blank');
            await sleep(6500);
            const back = await newPage('host again');
            await back.goto(`${GAME}/join.html`);
            await back.fill('#player-name', 'Slowpoke');
            await back.fill('#room-code', room);
            await back.click('#btn-join');
            await back.waitForURL(/index\.html\?room=/, { timeout: 10000 });
            let restored = 0;
            for (let i = 0; i < 12 && !restored; i++) {
                await sleep(250);
                restored = await back.evaluate(() => [...document.querySelectorAll('body *')]
                    .filter(el => el.children.length === 0 && /Host status restored/i.test(el.textContent)).length);
            }
            check('a host who leaves and comes back does see "Host status restored"', restored > 0);
        },
    },

    {
        name: 'Setup page: every option reaches the game exactly as chosen',
        async run({ newPage, check, sleep }) {
            const page = await newPage('setup');
            await page.goto(`${GAME}/setup.html`);
            await page.evaluate(() => sessionStorage.clear());
            await sleep(800);
            await page.fill('#host-name', 'Probe');
            await page.click('#category-checkboxes input[value="Flags"]');
            await page.click('#category-checkboxes input[value="Music"]');
            for (const [id, value] of [['q-count-slider', 20], ['otd-count-slider', 5], ['timer-slider', 45], ['otd-timer-slider', 90]]) {
                await page.evaluate(([id, value]) => {
                    const el = document.getElementById(id);
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }, [id, value]);
            }
            await page.click('#countdown-toggle');
            await page.click('#hard-mode-toggle');
            await page.click('#otd-at-end-toggle');

            // Uncheck and recheck every category: the question count must still match the slider
            const boxes = page.locator('#category-checkboxes input');
            for (let i = 0; i < await boxes.count(); i++) { const b = boxes.nth(i); if (await b.isChecked()) await b.uncheck(); }
            for (const cat of ['General Knowledge', 'Science', 'Movies & TV', 'Sports', 'History', 'Geography', 'Pop Culture', 'Games', 'Random']) {
                await page.check(`#category-checkboxes input[value="${cat}"]`);
            }
            const shown = await page.evaluate(() => ({ count: document.getElementById('q-count-display').textContent, slider: document.getElementById('q-count-slider').value }));
            check('after re-selecting categories, the count shown matches the slider', shown.count === shown.slider, shown);
            await page.evaluate(() => {
                const el = document.getElementById('q-count-slider');
                el.value = 20;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                const otd = document.getElementById('otd-count-slider');
                otd.value = 5;
                otd.dispatchEvent(new Event('input', { bubbles: true }));
            });

            await page.click('#btn-create-room');
            await page.waitForURL(/index\.html\?room=/, { timeout: 10000 });
            const settings = await page.evaluate(() => JSON.parse(sessionStorage.getItem('buzzin_settings')));
            const expected = {
                categories: ['General Knowledge', 'Science', 'Movies & TV', 'Sports', 'History', 'Geography', 'Pop Culture', 'Games', 'Random'],
                questionCount: 20, timerDuration: 45, otdTimerDuration: 90, hostName: 'Probe',
                bonusFirstCorrect: true, hostAsPlayer: true, offTheDomeCount: 5,
                countdownEnabled: false, otdAtEnd: true, showOtdCategory: true, hardMode: true,
            };
            const mismatches = Object.keys(expected).filter(k => JSON.stringify(settings?.[k]) !== JSON.stringify(expected[k]));
            check('a room is created and every setting is saved as chosen', mismatches.length === 0, mismatches.map(k => `${k}: ${JSON.stringify(settings?.[k])}`).join(', '));
        },
    },
];

export default tests;

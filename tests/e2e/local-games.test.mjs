// End-to-end tests for the single-device games and the homepage.
// Each test opens the real pages in a browser and plays the game the way a person would.

const SITE = 'http://localhost:8080';

const DECKS = [
    ['Walk on the Beach', 'WalkOnTheBeach/walkonthebeach.html'],
    ["Wildin' Categories", 'WildinCategories/wildincategories.html'],
    ["No Holdin' Back", 'NoHoldinBack/noholdinback.html'],
    ['All In or What?', 'AllInOrWhat/allinorwhat.html'],
];

const tests = [
    {
        name: 'Homepage: shows the games with no error message, and every game link works',
        async run({ newPage, check, sleep }) {
            const page = await newPage('homepage');
            await page.goto(`${SITE}/index.html`);
            await sleep(1500);
            const text = await page.locator('body').innerText();
            check('no "Loading games" or "Unable to connect" text', !/Loading games|Unable to connect/i.test(text));

            const links = await page.$$eval('a.play-button', as => as.map(a => a.getAttribute('href')));
            const broken = [];
            for (const href of links) {
                const status = (await page.request.get(`${SITE}/${encodeURI(href)}`)).status();
                if (status !== 200) broken.push(`${href} (${status})`);
            }
            check('there are at least 5 game links', links.length >= 5, `${links.length} links`);
            check('every game link opens a page', broken.length === 0, broken.join(', '));
        },
    },

    ...DECKS.map(([deckName, deckPath]) => ({
        name: `Truth or Griddy (${deckName}): a full game from start to Game Over`,
        async run({ newPage, check, sleep }) {
            const page = await newPage(deckName);
            await page.goto(`${SITE}/games/truthOrgriddy/${deckPath}`);
            await sleep(300);
            const deckSize = await page.evaluate(() => shuffledQuestions.length);

            const addPlayer = async (name) => { await page.fill('#playerInput', name); await page.evaluate(() => addPlayer()); };
            await addPlayer('Sam');
            await addPlayer('sam');          // same name, different case
            await addPlayer('<b>Jo</b>');    // a name containing HTML
            const players = await page.evaluate(() => players.slice());
            check('a duplicate name is rejected with a message', players.length === 2 && /already playing/.test(page.lastDialog || ''), players);

            await page.evaluate(() => startGame());
            await sleep(200);
            const first = await page.evaluate(() => ({
                player: document.getElementById('player-name').innerText,
                question: document.getElementById('question').innerText,
                left: shuffledQuestions.length,
            }));
            check('the first turn shows the first player and a question', first.player.toLowerCase() === 'sam' && first.question.length > 5, first);
            check('no question is thrown away before the game starts', first.left === deckSize - 1, `deck ${deckSize}, left ${first.left}`);

            await page.evaluate(() => { answered(); griddy(); shuffleQuestion(); });
            await sleep(200);
            const scores = await page.evaluate(() => ({
                table: document.getElementById('point-container').innerHTML,
                samPoints: points['Sam'],
                joGriddys: griddyPoints['<b>Jo</b>'],
            }));
            check('Answered gives a point and Griddy counts a griddy', scores.samPoints === 1 && scores.joGriddys === 1, scores);
            check('player names show as plain text in the scoreboard', scores.table.includes('&lt;b&gt;Jo&lt;/b&gt;'));

            // Answer every remaining question: none may repeat, and the game must end
            const run = await page.evaluate(() => {
                const seen = [document.getElementById('question').innerText];
                const over = () => document.getElementById('game-over').style.display === 'block';
                for (let guard = 0; !over() && guard < 2000; guard++) {
                    answered();
                    if (!over()) seen.push(document.getElementById('question').innerText);
                }
                return { shown: seen.length, unique: new Set(seen).size, ended: /Game Over/.test(document.getElementById('game-over').innerText) };
            });
            check('no question repeats during the whole deck', run.shown === run.unique, run);
            check('Game Over appears when the deck runs out', run.ended);
        },
    })),

    {
        name: 'Kings Dice: rolling, passing the turn, and popping the balloon',
        async run({ newPage, check, sleep }) {
            const page = await newPage('kings dice');
            await page.goto(`${SITE}/games/Kings%20Dice/kingsdiceindex.html`);
            for (const name of ['Ann', '<i>Ben</i>']) { await page.fill('#playerInput', name); await page.evaluate(() => addPlayer()); }
            await page.click('#startButton');
            const firstTurn = await page.locator('#current-player').innerText();

            await page.click('#rollButton');
            await sleep(300);
            await page.click('#inflateButton', { force: true }); // pressed while the dice are still rolling
            const midRoll = await page.evaluate(() => ({ pumps: inflationCount, player: currentPlayerIndex }));
            check('Inflate is ignored while the dice are rolling', midRoll.pumps === 0 && midRoll.player === 0, midRoll);

            await sleep(4200);
            const result = await page.evaluate(() => ({
                text: document.getElementById('action-result').innerText,
                highlighted: document.querySelectorAll('.rule-item.active').length,
            }));
            check('the roll shows a rule and highlights it on the board', result.text.length > 3 && result.highlighted === 1, result);
            const wordingMatches = await page.evaluate(() => [9, 10].every(n =>
                document.querySelector(`.rule-item[data-rule="${n}"] .rule-text`).innerText.trim() === gameRules[n].action));
            check('the result card uses the same wording as the rules board', wordingMatches);

            await page.click('#inflateButton');
            const secondTurn = await page.locator('#current-player').innerText();
            check('Inflate passes the turn to the next player', secondTurn !== firstTurn, `${firstTurn} -> ${secondTurn}`);

            for (let i = 0; i < 20 && !(await page.evaluate(() => isGameOver)); i++) await page.evaluate(() => inflateBalloon());
            await sleep(800);
            const boom = await page.evaluate(() => document.querySelector('.game-over-sub')?.innerHTML ?? null);
            check('the balloon pops within 18 pumps and shows BOOM', boom !== null);
            check("the loser's name shows as plain text", boom !== null && !boom.includes('<i>'), boom);
        },
    },

    {
        name: 'Custom Kings Dice: your own rules are used, shown as text, and saved',
        async run({ newPage, check, sleep }) {
            const page = await newPage('custom kings dice');
            const url = `${SITE}/games/Kings%20Dice/custom/custom-kingsdice.html`;
            await page.goto(url);
            await page.evaluate(() => localStorage.removeItem('kingsDiceCustomRules'));
            await page.reload();

            await page.evaluate(() => showTab('rules'));
            await page.fill('#rule5', 'Unsaved edit <u>five</u>'); // edited but never saved
            await page.fill('#rule6', '');                         // left blank
            await page.evaluate(() => showTab('players'));
            for (const name of ['Cat', 'Dan']) { await page.fill('#playerInput', name); await page.evaluate(() => addPlayer()); }
            await page.evaluate(() => startCustomGame());

            const rules = await page.evaluate(() => ({
                rule5: customGameRules[5].action,
                rule6: customGameRules[6].action,
                tile5: document.querySelector('.rule-item[data-rule="5"] .rule-text').innerHTML,
            }));
            check('an edited rule is used even without pressing Save', rules.rule5 === 'Unsaved edit <u>five</u>', rules);
            check('a blank rule falls back to the classic rule', rules.rule6 === 'Chicks drink', rules.rule6);
            check('custom rule text shows as plain text on the board', !rules.tile5.includes('<u>'), rules.tile5);

            // Force a roll of 5 so the edited rule comes up
            await page.evaluate(() => { const real = Math.random; Math.random = () => 4 / 14; rollDice(); Math.random = real; });
            await sleep(2600);
            const shown = await page.evaluate(() => document.querySelector('.result-action')?.innerHTML);
            check('the rolled custom rule shows as plain text', shown === 'Unsaved edit &lt;u&gt;five&lt;/u&gt;', shown);

            await page.goto(url);
            await page.evaluate(() => showTab('rules'));
            await page.fill('#rule1', 'Saved one');
            await page.evaluate(() => saveRules());
            await page.reload();
            check('saved rules are still there after a reload', (await page.inputValue('#rule1')) === 'Saved one');
            await page.evaluate(() => localStorage.removeItem('kingsDiceCustomRules'));
        },
    },

    {
        name: 'How to Play buttons: open and close on every start page',
        async run({ newPage, check, sleep }) {
            const page = await newPage('help');
            const startPages = [
                ['LOCKED IN host setup', '/games/buzzin/setup.html', 'Hosting LOCKED IN'],
                ['LOCKED IN join', '/games/buzzin/join.html', 'How to play LOCKED IN'],
                ['Truth or Griddy', '/games/truthOrgriddy/truthOrGriddyindex.html', 'How to play Truth or Griddy'],
                ['Kings Dice', '/games/Kings%20Dice/kingsdiceindex.html', 'How to play Kings Dice'],
                ['Custom Kings Dice', '/games/Kings%20Dice/custom/custom-kingsdice.html', 'How to play Custom Kings Dice'],
            ];
            for (const [label, path, title] of startPages) {
                await page.goto(SITE + path);
                await sleep(300);
                await page.click('.help-btn');
                const opened = await page.evaluate(() => ({ open: document.querySelector('.help-dialog').open, title: document.getElementById('help-title').textContent }));
                await page.click('.help-close');
                const closedByX = !(await page.evaluate(() => document.querySelector('.help-dialog').open));
                await page.click('.help-btn');
                await page.keyboard.press('Escape');
                const closedByEsc = !(await page.evaluate(() => document.querySelector('.help-dialog').open));
                check(`${label}: opens with the right title and closes with X or Esc`, opened.open && opened.title === title && closedByX && closedByEsc, { ...opened, closedByX, closedByEsc });
            }
        },
    },
];

export default tests;

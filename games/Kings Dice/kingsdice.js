const players = [];
let currentPlayerIndex = 0;
let isRolling = false;
let inflationCount = 0;
const MIN_POP = 10;
const MAX_POP = 18;
let popThreshold = Math.floor(Math.random() * (MAX_POP - MIN_POP + 1)) + MIN_POP;
let isGameOver = false;

const gameRules = {
    1:  { action: "Take a drink" },
    2:  { action: "Give someone two drinks" },
    3:  { action: "Take three drinks" },
    4:  { action: "Last to point to floor drinks" },
    5:  { action: "Guys drink" },
    6:  { action: "Chicks drink" },
    7:  { action: "Last to point up drinks" },
    8:  { action: "Choose drinking buddy" },
    9:  { action: "Pick a word, rhyme or drink" },
    10: { action: "Pick a category, name or drink" },
    11: { action: "Three fingers up" },
    12: { action: "Ask around, mess up and drink" },
    13: { action: "Make a rule" },
    14: { action: "Start the chain" }
};

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        if (document.activeElement === document.getElementById('playerInput')) {
            addPlayer();
        } else if (players.length >= 2) {
            startGame();
        }
    }
}

function addPlayer() {
    const playerInput = document.getElementById('playerInput');
    const playerName = playerInput.value.trim();
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        updatePlayersList();
        playerInput.value = '';
        playerInput.focus();
    }
}

function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        playersList.appendChild(li);
    });
}

function startGame() {
    if (players.length < 2) {
        alert('Please add at least 2 players to start the game.');
        return;
    }
    document.getElementById('setup-container').style.display = 'none';
    const gc = document.getElementById('game-container');
    gc.style.display = 'flex';
    initializeDice();
    updateCurrentPlayer();
    const balloon = document.querySelector('.balloon');
    balloon.style.display = 'block';
    balloon.style.transform = 'translateX(-50%) scale(1)';
}

// ── Dice face dot patterns (% positions [left, top]) ──
const dotPatterns = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [30, 70], [70, 30], [70, 70]],
    5: [[30, 30], [30, 70], [50, 50], [70, 30], [70, 70]],
    6: [[30, 22], [30, 50], [30, 78], [70, 22], [70, 50], [70, 78]]
};

function createDiceFace(value) {
    const face = document.createElement('div');
    face.className = 'dice-face';
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'dots-container';
    dotPatterns[value].forEach(([x, y]) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.left = x + '%';
        dot.style.top = y + '%';
        dotsContainer.appendChild(dot);
    });
    face.appendChild(dotsContainer);
    return face;
}

function initializeDice() {
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const values = [1, 2, 3, 4, 5, 6];
    [1, 2, 3].forEach(diceNum => {
        const dice = document.getElementById('dice' + diceNum);
        if (!dice) return;
        dice.innerHTML = '';
        faces.forEach((face, i) => {
            const f = createDiceFace(values[i]);
            f.classList.add(face);
            dice.appendChild(f);
        });
        dice.addEventListener('click', () => { if (!isRolling) rollDice(); });
        if (diceNum === 3) {
            dice.style.display = 'none';
            dice.style.opacity = '0';
        }
    });
}

function updateCurrentPlayer() {
    document.getElementById('current-player').textContent =
        `${players[currentPlayerIndex]}'s Turn`;
}

function moveToNextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
}

// Returns roll3 that makes roll1+roll2+roll3 === targetSum, or null if impossible
function getValidThirdDice(roll1, roll2, targetSum) {
    const roll3 = targetSum - roll1 - roll2;
    return (roll3 >= 1 && roll3 <= 6) ? roll3 : null;
}

// Set a die to display a specific face value
function showFace(diceEl, value) {
    // Preserve lucky-glow if present
    const hasGlow = diceEl.classList.contains('lucky-glow');
    diceEl.className = `dice show-${value}`;
    if (hasGlow) diceEl.classList.add('lucky-glow');
}

function finishRoll() {
    document.getElementById('rollButton').disabled = false;
    isRolling = false;
}

// ── Main roll function ──
function rollDice() {
    if (isRolling || isGameOver) return;
    isRolling = true;

    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    const dice3 = document.getElementById('dice3');
    const rollButton = document.getElementById('rollButton');

    rollButton.disabled = true;

    // Reset dice2 visibility from any previous single die roll
    dice2.style.visibility = 'visible';

    // Reset dice3 state & any active rule highlight
    dice3.style.display = 'none';
    dice3.style.opacity = '0';
    dice3.className = 'dice';
    document.querySelectorAll('.rule-item').forEach(el => el.classList.remove('active'));

    // ── Determine roll type ──
    // 12% single die  |  15% lucky (3 dice → 13 or 14)  |  73% normal 2 dice
    const rand = Math.random();
    const isSingleDie = rand < 0.12;
    const isLucky     = rand >= 0.85;

    if (isSingleDie) {
        // Only dice1 is visible; dice2 hidden so single die is visually centered
        dice2.style.visibility = 'hidden';
        const roll1 = Math.floor(Math.random() * 6) + 1;
        dice1.classList.add('rolling');
        setTimeout(() => {
            dice1.classList.remove('rolling');
            showFace(dice1, roll1);
            // dice2 remains hidden — restored at start of next rollDice()
            displayResult(roll1, true, false);
            finishRoll();
        }, 2000);

    } else if (isLucky) {
        // Restore dice2 if it was hidden
        dice2.style.visibility = 'visible';

        const targetSum = Math.random() < 0.5 ? 13 : 14;
        let roll1, roll2, roll3;
        do {
            roll1 = Math.floor(Math.random() * 6) + 1;
            roll2 = Math.floor(Math.random() * 6) + 1;
            roll3 = getValidThirdDice(roll1, roll2, targetSum);
        } while (roll3 === null);

        dice1.classList.add('rolling');
        dice2.classList.add('rolling');

        setTimeout(() => {
            dice1.classList.remove('rolling');
            dice2.classList.remove('rolling');
            showFace(dice1, roll1);
            showFace(dice2, roll2);

            // Lucky die dramatic entrance after a beat
            setTimeout(() => {
                dice3.style.display = 'block';
                requestAnimationFrame(() => {
                    dice3.style.opacity = '1';
                    dice3.classList.add('rolling', 'lucky-entrance');
                });
                setTimeout(() => {
                    dice3.classList.remove('rolling', 'lucky-entrance');
                    dice3.className = `dice show-${roll3} lucky-glow`;
                    displayResult(targetSum, false, true);
                    finishRoll();
                }, 1400);
            }, 450);

        }, 2000);

    } else {
        // Normal two-dice roll
        dice2.style.visibility = 'visible';
        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;

        dice1.classList.add('rolling');
        dice2.classList.add('rolling');

        setTimeout(() => {
            dice1.classList.remove('rolling');
            dice2.classList.remove('rolling');
            showFace(dice1, roll1);
            showFace(dice2, roll2);
            displayResult(roll1 + roll2, false, false);
            finishRoll();
        }, 2000);
    }
}

// ── Balloon mechanic ──
function inflateBalloon() {
    if (isGameOver) return;
    inflationCount++;
    const balloon = document.querySelector('.balloon');
    const newScale = (100 + inflationCount * 20) / 100;
    balloon.style.transform = `translateX(-50%) scale(${newScale})`;
    balloon.classList.add('inflate');
    setTimeout(() => balloon.classList.remove('inflate'), 400);

    if (inflationCount >= MIN_POP) {
        const popChance = ((inflationCount - MIN_POP + 1) / (MAX_POP - MIN_POP + 1)) * 100;
        if (Math.random() * 100 < popChance || inflationCount >= MAX_POP) {
            popBalloon(players[currentPlayerIndex]);
            return;
        }
    }
    moveToNextPlayer();
}

function popBalloon(losingPlayer) {
    const balloon = document.querySelector('.balloon');
    balloon.classList.add('pop');
    isGameOver = true;
    setTimeout(() => {
        balloon.style.display = 'none';
        showGameOver(losingPlayer);
    }, 500);
}

function showGameOver(losingPlayer) {
    const div = document.createElement('div');
    div.className = 'game-over';
    div.innerHTML = `
        <div class="game-over-content">
            <div class="game-over-title">💥 BOOM!</div>
            <p class="game-over-sub">${losingPlayer} popped the balloon!</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
    document.body.appendChild(div);
}

// ── Display result + highlight active rule ──
function displayResult(total, isSingleDie, isLucky) {
    const diceResult  = document.getElementById('dice-result');
    const actionResult = document.getElementById('action-result');
    const rule = gameRules[total];

    if (rule) {
        if (isLucky) {
            diceResult.innerHTML = '<span class="roll-badge lucky-badge">🍀 Lucky Roll</span>';
        } else {
            diceResult.innerHTML = '';
        }

        actionResult.innerHTML = `
            <div class="result-num">#${total}</div>
            <div class="result-action">${rule.action}</div>
        `;
        actionResult.classList.remove('pop-in');
        void actionResult.offsetWidth; // force reflow for re-animation
        actionResult.classList.add('pop-in');

        // Highlight active rule tile
        const tile = document.querySelector(`.rule-item[data-rule="${total}"]`);
        if (tile) {
            tile.classList.add('active');
            tile.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else {
        diceResult.textContent = `Rolled: ${total}`;
        actionResult.textContent = 'No rule for this roll.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('setup-container').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
});

const players = [];
let currentPlayerIndex = 0;
let isRolling = false;
let inflationCount = 0;
const MIN_POP = 10;
const MAX_POP = 18;
const popThreshold = Math.floor(Math.random() * (MAX_POP - MIN_POP + 1)) + MIN_POP;
let isGameOver = false;
let customGameRules = {};

// Default rules to use if no custom rules are saved
const defaultRules = {
    1:  { action: "Take a drink" },
    2:  { action: "Give someone two drinks" },
    3:  { action: "Take three drinks" },
    4:  { action: "Last to point to floor drinks" },
    5:  { action: "Guys drink" },
    6:  { action: "Chicks drink" },
    7:  { action: "Last to point up drinks" },
    8:  { action: "Choose drinking buddy" },
    9:  { action: "Pick word, rhyme or drink" },
    10: { action: "Pick category, name or drink" },
    11: { action: "Three fingers up" },
    12: { action: "Ask around, mess up and drink" },
    13: { action: "Make a rule" },
    14: { action: "Start the chain" }
};

function loadSavedRules() {
    const savedRules = localStorage.getItem('kingsDiceCustomRules');
    if (savedRules) {
        const parsedRules = JSON.parse(savedRules);
        // Populate input fields with saved rules
        for (let i = 1; i <= 14; i++) {
            const ruleInput = document.getElementById(`rule${i}`);
            if (ruleInput) {
                ruleInput.value = parsedRules[i]?.action || defaultRules[i].action;
            }
            // Ensure all rules are present in parsedRules
            if (!parsedRules[i]) {
                parsedRules[i] = { action: defaultRules[i].action };
            }
        }
        return parsedRules;
    } else {
        // Populate input fields with default rules
        for (let i = 1; i <= 14; i++) {
            const ruleInput = document.getElementById(`rule${i}`);
            if (ruleInput) {
                ruleInput.value = defaultRules[i].action;
            }
        }
        return defaultRules;
    }
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        if (document.activeElement === document.getElementById('playerInput')) {
            addPlayer();
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

function validateCustomRules() {
    for (let i = 1; i <= 14; i++) {
        const ruleInput = document.getElementById(`rule${i}`);
        if (!ruleInput.value.trim()) {
            alert(`Please enter a rule for number ${i}`);
            ruleInput.focus();
            return false;
        }
    }
    return true;
}

function saveRules() {
    if (!validateCustomRules()) {
        return;
    }
    
    collectCustomRules();
    localStorage.setItem('kingsDiceCustomRules', JSON.stringify(customGameRules));
    alert('Rules saved successfully!');

    // Switch back to the Players tab
    showTab('players');
}

function collectCustomRules() {
    customGameRules = {};
    for (let i = 1; i <= 14; i++) {
        const ruleText = document.getElementById(`rule${i}`).value.trim();
        customGameRules[i] = {
            action: ruleText
        };
    }
}

function startCustomGame() {
    if (players.length < 2) {
        alert('Please add at least 2 players to start the game.');
        return;
    }

    // Load either saved rules or defaults
    customGameRules = loadSavedRules();
    
    document.getElementById('setup-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    initializeDice();
    updateCurrentPlayer();
    updateCustomRulesGrid();
    
    // Initialize balloon
    const balloon = document.querySelector('.balloon');
    balloon.style.display = 'block';
    balloon.style.transform = 'translateX(-50%) scale(1)';
}

function createDiceFace(value) {
    const face = document.createElement('div');
    face.className = 'dice-face';
    
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'dots-container';
    
    const dotPatterns = {
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [25, 75], [75, 25], [75, 75]],
        5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
        6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
    };

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
        if (dice) {
            dice.innerHTML = '';
            
            faces.forEach((face, index) => {
                const diceFace = createDiceFace(values[index]);
                diceFace.classList.add(face);
                dice.appendChild(diceFace);
            });
            
            dice.addEventListener('click', () => {
                if (!isRolling) rollDice();
            });

            // Hide third dice initially
            if (diceNum === 3) {
                dice.style.display = 'none';
                dice.style.opacity = '0';
            }
        }
    });
}

function updateCurrentPlayer() {
    const currentPlayer = document.getElementById('current-player');
    currentPlayer.textContent = `${players[currentPlayerIndex]}'s Turn`;
}

function moveToNextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
}

function getValidThirdDiceValue(roll1, roll2, targetSum) {
    const roll3 = targetSum - roll1 - roll2;
    return (roll3 >= 1 && roll3 <= 6) ? roll3 : null;
}

function showFace(diceEl, value) {
    const hasGlow = diceEl.classList.contains('lucky-glow');
    diceEl.className = `dice show-${value}`;
    if (hasGlow) diceEl.classList.add('lucky-glow');
}

function finishRoll() {
    document.getElementById('rollButton').disabled = false;
    isRolling = false;
}




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

    // Reset dice3 & active highlights
    dice3.style.display = 'none';
    dice3.style.opacity = '0';
    dice3.className = 'dice';
    document.querySelectorAll('.rule-item').forEach(el => el.classList.remove('active'));

    // 12% single die | 15% lucky (3 dice) | 73% normal 2 dice
    const rand = Math.random();
    const isSingleDie = rand < 0.12;
    const isLucky     = rand >= 0.85;

    if (isSingleDie) {
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
        dice2.style.visibility = 'visible';
        const targetSum = Math.random() < 0.5 ? 13 : 14;
        let roll1, roll2, roll3;
        do {
            roll1 = Math.floor(Math.random() * 6) + 1;
            roll2 = Math.floor(Math.random() * 6) + 1;
            roll3 = getValidThirdDiceValue(roll1, roll2, targetSum);
        } while (roll3 === null);

        dice1.classList.add('rolling');
        dice2.classList.add('rolling');

        setTimeout(() => {
            dice1.classList.remove('rolling');
            dice2.classList.remove('rolling');
            showFace(dice1, roll1);
            showFace(dice2, roll2);

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


function updateCustomRulesGrid() {
    const rulesGrid = document.getElementById('customRulesGrid');
    rulesGrid.innerHTML = '';

    for (let i = 1; i <= 14; i++) {
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'rule-item';
        ruleDiv.setAttribute('data-rule', i);
        ruleDiv.innerHTML = `<span class="rule-num">${i}</span><span class="rule-text">${customGameRules[i].action}</span>`;
        rulesGrid.appendChild(ruleDiv);
    }
}

function inflateBalloon() {
    if (isGameOver) return;

    inflationCount++;
    const balloon = document.querySelector('.balloon');
    
    const baseSize = 100;
    const inflationSize = inflationCount * 20;
    const newSize = baseSize + inflationSize;
    
    balloon.style.transform = `translateX(-50%) scale(${newSize/100})`;
    balloon.classList.add('inflate');
    setTimeout(() => balloon.classList.remove('inflate'), 300);

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
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <div class="game-over-content">
            <div class="game-over-title">💥 BOOM!</div>
            <p class="game-over-sub">${losingPlayer} popped the balloon!</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
    document.body.appendChild(gameOverDiv);
}

function displayResult(total, isSingleDie, isLucky) {
    const diceResult   = document.getElementById('dice-result');
    const actionResult = document.getElementById('action-result');
    const rule = customGameRules[total];

    if (rule) {
        if (isLucky) {
            diceResult.innerHTML = '<span class="roll-badge lucky-badge">Lucky Roll</span>';
        } else {
            diceResult.innerHTML = '';
        }
        actionResult.innerHTML = `
            <div class="result-num">#${total}</div>
            <div class="result-action">${rule.action}</div>
        `;
        actionResult.classList.remove('pop-in');
        void actionResult.offsetWidth;
        actionResult.classList.add('pop-in');

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

// Initialize game and load saved rules
document.addEventListener('DOMContentLoaded', () => {
    const setupContainer = document.getElementById('setup-container');
    const gameContainer = document.getElementById('game-container');
    
    setupContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    
    // Load saved rules or defaults
    loadSavedRules();
});
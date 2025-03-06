const players = [];
let currentPlayerIndex = 0;
let isRolling = false;
let inflationCount = 0;
const MIN_POP = 10;
const MAX_POP = 18;
const popThreshold = Math.floor(Math.random() * (MAX_POP - MIN_POP + 1)) + MIN_POP;
let isGameOver = false;

const gameRules = {
    1: { action: "Take a drink" },
    2: { action: "Give someone two drinks" },
    3: { action: "Take three drinks" },
    4: { action: "Last to point to floor drinks" },
    5: { action: "Guys drink" },
    6: { action: "Chicks drink" },
    7: { action: "Last to point up drinks" },
    8: { action: "Choose drinking buddy" },
    9: { action: "Pick word, rhyme or drink" },
    10: { action: "Pick category, name or drink" },
    11: { action: "Three fingers up" },
    12: { action: "Ask around, mess up drink" },
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
    document.getElementById('game-container').style.display = 'block';
    initializeDice();
    updateCurrentPlayer();
    
    // Initialize balloon
    const balloon = document.querySelector('.balloon');
    balloon.style.display = 'block';
    balloon.style.transform = 'scale(1)';
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
    const roll3 = targetSum - (roll1 + roll2);
    
    // Ensure the third dice is within valid bounds (1-6)
    if (roll3 >= 1 && roll3 <= 6) {
        return roll3;
    }
    
    return null; // No valid third dice if the sum is already sufficient
}




function showThirdDice(roll1, roll2, targetSum) {
    const dice3 = document.getElementById('dice3');
    const roll3 = getValidThirdDiceValue(roll1, roll2, targetSum);

    if (roll3 !== null) {
        dice3.style.display = 'block';
        dice3.style.opacity = '1';
        dice3.className = 'dice show-' + roll3;
        dice3.classList.add('magical-entrance-enhanced');
        return roll3;
    } else {
        dice3.style.display = 'none';
        dice3.style.opacity = '0';
        dice3.className = 'dice';
    }

    return null; // If no third dice is needed, return null
}





function rollDice() {
    if (isRolling || isGameOver) return;
    isRolling = true;

    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    const dice3 = document.getElementById('dice3');
    const rollButton = document.getElementById('rollButton');
    
    rollButton.disabled = true;
    
    // Hide third dice initially
    dice3.style.display = 'none';
    dice3.style.opacity = '0';
    dice3.className = 'dice';

    dice1.classList.add('rolling');
    dice2.classList.add('rolling');

    let roll1, roll2, roll3 = null;
    let isRareRoll = Math.random() < (2/13); // 2/13 chance for a rare roll (13 or 14)

    if (isRareRoll) {
        let targetSum = Math.random() < 0.5 ? 13 : 14; // Randomly pick 13 or 14
        
        // Ensure we get two dice values that allow for a valid third dice
        do {
            roll1 = Math.floor(Math.random() * 6) + 1;
            roll2 = Math.floor(Math.random() * 6) + 1;
            roll3 = getValidThirdDiceValue(roll1, roll2, targetSum);
        } while (roll3 === null); // Keep rolling until a valid third dice is found

    } else {
        // Normal roll with only two dice
        roll1 = Math.floor(Math.random() * 6) + 1;
        roll2 = Math.floor(Math.random() * 6) + 1;
    }

    setTimeout(() => {
        dice1.classList.remove('rolling');
        dice2.classList.remove('rolling');

        dice1.className = `dice show-${roll1}`;
        dice2.className = `dice show-${roll2}`;

        if (isRareRoll) {
            setTimeout(() => {
                dice3.style.display = 'block';
                dice3.style.opacity = '1';
                dice3.classList.add('rolling');
                
                setTimeout(() => {
                    dice3.classList.remove('rolling');
                    dice3.className = `dice show-${roll3}`;
                    displayResult(roll1 + roll2 + roll3, true);
                }, 1000);
            }, 500);
        } else {
            displayResult(roll1 + roll2, false);
        }

        rollButton.disabled = false;
        isRolling = false;
    }, 2000);
}


function inflateBalloon() {
    if (isGameOver) return;

    inflationCount++;
    const balloon = document.querySelector('.balloon');
    
    const baseSize = 100;
    const inflationSize = inflationCount * 20;
    const newSize = baseSize + inflationSize;
    
    balloon.style.transform = `scale(${newSize/100})`;
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
            <h2>BOOM! Game Over!</h2>
            <p>${losingPlayer} popped the balloon!</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
    document.body.appendChild(gameOverDiv);
}

function displayResult(total, isRareRoll) {
    const diceResult = document.getElementById('dice-result');
    const actionResult = document.getElementById('action-result');
    
    const rule = gameRules[total];
    if (rule) {
        diceResult.textContent = isRareRoll ? 
            `Rare Roll! You've rolled: ${total}` : 
            `Rolled: ${total}`;
        actionResult.innerHTML = `
            <div class="rule-name">#${total}</div>
            <div class="rule-action">${rule.action}</div>
        `;
    } else {
        diceResult.textContent = `Rolled: ${total}`;
        actionResult.textContent = 'Roll again!';
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const setupContainer = document.getElementById('setup-container');
    const gameContainer = document.getElementById('game-container');
    
    setupContainer.style.display = 'block';
    gameContainer.style.display = 'none';
});
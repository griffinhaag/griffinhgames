// buzzin.js

// --- Game State & Variables ---
let socket;
let roomCode = null;
let playerName = null;
let isHost = false;
let gameState = null;
let roomState = null; // Store room state for lobby display

// New state for "everyone answers" mechanic
let timerRemaining = 0;
let timerDuration = 30;
let hasAnswered = false;
let hasBuzzed = false;

// Available categories (should match backend)
const CATEGORIES = [
  "General Knowledge",
  "Science",
  "Movies & TV",
  "Music",
  "Sports",
  "History",
  "Geography",
  "Pop Culture",
  "Games",
  "Random"
];

// --- DOM Elements ---
const screens = {
    connecting: document.getElementById('screen-connecting'),
    lobby: document.getElementById('screen-lobby'),
    game: document.getElementById('screen-game'),
    end: document.getElementById('screen-end')
};

const lobbyEls = {
    code: document.getElementById('lobby-room-code'),
    list: document.getElementById('lobby-player-list'),
    hostControls: document.getElementById('lobby-host-controls'),
    playerMsg: document.getElementById('lobby-player-msg'),
    qCountSlider: document.getElementById('q-count-slider'),
    qCountDisplay: document.getElementById('q-count-display'),
    timerSlider: document.getElementById('timer-duration-slider'),
    timerDisplay: document.getElementById('timer-duration-display'),
    btnStart: document.getElementById('btn-start-game')
};

const answerEls = {
    section: document.getElementById('player-answer-section'),
    input: document.getElementById('player-answer-input'),
    btnSubmit: document.getElementById('btn-submit-answer')
};

const hostEls = {
    view: document.getElementById('view-host'),
    qIndex: document.getElementById('host-q-index'),
    qTotal: document.getElementById('host-q-total'),
    category: document.getElementById('host-category'),
    question: document.getElementById('host-question-text'),
    answer: document.getElementById('host-answer-text'),
    buzzArea: document.getElementById('host-buzz-area'),
    phases: {
        waiting: document.getElementById('host-phase-waiting'),
        question: document.getElementById('host-phase-question'),
        buzzed: document.getElementById('host-phase-buzzed'),
        answering: document.getElementById('host-phase-answering'),
        result: document.getElementById('host-phase-result')
    },
    buzzedName: document.getElementById('buzzed-player-name'),
    answeringName: document.getElementById('answering-player-name'),
    btnShowQuestion: document.getElementById('btn-show-question'),
    btnCorrect: document.getElementById('btn-correct'),
    btnWrong: document.getElementById('btn-wrong'),
    btnNext: document.getElementById('btn-next-question'),
    leaderboard: document.getElementById('host-leaderboard')
};

const playerEls = {
    view: document.getElementById('view-player'),
    score: document.getElementById('player-score'),
    rank: document.getElementById('player-rank'),
    category: document.getElementById('player-category'),
    question: document.getElementById('player-question-text'),
    btnBuzz: document.getElementById('btn-buzz'),
    buzzStatus: document.getElementById('buzzer-status'),
    feedback: document.getElementById('player-feedback'),
    feedbackText: document.getElementById('feedback-text')
};

// --- Initialization ---
function init() {
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    roomCode = urlParams.get('room');
    playerName = urlParams.get('name');
    isHost = urlParams.get('host') === 'true';

    if (!roomCode || !playerName) {
        alert("Invalid game session. Redirecting to lobby...");
        window.location.href = 'games/multiplayer/lobby.html';
        return;
    }

    // Connect to socket with reconnection
    const backendUrl = window.BACKEND_URL || 'http://localhost:3000';
    socket = io(backendUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    });

    setupSocketListeners();
    setupUIListeners();
}

// --- Socket Listeners ---
function setupSocketListeners() {
    let connectionTimeout;
    
    socket.on('connect', () => {
        console.log('Connected to BuzzIn! server');
        clearTimeout(connectionTimeout);
        
        // Check if we have redirect info from lobby
        const redirectInfo = sessionStorage.getItem('buzzin_redirect');
        if (redirectInfo) {
            try {
                const info = JSON.parse(redirectInfo);
                roomCode = info.room || roomCode;
                playerName = info.name || playerName;
                isHost = info.host === true || isHost;
                sessionStorage.removeItem('buzzin_redirect');
            } catch (e) {
                console.error('Failed to parse redirect info:', e);
            }
        }
        
        // Join room immediately after connection
        if (roomCode && playerName) {
            console.log('Joining room:', roomCode, 'as', playerName, 'host:', isHost);
            socket.emit('player:joinRoom', { roomCode, name: playerName });
        } else {
            console.error('Missing roomCode or playerName:', { roomCode, playerName });
            // Redirect back to lobby if missing info
            setTimeout(() => {
                window.location.href = '../multiplayer/lobby.html';
            }, 2000);
        }
    });
    
    // Set timeout for connection
    connectionTimeout = setTimeout(() => {
        if (!socket.connected) {
            console.error('Connection timeout');
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; z-index: 1000; text-align: center;';
            errorMsg.innerHTML = '<h2>Connection Failed</h2><p>Unable to connect to server. Please check your connection and try again.</p>';
            document.body.appendChild(errorMsg);
        }
    }, 10000);
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        // Don't immediately show connecting - might be reconnecting
    });
    
    socket.on('reconnect', () => {
        console.log('Reconnected to server');
        if (roomCode && playerName) {
            socket.emit('player:joinRoom', { roomCode, name: playerName });
        }
    });
    
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        // Show error but don't block UI
    });
    
    socket.on('room:error', (message) => {
        console.error('Room error:', message);
        
        // Show error on screen instead of alert
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,0,0,0.9); color: white; padding: 15px 30px; border-radius: 10px; z-index: 1000;';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        // If room not found, redirect back to lobby after delay
        if (message.includes('not found') || message.includes('Invalid') || message.includes('Unable')) {
            setTimeout(() => {
                window.location.href = '../multiplayer/lobby.html';
            }, 3000);
        } else {
            setTimeout(() => errorDiv.remove(), 5000);
        }
    });

    // Generic room state updates (lobby phase)
    socket.on('room:state', (rs) => {
        console.log('Room state received:', rs);
        roomState = rs; // Store for later use
        
        // If room is in-progress, we need game state, not room state
        // But still update lobby info in case game state hasn't arrived yet
        if (rs.phase === 'in-progress') {
            console.log('Room is in-progress, waiting for game state...');
            // Show a "Game in progress" message while waiting
            showScreen('lobby');
            lobbyEls.code.textContent = rs.code || roomCode || '----';
            lobbyEls.list.innerHTML = '<div class="player-tag">Game in progress, loading...</div>';
            // Game state should arrive shortly via game:state event
            return;
        }
        
        // Otherwise, show lobby
        updateLobbyUI(rs);
        
        // Sync host status
        const me = rs.players.find(p => p.socketId === socket.id);
        if (me) {
            isHost = me.isHost;
            console.log('I am host:', isHost);
        }
        
        updateHostControlsVisibility();
    });

    // Game started event - this happens when host clicks Start Game
    socket.on('game:started', (data) => {
        console.log('Game started!', data);
        // Don't do anything here - wait for game:state with countdown phase
        // The countdown will be handled by renderGameState()
    });

    // Game specific state updates
    socket.on('game:state', (state) => {
        console.log('Game state received:', state);
        gameState = state;
        renderGameState();
        
        // Update countdown display if in countdown phase
        if (state.phase === 'countdown') {
            renderCountdown();
        }
    });

    // Game events (sound effects, toasts, specific triggers)
    socket.on('game:event', (event) => {
        handleGameEvent(event);
        
        // Handle error events
        if (event.type === 'error') {
            alert(event.message || 'An error occurred');
        }
        
        // Handle game ended
        if (event.type === 'game_ended') {
            if (event.reason === 'ended_by_host') {
                alert('Host ended the game. Returning to main menu...');
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 2000);
            }
        }
    });
}

// --- Admin Menu Elements ---
const adminMenuEls = {
    menu: document.getElementById('admin-menu'),
    toggle: document.getElementById('admin-menu-toggle'),
    dropdown: document.getElementById('admin-menu-dropdown'),
    skipQuestion: document.getElementById('admin-skip-question'),
    shuffleQuestions: document.getElementById('admin-shuffle-questions'),
    newGame: document.getElementById('admin-new-game'),
    endGame: document.getElementById('admin-end-game')
};

// --- UI Listeners ---
function setupUIListeners() {
    // Initialize category checkboxes
    setupCategoryCheckboxes();

    // Question count slider
    if (lobbyEls.qCountSlider) {
        lobbyEls.qCountSlider.addEventListener('input', (e) => {
            if (lobbyEls.qCountDisplay) {
                lobbyEls.qCountDisplay.textContent = e.target.value;
            }
        });
    }

    // Timer duration slider
    if (lobbyEls.timerSlider) {
        lobbyEls.timerSlider.addEventListener('input', (e) => {
            if (lobbyEls.timerDisplay) {
                lobbyEls.timerDisplay.textContent = e.target.value;
            }
        });
    }

    // Start game button
    lobbyEls.btnStart.addEventListener('click', () => {
        const selectedCategories = Array.from(document.querySelectorAll('#category-checkboxes input:checked'))
            .map(cb => cb.value);

        if (selectedCategories.length === 0) {
            alert('Please select at least one category!');
            return;
        }

        const questionCount = parseInt(lobbyEls.qCountSlider?.value || 10);
        const timerDurationValue = parseInt(lobbyEls.timerSlider?.value || 30);

        // Emit host:startGame with categories, question count, and timer duration
        socket.emit('host:startGame', {
            roomCode: roomCode,
            gameType: 'buzzin',
            categories: selectedCategories,
            questionCount: questionCount,
            timerDuration: timerDurationValue
        });
    });

    // Host Actions
    if (hostEls.btnShowQuestion) {
        hostEls.btnShowQuestion.addEventListener('click', () => {
            socket.emit('host:showQuestion', { roomCode: roomCode });
        });
    }

    // Next question button
    if (hostEls.btnNext) {
        hostEls.btnNext.addEventListener('click', () => {
            socket.emit('host:nextQuestion', { roomCode: roomCode });
        });
    }

    // Skip round button (dynamically added, so we use event delegation)
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btn-skip-round') {
            socket.emit('host:skipRound', { roomCode: roomCode });
        }
    });

    // Player Actions
    playerEls.btnBuzz.addEventListener('click', () => {
        socket.emit('player:buzz', { roomCode: roomCode });
    });

    // Answer submission
    if (answerEls.btnSubmit) {
        answerEls.btnSubmit.addEventListener('click', () => {
            const answer = answerEls.input?.value?.trim() || '';
            if (answer.length > 0) {
                socket.emit('player:submitAnswer', { roomCode: roomCode, answer: answer });
                answerEls.section.classList.add('hidden');
                answerEls.input.value = '';
            }
        });
    }

    // Allow Enter key to submit answer
    if (answerEls.input) {
        answerEls.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                answerEls.btnSubmit.click();
            }
        });
    }

    // Return to main lobby
    const btnReturn = document.getElementById('btn-return-lobby');
    if (btnReturn) {
        btnReturn.addEventListener('click', () => {
            window.location.href = '../../index.html';
        });
    }

    // --- Admin Menu Setup ---
    setupAdminMenu();
}

// --- Admin Menu Functions ---
function setupAdminMenu() {
    // Toggle menu dropdown
    if (adminMenuEls.toggle) {
        adminMenuEls.toggle.addEventListener('click', () => {
            adminMenuEls.toggle.classList.toggle('active');
            adminMenuEls.dropdown.classList.toggle('hidden');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (adminMenuEls.menu && !adminMenuEls.menu.contains(e.target)) {
            adminMenuEls.toggle?.classList.remove('active');
            adminMenuEls.dropdown?.classList.add('hidden');
        }
    });

    // Skip Question
    if (adminMenuEls.skipQuestion) {
        adminMenuEls.skipQuestion.addEventListener('click', () => {
            socket.emit('host:skipRound', { roomCode: roomCode });
            closeAdminMenu();
        });
    }

    // Shuffle Questions
    if (adminMenuEls.shuffleQuestions) {
        adminMenuEls.shuffleQuestions.addEventListener('click', () => {
            if (confirm('Shuffle remaining questions? This will randomize the order of upcoming questions.')) {
                socket.emit('host:shuffleQuestions', { roomCode: roomCode });
                closeAdminMenu();
            }
        });
    }

    // Start New Game
    if (adminMenuEls.newGame) {
        adminMenuEls.newGame.addEventListener('click', () => {
            if (confirm('Start a new game? All scores will be reset and questions reshuffled.')) {
                socket.emit('host:restartGame', { roomCode: roomCode });
                closeAdminMenu();
            }
        });
    }

    // End Game
    if (adminMenuEls.endGame) {
        adminMenuEls.endGame.addEventListener('click', () => {
            if (confirm('End the game? This will return everyone to the main menu.')) {
                socket.emit('host:endGame', { roomCode: roomCode });
                closeAdminMenu();
            }
        });
    }
}

function closeAdminMenu() {
    adminMenuEls.toggle?.classList.remove('active');
    adminMenuEls.dropdown?.classList.add('hidden');
}

function updateAdminMenuVisibility() {
    if (adminMenuEls.menu) {
        // Show admin menu for host during game phases (including end screen)
        if (isHost && gameState && (
            gameState.phase === 'waiting' ||
            gameState.phase === 'question' ||
            gameState.phase === 'result' ||
            gameState.phase === 'end'
        )) {
            adminMenuEls.menu.classList.remove('hidden');

            // Update button states based on phase
            if (adminMenuEls.skipQuestion) {
                const canSkip = gameState.phase === 'question' || gameState.phase === 'result';
                adminMenuEls.skipQuestion.disabled = !canSkip;
                adminMenuEls.skipQuestion.style.opacity = canSkip ? '1' : '0.4';
            }
            if (adminMenuEls.shuffleQuestions) {
                const canShuffle = gameState.phase !== 'end' && gameState.currentQuestionIndex < gameState.totalQuestions - 1;
                adminMenuEls.shuffleQuestions.disabled = !canShuffle;
                adminMenuEls.shuffleQuestions.style.opacity = canShuffle ? '1' : '0.4';
            }
        } else {
            adminMenuEls.menu.classList.add('hidden');
        }
    }
}

// --- Render Logic ---
function showScreen(screenName) {
    Object.values(screens).forEach(el => el.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function setupCategoryCheckboxes() {
    const container = document.getElementById('category-checkboxes');
    container.innerHTML = CATEGORIES.map(cat => `
        <label class="category-checkbox">
            <input type="checkbox" value="${cat}" checked>
            <span>${cat}</span>
        </label>
    `).join('');
}

function updateLobbyUI(rs) {
    if (!rs) {
        console.warn('updateLobbyUI called with no room state');
        return;
    }
    
    console.log('Updating lobby UI with room state:', rs);
    
    // Switch to lobby screen when we get room state
    showScreen('lobby');
    
    // Update room code
    if (rs.code) {
        lobbyEls.code.textContent = rs.code;
    } else {
        lobbyEls.code.textContent = roomCode || '----';
    }
    
    // Update player list with animations - ensure no null names
    if (rs.players && rs.players.length > 0) {
        lobbyEls.list.innerHTML = rs.players
            .map(p => {
                const name = p.name || `Player-${p.socketId?.slice(0, 4) || '?'}`;
                return `<div class="player-tag">${name} ${p.isHost ? '👑' : ''}</div>`;
            })
            .join('');
    } else {
        lobbyEls.list.innerHTML = '<div class="player-tag" style="opacity: 0.5;">No players yet...</div>';
    }
}

function updateHostControlsVisibility() {
    if (isHost) {
        lobbyEls.hostControls.classList.remove('hidden');
        lobbyEls.playerMsg.classList.add('hidden');
    } else {
        lobbyEls.hostControls.classList.add('hidden');
        lobbyEls.playerMsg.classList.remove('hidden');
    }
}

function renderGameState() {
    if (!gameState) return;

    // Update admin menu visibility
    updateAdminMenuVisibility();

    // Switch screens based on phase
    if (gameState.phase === 'lobby') {
        showScreen('lobby');
    } else if (gameState.phase === 'countdown') {
        showScreen('game');
        renderCountdown();
    } else if (gameState.phase === 'end') {
        showScreen('end');
        renderEndScreen();
    } else {
        showScreen('game');
        // Host can play too - show player view for host as well
        if (isHost) {
            // Host sees both views - host controls + player buzzer
            screens.game.classList.add('host-playing');
            hostEls.view.classList.remove('hidden');
            playerEls.view.classList.remove('hidden');
            renderHostView();
            renderPlayerView();
        } else {
            screens.game.classList.remove('host-playing');
            hostEls.view.classList.add('hidden');
            playerEls.view.classList.remove('hidden');
            renderPlayerView();
        }
    }
}

function renderCountdown() {
    // Show countdown on both host and player views
    let countdownDisplay = document.getElementById('countdown-display');
    if (!countdownDisplay) {
        // Create countdown element if it doesn't exist
        countdownDisplay = document.createElement('div');
        countdownDisplay.id = 'countdown-display';
        countdownDisplay.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: clamp(4rem, 15vw, 8rem); font-weight: 900; color: var(--primary); z-index: 1000; text-shadow: 0 0 30px rgba(255,0,85,0.8); pointer-events: none; user-select: none;';
        document.body.appendChild(countdownDisplay);
    }
    
    const seconds = gameState.countdownSeconds || 0;
    if (seconds > 0) {
        countdownDisplay.textContent = seconds;
        countdownDisplay.style.display = 'block';
        // Add pulse animation
        countdownDisplay.style.animation = 'pulse 1s infinite';
    } else {
        countdownDisplay.style.display = 'none';
        countdownDisplay.style.animation = 'none';
    }
}

function renderHostView() {
    const { currentQuestion, currentQuestionIndex, totalQuestions, phase, playerBuzzStatus, answeredCount, totalPlayers } = gameState;

    // Update timer state
    timerRemaining = gameState.timerRemaining || 0;
    timerDuration = gameState.timerDuration || 30;

    // Header
    hostEls.qIndex.textContent = (currentQuestionIndex + 1) || 0;
    hostEls.qTotal.textContent = totalQuestions || 0;
    hostEls.category.textContent = currentQuestion ? currentQuestion.category : '-';

    // Question Card - only show if question is revealed
    if (phase === 'waiting') {
        hostEls.question.textContent = 'Ready to show question?';
        hostEls.answer.textContent = '---';
    } else if (currentQuestion) {
        hostEls.question.textContent = currentQuestion.question || '...';
        hostEls.answer.textContent = currentQuestion.answer || '...';
    } else {
        hostEls.question.textContent = '...';
        hostEls.answer.textContent = '...';
    }

    // Phase Controls - hide all first
    Object.values(hostEls.phases).forEach(el => {
        if (el) el.classList.add('hidden');
    });

    if (phase === 'waiting') {
        if (hostEls.phases.waiting) hostEls.phases.waiting.classList.remove('hidden');
        hostEls.buzzArea.innerHTML = '<div class="status-text">Click "Show Question" to reveal</div>';
    } else if (phase === 'question') {
        if (hostEls.phases.question) hostEls.phases.question.classList.remove('hidden');

        // Calculate timer progress
        const timerPct = timerDuration > 0 ? (timerRemaining / timerDuration) * 100 : 0;
        let timerColor = 'var(--success)';
        if (timerPct <= 25) timerColor = 'var(--danger)';
        else if (timerPct <= 50) timerColor = 'var(--accent)';

        // Build buzzed players list
        const buzzedPlayers = (playerBuzzStatus || []).filter(p => p.hasBuzzed);
        const buzzedList = buzzedPlayers.map(p => {
            const statusClass = p.hasAnswered ? 'answered' : 'waiting';
            return `<span class="buzzed-tag ${statusClass}">${p.name}</span>`;
        }).join('');

        hostEls.buzzArea.innerHTML = `
            <div class="timer-display-host">
                <div class="timer-number" style="color: ${timerColor}">${timerRemaining}s</div>
                <div class="timer-bar-container">
                    <div class="timer-bar" style="width: ${timerPct}%; background: ${timerColor}"></div>
                </div>
            </div>
            <div class="answered-status">${answeredCount || 0}/${totalPlayers || 0} answered</div>
            <div class="buzzed-players-list">${buzzedList || '<span style="opacity:0.5">No buzzes yet...</span>'}</div>
        `;
    } else if (phase === 'result') {
        if (hostEls.phases.result) hostEls.phases.result.classList.remove('hidden');
        hostEls.buzzArea.innerHTML = '<div class="status-text" style="color: var(--success);">Round Complete - See Results</div>';
    }

    // Leaderboard (Mini) - ensure no null names
    const sortedScores = [...(gameState.scores || [])].sort((a, b) => b.score - a.score);
    hostEls.leaderboard.innerHTML = sortedScores.slice(0, 5)
        .map((p, i) => {
            const name = p.name || `Player-${p.socketId?.slice(0, 4) || '?'}`;
            return `<div>${i+1}. ${name}: ${p.score}</div>`;
        })
        .join('');
}

function renderPlayerView() {
    const { currentQuestion, phase, playerBuzzStatus, scores, answeredCount, totalPlayers } = gameState;
    const myScoreEntry = (scores || []).find(s => s.socketId === socket.id) || { score: 0 };

    // Update timer state
    timerRemaining = gameState.timerRemaining || 0;
    timerDuration = gameState.timerDuration || 30;

    // Get my buzz/answer status
    const myStatus = (playerBuzzStatus || []).find(p => p.socketId === socket.id);
    hasBuzzed = myStatus?.hasBuzzed || false;
    hasAnswered = myStatus?.hasAnswered || false;

    // Score & Rank
    playerEls.score.textContent = myScoreEntry.score || 0;
    const sorted = [...(scores || [])].sort((a, b) => b.score - a.score);
    const myRank = sorted.findIndex(s => s.socketId === socket.id) + 1;
    playerEls.rank.textContent = myRank > 0 ? `#${myRank}` : '-';

    // Question info - only show if question is revealed
    if (phase === 'waiting') {
        playerEls.category.textContent = 'Waiting...';
        playerEls.question.textContent = 'Waiting for host to show question...';
    } else if (currentQuestion) {
        playerEls.category.textContent = currentQuestion.category || '';
        playerEls.question.textContent = currentQuestion.question || 'Wait for it...';
    } else {
        playerEls.category.textContent = '';
        playerEls.question.textContent = 'Wait for it...';
    }

    // Show timer during question phase
    let timerHTML = '';
    if (phase === 'question') {
        const timerPct = timerDuration > 0 ? (timerRemaining / timerDuration) * 100 : 0;
        let timerColor = 'var(--success)';
        if (timerPct <= 25) timerColor = 'var(--danger)';
        else if (timerPct <= 50) timerColor = 'var(--accent)';

        timerHTML = `
            <div class="player-timer">
                <div class="timer-bar-container">
                    <div class="timer-bar" style="width: ${timerPct}%; background: ${timerColor}"></div>
                </div>
                <span class="timer-text" style="color: ${timerColor}">${timerRemaining}s</span>
            </div>
        `;
    }

    // Update timer display if element exists
    let timerContainer = document.getElementById('player-timer-container');
    if (!timerContainer && phase === 'question') {
        timerContainer = document.createElement('div');
        timerContainer.id = 'player-timer-container';
        playerEls.view.insertBefore(timerContainer, playerEls.view.firstChild);
    }
    if (timerContainer) {
        timerContainer.innerHTML = timerHTML;
    }

    // Buzzer State & Answer Section - NEW FLOW
    if (phase === 'waiting') {
        // Waiting for question
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.buzzStatus.textContent = "WAITING FOR QUESTION";
        playerEls.buzzStatus.style.color = "#aaa";
        playerEls.btnBuzz.disabled = true;
        if (answerEls.section) answerEls.section.classList.add('hidden');
    } else if (phase === 'question') {
        if (hasAnswered) {
            // Already submitted answer
            playerEls.buzzStatus.classList.remove('hidden');
            playerEls.buzzStatus.textContent = "ANSWER SUBMITTED!";
            playerEls.buzzStatus.style.color = "var(--success)";
            playerEls.btnBuzz.disabled = true;
            playerEls.btnBuzz.style.display = 'none';
            if (answerEls.section) answerEls.section.classList.add('hidden');
        } else if (hasBuzzed) {
            // Buzzed but haven't answered - show answer input
            playerEls.buzzStatus.classList.remove('hidden');
            playerEls.buzzStatus.textContent = "TYPE YOUR ANSWER!";
            playerEls.buzzStatus.style.color = "var(--accent)";
            playerEls.btnBuzz.disabled = true;
            playerEls.btnBuzz.style.display = 'none';
            if (answerEls.section) {
                answerEls.section.classList.remove('hidden');
                answerEls.input.focus();
            }
        } else {
            // Can still buzz
            playerEls.buzzStatus.classList.add('hidden');
            playerEls.btnBuzz.disabled = false;
            playerEls.btnBuzz.style.display = 'block';
            if (answerEls.section) answerEls.section.classList.add('hidden');
        }
    } else if (phase === 'result') {
        // Results phase
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.buzzStatus.textContent = "ROUND COMPLETE";
        playerEls.buzzStatus.style.color = "var(--accent)";
        playerEls.btnBuzz.disabled = true;
        playerEls.btnBuzz.style.display = 'block';
        if (answerEls.section) answerEls.section.classList.add('hidden');
    } else {
        // Other phases
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.buzzStatus.textContent = "PLEASE WAIT";
        playerEls.buzzStatus.style.color = "#aaa";
        playerEls.btnBuzz.disabled = true;
        playerEls.btnBuzz.style.display = 'block';
        if (answerEls.section) answerEls.section.classList.add('hidden');
    }
}

function renderEndScreen() {
    const podium = document.getElementById('winner-podium');
    if (!podium || !gameState.scores) return;
    
    const sorted = [...gameState.scores].sort((a, b) => b.score - a.score);
    
    podium.innerHTML = sorted.map((p, i) => {
        const name = p.name || `Player-${p.socketId?.slice(0, 4) || '?'}`;
        return `
        <div class="podium-entry" style="font-size: ${2 - i * 0.2}rem; margin: 10px 0;">
            ${i === 0 ? '🏆 ' : ''}${i+1}. ${name} - ${p.score}pts
        </div>
    `;
    }).join('');
}

function handleGameEvent(event) {
    if (event.type === 'round_results') {
        // Show results overlay with all answers
        showResultsOverlay(event);
    } else if (event.type === 'first_correct') {
        // First correct answer bonus
        if (event.playerId === socket.id) {
            showFeedback('FIRST CORRECT! +150', 'success');
            showPointsAnimation(150);
            playSound('correct');
        }
    } else if (event.type === 'correct') {
        // Standard correct
        if (event.playerId === socket.id) {
            showFeedback('CORRECT! +100', 'success');
            showPointsAnimation(100);
            playSound('correct');
        }
    } else if (event.type === 'wrong') {
        if (event.playerId === socket.id) {
            showFeedback('WRONG!', 'danger');
            playSound('wrong');
        }
    } else if (event.type === 'player_buzzed') {
        // Someone buzzed - show brief notification
        if (event.playerId !== socket.id) {
            showBuzzNotification(event.playerName);
        } else {
            navigator.vibrate?.(200); // Vibrate on own buzz
        }
    } else if (event.type === 'player_answered') {
        // Someone submitted their answer (notification optional)
    } else if (event.type === 'round_skipped') {
        showFeedback('ROUND SKIPPED', 'warning');
    } else if (event.type === 'questions_shuffled') {
        showFeedback('QUESTIONS SHUFFLED', 'info');
    }
}

function showResultsOverlay(event) {
    // Remove any existing overlay
    const existingOverlay = document.getElementById('results-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'results-overlay';
    overlay.className = 'results-overlay';

    const resultsHTML = (event.results || []).map(r => {
        let itemClass = r.isCorrect ? 'correct' : 'wrong';
        if (r.isFirstCorrect) itemClass += ' first';

        let badge = '';
        if (r.isFirstCorrect) {
            badge = '<span class="first-badge">FIRST! +150</span>';
        } else if (r.isCorrect) {
            badge = '<span class="correct-badge">+100</span>';
        }

        return `
            <div class="result-item ${itemClass}">
                <span class="result-name">${r.name}</span>
                <span class="result-answer">${r.answer}</span>
                ${badge}
            </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="results-card">
            <h2>Round Results</h2>
            <div class="correct-answer">
                Correct Answer: <strong>${event.correctAnswer || 'N/A'}</strong>
            </div>
            <div class="results-list">
                ${resultsHTML || '<div class="result-item">No answers submitted</div>'}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Click to dismiss
    overlay.addEventListener('click', () => overlay.remove());

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
    }, 5000);
}

function showPointsAnimation(points) {
    const anim = document.createElement('div');
    anim.className = 'points-animation';
    anim.textContent = `+${points}`;
    document.body.appendChild(anim);
    setTimeout(() => {
        if (anim.parentNode) anim.remove();
    }, 2000);
}

function showBuzzNotification(playerName) {
    // Brief toast notification that someone buzzed
    const toast = document.createElement('div');
    toast.className = 'buzz-toast';
    toast.textContent = `${playerName} buzzed!`;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 1500);
}

function showFeedback(text, type) {
    // For host, use a global toast notification instead of player view
    if (isHost && !playerEls.feedback) {
        showGlobalToast(text, type);
        return;
    }

    const el = playerEls.feedback;
    const textEl = playerEls.feedbackText;

    if (!el || !textEl) {
        showGlobalToast(text, type);
        return;
    }

    textEl.textContent = text;
    if (type === 'success') {
        textEl.style.color = 'var(--success)';
    } else if (type === 'danger') {
        textEl.style.color = 'var(--danger)';
    } else if (type === 'info') {
        textEl.style.color = 'var(--accent)';
    } else if (type === 'warning') {
        textEl.style.color = '#ffcc00';
    } else {
        textEl.style.color = 'var(--accent)';
    }
    el.classList.remove('hidden');

    setTimeout(() => {
        el.classList.add('hidden');
    }, 1500);
}

function showGlobalToast(text, type) {
    const toast = document.createElement('div');
    toast.className = 'global-toast';

    let bgColor = 'var(--accent)';
    if (type === 'success') bgColor = 'var(--success)';
    else if (type === 'danger') bgColor = 'var(--danger)';
    else if (type === 'warning') bgColor = '#ffcc00';

    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: ${type === 'warning' ? '#1a1a2e' : 'white'};
        padding: 15px 30px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 1.1rem;
        z-index: 2000;
        animation: toastSlide 0.3s ease-out;
        box-shadow: 0 5px 20px rgba(0,0,0,0.4);
    `;
    toast.textContent = text;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 2000);
}

// Optional sound effects placeholders
function playSound(type) {
    // Implementation for audio
}

// Start
init();


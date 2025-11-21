// buzzin.js

// --- Game State & Variables ---
let socket;
let roomCode = null;
let playerName = null;
let isHost = false;
let gameState = null;
let roomState = null; // Store room state for lobby display

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
        
        // Join room immediately after connection
        if (roomCode && playerName) {
            console.log('Joining room:', roomCode, 'as', playerName);
            socket.emit('player:joinRoom', { roomCode, name: playerName });
        } else {
            console.error('Missing roomCode or playerName:', { roomCode, playerName });
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

    // Game started event
    socket.on('game:started', (data) => {
        console.log('Game started!', data);
        // Game state will come via game:state event
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

    // Start game button
    lobbyEls.btnStart.addEventListener('click', () => {
        const selectedCategories = Array.from(document.querySelectorAll('#category-checkboxes input:checked'))
            .map(cb => cb.value);
        
        if (selectedCategories.length === 0) {
            alert('Please select at least one category!');
            return;
        }
        
        const questionCount = parseInt(lobbyEls.qCountSlider?.value || 10);
        
        // Emit host:startGame with categories and question count
        socket.emit('host:startGame', {
            roomCode: roomCode,
            gameType: 'buzzin',
            categories: selectedCategories,
            questionCount: questionCount
        });
    });

    // Host Actions
    if (hostEls.btnShowQuestion) {
        hostEls.btnShowQuestion.addEventListener('click', () => {
            socket.emit('host:showQuestion', { roomCode: roomCode });
        });
    }
    
    hostEls.btnCorrect.addEventListener('click', () => {
        socket.emit('host:judgeAnswer', { roomCode: roomCode, correct: true });
    });
    
    hostEls.btnWrong.addEventListener('click', () => {
        socket.emit('host:judgeAnswer', { roomCode: roomCode, correct: false });
    });
    
    hostEls.btnNext.addEventListener('click', () => {
        socket.emit('host:nextQuestion', { roomCode: roomCode });
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
    
    // Host controls
    const btnRestart = document.getElementById('btn-restart-game');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            if (confirm('Restart the game? All scores will reset.')) {
                socket.emit('host:restartGame', { roomCode: roomCode });
            }
        });
    }
    
    const btnEndGame = document.getElementById('btn-end-game');
    if (btnEndGame) {
        btnEndGame.addEventListener('click', () => {
            if (confirm('End the game? This will return everyone to the main menu.')) {
                socket.emit('host:endGame', { roomCode: roomCode });
            }
        });
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
            hostEls.view.classList.remove('hidden');
            playerEls.view.classList.remove('hidden');
            renderHostView();
            renderPlayerView();
        } else {
            hostEls.view.classList.add('hidden');
            playerEls.view.classList.remove('hidden');
            renderPlayerView();
        }
    }
}

function renderCountdown() {
    // Show countdown on both host and player views
    const countdownEl = document.getElementById('countdown-display');
    if (!countdownEl) {
        // Create countdown element if it doesn't exist
        const countdownDiv = document.createElement('div');
        countdownDiv.id = 'countdown-display';
        countdownDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 8rem; font-weight: 900; color: var(--primary); z-index: 1000; text-shadow: 0 0 30px rgba(255,0,85,0.8);';
        document.body.appendChild(countdownDiv);
    }
    
    const seconds = gameState.countdownSeconds || 0;
    const countdownDisplay = document.getElementById('countdown-display');
    if (countdownDisplay) {
        if (seconds > 0) {
            countdownDisplay.textContent = seconds;
            countdownDisplay.style.display = 'block';
        } else {
            countdownDisplay.style.display = 'none';
        }
    }
}

function renderHostView() {
    const { currentQuestion, currentQuestionIndex, totalQuestions, phase, buzzState } = gameState;
    
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
        hostEls.buzzArea.innerHTML = '<div class="status-text">Waiting for buzz...</div>';
    } else if (phase === 'buzzed') {
        if (hostEls.phases.buzzed) hostEls.phases.buzzed.classList.remove('hidden');
        const buzzedName = buzzState.buzzedPlayerName || 'Unknown';
        if (hostEls.buzzedName) hostEls.buzzedName.textContent = buzzedName;
        hostEls.buzzArea.innerHTML = `
            <div class="buzzed-alert" style="color: var(--primary);">
                🚨 ${buzzedName} 🚨
            </div>`;
    } else if (phase === 'answering') {
        if (hostEls.phases.answering) hostEls.phases.answering.classList.remove('hidden');
        const answeringName = buzzState.buzzedPlayerName || 'Player';
        if (hostEls.answeringName) hostEls.answeringName.textContent = answeringName;
        hostEls.buzzArea.innerHTML = `<div class="status-text">Waiting for ${answeringName} to submit answer...</div>`;
    } else if (phase === 'result') {
        if (hostEls.phases.result) hostEls.phases.result.classList.remove('hidden');
        hostEls.buzzArea.innerHTML = '<div class="status-text" style="color: var(--success);">Answer Revealed</div>';
    }

    // Leaderboard (Mini) - ensure no null names
    const sortedScores = [...(gameState.scores || [])].sort((a, b) => b.score - a.score);
    hostEls.leaderboard.innerHTML = sortedScores.slice(0, 5)
        .map((p, i) => {
            const name = p.name || `Player-${p.socketId?.slice(0, 4) || '?'}`;
            return `<div>${i+1}. ${name}: ${p.score}</div>`;
        })
        .join('');
    
    // Show host control buttons (restart/end) if game is in progress or ended
    const hostControlPanel = document.getElementById('host-control-panel');
    if (hostControlPanel) {
        if (phase === 'end' || phase === 'result' || phase === 'question' || phase === 'buzzed' || phase === 'answering') {
            hostControlPanel.style.display = 'block';
        } else {
            hostControlPanel.style.display = 'none';
        }
    }
}

function renderPlayerView() {
    const { currentQuestion, phase, buzzState, scores } = gameState;
    const myScoreEntry = (scores || []).find(s => s.socketId === socket.id) || { score: 0 };
    
    // Score & Rank
    playerEls.score.textContent = myScoreEntry.score || 0;
    // Calc rank
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

    // Buzzer State & Answer Section
    const iBuzzed = buzzState.buzzedPlayerId === socket.id;
    
    if (phase === 'waiting') {
        // Waiting for question
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.buzzStatus.textContent = "WAITING FOR QUESTION";
        playerEls.buzzStatus.style.color = "#aaa";
        playerEls.btnBuzz.disabled = true;
        if (answerEls.section) answerEls.section.classList.add('hidden');
    } else if (phase === 'question' && !buzzState.locked) {
        // Can buzz
        playerEls.buzzStatus.classList.add('hidden');
        playerEls.btnBuzz.disabled = false;
        if (answerEls.section) answerEls.section.classList.add('hidden');
    } else if (phase === 'buzzed' || phase === 'answering') {
        // Someone buzzed
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.btnBuzz.disabled = true;
        
        if (iBuzzed) {
            // I buzzed - show answer input
            playerEls.buzzStatus.textContent = "YOU BUZZED!";
            playerEls.buzzStatus.style.color = "var(--success)";
            if (answerEls.section) {
                answerEls.section.classList.remove('hidden');
                if (phase === 'answering') {
                    answerEls.input.focus();
                }
            }
        } else {
            // Someone else buzzed
            const buzzedName = buzzState.buzzedPlayerName || 'Someone';
            playerEls.buzzStatus.textContent = `${buzzedName} BUZZED`;
            playerEls.buzzStatus.style.color = "var(--danger)";
            if (answerEls.section) answerEls.section.classList.add('hidden');
        }
    } else {
        // Locked/other phase
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.buzzStatus.textContent = "LOCKED";
        playerEls.buzzStatus.style.color = "#aaa";
        playerEls.btnBuzz.disabled = true;
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
    if (event.type === 'correct') {
        showFeedback('CORRECT!', 'success');
        if (event.playerId === socket.id) playSound('correct');
    } else if (event.type === 'wrong') {
        showFeedback('WRONG!', 'danger');
        if (event.playerId === socket.id) playSound('wrong');
    } else if (event.type === 'buzz') {
        if (event.playerId === socket.id) {
             navigator.vibrate?.(200); // Vibrate phone on success buzz
        }
    }
}

function showFeedback(text, type) {
    if (isHost) return; // Don't show overlay on host
    
    const el = playerEls.feedback;
    const textEl = playerEls.feedbackText;
    
    textEl.textContent = text;
    textEl.style.color = type === 'success' ? 'var(--success)' : 'var(--danger)';
    el.classList.remove('hidden');
    
    setTimeout(() => {
        el.classList.add('hidden');
    }, 1500);
}

// Optional sound effects placeholders
function playSound(type) {
    // Implementation for audio
}

// Start
init();


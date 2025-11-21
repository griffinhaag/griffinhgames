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

const hostEls = {
    view: document.getElementById('view-host'),
    qIndex: document.getElementById('host-q-index'),
    qTotal: document.getElementById('host-q-total'),
    category: document.getElementById('host-category'),
    question: document.getElementById('host-question-text'),
    answer: document.getElementById('host-answer-text'),
    buzzArea: document.getElementById('host-buzz-area'),
    phases: {
        question: document.getElementById('host-phase-question'),
        buzzed: document.getElementById('host-phase-buzzed'),
        result: document.getElementById('host-phase-result')
    },
    buzzedName: document.getElementById('buzzed-player-name'),
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

    // Connect to socket
    const backendUrl = window.BACKEND_URL || 'http://localhost:3000';
    socket = io(backendUrl);

    setupSocketListeners();
    setupUIListeners();
    
    // Handle connection and room join
    function joinRoom() {
        if (socket.connected && roomCode && playerName) {
            socket.emit('player:joinRoom', { roomCode, name: playerName });
        }
    }
    
    // Join when connected
    socket.on('connect', () => {
        console.log('Socket connected, joining room...');
        joinRoom();
    });
    
    // If already connected, join immediately
    if (socket.connected) {
        joinRoom();
    }
}

// --- Socket Listeners ---
function setupSocketListeners() {
    socket.on('connect', () => {
        console.log('Connected to BuzzIn! server');
        // Room join will trigger room:state, which will show lobby
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        showScreen('connecting');
    });
    
    socket.on('room:error', (message) => {
        console.error('Room error:', message);
        alert(message);
    });

    // Generic room state updates (lobby phase)
    socket.on('room:state', (rs) => {
        roomState = rs; // Store for later use
        
        // If room is in-progress, we need game state, not room state
        if (rs.phase === 'in-progress') {
            // Request game state via game:event
            socket.emit('game:event', {
                roomCode: rs.code,
                eventName: 'player:requestState',
                payload: {}
            });
            return;
        }
        
        // Otherwise, show lobby
        updateLobbyUI(rs);
        
        // Sync host status
        const me = rs.players.find(p => p.socketId === socket.id);
        if (me) isHost = me.isHost;
        
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
    });

    // Game events (sound effects, toasts, specific triggers)
    socket.on('game:event', (event) => {
        handleGameEvent(event);
    });
}

// --- UI Listeners ---
function setupUIListeners() {
    // Initialize category checkboxes
    setupCategoryCheckboxes();

    lobbyEls.btnStart.addEventListener('click', () => {
        const selectedCategories = Array.from(document.querySelectorAll('#category-checkboxes input:checked'))
            .map(cb => cb.value);
        
        if (selectedCategories.length === 0) {
            alert('Please select at least one category!');
            return;
        }
        
        // Emit host:startGame with categories
        socket.emit('host:startGame', {
            roomCode: roomCode,
            gameType: 'buzzin',
            categories: selectedCategories
        });
    });

    // Host Actions
    hostEls.btnCorrect.addEventListener('click', () => {
        socket.emit('host:judgeAnswer', { correct: true });
    });
    
    hostEls.btnWrong.addEventListener('click', () => {
        socket.emit('host:judgeAnswer', { correct: false });
    });
    
    hostEls.btnNext.addEventListener('click', () => {
        socket.emit('host:nextQuestion');
    });

    // Player Actions
    playerEls.btnBuzz.addEventListener('click', () => {
        socket.emit('player:buzz');
    });
    
    // Return to main lobby
    document.getElementById('btn-return-lobby').addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
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
    if (!rs) return;
    
    // Switch to lobby screen when we get room state
    showScreen('lobby');
    
    // Update room code
    if (rs.code) {
        lobbyEls.code.textContent = rs.code;
    }
    
    // Update player list with animations
    if (rs.players && rs.players.length > 0) {
        lobbyEls.list.innerHTML = rs.players
            .map(p => `<div class="player-tag">${p.name} ${p.isHost ? '👑' : ''}</div>`)
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
    } else if (gameState.phase === 'end') {
        showScreen('end');
        renderEndScreen();
    } else {
        showScreen('game');
        // Show appropriate view based on role
        if (isHost) {
            hostEls.view.classList.remove('hidden');
            playerEls.view.classList.add('hidden');
            renderHostView();
        } else {
            hostEls.view.classList.add('hidden');
            playerEls.view.classList.remove('hidden');
            renderPlayerView();
        }
    }
}

function renderHostView() {
    const { currentQuestion, currentQuestionIndex, totalQuestions, phase, buzzState } = gameState;
    
    // Header
    hostEls.qIndex.textContent = currentQuestionIndex + 1;
    hostEls.qTotal.textContent = totalQuestions;
    hostEls.category.textContent = currentQuestion ? currentQuestion.category : '-';
    
    // Question Card
    hostEls.question.textContent = currentQuestion ? currentQuestion.question : '...';
    hostEls.answer.textContent = currentQuestion ? currentQuestion.answer : '...';

    // Phase Controls
    Object.values(hostEls.phases).forEach(el => el.classList.add('hidden'));
    
    if (phase === 'question') {
        hostEls.phases.question.classList.remove('hidden');
        hostEls.buzzArea.innerHTML = '<div class="status-text">Waiting for buzz...</div>';
    } else if (phase === 'buzzed') {
        hostEls.phases.buzzed.classList.remove('hidden');
        hostEls.buzzedName.textContent = buzzState.buzzedPlayerName || 'Unknown';
        hostEls.buzzArea.innerHTML = `
            <div class="buzzed-alert" style="color: var(--primary);">
                🚨 ${buzzState.buzzedPlayerName} 🚨
            </div>`;
    } else if (phase === 'result') {
        hostEls.phases.result.classList.remove('hidden');
        hostEls.buzzArea.innerHTML = '<div class="status-text" style="color: var(--success);">Answer Revealed</div>';
    }

    // Leaderboard (Mini)
    const sortedScores = [...gameState.scores].sort((a, b) => b.score - a.score);
    hostEls.leaderboard.innerHTML = sortedScores.slice(0, 5)
        .map((p, i) => `<div>${i+1}. ${p.name}: ${p.score}</div>`)
        .join('');
}

function renderPlayerView() {
    const { currentQuestion, phase, buzzState, scores } = gameState;
    const myScoreEntry = scores.find(s => s.socketId === socket.id) || { score: 0 };
    
    // Score & Rank
    playerEls.score.textContent = myScoreEntry.score;
    // Calc rank
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const myRank = sorted.findIndex(s => s.socketId === socket.id) + 1;
    playerEls.rank.textContent = `#${myRank}`;

    // Question info
    playerEls.category.textContent = currentQuestion ? currentQuestion.category : '';
    playerEls.question.textContent = currentQuestion ? currentQuestion.question : 'Wait for it...';

    // Buzzer State
    if (phase === 'question' && !buzzState.locked) {
        playerEls.buzzStatus.classList.add('hidden');
        playerEls.btnBuzz.disabled = false;
    } else {
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.btnBuzz.disabled = true;
        
        if (phase === 'buzzed') {
            if (buzzState.buzzedPlayerId === socket.id) {
                playerEls.buzzStatus.textContent = "YOU BUZZED!";
                playerEls.buzzStatus.style.color = "var(--success)";
            } else {
                playerEls.buzzStatus.textContent = `${buzzState.buzzedPlayerName} BUZZED`;
                playerEls.buzzStatus.style.color = "var(--danger)";
            }
        } else {
            playerEls.buzzStatus.textContent = "LOCKED";
            playerEls.buzzStatus.style.color = "#aaa";
        }
    }
}

function renderEndScreen() {
    const podium = document.getElementById('winner-podium');
    const sorted = [...gameState.scores].sort((a, b) => b.score - a.score);
    
    podium.innerHTML = sorted.map((p, i) => `
        <div class="podium-entry" style="font-size: ${2 - i * 0.2}rem; margin: 10px 0;">
            ${i === 0 ? '🏆 ' : ''}${i+1}. ${p.name} - ${p.score}pts
        </div>
    `).join('');
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


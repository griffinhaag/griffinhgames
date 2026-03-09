// buzzin.js

// --- Game State & Variables ---
let socket;
let roomCode = null;
let playerName = null;
let isHost = false;
let hostAsPlayer = false; // If false, host is spectate/admin only (no score, no answers)
let offTheDomeCount = 3; // Number of free-text (OFF THE DOME) questions
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

// Question counts per category — fetched from server so they stay in sync
let CATEGORY_QUESTION_COUNTS = {};
let MAX_QUESTIONS_PER_GAME = 100; // Matches server-side cap; updated from API response

async function fetchCategoryCounts() {
  const url = window.BACKEND_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${url}/buzzin/category-counts`);
    if (res.ok) {
      const data = await res.json();
      if (typeof data._maxPerGame === 'number') {
        MAX_QUESTIONS_PER_GAME = data._maxPerGame;
        delete data._maxPerGame;
      }
      CATEGORY_QUESTION_COUNTS = data;
    }
  } catch (e) {
    CATEGORIES.forEach(c => { CATEGORY_QUESTION_COUNTS[c] = 25; });
  }
}

function totalQuestionsForCategories(cats) {
  return cats.reduce((sum, cat) => sum + (CATEGORY_QUESTION_COUNTS[cat] || 25), 0);
}

// Cap a raw question count against both the available pool and the server's hard max.
function cappedMax(rawTotal) {
  return Math.min(rawTotal, MAX_QUESTIONS_PER_GAME);
}

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

const choicesEls = {
    section: document.getElementById('player-choices-section'),
    grid: document.getElementById('choices-grid')
};

// Track OFF THE DOME state
let offTheDomeShown = false;
let selectedChoice = null;

// Cache shuffled choices per question to prevent re-shuffling every timer tick
let lastRenderedQuestionKey = null;
let cachedShuffledChoices = null;
let lastChoiceRenderKey = null; // prevent full DOM rebuild on every timer tick

// --- Leaderboard tracking ---
let previousScores = null;
let pendingRoundResults = null; // Stored until game:state delivers updated scores

// --- Session question history (resets on browser close via sessionStorage) ---
function getSeenQuestions() {
    try {
        return JSON.parse(sessionStorage.getItem('buzzin_seen_questions') || '[]');
    } catch (e) { return []; }
}

function addSeenQuestion(questionText) {
    if (!questionText) return;
    const seen = getSeenQuestions();
    if (!seen.includes(questionText)) {
        seen.push(questionText);
        sessionStorage.setItem('buzzin_seen_questions', JSON.stringify(seen));
    }
}

// --- YouTube Players ---
let lobbyPlayer = null;
let questionMusicPlayer = null;
let lobbyPlayerReady = false;
let questionMusicReady = false;
let previousPhase = null;
let previousQuestionText = null; // Track question changes regardless of phase

// --- Music & Countdown preferences (persisted per device via localStorage) ---
let musicEnabled = localStorage.getItem('buzzin_music') !== 'false'; // default on
let countdownEnabled = localStorage.getItem('buzzin_countdown') !== 'false'; // default on

// Called automatically by YouTube IFrame API once loaded
function onYouTubeIframeAPIReady() {
    lobbyPlayer = new YT.Player('lobby-video-player', {
        videoId: '8YGlzSl6cxU',
        playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: '8YGlzSl6cxU',
            controls: 0,
            modestbranding: 1,
            rel: 0
        },
        events: {
            onReady: () => {
                lobbyPlayerReady = true;
                // Attempt playback — succeeds if user has already interacted (clicked music button or any UI)
                if (musicEnabled) playLobbyVideo();
            }
        }
    });

    questionMusicPlayer = new YT.Player('question-music-player', {
        videoId: 'jTbA70qUyVY',
        playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0
        },
        events: {
            onReady: () => {
                questionMusicReady = true;
            }
        }
    });
}

function playLobbyVideo() {
    if (!musicEnabled) return;
    if (!lobbyPlayerReady || !lobbyPlayer?.playVideo) return;
    // Sync playback position to room creation time so all clients hear the same part of the track
    try {
        const duration = lobbyPlayer.getDuration?.() || 0;
        if (duration > 0 && roomState?.createdAt) {
            const elapsed = (Date.now() - roomState.createdAt) / 1000;
            lobbyPlayer.seekTo(elapsed % duration, true);
        }
    } catch (e) { /* getDuration may throw if player not fully ready */ }
    lobbyPlayer.playVideo();
}

function stopLobbyVideo() {
    if (lobbyPlayerReady && lobbyPlayer?.pauseVideo) lobbyPlayer.pauseVideo();
}

function startQuestionMusic() {
    if (!musicEnabled) return;
    if (questionMusicReady && questionMusicPlayer?.seekTo) {
        questionMusicPlayer.seekTo(0);
        questionMusicPlayer.playVideo();
    }
}

function stopQuestionMusic() {
    if (questionMusicReady && questionMusicPlayer?.stopVideo) {
        questionMusicPlayer.stopVideo();
    }
}

function updateMusicButton() {
    const btn = document.getElementById('btn-music-toggle');
    if (!btn) return;
    if (musicEnabled) {
        btn.textContent = '🔊 Music On';
        btn.classList.add('music-on');
        btn.classList.remove('music-off');
    } else {
        btn.textContent = '🔇 Music Off';
        btn.classList.remove('music-on');
        btn.classList.add('music-off');
    }
}

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

    // Check sessionStorage for redirect info (from lobby/join page)
    const redirectInfo = sessionStorage.getItem('buzzin_redirect');
    if (redirectInfo) {
        try {
            const info = JSON.parse(redirectInfo);
            roomCode = roomCode || info.room;
            playerName = playerName || info.name;
            isHost = isHost || info.host === true;
            sessionStorage.removeItem('buzzin_redirect');
        } catch (e) {
            console.error('Failed to parse redirect info:', e);
        }
    }

    if (!roomCode || !playerName) {
        alert("Invalid game session. Redirecting to join page...");
        window.location.href = 'join.html';
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

    // Restore settings from sessionStorage (for host coming from setup page)
    restoreSettingsFromStorage();
}

// --- Restore Settings from SessionStorage ---
function restoreSettingsFromStorage() {
    const settingsStr = sessionStorage.getItem('buzzin_settings');
    if (!settingsStr || !isHost) return;

    try {
        const settings = JSON.parse(settingsStr);
        console.log('Restoring settings:', settings);

        // Restore question count
        if (settings.questionCount && lobbyEls.qCountSlider && lobbyEls.qCountDisplay) {
            lobbyEls.qCountSlider.value = settings.questionCount;
            lobbyEls.qCountDisplay.textContent = settings.questionCount;
        }

        // Restore timer duration
        if (settings.timerDuration && lobbyEls.timerSlider && lobbyEls.timerDisplay) {
            lobbyEls.timerSlider.value = settings.timerDuration;
            lobbyEls.timerDisplay.textContent = settings.timerDuration;
        }

        // Restore selected categories
        if (settings.categories && settings.categories.length > 0) {
            const checkboxes = document.querySelectorAll('#category-checkboxes input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = settings.categories.includes(cb.value);
            });
        }

        // Restore hostAsPlayer setting
        if (settings.hostAsPlayer !== undefined) {
            hostAsPlayer = settings.hostAsPlayer;
        }

        // Restore offTheDomeCount
        if (settings.offTheDomeCount !== undefined) {
            offTheDomeCount = settings.offTheDomeCount;
        }
    } catch (e) {
        console.error('Failed to restore settings:', e);
    }
}

// --- Socket Listeners ---
function setupSocketListeners() {
    let connectionTimeout;
    
    socket.on('connect', () => {
        console.log('Connected to BuzzIn! server');
        clearTimeout(connectionTimeout);

        // Join room immediately after connection
        // Server handles reconnection by player name automatically
        if (roomCode && playerName) {
            console.log('Joining room:', roomCode, 'as', playerName, 'host:', isHost);
            socket.emit('player:joinRoom', { roomCode, name: playerName, isHost: isHost });
        } else {
            console.error('Missing roomCode or playerName:', { roomCode, playerName });
            // Redirect back to join page if missing info
            setTimeout(() => {
                window.location.href = 'join.html';
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
        // Re-establish isHost from URL params in case it was lost
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('host') === 'true') isHost = true;
        if (roomCode && playerName) {
            socket.emit('player:joinRoom', { roomCode, name: playerName, isHost: isHost });
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
        
        // If kicked, show kicked overlay
        if (message.toLowerCase().includes('kick')) {
            errorDiv.remove();
            showKickedOverlay();
            return;
        }

        // If room not found, redirect back to main menu after delay
        if (message.includes('not found') || message.includes('Invalid') || message.includes('Unable')) {
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 3000);
        } else {
            setTimeout(() => errorDiv.remove(), 5000);
        }
    });

    // Generic room state updates (lobby phase)
    socket.on('room:state', (rs) => {
        console.log('Room state received:', rs);
        roomState = rs; // Store for later use

        // If a game is actively running, don't let room:state interrupt it.
        // game:state events handle all in-game rendering. room:state arriving during
        // a disconnect event would otherwise call showScreen('lobby') and interrupt
        // the host and players.
        if (gameState && gameState.phase !== 'lobby' && gameState.phase !== 'end') {
            return;
        }

        // If room is in-progress (reconnecting player starting fresh), show loading
        if (rs.phase === 'in-progress') {
            console.log('Room is in-progress, waiting for game state...');
            showScreen('lobby');
            lobbyEls.code.textContent = rs.code || roomCode || '----';
            lobbyEls.list.innerHTML = '<div class="player-tag">Game in progress, loading...</div>';
            // Game state should arrive shortly via game:state event
            return;
        }

        // Otherwise, show lobby
        updateLobbyUI(rs);

        // Sync host status — URL param is authoritative, server confirmation is a bonus
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('host') === 'true') isHost = true;
        const me = rs.players.find(p => p.socketId === socket.id);
        if (me && me.isHost) isHost = true;
        console.log('I am host:', isHost);

        updateHostControlsVisibility();
    });

    // Player kicked event
    socket.on('player:kicked', () => {
        showKickedOverlay();
    });

    // Some servers send kick as a room error
    // (handled in room:error — "kicked" keyword triggers redirect below)

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
        // Sync hostAsPlayer and offTheDomeCount from authoritative server state
        if (isHost && state.hostAsPlayer !== undefined) {
            hostAsPlayer = state.hostAsPlayer;
        }
        if (state.offTheDomeCount !== undefined) {
            offTheDomeCount = state.offTheDomeCount;
        }
        renderGameState();

        // Show round results overlay NOW — game:state has the updated scores,
        // so leaderboard deltas and ranks will be correct
        if (pendingRoundResults && state.phase === 'result') {
            showResultsOverlay(pendingRoundResults);
            pendingRoundResults = null;
        }

        // Update countdown display if in countdown phase
        if (state.phase === 'countdown') {
            renderCountdown();
        }
    });

    // Game events (sound effects, toasts, specific triggers)
    socket.on('game:event', (event) => {
        // round_results must wait for game:state to arrive with updated scores
        // before being shown, otherwise the leaderboard deltas will all be 0
        if (event.type === 'round_results') {
            pendingRoundResults = event;
        } else {
            handleGameEvent(event);
        }

        // Handle error events
        if (event.type === 'error') {
            alert(event.message || 'An error occurred');
        }
        
        // Handle game ended
        if (event.type === 'game_ended') {
            // Clear session storage
            sessionStorage.removeItem('buzzin_redirect');
            sessionStorage.removeItem('buzzin_room');
            sessionStorage.removeItem('buzzin_settings');

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
    roomCodeValue: document.getElementById('admin-room-code-value'),
    shuffleQuestions: document.getElementById('admin-shuffle-questions'),
    pauseGame: document.getElementById('admin-pause-game'),
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

    // START GAME — direct listener on the button (simple and reliable, matching original approach)
    if (lobbyEls.btnStart) {
        lobbyEls.btnStart.addEventListener('click', () => {
            const btn = lobbyEls.btnStart;
            if (btn.disabled) return;

            // Load settings from sessionStorage (set by setup.html), fall back gracefully
            let categories = CATEGORIES.slice(); // default: all categories
            let questionCount = 10;
            let timerDurationValue = 30;
            let bonusFirstCorrect = true;
            try {
                const settings = JSON.parse(sessionStorage.getItem('buzzin_settings') || '{}');
                if (settings.categories && settings.categories.length > 0) categories = settings.categories;
                if (settings.questionCount) questionCount = settings.questionCount;
                if (settings.timerDuration) timerDurationValue = settings.timerDuration;
                bonusFirstCorrect = settings.bonusFirstCorrect !== false;
                hostAsPlayer = settings.hostAsPlayer === true;
                offTheDomeCount = settings.offTheDomeCount ?? 3;
            } catch (e) {}

            btn.disabled = true;
            btn.textContent = 'Starting...';

            socket.emit('host:startGame', {
                roomCode,
                gameType: 'buzzin',
                categories,
                questionCount,
                timerDuration: timerDurationValue,
                bonusFirstCorrect,
                hostAsPlayer,
                offTheDomeCount,
                seenQuestions: getSeenQuestions()
            });

            // Re-enable if server doesn't respond within 5s
            setTimeout(() => {
                if (btn.disabled) { btn.disabled = false; btn.textContent = 'START GAME'; }
            }, 5000);
        });
    }

    // KICK buttons — event delegation since they're dynamically rendered in the player list
    document.getElementById('screen-lobby').addEventListener('click', (e) => {
        const kickBtn = e.target.closest('.kick-btn');
        if (kickBtn && isHost) {
            const sid = kickBtn.dataset.socketId;
            if (sid) socket.emit('host:kickPlayer', { roomCode, socketId: sid });
        }
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

    // Return to main menu
    const btnReturn = document.getElementById('btn-return-lobby');
    if (btnReturn) {
        btnReturn.addEventListener('click', () => {
            window.location.href = '../../index.html';
        });
    }

    // Play Again with same players (host only)
    const btnPlayAgain = document.getElementById('btn-play-again');
    if (btnPlayAgain) {
        btnPlayAgain.addEventListener('click', () => {
            showPlayAgainModal();
        });
    }

    // --- Music Toggle Button ---
    const btnMusic = document.getElementById('btn-music-toggle');
    if (btnMusic) {
        updateMusicButton(); // Set initial appearance
        btnMusic.addEventListener('click', () => {
            musicEnabled = !musicEnabled;
            localStorage.setItem('buzzin_music', musicEnabled ? 'true' : 'false');
            updateMusicButton();
            if (musicEnabled) {
                playLobbyVideo(); // User just interacted — autoplay now permitted
            } else {
                stopLobbyVideo();
                stopQuestionMusic();
            }
        });
    }

    // --- Countdown Toggle (host only — visibility set in updateHostControlsVisibility) ---
    const countdownToggle = document.getElementById('countdown-toggle');
    if (countdownToggle) {
        countdownToggle.checked = countdownEnabled;
        countdownToggle.addEventListener('change', () => {
            countdownEnabled = countdownToggle.checked;
            localStorage.setItem('buzzin_countdown', countdownEnabled ? 'true' : 'false');
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

    // Shuffle Questions
    if (adminMenuEls.shuffleQuestions) {
        adminMenuEls.shuffleQuestions.addEventListener('click', () => {
            if (confirm('Shuffle questions? The current question and all remaining questions will be reshuffled into a new order.')) {
                socket.emit('host:shuffleQuestions', { roomCode: roomCode });
                closeAdminMenu();
            }
        });
    }

    // Pause / Resume Game
    if (adminMenuEls.pauseGame) {
        adminMenuEls.pauseGame.addEventListener('click', () => {
            if (gameState?.phase === 'paused') {
                socket.emit('host:resumeGame', { roomCode });
            } else {
                socket.emit('host:pauseGame', { roomCode });
            }
            closeAdminMenu();
        });
    }

    // Start New Game
    if (adminMenuEls.newGame) {
        adminMenuEls.newGame.addEventListener('click', () => {
            if (confirm('Start a new game? All scores will be reset and questions reshuffled.')) {
                socket.emit('host:restartGame', { roomCode: roomCode, seenQuestions: getSeenQuestions() });
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
            gameState.phase === 'paused' ||
            gameState.phase === 'end'
        )) {
            adminMenuEls.menu.classList.remove('hidden');

            // Update room code display
            if (adminMenuEls.roomCodeValue) {
                adminMenuEls.roomCodeValue.textContent = roomCode || '----';
            }

            // Update button states based on phase
            if (adminMenuEls.shuffleQuestions) {
                // Allow shuffle during waiting/question/result phases — always,
                // including the last question (server will re-show same if no alternatives).
                const canShuffle = gameState.phase === 'waiting' || gameState.phase === 'question' || gameState.phase === 'result';
                adminMenuEls.shuffleQuestions.disabled = !canShuffle;
                adminMenuEls.shuffleQuestions.style.opacity = canShuffle ? '1' : '0.4';
            }
            if (adminMenuEls.pauseGame) {
                const isPaused = gameState.phase === 'paused';
                const canPause = gameState.phase === 'question' || isPaused;
                adminMenuEls.pauseGame.disabled = !canPause;
                adminMenuEls.pauseGame.style.opacity = canPause ? '1' : '0.4';
                adminMenuEls.pauseGame.innerHTML = isPaused
                    ? '<span class="admin-icon">&#x25B6;</span> Resume Game'
                    : '<span class="admin-icon">&#x23F8;</span> Pause Game';
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

    // Clean up transition overlays (results-overlay manages its own lifecycle)
    ['off-the-dome-overlay', 'play-again-modal', 'kicked-overlay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    // pre-q-countdown must survive repeated showScreen('game') calls while phase='waiting'.
    // Only clean it up when actually leaving the game screen.
    if (screenName !== 'game') {
        const pqc = document.getElementById('pre-q-countdown');
        if (pqc) pqc.remove();
        if (preQuestionCountdownTimer) {
            clearInterval(preQuestionCountdownTimer);
            preQuestionCountdownTimer = null;
        }
    }

    if (screenName === 'lobby') {
        playLobbyVideo();
    } else {
        stopLobbyVideo();
    }
}

function setupCategoryCheckboxes() {
    const container = document.getElementById('category-checkboxes');
    if (!container) return;
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
    
    // Diff-update player list — only add/remove changed entries to avoid re-animating existing players
    {
        const container = lobbyEls.list;
        const currentSids = new Set(
            [...container.querySelectorAll('[data-player-sid]')].map(el => el.dataset.playerSid)
        );
        const incomingSids = new Set((rs.players || []).map(p => p.socketId));

        // Remove players who left
        currentSids.forEach(sid => {
            if (!incomingSids.has(sid)) {
                container.querySelector(`[data-player-sid="${sid}"]`)?.remove();
            }
        });

        // Add only new players (preserves animation for genuinely new joins)
        (rs.players || []).forEach(p => {
            if (currentSids.has(p.socketId)) return; // already rendered
            const name = p.name || `Player-${p.socketId?.slice(0, 4) || '?'}`;
            const div = document.createElement('div');
            div.dataset.playerSid = p.socketId;
            if (isHost && !p.isHost) {
                div.className = 'player-tag kickable';
                div.innerHTML = `<span class="player-tag-name">${name}</span><button class="kick-btn" data-socket-id="${p.socketId}" aria-label="Kick ${name}">✕</button>`;
            } else {
                div.className = 'player-tag';
                div.textContent = name + (p.isHost ? ' 👑' : '');
            }
            container.appendChild(div);
        });

        // Empty state
        const noPlayers = container.querySelector('.lobby-no-players');
        if (!rs.players || rs.players.length === 0) {
            if (!noPlayers) {
                const empty = document.createElement('div');
                empty.className = 'player-tag lobby-no-players';
                empty.style.opacity = '0.5';
                empty.textContent = 'No players yet...';
                container.appendChild(empty);
            }
        } else {
            noPlayers?.remove();
        }
    }
}

function updateHostControlsVisibility() {
    if (isHost) {
        lobbyEls.hostControls.classList.remove('hidden');
        lobbyEls.playerMsg.classList.add('hidden');
        renderSelectedCategories();
        // Show countdown toggle for host
        const ctRow = document.getElementById('countdown-toggle-row');
        if (ctRow) ctRow.classList.remove('hidden');
    } else {
        lobbyEls.hostControls.classList.add('hidden');
        lobbyEls.playerMsg.classList.remove('hidden');
    }
}

function renderSelectedCategories() {
    const listEl = document.getElementById('selected-categories-list');
    if (!listEl) return;
    try {
        const settings = JSON.parse(sessionStorage.getItem('buzzin_settings') || '{}');
        const cats = settings.categories || [];
        listEl.innerHTML = cats.length
            ? cats.map(c => `<span class="selected-cat-tag">${c}</span>`).join('')
            : '<span style="opacity:0.5">All categories</span>';
    } catch (e) {
        listEl.innerHTML = '<span style="opacity:0.5">All categories</span>';
    }
}

function renderGameState() {
    if (!gameState) return;

    const currentPhase = gameState.phase;

    // Pause overlay transitions
    if (currentPhase === 'paused' && previousPhase !== 'paused') {
        showPauseOverlay();
    } else if (previousPhase === 'paused' && currentPhase !== 'paused') {
        const po = document.getElementById('pause-overlay');
        if (po) {
            po.style.transition = 'opacity 0.3s ease-out';
            po.style.opacity = '0';
            setTimeout(() => { if (po.parentNode) po.remove(); }, 300);
        }
    }

    // When host clicks NEXT QUESTION, phase moves to "waiting" — dismiss overlay for everyone
    if (currentPhase === 'waiting' && previousPhase === 'result') {
        const ro = document.getElementById('results-overlay');
        if (ro) {
            ro.style.transition = 'opacity 0.25s ease-out';
            ro.style.opacity = '0';
            setTimeout(() => { if (ro.parentNode) ro.remove(); }, 250);
        }
        if (countdownEnabled) {
            startPreQuestionCountdown(3, () => {
                if (isHost) socket.emit('host:showQuestion', { roomCode });
            });
        } else if (isHost) {
            socket.emit('host:showQuestion', { roomCode });
        }
    }

    // Clean up pre-question countdown overlay if the phase has moved past 'waiting'
    // (e.g. host disabled countdown and question phase arrived before 3s elapsed)
    if (currentPhase !== 'waiting') {
        const pqc = document.getElementById('pre-q-countdown');
        if (pqc) {
            pqc.style.transition = 'opacity 0.2s ease-out';
            pqc.style.opacity = '0';
            setTimeout(() => { if (pqc.parentNode) pqc.remove(); }, 200);
            if (preQuestionCountdownTimer) {
                clearInterval(preQuestionCountdownTimer);
                preQuestionCountdownTimer = null;
            }
        }
    }

    // Track seen questions whenever the current question changes — this fires in 'waiting'
    // phase (when the question is first assigned), covers mid-game shuffles that stay in
    // 'waiting', and serves as a backup for the server-side seen tracking.
    const currentQText = gameState.currentQuestion?.question;
    if (currentQText && currentQText !== previousQuestionText) {
        addSeenQuestion(currentQText);
        previousQuestionText = currentQText;
    }

    // Reset seen-question tracking when a new game starts (countdown = fresh game)
    if (currentPhase === 'countdown' && previousPhase !== 'countdown') {
        previousQuestionText = null;
    }

    // Question music: play from start when question begins, stop when it ends
    if (currentPhase === 'question' && previousPhase !== 'question') {
        startQuestionMusic();
        // Capture leaderboard snapshot before this question's scores arrive
        if (gameState.scores) previousScores = JSON.parse(JSON.stringify(gameState.scores));
    } else if (currentPhase !== 'question' && previousPhase === 'question') {
        stopQuestionMusic();
    }
    previousPhase = currentPhase;

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
        // Show Play Again button for host
        const btnPlayAgain = document.getElementById('btn-play-again');
        if (btnPlayAgain) {
            if (isHost) btnPlayAgain.classList.remove('hidden');
            else btnPlayAgain.classList.add('hidden');
        }
    } else {
        showScreen('game');
        if (isHost) {
            if (hostAsPlayer) {
                // Host plays — show both host controls and player buzzer
                screens.game.classList.add('host-playing');
                hostEls.view.classList.remove('hidden');
                playerEls.view.classList.remove('hidden');
                renderHostView();
                renderPlayerView();
            } else {
                // Host is spectating — show only host controls
                screens.game.classList.remove('host-playing');
                hostEls.view.classList.remove('hidden');
                playerEls.view.classList.add('hidden');
                renderHostView();
            }
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

let preQuestionCountdownTimer = null;

function startPreQuestionCountdown(seconds, onComplete) {
    // Clear any existing countdown
    if (preQuestionCountdownTimer) {
        clearInterval(preQuestionCountdownTimer);
        preQuestionCountdownTimer = null;
    }
    const existing = document.getElementById('pre-q-countdown');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pre-q-countdown';
    overlay.style.cssText = [
        'position:fixed;top:0;left:0;width:100%;height:100%',
        'background:rgba(0,0,0,0.82)',
        'display:flex;flex-direction:column;align-items:center;justify-content:center',
        'z-index:6000;pointer-events:none;font-family:var(--font-main)',
    ].join(';');

    overlay.innerHTML = `
        <div style="color:rgba(255,255,255,0.55);font-size:clamp(0.9rem,2.5vw,1.1rem);font-weight:700;text-transform:uppercase;letter-spacing:3px;margin-bottom:18px;">Next Question</div>
        <div id="pqc-number" style="font-size:clamp(5rem,20vw,9rem);font-weight:900;color:var(--primary);text-shadow:0 0 40px rgba(255,0,85,0.7);line-height:1;">${seconds}</div>
        <div style="width:180px;height:5px;background:rgba(255,255,255,0.15);border-radius:3px;overflow:hidden;margin-top:28px;">
            <div id="pqc-bar" style="height:100%;background:var(--primary);border-radius:3px;width:100%;transition:width ${seconds}s linear;"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Trigger bar drain
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const bar = document.getElementById('pqc-bar');
            if (bar) bar.style.width = '0%';
        });
    });

    let count = seconds;
    preQuestionCountdownTimer = setInterval(() => {
        count--;
        const numEl = document.getElementById('pqc-number');
        if (count <= 0) {
            clearInterval(preQuestionCountdownTimer);
            preQuestionCountdownTimer = null;
            overlay.style.transition = 'opacity 0.25s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 250);
            if (onComplete) onComplete();
        } else {
            if (numEl) {
                numEl.style.animation = 'none';
                numEl.offsetHeight; // reflow
                numEl.style.animation = 'pqcBeat 0.4s ease-out';
                numEl.textContent = count;
            }
        }
    }, 1000);
}

function renderHostView() {
    const { currentQuestion, currentQuestionIndex, totalQuestions, phase, playerBuzzStatus, answeredCount, totalPlayers, isOffTheDome, disconnectedPlayers } = gameState;

    timerRemaining = gameState.timerRemaining || 0;
    timerDuration = gameState.timerDuration || 30;

    // Header
    hostEls.qIndex.textContent = (currentQuestionIndex + 1) || 0;
    hostEls.qTotal.textContent = totalQuestions || 0;
    if (isOffTheDome) {
        hostEls.category.innerHTML = `<span class="off-the-dome-badge">OFF THE DOME</span>`;
    } else {
        hostEls.category.textContent = currentQuestion ? currentQuestion.category : '-';
    }

    // Host card: hidden during question (player view shows it), only shown for answer reveal in result
    const hostCard = hostEls.view.querySelector('.host-card');
    const answerBox = document.getElementById('host-answer-text');
    const answerContainer = answerBox?.parentElement;

    if (phase === 'result') {
        if (hostCard) hostCard.classList.remove('hidden');
        hostEls.question.textContent = currentQuestion?.question || '...';
        if (answerBox) {
            answerBox.textContent = currentQuestion?.answer || '...';
            answerContainer?.classList.remove('hidden-answer');
            answerContainer?.classList.add('revealed');
        }
    } else {
        if (hostCard) hostCard.classList.add('hidden');
    }

    // Phase controls — hide all first
    Object.values(hostEls.phases).forEach(el => { if (el) el.classList.add('hidden'); });

    // Build disconnected players indicator (shown in waiting and result phases)
    const disconnectedList = disconnectedPlayers || [];
    const disconnectedHTML = disconnectedList.length > 0
        ? `<div class="host-disconnected-row"><span class="disconnect-label">Disconnected:</span>${disconnectedList.map(p => `<span class="disconnect-tag">⚡ ${p.name}</span>`).join('')}</div>`
        : '';

    if (phase === 'waiting') {
        // Auto-advance is triggered in renderGameState; show minimal state while server responds
        if (hostEls.phases.waiting) hostEls.phases.waiting.classList.remove('hidden');
        hostEls.buzzArea.innerHTML = `<div class="host-status-pill">Getting ready...</div>${disconnectedHTML}`;
    } else if (phase === 'question') {
        if (hostEls.phases.question) hostEls.phases.question.classList.remove('hidden');

        const timerPct = timerDuration > 0 ? (timerRemaining / timerDuration) * 100 : 0;
        let timerColor = '#228B22'; // forest green
        if (timerPct <= 25) timerColor = 'var(--danger)';

        const buzzedPlayers = (playerBuzzStatus || []).filter(p => p.hasBuzzed);
        const buzzedList = buzzedPlayers.map(p =>
            `<span class="buzzed-tag ${p.hasAnswered ? 'answered' : 'waiting'}">${p.name}</span>`
        ).join('');

        hostEls.buzzArea.innerHTML = `
            <div class="host-timer-row">
                <span class="host-timer-num" style="color:${timerColor}">${timerRemaining}s</span>
                <div class="host-timer-track">
                    <div class="timer-bar" style="width:${timerPct}%;background:${timerColor}"></div>
                </div>
                <span class="host-answered-badge">${answeredCount || 0}/${totalPlayers || 0}</span>
            </div>
            <div class="buzzed-players-list">${buzzedList || '<span class="host-no-answers">Waiting for answers...</span>'}</div>
        `;
    } else if (phase === 'result') {
        if (hostEls.phases.result) hostEls.phases.result.classList.remove('hidden');
        hostEls.buzzArea.innerHTML = disconnectedHTML;
    }

    // Leaderboard
    const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
    const sortedScores = [...(gameState.scores || [])].sort((a, b) => b.score - a.score);
    hostEls.leaderboard.innerHTML = sortedScores.slice(0, 5).map((p, i) => {
        const name = p.name || `Player-${p.socketId?.slice(0, 4) || '?'}`;
        return `<div class="lb-row"><span class="lb-rank">${medals[i]}</span><span class="lb-name">${name}</span><span class="lb-score">${p.score}</span></div>`;
    }).join('');
}

function renderPlayerView() {
    const { currentQuestion, phase, playerBuzzStatus, scores, answeredCount, totalPlayers, isOffTheDome, isFirstOffTheDome } = gameState;
    // Fallback to name match in case socketId changed after reconnect
    const myScoreEntry = (scores || []).find(s => s.socketId === socket.id)
        || (scores || []).find(s => s.name === playerName)
        || { score: 0 };

    // Update timer state
    timerRemaining = gameState.timerRemaining || 0;
    timerDuration = gameState.timerDuration || 30;

    // Get my buzz/answer status
    const myStatus = (playerBuzzStatus || []).find(p => p.socketId === socket.id);
    hasBuzzed = myStatus?.hasBuzzed || false;
    hasAnswered = myStatus?.hasAnswered || false;

    // Show OFF THE DOME announcement for the first OFF THE DOME question
    if (isFirstOffTheDome && phase === 'waiting' && !offTheDomeShown) {
        showOffTheDomeOverlay();
        offTheDomeShown = true;
    }

    // Reset OFF THE DOME shown flag when moving to a new question
    if (!isFirstOffTheDome) {
        offTheDomeShown = false;
    }

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
        // Show OFF THE DOME badge if applicable
        if (isOffTheDome) {
            playerEls.category.innerHTML = `<span class="off-the-dome-badge">OFF THE DOME</span>`;
        } else {
            playerEls.category.textContent = currentQuestion.category || '';
        }
        playerEls.question.textContent = currentQuestion.question || 'Wait for it...';
    } else {
        playerEls.category.textContent = '';
        playerEls.question.textContent = 'Wait for it...';
    }

    // Show timer during question phase
    let timerHTML = '';
    if (phase === 'question') {
        const timerPct = timerDuration > 0 ? (timerRemaining / timerDuration) * 100 : 0;
        let timerColor = '#228B22'; // forest green
        if (timerPct <= 25) timerColor = 'var(--danger)';

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

    // Check if this is a multiple choice question
    const hasChoices = currentQuestion?.choices && currentQuestion.choices.length > 0 && !isOffTheDome;

    // Hide all interactive elements first
    if (choicesEls.section) choicesEls.section.classList.add('hidden');
    if (answerEls.section) answerEls.section.classList.add('hidden');
    playerEls.btnBuzz.style.display = 'none';

    // Buzzer State & Answer Section
    if (phase === 'waiting') {
        // Waiting for question - reset choice cache for incoming question
        lastRenderedQuestionKey = null;
        cachedShuffledChoices = null;
        lastChoiceRenderKey = null;
        selectedChoice = null;
        // Clear the choices grid DOM to prevent stale selected/hover states (especially on mobile)
        if (choicesEls.grid) choicesEls.grid.innerHTML = '';
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.buzzStatus.textContent = "WAITING FOR QUESTION";
        playerEls.buzzStatus.style.color = "#aaa";
        playerEls.btnBuzz.disabled = true;
    } else if (phase === 'question') {
        if (hasAnswered) {
            // Already submitted answer
            playerEls.buzzStatus.classList.remove('hidden');
            playerEls.buzzStatus.textContent = "LOCKED IN!";
            playerEls.buzzStatus.style.color = "var(--success)";
            playerEls.btnBuzz.disabled = true;
        } else if (hasChoices) {
            // Multiple choice mode - show choice buttons
            playerEls.buzzStatus.classList.add('hidden');
            renderMultipleChoiceButtons(currentQuestion.choices);
            if (choicesEls.section) choicesEls.section.classList.remove('hidden');
        } else if (isOffTheDome) {
            // OFF THE DOME mode - show text input directly
            playerEls.buzzStatus.classList.remove('hidden');
            playerEls.buzzStatus.textContent = "TYPE YOUR ANSWER!";
            playerEls.buzzStatus.style.color = "var(--accent)";
            if (answerEls.section) {
                answerEls.section.classList.remove('hidden');
                answerEls.input.focus();
            }
        } else if (hasBuzzed) {
            // Buzzed but haven't answered - show answer input (fallback)
            playerEls.buzzStatus.classList.remove('hidden');
            playerEls.buzzStatus.textContent = "TYPE YOUR ANSWER!";
            playerEls.buzzStatus.style.color = "var(--accent)";
            if (answerEls.section) {
                answerEls.section.classList.remove('hidden');
                answerEls.input.focus();
            }
        } else {
            // Show LOCK IN button (fallback for questions without choices)
            playerEls.buzzStatus.classList.add('hidden');
            playerEls.btnBuzz.disabled = false;
            playerEls.btnBuzz.style.display = 'block';
        }
    } else if (phase === 'result') {
        // Results phase
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.buzzStatus.textContent = "ROUND COMPLETE";
        playerEls.buzzStatus.style.color = "var(--accent)";
        playerEls.btnBuzz.disabled = true;
        selectedChoice = null;
    } else {
        // Other phases
        playerEls.buzzStatus.classList.remove('hidden');
        playerEls.buzzStatus.textContent = "PLEASE WAIT";
        playerEls.buzzStatus.style.color = "#aaa";
        playerEls.btnBuzz.disabled = true;
        selectedChoice = null;
    }
}

function renderMultipleChoiceButtons(choices) {
    if (!choicesEls.grid || !choices) return;

    // Only shuffle once per question
    const questionKey = gameState?.currentQuestion?.question;
    if (questionKey !== lastRenderedQuestionKey) {
        lastRenderedQuestionKey = questionKey;
        cachedShuffledChoices = [...choices].sort(() => Math.random() - 0.5);
    }
    const shuffledChoices = cachedShuffledChoices || choices;

    // Skip full DOM rebuild if nothing visible has changed (prevents click-miss on re-render)
    const renderKey = `${questionKey}|${hasAnswered}|${selectedChoice || ''}`;
    if (renderKey === lastChoiceRenderKey) return;
    lastChoiceRenderKey = renderKey;

    choicesEls.grid.innerHTML = shuffledChoices.map(choice => `
        <button class="choice-btn ${selectedChoice === choice ? 'selected' : ''}"
                data-choice="${choice}"
                ${hasAnswered ? 'disabled' : ''}>
            ${choice}
        </button>
    `).join('');

    choicesEls.grid.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => handleChoiceClick(btn.dataset.choice));
    });
}

function handleChoiceClick(choice) {
    if (hasAnswered) return;

    selectedChoice = choice;

    // Update button styles
    choicesEls.grid.querySelectorAll('.choice-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.choice === choice) {
            btn.classList.add('selected');
        }
    });

    // Submit the answer
    socket.emit('player:submitAnswer', { roomCode: roomCode, answer: choice });
}

function showKickedOverlay() {
    // Disconnect socket so no further events come in
    if (socket) socket.disconnect();

    const overlay = document.createElement('div');
    overlay.id = 'kicked-overlay';
    overlay.innerHTML = `
        <div class="kicked-card">
            <div class="kicked-icon">🚫</div>
            <h2>You have been kicked</h2>
            <p>The host has removed you from this game.</p>
            <p class="kicked-note">You can rejoin using the room code.</p>
            <button class="kicked-btn" onclick="window.location.href='join.html'">Join Another Game</button>
        </div>
    `;
    overlay.style.cssText = [
        'position:fixed;top:0;left:0;width:100%;height:100%',
        'background:rgba(0,0,0,0.96)',
        'display:flex;align-items:center;justify-content:center',
        'z-index:9999;font-family:var(--font-main)',
        'padding:30px;box-sizing:border-box'
    ].join(';');
    document.body.appendChild(overlay);
}

function showOffTheDomeOverlay() {
    // Remove any existing overlay
    const existing = document.getElementById('off-the-dome-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'off-the-dome-overlay';
    overlay.className = 'off-the-dome-overlay';
    overlay.innerHTML = `
        <div class="off-the-dome-text">OFF THE DOME</div>
        <div class="off-the-dome-subtitle">${offTheDomeCount} question${offTheDomeCount !== 1 ? 's' : ''} — type your answers!</div>
    `;
    document.body.appendChild(overlay);

    // Fade out after 3 seconds
    setTimeout(() => {
        overlay.style.transition = 'opacity 0.5s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}

function renderEndScreen() {
    const podium = document.getElementById('winner-podium');
    if (!podium || !gameState.scores) return;

    const sorted = [...gameState.scores].sort((a, b) => b.score - a.score);
    const medals = ['🏆', '🥈', '🥉'];

    podium.innerHTML = sorted.map((p, i) => {
        const name = p.name || `Player-${p.socketId?.slice(0, 4) || '?'}`;
        const medal = medals[i] || `${i + 1}.`;
        return `
            <div class="podium-entry" style="animation-delay:${i * 80}ms">
                <span class="podium-rank">${medal}</span>
                <span class="podium-name">${name}</span>
                <span class="podium-score">${p.score} pts</span>
            </div>
        `;
    }).join('');
}

async function showPlayAgainModal() {
    await fetchCategoryCounts();
    const existing = document.getElementById('play-again-modal');
    if (existing) existing.remove();

    // Pre-fill from last session settings
    let lastSettings = {};
    try { lastSettings = JSON.parse(sessionStorage.getItem('buzzin_settings') || '{}'); } catch (e) {}
    const cats = lastSettings.categories || [];
    const qCount = lastSettings.questionCount || 10;
    const timer = lastSettings.timerDuration || 30;
    const bonus = lastSettings.bonusFirstCorrect !== false;
    const otdCount = lastSettings.offTheDomeCount ?? 3;

    const CATEGORIES = [
        "General Knowledge","Science","Movies & TV","Music","Sports",
        "History","Geography","Pop Culture","Games","Random"
    ];

    const initialMax = cappedMax(totalQuestionsForCategories(cats.length ? cats : CATEGORIES));
    const clampedQCount = Math.min(qCount, initialMax);

    const modal = document.createElement('div');
    modal.id = 'play-again-modal';
    modal.className = 'play-again-modal';
    modal.innerHTML = `
        <div class="play-again-card">
            <h2>Play Again</h2>
            <p style="color:rgba(255,255,255,0.6);margin:0 0 20px;font-size:0.9rem;">Same players, new game</p>
            <div class="pa-section">
                <label class="pa-label">Categories:</label>
                <div class="pa-cat-grid">
                    ${CATEGORIES.map(c => `
                        <label class="pa-cat-item">
                            <input type="checkbox" value="${c}" ${cats.includes(c) ? 'checked' : ''}>
                            <span>${c}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="pa-section">
                <label class="pa-label">Questions: <span id="pa-q-val">${clampedQCount}</span></label>
                <input type="range" id="pa-q-slider" min="5" max="${initialMax}" value="${clampedQCount}" step="1" style="width:100%">
            </div>
            <div class="pa-section">
                <label class="pa-label">OFF THE DOME: <span id="pa-otd-val">${Math.min(otdCount, clampedQCount)}</span> free-text (type-in) questions</label>
                <input type="range" id="pa-otd-slider" min="0" max="${clampedQCount}" value="${Math.min(otdCount, clampedQCount)}" step="1" style="width:100%">
            </div>
            <div class="pa-section">
                <label class="pa-label">Timer: <span id="pa-t-val">${timer}</span>s per question</label>
                <input type="range" id="pa-t-slider" min="5" max="120" value="${timer}" step="5" style="width:100%">
            </div>
            <div class="pa-section">
                <label class="pa-toggle">
                    <input type="checkbox" id="pa-bonus" ${bonus ? 'checked' : ''}>
                    <span>First correct +50 bonus</span>
                </label>
            </div>
            <div class="pa-actions">
                <button id="pa-cancel" class="btn-secondary">Cancel</button>
                <button id="pa-start" class="btn-primary">Start Game!</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const paQSlider = modal.querySelector('#pa-q-slider');
    const paQVal = modal.querySelector('#pa-q-val');

    function updatePaSliderMax() {
        const selectedCats = [...modal.querySelectorAll('.pa-cat-item input:checked')].map(cb => cb.value);
        const rawTotal = selectedCats.length ? totalQuestionsForCategories(selectedCats) : 5;
        const max = cappedMax(rawTotal);
        paQSlider.max = max;
        if (parseInt(paQSlider.value) > max) {
            paQSlider.value = max;
            paQVal.textContent = max;
        }
        // Also clamp OTD slider max to current question count
        const paOtdSlider = modal.querySelector('#pa-otd-slider');
        const paOtdVal = modal.querySelector('#pa-otd-val');
        if (paOtdSlider) {
            const qVal = parseInt(paQSlider.value);
            paOtdSlider.max = qVal;
            if (parseInt(paOtdSlider.value) > qVal) {
                paOtdSlider.value = qVal;
                if (paOtdVal) paOtdVal.textContent = qVal;
            }
        }
    }

    paQSlider.addEventListener('input', (e) => {
        paQVal.textContent = e.target.value;
        // Cap OTD slider to question count
        const paOtdSlider = modal.querySelector('#pa-otd-slider');
        const paOtdVal = modal.querySelector('#pa-otd-val');
        if (paOtdSlider) {
            paOtdSlider.max = e.target.value;
            if (parseInt(paOtdSlider.value) > parseInt(e.target.value)) {
                paOtdSlider.value = e.target.value;
                if (paOtdVal) paOtdVal.textContent = e.target.value;
            }
        }
    });
    modal.querySelector('#pa-otd-slider').addEventListener('input', (e) => {
        modal.querySelector('#pa-otd-val').textContent = e.target.value;
    });
    modal.querySelector('.pa-cat-grid').addEventListener('change', updatePaSliderMax);
    modal.querySelector('#pa-t-slider').addEventListener('input', (e) => {
        modal.querySelector('#pa-t-val').textContent = e.target.value;
    });

    modal.querySelector('#pa-cancel').addEventListener('click', () => modal.remove());

    modal.querySelector('#pa-start').addEventListener('click', () => {
        const selectedCats = [...modal.querySelectorAll('.pa-cat-item input:checked')].map(cb => cb.value);
        if (selectedCats.length === 0) {
            alert('Please select at least one category.');
            return;
        }
        const newQCount = parseInt(modal.querySelector('#pa-q-slider').value);
        const newOtdCount = parseInt(modal.querySelector('#pa-otd-slider').value);
        const newTimer = parseInt(modal.querySelector('#pa-t-slider').value);
        const newBonus = modal.querySelector('#pa-bonus').checked;

        // Save updated settings
        sessionStorage.setItem('buzzin_settings', JSON.stringify({
            ...lastSettings,
            categories: selectedCats,
            questionCount: newQCount,
            offTheDomeCount: newOtdCount,
            timerDuration: newTimer,
            bonusFirstCorrect: newBonus
        }));

        socket.emit('host:restartGame', {
            roomCode,
            categories: selectedCats,
            questionCount: newQCount,
            offTheDomeCount: newOtdCount,
            timerDuration: newTimer,
            bonusFirstCorrect: newBonus,
            seenQuestions: getSeenQuestions()
        });

        modal.remove();
    });
}

function showPauseOverlay() {
    if (document.getElementById('pause-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.innerHTML = `
        <div class="pause-content">
            <div class="pause-icon">⏸️</div>
            <h2>GAME PAUSED</h2>
            ${isHost
                ? `<p style="margin-bottom:24px;color:rgba(255,255,255,0.7)">Game is paused. Resume when ready.</p>
                   <button id="pause-resume-btn" style="
                       padding: 14px 40px;
                       font-size: 1.1rem;
                       font-weight: 800;
                       letter-spacing: 2px;
                       text-transform: uppercase;
                       background: linear-gradient(45deg, #ff0055, #ff4444);
                       color: white;
                       border: none;
                       border-radius: 50px;
                       cursor: pointer;
                       box-shadow: 0 4px 20px rgba(255,0,85,0.4);
                   ">&#x25B6; RESUME GAME</button>`
                : `<p>Waiting for host to resume...</p>`
            }
        </div>
    `;
    document.body.appendChild(overlay);

    if (isHost) {
        document.getElementById('pause-resume-btn')?.addEventListener('click', () => {
            socket.emit('host:resumeGame', { roomCode });
        });
    }
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
    } else if (event.type === 'player_reconnected') {
        showGlobalToast(`${event.playerName} reconnected!`, 'success');
    } else if (event.type === 'player_disconnected') {
        showGlobalToast(`${event.playerName} disconnected`, 'warning');
    }
}

function showResultsOverlay(event) {
    const existingOverlay = document.getElementById('results-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'results-overlay';
    overlay.className = 'results-overlay';

    // Build results list — always show all players, even those who didn't answer
    const allPlayers = gameState?.scores || [];
    const resultsMap = {};
    (event.results || []).forEach(r => { resultsMap[r.name] = r; });

    const allResults = [
        ...(event.results || []),
        ...allPlayers
            .filter(p => !resultsMap[p.name])
            .map(p => ({ name: p.name, answer: null, isCorrect: false }))
    ];

    const resultsHTML = allResults.map(r => {
        let itemClass = r.isCorrect ? 'correct' : 'wrong';
        if (r.isFirstCorrect) itemClass += ' first';
        const answerText = r.answer ? r.answer : '<em style="opacity:0.5">no answer</em>';
        let badge = '';
        if (r.isFirstCorrect) {
            badge = `<span class="first-badge">1ST +${r.points || 150}</span>`;
        } else if (r.isCorrect) {
            badge = `<span class="correct-badge">+${r.points || 100}</span>`;
        } else {
            badge = `<span class="wrong-badge">✗</span>`;
        }
        return `
            <div class="result-item ${itemClass}">
                <span class="result-name">${r.name}</span>
                <span class="result-answer">${answerText}</span>
                ${badge}
            </div>
        `;
    }).join('');

    // Leaderboard with rank-change animation
    const currentScores = [...(gameState?.scores || [])].sort((a, b) => b.score - a.score);
    const prevScoreMap = {};
    (previousScores || []).forEach(p => { prevScoreMap[p.name] = p.score; });
    const prevRankMap = {};
    [...(previousScores || [])].sort((a, b) => b.score - a.score)
        .forEach((p, i) => { prevRankMap[p.name] = i + 1; });
    const medals = ['🥇', '🥈', '🥉'];

    const leaderboardHTML = currentScores.slice(0, 8).map((p, i) => {
        const newRank = i + 1;
        const oldRank = prevRankMap[p.name] ?? newRank;
        const rankDiff = oldRank - newRank; // positive = moved up
        const delta = p.score - (prevScoreMap[p.name] ?? p.score);
        const rank = medals[i] || `${newRank}.`;
        const deltaEl = delta > 0 ? `<span class="lb-result-delta">+${delta}</span>` : '';
        let rankChangeEl;
        if (rankDiff > 0) {
            rankChangeEl = `<span class="lb-rank-change up">↑${rankDiff}</span>`;
        } else if (rankDiff < 0) {
            rankChangeEl = `<span class="lb-rank-change down">↓${Math.abs(rankDiff)}</span>`;
        } else {
            rankChangeEl = `<span class="lb-rank-change same">—</span>`;
        }
        const rowClasses = ['lb-result-row'];
        if (delta > 0) rowClasses.push('gained');
        if (rankDiff !== 0) rowClasses.push('rank-changed');
        return `
            <div class="${rowClasses.join(' ')}"
                 style="--rank-diff:${rankDiff}; animation-delay:${i * 65}ms">
                <span class="lb-result-rank">${rank}</span>
                ${rankChangeEl}
                <span class="lb-result-name">${p.name}</span>
                <span class="lb-result-score">${p.score}</span>
                ${deltaEl}
            </div>
        `;
    }).join('');

    const continueHint = isHost
        ? `<div class="results-continue-hint host">▶ Tap anywhere to continue</div>`
        : `<div class="results-continue-hint">Waiting for host...</div>`;

    overlay.innerHTML = `
        <div class="results-card" id="results-card-inner">
            <h2>Round Results</h2>
            <div class="correct-answer">
                Correct Answer: <strong>${event.correctAnswer || 'N/A'}</strong>
            </div>
            <div class="results-list">
                ${resultsHTML || '<div class="result-item" style="justify-content:center;color:#888;">No answers submitted</div>'}
            </div>
            ${currentScores.length > 0 ? `
            <div class="results-leaderboard">
                <div class="results-lb-title">Standings</div>
                ${leaderboardHTML}
            </div>` : ''}
            ${continueHint}
        </div>
    `;

    document.body.appendChild(overlay);

    // Temporarily allow overflow so rank-change animations render outside card bounds
    const card = overlay.querySelector('#results-card-inner');
    if (card) {
        card.classList.add('animating-lb');
        const animDuration = Math.min(currentScores.length, 8) * 65 + 900;
        setTimeout(() => card.classList.remove('animating-lb'), animDuration);
    }

    // Host: tap overlay to dismiss — NEXT QUESTION button advances the round
    if (isHost) {
        const hint = overlay.querySelector('.results-tap-hint');
        if (hint) hint.textContent = 'Tap to dismiss — then click NEXT QUESTION';
        overlay.addEventListener('click', () => {
            overlay.style.transition = 'opacity 0.2s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 200);
        });
    }
    // Non-hosts: overlay auto-dismisses when phase changes away from "result"
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

// Start — prefetch category counts so they're ready before Play Again modal opens
fetchCategoryCounts();
init();


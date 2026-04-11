// buzzin.js

// --- Game State & Variables ---
let socket;
let roomCode = null;
let playerName = null;
let isHost = false;
let hostAsPlayer = false; // If false, host is spectate/admin only (no score, no answers)
let offTheDomeCount = 3; // Number of free-text (OFF THE DOME) questions
let otdAtEnd = false;    // false = OTD randomly distributed (default), true = OTD at end of game
let showOtdCategory = true; // Show category label alongside OFF THE DOME badge by default
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
  "Random",
  "Flags"
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

// Track OFF THE DOME state — use question index so consecutive OTD questions each get their own overlay
let offTheDomeShownForIndex = -1;
// Track reconnect retries for "room not found" while in-game
let reconnectAttempts = 0;
let selectedChoice = null;

// Cache shuffled choices per question to prevent re-shuffling every timer tick
let lastRenderedQuestionKey = null;
let cachedShuffledChoices = null;
let lastChoiceRenderKey = null; // prevent full DOM rebuild on every timer tick

// --- Leaderboard tracking ---
let previousScores = null;
let pendingRoundResults = null; // Stored until game:state delivers updated scores

// --- End-of-game flagged questions summary ---
let flaggedSummaryShown = false; // prevent re-showing if game:state fires multiple times at end

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

// --- Music preference (per device, localStorage) ---
let musicEnabled = localStorage.getItem('buzzin_music') === 'true'; // default off

// --- Countdown preference (game setting, read from sessionStorage in restoreSettingsFromStorage) ---
let countdownEnabled = true; // default on; overridden by sessionStorage buzzin_settings

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
    qCounter: document.getElementById('player-q-counter'),
    roomCode: document.getElementById('player-room-code'),
    category: document.getElementById('player-category'),
    question: document.getElementById('player-question-text'),
    btnBuzz: document.getElementById('btn-buzz'),
    buzzStatus: document.getElementById('buzzer-status'),
    feedback: document.getElementById('player-feedback'),
    feedbackText: document.getElementById('feedback-text')
};

// --- Initialization ---
function init() {
    // Parse URL params — only trust room code from URL, never isHost
    // (host status is exclusively determined by the server; reading it from a
    //  user-editable URL would allow anyone to spoof admin controls)
    const urlParams = new URLSearchParams(window.location.search);
    roomCode = urlParams.get('room');
    playerName = urlParams.get('name');
    // isHost intentionally NOT read from URL

    // Strip params from the URL bar so the address can't be shared with host=true
    if (urlParams.has('host') || urlParams.has('name')) {
      urlParams.delete('host');
      urlParams.delete('name');
      const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : '';
      window.history.replaceState({}, '', `${window.location.pathname}${cleanSearch}`);
    }

    // One-time redirect info written by setup.html / join.html — read it and clear it
    const redirectInfo = sessionStorage.getItem('buzzin_redirect');
    if (redirectInfo) {
        try {
            const info = JSON.parse(redirectInfo);
            roomCode = roomCode || info.room;
            playerName = playerName || info.name;
            // Only set isHost from the trusted one-time redirect (NOT from URL params)
            if (info.host === true) isHost = true;
            sessionStorage.removeItem('buzzin_redirect');
        } catch (e) {
            console.error('Failed to parse redirect info:', e);
        }
    }

    // Persistent session fallback — used when the page is refreshed after buzzin_redirect
    // was already consumed. Allows the player to rejoin without going back to join.html.
    if (!playerName || !roomCode) {
        const sessionStr = sessionStorage.getItem('buzzin_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                roomCode = roomCode || session.room;
                playerName = playerName || session.name;
                // isHost NOT restored here — server grants it via name-match reconnection
            } catch (e) {}
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
        reconnectionAttempts: 50
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

        // Restore countdownEnabled (set by setup.html or Play Again modal)
        if (settings.countdownEnabled !== undefined) {
            countdownEnabled = settings.countdownEnabled;
        }

        // Restore otdAtEnd (set by setup.html or Play Again modal)
        if (settings.otdAtEnd !== undefined) {
            otdAtEnd = settings.otdAtEnd;
        }

        // Restore showOtdCategory
        if (settings.showOtdCategory !== undefined) {
            showOtdCategory = settings.showOtdCategory;
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

        // Periodic keepalive: prevents room from being destroyed during idle periods
        if (window._keepaliveInterval) clearInterval(window._keepaliveInterval);
        window._keepaliveInterval = setInterval(() => {
            if (roomCode && socket.connected) {
                socket.emit('heartbeat', { roomCode });
            }
        }, 45000);
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
        reconnectAttempts = 0;
        const ro = document.getElementById('reconnecting-overlay');
        if (ro) ro.remove();
        // Let the server determine host status from name-based reconnection state.
        // Pass current isHost as a hint; server ignores it if there's already an active host.
        if (roomCode && playerName) {
            socket.emit('player:joinRoom', { roomCode, name: playerName, isHost });
        }
    });
    
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        // Show error but don't block UI
    });
    
    socket.on('room:error', (message) => {
        console.error('Room error:', message);

        // If kicked, show kicked overlay
        if (message.toLowerCase().includes('kick')) {
            showKickedOverlay();
            return;
        }

        if (message.includes('not found') || message.includes('Invalid') || message.includes('Unable')) {
            // If we were actively in a game, retry before giving up
            const wasInGame = gameState && gameState.phase && !['lobby', 'end'].includes(gameState.phase);
            if (wasInGame && roomCode && playerName && reconnectAttempts < 4) {
                reconnectAttempts++;
                let overlay = document.getElementById('reconnecting-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'reconnecting-overlay';
                    overlay.style.cssText = [
                        'position:fixed;top:0;left:0;width:100%;height:100%',
                        'background:rgba(0,0,0,0.88)',
                        'display:flex;align-items:center;justify-content:center',
                        'z-index:9000;font-family:var(--font-main)',
                        'animation:fadeIn 0.3s ease-out',
                    ].join(';');
                    document.body.appendChild(overlay);
                }
                overlay.innerHTML = `
                    <div style="text-align:center;padding:40px;">
                        <div style="font-size:2.5rem;margin-bottom:16px;">⚡</div>
                        <div style="color:white;font-size:1.3rem;font-weight:700;margin-bottom:8px;">Connection Lost</div>
                        <div style="color:rgba(255,255,255,0.6);font-size:0.95rem;margin-bottom:28px;">Reconnecting... (${reconnectAttempts}/4)</div>
                        <button onclick="window.location.href='../../index.html'" style="padding:12px 28px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:10px;color:rgba(255,255,255,0.7);font-size:0.9rem;cursor:pointer;font-family:var(--font-main);">Go to Main Menu</button>
                    </div>
                `;
                setTimeout(() => {
                    socket.emit('player:joinRoom', { roomCode, name: playerName, isHost });
                }, 2500);
                return;
            }
            // Exceeded retries or not in game — show error and redirect
            const ro = document.getElementById('reconnecting-overlay');
            if (ro) ro.remove();
            reconnectAttempts = 0;
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(200,0,0,0.92);color:white;padding:15px 30px;border-radius:10px;z-index:9500;font-family:var(--font-main);';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
            setTimeout(() => { window.location.href = '../../index.html'; }, 3000);
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(200,0,0,0.92);color:white;padding:15px 30px;border-radius:10px;z-index:9500;font-family:var(--font-main);';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    });

    // Generic room state updates (lobby phase)
    socket.on('room:state', (rs) => {
        console.log('Room state received:', rs);
        roomState = rs; // Store for later use

        // Always sync isHost and room code FIRST — must happen even during active games
        // so host demotion (when original host rejoins) takes effect immediately.
        const meInRoom = rs.players.find(p => p.socketId === socket.id);
        if (meInRoom) {
            const wasHost = isHost;
            isHost = meInRoom.isHost === true;
            if (isHost !== wasHost) {
                updateAdminMenuVisibility();
                if (gameState) renderGameState();
                if (!isHost && wasHost) {
                    // Demoted — show burgundy notification
                    showHostChangeToast('You are no longer the host.', '#7B2D3E');
                }
            }
            // Persist the confirmed session so a page refresh can reconnect without
            // going back to join.html (buzzin_redirect is one-time and already cleared).
            try {
                sessionStorage.setItem('buzzin_session', JSON.stringify({
                    room: rs.code || roomCode,
                    name: meInRoom.name || playerName
                }));
            } catch (e) {}
        }

        // Keep player room code display current
        const playerRoomCodeEl = document.getElementById('player-room-code');
        if (playerRoomCodeEl) {
            playerRoomCodeEl.textContent = rs.code || roomCode || '';
        }

        // If a game is actively running, stop here — game:state handles all in-game rendering.
        if (gameState && gameState.phase !== 'lobby' && gameState.phase !== 'end') {
            return;
        }

        // If room is in-progress (reconnecting player starting fresh), show loading
        if (rs.phase === 'in-progress') {
            console.log('Room is in-progress, waiting for game state...');
            showScreen('lobby');
            lobbyEls.code.textContent = rs.code || roomCode || '----';
            lobbyEls.list.innerHTML = '<div class="player-tag">Game in progress, loading...</div>';
            return;
        }

        // Otherwise, show lobby
        updateLobbyUI(rs);

        console.log('I am host:', isHost);
        updateHostControlsVisibility();
    });

    // Player kicked event
    socket.on('player:kicked', () => {
        showKickedOverlay();
    });

    // Host transferred to this player (original host left)
    socket.on('host:transferred', (data) => {
        isHost = true;
        updateAdminMenuVisibility();
        if (gameState) renderGameState();
        showHostChangeToast('You are now the host!', '#2D6A4F'); // forest green
    });

    // Original host reclaimed host status after reconnecting
    socket.on('host:restored', (data) => {
        // Ignore stale events from a different room/socket race.
        if (data?.roomCode && roomCode && data.roomCode !== roomCode) return;
        isHost = true;
        updateAdminMenuVisibility();
        if (gameState) renderGameState();
        showHostChangeToast('Host status restored.', '#2D6A4F');
    });

    // Host session moved to another device (IP-verified device switch)
    socket.on('host:deviceChanged', (data) => {
        if (data?.roomCode && roomCode && data.roomCode !== roomCode) return;
        isHost = false;
        updateAdminMenuVisibility();
        // Show a persistent banner — old device's controls are now locked out
        let banner = document.getElementById('device-changed-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'device-changed-banner';
            banner.style.cssText = [
                'position:fixed;top:0;left:0;right:0;z-index:9999',
                'background:#c0392b;color:#fff;text-align:center',
                'padding:14px 20px;font-weight:700;font-size:0.95rem',
                'font-family:var(--font-main);',
            ].join(';');
            banner.innerHTML = 'Host session moved to another device. <button id="device-changed-rejoin" style="margin-left:12px;background:#fff;color:#c0392b;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:700;">Rejoin</button>';
            document.body.appendChild(banner);
            document.getElementById('device-changed-rejoin')?.addEventListener('click', () => {
                if (roomCode && playerName) {
                    socket.emit('player:joinRoom', { roomCode, name: playerName, isHost: true });
                }
            });
        }
    });

    // Regular player session moved to another device
    socket.on('room:deviceChanged', (data) => {
        if (data?.roomCode && roomCode && data.roomCode !== roomCode) return;
        showHostChangeToast('Session moved to another device.', '#555');
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
        // Clear reconnecting overlay on successful state reception
        if (reconnectAttempts > 0) {
            reconnectAttempts = 0;
            const ro = document.getElementById('reconnecting-overlay');
            if (ro) ro.remove();
        }
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
    kickPlayer: document.getElementById('admin-kick-player'),
    shuffleQuestions: document.getElementById('admin-shuffle-questions'),
    flagQuestion: document.getElementById('admin-flag-question'),
    pauseGame: document.getElementById('admin-pause-game'),
    newGame: document.getElementById('admin-new-game'),
    endGame: document.getElementById('admin-end-game')
};

// --- Kick Player Modal ---
function showKickPlayerModal() {
    // Build list of kickable players (everyone except the host)
    // Use roomState which is always current; fall back to gameState if needed
    const allPlayers = roomState?.players || gameState?.players || [];
    const players = allPlayers.filter(p => !p.isHost && p.socketId !== socket.id);
    if (!players.length) {
        showHostChangeToast('No players to kick.', '#555');
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'kick-player-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9600;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#1a1a2e;border-radius:16px;padding:24px;min-width:280px;max-width:380px;width:90%;font-family:var(--font-main);';

    const title = document.createElement('div');
    title.style.cssText = 'color:#fff;font-size:1.1rem;font-weight:700;margin-bottom:16px;text-align:center;';
    title.textContent = 'Kick Player';
    modal.appendChild(title);

    players.forEach(p => {
        const row = document.createElement('button');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;background:#2a2a4a;border:none;border-radius:10px;padding:12px 16px;margin-bottom:8px;color:#fff;font-size:1rem;cursor:pointer;';
        row.innerHTML = `<span>${p.name}</span><span style="color:#e74c3c;font-weight:700;">Kick ✕</span>`;
        row.addEventListener('click', () => {
            socket.emit('host:kickPlayer', { roomCode, socketId: p.socketId });
            overlay.remove();
        });
        modal.appendChild(row);
    });

    const cancel = document.createElement('button');
    cancel.style.cssText = 'display:block;width:100%;margin-top:8px;background:transparent;border:1px solid #555;border-radius:10px;padding:10px;color:#aaa;font-size:0.9rem;cursor:pointer;';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', () => overlay.remove());
    modal.appendChild(cancel);

    overlay.appendChild(modal);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

// --- UI Listeners ---
function showHostChangeToast(message, bgColor) {
    const toast = document.createElement('div');
    toast.style.cssText = [
        'position:fixed;top:20px;left:50%;transform:translateX(-50%)',
        `background:${bgColor};color:white`,
        'padding:12px 24px;border-radius:12px',
        'font-size:0.9rem;font-weight:700;z-index:9500',
        'font-family:var(--font-main);animation:fadeIn 0.3s ease-out',
    ].join(';');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

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
            let otdTimerDurationValue = 60;
            let bonusFirstCorrect = true;
            let hardMode = false;
            try {
                const settings = JSON.parse(sessionStorage.getItem('buzzin_settings') || '{}');
                if (settings.categories && settings.categories.length > 0) categories = settings.categories;
                if (settings.questionCount) questionCount = settings.questionCount;
                if (settings.timerDuration) timerDurationValue = settings.timerDuration;
                if (settings.otdTimerDuration) otdTimerDurationValue = settings.otdTimerDuration;
                bonusFirstCorrect = settings.bonusFirstCorrect !== false;
                hostAsPlayer = settings.hostAsPlayer === true;
                offTheDomeCount = settings.offTheDomeCount ?? 3;
                otdAtEnd = settings.otdAtEnd === true;
                hardMode = settings.hardMode === true;
            } catch (e) {}

            btn.disabled = true;
            btn.textContent = 'Starting...';

            socket.emit('host:startGame', {
                roomCode,
                gameType: 'buzzin',
                categories,
                questionCount,
                timerDuration: timerDurationValue,
                otdTimerDuration: otdTimerDurationValue,
                bonusFirstCorrect,
                hostAsPlayer,
                offTheDomeCount,
                otdAtEnd,
                hardMode,
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
            sessionStorage.removeItem('buzzin_session');
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

    // Quit game button (players only)
    const btnQuit = document.getElementById('btn-quit-game');
    if (btnQuit) {
        btnQuit.addEventListener('click', () => {
            if (!confirm('Quit the game? Your score is saved and you can rejoin with the same name.')) return;
            if (socket && roomCode) {
                socket.emit('player:quit', { roomCode });
            }
            // Navigate to join page with room code pre-filled
            window.location.href = `join.html?room=${encodeURIComponent(roomCode || '')}`;
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

    // Kick Player (works in lobby and during game)
    if (adminMenuEls.kickPlayer) {
        adminMenuEls.kickPlayer.addEventListener('click', () => {
            closeAdminMenu();
            showKickPlayerModal();
        });
    }

    // Shuffle Questions
    if (adminMenuEls.shuffleQuestions) {
        adminMenuEls.shuffleQuestions.addEventListener('click', () => {
            if (confirm('Shuffle questions? The current question and all remaining questions will be reshuffled into a new order.')) {
                socket.emit('host:shuffleQuestions', { roomCode: roomCode });
                closeAdminMenu();
            }
        });
    }

    // Flag Question (no score)
    if (adminMenuEls.flagQuestion) {
        adminMenuEls.flagQuestion.addEventListener('click', () => {
            if (confirm('Flag this question as bad? No scores will be counted and the game will move to the next question.')) {
                socket.emit('host:flagQuestion', { roomCode: roomCode });
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
                // Allow shuffle during waiting/question/result/paused phases.
                const canShuffle = ['waiting', 'question', 'result', 'paused'].includes(gameState.phase);
                adminMenuEls.shuffleQuestions.disabled = !canShuffle;
                adminMenuEls.shuffleQuestions.style.opacity = canShuffle ? '1' : '0.4';
            }
            if (adminMenuEls.flagQuestion) {
                // Allow flagging during any active gameplay phase
                const canFlag = ['waiting', 'question', 'result', 'paused'].includes(gameState.phase);
                adminMenuEls.flagQuestion.disabled = !canFlag;
                adminMenuEls.flagQuestion.style.opacity = canFlag ? '1' : '0.4';
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
    ['off-the-dome-overlay', 'play-again-modal', 'kicked-overlay',
     'player-answered-list', 'player-image-display', 'host-image-display',
     'flagged-summary-overlay', 'void-round-toast'].forEach(id => {
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

    // Dismiss results overlay whenever leaving the 'result' phase (covers end-of-game too)
    if (previousPhase === 'result' && currentPhase !== 'result') {
        const ro = document.getElementById('results-overlay');
        if (ro) {
            ro.style.transition = 'opacity 0.25s ease-out';
            ro.style.opacity = '0';
            setTimeout(() => { if (ro.parentNode) ro.remove(); }, 250);
        }
    }

    // Start pre-question countdown when entering 'waiting' from result or question phase
    // (covers normal next-question AND shuffle-during-question scenarios)
    if (currentPhase === 'waiting' &&
        (previousPhase === 'result' || previousPhase === 'question' || previousPhase === 'paused')) {
        if (countdownEnabled) {
            startPreQuestionCountdown(3, () => {
                if (isHost) socket.emit('host:showQuestion', { roomCode });
            }, gameState.isOffTheDome);
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
        // Shuffle during waiting phase: same phase but a new question arrived — trigger countdown
        if (currentPhase === 'waiting' && previousPhase === 'waiting') {
            if (countdownEnabled) {
                startPreQuestionCountdown(3, () => {
                    if (isHost) socket.emit('host:showQuestion', { roomCode });
                }, gameState.isOffTheDome);
            } else if (isHost) {
                socket.emit('host:showQuestion', { roomCode });
            }
        }
        previousQuestionText = currentQText;
    }

    // Reset seen-question tracking when a new game starts (countdown = fresh game)
    if (currentPhase === 'countdown' && previousPhase !== 'countdown') {
        previousQuestionText = null;
        offTheDomeShownForIndex = -1;
        flaggedSummaryShown = false;
        // Clean up any stale overlays from the previous game
        ['results-overlay', 'pause-overlay', 'off-the-dome-overlay', 'pre-q-countdown'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        if (preQuestionCountdownTimer) {
            clearInterval(preQuestionCountdownTimer);
            preQuestionCountdownTimer = null;
        }
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

    // Quit button: show for non-host players during active game, hide otherwise
    const btnQuitGame = document.getElementById('btn-quit-game');
    if (btnQuitGame) {
        const activePhases = ['waiting', 'question', 'result', 'paused'];
        if (!isHost && activePhases.includes(gameState.phase)) {
            btnQuitGame.classList.remove('hidden');
        } else {
            btnQuitGame.classList.add('hidden');
        }
    }

    // Keep player room code visible
    const playerRoomCodeEl = document.getElementById('player-room-code');
    if (playerRoomCodeEl && roomCode) {
        playerRoomCodeEl.textContent = roomCode;
    }

    // Switch screens based on phase
    if (gameState.phase === 'lobby') {
        showScreen('lobby');
    } else if (gameState.phase === 'countdown') {
        showScreen('game');
        renderCountdown();
    } else if (gameState.phase === 'end') {
        const flagged = gameState.flaggedQuestions || [];
        if (flagged.length > 0 && !flaggedSummaryShown) {
            flaggedSummaryShown = true;
            // Show flagged questions summary first; render end screen only after dismissal
            showFlaggedQuestionsSummary(flagged, () => {
                showScreen('end');
                renderEndScreen();
                const btnPlayAgain = document.getElementById('btn-play-again');
                if (btnPlayAgain) {
                    if (isHost) btnPlayAgain.classList.remove('hidden');
                    else btnPlayAgain.classList.add('hidden');
                }
            });
        } else {
            // Guard: if the flagged-summary overlay is still visible (e.g. game:state fired again
            // before the user tapped through it), don't call showScreen('end') — that would remove
            // the overlay. The overlay's onDismiss callback will render the end screen when dismissed.
            if (!document.getElementById('flagged-summary-overlay')) {
                showScreen('end');
                renderEndScreen();
                const btnPlayAgain = document.getElementById('btn-play-again');
                if (btnPlayAgain) {
                    if (isHost) btnPlayAgain.classList.remove('hidden');
                    else btnPlayAgain.classList.add('hidden');
                }
            }
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
    const seconds = gameState.countdownSeconds || 0;

    let overlay = document.getElementById('countdown-display');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'countdown-display';
        overlay.style.cssText = [
            'position:fixed;top:0;left:0;width:100%;height:100%',
            'background:rgba(0,0,0,0.93)',
            'display:flex;flex-direction:column;align-items:center;justify-content:center',
            'z-index:7000;pointer-events:none;font-family:var(--font-main)',
            'animation:fadeIn 0.4s ease-out',
        ].join(';');
        overlay.innerHTML = `
            <div style="color:rgba(255,255,255,0.4);font-size:clamp(0.75rem,2vw,0.95rem);font-weight:700;text-transform:uppercase;letter-spacing:4px;margin-bottom:14px;">Get Ready</div>
            <div id="countdown-number" style="font-size:clamp(6rem,20vw,10rem);font-weight:900;color:var(--primary);text-shadow:0 0 60px rgba(255,0,85,0.85);line-height:1;"></div>
        `;
        document.body.appendChild(overlay);
    }

    const numEl = document.getElementById('countdown-number');
    if (!numEl) return;

    if (seconds > 0) {
        overlay.style.display = 'flex';
        numEl.style.animation = 'none';
        numEl.offsetHeight; // reflow
        numEl.style.animation = 'pqcBeat 0.4s ease-out';
        numEl.textContent = seconds;
    } else {
        overlay.style.transition = 'opacity 0.3s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300);
    }
}

let preQuestionCountdownTimer = null;

function startPreQuestionCountdown(seconds, onComplete, compactMode = false) {
    // Clear any existing countdown
    if (preQuestionCountdownTimer) {
        clearInterval(preQuestionCountdownTimer);
        preQuestionCountdownTimer = null;
    }
    const existing = document.getElementById('pre-q-countdown');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pre-q-countdown';

    if (compactMode) {
        // Compact pill at top — sits above OTD overlay without blocking it
        overlay.style.cssText = [
            'position:fixed;top:18px;left:50%;transform:translateX(-50%)',
            'background:rgba(0,0,0,0.72);backdrop-filter:blur(10px)',
            'border:2px solid rgba(255,0,85,0.55);border-radius:50px',
            'padding:8px 26px',
            'display:flex;align-items:center;gap:12px',
            'z-index:8000;pointer-events:none;font-family:var(--font-main)',
            'animation:fadeIn 0.25s ease-out',
        ].join(';');
        overlay.innerHTML = `
            <div style="color:rgba(255,255,255,0.55);font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Next</div>
            <div id="pqc-number" style="font-size:2rem;font-weight:900;color:var(--primary);text-shadow:0 0 20px rgba(255,0,85,0.7);line-height:1;">${seconds}</div>
        `;
    } else {
        // Full-screen overlay
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
    }
    document.body.appendChild(overlay);

    if (!compactMode) {
        // Trigger bar drain
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const bar = document.getElementById('pqc-bar');
                if (bar) bar.style.width = '0%';
            });
        });
    }

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
        const catLabel = showOtdCategory && currentQuestion?.category
            ? `<span class="otd-category-label">${currentQuestion.category}</span>` : '';
        hostEls.category.style.background = 'none';
        hostEls.category.style.padding = '0';
        hostEls.category.innerHTML = `<span class="off-the-dome-badge">OFF THE DOME</span>${catLabel}`;
    } else {
        hostEls.category.style.background = '';
        hostEls.category.style.padding = '';
        hostEls.category.textContent = currentQuestion ? currentQuestion.category : '-';
    }

    // Host card: hidden during question (player view shows it), only shown for answer reveal in result
    const hostCard = hostEls.view.querySelector('.host-card');
    const answerBox = document.getElementById('host-answer-text');
    const answerContainer = answerBox?.parentElement;

    if (phase === 'result') {
        if (hostCard) hostCard.classList.remove('hidden');
        // Image display (flag emoji etc.) above question text
        let hostImgEl = document.getElementById('host-image-display');
        if (currentQuestion?.imageDisplay) {
            if (!hostImgEl) {
                hostImgEl = document.createElement('div');
                hostImgEl.id = 'host-image-display';
                hostImgEl.className = 'question-image-display';
                hostEls.question.parentNode.insertBefore(hostImgEl, hostEls.question);
            }
            hostImgEl.textContent = currentQuestion.imageDisplay;
        } else if (hostImgEl) {
            hostImgEl.remove();
        }
        hostEls.question.textContent = currentQuestion?.question || '...';
        if (answerBox) {
            answerBox.textContent = currentQuestion?.answer || '...';
            answerContainer?.classList.remove('hidden-answer');
            answerContainer?.classList.add('revealed');
        }
    } else {
        if (hostCard) hostCard.classList.add('hidden');
        const hostImgEl = document.getElementById('host-image-display');
        if (hostImgEl) hostImgEl.remove();
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
    // Fallback to name match in case socketId changed after reconnect (case-insensitive)
    const myScoreEntry = (scores || []).find(s => s.socketId === socket.id)
        || (scores || []).find(s => s.name?.toLowerCase() === playerName?.toLowerCase())
        || { score: 0 };

    // Update timer state
    timerRemaining = gameState.timerRemaining || 0;
    timerDuration = gameState.timerDuration || 30;

    // Get my buzz/answer status
    const myStatus = (playerBuzzStatus || []).find(p => p.socketId === socket.id);
    hasBuzzed = myStatus?.hasBuzzed || false;
    hasAnswered = myStatus?.hasAnswered || false;

    // Show OFF THE DOME overlay once per OTD question (keyed by question index)
    if (isFirstOffTheDome && phase === 'waiting' && offTheDomeShownForIndex !== gameState.currentQuestionIndex) {
        showOffTheDomeOverlay();
        offTheDomeShownForIndex = gameState.currentQuestionIndex;
    }

    // Score & Rank
    playerEls.score.textContent = myScoreEntry.score || 0;
    const sorted = [...(scores || [])].sort((a, b) => b.score - a.score);
    const myRank = sorted.findIndex(s => s.socketId === socket.id) + 1;
    playerEls.rank.textContent = myRank > 0 ? `#${myRank}` : '-';

    // Round counter
    if (playerEls.qCounter) {
        const idx = gameState.currentQuestionIndex;
        const total = gameState.totalQuestions;
        if (typeof idx === 'number' && total > 0) {
            playerEls.qCounter.textContent = `Q ${idx + 1}/${total}`;
        } else {
            playerEls.qCounter.textContent = '';
        }
    }

    // Question info - only show if question is revealed
    if (phase === 'waiting') {
        playerEls.category.textContent = 'Waiting...';
        playerEls.question.textContent = 'Waiting for host to show question...';
        const staleImg = document.getElementById('player-image-display');
        if (staleImg) staleImg.remove();
    } else if (currentQuestion) {
        // Show OFF THE DOME badge if applicable
        if (isOffTheDome) {
            const catLabel = showOtdCategory && currentQuestion?.category
                ? `<span class="otd-category-label">${currentQuestion.category}</span>` : '';
            playerEls.category.innerHTML = `<span class="off-the-dome-badge">OFF THE DOME</span>${catLabel}`;
        } else {
            playerEls.category.textContent = currentQuestion.category || '';
        }
        // Image display (e.g. flag emoji shown large above question text)
        let playerImgEl = document.getElementById('player-image-display');
        if (currentQuestion.imageDisplay) {
            if (!playerImgEl) {
                playerImgEl = document.createElement('div');
                playerImgEl.id = 'player-image-display';
                playerImgEl.className = 'question-image-display';
                playerEls.question.parentNode.insertBefore(playerImgEl, playerEls.question);
            }
            playerImgEl.textContent = currentQuestion.imageDisplay;
        } else if (playerImgEl) {
            playerImgEl.remove();
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

    // Show answered players count during question phase
    let answeredListEl = document.getElementById('player-answered-list');
    if (phase === 'question') {
        if (!answeredListEl) {
            answeredListEl = document.createElement('div');
            answeredListEl.id = 'player-answered-list';
            answeredListEl.className = 'player-answered-status';
        }

        const answeredPlayers = (playerBuzzStatus || []).filter(p => p.hasAnswered);
        const totalCount = (playerBuzzStatus || []).length;
        if (answeredPlayers.length > 0) {
            answeredListEl.innerHTML = `<div class="answered-status-label">Locked in: ${answeredPlayers.length}/${totalCount}</div>
                <div class="answered-names">${answeredPlayers.map(p => `<span class="answered-tag">${p.name}</span>`).join('')}</div>`;
        } else {
            answeredListEl.innerHTML = `<div class="answered-status-label" style="opacity:0.5">Waiting for answers... 0/${totalCount}</div>`;
        }

        // Always append at end — below all answer options (choices grid, lock-in button, or text input)
        if (answeredListEl.parentNode !== playerEls.view || playerEls.view.lastChild !== answeredListEl) {
            playerEls.view.appendChild(answeredListEl);
        }
    } else if (answeredListEl) {
        answeredListEl.remove();
    }
}

function renderMultipleChoiceButtons(choices) {
    if (!choicesEls.grid || !choices) return;

    // True/False (2-choice) detection — use two-choice layout, no shuffle
    const isTwoChoice = choices.length === 2;
    if (isTwoChoice) {
        choicesEls.grid.classList.add('two-choice');
    } else {
        choicesEls.grid.classList.remove('two-choice');
    }

    // Only shuffle once per question (skip shuffle for 2-choice True/False)
    const questionKey = gameState?.currentQuestion?.question;
    if (questionKey !== lastRenderedQuestionKey) {
        lastRenderedQuestionKey = questionKey;
        cachedShuffledChoices = isTwoChoice ? [...choices] : [...choices].sort(() => Math.random() - 0.5);
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
    // Clear persistent session so a kicked player can't auto-rejoin the same room
    sessionStorage.removeItem('buzzin_session');

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
        <div class="off-the-dome-subtitle">${otdAtEnd ? `${offTheDomeCount} question${offTheDomeCount !== 1 ? 's' : ''} — type your answers!` : 'Type your answer!'}</div>
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
    const otdTimer = lastSettings.otdTimerDuration || 60;
    const bonus = lastSettings.bonusFirstCorrect !== false;
    const otdCount = lastSettings.offTheDomeCount ?? 3;
    const otdAtEndSaved = lastSettings.otdAtEnd === true;
    const showOtdCatSaved = lastSettings.showOtdCategory !== false;
    const hardModeSaved = lastSettings.hardMode === true;
    const countdownSaved = lastSettings.countdownEnabled !== false;

    const CATEGORIES = [
        "General Knowledge","Science","Movies & TV","Music","Sports",
        "History","Geography","Pop Culture","Games","Random","Flags"
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
                <label class="pa-label">OFF THE DOME Timer: <span id="pa-otd-t-val">${otdTimer}</span>s per OTD question</label>
                <input type="range" id="pa-otd-t-slider" min="10" max="180" value="${otdTimer}" step="5" style="width:100%">
            </div>
            <div class="pa-section">
                <label class="pa-toggle">
                    <input type="checkbox" id="pa-bonus" ${bonus ? 'checked' : ''}>
                    <span>First correct +50 bonus</span>
                </label>
            </div>
            <div class="pa-section">
                <label class="pa-toggle">
                    <input type="checkbox" id="pa-countdown" ${countdownSaved ? 'checked' : ''}>
                    <span>3-2-1 countdown between questions</span>
                </label>
            </div>
            <div class="pa-section">
                <label class="pa-toggle">
                    <input type="checkbox" id="pa-otd-at-end" ${!otdAtEndSaved ? 'checked' : ''}>
                    <span>OFF THE DOME questions randomized throughout (uncheck to put at end of game)</span>
                </label>
            </div>
            <div class="pa-section">
                <label class="pa-toggle">
                    <input type="checkbox" id="pa-show-otd-cat" ${showOtdCatSaved ? 'checked' : ''}>
                    <span>Show category alongside OFF THE DOME badge</span>
                </label>
            </div>
            <div class="pa-section">
                <label class="pa-toggle">
                    <input type="checkbox" id="pa-hard-mode" ${hardModeSaved ? 'checked' : ''}>
                    <span>Hard Mode — pull from harder question set</span>
                </label>
            </div>
            <div class="pa-actions">
                <button id="pa-cancel" class="btn-secondary">Cancel</button>
                <button id="pa-start" class="btn-primary">Start Game!</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    // Ensure the modal scrolls to the top on open (prevents iOS from starting mid-scroll)
    requestAnimationFrame(() => { modal.scrollTop = 0; });

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
    modal.querySelector('#pa-otd-t-slider').addEventListener('input', (e) => {
        modal.querySelector('#pa-otd-t-val').textContent = e.target.value;
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
        const newOtdTimer = parseInt(modal.querySelector('#pa-otd-t-slider').value);
        const newBonus = modal.querySelector('#pa-bonus').checked;
        const newCountdown = modal.querySelector('#pa-countdown').checked;
        const newOtdAtEnd = !modal.querySelector('#pa-otd-at-end').checked;
        const newShowOtdCat = modal.querySelector('#pa-show-otd-cat').checked;
        const newHardMode = modal.querySelector('#pa-hard-mode').checked;

        // Update in-memory settings immediately
        countdownEnabled = newCountdown;
        otdAtEnd = newOtdAtEnd;
        showOtdCategory = newShowOtdCat;

        // Save updated settings
        sessionStorage.setItem('buzzin_settings', JSON.stringify({
            ...lastSettings,
            categories: selectedCats,
            questionCount: newQCount,
            offTheDomeCount: newOtdCount,
            timerDuration: newTimer,
            otdTimerDuration: newOtdTimer,
            bonusFirstCorrect: newBonus,
            countdownEnabled: newCountdown,
            otdAtEnd: newOtdAtEnd,
            showOtdCategory: newShowOtdCat,
            hardMode: newHardMode
        }));

        socket.emit('host:restartGame', {
            roomCode,
            categories: selectedCats,
            questionCount: newQCount,
            offTheDomeCount: newOtdCount,
            timerDuration: newTimer,
            otdTimerDuration: newOtdTimer,
            bonusFirstCorrect: newBonus,
            otdAtEnd: newOtdAtEnd,
            hardMode: newHardMode,
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
        if (event.voidedRound) {
            // Shuffle happened after everyone answered — scores for that round are void
            showVoidRoundToast(event.message || 'No scores counted — round was shuffled away');
        } else {
            showFeedback('QUESTIONS SHUFFLED', 'info');
        }
    } else if (event.type === 'question_flagged') {
        showVoidRoundToast(event.message || 'Question flagged — no scores counted');
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
            badge = `<span class="wrong-badge">✕</span>`;
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
            ${event.explanation ? `<div class="round-explanation" id="overlay-explanation-slot"></div>` : ''}
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

    // Safely set explanation text (avoid innerHTML injection from Groq output)
    if (event.explanation) {
        const expSlot = overlay.querySelector('#overlay-explanation-slot');
        if (expSlot) expSlot.textContent = event.explanation;
    }

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

// Short, prominent toast for voided rounds (shuffle-after-result, flagged questions).
// Shown to all players. Lasts ~1.5s, styled like the game's accent color scheme.
function showVoidRoundToast(message) {
    // Remove any existing void toast to avoid stacking
    document.getElementById('void-round-toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'void-round-toast';
    toast.style.cssText = [
        'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)',
        'background:#1a1a2e;border:2px solid #ff0055;color:#fff',
        'padding:18px 32px;border-radius:16px',
        'font-size:1.05rem;font-weight:700;z-index:9800',
        'text-align:center;max-width:320px;width:90%',
        'box-shadow:0 8px 32px rgba(255,0,85,0.35)',
        'animation:fadeIn 0.25s ease-out',
        'font-family:var(--font-main)',
    ].join(';');
    toast.innerHTML = `<div style="font-size:1.4rem;margin-bottom:8px;">🚩</div>${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease-out';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 1800);
}

// End-of-game summary overlay listing all questions flagged during the game.
// Shown before the final leaderboard; both host and players tap through it.
function showFlaggedQuestionsSummary(flaggedQuestions, onDismiss) {
    document.getElementById('flagged-summary-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'flagged-summary-overlay';
    overlay.style.cssText = [
        'position:fixed;inset:0',
        'background:rgba(0,0,0,0.88)',
        'display:flex;align-items:center;justify-content:center',
        'z-index:8500;font-family:var(--font-main)',
        'animation:fadeIn 0.35s ease-out',
        'padding:24px;box-sizing:border-box',
    ].join(';');

    const rows = flaggedQuestions.map((fq, i) => `
        <div style="
            background:rgba(255,255,255,0.06);
            border:1px solid rgba(255,0,85,0.25);
            border-radius:12px;
            padding:14px 16px;
            margin-bottom:10px;
            text-align:left;
        ">
            <div style="color:rgba(255,255,255,0.45);font-size:0.72rem;font-weight:700;
                        text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                Round ${fq.roundNumber}
            </div>
            <div style="color:#fff;font-size:0.93rem;font-weight:600;margin-bottom:6px;
                        line-height:1.4;">${fq.question}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:0.82rem;">
                Intended answer: <span style="color:rgba(255,255,255,0.8);font-weight:600;">${fq.answer}</span>
            </div>
        </div>
    `).join('');

    overlay.innerHTML = `
        <div style="
            background:#12122a;
            border-radius:20px;
            padding:28px 24px;
            max-width:420px;
            width:100%;
            max-height:85vh;
            overflow-y:auto;
            box-shadow:0 12px 48px rgba(0,0,0,0.6);
        ">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:2rem;margin-bottom:8px;">🚩</div>
                <h2 style="color:#fff;margin:0 0 6px;font-size:1.3rem;font-weight:800;">Flagged Questions</h2>
                <p style="color:rgba(255,255,255,0.5);margin:0;font-size:0.85rem;">
                    These rounds were flagged — no scores were counted.
                </p>
            </div>
            <div>${rows}</div>
            <div style="
                text-align:center;
                margin-top:20px;
                color:rgba(255,255,255,0.4);
                font-size:0.82rem;
                font-weight:600;
                letter-spacing:0.5px;
            ">Tap anywhere to see final results</div>
        </div>
    `;

    overlay.addEventListener('click', () => {
        overlay.style.transition = 'opacity 0.25s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            if (onDismiss) onDismiss();
        }, 250);
    });

    document.body.appendChild(overlay);
}

// Start — prefetch category counts so they're ready before Play Again modal opens
fetchCategoryCounts();
init();

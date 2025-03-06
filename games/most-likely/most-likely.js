const categories = {
    fun: [
        "become a famous TikTok star",
        "accidentally send a text to the wrong person",
        "get lost in their own neighborhood",
        "become a CEO",
        "win the lottery and lose the ticket",
        "accidentally start a viral trend",
        "become a professional athlete",
        "forget their own birthday",
        "become a successful YouTuber",
        "travel to space",
        "start a dance party in public",
        "adopt 10 pets",
        "become a stand-up comedian",
        "win a karaoke competition",
        "start their own holiday"
    ],
    party: [
        "be the last one dancing at a party",
        "get everyone to do the conga line",
        "plan an epic surprise party",
        "make the best cocktails",
        "become a DJ",
        "start a flash mob",
        "do karaoke first",
        "organize the wildest bachelor/bachelorette party",
        "take over the music at a party",
        "dance on a table",
        "make friends with everyone at the bar",
        "know all the party tricks",
        "be the life of any party",
        "create a new drinking game",
        "plan the most memorable New Year's party"
    ],
    adventure: [
        "travel the world spontaneously",
        "go skydiving",
        "climb Mount Everest",
        "live in a different country every year",
        "swim with sharks",
        "start a food truck",
        "join the circus",
        "sail around the world",
        "discover a new species",
        "win a survival reality show",
        "explore an undiscovered cave",
        "learn 10 languages",
        "ride a motorcycle across the country",
        "become a professional surfer",
        "live off the grid"
    ],
    career: [
        "become a millionaire first",
        "start a successful company",
        "get promoted the fastest",
        "work from a tropical island",
        "give a TED talk",
        "write a bestselling book",
        "invent something revolutionary",
        "win a Nobel Prize",
        "become a famous artist",
        "create the next big app",
        "become a world-renowned chef",
        "host their own TV show",
        "become a successful investor",
        "revolutionize an industry",
        "have the most interesting LinkedIn profile"
    ],
    wild: [
        "accidentally become a meme",
        "go viral for something embarrassing",
        "get mistaken for a celebrity",
        "start a bizarre fashion trend",
        "win a weird world record",
        "become an accidental hero",
        "get involved in a ridiculous misunderstanding",
        "create an internet challenge",
        "have the most unbelievable excuse for being late",
        "accidentally crash a wedding",
        "become famous for something silly",
        "start a conspiracy theory by accident",
        "have their life turned into a movie",
        "become an urban legend",
        "have the most interesting story to tell their grandkids"
    ]
};

let players = [];
let currentPlayerIndex = 0;
let points = {};
let currentCategory = 'fun';
let usedCards = new Set();

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        if (document.getElementById("playerInput").value.trim() === "") {
            startGame();
        } else {
            addPlayer();
        }
    }
}

function addPlayer() {
    const playerName = document.getElementById("playerInput").value.trim();
    if (playerName !== "" && !players.includes(playerName)) {
        players.push(playerName);
        points[playerName] = 0;
        document.getElementById("playerInput").value = "";
        document.getElementById("playerInput").placeholder = `Player ${players.length + 1}`;
        updatePlayerList();
    }
}

function updatePlayerList() {
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";
    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player} (${points[player]} points)`;
        playerList.appendChild(li);
    });
}

function selectCategory(category) {
    currentCategory = category;
    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.classList.remove('selected');
        if (button.getAttribute('data-category') === category) {
            button.classList.add('selected');
        }
    });
    usedCards.clear();
}

function startGame() {
    if (players.length >= 2) {
        document.getElementById("setup-container").style.display = "none";
        document.getElementById("game-container").style.display = "block";
        nextCard();
    } else {
        alert("Add at least two players before starting the game.");
    }
}

function nextCard() {
    const availableCards = categories[currentCategory].filter(card => !usedCards.has(card));
    
    if (availableCards.length === 0) {
        usedCards.clear();
        alert("All cards in this category have been used! Reshuffling deck.");
    }
    
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[randomIndex];
    usedCards.add(card);
    
    document.getElementById("card-text").textContent = `Who is most likely to ${card}?`;
    document.getElementById("voting-container").innerHTML = "";
    
    players.forEach(player => {
        const button = document.createElement("button");
        button.textContent = player;
        button.onclick = () => vote(player);
        button.classList.add('vote-button');
        document.getElementById("voting-container").appendChild(button);
    });
}

function vote(player) {
    points[player]++;
    updatePlayerList();
    nextCard();
}

function resetGame() {
    players = [];
    points = {};
    usedCards.clear();
    document.getElementById("setup-container").style.display = "block";
    document.getElementById("game-container").style.display = "none";
    document.getElementById("playerList").innerHTML = "";
    document.getElementById("playerInput").placeholder = "Player 1";
}

function goToHomepage() {
    window.location.href = '/index.html';
}
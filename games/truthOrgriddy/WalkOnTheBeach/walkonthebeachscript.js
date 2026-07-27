const players = [];
let currentPlayerIndex = 0;
let points = {};
let griddyPoints = {};
let actions = {};
const questions = [
    "What's a small thing that always improves your mood?",
    "If you could wake up tomorrow anywhere in the world, where would you choose?",
    "What's a food you could happily eat every week?",
    "What's the funniest misunderstanding you've ever been part of?",
    "What hobby have you always wanted to try?",
    "What's a movie you wish you could watch again for the first time?",
    "If you could instantly become great at one skill, what would it be?",
    "What's your ideal way to spend a completely free day?",
    "What's a song that instantly takes you back to a specific memory?",
    "What's something you believed as a kid that makes you laugh now?",
    "If you could live in any fictional world for one month, where would you go?",
    "What's the best compliment you've ever received?",
    "What's a place you've visited that surprised you?",
    "If your life had a soundtrack, what song would play during the opening scene?",
    "What's a simple comfort you never get tired of?",
    "What is one thing you are looking forward to right now?",
    "If you could have dinner with any fictional character, who would it be?",
    "What's a random fact you know that you enjoy telling people?",
    "What is your favorite way to recharge after a long week?",
    "What's the best meal you've ever had?",
    "If you could relive one ordinary day, which day would you pick?",
    "What's a smell that brings back a strong memory?",
    "What is something you are better at than most people realize?",
    "If you could spend a year learning anything, what would you study?",
    "What's the most useful advice someone has given you?",
    "What is one tradition you would like to start?",
    "If you could have any animal as a safe and friendly pet, what would you choose?",
    "What's your favorite thing about the season you like most?",
    "What is a small purchase that made your life noticeably better?",
    "If you could plan the perfect road trip, where would it go?",
    "What's a show you can rewatch without getting bored?",
    "What is one thing you wish more people appreciated?",
    "If your personality were a weather forecast, what would it say today?",
    "What's the best surprise you've ever received?",
    "What is something you used to dislike but now enjoy?",
    "If you could design your dream home, what feature would matter most?",
    "What's a childhood memory that still makes you smile?",
    "What is your favorite way to celebrate good news?",
    "If you could try any job for one week with no pressure, what would it be?",
    "What's something you find oddly satisfying?",
    "What is a goal you would love to accomplish in the next few years?",
    "If you could invent a new holiday, what would it celebrate?",
    "What's your favorite conversation topic when you really click with someone?",
    "What is a tiny inconvenience you would erase from everyday life?",
    "If you could spend a day with your future self, what would you ask?",
    "What's a book, movie, or show that changed how you think?",
    "What is your favorite kind of weather?",
    "If you could master any language overnight, which one would you choose?",
    "What's the most memorable gift you've ever given someone?",
    "What is something you wish you had started doing sooner?",
    "If your week had a title, what would it be?",
    "What's a place you would happily visit more than once?",
    "What is something people often misunderstand about your personality?",
    "If you could open any kind of business just for fun, what would it be?",
    "What's your favorite way to spend time with friends?",
    "What is a harmless opinion you will defend forever?",
    "If you could keep only three apps on your phone, which would you choose?",
    "What's the funniest thing a pet or animal has ever done around you?",
    "What is one meal you would want to learn how to cook perfectly?",
    "If you could attend any event in history as an observer, what would it be?",
    "What's a memory that always makes you laugh?",
    "What is something new you tried recently?",
    "If you could create your own reality show, what would it be about?",
    "What's the best part of your typical day?",
    "What is one quality you value most in a friend?",
    "If you could take a class on any unusual subject, what would it be?",
    "What's your favorite way to spend a rainy day?",
    "What is a place near home that you think is underrated?",
    "If your life were a movie, what genre would it be?",
    "What's a small risk you took that turned out well?",
    "What is something you would love to become known for?",
    "If you could trade lives with any fictional character for one day, who would it be?",
    "What's a family or friend-group tradition you enjoy?",
    "What is your favorite way to make someone feel appreciated?",
    "If you could redesign one everyday object, what would you improve?",
    "What's a topic you could give a five-minute speech about with no preparation?",
    "What is something that instantly makes a place feel welcoming?",
    "If you could revisit any age for one day, what age would you choose?",
    "What's the best advice you would give your younger self?",
    "What is something you would put on your perfect weekend itinerary?",
    "If you could have a personal mascot, what would it be?",
    "What's a harmless habit you have that makes your life better?",
    "What is your favorite memory from a vacation or trip?",
    "If you could make one everyday task effortless, which would you choose?",
    "What's a dream you have that feels exciting rather than practical?",
    "What is something you have changed your mind about in recent years?",
    "If you could spend one season anywhere, where would you go?",
    "What's a skill someone else has that you admire?",
    "What is one thing you would want included in a time capsule about your life right now?",
    "If you could host a dinner party for any three people, living or fictional, who would you invite?",
    "What's a sound you find especially relaxing?",
    "What is something that makes you feel instantly nostalgic?",
    "If you could choose the theme for a themed party, what would it be?",
    "What's your favorite thing to talk about late at night?",
    "What is a lesson you learned from an unexpected place?",
    "If you could guarantee one good thing happens this year, what would you choose?",
    "What's a small act of kindness you still remember?",
    "What is something ordinary that you think is actually beautiful?",
    "If you could give everyone one piece of advice, what would it be?",
    "What question do you wish people asked you more often?"
];

let shuffledQuestions = shuffleArray(questions.slice());
let isFirstQuestion = true;

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
    if (playerName !== "") {
        players.push(playerName);
        points[playerName] = 0;
        griddyPoints[playerName] = 0;
        actions[playerName] = { Griddys: 0, answered: 0 };
        document.getElementById("playerInput").value = "";
        document.getElementById("playerInput").placeholder = `Player ${players.length + 1}`;
        updatePointContainer();
        updatePlayerButtons();
    }
}

function startGame() {
    if (players.length > 0) {
        document.getElementById("welcome-text").style.display = "none";
        document.getElementById("start-container").style.display = "none";
        document.getElementById("game-container").style.display = "flex";
        nextPlayer();
    } else {
        alert("Add at least one player before starting the game.");
    }
}

function updatePointContainer() {
    const pointContainer = document.getElementById("point-container");

    if (isFirstQuestion) {
        isFirstQuestion = false;
    } else {
        pointContainer.style.display = "block";
        pointContainer.innerHTML = "";

        // Display player results in a chart
        const resultsTable = document.createElement("table");
        resultsTable.classList.add("results-table");

        resultsTable.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Score</th>
                <th>Answered</th>
                <th>Griddys</th>
            </tr>
        `;

        players.forEach(player => {
            const playerRow = resultsTable.insertRow();
            const playerNameCell = playerRow.insertCell(0);
            const playerScoreCell = playerRow.insertCell(1);
            const playerAnsweredCell = playerRow.insertCell(2);
            const playerGriddysCell = playerRow.insertCell(3);

            playerNameCell.innerHTML = player;
            playerScoreCell.innerHTML = points[player];
            playerAnsweredCell.innerHTML = actions[player].answered;
            playerGriddysCell.innerHTML = actions[player].Griddys;
        });

        pointContainer.appendChild(resultsTable);
    }
}

function updatePlayerButtons() {
    const buttonsContainer = document.getElementById("buttons-container");
    buttonsContainer.innerHTML = "";

    const answeredButton = document.createElement("button");
    answeredButton.innerText = "Answered";
    answeredButton.classList.add("action-button");
    answeredButton.onclick = function () {
        answered();
    };
    buttonsContainer.appendChild(answeredButton);

    const shuffleButton = document.createElement("button");
    shuffleButton.innerText = "Shuffle Question";
    shuffleButton.classList.add("action-button");
    shuffleButton.onclick = function () {
        shuffleQuestion();
    };
    buttonsContainer.appendChild(shuffleButton);

    const spacingDiv = document.createElement("div");
    spacingDiv.style.width = "10px";
    buttonsContainer.appendChild(spacingDiv);

    const griddyButton = document.createElement("button");
    griddyButton.innerText = "Griddy";
    griddyButton.classList.add("action-button");
    griddyButton.onclick = function () {
        griddy();
    };
    buttonsContainer.appendChild(griddyButton);
}

function displayNewCardAnimation() {
    const cardContainer = document.getElementById('card-container');
    const questionCard = document.getElementById('question-card');
    const playerName = document.getElementById('player-name');

    // Add the animation class
    cardContainer.classList.add('fade-in-animation');
    questionCard.classList.add('fade-in-animation');
    playerName.classList.add('fade-in-animation');

    // Remove the class after the animation completes to reset it
    setTimeout(function() {
        cardContainer.classList.remove('fade-in-animation');
        questionCard.classList.remove('fade-in-animation');
        playerName.classList.remove('fade-in-animation');
    }, 500); // 500ms is the duration of the animation
}

function shuffleQuestion() {
    const questionContainer = document.getElementById("question");
    shuffledQuestions = shuffleArray(questions.slice());
    questionContainer.innerText = shuffledQuestions.pop();
    displayNewCardAnimation(); // Add this line
}

function nextQuestion() {
    if (shuffledQuestions.length > 0) {
        const questionContainer = document.getElementById("question");
        questionContainer.innerText = shuffledQuestions.pop();
        questionContainer.style.marginTop = "20px";
        displayNewCardAnimation(); // Add this line
    } else {
        endGame();
    }
}

function nextPlayer() {
    const currentPlayer = players[currentPlayerIndex];
    document.getElementById("player-name").innerText = currentPlayer;
    updatePlayerButtons();
    nextQuestion();
}

function griddy() {
    const currentPlayer = players[currentPlayerIndex];
    actions[currentPlayer].Griddys++;
    griddyPoints[currentPlayer]++;
    updatePointContainer();
    displayNewCardAnimation(); // Add this line
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    nextPlayer();
}

function answered() {
    const currentPlayer = players[currentPlayerIndex];
    actions[currentPlayer].answered++;
    points[currentPlayer]++;
    updatePointContainer();
    displayNewCardAnimation(); // Add this line
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    nextPlayer();
}

function endGame() {
    document.getElementById("card-container").style.display = "none";
    document.getElementById("buttons-container").style.display = "none";
    document.getElementById("point-container").style.display = "none";
    document.getElementById("game-over").innerText = "Game Over!";
    document.getElementById("game-over").style.display = "block";

    // Display "Results" and show points
    const resultsContainer = document.createElement("div");
    resultsContainer.innerHTML = "<br>Results<hr>";
    const pointContainer = document.getElementById("point-container");
    pointContainer.style.display = "block";
    resultsContainer.appendChild(pointContainer);
    document.body.appendChild(resultsContainer);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initial setup
nextPlayer();

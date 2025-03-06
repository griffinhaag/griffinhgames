const players = [];
let currentPlayerIndex = 0;
let points = {};
let griddyPoints = {};
let actions = {};
const questions = [
    "Everyone go around and name a country. First to fail, take 2 drinks!",
    "What's the most embarrassing thing you've done while drunk? Take 2 drinks!",
    "If you had to get a tattoo right now, what would it be? Take 3 drinks!",
    "What's the worst date you've ever been on? Take 2 drinks!",
    "Everyone go around and name a U.S. president. First to fail, take 2 drinks!",
    "What's the biggest lie you've ever told? Take 2 drinks!",
    "If you could only listen to one song for the rest of your life, what would it be? Take 2 drinks!",
    "Everyone go around and name a capital city. First to fail, take 2 drinks!",
    "What's the most scandalous thing you've done for money? Take 3 drinks!",
    "If you had to marry one person in this room, who would it be? Take 2 drinks!",
    "Everyone go around and name a brand of car. First to fail, take 2 drinks!",
    "If you had to be handcuffed to one person for a week, who would it be? Take 3 drinks!",
    "What's the most illegal thing you've ever done? Take 2 drinks!",
    "Everyone go around and name a movie. First to fail, take 2 drinks!",
    "What's the weirdest place you've ever hooked up? Take 3 drinks!",
    "If you had to switch lives with someone in this room, who would it be? Take 2 drinks!",
    "What's the most awkward text you've sent to the wrong person? Take 2 drinks!",
    "Everyone go around and name a type of fruit. First to fail, take 2 drinks!",
    "If you could have a one-night stand with any celebrity, who would it be? Take 3 drinks!",
    "What's the most ridiculous thing you've ever spent money on? Take 2 drinks!",
    "If you could delete one memory, what would it be? Take 2 drinks!",
    "Everyone go around and name a famous actor. First to fail, take 2 drinks!",
    "What's the worst thing you've ever done to a friend? Take 3 drinks!",
    "If you could only wear one outfit for the rest of your life, what would it be? Take 2 drinks!",
    "What's the most embarrassing thing in your search history? Take 2 drinks!",
    "If you could read someone's mind for a day, who would it be? Take 3 drinks!",
    "Everyone go around and name a book title. First to fail, take 2 drinks!",
    "What's the most annoying habit someone in this room has? Take 2 drinks!",
    "If you had to swap lives with a fictional character, who would it be? Take 2 drinks!",
    "What's the most outrageous thing you've done in public? Take 3 drinks!",
    "If you could have any job in the world, what would it be? Take 2 drinks!",
    "Everyone go around and name a color. First to fail, take 2 drinks!",
    "What's the most you've ever spent on a night out? Take 2 drinks!",
    "If you had to eat one food for the rest of your life, what would it be? Take 2 drinks!",
    "What's the worst advice you've ever received? Take 2 drinks!",
    "If you could relive one moment in your life, what would it be? Take 3 drinks!",
    "Everyone go around and name a famous athlete. First to fail, take 2 drinks!",
    "What's the most embarrassing thing you've done on a dare? Take 2 drinks!",
    "If you could instantly become famous, what would you be famous for? Take 2 drinks!",
    "What's the biggest secret you've kept from your family? Take 3 drinks!",
    "Everyone go around and name a song title. First to fail, take 2 drinks!",
    "If you could have any animal as a pet, what would it be? Take 2 drinks!",
    "What's the strangest thing you've done when you were alone? Take 2 drinks!",
    "If you could be any age forever, what age would you choose? Take 2 drinks!",
    "Everyone go around and name a TV show. First to fail, take 2 drinks!",
    "What's the most embarrassing thing you've ever worn? Take 2 drinks!",
    "If you could change one thing about your past, what would it be? Take 3 drinks!",
    "What's the most scandalous photo on your phone? Take 2 drinks!",
    "If you had to lose one of your senses, which one would it be? Take 2 drinks!",
    "What's the worst thing you've done to get out of a responsibility? Take 3 drinks!",
    "Everyone go around and name a famous singer. First to fail, take 2 drinks!",
    "If you could start a cult, what would it be about? Take 2 drinks!",
    "What's the weirdest thing you've done to impress someone? Take 2 drinks!",
    "If you had to delete all but one app from your phone, which one would you keep? Take 2 drinks!",
    "What's the most cringe-worthy thing you've posted on social media? Take 3 drinks!",
    "If you could be invisible for a day, what would you do? Take 2 drinks!",
    "What's the most you've ever lied to get out of trouble? Take 2 drinks!",
    "If you could have a personal theme song, what would it be? Take 2 drinks!",
    "What's the most scandalous thing you've done in a car? Take 3 drinks!",
    "Everyone go around and name a vegetable. First to fail, take 2 drinks!",
    "If you could be any mythical creature, what would you be? Take 2 drinks!",
    "What's the most bizarre dream you've ever had? Take 2 drinks!",
    "If you had to live in a different country, where would you go? Take 3 drinks!",
    "What's the weirdest habit you have? Take 2 drinks!",
    "If you could have dinner with any historical figure, who would it be? Take 2 drinks!",
    "What's the most embarrassing thing you've done in front of a crush? Take 3 drinks!",
    "Everyone go around and name an animal. First to fail, take 2 drinks!",
    "If you could live in any TV show, which one would it be? Take 2 drinks!",
    "What's the most outrageous thing you've done for attention? Take 2 drinks!",
    "If you had to pick a new name for yourself, what would it be? Take 2 drinks!",
    "What's the craziest thing you've done for love? Take 3 drinks!",
    "Everyone go around and name a board game. First to fail, take 2 drinks!",
    "If you could teleport anywhere right now, where would you go? Take 2 drinks!",
    "What's the most childish thing you still do? Take 2 drinks!",
    "If you could make one rule everyone had to follow, what would it be? Take 2 drinks!",
    "What's the most awkward thing that's happened to you on a date? Take 3 drinks!",
    "If you could instantly master any skill, what would it be? Take 2 drinks!",
    "What's the weirdest thing you've done out of boredom? Take 2 drinks!",
    "Everyone go around and name a dessert. First to fail, take 2 drinks!",
    "What's the most awkward situation you've been in? Take 2 drinks!",
    "If you could have any celebrity's life for a day, who would it be? Take 2 drinks!",
    "What's the most scandalous thing you've done in public? Take 3 drinks!",
    "If you had to spend a week with only one person in this room, who would it be? Take 2 drinks!",
    "What's the most embarrassing nickname you've had? Take 2 drinks!",
    "If you could have a lifetime supply of one item, what would it be? Take 2 drinks!",
    "Everyone go around and name a video game. First to fail, take 2 drinks!",
    "What's the most awkward thing you've said to a stranger? Take 2 drinks!",
    "If you could switch lives with one person for a day, who would it be? Take 2 drinks!",
    "What's the weirdest thing you've done for a dare? Take 2 drinks!",
    "If you could erase one embarrassing moment from your past, what would it be? Take 3 drinks!",
    "Everyone go around and name a holiday. First to fail, take 2 drinks!",
    "What's the most controversial opinion you have? Take 2 drinks!",
    "If you could have one superpower, what would it be? Take 2 drinks!",
    "What's the most unusual thing you've ever done in public? Take 2 drinks!",
    "If you could live in any time period, which one would it be? Take 3 drinks!",
    "Everyone go around and name a beverage. First to fail, take 2 drinks!",
    "What's the most embarrassing photo on your phone? Take 2 drinks!",
    "If you could trade places with anyone for a day, who would it be? Take 2 drinks!",
    "What's the most scandalous text you've ever sent? Take 3 drinks!",
    "If you could have dinner with any fictional character, who would it be? Take 2 drinks!"
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

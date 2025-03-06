const players = [];
let currentPlayerIndex = 0;
let points = {};
let griddyPoints = {};
let actions = {};
const questions = [
    "What is your most embarrassing or awkward experience that you’ve never told me about yet?",
    "If you were to lose your power of speech tonight, what’s the one thing you would want to tell me to improve myself?",
    "Which is the first region your eyes would wander to if you were ever to see me naked?",
    "When was the first time you got a whiff of my body odor?",
    "If I’m feeling horny when you’re around, do you think you’d realize it? And how do you think you’d recognize the signs?",
    "If I caught you masturbating in bed, would you blush awkwardly and accept that I caught you, or would you pretend like you were just shifting your butt about on the bed?",
    "What’s the meanest thing you’ve ever done to someone to get back at them?",
    "When was the first time you had a wet dream?",
    "Have you ever played doctor as a child? With whom did you play, and how old were you?",
    "What is your wildest sexual secret that you want to indulge in at least once in your lifetime?",
    "Have you ever been caught naked by someone?",
    "Have you ever found something valuable on the street and kept it for yourself even though you knew you could return it to the owner?",
    "What is the most embarrassing moment you’ve experienced in your lifetime?",
    "Can you tell me your funniest childhood memory that you can remember?",
    "What are the things about me that you particularly like, and what is the one thing you don’t particularly like? physical and psychological asset",
    "Which is the one word in my vocabulary that I use excessively?",
    "Do you think you could punch someone and knock them off their senses?",
    "If you had to make out with a friend of the same sex to save the world from aliens, whom would you pick?",
    "Which sex toys have you experimented with so far, and which ones would you want to stay away from?",
    "If you had to have a sex change, what part of your body would you want enhanced more than anything else?",
    "Have you ever had a secret crush on any of your teachers or friends, and have they ever got to know about it?",
    "If we had kids together someday in the future, what features/characteristics of mine and yours would you want the child to have?",
    "When was the last time you felt possessive about me?",
    "Have you ever eavesdropped on me or peeked at me without my notice?",
    "Personally, do you think size matters in reality?",
    "If you had no choice, how many days do you think you could abstain from sex or masturbation at a stretch?",
    "What gets you aroused faster, phone sex or sexting?",
    "While having sex, would you prefer getting on top or staying down in bed?",
    "If you had to pick an animal, which animal do you find the sexiest of all?",
    "If you had to explain about the birds and the bees to a child, let me hear how you’d go about explaining it to them?",
    "Who is the biggest jerk/bitch you’ve ever come across in your life and why?",
    "Have you ever accidentally and yet intentionally kissed someone or tried kissing someone?",
    "When was the last time you fent an uncomfortable itch in your nether regions when you’re out in public?",
    "If the world froze for an afternoon and only you could move and no one could see you or remember what you did, what would you do?",
    "What’s your routine every night just before you go to sleep?",
    "If you felt that I was starting to get a crush on you, what would you do?",
    "What’s your craziest fantasy?",
    "Where’s the weirdest place you’ve had sex?",
    "Do you have any fetishes?",
    "What is your biggest sexual turn-on?",
    "What is your biggest sexual turn-off?",
    "What is your biggest nonsexual turn-on?",
    "What is your biggest nonsexual turn-off?",
    "Have you ever read erotica?",
    "What’s the longest you’ve gone without sex?",
    "What was your most embarrassing sexual experience?",
    "What is your favorite position?",
    "What is your least favorite position?",
    "Have you ever slept with someone and then immediately regretted it?",
    "Have you ever hooked up with a friend?",
    "What is the dirtiest text you’ve received?",
    "What is the dirtiest text you’ve sent?",
    "Do you watch porn?",
    "What is your most favorite porn category?",
    "Have you faked an orgasm?",
    "Have you ever cheated on someone?",
    "What’s the worst piece of advice you’ve given someone?",
    "What’s the biggest misconception about you?",
    "What’s your relationship dealbreaker?",
    "What do most people think is true about you but isn’t?",
    "What’s the best piece of advice you’ve given someone?",
    "What’s the best piece of advice you’ve gotten from someone else?",
    "What’s the best compliment you’ve ever received?",
    "What’s the one thing you would do if you knew there were no consequences?",
    "Have you ever had a ‘friends with benefits’ situation? If so, who with?",
    "What’s your favorite body part on me?",
    "Have you ever fallen asleep during sex?",
    "Have you ever sent someone a naughty pic?",
    "Have you ever kissed a stranger?",
    "What’s your most shallow reason for not going on a second date?",
    "Have you ever ghosted someone?",
    "Have you ever hooked up with an ex?",
    "What’s your dream first date?",
    "What makes you instantly swipe right on a dating app?",
    "What makes you instantly swipe left on a dating app?",
    "Have you ever been catfished?",
    "Have you ever had a secret relationship?",
    "What do you think about role-playing?",
    "Tell me about the last wet dream you can remember. Don’t leave any details out!",
    "Do you have a bucket list? If so, what is the wildest thing on that list?",
    "What was the most embarrassing thing that you ever did while on a date?",
    "What is the one mannerism you judge all potential partners on?",
    "Where is the weirdest place you’ve ever hooked up?",
    "What’s the biggest age gap you’ve had with a partner?",
    "Who is the most inappropriate person you’ve ever had a crush on?",
    "Have you ever been to a strip club?",
    // Add more questions as needed
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

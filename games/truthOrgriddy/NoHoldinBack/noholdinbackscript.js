const players = [];
let currentPlayerIndex = 0;
let points = {};
let griddyPoints = {};
let actions = {};
const questions = [
    "What's a harmless secret you've kept longer than necessary?",
    "Have you ever joined in on cyberbullying, online dogpiling, or making fun of someone online?",
    "Have you ever intentionally damaged someone else's property, even if it was minor?",
    "Have you ever shoplifted something small?",
    "Have you ever ghosted someone because you did not want to explain yourself?",
    "What's the pettiest reason you've used to cancel plans?",
    "Have you ever looked through someone else's phone without permission?",
    "Have you ever repeated a rumor before knowing whether it was true?",
    "Have you ever taken credit for an idea that was not completely yours?",
    "Have you ever cheated in a game and stayed quiet about it?",
    "Have you ever pretended to be sick to avoid something?",
    "Have you ever lied about your age to get into something?",
    "Have you ever used someone else's account without asking first?",
    "Have you ever snooped through someone else's room or belongings?",
    "Have you ever pretended not to see a message because you did not want to answer?",
    "What's the most ridiculous lie you've told to leave somewhere early?",
    "What's the pettiest revenge you've ever taken?",
    "Have you ever kept money or change you knew was given to you by mistake?",
    "Have you ever blamed someone else for something you did?",
    "What's something you've exaggerated to make yourself seem more impressive?",
    "Have you ever had a crush on someone who surprised you?",
    "Have you ever slid into someone's DMs? How did it go?",
    "Have you ever had a crush on a teacher, professor, boss, or coworker?",
    "What's the boldest first move you've ever made?",
    "What's your strangest harmless dating dealbreaker?",
    "What's a tiny green flag that immediately makes someone more attractive?",
    "Have you ever flirted to get a favor or special treatment?",
    "Have you ever mistaken friendliness for flirting?",
    "Have you ever given someone a fake number?",
    "Have you ever stayed on a date even after knowing there would not be another one?",
    "Have you ever kissed someone and immediately regretted it?",
    "Would you date a close friend if the timing felt right?",
    "Have you ever liked someone your friend used to like?",
    "What's the best compliment someone could give you on a date?",
    "What's a harmless lie you've put on a dating profile or told while flirting?",
    "Have you ever sneaked out of or ended a date early without being honest about why?",
    "What's your biggest ick that other people might find unreasonable?",
    "What is something non-physical that instantly makes someone more attractive?",
    "Have you ever pretended to like a song, show, or hobby because your crush liked it?",
    "Would you rather make the first move or know for sure the other person will?",
    "Have you ever lied about your relationship status to pursue someone else?",
    "Have you ever cheated in past relationships?",
    "What's your favorite position in bed?",
    "Do you ever go without protection while in bed?",
    "Does size really matter?",
    "What's your weirdest turn-on?",
    "What about you do you think turns me on?",
    "What's one thing about your partner that really turns you on?",
    "Do you think you're a good partner in bed?",
    "What's the dumbest way you've ever injured yourself?",
    "What's the most embarrassing thing you've done in public that you can laugh about now?",
    "What's the cringiest username you've ever used?",
    "What's the weirdest thing you've Googled recently?",
    "What's the strangest thing you do when nobody is around?",
    "Have you ever sent a message to the completely wrong person?",
    "What's the worst haircut or fashion choice you've ever had?",
    "Have you ever had a public meltdown over something minor?",
    "What's the most embarrassing thing you've done while trying to look cool?",
    "Have you ever been caught talking to yourself?",
    "What's the weirdest thing you've eaten because of a dare or bet?",
    "Have you ever worn the same outfit much longer than you should have?",
    "What's the most childish thing you still do?",
    "Have you ever lied about knowing a song, movie, or celebrity everyone else knew?",
    "What's the strangest recurring dream you've had?",
    "Have you ever been walked in on while doing something embarrassing?",
    "What's the most chaotic thing currently in your Notes app?",
    "What's the last screenshot on your phone that would need context?",
    "What's an embarrassing song you know almost every word to?",
    "What's the weirdest thing you believed as a child?",
    "If your personality came with a warning label, what would it say?",
    "If your life were a movie, what would the title be?",
    "If you could erase one minor embarrassing moment, which one would it be?",
    "If you could break one harmless rule with no consequences, what would you do?",
    "If you had to get a tattoo tonight, what would it be?",
    "If you could instantly master one unnecessary skill, what would it be?",
    "If you could live in one fictional universe for a month, which would you choose?",
    "If you could ask your future self one question, what would it be?",
    "If you had to switch lives with someone for one day, who would it be?",
    "If you could make one new rule everyone had to follow for a day, what would it be?",
    "If you could relive one ordinary day, which day would you choose?",
    "If you had to be famous for something ridiculous, what would it be?",
    "If you could teleport anywhere for dinner tonight, where would you go?",
    "If you had to give up your phone or your favorite food for a month, which would you choose?",
    "If you could have one fictional character as a roommate, who would it be?",
    "If you could know the full truth about one mystery, what would it be?",
    "If you had to compete on a reality show, which one would you choose?",
    "If your pet could expose one harmless fact about you, what would it reveal?",
    "If you were a drink, what would you be called and what would be in it?",
    "If you could swap one of your habits with someone else's, whose would you take?",
    "Who here would make the best road-trip partner?",
    "Who here is most likely to survive a zombie apocalypse?",
    "Who here would be the best at talking their way out of trouble?",
    "Who here would be most likely to become accidentally famous?",
    "Who here would make the best party host?",
    "Who here would be the best detective?",
    "Who here would be most likely to start a spontaneous adventure?",
    "Who here would be most likely to win a reality competition show?",
    "Who here would be the best person to call during a minor crisis?",
    "Who here would make the most entertaining podcast host?",
    "Who here would be most likely to move to another country with little notice?",
    "Who here would make the best teammate in a heist movie?",
    "Who here would be most likely to go viral for something wholesome?",
    "Who here would be the best at keeping a harmless secret?",
    "Who here would be most likely to become a millionaire?",
    "Who here would be most likely to make the group late while insisting they were ready?",
    "Who here would be the best at living without a phone for a month?",
    "Who here would write the most entertaining memoir?",
    "Who here would be most likely to befriend a complete stranger?",
    "Who here would be the best person to get stuck with during a long layover?"
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

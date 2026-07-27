const players = [];
let currentPlayerIndex = 0;
let points = {};
let griddyPoints = {};
let actions = {};
const questions = [
    "What's the most embarrassing or awkward experience you've never told most people about?",
    "How do you act when you're genuinely attracted to someone?",
    "What's the pettiest thing you've ever done to get back at someone?",
    "What's a fantasy you've wanted to try at least once?",
    "Have you ever found something valuable and kept it even though you could have returned it?",
    "What's the biggest misconception people have about you?",
    "Have you ever been caught naked or nearly naked by someone?",
    "What's the hardest truth you've learned about dating or relationships?",
    "Have you ever bought or used something from an adult store, and would you use it again?",
    "Have you ever had a crush on someone you knew was off-limits or a bad idea?",
    "Have you ever eavesdropped on a conversation you knew was not meant for you?",
    "Do you think size matters when it comes to attraction or intimacy?",
    "What's your favorite body part on yourself?",
    "What gets you more interested: phone sex or sexting?",
    "Do you prefer taking the lead or letting someone else take control in bed?",
    "What's the boldest first move you've ever made?",
    "Where's the weirdest place you've had sex?",
    "What's your dream first date if money and distance were not an issue?",
    "Is there a kink or fantasy you're comfortable admitting?",
    "If someone walked in on you while you were taking care of yourself, would you own it or panic?",
    "What's your biggest sexual turn-on?",
    "What's your biggest nonsexual turn-on?",
    "What's your biggest sexual turn-off?",
    "What's your biggest nonsexual turn-off?",
    "Have you ever read erotica, and did you enjoy it?",
    "What's the most embarrassing thing you've done on a date?",
    "What's the longest you've gone without sex since becoming sexually active?",
    "Have you ever regretted not making a move on someone?",
    "What's your most embarrassing sexual experience?",
    "What's your biggest relationship dealbreaker?",
    "What's your favorite position in bed?",
    "What's an attractive quality you rarely admit you notice?",
    "What's your least favorite position in bed?",
    "Have you ever slept with someone and immediately regretted it?",
    "Have you ever hooked up with a friend?",
    "Have you ever had a friends-with-benefits situation, and did it stay uncomplicated?",
    "What's the boldest text or message you've ever received?",
    "What's the boldest text or message you've ever sent?",
    "Do you watch adult content regularly?",
    "What genre of adult content are you most into, if any?",
    "Have you ever faked an orgasm?",
    "Have you ever stayed in a relationship after your feelings had already changed?",
    "What's your most shallow reason for not going on a second date?",
    "Have you ever gone back to someone after ghosting them or being ghosted by them?",
    "Have you ever hooked up with an ex after the relationship ended?",
    "What makes you instantly swipe right on a dating app?",
    "What makes you instantly swipe left on a dating app?",
    "Have you ever been catfished?",
    "Have you ever had a secret relationship or situationship?",
    "What do you think about role-playing?",
    "Tell the group about the wildest dream you can remember.",
    "What's the wildest thing currently on your bucket list?",
    "What's one mannerism you judge potential partners on?",
    "What's the biggest age gap you've had with another adult?",
    "Who's the most unexpected or inconvenient person you've ever had a crush on? No names required.",
    "Have you ever been to a strip club, and what did you think of it?",
    "If you had to pick an animal, which animal do you find the sexiest of all?",
    "Who is the biggest jerk you’ve ever come across in your life and why?",
    "If the world froze for an afternoon and only you could move and no one could see you or remember what you did, what would you do?",
    "What’s the one thing you would do if you knew there were no consequences?",
    "Have you ever had feelings for two people at the same time?",
    "Have you ever kissed someone mainly to see whether there was chemistry?",
    "What's a boundary you did not realize you needed until a relationship or hookup taught you?",
    "What's a fantasy that sounds better in theory than it probably would in real life?",
    "Would you date someone whose lifestyle was completely different from yours?",
    "Have you ever pretended not to be jealous when you definitely were?",
    "What's the longest you've kept a crush secret?",
    "Have you ever rekindled something you already knew probably would not work?",
    "What's the quickest someone has ever won you over?",
    "Would you rather have incredible chemistry or near-perfect compatibility?",
    "What's a compliment you'd love to hear in bed?",
    "Who's your biggest 'hear me out' celebrity crush?",
    "Who here would you trust most to set you up on a blind date?",
    "Who here would give the best flirting advice?",
    "What's the boldest thing you've done to get someone's attention?",
    "Have you ever deleted or unsent a message because it was too bold?",
    "Have you ever kissed someone because of a dare?",
    "Have you ever had intense chemistry with someone you knew was a bad idea?",
    "What's your go-to compliment when you're flirting?",
    "What's a common relationship rule you do not personally agree with?",
    "What's a romantic gesture you secretly love?",
    "Would you rather be pursued or do the pursuing?",
    "What's something intimate that has nothing to do with sex?",
    "What's the boldest outfit you've ever worn in public?",
    "Have you ever been attracted to someone mainly because of their confidence?",
    "What's the most awkward thing that's happened after a hookup?",
    "Have you ever called someone the wrong name during a date or romantic moment?",
    "Have you ever lied or exaggerated about your dating or sexual experience?",
    "What's the most unexpected place you've met someone you were attracted to?",
    "Have you ever fallen for someone you initially disliked?",
    "What's the fastest you've ever caught feelings for someone?",
    "Have you ever ignored a red flag because the chemistry was too good?",
    "What's one romantic or sexual question you wish people asked more honestly?",
    "What would make you immediately leave a date?",
    "Have you ever matched with someone on a dating app whom you already knew?",
    "Would you rather date someone much funnier than you or much more ambitious than you?",
    "What's your most chaotic dating-app story?",
    "Have you ever acted more confident than you felt while flirting?",
    "Would you rather have a perfect first kiss or a perfect first date?",
    "What made your best kiss memorable? No names required.",
    "Have you ever sent someone a naughty picture?",
    "Have you ever fallen asleep during sex?",
    "Have you ever kissed a complete stranger?",
    "What's one thing you would want a future partner to understand about you early on?"
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

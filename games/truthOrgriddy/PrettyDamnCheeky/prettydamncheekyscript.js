const players = [];
let currentPlayerIndex = 0;
let points = {};
let griddyPoints = {};
let actions = {};
const questions = [
    "What's your deepest, darkest secret?",
    "Have you ever cheated on a significant other?",
    "What's the most illegal thing you've ever done?",
    "If you could erase one person from your life, who would it be?",
    "What's the most regrettable thing you've done for money?",
    "Have you ever stolen something significant?",
    "What's the most embarrassing thing you've done in public?",
    "What's your most controversial opinion?",
    "Have you ever spread a rumor that hurt someone's reputation?",
    "What's the most hurtful thing you've said to someone you care about?",
    "Have you ever betrayed a friend's confidence?",
    "What's the most unethical decision you've made at work?",
    "Have you ever pretended to be someone you're not to impress someone else?",
    "What's the most inappropriate thing you've done at a family gathering?",
    "Have you ever lied about your qualifications to get a job?",
    "What's the worst thing you've ever said about someone when they weren't around?",
    "Have you ever cheated on a test or exam?",
    "What's the most dangerous situation you've willingly put yourself in?",
    "Have you ever ghosted someone without giving an explanation?",
    "What's the most deceitful thing you've done to get out of trouble?",
    "Have you ever sabotaged someone else's success out of jealousy?",
    "What's the most manipulative thing you've done to get your way?",
    "Have you ever taken credit for someone else's work or idea?",
    "What's the most inappropriate place you've taken a selfie?",
    "Have you ever lied about your age to get into a place or event?",
    "What's the most disgusting habit you have that no one knows about?",
    "Have you ever intentionally destroyed someone else's property?",
    "What's the most embarrassing thing you've searched for on the internet?",
    "Have you ever betrayed a confidence shared in confidence by a friend?",
    "What's the most disgusting thing you've eaten on a dare?",
    "Have you ever pretended to be sick to get out of something?",
    "What's the most inappropriate joke you've ever laughed at?",
    "Have you ever regretted helping someone in need?",
    "What's the most uncomfortable truth you've had to confront about yourself?",
    "Have you ever used someone else's toothbrush without them knowing?",
    "What's the most inappropriate message you've sent to the wrong person?",
    "Have you ever secretly looked through someone else's phone or computer?",
    "What's the most selfish thing you've done in a relationship?",
    "Have you ever lied about a family member to avoid judgment?",
    "What's the most inappropriate outfit you've worn in public?",
    "Have you ever knowingly spread false information about someone?",
    "What's the most illegal thing you've witnessed someone else do?",
    "Have you ever ignored someone because you didn't want to deal with them?",
    "What's the most reckless thing you've done while driving?",
    "Have you ever betrayed a friend to advance your own interests?",
    "What's the most disrespectful thing you've said to a teacher or boss?",
    "Have you ever participated in cyberbullying?",
    "What's the most insensitive comment you've made about someone's appearance?",
    "Have you ever taken credit for someone else's idea?",
    "What's the most inappropriate thing you've done at work?",
    "Have you ever intentionally ruined a surprise for someone?",
    "What's the most inappropriate thing you've done in someone else's home?",
    "Have you ever lied about a family member's death for personal gain?",
    "What's the most insensitive comment you've made about someone's background?",
    "Have you ever lied about your relationship status for personal gain?",
    "What's the most inappropriate comment you've made in a professional setting?",
    "Have you ever intentionally damaged someone else's property out of anger?",
    "What's the most disrespectful thing you've done during a serious conversation?",
    "Have you ever betrayed a friend for a romantic interest?",
    "What's the most inappropriate thing you've done during a job interview?",
    "Have you ever cheated in a game for personal gain?",
    "What's the most hurtful thing you've said to a family member?",
    "Have you ever lied about your health to avoid responsibility?",
    "What's the most inappropriate thing you've done at a funeral?",
    "Have you ever lied about your intentions to manipulate someone?",
    "What's the most insensitive comment you've made about someone's abilities?",
    "Have you ever used someone else's account without their knowledge?",
    "What's the most disrespectful thing you've done during an argument?",
    "Have you ever lied about your feelings to lead someone on?",
    "What's the most inappropriate thing you've done at a wedding?",
    "Have you ever betrayed a secret to gain favor with someone else?",
    "What's the most disrespectful thing you've said to a close friend?",
    "Have you ever lied about your identity for personal gain?",
    "What's the most inappropriate thing you've done at a religious ceremony?",
    "Have you ever betrayed a trust to protect your own reputation?",
    "What's the most insensitive comment you've made about someone's beliefs?",
    "Have you ever lied about your past to make yourself look better?",
    "What's the most inappropriate thing you've done during a serious discussion?",
    "Have you ever betrayed a friend for financial gain?",
    "What's the most disrespectful thing you've done during a celebration?",
    "Have you ever lied about your knowledge or expertise to impress someone?",
    "What's the most inappropriate thing you've done in a place of worship?",
    "Have you ever betrayed a family member for personal gain?",
    "What's the most insensitive comment you've made about someone's appearance?",
    "Have you ever lied about your experiences to fit in with a group?",
    "What's the most disrespectful thing you've done during a family gathering?",
    "Have you ever betrayed a friend for personal advancement?",
    "What's the most inappropriate thing you've done at a social event?",
    "Have you ever lied about your relationship status to pursue someone else?",
    "What's the most insensitive comment you've made about someone's background?",
    "Have you ever betrayed a trust to avoid facing consequences?",
    "What's the most inappropriate thing you've done during a serious meeting?",
    "Have you ever lied about your abilities to get a job or position?",
    "What's the most disrespectful thing you've said to a romantic partner?",
    "Have you ever betrayed a close friend for personal gain?",
    "What's the most inappropriate thing you've done at a public event?",
    "Have you ever lied about your intentions to manipulate a situation?",
    "What's the most insensitive comment you've made about someone's family?",
    "Have you ever betrayed a friend for personal satisfaction?",
    "What's the most disrespectful thing you've done during a private moment?",
    "What kind of pajamas do you prefer to sleep in?",
    "Have you ever burnt yourself while cooking or baking?",
    "What type of adventure sounds the most appealing to you?",
    "Have you ever gotten a speeding ticket?",
    "Do you have any secret tattoos?",
    "Who comes to your mind as the ideal couple?",
    "How many selfies do you take in a week?",
    "How many people in this group have you had a crush on?",
    "When you're watching scary movies, do you have to have something to hide behind?",
    "Which do you prefer, Xbox, PC or PlayStation?",
    "How often do you listen to Christmas music?",
    "How often do you change your clothes?",
    "Do you abide by the five-second rule when you drop food?",
    "Have you lied about your grades?",
    "Would you accept an arranged marriage?",
    "Do you make excuses to skip going out and opt for a night in?",
    "How many times have you been fired?",
    "Does your pet sleep in bed with you?",
    "Have you ever eaten your own boogers, intentionally?",
    "What embarrassing type of music do you enjoy listening to?",
    "Have you ever had a total meltdown in public?",
    "Have you ever worn your parent's clothing?",
    "Would you accept $1000 to stay in a haunted house for a weekend?",
    "Have you had a recurring nightmare?",
    "Were you, or are you still, afraid of clowns as a child?",
    "Have you ever tried to successfully summon anything with a Ouija board?",
    "If you were dared to eat a cockroach for $50, would you?",
    "Are you afraid to look out your dark window at night?",
    "Have you ever been caught shoplifting?",
    "Do you prefer to get drunk before sleeping with someone?",
    "What's your craziest one-night stand story?",
    "Have you ever accidentally sent a dirty text to the wrong recipient?",
    "Have you ever recorded a dirty tape?",
    "What's the most embarrassing experience you've had while in bed?",
    "Have you ever used a dating app?",
    "Has a teacher ever flirted with you? Or, have you ever flirted with a teacher?",
    "What's something sexy that you want to try?",
    "Which came first, your teenage years or losing your virginity?",
    "Do you ever go without protection while in bed?",
    "Have you joined the mile high club?",
    "Who would you rather go out with, your favorite celebrity or your long-time crush?",
    "Have you ever done the deed at work?",
    "What's your favorite position in bed?",
    "Are you noisy or quiet while doing the horizontal tango?",
    "Do you like to read smutty romance novels?",
    "How many people have you slept with?",
    "Have you ever sexted someone you just met?",
    "Have you ever tried to hook up with your best friend's crush?",
    "Who was the worst performer out of everyone you've slept with?",
    "How much money do you spend on toys from the adult toy store?",
    "Have you ever been in a serious relationship with a coworker?",
    "Have you ever passed out drunk while in bed with someone?",
    "Who was the first person you fell in love with?",
    "Have you ever walked in on someone while they're getting intimate with someone?",
    "If no one would ever know, who's the first person you'd get down and dirty with?",
    "Have you ever flirted with a cop to get out of a ticket?",
    "Do you have anything on your cell phone that you hide from everyone?",
    "What color is your underwear?",
    "Would you say it's easy for you to be seduced?",
    "Have you ever cheated in past relationships?",
    "Have you ever given your partner a sexy dance?",
    "What 'type' do you prefer to hook up with?",
    "How many times a week do you crave intimacy?",
    "What's one thing about your partner that really turns you on?",
    "Does going to a strip club interest you?",
    "Have you gotten intimate in public?",
    "What's a fantasy of yours that has yet to happen?",
    "Do you and your partner watch adult movies together?",
    "What's the naughtiest dream you've ever had?",
    "Do you prefer an open partnership?",
    "What about you do you think turns me on?",
    "Have you ever given a fake number to someone who was hitting on you?",
    "What's more important to you, a relationship or your career?",
    "Would you kiss the person next to you?",
    "Have you cyberstalked anyone in this room?",
    "Have you ever sneaked out of a date?",
    "What's the worst breakup you've been a part of?",
    "Describe yourself in the sexiest way you know how.",
    "Does size really matter?",
    "What's the naughtiest thing you've ever done?",
    "How many partners have you cheated on?",
    "Have you ever gotten a fake number from someone?",
    "Do you think you're a good partner in bed?",
    "What's your best move?",
    "What time of day are you the most interested in certain bedroom activities?",
    "What do you like to call your partner in bed?",
    "If you could erase one day from your past, which day would it be and why?",
    "What's the riskiest decision you've ever made, and did it pay off?",
    "If you had the chance to switch lives with someone for a day, who would it be and why?",
    "What's a dream you've never shared with anyone because it seems too wild or unrealistic?",
    "If you could break any law with no consequences, what would you do?",
    "What's the most rebellious thing you've ever done as a teenager?",
    "If you were to write a tell-all book about your life, what would the title be?",
    "Have you ever had a near-death experience, and how did it change you?",
    "If you could confront your younger self, what advice would you give?",
    "What's the most intense or risky adventure you've been on?",
    "If you could live in a fictional universe for a month, which one would it be?",
    "What's a secret talent or skill you have that most people don't know about?",
    "If you had to spend a year alone on a deserted island, what three things would you bring?",
    "What's the boldest career move you've ever made, and what did you learn from it?",
    "If you had the power to change one global issue instantly, what would it be?",
    "What's the wildest party or event you've ever attended?",
    "If you could relive one day of your life, which day would it be and why?",
    "Have you ever had a life-changing encounter with a stranger?",
    "What's the craziest dare you've ever accepted?",
    "If you could have a conversation with your future self, what would you ask?",
    "What's the most significant risk you've taken for love?",
    "If you could witness any historical event, what would it be and why?",
    "What's the most unusual or daring goal on your bucket list?",
    "Have you ever challenged a societal norm, and what was the outcome?",
    "If you could spend a day as the opposite gender, what would you do?",
    "What's the most adrenaline-pumping experience you've had?",
    "If you could choose any skill or ability to master instantly, what would it be?",
    "Have you ever been in a situation where you had to rely solely on your instincts?",
    "What's a personal belief or conviction you hold that not many people agree with?",
    "If you could have a conversation with any historical figure, living or dead, who would it be and what would you talk about?"
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

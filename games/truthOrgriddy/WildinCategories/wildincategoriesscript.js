const players = [];
let currentPlayerIndex = 0;
let points = {};
let griddyPoints = {};
let actions = {};
const questions = [
    "Everyone go around and name a country. First to repeat, hesitate, or fail takes 2 drinks!",
    "Start with the word 'cat' and go around naming rhyming words. First to repeat, hesitate, or fail takes 2 drinks!",
    "Compare shoes. Whoever is wearing the largest shoe size takes 1 drink. If nobody knows their size, compare shoe length; ties each take 1 drink!",
    "Choose two players for a staring contest. First to blink, look away, or laugh takes 2 drinks!",
    "Everyone go around and name a U.S. president. First to repeat, hesitate, or fail takes 2 drinks!",
    "On three, point to the player most likely to text an ex tonight. The player with the most votes takes 1 drink; ties each take 1!",
    "The group decides who is dressed most formally. That player takes 1 drink; ties each take 1!",
    "Everyone go around and name a capital city. First to repeat, hesitate, or fail takes 2 drinks!",
    "Go around naming words that begin with the final letter of the previous word. First to repeat a word, hesitate, or fail takes 2 drinks!",
    "On three, point to the player most likely to survive a zombie apocalypse. The player with the most votes gives out 2 drinks; ties give out 1 each!",
    "Everyone go around and name a brand of car. First to repeat, hesitate, or fail takes 2 drinks!",
    "The player who drew this card may place a thumb on the table at any moment before the next prompt ends. The last player to copy them takes 1 drink!",
    "The youngest player takes 1 drink. If multiple players are tied for youngest, they each take 1!",
    "Everyone go around and name a movie. First to repeat, hesitate, or fail takes 2 drinks!",
    "Choose two players for rock-paper-scissors, best of three. The loser takes 2 drinks!",
    "The first player makes an animal sound. Continue around the circle, repeating every previous sound before adding a new one. First to mess up takes 2 drinks!",
    "On three, point to the player most likely to have the most embarrassing photo on their phone. The player with the most votes takes 1 drink; no photo reveal required!",
    "Everyone go around and name a type of fruit. First to repeat, hesitate, or fail takes 2 drinks!",
    "For the next 30 seconds, nobody may say the word 'drink.' The first person who says it takes 1 drink!",
    "Pass an imaginary object around the circle. Each player must change its size, weight, or shape using only gestures. First to hesitate or break character takes 2 drinks!",
    "Count from 1 to 21 with no assigned turn order. If two people speak at once, both take 1 drink and the group restarts at 1!",
    "Everyone go around and name a famous actor. First to repeat, hesitate, or fail takes 2 drinks!",
    "Everyone looks down. On three, look directly at another player. Any pair making eye contact takes 1 drink!",
    "Count how many usable pockets each player is wearing. Whoever has the most takes 1 drink; ties each take 1!",
    "Choose two players. They may only speak in questions to each other. First to pause, answer normally, or repeat a question takes 2 drinks!",
    "Nobody may speak for 20 seconds. The first person to talk takes 2 drinks; if nobody talks, the player who drew this card takes 1 drink!",
    "Everyone go around and name a book title. First to repeat, hesitate, or fail takes 2 drinks!",
    "On three, point to the player most likely to get lost while following GPS. The player with the most votes takes 1 drink; ties each take 1!",
    "Start with any word and continue with immediate word associations around the circle. First to hesitate or give an unrelated answer takes 2 drinks!",
    "Create a one-word story around the circle. First to hesitate, repeat a word, or make the sentence impossible takes 2 drinks!",
    "Everyone must freeze immediately. The last person to stop moving takes 2 drinks!",
    "Everyone go around and name a color. First to repeat, hesitate, or fail takes 2 drinks!",
    "The oldest player takes 1 drink. If multiple players are tied for oldest, they each take 1!",
    "Choose two players for a best-of-one thumb war. The loser takes 2 drinks!",
    "Whisper a short phrase to the player on your left and pass it around the circle once. If the final phrase is wrong, everyone except the original speaker takes 1 drink!",
    "Hold a rock-paper-scissors tournament. Pair off until one champion remains; an unpaired player gets a bye. Everyone the champion defeated takes 1 drink!",
    "Everyone go around and name a famous athlete. First to repeat, hesitate, or fail takes 2 drinks!",
    "On three, point to the player most likely to become famous. The player with the most votes gives out 2 drinks; ties give out 1 each!",
    "The player who drew this card gives three rapid 'Captain Says' commands. Anyone who follows a command without hearing 'Captain says' takes 1 drink!",
    "Everyone secretly chooses a number from 1 to 5 and reveals fingers at the same time. Anyone whose number matches another player's number takes 1 drink!",
    "Everyone go around and name a song title. First to repeat, hesitate, or fail takes 2 drinks!",
    "Go around singing or humming a different recognizable song. First to repeat a song or fail to start within three seconds takes 2 drinks!",
    "Whoever arrived at the gathering most recently takes 1 drink. If multiple players arrived together, they each take 1!",
    "On three, point to the player most likely to laugh during a serious moment. The player with the most votes takes 1 drink; ties each take 1!",
    "Everyone go around and name a TV show. First to repeat, hesitate, or fail takes 2 drinks!",
    "Strike a ridiculous pose immediately. The last person to pose takes 2 drinks!",
    "Choose a partner. One player moves in slow motion while the other mirrors them for 10 seconds. The first to break character takes 2 drinks!",
    "Whoever has the longest hair takes 1 drink. If it is too close to tell, the group votes; ties each take 1!",
    "For the next 20 seconds, nobody may show their teeth. The first person caught showing teeth takes 1 drink!",
    "On three, point to the player most likely to spill a drink tonight. The player with the most votes takes 1 drink; ties each take 1!",
    "Everyone go around and name a famous singer. First to repeat, hesitate, or fail takes 2 drinks!",
    "Start with the word 'light' and go around naming rhyming words. First to repeat, hesitate, or fail takes 2 drinks!",
    "Whoever is wearing the brightest-colored clothing takes 1 drink. If it is unclear, the group votes; ties each take 1!",
    "On three, point to the player most likely to fall asleep first tonight. The player with the most votes takes 1 drink; ties each take 1!",
    "Pass one clap around the circle. Two claps reverse the direction. First to clap out of turn takes 2 drinks!",
    "Create a sound effect and pass it left. Each player must copy it exactly before creating a new sound. First to mess up takes 2 drinks!",
    "Everyone checks their phone battery percentage. The player with the lowest percentage takes 1 drink; ties each take 1!",
    "Choose two players to say 'Red leather, yellow leather' three times quickly. The first to mess up takes 2 drinks!",
    "The first player performs one gesture. Continue around the circle, repeating all previous gestures before adding one. First to mess up takes 2 drinks!",
    "Everyone go around and name a vegetable. First to repeat, hesitate, or fail takes 2 drinks!",
    "On three, point to the player most likely to forget a friend's birthday. The player with the most votes takes 1 drink; ties each take 1!",
    "Whose next birthday is soonest? That player takes 1 drink; anyone sharing that birthday also takes 1!",
    "Everyone says their first name backward. Anyone who cannot do it within three seconds takes 1 drink!",
    "Everyone secretly chooses either their left or right hand and reveals at the same time. Players who chose the less popular hand take 1 drink; a tie means nobody drinks!",
    "On three, point to the player most likely to win a reality competition show. The player with the most votes gives out 2 drinks; ties give out 1 each!",
    "Choose two players. Each shows 1 or 2 fingers at the same time; one calls odd and the other even. Add the fingers, and the losing caller takes 2 drinks!",
    "Everyone go around and name an animal. First to repeat, hesitate, or fail takes 2 drinks!",
    "The tallest player takes 1 drink. If it is too close to tell, stand back-to-back; ties each take 1!",
    "Choose two players for a silent face-off. The first to laugh or make a sound takes 2 drinks!",
    "One player acts out an animal without speaking. The first person to guess correctly chooses someone to take 1 drink!",
    "On three, point to the player most likely to send a risky text and immediately regret it. The player with the most votes takes 1 drink; ties each take 1!",
    "Everyone go around and name a board game. First to repeat, hesitate, or fail takes 2 drinks!",
    "The shortest player takes 1 drink. If it is too close to tell, stand back-to-back; ties each take 1!",
    "Pass a clap around the circle, adding one extra clap each turn. First to use the wrong number of claps takes 2 drinks!",
    "On three, point to the player most likely to arrive late to their own event. The player with the most votes takes 1 drink; ties each take 1!",
    "Everybody stand up, if safe and comfortable. The last person fully standing takes 1 drink!",
    "Without speaking, line up from shortest to tallest. The final person to reach the correct position takes 1 drink!",
    "Everyone reaches to touch something blue without running. The last person to touch a blue object takes 2 drinks!",
    "Everyone go around and name a dessert. First to repeat, hesitate, or fail takes 2 drinks!",
    "Choose two players. One calls 'same' or 'different,' then both reveal 1 to 5 fingers. If the call is wrong, the caller takes 2 drinks; if correct, the other player takes 2 drinks!",
    "Count the distinct colors visible in each player's outfit. Whoever is wearing the most colors takes 1 drink; ties each take 1!",
    "Build a sentence around the circle, one word at a time. First to hesitate or make the sentence impossible takes 2 drinks!",
    "The player who drew this card asks rapid-fire questions for 30 seconds. Anyone who answers with 'yes' or 'no' takes 1 drink!",
    "On three, point to the player most likely to become a millionaire. The player with the most votes gives out 2 drinks; ties give out 1 each!",
    "Arrange players by first name alphabetically. The player whose name comes first takes 1 drink; exact matching names each take 1!",
    "Everyone go around and name a video game. First to repeat, hesitate, or fail takes 2 drinks!",
    "Everyone immediately raises both hands. The last person with both hands up takes 1 drink!",
    "On three, point to the player most likely to talk their way out of a parking ticket. The player with the most votes gives out 2 drinks; ties give out 1 each!",
    "Choose two players to make faces at each other without touching. The first to laugh takes 2 drinks!",
    "On three, point to the player most likely to start the dance floor at a party. The player with the most votes gives out 2 drinks; ties give out 1 each!",
    "Everyone go around and name a holiday. First to repeat, hesitate, or fail takes 2 drinks!",
    "Whoever traveled the farthest to reach this gathering takes 1 drink. If multiple players traveled together from the same place, they each take 1!",
    "Pair up and play one round of rock-paper-scissors. Every loser takes 1 drink; an unpaired player is safe!",
    "Everyone says a number from 1 to 10 at the same time. Anyone who matches another player's number takes 1 drink!",
    "On three, point to the player most likely to lose their phone during a night out. The player with the most votes takes 1 drink; ties each take 1!",
    "Everyone go around and name a beverage. First to repeat, hesitate, or fail takes 2 drinks!",
    "Count the visible buttons and zippers on each player's outfit. Whoever has the most takes 1 drink; ties each take 1!",
    "The first player to show an object beginning with B chooses another player to take 1 drink. No running!",
    "For the next three prompts, nobody may use another player's first name. The first person who does takes 1 drink!",
    "The player who drew this card creates one harmless rule lasting through the next three prompts. Anyone who breaks it takes 1 drink!"
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

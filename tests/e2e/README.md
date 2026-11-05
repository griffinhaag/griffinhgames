# End-to-end tests

These tests open the site in a real browser and play each game the way people do: typing names, clicking buttons, and (for LOCKED IN) running a host and several players in separate tabs against the real game server.

## Running them

You need Node 18+ and the [game server](https://github.com/griffinhaag/griffinhgames-server) cloned next to this repo, with its dependencies installed (`npm install` in that folder).

```bash
cd tests/e2e
npm install
npx playwright install chromium   # first time only

npm test                # everything (takes about 5 minutes)
npm test -- local       # just Truth or Griddy, Kings Dice, and the homepage (under a minute)
npm test -- locked-in   # just LOCKED IN
```

The runner starts its own copy of the site on port 8080 and the game server on port 3000, then prints a ✓ or ✗ for each test, with the reason for any failure. If the server lives somewhere else, set `SERVER_DIR=/path/to/griffinhgames-server`.

## What's covered

**Homepage** ([local-games.test.mjs](local-games.test.mjs))
- No error or loading message, and every game link opens

**Truth or Griddy**, run once for each of the four decks
- Duplicate player names are rejected
- The first turn shows a real player and question, and no question is skipped
- Answered and Griddy are scored correctly
- No question repeats through the whole deck, and Game Over appears at the end
- Player names show as plain text

**Kings Dice and Custom Kings Dice**
- A roll shows a rule and highlights it on the board, with matching wording
- Inflate passes the turn, and is ignored while the dice are still rolling
- The balloon pops within 18 pumps
- Custom rules are used even if you didn't press Save, blank rules fall back to the classic ones, and saved rules survive a reload
- Names and rule text show as plain text

**How to Play buttons**
- On every start page, the pop-up opens with the right title and closes with ✕ or Esc

**LOCKED IN** ([locked-in.test.mjs](locked-in.test.mjs))
- A full game with multiple-choice and OFF THE DOME rounds, the end screen, and Play Again
- An answer or name containing HTML is shown as text, never run as code
- The end screen stays put when a player leaves
- A broken answer doesn't freeze the round, and the "Question flagged" message stays visible
- If the host drops while paused, the new host can resume
- If the host leaves the lobby, the new host gets the crown and kick buttons
- A kicked player can't rejoin
- After switching devices, the old tab's Rejoin button works
- Music On starts the lobby music right away, question music plays by itself, and Music Off is silent, including after a reload mid-question
- Round music is never heard in the lobby, even when a slow connection makes the player buffer
- Every option on the setup page reaches the game exactly as chosen

The game server has its own unit tests (`npm test` in that repo), which also run on GitHub on every push.

const players = [];
let currentPlayerIndex = 0;
let points = {};
let griddyPoints = {};
let actions = {};
const questions = [
    "Everyone go around and name a country. First to repeat, hesitate, or fail hits the griddy twice!",
    "Start with the word 'cat' and go around naming rhyming words. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Compare shoes. Whoever is wearing the largest shoe size gets bragging rights for the night, no griddy required!",
    "Choose two players for a staring contest. First to blink, look away, or laugh catches two griddys!",
    "Everyone go around and name a U.S. president. First to repeat, hesitate, or fail owes the griddy twice!",
    "On three, point to the player most likely to text an ex tonight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "The group decides who is dressed most formally. That player earns a round of applause, no griddy needed!",
    "Everyone go around and name a capital city. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Go around naming words that begin with the final letter of the previous word. First to repeat a word, hesitate, or fail takes two griddys!",
    "On three, point to the player most likely to survive a zombie apocalypse. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "Everyone go around and name a brand of car. First to repeat, hesitate, or fail does the griddy, twice!",
    "The player who drew this card may place a thumb on the table at any moment before the next prompt ends. The last player to copy them catches a griddy!",
    "The youngest player gets to bask in the glory of being the baby of the group, no griddy this time!",
    "Everyone go around and name a movie. First to repeat, hesitate, or fail locks in two griddys!",
    "Choose two players for rock-paper-scissors, best of three. The loser hits the griddy twice!",
    "The first player makes an animal sound. Continue around the circle, repeating every previous sound before adding a new one. First to mess up racks up two griddys!",
    "On three, point to the player most likely to have the most embarrassing photo on their phone. The player with the most votes hits the griddy once; no photo reveal required!",
    "Everyone go around and name a type of fruit. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "For the next 30 seconds, nobody may say the word 'griddy.' The first person who says it hits the griddy once!",
    "Pass an imaginary object around the circle. Each player must change its size, weight, or shape using only gestures. First to hesitate or break character catches two griddys!",
    "Count from 1 to 21 with no assigned turn order. If two people speak at once, both hit the griddy once and the group restarts at 1!",
    "Everyone go around and name a famous actor. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone looks down. On three, look directly at another player. Any pair making eye contact hits the griddy once!",
    "Count how many usable pockets each player is wearing. Whoever has the most gets bragging rights, no griddy attached!",
    "Choose two players. They may only speak in questions to each other. First to pause, answer normally, or repeat a question takes two griddys!",
    "Nobody may speak for 20 seconds. The first person to talk hits the griddy twice; if nobody talks, the player who drew this card hits the griddy once!",
    "Everyone go around and name a book title. First to repeat, hesitate, or fail does the griddy, twice!",
    "On three, point to the player most likely to get lost while following GPS. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "Start with any word and continue with immediate word associations around the circle. First to hesitate or give an unrelated answer catches two griddys!",
    "Create a one-word story around the circle. First to hesitate, repeat a word, or make the sentence impossible locks in two griddys!",
    "Everyone must freeze immediately. The last person to stop moving hits the griddy twice!",
    "Everyone go around and name a color. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "The oldest player earns the group's respect, no griddy required, just wisdom!",
    "Choose two players for a best-of-one thumb war. The loser hits the griddy twice!",
    "Whisper a short phrase to the player on your left and pass it around the circle once. If the final phrase is wrong, everyone except the original speaker hits the griddy once!",
    "Hold a rock-paper-scissors tournament. Pair off until one champion remains; an unpaired player gets a bye. Everyone the champion defeated hits the griddy once!",
    "Everyone go around and name a famous athlete. First to repeat, hesitate, or fail owes the griddy twice!",
    "On three, point to the player most likely to become famous. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "The player who drew this card gives three rapid 'Captain Says' commands. Anyone who follows a command without hearing 'Captain says' hits the griddy once!",
    "Everyone secretly chooses a number from 1 to 5 and reveals fingers at the same time. Anyone whose number matches another player's number hits the griddy once!",
    "Everyone go around and name a song title. First to repeat, hesitate, or fail takes two griddys!",
    "Go around singing or humming a different recognizable song. First to repeat a song or fail to start within three seconds gets sturdy with the griddy's twice!",
    "Whoever arrived at the gathering most recently gets a warm welcome, no griddy this time!",
    "On three, point to the player most likely to laugh during a serious moment. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "Everyone go around and name a TV show. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Strike a ridiculous pose immediately. The last person to pose hits the griddy twice!",
    "Choose a partner. One player moves in slow motion while the other mirrors them for 10 seconds. The first to break character catches two griddys!",
    "Whoever has the longest hair gets a compliment, no griddy, just good hair energy!",
    "For the next 20 seconds, nobody may show their teeth. The first person caught showing teeth hits the griddy once!",
    "On three, point to the player most likely to spill a griddy tonight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "Everyone go around and name a famous singer. First to repeat, hesitate, or fail does the griddy, twice!",
    "Start with the word 'light' and go around naming rhyming words. First to repeat, hesitate, or fail locks in two griddys!",
    "Whoever is wearing the brightest-colored clothing gets a spotlight moment, no griddy needed!",
    "On three, point to the player most likely to fall asleep first tonight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "Pass one clap around the circle. Two claps reverse the direction. First to clap out of turn catches two griddys!",
    "Create a sound effect and pass it left. Each player must copy it exactly before creating a new sound. First to mess up racks up two griddys!",
    "Everyone checks their phone battery percentage. Whoever has the lowest gets sympathy, no griddy, just a charger!",
    "Choose two players to say 'Red leather, yellow leather' three times quickly. The first to mess up hits the griddy twice!",
    "The first player performs one gesture. Continue around the circle, repeating all previous gestures before adding one. First to mess up takes two griddys!",
    "Everyone go around and name a vegetable. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "On three, point to the player most likely to forget a friend's birthday. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "Whose next birthday is soonest? That player gets an early birthday shoutout, no griddy required!",
    "Everyone says their first name backward. Anyone who cannot do it within three seconds hits the griddy once!",
    "Everyone secretly chooses either their left or right hand and reveals at the same time. Players who chose the less popular hand hit the griddy once; a tie means nobody griddys!",
    "On three, point to the player most likely to win a reality competition show. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "Choose two players. Each shows 1 or 2 fingers at the same time; one calls odd and the other even. Add the fingers, and the losing caller takes two griddys!",
    "Everyone go around and name an animal. First to repeat, hesitate, or fail owes the griddy twice!",
    "The tallest player gets to stand proud, no griddy, just height!",
    "Choose two players for a silent face-off. The first to laugh or make a sound catches two griddys!",
    "One player acts out an animal without speaking. The first person to guess correctly chooses someone to hit the griddy once!",
    "On three, point to the player most likely to send a risky text and immediately regret it. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "Everyone go around and name a board game. First to repeat, hesitate, or fail does the griddy, twice!",
    "The shortest player gets a well-earned compliment, no griddy, just love!",
    "Pass a clap around the circle, adding one extra clap each turn. First to use the wrong number of claps takes two griddys!",
    "On three, point to the player most likely to arrive late to their own event. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "Everybody stand up, if safe and comfortable. The last person fully standing hits the griddy once!",
    "Without speaking, line up from shortest to tallest. The final person to reach the correct position hits the griddy once!",
    "Everyone reaches to touch something blue without running. The last person to touch a blue object catches two griddys!",
    "Everyone go around and name a dessert. First to repeat, hesitate, or fail locks in two griddys!",
    "Choose two players. One calls 'same' or 'different,' then both reveal 1 to 5 fingers. If the call is wrong, the caller takes two griddys; if correct, the other player takes two griddys!",
    "Count the distinct colors visible in each player's outfit. Whoever is wearing the most gets a fashion shoutout, no griddy involved!",
    "Build a sentence around the circle, one word at a time. First to hesitate or make the sentence impossible catches two griddys!",
    "The player who drew this card asks rapid-fire questions for 30 seconds. Anyone who answers with 'yes' or 'no' hits the griddy once!",
    "On three, point to the player most likely to become a millionaire. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "Arrange players by first name alphabetically. The player whose name comes first gets to go first for bragging rights, no griddy attached!",
    "Everyone go around and name a video game. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone immediately raises both hands. The last person with both hands up hits the griddy once!",
    "On three, point to the player most likely to talk their way out of a parking ticket. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "Choose two players to make faces at each other without touching. The first to laugh takes two griddys!",
    "On three, point to the player most likely to start the dance floor at a party. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "Everyone go around and name a holiday. First to repeat, hesitate, or fail does the griddy, twice!",
    "Whoever traveled the farthest to reach this gathering gets a hero's welcome, no griddy, just respect!",
    "Pair up and play one round of rock-paper-scissors. Every loser hits the griddy once; an unpaired player is safe!",
    "Everyone says a number from 1 to 10 at the same time. Anyone who matches another player's number hits the griddy once!",
    "On three, point to the player most likely to lose their phone during a night out. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "Everyone go around and name a beverage. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Count the visible buttons and zippers on each player's outfit. Whoever has the most gets a style point, no griddy, just flair!",
    "The first player to show an object beginning with B chooses another player to hit the griddy once. No running!",
    "For the next three prompts, nobody may use another player's first name. The first person who does hits the griddy once!",
    "The player who drew this card creates one harmless rule lasting through the next three prompts. Anyone who breaks it hits the griddy once!",
    "Everyone go around and name a pizza topping. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a breakfast food. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a fast food chain. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a candy bar. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a type of cheese. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a brand of soda. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name an ice cream flavor. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a type of pasta. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a sandwich. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a spice or seasoning. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a type of bread. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a cocktail. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a coffee drink. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a type of nut. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a seafood dish. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a condiment. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a cereal. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a chip or snack brand. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a kitchen utensil. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a body of water. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a mountain range. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a U.S. state. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a major city outside your own country. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a river. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name an island. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a national park. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a European country. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name an African country. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name an Asian country. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a South American country. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a Canadian province. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name an airline. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name an airport you've flown through. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a way to travel. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a part of a car. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a tool you'd find in a toolbox. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a household appliance. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a piece of furniture. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name something found in a junk drawer. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a cleaning product. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name something found in a bathroom. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a type of flower. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a type of tree. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a bird. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name an insect. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a dog breed. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a cat breed. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a type of fish. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a dinosaur. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a farm animal. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name an animal you'd see at a zoo. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name an ocean creature. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a reptile. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a superhero. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a supervillain. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a Disney movie. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name an animated movie. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a horror movie. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a movie sequel. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a movie villain. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a sitcom. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a reality show. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a game show. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a cartoon character. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a video game character. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a card game. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a sport. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name an Olympic event. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a professional sports team. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a piece of sports equipment. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name an exercise. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a type of workout. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a musical instrument. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a music genre. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a band. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a rapper. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a song from the 2000s. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a Christmas song. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a Disney song. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a karaoke classic. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a dance move. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a viral dance or trend. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name an emoji out loud. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name an app on your phone. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a social media platform. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a website. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a video game console. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a tech company. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a phone or laptop brand. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a clothing brand. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a shoe brand. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name an article of clothing. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name an accessory someone could be wearing. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a hairstyle. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a profession. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a school subject. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a cartoon from your childhood. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a breakfast cereal mascot or brand character. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name something you'd pack for a beach trip. First to repeat, hesitate, or fail hits the griddy twice!",
    "On three, point to the player most likely to cry during a movie tonight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to start a food fight. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to get a tattoo on impulse. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to lose a staring contest. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to win an eating contest. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to fall asleep sitting straight up. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to break something in this room. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to drop their phone in water. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to leave their keys in the front door. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to lock themselves out. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to forget where they parked. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to be recognized by a stranger tonight. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to strike up a conversation with a total stranger. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to get a free drink without asking. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to walk away with someone's number tonight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to still be talking at the end of the night. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to fall for a prank. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to pull off a perfect prank. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to laugh at their own joke first. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to quote a movie in the next ten minutes. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to sing along to the next song that plays. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to know every word to a song nobody else does. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to name a song within two seconds of hearing it. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to win a dance battle. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to refuse to dance no matter what. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to take the longest to get ready. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to change outfits right before leaving. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to wear the same outfit two days in a row. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to own the most shoes. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to borrow clothes and never return them. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to take the most photos tonight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to end up in the most photos tonight. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to post about tonight first. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to delete a post within an hour. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to read every message and reply to none. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to call instead of texting. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to leave a five-minute voice note. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to forget their charger. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to ask to borrow a charger tonight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to have the most cracked screen. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to use the same phone until it dies completely. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to name their car. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to talk to their pet like a person. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to adopt a pet on impulse. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to become a full-blown plant person. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to water a fake plant. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to rearrange their furniture at midnight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to start a project and never finish it. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to buy an entire hobby starter kit and quit. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to have an unopened package at home right now. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to return something long after the deadline. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to keep every single receipt. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to read the entire manual. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to skip the instructions completely. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to build furniture with parts left over. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to fix something with tape and call it done. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to climb on something they absolutely should not. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to carry every grocery bag in one trip. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to cook without measuring a single thing. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to set off a smoke alarm while cooking. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to eat leftovers without checking the date. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to order the weirdest item on the menu. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to order dessert first. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to finish everyone else's leftovers. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to take food home from a party. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to bring a dish nobody asked for. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to host the group next. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to cancel plans first. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to suggest plans and then not show up. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to reply to the group chat last. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to start a group chat nobody asked for. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to rename the group chat every week. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to leave a group chat dramatically. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to keep a streak alive for years. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to remember everyone's birthday. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to forget their own anniversary. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to get lost in their own neighborhood. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to take the scenic route on purpose. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to road trip with no plan at all. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to book a flight in the middle of the night. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to pack an hour before leaving. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to lose their boarding pass. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to talk to a stranger for an entire flight. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to fall asleep before takeoff. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to get upgraded for no reason at all. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to bring the most snacks on a trip. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to survive a week on gas station food. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to get sunburned first. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to swim in freezing water on a dare. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to jump in a pool fully clothed. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to be first into the water at the beach. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to build the best sandcastle. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to start a bonfire singalong. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to tell the best ghost story. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to get scared first in a haunted house. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to stay up the latest tonight. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to trip over absolutely nothing. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to win a thumb war tournament. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "On three, point to the player most likely to argue with a self-checkout machine. The player with the most votes hits the griddy once; ties each hit the griddy once!",
    "On three, point to the player most likely to befriend the bartender in five minutes. The player with the most votes hands out two griddys; ties hand out one griddy each!",
    "Choose two players to say 'She sells seashells by the seashore' three times fast. The first to stumble hits the griddy twice!",
    "Choose two players to say 'Unique New York' five times fast. The first to stumble takes two griddys!",
    "Choose two players to say 'Toy boat' ten times fast. The first to stumble catches two griddys!",
    "Choose two players to say 'Irish wristwatch' three times fast. The first to stumble locks in two griddys!",
    "Choose two players to say 'Six slick slim sycamore saplings' twice. The first to stumble racks up two griddys!",
    "Choose two players to race through the alphabet backward. The first to stumble hits the griddy twice!",
    "Choose two players to count backward from fifty by threes. The first to slip up owes the griddy twice!",
    "Choose two players to alternate naming state capitals. The first to repeat, hesitate, or fail takes two griddys!",
    "Choose two players to alternate naming words that rhyme with 'blue.' The first to repeat or hesitate catches two griddys!",
    "Choose two players to alternate naming colors. The first to repeat or hesitate locks in two griddys!",
    "Choose two players to hold one arm straight out to the side. The first to drop it hits the griddy twice!",
    "Choose two players to balance on one foot. The first to put a foot down takes two griddys!",
    "Choose two players to hold a smile without breaking. The first to break catches two griddys!",
    "Choose two players. One tells a joke while the other holds a straight face. If the listener laughs, they take two griddys; if not, the joke teller does!",
    "Choose two players to trade compliments back and forth. The first to hesitate or repeat one hits the griddy twice!",
    "Choose two players to do their best impression of the same celebrity. The group votes, and the loser takes two griddys!",
    "Choose two players to hold an accent for thirty seconds. The first to break character catches two griddys!",
    "Choose two players to have a conversation with no word containing the letter S. The first to slip locks in two griddys!",
    "Choose two players to talk for thirty seconds without using the word 'the.' The first to slip racks up two griddys!",
    "Choose two players to speak only in movie quotes. The first to hesitate or go off script hits the griddy twice!",
    "Choose two players to answer each other only with song lyrics. The first to hesitate takes two griddys!",
    "Choose two players. One leads and the other mirrors every movement for fifteen seconds. If the mirror breaks, they catch two griddys!",
    "Choose two players to trade clapping patterns, adding one clap each round. The first to miss locks in two griddys!",
    "Choose two players. One hums a song and the other guesses within fifteen seconds. If the guess fails, the guesser takes two griddys!",
    "Choose two players. One draws a shape in the air and the other guesses. A wrong guess costs the guesser two griddys!",
    "Choose two players. One acts out a single word without speaking. If the other cannot guess it, both hit the griddy once!",
    "Choose two players. One acts out an emotion and the other names it. A wrong answer costs two griddys!",
    "Choose two players to alternate naming animals with no repeats. The first to stall catches two griddys!",
    "Choose two players to alternate naming foods with no repeats. The first to stall locks in two griddys!",
    "Choose two players to play word association back and forth. The first to hesitate or repeat racks up two griddys!",
    "Choose two players to count to ten by alternating turns. If they speak over each other, both hit the griddy once!",
    "Choose two players to reveal one, two, or three fingers at the same time. If the numbers match, both hit the griddy once!",
    "Choose two players to shout a color at the same time. If the colors match, both take two griddys!",
    "Choose two players to point in a direction at the same time. If they match, both catch one griddy!",
    "Choose two players for best of three guess-which-hand. The loser hits the griddy twice!",
    "Choose two players to hold eye contact for thirty seconds while the group tries to make them laugh. The first to laugh takes two griddys!",
    "Choose two players to say each other's full name backward. The first to fail catches two griddys!",
    "Choose two players. The group names a word and both must spell it backward. The first to miss locks in two griddys!",
    "Choose two players to name five things in a category in five seconds. The slower player racks up two griddys!",
    "Choose two players. One asks three rapid questions and the other must never say yes or no. A slip costs two griddys!",
    "Choose two players to hold a whole conversation in whispers. The first to raise their voice hits the griddy twice!",
    "Choose two players to speak entirely in slow motion for twenty seconds. The first to speed up takes two griddys!",
    "Choose two players to speak as fast as humanly possible for fifteen seconds. The first to stumble catches two griddys!",
    "Choose two players to arm wrestle if both are comfortable. The loser hits the griddy twice; if either declines, no griddy at all!",
    "Choose two players to guess a coin flip, best of three. The loser locks in two griddys!",
    "Choose two players to alternate naming cities until someone repeats. The repeater racks up two griddys!",
    "Choose two players to alternate naming brands until someone stalls. The staller hits the griddy twice!",
    "Choose two players to name every player in this game in order, fastest wins. The slower player takes two griddys!",
    "Choose two players to recite their own phone number backward. The first to fail catches two griddys!",
    "Choose two players to make the exact same face at the same time. If they do not match, both hit the griddy once!",
    "Everyone reach out and touch something red. The last person to touch something red hits the griddy once!",
    "Everyone touch something wooden. The last person to make contact catches two griddys!",
    "Everyone touch something metal. The last person to make contact hits the griddy once!",
    "Everyone touch something soft. The last person to make contact takes two griddys!",
    "Everyone touch something round. The last person to make contact hits the griddy once!",
    "Everyone put both hands on their head right now. The last person to do it hits the griddy once!",
    "Everyone touch their own nose immediately. The last person to do it catches two griddys!",
    "Everyone touch the floor. The last person to do it hits the griddy once!",
    "Everyone point at the ceiling. The last person to point takes two griddys!",
    "Everyone stand on one foot, if safe and comfortable. The last person balanced hits the griddy once!",
    "Everyone sit down immediately, if you are not already seated. The last person seated hits the griddy once!",
    "Everyone clap exactly once. Anyone who claps twice or not at all hits the griddy once!",
    "Everyone say their own first name at the same time. The last voice heard hits the griddy once!",
    "Everyone shout a number between one and twenty at the same time. Anyone who matches another player hits the griddy once!",
    "Everyone make eye contact with the player directly across from them. The last pair to connect hits the griddy once each!",
    "Everyone move one seat to the left, if the space allows. The last person settled catches two griddys!",
    "Everyone hold up their phone right now. The last phone in the air hits the griddy once!",
    "Everyone announce how many browser tabs they have open. Whoever has the most hits the griddy once!",
    "Everyone take off one shoe. The last person with both shoes on hits the griddy once!",
    "Everyone put both hands behind their back. The last person to do it takes two griddys!",
    "Everyone cross their arms immediately. The last person crossed hits the griddy once!",
    "Everyone spin around once, if safe and comfortable. The last person to finish hits the griddy once!",
    "Everyone jump once, if safe and comfortable. The last person to land catches two griddys!",
    "Everyone whisper the word 'griddy' at the same time. The loudest whisper hits the griddy once!",
    "Everyone name the color of the shirt worn by the player on their right. The first person to get it wrong hits the griddy once!",
    "Everyone point at the tallest player at the same time. Anyone pointing somewhere else hits the griddy once!",
    "Without speaking, line up in order of birthday month. The last person in the correct spot hits the griddy once!",
    "Without speaking, line up alphabetically by first name. Anyone out of place hits the griddy once!",
    "Without speaking, line up in order of shoe size. The last person to settle catches two griddys!",
    "Everyone hold their breath at the same time. The first person to breathe hits the griddy once!",
    "Everyone hum the same note together. The first person to run out of breath hits the griddy once!",
    "Everyone freeze in a pose and hold it for fifteen seconds. The first person to move takes two griddys!",
    "Everyone balance on one foot with their eyes closed. The first person to wobble out hits the griddy once!",
    "Everyone make the weirdest face they can at the same time. The group picks the tamest face, and that player hits the griddy once!",
    "Everyone do their best robot impression at once. The group picks the least convincing, and that player hits the griddy once!",
    "Everyone do their best animal impression at the same time. The group picks the weakest, and that player hits the griddy once!",
    "Everyone hit the griddy right now, all at once. The last person still standing still hits it one more time!",
    "Everyone give the player on their left a high five. The last high five given hits the griddy once!",
    "Everyone say one nice thing about the player on their right. The first to hesitate hits the griddy once!",
    "Everyone name the last app they opened. The first to hesitate hits the griddy once!",
    "Everyone name the last thing they ate. The first to hesitate catches two griddys!",
    "Everyone name a country starting with the same letter as their own first name. Anyone who cannot hits the griddy once!",
    "Everyone name a word that rhymes with their own first name. Anyone who cannot hits the griddy once!",
    "Everyone say a word starting with the last letter of the previous player's name. First to fail hits the griddy twice!",
    "Everyone show how many alarms are set on their phone. Whoever has the most hits the griddy once!",
    "Everyone name the last song they played. The first to hesitate hits the griddy once!",
    "Everyone raise a hand if they have ever hit the griddy in public. Anyone with a hand down hits the griddy once!",
    "Everyone point at whoever has been quietest so far. That player hits the griddy once and gets the next prompt!",
    "Everyone point at whoever has been loudest so far. That player hits the griddy once and has to whisper for two prompts!",
    "Everyone name a word that starts with the letter G. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone show their hands palms up at the same time. The last pair of palms up hits the griddy once!",
    "Start with the word 'star' and go around naming rhyming words. First to repeat, hesitate, or fail takes two griddys!",
    "Start with the word 'moon' and go around naming rhyming words. First to repeat, hesitate, or fail catches two griddys!",
    "Start with the word 'green' and go around naming rhyming words. First to repeat, hesitate, or fail hits the griddy twice!",
    "Start with the word 'shake' and go around naming rhyming words. First to repeat, hesitate, or fail owes the griddy twice!",
    "Start with the word 'sound' and go around naming rhyming words. First to repeat, hesitate, or fail locks in two griddys!",
    "Start with the word 'door' and go around naming rhyming words. First to repeat, hesitate, or fail racks up two griddys!",
    "Start with the word 'chain' and go around naming rhyming words. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Start with the word 'small' and go around naming rhyming words. First to repeat, hesitate, or fail does the griddy, twice!",
    "Start with the word 'fine' and go around naming rhyming words. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Start with the word 'hot' and go around naming rhyming words. First to repeat, hesitate, or fail hits the griddy twice!",
    "Go around naming a food, starting with A and moving one letter forward each turn. First to fail takes two griddys!",
    "Go around naming an animal, starting with A and moving one letter forward each turn. First to fail catches two griddys!",
    "Go around naming a first name, starting with A and moving one letter forward each turn. First to fail locks in two griddys!",
    "Go around naming a place, starting with A and moving one letter forward each turn. First to fail racks up two griddys!",
    "Go around naming a word with exactly three letters. First to repeat, hesitate, or fail hits the griddy twice!",
    "Go around naming a word with exactly seven letters. First to repeat, hesitate, or fail takes two griddys!",
    "Go around naming a word containing the letter Z. First to repeat, hesitate, or fail catches two griddys!",
    "Go around naming a word with a double letter in it. First to repeat, hesitate, or fail owes the griddy twice!",
    "Go around naming a word that starts and ends with the same letter. First to fail locks in two griddys!",
    "Go around naming a word that begins with the letter Q. First to repeat, hesitate, or fail racks up two griddys!",
    "Go around the circle spelling one group-chosen word backward, one letter per player. First to slip hits the griddy twice!",
    "Say the alphabet around the circle, skipping every vowel. First to slip takes two griddys!",
    "Count to thirty around the circle, but say 'griddy' instead of every multiple of five. First to slip catches two griddys!",
    "Count to twenty around the circle, but clap instead of saying every multiple of three. First to slip hits the griddy twice!",
    "Count around the circle by sevens up to seventy. First to slip locks in two griddys!",
    "Count down from thirty by twos around the circle. First to slip racks up two griddys!",
    "The player who drew this card picks a secret number from one to twenty. Everyone guesses once, and whoever is furthest off hits the griddy twice!",
    "Everyone holds up any number of fingers at the same time. If the total is odd, the player who drew this card hits the griddy once; if even, everyone else does!",
    "Everyone reveals one to five fingers at the same time. The highest number hits the griddy once; ties each hit the griddy once!",
    "Everyone reveals one to five fingers at the same time. The lowest number hits the griddy once; ties each hit the griddy once!",
    "Count around the circle, but clap instead of saying any number containing a seven. First to slip catches two griddys!",
    "Say the alphabet with no assigned turn order and no overlapping. If two people speak at once, both hit the griddy once and the group restarts at A!",
    "Go around the circle saying 'I went to the store and bought' plus an item, repeating every item before yours. First to slip takes two griddys!",
    "Go around the circle saying 'I packed my suitcase and put in' plus an item, repeating the whole list first. First to slip catches two griddys!",
    "Go around the circle saying every previous player's name in order before your own. First to slip hits the griddy twice!",
    "The first player invents a dance move. Continue around the circle, repeating every move before adding one. First to mess up locks in two griddys!",
    "The first player makes a face. Continue around the circle, repeating every face before adding one. First to mess up racks up two griddys!",
    "Go around the circle naming a color, repeating every previous color first. First to slip takes two griddys!",
    "Go around the circle saying 'I'm going on a road trip and bringing' plus an item, repeating the full list. First to slip catches two griddys!",
    "The first player says a single digit. Continue around the circle, repeating the whole number and adding one digit. First to slip hits the griddy twice!",
    "The first player creates a stomp, clap, or snap rhythm. Continue around, repeating it all and adding one beat. First to mess up locks in two griddys!",
    "For the next three prompts, nobody may say the word 'yes.' The first person who does hits the griddy once!",
    "For the next three prompts, nobody may say the word 'no.' The first person who does hits the griddy once!",
    "For the next two prompts, nobody may say the word 'I.' The first person who does hits the griddy once!",
    "For the next three prompts, nobody may point at anyone. The first person who does hits the griddy once!",
    "For the next two prompts, everyone must speak about themselves in the third person. The first person to slip hits the griddy once!",
    "For the next two prompts, every sentence must start with the word 'Actually.' The first person to forget hits the griddy once!",
    "For the next three prompts, everyone must say 'please' before speaking. The first person to forget hits the griddy once!",
    "For the next thirty seconds, nobody may laugh. The first person who laughs hits the griddy twice!",
    "For the next minute, nobody may touch their own face. The first person who does hits the griddy once!",
    "For the next two prompts, nobody may cross their arms. The first person who does hits the griddy once!",
    "For the next two prompts, nobody may use a contraction. The first person who does hits the griddy once!",
    "For the next two prompts, nobody may say any number out loud. The first person who does hits the griddy once!",
    "Everyone must keep one hand raised until the next prompt is read. The first hand to drop hits the griddy once!",
    "For the next three prompts, everyone must call the player on their left 'Captain.' The first person to forget hits the griddy once!",
    "Nobody may check their phone until the next prompt is read. The first person who looks hits the griddy twice!",
    "Go around naming any word that does not contain the letter E. First to repeat, hesitate, or fail takes two griddys!",
    "Go around naming any word that does not contain the letter A. First to repeat, hesitate, or fail catches two griddys!",
    "Go around the circle answering 'how is your night going' in exactly two words. First to use more or fewer hits the griddy twice!",
    "Go around the circle saying a word that rhymes with the word said before it. First to break the chain locks in two griddys!",
    "Build a story around the circle where each sentence starts with the next letter of the alphabet. First to slip racks up two griddys!",
    "Go around the circle saying a movie title with one word replaced by 'griddy.' First to hesitate or repeat takes two griddys!",
    "Go around the circle saying a song title with one word replaced by 'griddy.' First to hesitate or repeat catches two griddys!",
    "Go around naming compound words. First to repeat, hesitate, or fail hits the griddy twice!",
    "Go around naming words that are also common first names. First to repeat, hesitate, or fail owes the griddy twice!",
    "Go around the circle where each player names the opposite of the previous player's word. First to fail locks in two griddys!",
    "Go around the circle where each player names a synonym for the previous player's word. First to fail racks up two griddys!",
    "One player names a category and the next player must name something in it, continuing around. First to fail takes two griddys!",
    "The player who drew this card picks a letter, and everyone must name a word starting with it. The last person to answer hits the griddy once!",
    "The player who drew this card describes an object in the room without naming it. The last person to guess hits the griddy once!",
    "The player who drew this card tells two truths and one lie. Anyone who guesses the lie wrong hits the griddy once!",
    "The player who drew this card says something they have never done. Anyone who has done it hits the griddy once!",
    "The group hums a song together while one player guesses. If the guess fails, that player hits the griddy twice!",
    "One player acts out a movie without speaking. The last person to guess correctly hits the griddy once!",
    "Go around the circle naming a celebrity whose first name starts with the last letter of the previous name. First to fail catches two griddys!",
    "The player who drew this card asks a would-you-rather question. The slowest player to answer hits the griddy once!",
    "Everyone names five things they are carrying right now. The last person to finish hits the griddy once!",
    "Build a story around the circle, but nobody may use the word 'and.' First to slip takes two griddys!",
    "Go around naming a city, with only three seconds per player. First to run out of time hits the griddy twice!",
    "Everyone answers 'what is your night looking like' in exactly five words. Anyone who misses the count hits the griddy once!",
    "Everyone answers 'how are you doing' in exactly one word. The first person to use more hits the griddy once!",
    "Everyone tells the group one plan for tomorrow with no filler words. The first person to say 'um' or 'like' hits the griddy once!",
    "The player who drew this card asks any question, and the group votes on the best answer. Everyone who did not get a vote hits the griddy once!",
    "Everyone plays one round of rock-paper-scissors at the same time. Every player showing the least popular sign hits the griddy once!",
    "Everyone secretly picks a letter and reveals at the same time. Anyone who matches another player hits the griddy once!",
    "Everyone secretly picks an animal and says it at the same time. Anyone who matches another player hits the griddy once!",
    "Everyone secretly picks a color and says it at the same time. Anyone who matches another player hits the griddy once!",
    "The player who drew this card says one word, and everyone answers with the first word that comes to mind. Any two players who match both hit the griddy once!",
    "The player who drew this card takes rapid questions from the group for thirty seconds. Any question they refuse costs them one griddy!",
    "The player who drew this card gives one player a harmless nickname for the next three prompts. Anyone who uses that player's real name hits the griddy once!",
    "The player who drew this card bans one gesture for the next three prompts. Anyone who does it hits the griddy once!",
    "Check the scoreboard. Whoever has the fewest griddys picks any player to hit the griddy once!",
    "Check the scoreboard. Whoever has the most griddys is safe from the next prompt entirely!",
    "Everyone predicts who will finish this game with the most griddys. Anyone who picks themselves hits the griddy once!",
    "Go around the circle naming a two-word phrase where the second word starts the next player's first word. First to fail takes two griddys!",
    "Go around naming a word that means the same thing as 'happy.' First to repeat, hesitate, or fail catches two griddys!",
    "Go around naming something you would find in a school. First to repeat, hesitate, or fail hits the griddy twice!",
    "Go around naming something that is always cold. First to repeat, hesitate, or fail locks in two griddys!",
    "Go around naming something that makes noise. First to repeat, hesitate, or fail racks up two griddys!",
    "Go around naming something you would never bring on a first date. First to repeat, hesitate, or fail takes two griddys!",
    "Whoever got a haircut most recently gets a fresh-cut compliment, no griddy required!",
    "Whoever woke up earliest today gets the group's sympathy, no griddy needed!",
    "Whoever slept the least last night gets a nap pass, no griddy attached!",
    "Whoever traveled the shortest distance to get here gets called out gently, and still no griddy!",
    "Whoever is carrying the most in their pockets right now gets a round of applause, no griddy involved!",
    "Whoever is wearing the oldest item of clothing gets a vintage shoutout, no griddy needed!",
    "Whoever is wearing the newest item of clothing gets a fashion moment, no griddy attached!",
    "Whoever is wearing the most jewelry gets a shine shoutout, no griddy required!",
    "Whoever has the most keys on their keychain gets a responsible adult award, no griddy involved!",
    "Whoever has the most cards in their wallet gets an organized shoutout, no griddy needed!",
    "Whoever has the most apps on their home screen gets a chaos award, no griddy attached!",
    "Whoever has the highest phone battery gets a preparedness award, no griddy required!",
    "Whoever has the most steps today gets an athlete shoutout, no griddy needed!",
    "Whose next birthday is furthest away? That player gets extra time to prepare, no griddy attached!",
    "Whoever has lived in the most places gets a nomad nod, no griddy required!",
    "Whoever has visited the most countries gets a passport salute, no griddy needed!",
    "Whoever has the longest commute gets sympathy applause, no griddy attached!",
    "Whoever has the most siblings gets a survivor shoutout, no griddy required!",
    "Whoever has the most pets gets an animal lover award, no griddy needed!",
    "Whoever has the most letters in their first name gets a spelling shoutout, no griddy attached!",
    "Whoever has the fewest letters in their first name gets an efficiency award, no griddy required!",
    "Whoever is wearing the most comfortable shoes gets a comfort award, no griddy needed!",
    "Whoever did laundry most recently gets a fresh laundry salute, no griddy attached!",
    "Whoever has the oldest phone gets a loyalty award, no griddy required!",
    "Whoever is drinking the most interesting thing right now gets a taste-maker shoutout, no griddy needed!",
    "Everyone hold a squat position, if safe and comfortable. The first person to stand up hits the griddy once!",
    "Everyone reach for their toes, if safe and comfortable. The last person to reach hits the griddy once!",
    "Everyone do five jumping jacks, if safe and comfortable. The last person to finish takes two griddys!",
    "Everyone hop on one foot five times, if safe and comfortable. The first person to lose balance hits the griddy once!",
    "Everyone hits the griddy one at a time. The group picks the weakest attempt, and that player goes again!",
    "Everyone try to touch their nose with their tongue. Anyone who cannot hits the griddy once!",
    "Everyone try to raise one eyebrow on its own. Anyone who cannot hits the griddy once!",
    "Everyone try to wiggle their ears. Anyone who can pull it off gets applause, no griddy needed!",
    "Everyone try to roll their tongue. Anyone who cannot hits the griddy once!",
    "Everyone snap with both hands at the same time. Anyone who cannot hits the griddy once!",
    "Everyone whistle a single note. Anyone who cannot hits the griddy once!",
    "Everyone play the best air guitar they can. The group picks the weakest, and that player hits the griddy once!",
    "Everyone pat their head and rub their stomach at the same time. The first person to mix them up hits the griddy once!",
    "Everyone try to touch their elbows together behind their back. Anyone who manages it gets applause, no griddy attached!",
    "Everyone stand up from sitting without using their hands, if safe and comfortable. The last person standing hits the griddy once!",
    "Everyone hold both arms straight out to the sides for thirty seconds. The first person to drop them hits the griddy once!",
    "Everyone balance their phone flat on the back of one hand. The first person to drop it hits the griddy once!",
    "Pair up and hold a high five for twenty seconds. The first pair to break hits the griddy once each!",
    "Everyone give the biggest smile they can and hold it for fifteen seconds. The first person to break hits the griddy once!",
    "Everyone sit perfectly still with their hands in their lap for twenty seconds. The first person to fidget hits the griddy once!",
    "The player who drew this card picks two players to swap seats immediately. The slower of the two hits the griddy once!",
    "The player who drew this card picks a shadow who must copy their posture for the next three prompts. Any slip costs the shadow one griddy!",
    "The player who drew this card starts a slow clap. The last person to join in hits the griddy once!",
    "The player who drew this card names a theme, and every answer on the next prompt must fit it. Anyone who strays hits the griddy once!",
    "The player who drew this card may hand their next griddy to any other player. Choose wisely!",
    "The player who drew this card is immune from the very next prompt. Everyone else, good luck!",
    "The group votes on the best answer given so far tonight. That player is safe from the next prompt!",
    "The group votes on who has been funniest so far. That player gets a round of applause, no griddy needed!",
    "The group votes on who has been most competitive so far. That player hits the griddy once purely for the energy!",
    "Give a round of applause to whoever has the most griddys so far. They have earned it, and no extra griddy!",
    "Whoever has answered the fewest prompts so far must answer the next one, with no griddy option!",
    "On the next prompt, everyone may only speak to the player on their right. The first person to break hits the griddy once!",
    "The player who drew this card picks the category for the next player's turn. No takebacks!",
    "The player who drew this card chooses the direction of play for the next three prompts. Anyone who goes out of order hits the griddy once!",
    "Reverse the turn order for the rest of this round. The first person to go out of turn hits the griddy once!",
    "The next player's turn is skipped entirely. The player after them hits the griddy once for the free pass!",
    "Griddys are doubled on the next prompt. Answer carefully!",
    "Everyone hits the griddy once right now, no exceptions and no arguments!",
    "No griddys at all on the next prompt. Enjoy the break!",
    "The player who drew this card hands one griddy to any player of their choosing!",
    "The player who drew this card removes one griddy from their own count, if they have any to spare!",
    "Everyone points at who they think is winning right now. Anyone who points at themselves hits the griddy once!",
    "Pair up and pick one pair to face off in rock-paper-scissors. The loser of that pair hits the griddy twice!",
    "Everyone raises a glass or a hand and toasts to something. The first person who cannot think of anything hits the griddy once!",
    "Everyone describes tonight in exactly one word. Anyone who repeats another player's word hits the griddy once!",
    "Everyone go around and name a type of weather. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name something you'd find in a hospital. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name something you'd see at a wedding. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name something you'd find at a gym. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a type of dance. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a language. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a currency. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a planet or object in space. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name an element from the periodic table. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a U.S. city. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name something you'd find in a bag or purse. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a type of hat. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name a shade of blue. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name a magazine or newspaper. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a fictional place. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a famous duo. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a nursery rhyme or children's song. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name a type of candy. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name a type of soup. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name something you'd find in a garage. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name a holiday food. First to repeat, hesitate, or fail catches two griddys!",
    "Everyone go around and name something that flies. First to repeat, hesitate, or fail owes the griddy twice!",
    "Everyone go around and name something with wheels. First to repeat, hesitate, or fail locks in two griddys!",
    "Everyone go around and name a job in a restaurant. First to repeat, hesitate, or fail racks up two griddys!",
    "Everyone go around and name a famous landmark. First to repeat, hesitate, or fail throws on the griddy twice!",
    "Everyone go around and name a type of shoe. First to repeat, hesitate, or fail does the griddy, twice!",
    "Everyone go around and name something in a first aid kit. First to repeat, hesitate, or fail gets sturdy with the griddy's twice!",
    "Everyone go around and name something you'd find at a carnival. First to repeat, hesitate, or fail hits the griddy twice!",
    "Everyone go around and name a type of berry. First to repeat, hesitate, or fail takes two griddys!",
    "Everyone go around and name something that always comes in a pair. First to repeat, hesitate, or fail catches two griddys!"
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
    // Draw the next card from the deck already in play so a question can never
    // repeat for a player. Rebuilding the deck here would put seen cards back in.
    if (shuffledQuestions.length === 0) {
        endGame();
        return;
    }
    const questionContainer = document.getElementById("question");
    questionContainer.innerText = shuffledQuestions.pop();
    displayNewCardAnimation();
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

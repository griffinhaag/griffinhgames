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
    "What question do you wish people asked you more often?",
    "What's your ideal morning routine on a day with no obligations?",
    "Are you honestly a morning person or a night owl?",
    "What's the first thing you do the moment you get home?",
    "What's your favorite room in any house you've ever lived in?",
    "What's something in your home that makes you happy every time you see it?",
    "What's the coziest place you've ever been?",
    "What's your favorite spot to sit and do absolutely nothing?",
    "What's the best nap you've ever taken?",
    "What's the perfect temperature for a perfect day?",
    "Sunrise or sunset?",
    "What's the best sunset you've ever seen?",
    "What's your favorite time of day, and why that one?",
    "What's the best thing about mornings?",
    "What's something that only feels right to do at night?",
    "What's a sound that means home to you?",
    "What's your favorite kind of silence?",
    "What song would you put on to instantly feel better?",
    "What's the last song you had on repeat?",
    "What's your comfort movie?",
    "What's your comfort show?",
    "What's your comfort food?",
    "What meal reminds you most of childhood?",
    "What's a dish someone in your family makes better than anyone?",
    "What's the first meal you ever learned to cook?",
    "What's your signature snack combination?",
    "What's a food you love that other people find strange?",
    "What's the best thing you've eaten in the last month?",
    "What's your go-to coffee shop order?",
    "What's your ideal breakfast?",
    "Sweet or savory in the morning?",
    "What's the best dessert you've ever had?",
    "Where would you take someone for their very first meal in your town?",
    "What's the best hole-in-the-wall spot you know about?",
    "What meal would you want on the best day of your life?",
    "What's your ideal picnic?",
    "What's the best food you've had while traveling?",
    "What drink do you associate with summer?",
    "What drink do you associate with winter?",
    "What's the best month of the year, in your opinion?",
    "What's the best thing about where you live right now?",
    "What's the first thing you'd want a visitor to try where you live?",
    "What's the best walk you've ever taken?",
    "What's the most peaceful place you've ever been?",
    "What's the best view you've ever had from a window?",
    "Where do you go when you need to think?",
    "What's your favorite way to spend time outdoors?",
    "Mountains, ocean, forest, or desert?",
    "What's the best water you've ever swum in?",
    "What's your favorite thing about the beach?",
    "What's the best campfire moment you've had?",
    "What's a night sky you'll never forget?",
    "Have you ever seen something in nature that stopped you in your tracks?",
    "What's the coolest animal you've ever seen in the wild?",
    "What's the best weather you've ever been caught out in?",
    "What's the best storm you've ever watched from somewhere safe?",
    "What's your favorite thing about snow?",
    "What's the best road trip you've ever taken?",
    "What's the perfect song for a long drive?",
    "Window seat or aisle seat?",
    "What's your favorite thing to do on a plane?",
    "What's the longest trip you've ever taken?",
    "What country would you visit for the food alone?",
    "What's a place you'd move to tomorrow if you could?",
    "What's the most beautiful city you've ever been to?",
    "What's a small town you unexpectedly loved?",
    "What's a trip you'd take again in exactly the same way?",
    "Do you plan trips down to the hour or completely wing them?",
    "What's your single best travel tip?",
    "What's the best souvenir you've ever brought home?",
    "What's a photo you took that you're genuinely proud of?",
    "What's your favorite photo of yourself, and what's the story?",
    "What's your favorite photo you have of someone else?",
    "What's a memory you wish you had a photo of?",
    "What's the best day of your life so far?",
    "What's a day you'd happily live again exactly as it was?",
    "What's a small win you're still quietly proud of?",
    "What's something you accomplished that genuinely surprised you?",
    "What's the hardest thing you've done that you'd absolutely do again?",
    "What are you better at now than you were a year ago?",
    "What's a habit you're proud of having built?",
    "What's something you do every single day that you actually enjoy?",
    "What's a ritual of yours that other people might find a little odd?",
    "What's your favorite way to start a weekend?",
    "What's your favorite way to end a day?",
    "What's the last thing that made you feel genuinely relaxed?",
    "What's your version of a perfect Sunday?",
    "What's the best thing about doing absolutely nothing?",
    "What do you do with an unexpected free hour?",
    "What's something you'd love to have more time for?",
    "What hobby would you pick back up if time were no object?",
    "What's a skill you're really glad you learned?",
    "What's the most useful thing you've ever taught yourself?",
    "What's something you learned recently that you found genuinely interesting?",
    "What's a topic you could read about endlessly?",
    "What's the best book you've read in the past few years?",
    "What book would you give someone as a gift?",
    "What's the best podcast or video you've come across lately?",
    "What movie line do you quote constantly?",
    "What's a movie you think everyone should see at least once?",
    "What's something small you did today that you're glad you did?",
    "What's the best thing that happened to you this week?",
    "What's something you're grateful for that you rarely mention?",
    "Who's someone who made a real difference in your life?",
    "Who's the funniest person you know?",
    "Who do you call first with good news?",
    "Who do you call first when something goes wrong?",
    "What's the longest friendship you have?",
    "How did you meet your closest friend?",
    "What's the best thing a friend has ever done for you?",
    "What's your love language with your friends?",
    "What's a friendship habit you wish more people had?",
    "What's the nicest thing someone has said about you behind your back?",
    "What's a compliment you'd love to give someone here?",
    "What's something you appreciate about the player to your left?",
    "What's something you admire about the player to your right?",
    "What's the best group you've ever been part of?",
    "What's your favorite memory with friends?",
    "Who's the person you can talk to for hours without noticing the time?",
    "What's an inside joke you can explain without completely ruining it?",
    "What's the funniest thing a friend has ever said to you?",
    "What's a story your friends always make you retell?",
    "What's the most fun you've ever had doing something completely ordinary?",
    "What's the best spontaneous plan you've ever said yes to?",
    "What's the best last-minute decision you've ever made?",
    "What's something you said yes to that changed things for the better?",
    "When were you glad you got out of your comfort zone?",
    "What's something you were nervous about that turned out completely fine?",
    "What's the bravest thing you've ever done?",
    "What's something you're proud of that you rarely bring up?",
    "What's a compliment you gave that clearly meant a lot to someone?",
    "What's the kindest thing a stranger has ever done for you?",
    "What's the kindest thing you've ever done for a stranger?",
    "Have you ever been helped at exactly the right moment?",
    "Have you ever thanked someone years later for something they'd forgotten?",
    "What's the best advice you ignored and later wished you hadn't?",
    "What's something you believe that most people around you don't?",
    "What's a value you'd never compromise on?",
    "What's something you've completely changed your mind about?",
    "What's a food rule you follow religiously?",
    "What's the pettiest thing you'll happily argue about?",
    "What's a question that always splits a room?",
    "What's your take on the single best pizza topping?",
    "What's the correct way to load a dishwasher?",
    "Is a hot dog a sandwich?",
    "What's the best fast food item of all time?",
    "What's the most overrated food?",
    "What's the most underrated food?",
    "What's a chore you genuinely enjoy?",
    "What's a chore you'd pay someone to do forever?",
    "What's the most satisfying thing to organize?",
    "What's your relationship with your to-do list?",
    "Are you a planner or an improviser?",
    "What's something you're surprisingly disciplined about?",
    "What's something you're happily undisciplined about?",
    "What time do you actually go to bed?",
    "What's your ideal amount of sleep?",
    "What wakes you up in the best possible mood?",
    "What's your favorite thing to do right before bed?",
    "What do you think about right before falling asleep?",
    "What's a dream you've had that you still remember?",
    "Do you remember your dreams often?",
    "What's the best thing about waking up early?",
    "What's the most productive you've ever felt?",
    "What kind of work do you genuinely enjoy doing?",
    "What part of your day do you look forward to most?",
    "What's something you'd honestly do for free?",
    "What job would you be surprisingly good at?",
    "What job would you be absolutely terrible at?",
    "What's the best job you've ever had?",
    "What's the strangest job you've ever had?",
    "What was your very first job?",
    "Who's the best coworker you've ever had?",
    "What's the best thing a boss ever taught you?",
    "What's something you learned at work that helps you outside of it?",
    "What's a piece of feedback that genuinely helped you?",
    "What's something you're actively working on getting better at?",
    "What's a goal you have for this year?",
    "Where do you hope you're living in five years?",
    "What's something you want to try before the year ends?",
    "What's already on your list for next summer?",
    "What's a trip you're already daydreaming about?",
    "What's something you'd love to save up for?",
    "What would you do with an extra day every single week?",
    "What would you do with a completely unexpected week off?",
    "What's the best celebration you've ever been part of?",
    "How do you actually like to be celebrated?",
    "What's the best birthday you've ever had?",
    "What's your ideal birthday, realistically?",
    "What's your favorite holiday tradition?",
    "What's the best holiday meal?",
    "What's the best gift you've ever received?",
    "What's the best part about giving someone a gift?",
    "What's the most thoughtful thing anyone has ever done for you?",
    "What's a skill you'd love to be genuinely great at one day?",
    "What would you want someone to say in a toast about you?",
    "What kind of legacy would you be happy with?",
    "What's something you hope is still true about you in ten years?",
    "What's something you hope has changed about you in ten years?",
    "What's a part of yourself you'd never want to lose?",
    "What do people always come to you for?",
    "What role do you naturally take in a group?",
    "What's the first impression people usually have of you?",
    "What's something you've gotten much better at with age?",
    "If you could have any superpower purely for everyday convenience, what would it be?",
    "If you had to move somewhere you didn't speak the language, where would you go?",
    "If you could add one hour to every day, what would you do with it?",
    "If you could make one season last twice as long, which one?",
    "If you could build a house anywhere in the world, where would it go?",
    "If you could design your dream backyard, what's in it?",
    "If you could keep a tiny version of any wild animal, which one?",
    "If you could talk to your pet for one hour, what would you ask?",
    "If you could be instantly great at one sport, which one?",
    "If you could attend any concert in history, which would you pick?",
    "If you could see one artist live tonight, who would it be?",
    "If you could play one song on every radio station for a day, what would it be?",
    "If you could make a movie about absolutely anything, what would it be?",
    "If you could star in any movie already made, which one?",
    "If you could live inside one video game for a week, which one?",
    "If you could bring one fictional food into the real world, what would it be?",
    "If you could spend an afternoon with anyone alive today, who would it be?",
    "If you could have one conversation with anyone from history, who?",
    "If you could have watched one moment from your family's history, what would you choose?",
    "If you could know one thing about the future, what would you pick?",
    "If you could see a photo of your life ten years from now, would you look?",
    "If you could send a postcard to yourself in twenty years, what would it say?",
    "If you buried a time capsule today, what's going in it?",
    "If you could keep one object forever in perfect condition, what would it be?",
    "If everyone were safely out of your home, what one object would you grab?",
    "If you could only keep five possessions, what makes the list?",
    "If you could redesign your daily routine from scratch, what changes first?",
    "If you had a personal assistant for a week, what would you have them do?",
    "If you had a private chef for a month, what's the first meal you'd request?",
    "If you could eat at any restaurant in the world tonight, where would you go?",
    "If you could master one style of cooking, which cuisine?",
    "If you had to open a food truck, what would you sell?",
    "If you had to run a market stall every weekend, what would you sell?",
    "If you had to teach a weekend workshop, what would it be?",
    "If you could start a nonprofit for anything, what would it support?",
    "If you could solve one everyday problem for everyone, what would you fix?",
    "If you could improve one thing about your town, what would it be?",
    "If you could make one public space better, what would you change?",
    "If you could bring back one thing from the past, what would it be?",
    "If you could name a new constellation, what would you call it?",
    "If you could name a brand-new color, what would it be called?",
    "If you could invent a word for a feeling, what would it describe?",
    "If you could rename one day of the week, which one and what?",
    "If you could cancel one holiday entirely, which one goes?",
    "If everyone took the same day off together, what should they all do?",
    "If you could make one hobby mandatory in school, what would it be?",
    "If you could add one class to every school, what would it teach?",
    "If you could protect one thing about childhood, what would it be?",
    "If you wrote a children's book, what would it be about?",
    "If you had to explain your job to a five-year-old, how would you do it?",
    "If you could adopt one person's habits entirely, whose would you take?",
    "If you could shadow anyone for a single day, who would you pick?",
    "If you could switch places with an animal for a day, which one?",
    "If you were a plant, which one would you be?",
    "If you were a piece of furniture, what would you be?",
    "If you were a time of day, which one would you be?",
    "If you were a room in a house, which room?",
    "If your personality were a beverage, what would it be?",
    "If you had to be a character in a sitcom, which show would you join?",
    "If your life had an opening credits sequence, what's in it?",
    "If someone made a playlist that described you, what's track one?",
    "If you had to sum up your year so far in three songs, which three?",
    "If you had to sum up your childhood in one photo, what would it show?",
    "If you could visit one place from your childhood again, where?",
    "If you could talk to your ten-year-old self for five minutes, what would you say?",
    "If you could give your parents one perfect day, what would it look like?",
    "If you could properly thank one person, who would it be?",
    "If you could send one anonymous gift to anyone, who gets it?",
    "If you could make someone's day better right now, what would you do?",
    "If you had unlimited money for one afternoon of giving, what would you do?",
    "If you could fund one thing in the world, what would you fund?",
    "If you could guarantee everyone had one thing, what would it be?",
    "If you could plant a forest anywhere, where would it go?",
    "If you could protect one place forever, which place?",
    "If you could spend a year documenting anything, what would you document?",
    "If you could photograph one thing perfectly, what would it be?",
    "If you could paint one memory, which would you paint?",
    "If you could write one letter that everyone in the world read, what would it say?",
    "If you had a billboard for a day, what goes on it?",
    "If you could put one quote on every wall, what would it say?",
    "If you had a personal motto, what would it be?",
    "If you had to pick a mantra for this year, what is it?",
    "If you could give this group one gift, what would it be?",
    "If this group took one trip together, where should it go?",
    "If this group started a business, what would it be?",
    "If this group had a band, what instrument would you play?",
    "If this group had a mascot, what would it be?",
    "If this group had a group chat name, what should it be?",
    "If you had to plan tonight from scratch, what would we all be doing?",
    "If you could add one rule that made every gathering better, what would it be?",
    "If you hosted a monthly dinner, who would always be invited?",
    "If you could only ever host one kind of gathering, what would it be?",
    "If you had to entertain a group for an hour with no phones, what would you do?",
    "If you had to give a speech tonight, what would it be about?",
    "If you could ask one person here for advice, what would you ask about?",
    "If everyone here had to learn one thing from you, what would you teach?",
    "If you had to describe this group to a complete stranger, what would you say?",
    "If tonight became a story you told for years, what part would you emphasize?",
    "If you could freeze one moment from tonight, which would it be?",
    "If you had to make one promise to yourself tonight, what would it be?",
    "If you could relive one weekend from the past year, which one?",
    "What's your earliest memory?",
    "What's a taste that instantly takes you back?",
    "What was your favorite toy growing up?",
    "What show did you watch every single day as a kid?",
    "What was your favorite school lunch?",
    "What was your favorite subject in school?",
    "What subject do you wish you'd paid more attention to?",
    "Who was your favorite teacher, and why that one?",
    "What's a school trip you still remember clearly?",
    "What was your childhood bedroom like?",
    "What was on your walls as a teenager?",
    "What was your first concert?",
    "What was the first album or song you truly loved?",
    "What was the first movie that really got to you?",
    "What was your first video game?",
    "What was your first pet?",
    "What's the best pet you've ever known?",
    "What's a family pet story everyone still tells?",
    "What's your favorite family story?",
    "What's a phrase your family says that nobody else does?",
    "What's a family tradition you genuinely love?",
    "What's something you inherited that you treasure?",
    "What's a recipe that's been passed down to you?",
    "What's something your grandparents taught you?",
    "What's a piece of family wisdom you still use?",
    "What's the best trip you took as a kid?",
    "Where did your family always go on vacation?",
    "What's a summer you'll never forget?",
    "What did summer feel like when you were twelve?",
    "What's the best thing about being a kid that adults completely miss?",
    "What's something you did as a kid that you'd love to do again?",
    "What game did you play endlessly as a kid?",
    "What's the best playground or park you remember?",
    "What was your neighborhood like growing up?",
    "Who was your first best friend?",
    "Are you still in touch with anyone from childhood?",
    "Who's someone you'd love to reconnect with?",
    "What's the best reunion you've had with an old friend?",
    "What's a friendship that genuinely changed you?",
    "What was the moment you realized you'd grown up?",
    "When did you first feel like an actual adult?",
    "What's the most adult thing you did this week?",
    "What's something about adulthood nobody warned you about?",
    "What's the best part of getting older?",
    "What's something you used to worry about that seems tiny now?",
    "What do you take much less seriously now?",
    "What do you take much more seriously now?",
    "What's a lesson that took you a long time to learn?",
    "What's something you had to learn the hard way?",
    "What's the best mistake you ever made?",
    "What's a failure that turned into something good?",
    "What's something that didn't work out that you're now glad about?",
    "What's a door that closed and led somewhere better?",
    "What's the biggest leap you've ever taken?",
    "What's a decision you almost didn't make?",
    "What's something you almost said no to?",
    "What's the best thing you've ever done completely on a whim?",
    "What's the most unexpected friendship you've ever made?",
    "Where's the strangest place you've ever made a friend?",
    "What's the most interesting conversation you've had with a stranger?",
    "What's the best thing a stranger has ever told you?",
    "Who's the least likely person to have given you great advice?",
    "Who's the most interesting person you've ever met?",
    "What's the coolest thing you've ever witnessed in person?",
    "What's the most beautiful thing you've ever seen?",
    "What's a moment you knew instantly you'd remember forever?",
    "What's a moment in your life that felt like a movie scene?",
    "What's something that gave you chills in the best way?",
    "What's the happiest you've ever been?",
    "Who's the person who can always make you laugh?",
    "What's the funniest thing you've ever witnessed?",
    "What's your favorite kind of humor?",
    "What kind of joke gets you every single time?",
    "What comedian, show, or clip could you rewatch forever?",
    "What's your go-to joke?",
    "What's the best harmless prank you've ever been part of?",
    "What's your favorite silly tradition?",
    "What's something goofy you do that just makes you happy?",
    "What's a habit of yours that people tease you about?",
    "What's a quirk you've fully embraced?",
    "What's something you're irrationally excited by?",
    "What's a tiny luxury you always say yes to?",
    "What's your favorite way to treat yourself?",
    "What's the most worthwhile thing you've ever saved up for?",
    "What's a purchase you thought about for months before finally buying?",
    "What's something you own that has a great story behind it?",
    "What's the oldest thing you own?",
    "What's something you've had forever that somehow still works?",
    "What's an item you'd replace immediately if it broke?",
    "What's something you'd never lend to anyone?",
    "What's something you'd happily share with absolutely anyone?",
    "What's a skill you'd teach anyone who asked?",
    "What's a topic you'd happily be quizzed on?",
    "What's something you could rant about for a full hour?",
    "What's the nerdiest thing about you?",
    "What's something you were completely wrong about for years?",
    "What's the most interesting thing you've learned this year?",
    "What's a documentary or article that really stuck with you?",
    "What's something you'd love to understand much better?",
    "What's a question you've never found a good answer to?",
    "What's the best thing about the way you were raised?",
    "What's something you'd like to pass on to someone younger?",
    "Coffee or tea?",
    "Beach day or mountain day?",
    "Early flight or late flight?",
    "Big party or small gathering?",
    "Movie theater or couch?",
    "Books or audiobooks?",
    "City noise or country quiet?",
    "Cooking at home or ordering in?",
    "Sweet or salty?",
    "Hot drink or cold drink?",
    "Sunny and cold, or warm and rainy?",
    "Road trip or flight?",
    "Camping or hotel?",
    "Museum day or hiking day?",
    "Breakfast for dinner or dinner for breakfast?",
    "Would you rather have a great view or a great kitchen?",
    "Would you rather live by water or by mountains?",
    "Would you rather visit one place ten times or ten places once?",
    "Would you rather have a long weekend every week or a month off every year?",
    "Would you rather be able to nap anywhere or never need a nap again?",
    "Would you rather always be slightly early or always exactly on time?",
    "Would you rather understand every animal or every accent?",
    "Would you rather have unlimited books or unlimited music?",
    "Would you rather have a photographic memory or a perfect sense of direction?",
    "Would you rather always know the weather or always know the traffic?",
    "Would you rather have a personal chef or a personal driver?",
    "Would you rather never do laundry or never do dishes?",
    "Would you rather have a bigger home or a better location?",
    "Would you rather work mornings or evenings?",
    "Would you rather have more time or more energy?",
    "What's your ideal weekend weather?",
    "What's the best day of the week?",
    "What's your favorite thing about this particular season?",
    "What's the next thing on your calendar you're excited about?",
    "What's something you've been meaning to do for ages?",
    "What's on your list that keeps getting pushed back?",
    "What would you do this weekend if nothing at all was stopping you?",
    "What's the last new thing you tried?",
    "What's the last place you visited for the very first time?",
    "What's the last thing that genuinely surprised you?",
    "What's the last thing that really impressed you?",
    "What's the last thing you finished that you'd been putting off?",
    "What's the last kind thing someone did for you?",
    "What's the last thing you recommended to someone?",
    "What's the last thing someone recommended that you loved?",
    "What's your most-repeated piece of advice?",
    "What are you always trying to get people into?",
    "What's a hobby you think far more people should try?",
    "What's an underrated way to spend an afternoon?",
    "What's the best free thing to do where you live?",
    "What's a cheap day out that somehow feels expensive?",
    "What's the best possible way to spend twenty dollars?",
    "What's the most fun you've had for under fifty dollars?",
    "What's something you'd happily do every single weekend?",
    "What's something you could do every day for a year?",
    "What's the most relaxing thing you do?",
    "What's the first thing you do after a stressful day?",
    "What helps you reset when you're overwhelmed?",
    "What's a place that always calms you down?",
    "Where do you feel most like yourself?",
    "When do you feel most at peace?",
    "What's your favorite part of being alone?",
    "What's your favorite part of being around people?",
    "Are you recharged more by people or by quiet?",
    "What's your ideal group size for a hangout?",
    "What's the best conversation you've had this year?",
    "What's a subject you'd love to learn about from someone here?",
    "What's the best question anyone has ever asked you?",
    "What's a question you love asking people?",
    "What do you notice first about a new place?",
    "What do you notice first about a person?",
    "What's a detail most people miss that you always catch?",
    "What are you unusually observant about?",
    "What's a habit you picked up from someone you admire?",
    "Who has influenced you the most?",
    "Who would you most want to be a little more like?",
    "What's a quality you're actively trying to build?",
    "What's something you do that you learned from your family?",
    "What's something you do very differently from how you were raised?",
    "What's a tradition you'd want to start with this group?",
    "What's the best thing about this group?",
    "What's something you'd want everyone here to know?",
    "What's something you appreciate about tonight?",
    "House party, dinner party, or bar night?",
    "What makes a hangout genuinely memorable for you?",
    "What's the best conversation starter you know?",
    "What's your go-to question when meeting someone new?",
    "What's the fastest way to really get to know someone?",
    "What's the best thing about meeting someone new?",
    "What made you smile most recently?",
    "What's something you're genuinely hopeful about?",
    "What's something you'd like more of in your life?",
    "What's one thing you want to remember about this year?",
    "What's something you'd tell this group to go do tomorrow?"
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

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
    "What's the boldest move you've ever made that completely backfired?",
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
    "What's your loudest opinion about what actually makes someone good in bed?",
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
    "If you could instantly win any petty argument forever, which argument would you pick?",
    "If you had to survive one week inside a horror movie, which movie would you pick?",
    "If you could ask one anonymous question to everyone you know, what would it be?",
    "If you had to switch lives with someone you actually know for one day, who would it be?",
    "If you could make one new rule everyone had to follow for a day, what would it be?",
    "If you could relive one completely chaotic day of your life, which would you choose?",
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
    "Who here would last the longest camping with no supplies?",
    "Who here would be the best at negotiating a better price on anything?",
    "Who here would be the most convincing undercover spy?",
    "Who here would make the best party host?",
    "Who here would be the best detective?",
    "Who here would be most likely to start a spontaneous adventure?",
    "Who here would get the villain edit on a reality show?",
    "Who here would be the best person to call during a minor crisis?",
    "Who here would make the most entertaining podcast host?",
    "Who here would be most likely to move to another country with little notice?",
    "Who here would make the best teammate in a heist movie?",
    "Who here would be most likely to go viral for something wholesome?",
    "Who here would be the best at keeping a harmless secret?",
    "Who here would blow a million dollars the fastest?",
    "Who here would be most likely to make the group late while insisting they were ready?",
    "Who here would be the best at living without a phone for a month?",
    "Who here would write the most entertaining memoir?",
    "Who here would be most likely to befriend a complete stranger?",
    "Who here would be the best person to get stuck with during a long layover?",
    "Have you ever pretended to already know something so you didn't look clueless?",
    "Have you ever nodded along to a story you'd already been told twice?",
    "Have you ever forgotten someone's name months into knowing them?",
    "Have you ever called someone the wrong name directly to their face?",
    "Have you ever pretended to remember meeting someone?",
    "Have you ever left a group chat and lied about why?",
    "Have you ever muted a group chat and pretended you missed the messages?",
    "Have you ever read a message and answered days later completely on purpose?",
    "Have you ever left someone on read out of pure spite?",
    "Have you ever replied 'lol' to something you did not find funny at all?",
    "Have you ever liked a post specifically so someone knew you saw it?",
    "Have you ever gone down a research rabbit hole on someone you barely know?",
    "Have you ever made a second account just to look at something?",
    "Have you ever googled someone before meeting them?",
    "Have you ever looked up an old friend purely to see how they turned out?",
    "Have you ever compared yourself to someone online for way too long?",
    "Have you ever deleted a post because it did not get enough attention?",
    "Have you ever posted something to make your life look better than it actually was?",
    "Have you ever taken a photo of food purely for the picture?",
    "Have you ever staged a completely candid photo?",
    "Have you ever asked someone for a hundred photos and used none of them?",
    "Have you ever untagged yourself from a photo without saying a word?",
    "Have you ever cropped someone out of a picture on purpose?",
    "Have you ever posted a group photo mainly because you looked good in it?",
    "Have you ever pretended your phone died to avoid replying?",
    "Have you ever faked a bad signal to get off a call?",
    "Have you ever declined a call and then texted 'sorry, just saw this'?",
    "Have you ever let a voicemail sit unheard for weeks?",
    "What's the longest you've gone without responding to someone important?",
    "Have you ever agreed to plans you had zero intention of keeping?",
    "Have you ever double-booked and simply picked the better option?",
    "Have you ever bailed on plans and then immediately posted from somewhere else?",
    "Have you ever gotten caught bailing?",
    "What's the flimsiest excuse you've ever completely gotten away with?",
    "Have you ever blamed traffic when you just left late?",
    "Have you ever blamed your alarm when you were fully awake the whole time?",
    "Have you ever arrived somewhere and immediately started planning your exit?",
    "What's your signature move for leaving a party early?",
    "Have you ever left an event without telling a single person?",
    "Have you ever hidden from someone in a store?",
    "Have you ever taken a completely different route to avoid running into someone?",
    "Have you ever pretended to be on the phone to dodge a conversation?",
    "Have you ever crossed the street to avoid someone?",
    "Have you ever pretended not to hear your own name being called?",
    "Have you ever walked into the wrong place and just fully committed?",
    "Have you ever taken something from a hotel room that was definitely not complimentary?",
    "Have you ever eaten something that clearly belonged to someone else?",
    "Have you ever labeled your food and then eaten someone else's anyway?",
    "Have you ever finished the last of something and put the empty container back?",
    "Have you ever hidden snacks from the people you live with?",
    "Have you ever used the last of something and never replaced it?",
    "Have you ever let someone else take the blame for a mess you made?",
    "Have you ever 'cleaned' by shoving everything into one room?",
    "Have you ever thrown away something that was not yours?",
    "Have you ever broken something and never told a soul?",
    "Have you ever glued something back together and hoped nobody would notice?",
    "Have you ever returned something you had already used?",
    "Have you ever worn something with the tags carefully tucked in?",
    "Have you ever used a discount you were absolutely not eligible for?",
    "Have you ever taken far more free samples than you should have?",
    "Have you ever gotten a free upgrade you completely did not deserve?",
    "Have you ever pretended it was your birthday just for the free thing?",
    "Have you ever let a cashier undercharge you and said nothing?",
    "Have you ever walked out with something you forgot to pay for and never went back?",
    "Have you ever parked somewhere you absolutely should not have?",
    "Have you ever talked your way out of a ticket or a fine?",
    "Have you ever driven off with something still on the roof of your car?",
    "Have you ever lied about how fast you were actually going?",
    "Have you ever pretended to know exactly where you were going while completely lost?",
    "Have you ever refused to ask for directions purely out of pride?",
    "Have you ever been the sole reason an entire group got lost?",
    "Have you ever missed a flight, bus, or train because of pure procrastination?",
    "What's the latest you've ever arrived to something genuinely important?",
    "Have you ever slept through something you really should not have?",
    "Have you ever pretended to have read something you never even opened?",
    "Have you ever agreed to something serious without reading a word of it?",
    "Have you ever signed something you did not fully understand?",
    "Have you ever bluffed your way through a question you had no answer to?",
    "Have you ever nodded along in a conversation you were completely lost in?",
    "Have you ever pretended to understand a joke you absolutely did not get?",
    "Have you ever laughed at something and then realized it was not a joke?",
    "Have you ever congratulated someone for entirely the wrong thing?",
    "Have you ever wished someone happy birthday on the wrong day?",
    "Have you ever forgotten a birthday and pretended a gift was on the way?",
    "Have you ever regifted something?",
    "Have you ever opened a gift and immediately planned to regift it?",
    "Have you ever pretended to love a gift you genuinely hated?",
    "What's the worst gift you've ever given someone?",
    "Have you ever bought a gift on the way to the event?",
    "Have you ever taken credit for a group gift you contributed nothing to?",
    "Have you ever done almost nothing on a group project and gotten full credit?",
    "Have you ever let someone else do the hard part and taken the applause?",
    "Have you ever pretended to be far busier than you actually were?",
    "Have you ever said you were five minutes away from your own bed?",
    "Have you ever said you were on your way before you were even dressed?",
    "What's the biggest lie you tell most often?",
    "What's a lie you told so long ago that you'd have to keep it going forever now?",
    "Have you ever been caught in a lie and just doubled down?",
    "Have you ever confessed something and immediately wished you hadn't?",
    "What's something you've never admitted to anyone at this table?",
    "What's your most regrettable encounter with law enforcement?",
    "Have you ever been pulled over and talked your way into a warning?",
    "Have you ever set off an alarm somewhere and just kept walking?",
    "Have you ever snuck into somewhere you were absolutely not supposed to be?",
    "Have you ever jumped a fence for a completely stupid reason?",
    "Have you ever gotten kicked out of somewhere?",
    "Have you ever been banned from a place, a game, or a group chat?",
    "What's the closest you've ever come to being in real trouble?",
    "What's something you got away with that still shocks you?",
    "What's the dumbest thing you've ever done for a dare?",
    "What's the dumbest bet you've ever accepted?",
    "Have you ever lost a bet and actually had to pay up?",
    "What's the most money you've ever lost on something ridiculous?",
    "What's the most impulsive purchase you've ever made?",
    "What's sitting in your cart right now that you'll definitely end up buying?",
    "What's the most useless thing you own and refuse to get rid of?",
    "What's a subscription you're paying for and never use?",
    "What's the pettiest thing you've ever spent money on?",
    "Have you ever bought something purely to prove a point?",
    "Have you ever hidden a purchase from someone?",
    "What's your most embarrassing search history moment?",
    "What's the weirdest thing in your camera roll right now?",
    "What's the oldest photo still on your phone?",
    "How many unread notifications are you sitting on right now?",
    "What does your home screen say about you?",
    "What's your most-used emoji, and does it actually fit you?",
    "What's the last voice note you sent, and who got it?",
    "What's the last thing you typed out and then deleted?",
    "What's your most embarrassing autocorrect disaster?",
    "Have you ever sent a message and then deleted the entire app?",
    "Have you ever accidentally called someone while talking about them?",
    "Have you ever left a voicemail you would pay money to erase?",
    "Have you ever posted to your story when you meant to send a message?",
    "Have you ever replied to entirely the wrong person in a group chat?",
    "What's the most chaotic group chat you're currently in?",
    "What's your actual role in your friend group?",
    "What nickname have you never been able to shake?",
    "What's the most embarrassing thing your family still brings up?",
    "What childhood phase would you like officially deleted from the record?",
    "What did you think was the absolute peak of cool at thirteen?",
    "What's the cringiest thing you ever posted as a teenager?",
    "Did you ever have a secret online persona?",
    "What's the strangest thing you were obsessed with as a kid?",
    "What's the weirdest thing you ever collected?",
    "What imaginary scenario did you replay constantly as a kid?",
    "What's a lie you told as a kid that got completely out of hand?",
    "What's the worst trouble you got into growing up?",
    "What's something you did as a kid that you'd absolutely stop your own kid from doing?",
    "What was your most delusional childhood career plan?",
    "What's the most embarrassing thing you ever did to impress a teacher?",
    "Were you the teacher's pet or the menace?",
    "What's the boldest thing you ever pulled off in school?",
    "Have you ever cheated on a test and completely gotten away with it?",
    "Have you ever faked being sick to skip school or work?",
    "What's the best excuse you've ever used to get out of work?",
    "Have you ever taken a nap somewhere you definitely should not have?",
    "Have you ever fallen asleep in a meeting or a class?",
    "What's the most unproductive full day you've ever had?",
    "What's the longest you've stayed in bed doing absolutely nothing?",
    "What's your most embarrassing workplace moment?",
    "Have you ever hit reply-all with something you really should not have?",
    "Have you ever talked badly about someone and realized they could hear you?",
    "Have you ever waved at someone who was definitely not waving at you?",
    "Have you ever tripped in front of a full crowd?",
    "Have you ever walked directly into a glass door?",
    "Have you ever completely wiped out in public?",
    "What's the most public embarrassment you've ever recovered from gracefully?",
    "What's your go-to move the second you embarrass yourself?",
    "Have you ever pretended a fall was totally intentional?",
    "Have you ever ripped your clothes in public?",
    "Have you ever left the house wearing something completely wrong?",
    "Have you ever shown up dressed for entirely the wrong dress code?",
    "Have you ever arrived at a party a full day early or late?",
    "Have you ever walked into the wrong house, room, or car?",
    "Have you ever gotten into a total stranger's rideshare?",
    "What's your worst rideshare or taxi story?",
    "What's the worst travel day you've ever had?",
    "Have you ever gotten completely lost in another country?",
    "Have you ever butchered another language in public?",
    "What's the most embarrassing thing you've done while abroad?",
    "Have you ever been the loudest person somewhere very quiet?",
    "Have you ever gotten the giggles at the worst possible time?",
    "Have you ever burst out laughing during something extremely serious?",
    "Have you ever cried at something completely ridiculous?",
    "What's the last thing that made you cry laughing?",
    "What's the strangest thing that has ever made you emotional?",
    "What movie or show made you cry that you'd absolutely deny?",
    "What's your guiltiest guilty pleasure?",
    "What's a trend you swore you'd never do and then immediately did?",
    "What's the worst haircut decision you made completely on purpose?",
    "Have you ever cut your own hair and regretted it instantly?",
    "Have you ever dyed your hair a color you really should not have?",
    "What's the worst phase your personal style has ever been through?",
    "What's the most uncomfortable thing you've worn purely for the look?",
    "What's your most embarrassing gym moment?",
    "Have you ever used a machine completely wrong in front of everyone?",
    "Have you ever pretended to know a sport you had never played?",
    "What's the most competitive you've ever gotten over absolutely nothing?",
    "Have you ever flipped the board or quit a game out of pure frustration?",
    "What's the pettiest argument you've ever won?",
    "Have you ever been someone's backup plan and known it the whole time?",
    "Have you ever kept someone on the back burner?",
    "Have you ever texted someone purely because you were bored?",
    "Have you ever replied to a message you had zero intention of continuing?",
    "Have you ever agreed to a date specifically to make someone else jealous?",
    "Have you ever posted something hoping an ex would see it?",
    "Have you ever gone somewhere only because you hoped one person would be there?",
    "Have you ever changed your route just to walk past someone?",
    "Have you ever asked a friend to casually mention you to someone?",
    "Have you ever sent a friend to find out whether someone was single?",
    "Have you ever pretended not to notice someone was interested in you?",
    "Have you ever let someone flirt with you without ever correcting them?",
    "Have you ever accepted a free drink with zero intention of following up?",
    "Have you ever used the 'I have a partner' line when you absolutely did not?",
    "Have you ever pretended to be someone's partner to help them out?",
    "Have you ever been somebody's fake date?",
    "Have you ever brought a friend somewhere and let everyone assume?",
    "Have you ever been mistaken for a couple with a friend?",
    "Have you ever had a friendship everyone was convinced was something more?",
    "Have you ever developed feelings for a friend and buried them completely?",
    "Have you ever been turned down by a friend and stayed friends anyway?",
    "Have you ever had a crush on a friend's sibling?",
    "Have you ever taken a crush on a fictional character way too seriously?",
    "Who was your very first celebrity crush?",
    "What's the most embarrassing celebrity crush you've ever had?",
    "Have you ever had a crush based purely on someone's voice?",
    "Have you ever met someone in person and lost the crush instantly?",
    "Have you ever kept a crush alive purely for the fantasy of it?",
    "What's the longest you've liked someone without ever saying a word?",
    "What's the most obvious you've ever been about liking someone?",
    "Have you ever written something about a crush that you'd be mortified for anyone to find?",
    "Have you ever invented an entire scenario in your head and gotten upset about it?",
    "Have you ever gotten jealous over something completely imaginary?",
    "Have you ever tracked someone's activity way too closely?",
    "Have you ever noticed a detail about someone you'd never admit to noticing?",
    "What's the smallest detail that ever made you like someone more?",
    "What's the smallest detail that ended your interest instantly?",
    "What's an ick you've had that you know is completely unfair?",
    "What's an ick you're pretty sure you've given someone?",
    "Have you ever been dumped for a reason you thought was ridiculous?",
    "Have you ever ended things for a reason you'd be embarrassed to say out loud?",
    "What's the pettiest reason you've ever stopped talking to someone?",
    "Have you ever muted someone permanently?",
    "Have you ever archived a conversation and never opened it again?",
    "Have you ever kept old messages you definitely should have deleted?",
    "Have you ever reread an old conversation and cringed at your own self?",
    "What's the most embarrassing thing you've ever sent someone?",
    "What's the most embarrassing thing anyone has ever sent you?",
    "Have you ever sent something bold and then immediately panicked?",
    "Have you ever unsent a message and had them see it anyway?",
    "Have you ever been caught typing and stopped mid-message?",
    "How long do you wait before replying just to seem casual?",
    "Do you actually play it cool, or is that a total myth for you?",
    "What's the least cool you've ever acted around someone you liked?",
    "What's the most confident you've ever been asking someone out?",
    "Have you ever asked someone out and been turned down in front of people?",
    "Have you ever turned someone down and felt terrible about it afterward?",
    "What's the nicest way you've ever been rejected?",
    "What's the harshest thing anyone has ever said about your flirting?",
    "Has a friend ever had to physically stop you from texting someone?",
    "Have you ever needed your phone taken away from you late at night?",
    "What's your worst late-night decision?",
    "Have you ever woken up and immediately checked what you sent?",
    "Have you ever had to apologize for something you sent?",
    "What's the most dramatic thing you've ever done over a crush?",
    "Have you ever cried over someone you'd been on exactly two dates with?",
    "Have you ever been far more invested than the other person?",
    "Have you ever realized you were the more invested one and kept going anyway?",
    "What's the strangest thing you've done to seem more interesting?",
    "Have you ever exaggerated how much you know about music to impress someone?",
    "Have you ever taken up an entire hobby because of one person?",
    "Have you ever watched a whole series for one person?",
    "Have you ever learned something completely useless just to impress one person?",
    "What's the most effort you've ever put into a single text?",
    "Have you ever asked friends to help you write a message?",
    "Have you ever had an entire group chat dedicated to one situationship?",
    "How many people know about your love life right now?",
    "What's the most gossip you've ever personally caused?",
    "Have you ever been the reason a friend group had drama?",
    "Have you ever kept a secret that would have changed a friendship?",
    "What's a completely harmless secret you're keeping right now?",
    "What's a secret you kept that you were relieved to finally tell?",
    "Have you ever told a secret and regretted it within seconds?",
    "Are you actually good at keeping secrets, honestly?",
    "Who here would you trust with your phone unlocked for ten minutes?",
    "Whose messages here would you least want to read?",
    "Have you ever accidentally seen something on someone's screen?",
    "Have you ever pretended you did not see something you absolutely saw?",
    "Have you ever walked in on something and quietly backed out?",
    "What's the most awkward thing you've ever interrupted?",
    "Have you ever had a roommate situation get genuinely uncomfortable?",
    "What's the strangest thing you've ever heard through a wall?",
    "Have you ever had to pretend to be asleep for someone else's sake?",
    "What's the wildest thing that's ever happened at a party you hosted?",
    "What's the wildest thing you've ever done at someone else's place?",
    "Have you ever been the person the group had to take home?",
    "Have you ever taken care of a friend and never once let them live it down?",
    "What's the most chaotic thing you've done at a wedding?",
    "What's the most out-of-character thing you've ever done?",
    "If you had to delete one app forever, which one would hurt the most?",
    "If your phone screen were projected on a wall for one minute, what would you scramble to hide?",
    "If you swapped lives with the player on your left for a week, what would break you first?",
    "If you woke up famous tomorrow, what would you be famous for?",
    "If you had to be on the news tonight, what's the headline?",
    "If you had to give a talk with zero preparation, what's your topic?",
    "If you had to teach a class on one thing, what would it be?",
    "If you had to write a book tonight, what would it be about?",
    "If your autobiography had a chapter called 'What Was I Thinking,' what's in it?",
    "If you had to publish your bank statement or your browser history, which one goes public?",
    "If you had to lose your phone or your wallet right now, which do you pick?",
    "If you had to live one day on full public display, which day would you choose?",
    "If everyone could hear your thoughts for one hour, when would you schedule it?",
    "If you could hear one person's completely honest thoughts about you, would you?",
    "If you could force one person to tell you the truth about one thing, what would you ask?",
    "If lying became physically impossible tomorrow, who here panics first?",
    "If you had to be completely honest for twenty-four hours, what would break first?",
    "If you had to give up sarcasm or complaining, which one goes?",
    "If you had to keep one of your worst habits forever, which would you keep?",
    "If you could instantly delete one habit of yours, which one goes?",
    "If you had to wake up at five every morning or stay up until three every night, which?",
    "If you had to eat one single meal forever, which one would break you first?",
    "If you had to give up coffee or your favorite snack forever, which one?",
    "If you could never be embarrassed again but had to be boring, would you take the deal?",
    "If you had to bring one person here as your character reference, who?",
    "If you were judged only on your last five texts, how would you do?",
    "If your group chat were read aloud right now, who would be in the most trouble?",
    "If your camera roll shuffled onto a big screen, what's your risk level?",
    "If people had to describe you using only your recent purchases, what would they say?",
    "If aliens judged humanity based on your day yesterday, how are we doing?",
    "If you had to survive a week on only what's in your bag right now, how long do you last?",
    "If your childhood self met you today, what would surprise them most?",
    "If your childhood self met you today, what would disappoint them most?",
    "If you had to redo one entire year of your life, which year?",
    "If you could skip one year of your life completely, which one?",
    "If you could fast-forward to one moment in your future, would you actually do it?",
    "If you got one undo button for anything, what are you undoing?",
    "If you had to keep one memory and lose all the rest, which do you keep?",
    "If you could send one text to your past self, what does it say?",
    "If you had to warn your future self about one thing, what is it?",
    "If your life had a laugh track, what would set it off most often?",
    "If your life had a narrator, who would you cast?",
    "If your friends made a documentary about you, what's the tagline?",
    "If you had to be roasted by one person here, who could you survive?",
    "If you had to be complimented by one person here, whose would mean the most?",
    "If everyone here voted on your worst quality, would you agree with them?",
    "If you could trade one talent with someone here, what would you take?",
    "If you could steal one thing about someone's life here, what would it be?",
    "If you had to spend an entire month with one person here, who?",
    "If you had to be stranded somewhere with one person here, who and why?",
    "If the group had to survive on one person's cooking, whose?",
    "If you had to hand your money to one person here to manage, who?",
    "If one person here planned your entire weekend, who would you pick?",
    "If one person here picked your outfits for a month, who?",
    "If one person here ran your social media for a week, who?",
    "If one person here had to speak for you all night, who?",
    "If you had to give one person here your phone password, who?",
    "If you had to let one person here read your notes app, who?",
    "If you could ban one word from existence, which one?",
    "If you could make one thing illegal for a single day, what?",
    "If you had a get-out-of-any-conversation-free card, when would you use it?",
    "If you could mute one sound forever, what would it be?",
    "If you could be invisible for one hour, where would you go?",
    "If you could read minds but never turn it off, would you take it?",
    "If you could teleport but only to places you've already been, where first?",
    "If you could pause time for ten minutes a day, when would you use it?",
    "If you could rewind ten seconds once a week, what would you use it on?",
    "If you could speak to animals, which animal would you actively avoid?",
    "If you had to fight one animal purely to prove a point, which one?",
    "If you had to pick a walk-up song for the rest of your life, what is it?",
    "If a theme song played every time you walked into a room, what would it be?",
    "If you were introduced by a hype man, what would he shout?",
    "If you had to keep one catchphrase forever, what would it be?",
    "If you had a signature scent, what would it be called?",
    "If you had a signature drink, what's in it and what's it named?",
    "If you opened a bar tomorrow, what would you name it?",
    "If you started a band today, what's the name?",
    "If the group picked your next tattoo, would you actually trust them?",
    "If you had to legally change your name today, what would you pick?",
    "If you had to keep one item from your childhood bedroom forever, what is it?",
    "If you had to live in one decade forever, which one?",
    "If you had to give up the internet or air travel, which one goes?",
    "If you had to live somewhere with no phone signal for a year, could you do it?",
    "If money were not a factor at all, what would you do all day?",
    "If you had to work one single job forever, what job?",
    "If you quit your job tomorrow with no plan, what's the first thing you do?",
    "If you won the lottery, who's the very first person you'd tell?",
    "If you won the lottery, who would you absolutely not tell?",
    "If you had to give away half your money right now, who gets it?",
    "If you had to spend a million dollars in twenty-four hours, what's the plan?",
    "If you could buy one ridiculous thing completely guilt-free, what is it?",
    "If you could have any meal delivered right this second, what's coming?",
    "If you had to survive on one takeout order forever, which one?",
    "If you could only listen to one artist for the rest of your life, who?",
    "If you had to delete every photo except ten, which ten survive?",
    "If you had to give up your bed or your shower for a month, which?",
    "If you had to be brutally honest about one thing tonight, what would you pick?",
    "If you could ask this group one question and get completely honest answers, what is it?",
    "If you had to swap your worst quality for someone else's, whose would you take?",
    "If you had to explain your last three purchases to a judge, how would that go?",
    "If your neighbors wrote a review of you, what would it say?",
    "Who here would be the best at keeping a houseplant alive?",
    "Who here would forget to eat all day?",
    "Who here has the most chaotic sleep schedule?",
    "Who here would win a spelling bee?",
    "Who here would carry an entire trivia night alone?",
    "Who here would be the worst at charades?",
    "Who here would be the best at karaoke?",
    "Who here would refuse to sing no matter what?",
    "Who here is most likely to cry at a commercial?",
    "Who here would adopt every stray animal they saw?",
    "Who here would name a pet something completely ridiculous?",
    "Who here would be the strictest parent?",
    "Who here would be the fun parent?",
    "Who here would give the best toast at a wedding?",
    "Who here would be the most emotional at a wedding?",
    "Who here would be the first to get married?",
    "Who here would elope with absolutely no warning?",
    "Who here would plan the most over-the-top party?",
    "Who here would forget about their own party?",
    "Who here brings the best snacks?",
    "Who here would burn water trying to cook?",
    "Who here would be the first to lose their mind on a silent retreat?",
    "Who here would be voted off a group trip first?",
    "Who here is the best packer?",
    "Who here overpacks for a two-day trip?",
    "Who here would miss the flight?",
    "Who here would be the best travel planner?",
    "Who here would get scammed abroad?",
    "Who here would haggle at a market for an hour?",
    "Who here would try the strangest food while traveling?",
    "Who here is the pickiest eater?",
    "Who here would eat something that fell on the floor?",
    "Who here orders the exact same thing every single time?",
    "Who here takes the longest to decide on food?",
    "Who here would send a dish back at a restaurant?",
    "Who here tips the most generously?",
    "Who here would forget their wallet on purpose?",
    "Who here checks the bill line by line?",
    "Who here would loan money and never ask for it back?",
    "Who here would be the best at budgeting?",
    "Who here would spend an entire paycheck in one day?",
    "Who here has the most impulsive shopping habits?",
    "Who here owns the most unnecessary gadgets?",
    "Who here has the messiest car?",
    "Who here has the cleanest living space?",
    "Who here would live happily in complete chaos?",
    "Who here would color-code absolutely everything?",
    "Who here would be the best roommate?",
    "Who here would be the worst roommate?",
    "Who here would leave dishes in the sink for a week?",
    "Who here would passive-aggressively clean up after everyone?",
    "Who here would be the best at defusing a group argument?",
    "Who here would start a group argument completely by accident?",
    "Who here is the designated peacekeeper?",
    "Who here holds a grudge the longest?",
    "Who here forgives the fastest?",
    "Who here always apologizes first?",
    "Who here would never admit they were wrong?",
    "Who here is the most stubborn?",
    "Who here is the easiest to talk into anything?",
    "Who here would fall for an incredibly obvious scam?",
    "Who here would spot a scam immediately?",
    "Who here is the best liar?",
    "Who here is the worst liar?",
    "Who here would be completely unreadable in a high-stakes game?",
    "Who here would crack first under questioning?",
    "Who here would confess to something they did not even do?",
    "Who here would be the best lawyer?",
    "Who here would be the group's unofficial therapist?",
    "Who here gives the best advice?",
    "Who here gives the worst advice with the most confidence?",
    "Who here would be the best hype person?",
    "Who here says exactly what everyone else is thinking?",
    "Who here would tell you if you had something in your teeth?",
    "Who here would let you walk around all night without saying a word?",
    "Who here takes the best photos?",
    "Who here takes the worst photos of other people?",
    "Who here posts the most?",
    "Who here is the biggest lurker?",
    "Who here has the best playlist?",
    "Who here would take the aux and never give it back?",
    "Who here would be the best DJ at a house party?",
    "Who here would fall asleep at a concert?",
    "Who here would be first into the pit?",
    "Who here is the most competitive?",
    "Who here would cheat at a board game?",
    "Who here would flip the table over a board game?",
    "Who here would be the best teammate in a trivia final?",
    "Who here would panic in a group escape room?",
    "Who here would solve the escape room basically alone?",
    "Who here is always the designated driver?",
    "Who here would be the last one to leave a party?",
    "Who here would go home early and lie about why?",
    "Who here has the best 'made it home safe' text game?",
    "Who here would text the group at three in the morning?",
    "Who here has the most unread messages?",
    "Who here replies the fastest?",
    "Who here leaves everyone on read?",
    "Who here would be missed the most if they moved away?",
    "Who here has changed the most since you first met them?",
    "Who here would be the best at keeping this exact game going all night?"
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

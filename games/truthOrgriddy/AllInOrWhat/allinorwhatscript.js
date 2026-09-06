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
    "Who is the biggest jerk you've ever come across in your life and why?",
    "If the world froze for an afternoon and only you could move and no one could see you or remember what you did, what would you do?",
    "What's the one thing you would do if you knew there were no consequences?",
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
    "What's one thing you would want a future partner to understand about you early on?",
    "What's the first thing you notice about someone you're attracted to?",
    "What's a physical feature you find attractive that most people never mention?",
    "Do you flirt more with words, eye contact, or touch?",
    "What's your tell when you're into someone and trying to hide it?",
    "Have you ever been so nervous around a crush that you completely shut down?",
    "What's the smoothest thing anyone has ever said to you?",
    "What's the least smooth thing you've ever said while flirting?",
    "Do you believe in instant chemistry, or does attraction have to build?",
    "What's a voice, laugh, or accent that immediately gets your attention?",
    "How long does it usually take you to know whether you're attracted to someone?",
    "What's an outfit that makes you feel unstoppable?",
    "What's something someone could wear that instantly catches your eye?",
    "Do you prefer being flirted with subtly or obviously?",
    "What's the most obvious hint you've ever missed from someone interested in you?",
    "What's the most obvious hint you've ever dropped that got completely missed?",
    "Have you ever rehearsed what you were going to say to a crush?",
    "What's your honest opinion on pickup lines?",
    "What's the one pickup line you would actually fall for?",
    "Are you more drawn to confidence or mystery?",
    "What's a small gesture someone could do that would completely disarm you?",
    "Have you ever changed your plans just to run into someone you liked?",
    "What's the longest you've stared at a text before finally sending it?",
    "Do you double text, or do you wait it out?",
    "How long does a reply have to take before you start overthinking it?",
    "Have you ever screenshotted a conversation to get a second opinion?",
    "What's the most attractive thing someone can do in a group setting?",
    "Are you better at flirting in person or over text?",
    "What's a compliment that would completely fluster you?",
    "What's a compliment you give that always lands?",
    "Have you ever been attracted to someone purely because of how they talked?",
    "What talent or hobby instantly makes someone more attractive to you?",
    "Have you ever been into someone your friends did not understand at all?",
    "What's the most attractive nonphysical trait a person can have?",
    "Do you fall fast or fall slow?",
    "Have you ever caught feelings for someone you only knew online?",
    "What's the most romantic thing you've ever done for someone?",
    "What's the most romantic thing someone has ever done for you?",
    "Have you ever planned an entire date in your head that never actually happened?",
    "What's your idea of a perfect lazy day with someone?",
    "What song immediately makes you think about a specific person?",
    "Have you ever made a playlist for someone you liked?",
    "What's the most nervous a first date has ever made you?",
    "What's your go-to first date that never fails?",
    "Would you rather have a first date that's exciting or one that's comfortable?",
    "What's the worst first date you've ever been on?",
    "What's the best first date you've ever been on?",
    "Have you ever brought a friend along as backup to a first date?",
    "Have you ever had a friend call you with a fake emergency during a date?",
    "What's your honest take on splitting the bill on a first date?",
    "How many dates in do you introduce someone to your friends?",
    "Have you ever gone on two dates in the same day?",
    "What's the pettiest reason you've ever turned someone down?",
    "Have you ever said yes to a date purely because you were bored?",
    "What's the most surprising thing someone has confessed to you on a first date?",
    "What's a topic you refuse to touch on a first date?",
    "What's your first-date red flag radar tuned to?",
    "Have you ever been ghosted after a date that felt like it went great?",
    "Have you ever ghosted someone after a date that felt like it went great?",
    "What's the longest situationship you've ever been in?",
    "Are situationships ever actually worth it?",
    "Have you ever agreed to keep things casual while secretly wanting more?",
    "Have you ever ended something because it was getting serious too fast?",
    "What's the fastest you've gone from strangers to something serious?",
    "Have you ever kept talking to someone you knew was wrong for you?",
    "What's a red flag you'd overlook for the right person?",
    "What's a red flag you would never overlook, no matter what?",
    "Have you ever been somebody else's red flag?",
    "What's a dating habit you've had to actively work on?",
    "Have you ever stayed friends with someone you still had feelings for?",
    "Have you ever confessed feelings to a friend?",
    "Would you risk a friendship for a real shot at something more?",
    "What's the most awkward way you've ever found out someone liked you?",
    "What's the most awkward way someone found out you liked them?",
    "Have you ever been rejected in a way you actually respected?",
    "What's the kindest rejection you've ever given?",
    "How do you handle it when attraction is not mutual?",
    "Have you ever pretended to be over someone before you actually were?",
    "What's a habit you picked up from someone you dated?",
    "What's something a past partner taught you about yourself?",
    "What's the most useful dating advice you've ever gotten?",
    "What's the worst dating advice you've ever gotten?",
    "What advice would you give someone about dating you?",
    "What would your dating profile say if it were brutally honest?",
    "What's the first photo on your dating profile, and why that one?",
    "What's a dating app prompt you'd never answer seriously?",
    "Have you ever unmatched with someone and immediately regretted it?",
    "Have you ever matched with someone just to see what they'd say?",
    "What's the strangest opening message you've ever received?",
    "What's your opening message strategy?",
    "How long do you usually talk to someone before meeting up?",
    "Have you ever met someone in person and felt zero chemistry after great texting?",
    "Have you ever felt far more chemistry in person than you expected to?",
    "What's the most spontaneous thing you've done with someone you were into?",
    "Have you ever traveled a long way just to see someone you were seeing?",
    "Would you do long distance if the person were right?",
    "What's the longest you've talked to someone before finally meeting them?",
    "Have you ever had a relationship nobody in your life knew about?",
    "What's something about your love life your friends would be surprised by?",
    "What's a question you'd want asked on a first date to skip the small talk?",
    "What's the most flustered you've ever been in front of someone you liked?",
    "Have you ever been someone's first kiss?",
    "What's the strangest place you've ever been kissed?",
    "What's the most confident you've ever felt with someone?",
    "Lights on or lights off?",
    "Morning, afternoon, or late at night?",
    "Music playing or complete silence?",
    "What's a song you'd never want playing in the background at the wrong moment?",
    "What song would absolutely set the mood for you?",
    "Are you louder than you'd ever admit?",
    "Do you enjoy being teased, or do you lose patience fast?",
    "How important is anticipation to you?",
    "Sexting: elite or overrated?",
    "Have you ever sent a flirty text to completely the wrong person?",
    "Do you save flirty photos or delete them immediately?",
    "What's your rule about phones in the bedroom?",
    "Have you ever had to be quiet because someone else was home?",
    "What's the closest you've ever come to getting caught?",
    "Have you ever had a hookup interrupted by something ridiculous?",
    "What's the funniest thing that's ever happened at the worst possible moment?",
    "Have you ever burst out laughing at exactly the wrong time?",
    "What's the most awkward noise you've ever had to play off?",
    "Have you ever had to explain a mark someone left on you?",
    "Do you like leaving marks, or absolutely not?",
    "What's your take on morning-after breakfast?",
    "Do you prefer staying over or heading home?",
    "What's the most attractive thing someone could do the morning after?",
    "Have you ever done a walk of shame?",
    "What's the earliest you've ever snuck out of someone's place?",
    "Have you ever pretended to be asleep to avoid a conversation?",
    "What's a fantasy you'd only ever admit to a very small number of people?",
    "What's a fantasy you've already crossed off the list?",
    "What's a fantasy you're fairly sure you'll never actually go through with?",
    "Do you have a type, or does it change completely every time?",
    "What's your type on paper versus your type in real life?",
    "Have you ever been genuinely surprised by who you were attracted to?",
    "What's the biggest difference between what you wanted at eighteen and what you want now?",
    "How much does someone's scent matter to you?",
    "What's a scent you find completely irresistible?",
    "Do you want matching energy, or do you enjoy a chase?",
    "Have you ever been the one doing all of the chasing?",
    "What's the most effort you've ever put into impressing someone?",
    "What's something that sounds completely unsexy but genuinely does it for you?",
    "What's something everyone calls sexy that does absolutely nothing for you?",
    "How do you feel about public affection?",
    "What counts as too much public affection in your book?",
    "Are you a hand-holder?",
    "What's your favorite nonsexual physical touch?",
    "Little spoon or big spoon?",
    "Do you actually sleep well next to someone, or do you just pretend to?",
    "What's your honest opinion on cuddling afterward?",
    "What's the most intimate conversation you've ever had at three in the morning?",
    "What's something you've only ever admitted to someone in the dark?",
    "Do you talk during, or are you all business?",
    "What's the best thing someone could whisper to you?",
    "What's the worst possible thing someone could say in the middle of a moment?",
    "Have you ever had a mood completely killed by one sentence?",
    "What's an instant mood killer for you?",
    "What's an instant mood maker for you?",
    "How do you feel about being photographed or filmed by a partner?",
    "Have you ever kept a photo of someone far longer than you should have?",
    "Have you ever had to clear out a camera roll in a hurry?",
    "Do you tell your friends everything, or keep it all to yourself?",
    "Who's the first person you'd call after a wild night?",
    "Have you ever had one of your own stories repeated back to you by a stranger?",
    "What's the biggest secret you've kept for a friend about their love life?",
    "Have you ever accidentally let something slip about a friend's love life?",
    "What's a piece of gossip you've successfully kept entirely to yourself?",
    "Have you ever caught feelings for someone in a group chat?",
    "What's the boldest thing you've ever done in public?",
    "Have you ever gotten in trouble for being too affectionate somewhere?",
    "Have you ever hooked up somewhere you really should not have?",
    "What's the most uncomfortable place you've ever tried to get comfortable?",
    "Have you ever booked a hotel room purely for the privacy?",
    "What's your opinion on hookups while traveling?",
    "Have you ever had a vacation romance?",
    "What's the shortest relationship you've ever had?",
    "What's the fastest you've ever known something was over?",
    "Have you ever ended things in a way you'd handle differently now?",
    "What's the most dramatic breakup you've ever witnessed from the outside?",
    "Have you ever gotten back together with the same person more than once?",
    "How many chances is too many chances?",
    "Would you date someone your friend group did not approve of?",
    "Have you ever hidden a relationship from your friends?",
    "What's the most surprising thing you've learned about someone after dating them?",
    "Have you ever found out something about a partner from social media first?",
    "Do you look someone up before a first date?",
    "How far back have you ever scrolled on someone's profile?",
    "Have you ever accidentally liked a very old post while scrolling?",
    "Have you ever blocked someone and then unblocked them?",
    "Do you keep exes on social media?",
    "Have you ever posted something specifically hoping one person would see it?",
    "What's the most attention-seeking thing you've ever posted?",
    "Have you ever changed your profile picture because of one specific person?",
    "What does your search history say about your love life?",
    "Have you ever asked the internet something you were too embarrassed to ask a person?",
    "What's something about intimacy you learned way later than you should have?",
    "What's a myth about sex you believed for far too long?",
    "What's the funniest thing you believed about sex as a teenager?",
    "Where did you actually learn about sex?",
    "What's something about relationships you wish had been explained to you better?",
    "What's the genuinely best thing about being single?",
    "What's the most overrated part of being in a relationship?",
    "What's the most underrated part of being in a relationship?",
    "Would you rather never be able to flirt again or never be flirted with again?",
    "Would you rather know exactly what someone thinks of you or never know at all?",
    "Would you rather date your best friend or someone who keeps you guessing?",
    "Would you rather have one perfect night or six pretty good months?",
    "Would you rather be someone's first or someone's last?",
    "Would you rather have incredible texting chemistry or incredible in-person chemistry?",
    "Would you rather a partner be great in bed or great at communicating?",
    "Would you rather date someone who never argues or someone who argues well?",
    "Would you rather have your search history read aloud or your camera roll scrolled through?",
    "Would you rather be irresistible for one day or unforgettable forever?",
    "Would you rather be with someone very adventurous or very consistent?",
    "Would you rather be obsessed with someone or have someone obsessed with you?",
    "Would you rather have a partner who's fun in public or fun in private?",
    "Would you rather go on a hundred first dates or stay in one long relationship?",
    "Would you rather never kiss again or never hug again?",
    "Would you rather a partner be too honest or too polite?",
    "Would you rather have great chemistry with terrible timing, or the other way around?",
    "Would you rather be single forever with amazing friends or partnered forever with none?",
    "If you had one free pass to ask anyone here anything, who would you use it on?",
    "Who here gives off the most hopeless romantic energy?",
    "Who here would be the most dangerous flirt at a party?",
    "Who here is most likely to fall in love on vacation?",
    "Who here would write the best love letter?",
    "Who here would plan the best surprise date?",
    "Who here has the best taste in people?",
    "Who here would be the most protective partner?",
    "Who here would be the best wingman?",
    "Who here has the most convincing poker face when they like someone?",
    "Who here would say 'I love you' first?",
    "Who here would take the longest to say 'I love you'?",
    "Who here would be the most dramatic about a brand-new crush?",
    "Who here would give the most brutally honest dating advice?",
    "Who here would actually be great at long distance?",
    "Who here would move across the country for love?",
    "Who here would stay calmest during a relationship argument?",
    "Who here is most likely to reread old messages?",
    "Who here would bounce back from a breakup the fastest?",
    "If your love life were a movie genre, which one would it be?",
    "If your love life came with a warning label, what would it read?",
    "If you could rewind one romantic moment and do it differently, would you?",
    "If you could permanently unsend one message, would you?",
    "If you could get one completely honest answer from someone you've dated, what would you ask?",
    "If you had to give up dating apps or nights out, which one goes?",
    "If you could only ever go on one type of date again, what would it be?",
    "If your flirting style were a sport, what sport would it be?",
    "If someone made a documentary about your love life, what would the title be?",
    "If you had to go on a blind date tomorrow, what's your one nonnegotiable?",
    "If you could instantly know someone's true intentions, would you actually want to?",
    "If your dating history were printed on a sign you had to wear, what would it say?",
    "If you could relive one night of your love life, which would it be?",
    "If your type had a bumper sticker, what would it say?",
    "If dating apps disappeared tomorrow, how would you meet people?",
    "What's the most romantic thing you'd never admit you want?",
    "What's the cheesiest thing that genuinely works on you?",
    "What's the corniest thing you'd let someone get away with?",
    "What's a movie romance moment you'd actually want recreated for you?",
    "What's the most unrealistic thing about romance in movies?",
    "What love song lyric is uncomfortably accurate for you?",
    "What's your karaoke song when you want someone's attention?",
    "What's your most attractive quality according to other people?",
    "What's your most attractive quality according to you?",
    "What do people assume about you romantically that's completely wrong?",
    "What's a reputation you have that you'd like the chance to correct?",
    "How do you tell the difference between actually liking someone and just being flattered?",
    "Have you ever mistaken being flattered for being interested?",
    "Have you ever liked the idea of someone more than the actual person?",
    "Have you ever wanted someone mostly because they did not want you?",
    "How do you act when you get jealous?",
    "What's the pettiest thing you've done while jealous?",
    "Are you more possessive or more independent in relationships?",
    "What's your love language when you're the one giving?",
    "What's your love language when you're the one receiving?",
    "What's one small daily thing a partner could do that would mean everything?",
    "What's the fastest way to earn your trust?",
    "What's the fastest way to lose your interest?",
    "How much space do you actually need in a relationship?",
    "Do you like being pursued loudly or quietly?",
    "How do you react when someone is far more into you than you expected?",
    "Have you ever been genuinely swept off your feet?",
    "What's the boldest compliment you've ever received?",
    "What's a compliment about your appearance you'll never forget?",
    "What's something you get complimented on constantly?",
    "What's something you wish people noticed about you more?",
    "What's a flirtatious habit you have that you don't even notice?",
    "What's a habit of yours that gets read as flirting when it absolutely is not?",
    "Have you ever been accused of leading someone on?",
    "Have you ever been led on and known it the entire time?",
    "What's your honest opinion on second chances?",
    "What's your honest opinion on the idea of 'the one'?",
    "Can people genuinely be friends after dating?",
    "Have you ever stayed friends with someone you'd absolutely get back together with?",
    "What's the most grown-up conversation you've ever had with someone you were seeing?",
    "What's a boundary you set that you're genuinely proud of?",
    "What's something you need in a relationship that you used to think was too much to ask?",
    "What would make you say yes to a second date instantly?",
    "What's the sexiest nonphysical thing a person can do?",
    "Have you ever been intimidated by how attractive someone was?",
    "Have you ever been the most attractive person in a room and known it?",
    "What's the biggest glow-up you've ever had?",
    "What's something you do purely because it makes you feel attractive?",
    "What's the last thing that made you blush?",
    "What's the wildest thing you've ever agreed to at two in the morning?",
    "Have you ever left a party with someone you had just met?",
    "Have you ever pretended to know someone to escape an awkward conversation?",
    "What's your best excuse for getting out of unwanted attention?",
    "Have you ever had two people competing for your attention at the same time?",
    "What's the boldest thing a complete stranger has ever said to you?",
    "Have you ever gotten someone's number without ever asking for it?",
    "Have you ever given out your number and immediately regretted it?",
    "Have you ever gone on a real date with someone you met on a night out?",
    "What's the strangest compliment a stranger has ever given you?",
    "Have you ever been recognized in public by someone from a dating app?",
    "Have you ever run into a date at the worst possible moment?",
    "Have you ever spotted an ex somewhere and immediately hidden?",
    "Have you ever been on a date and run into someone else you were talking to?",
    "What's the most awkward run-in you have ever survived?",
    "How do you choose when two people you like are both interested?",
    "Have you ever chosen wrong and figured it out much later?",
    "Have you ever set two friends up and had it actually work?",
    "Have you ever set two friends up and had it go completely sideways?",
    "What's the worst matchmaking attempt anyone has ever made on your behalf?",
    "Have you ever been someone's rebound?",
    "Have you ever had a rebound of your own?",
    "How long do you wait before dating again after something ends?",
    "What's your very first move after a breakup?",
    "Have you ever done something drastic to your appearance after a breakup?",
    "What's the most cliche post-breakup thing you've ever done?",
    "Have you ever kept something from an ex that you probably should have returned?",
    "What's the pettiest thing you've done after a relationship ended?",
    "Have you ever unfollowed someone dramatically?",
    "Have you ever written a message to someone and never sent it?",
    "Do you still have unsent drafts to anyone?",
    "What's the most honest thing you've ever said to someone you liked?",
    "What's the most honest thing someone has ever said to you?",
    "Have you ever said 'I love you' without fully meaning it?",
    "Have you ever meant it completely and never said it out loud?",
    "What's the closest you've come to saying something you couldn't take back?",
    "What's a conversation you'd redo if you could?",
    "What's the best conversation you've ever had with someone you were into?",
    "Deep conversations or playful banter?",
    "How much of your flirting is just humor?",
    "Can someone be too funny to take seriously?",
    "What's the most attractive thing about someone's sense of humor?",
    "Have you ever been attracted to someone purely because they made you laugh?",
    "Have you ever gone completely outside your type and loved it?",
    "What's the biggest risk you've ever taken romantically?",
    "What's the biggest romantic risk you refused to take?",
    "Do you regret the things you did or the things you never did?",
    "What's an opportunity you'd take instantly if it came back around?",
    "Have you ever reached out to someone years later?",
    "Have you ever had someone reach out to you years later?",
    "What's the longest gap you've had between two conversations with the same person?",
    "What's a romantic 'what if' that still lives rent free in your head?",
    "Is timing the real problem, or is that just an excuse?",
    "Have you ever met the right person at completely the wrong time?",
    "What's the most mature thing you've ever done in a relationship?",
    "What's the least mature thing you've ever done in a relationship?",
    "How do you apologize when you know you were the one who was wrong?",
    "What's harder for you: saying sorry or accepting one?",
    "Do you talk it out immediately or cool off first?",
    "What's the funniest thing you've ever argued about with a partner?",
    "How do you feel about making up affectionately after an argument?",
    "What's something you refuse to compromise on?",
    "What's something you'd happily compromise on?",
    "Would you be comfortable if a partner stayed close friends with an ex?",
    "What's your take on sharing phone passcodes in a relationship?",
    "What's your take on posting a relationship online?",
    "Would you rather have a very private relationship or a very public one?",
    "Have you ever dated someone who wanted a completely different level of privacy?",
    "Have you ever felt judged by a partner's friends?",
    "What's the most nervous you've ever been meeting someone's friends?",
    "What's your strategy for winning over someone's friend group?",
    "Who's the hardest person you've ever had to impress?",
    "What's your ideal amount of time together per week?",
    "Texter, caller, or voice-note person?",
    "How do you actually feel about receiving voice notes?",
    "What's your good morning text policy?",
    "Do you like nicknames, or do they make you cringe?",
    "What's the worst nickname you've ever been given by someone?",
    "What's a nickname you'd genuinely love to be called?",
    "What's your opinion on matching outfits, matching tattoos, or matching anything?",
    "What's the most couple-y thing you'd actually do?",
    "What's the most couple-y thing you'd absolutely never do?",
    "What's the best gift you've ever gotten from someone you were seeing?",
    "What's the worst gift you've ever gotten from someone you were seeing?",
    "What would be the perfect gift for you right now?",
    "What's your ideal anniversary?",
    "What's your honest ideal Valentine's Day?",
    "What's the most romantic holiday, and why is it that one?",
    "Have you ever been alone on a holiday and secretly loved it?",
    "What's the best night out you've ever had?",
    "What's the wildest night you'd repeat in a heartbeat?",
    "What's a story about your love life you'll still be telling at eighty?",
    "Have you ever had a crush that lasted for years?",
    "What's the shortest crush you've ever had?",
    "Have you ever gotten over someone in a single moment?",
    "What's something that instantly ended your interest in someone?",
    "Have you ever been talked out of liking someone by a friend?",
    "Have you ever ignored your friends and gone for it anyway?",
    "Whose opinion matters most to you when you're dating someone new?",
    "What's the most useful thing a friend has ever told you about your love life?",
    "What's the last thing you did purely because someone was watching?",
    "What's a moment you replay because it went perfectly?",
    "What's something you're weirdly confident about?",
    "What's a rumor about yourself you'd love to start?",
    "How would you rate your own flirting out of ten?",
    "How would this group rate your flirting out of ten?",
    "What's the most attractive thing you've ever watched someone do?",
    "What's the most attractive thing you've ever done, according to someone else?",
    "What's the furthest you've ever gone out of your way for someone you liked?",
    "Have you ever gone somewhere you had no interest in just to see someone?",
    "Have you ever pretended to like something just to keep a conversation going?",
    "How bad is your fake laugh situation?",
    "Have you ever agreed with something you completely disagreed with to impress someone?",
    "What's the most you've ever pretended to know about a topic on a date?",
    "Have you ever been caught in a small lie by someone you liked?",
    "What's the whitest lie you've told to protect someone's feelings?",
    "Have you ever exaggerated a story to make yourself look better to a crush?",
    "What's the story you always tell when you're trying to impress someone?",
    "What's your best party trick?",
    "What's something you do that reliably gets attention?",
    "What's your signature look?",
    "How long does it actually take you to get ready for a date?",
    "What's the most effort you've ever put into a single outfit?",
    "Have you ever bought something specifically for one night?",
    "What's the boldest fashion risk you would take?",
    "What would you wear if you knew you'd run into an ex tonight?",
    "Have you ever spent hours getting ready and then canceled?",
    "What's your threshold for canceling plans?",
    "Have you ever canceled a date because of the weather?",
    "What's your most-used excuse?",
    "Have you ever accidentally double-booked a night?",
    "What's the most chaotic scheduling you've ever pulled off?",
    "What's the most spontaneous trip you've taken with someone?",
    "Would you take a weekend trip with someone you'd known for a month?",
    "What's your ideal romantic getaway?",
    "Beach trip or city trip with someone new?",
    "Would you rather travel with a partner or with friends?",
    "What's the real test of a relationship: traveling, moving, or cooking together?",
    "What's the most romantic meal you've ever had?",
    "Can you cook for someone, or is that a hard no?",
    "What's your one genuinely impressive dish?",
    "Would you rather be cooked for or taken out?",
    "What's your comfort order when you're heartbroken?",
    "What's your celebration order when things are going great?",
    "What's your drink order when you want to look interesting?",
    "What's your go-to karaoke duet?",
    "Would you slow dance in public?",
    "Can you actually dance, or do you just fully commit?",
    "What's the most romantic dance floor moment you've had?",
    "Have you ever been asked to dance by a complete stranger?",
    "Have you ever asked a complete stranger to dance?",
    "What's the best interaction you've had with someone you never saw again?",
    "Have you ever had a perfect moment with someone whose name you never learned?",
    "Do you believe in missed connections?",
    "Have you ever thought about someone you met once for way too long?",
    "What's your honest opinion on love at first sight?",
    "Have you ever felt something instantly with someone?",
    "What's the fastest you've ever told a friend about someone new?",
    "How dramatic are you when you have a brand-new crush?",
    "Where does your crush behavior land between subtle and unbearable?",
    "Have you ever been called out for being way too obvious?",
    "Have you ever successfully hidden a crush from absolutely everyone?",
    "What's the closest anyone has come to guessing who you liked?",
    "Have you ever had a crush revealed by someone else?",
    "What's the most embarrassing way a crush has ever found out?",
    "Have you ever confessed feelings and had it go perfectly?",
    "Have you ever confessed feelings and had it go terribly?",
    "How do you recover from an awkward confession?",
    "Have you ever pretended to be joking right after saying something real?",
    "What's the most vulnerable thing you've ever said out loud?",
    "How comfortable are you actually being vulnerable?",
    "What's easier for you: being desired or being understood?",
    "What's something you want from a partner that you've never actually asked for?",
    "What's a need of yours that people constantly misread?",
    "How do you show someone you're interested without ever saying it?",
    "What's your personal version of a green flag?",
    "What's a green flag that most people completely underrate?",
    "What would immediately make you feel safe with someone?",
    "What's the most reassuring thing a partner could say to you?",
    "How do you react to being complimented in front of other people?",
    "How do you handle compliments in general?",
    "What's the last compliment you gave someone?",
    "Give the player to your right a genuine compliment right now.",
    "Give the player to your left the most flattering compliment you can think of.",
    "Name the most attractive quality of the player who went right before you.",
    "Describe your ideal partner in exactly five words.",
    "Describe your worst possible match in exactly five words.",
    "Describe your flirting style in three words.",
    "Sum up your entire dating history in one sentence.",
    "Give your love life a title and a rating out of five stars.",
    "What's the tagline of your love life right now?",
    "If your relationship status were a weather report, what would it say?",
    "What's the most attractive thing about being single right now?",
    "What's the most annoying question people ask you about your love life?",
    "How do you answer when relatives ask whether you're seeing anyone?",
    "What's the most awkward family question you've ever gotten?",
    "Have you ever brought someone home to meet family way too early?",
    "How fast would you introduce someone to your family?",
    "Would you rather your family love your partner or your friends love your partner?",
    "What would your best friend say your dating pattern is?",
    "What's a pattern you've noticed in the people you're drawn to?",
    "What's one thing you want to be different about your love life a year from now?"
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

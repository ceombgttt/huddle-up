import pool from './db.js';
import bcrypt from 'bcryptjs';

const SEED_EMAIL_DOMAIN = '@huddleup-seed.demo';

const SEED_USERS = [
  { name: 'Mike Rodriguez', gender: 'male', bio: 'Die-hard Heat fan 🔥 Never miss a game', city: 'Boca Raton, FL', teams: ['Miami Heat', 'Miami Dolphins'], points: 2450, img: 1 },
  { name: 'Sarah Chen', gender: 'female', bio: 'Panthers hockey all day 🏒', city: 'Fort Lauderdale, FL', teams: ['Florida Panthers', 'Inter Miami'], points: 1820, img: 5 },
  { name: 'James Williams', gender: 'male', bio: 'Packers fan living in FL 💚💛', city: 'Miami, FL', teams: ['Green Bay Packers', 'Milwaukee Bucks'], points: 3650, img: 3 },
  { name: 'Emily Foster', gender: 'female', bio: 'Go Bills! Buffalo girl in paradise 🌴', city: 'Boca Raton, FL', teams: ['Buffalo Bills', 'New York Yankees'], points: 1240, img: 9 },
  { name: 'David Kim', gender: 'male', bio: 'Basketball junkie 🏀 Heat culture!', city: 'Fort Lauderdale, FL', teams: ['Miami Heat', 'LA Dodgers'], points: 2890, img: 7 },
  { name: 'Ashley Martinez', gender: 'female', bio: 'Soccer & brunch vibes ⚽', city: 'Boca Raton, FL', teams: ['Inter Miami', 'Barcelona'], points: 980, img: 10 },
  { name: 'Tom Murphy', gender: 'male', bio: 'Patriots fan in enemy territory 🏈', city: 'West Palm Beach, FL', teams: ['New England Patriots', 'Boston Celtics', 'Boston Red Sox'], points: 4120, img: 11 },
  { name: 'Lisa Anderson', gender: 'female', bio: 'Dolphins ride or die 🐬', city: 'Fort Lauderdale, FL', teams: ['Miami Dolphins', 'Miami Heat'], points: 1560, img: 16 },
  { name: 'Chris Taylor', gender: 'male', bio: 'Steelers nation! Terrible towel everywhere 🟡⚫', city: 'Boca Raton, FL', teams: ['Pittsburgh Steelers', 'Pittsburgh Penguins'], points: 3200, img: 12 },
  { name: 'Rachel Green', gender: 'female', bio: 'Cowboys fan livin large in FL ⭐', city: 'Miami, FL', teams: ['Dallas Cowboys', 'Dallas Mavericks'], points: 2100, img: 20 },
  { name: 'Kevin Nguyen', gender: 'male', bio: 'UFC & boxing - combat sports all day 🥊', city: 'Fort Lauderdale, FL', teams: ['UFC', 'Miami Heat'], points: 1780, img: 13 },
  { name: 'Amanda Lewis', gender: 'female', bio: 'Baseball season is the best season ⚾', city: 'Boca Raton, FL', teams: ['New York Yankees', 'Miami Dolphins'], points: 890, img: 23 },
  { name: 'Ryan O\'Brien', gender: 'male', bio: 'Chicago expat. Bears, Cubs, Bulls forever 🐻', city: 'West Palm Beach, FL', teams: ['Chicago Bears', 'Chicago Cubs', 'Chicago Bulls'], points: 2670, img: 14 },
  { name: 'Nicole Rivera', gender: 'female', bio: 'F1 and soccer 🏎️⚽ Vamos!', city: 'Miami, FL', teams: ['Inter Miami', 'Real Madrid'], points: 1450, img: 25 },
  { name: 'Matt Johnson', gender: 'male', bio: 'Giants fan. NY forever 🗽', city: 'Boca Raton, FL', teams: ['New York Giants', 'New York Knicks', 'New York Yankees'], points: 1950, img: 15 },
  { name: 'Jen Parker', gender: 'female', bio: 'Tennis & Premier League mornings ☕🎾', city: 'Fort Lauderdale, FL', teams: ['Arsenal', 'Inter Miami'], points: 1120, img: 26 },
  { name: 'Brian Garcia', gender: 'male', bio: 'Lakers fan in South FL 💜💛', city: 'Miami, FL', teams: ['LA Lakers', 'LA Dodgers'], points: 3890, img: 17 },
  { name: 'Megan Scott', gender: 'female', bio: 'Love game day energy! All sports, all day 🎉', city: 'Boca Raton, FL', teams: ['Miami Heat', 'Florida Panthers'], points: 2230, img: 28 },
  { name: 'Alex Ramirez', gender: 'male', bio: 'Chivas fan! Liga MX 🇲🇽', city: 'Fort Lauderdale, FL', teams: ['Chivas Guadalajara', 'Club América'], points: 1680, img: 18 },
  { name: 'Lauren Mitchell', gender: 'female', bio: 'March Madness is my Super Bowl 🏀', city: 'West Palm Beach, FL', teams: ['Duke Blue Devils', 'Carolina Panthers'], points: 1340, img: 32 },
  { name: 'Jason Brooks', gender: 'male', bio: 'Celtics green runs deep ☘️', city: 'Boca Raton, FL', teams: ['Boston Celtics', 'New England Patriots', 'Boston Red Sox'], points: 2780, img: 51 },
  { name: 'Stephanie Ward', gender: 'female', bio: 'World Cup 2026 LFG!! 🇺🇸⚽', city: 'Miami, FL', teams: ['USA', 'Inter Miami'], points: 760, img: 31 },
  { name: 'Daniel Cooper', gender: 'male', bio: '49ers faithful all day 🔴⚪', city: 'Fort Lauderdale, FL', teams: ['San Francisco 49ers', 'Golden State Warriors'], points: 2340, img: 52 },
  { name: 'Victoria Hayes', gender: 'female', bio: 'Avs fan missing the mountains 🏔️🏒', city: 'Boca Raton, FL', teams: ['Colorado Avalanche', 'Denver Broncos'], points: 1890, img: 36 },
  { name: 'Marcus Bell', gender: 'male', bio: 'Dolphins + Panthers = perfect FL sports life', city: 'Fort Lauderdale, FL', teams: ['Miami Dolphins', 'Florida Panthers'], points: 3100, img: 53 },
  { name: 'Tiffany Ross', gender: 'female', bio: 'Yankees & chill 💙🤍', city: 'West Palm Beach, FL', teams: ['New York Yankees', 'New York Knicks'], points: 670, img: 39 },
  { name: 'Patrick Sullivan', gender: 'male', bio: 'Eagles fly! Philly in paradise 🦅', city: 'Boca Raton, FL', teams: ['Philadelphia Eagles', 'Philadelphia 76ers'], points: 2560, img: 54 },
  { name: 'Kayla Diaz', gender: 'female', bio: 'Premier League Saturdays are sacred 🏴', city: 'Miami, FL', teams: ['Manchester United', 'Miami Heat'], points: 1150, img: 41 },
  { name: 'Tyler Hughes', gender: 'male', bio: 'Roll Tide! 🐘 Bama football is life', city: 'Fort Lauderdale, FL', teams: ['Alabama Crimson Tide', 'Atlanta Falcons'], points: 1980, img: 55 },
  { name: 'Samantha Cruz', gender: 'female', bio: 'Hockey girl living her best FL life 🏒🌞', city: 'Boca Raton, FL', teams: ['Florida Panthers', 'Tampa Bay Lightning'], points: 2040, img: 43 },
  { name: 'Derek Morgan', gender: 'male', bio: 'Browns fan. Yeah I know 🤷‍♂️😂', city: 'West Palm Beach, FL', teams: ['Cleveland Browns', 'Cleveland Cavaliers'], points: 1470, img: 56 },
  { name: 'Hannah Young', gender: 'female', bio: 'Golden State all day! Splash zone 💦', city: 'Miami, FL', teams: ['Golden State Warriors', 'San Francisco 49ers'], points: 1630, img: 44 },
  { name: 'Carlos Morales', gender: 'male', bio: 'Club América y boxeo 🥊💛💙', city: 'Fort Lauderdale, FL', teams: ['Club América', 'Inter Miami'], points: 920, img: 57 },
  { name: 'Brittany Cole', gender: 'female', bio: 'Seahawks fan in sunshine state 💚💙', city: 'Boca Raton, FL', teams: ['Seattle Seahawks', 'Seattle Sounders'], points: 1290, img: 45 },
  { name: 'Jordan Price', gender: 'male', bio: 'Maple Leafs + Raptors 🍁🇨🇦', city: 'Fort Lauderdale, FL', teams: ['Toronto Maple Leafs', 'Toronto Raptors'], points: 2150, img: 58 },
  { name: 'Natalie West', gender: 'female', bio: 'Heat culture baby! Let\'s go! 🔥🔥', city: 'Miami, FL', teams: ['Miami Heat', 'Inter Miami'], points: 3420, img: 47 },
  { name: 'Brandon Reed', gender: 'male', bio: 'Tailgate king 👑 Any sport, any time', city: 'Boca Raton, FL', teams: ['Miami Dolphins', 'Florida Gators'], points: 4560, img: 59 },
  { name: 'Olivia Turner', gender: 'female', bio: 'Liverpool YNWA ❤️ Early mornings worth it', city: 'West Palm Beach, FL', teams: ['Liverpool', 'Inter Miami'], points: 1070, img: 48 },
  { name: 'Sean Kelly', gender: 'male', bio: 'Bruins & Pats. New England forever 🐻', city: 'Fort Lauderdale, FL', teams: ['Boston Bruins', 'New England Patriots'], points: 2680, img: 60 },
  { name: 'Christina Flores', gender: 'female', bio: 'Watch party queen 👸 300+ attended!', city: 'Miami, FL', teams: ['Miami Heat', 'Miami Dolphins', 'Florida Panthers'], points: 4890, img: 49 },
  { name: 'Will Thompson', gender: 'male', bio: 'Bengals Who Dey! 🐯', city: 'Boca Raton, FL', teams: ['Cincinnati Bengals', 'Cincinnati Reds'], points: 1540, img: 61 },
  { name: 'Jessica Adams', gender: 'female', bio: 'Chiefs Kingdom even in FL ❤️💛', city: 'Fort Lauderdale, FL', teams: ['Kansas City Chiefs', 'Kansas City Royals'], points: 2310, img: 21 },
  { name: 'Ethan Wood', gender: 'male', bio: 'Rangers & Jets 🏒🏈 NY sports pain', city: 'Boca Raton, FL', teams: ['New York Rangers', 'New York Jets'], points: 1870, img: 62 },
  { name: 'Alyssa James', gender: 'female', bio: 'Ohio State alum! O-H! 🌰', city: 'West Palm Beach, FL', teams: ['Ohio State Buckeyes', 'Cleveland Browns'], points: 1190, img: 22 },
  { name: 'Nick Sanchez', gender: 'male', bio: 'MMA & football Sundays 🏈🥊', city: 'Miami, FL', teams: ['Miami Dolphins', 'UFC'], points: 2070, img: 63 },
  { name: 'Kaitlyn Barnes', gender: 'female', bio: 'Bucks in 6! 🦌 Milwaukee represent', city: 'Fort Lauderdale, FL', teams: ['Milwaukee Bucks', 'Green Bay Packers'], points: 980, img: 24 },
  { name: 'Trevor Grant', gender: 'male', bio: 'F1 & soccer Sunday funday 🏎️', city: 'Boca Raton, FL', teams: ['Manchester City', 'Inter Miami'], points: 1760, img: 64 },
  { name: 'Vanessa Ruiz', gender: 'female', bio: 'Mexicana and proud! Liga MX ⚽🇲🇽', city: 'Miami, FL', teams: ['Club América', 'Chivas Guadalajara', 'Inter Miami'], points: 830, img: 27 },
  { name: 'Cody Marshall', gender: 'male', bio: 'Dawgs on top! Go Georgia 🐶', city: 'Fort Lauderdale, FL', teams: ['Georgia Bulldogs', 'Atlanta Braves'], points: 2940, img: 65 },
  { name: 'Dana Phillips', gender: 'female', bio: 'Panthers + Dolphins sundays are the best', city: 'Boca Raton, FL', teams: ['Florida Panthers', 'Miami Dolphins'], points: 1420, img: 29 },
];

const SEED_VENUES = [
  { name: "Rocco's Tacos", address: '500 E Las Olas Blvd', city: 'Fort Lauderdale, FL', type: 'Restaurant & Bar', capacity: 150 },
  { name: 'Barrel of Monks', address: '1141 S Rogers Circle', city: 'Boca Raton, FL', type: 'Brewery', capacity: 80 },
  { name: 'The Funky Biscuit', address: '303 SE Mizner Blvd', city: 'Boca Raton, FL', type: 'Restaurant & Bar', capacity: 120 },
  { name: "BRU's Room Sports Grill", address: '3200 N Federal Hwy', city: 'Boca Raton, FL', type: 'Sports Bar', capacity: 200 },
  { name: 'Dubliner Irish Pub', address: '435 SE 3rd Ave', city: 'Fort Lauderdale, FL', type: 'Pub', capacity: 90 },
  { name: 'Old Heidelberg', address: '6080 N Federal Hwy', city: 'Fort Lauderdale, FL', type: 'Restaurant & Bar', capacity: 100 },
  { name: 'Batch Gastropub', address: '1400 E Las Olas Blvd', city: 'Fort Lauderdale, FL', type: 'Gastropub', capacity: 110 },
  { name: 'Galway Bay Irish Pub', address: '4520 PGA Blvd', city: 'Palm Beach Gardens, FL', type: 'Pub', capacity: 85 },
  { name: "Flanigan's Seafood", address: '2505 N Federal Hwy', city: 'Boca Raton, FL', type: 'Sports Bar', capacity: 130 },
  { name: 'Tap 42', address: '5050 Town Center Circle', city: 'Boca Raton, FL', type: 'Gastropub', capacity: 140 },
  { name: 'Bokampers Sports Bar', address: '3115 NE 32nd Ave', city: 'Fort Lauderdale, FL', type: 'Sports Bar', capacity: 180 },
  { name: 'American Social', address: '721 E Las Olas Blvd', city: 'Fort Lauderdale, FL', type: 'Restaurant & Bar', capacity: 160 },
];

const now = new Date();
const day = 24*60*60*1000;

function futureDate(daysFromNow, hour, min=0) {
  const d = new Date(now.getTime() + daysFromNow * day);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function pastDate(daysAgo, hour, min=0) {
  const d = new Date(now.getTime() - daysAgo * day);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

const SEED_PARTIES = [
  { gameId: 'nhl1', sport: 'NHL', home: 'Florida Panthers', away: 'Toronto Maple Leafs', time: futureDate(2, 19, 0), venueIdx: 0, hostIdx: 1, title: "Panthers Watch Party! 🏒", notes: "Let's go Cats! First round on me!", attendeeCount: 14, supportedTeam: 'Florida Panthers' },
  { gameId: 'nba1', sport: 'NBA', home: 'Miami Heat', away: 'Boston Celtics', time: futureDate(3, 19, 30), venueIdx: 2, hostIdx: 0, title: 'Heat vs Celtics Game Night 🔥', notes: 'Heat culture! Best wings in town. Get there early!', attendeeCount: 18, supportedTeam: 'Miami Heat' },
  { gameId: 'nfl3', sport: 'NFL', home: 'Green Bay Packers', away: 'Chicago Bears', time: futureDate(4, 13, 0), venueIdx: 1, hostIdx: 2, title: 'Pack vs Bears - Wisconsin Expats! 💚💛', notes: 'Wisconsin expats unite! Go Pack Go! Brats & beer!', attendeeCount: 11, supportedTeam: 'Green Bay Packers' },
  { gameId: 'nfl1', sport: 'NFL', home: 'Kansas City Chiefs', away: 'Buffalo Bills', time: futureDate(1, 18, 0), venueIdx: 3, hostIdx: 41, title: 'Chiefs Kingdom FL Watch Party ❤️', notes: "Chiefs fans in South FL - let's get loud!", attendeeCount: 9, supportedTeam: 'Kansas City Chiefs' },
  { gameId: 'nfl1', sport: 'NFL', home: 'Kansas City Chiefs', away: 'Buffalo Bills', time: futureDate(1, 18, 0), venueIdx: 10, hostIdx: 3, title: 'Bills Mafia Fort Lauderdale! 🦬', notes: "Go Bills! Folding table not included 😂", attendeeCount: 12, supportedTeam: 'Buffalo Bills' },
  { gameId: 'nba2', sport: 'NBA', home: 'LA Lakers', away: 'Golden State Warriors', time: futureDate(2, 22, 0), venueIdx: 11, hostIdx: 16, title: 'Lakers Watch Party 💜💛', notes: "LA fans in Fort Lauderdale! Late night hoops!", attendeeCount: 8, supportedTeam: 'LA Lakers' },
  { gameId: 'epl1', sport: 'Premier League', home: 'Manchester United', away: 'Liverpool', time: futureDate(5, 12, 30), venueIdx: 4, hostIdx: 27, title: 'Man United vs Liverpool! The Rivalry 🏴', notes: "Early morning pints and football! GGMU!", attendeeCount: 15, supportedTeam: 'Manchester United' },
  { gameId: 'epl1', sport: 'Premier League', home: 'Manchester United', away: 'Liverpool', time: futureDate(5, 12, 30), venueIdx: 7, hostIdx: 37, title: 'YNWA Liverpool Watch Party ❤️', notes: "You'll never walk alone! Liverpool supporters welcome!", attendeeCount: 10, supportedTeam: 'Liverpool' },
  { gameId: 'nhl2', sport: 'NHL', home: 'Boston Bruins', away: 'New York Rangers', time: futureDate(3, 18, 0), venueIdx: 5, hostIdx: 38, title: 'Bruins vs Rangers - Battle of the East 🏒', notes: "B's fans lets gooo! Old Heidelberg has great beer.", attendeeCount: 7, supportedTeam: 'Boston Bruins' },
  { gameId: 'nba1', sport: 'NBA', home: 'Miami Heat', away: 'Boston Celtics', time: futureDate(3, 19, 30), venueIdx: 9, hostIdx: 20, title: 'Celtics Watch Party @ Tap 42 ☘️', notes: "Boston fans in Boca! Let's get this W!", attendeeCount: 13, supportedTeam: 'Boston Celtics' },
  { gameId: 'cbb1', sport: 'College Basketball', home: 'Duke Blue Devils', away: 'North Carolina Tar Heels', time: futureDate(6, 21, 0), venueIdx: 8, hostIdx: 19, title: 'Duke vs UNC - The Rivalry Game! 🏀', notes: "March Madness vibes! Cameron Crazies in FL!", attendeeCount: 16, supportedTeam: 'Duke Blue Devils' },
  { gameId: 'ufc1', sport: 'UFC', home: 'UFC 314', away: 'Main Card', time: futureDate(5, 22, 0), venueIdx: 6, hostIdx: 10, title: 'UFC 314 Watch Party! 🥊', notes: "Main card starts at 10! Let's watch some fights!", attendeeCount: 20, supportedTeam: 'UFC' },
  { gameId: 'mls2', sport: 'MLS', home: 'Inter Miami', away: 'Atlanta United', time: futureDate(7, 19, 30), venueIdx: 11, hostIdx: 5, title: 'Inter Miami Watch Party ⚽💗', notes: "Messi magic! Let's support our local team!", attendeeCount: 22, supportedTeam: 'Inter Miami' },
  { gameId: 'mx1', sport: 'Liga MX', home: 'Club América', away: 'Chivas Guadalajara', time: futureDate(4, 20, 0), venueIdx: 0, hostIdx: 18, title: 'El Clásico Nacional! América vs Chivas 🇲🇽', notes: "The biggest rivalry in Mexican football! Vamos América!", attendeeCount: 17, supportedTeam: 'Club América' },
  { gameId: 'lla1', sport: 'La Liga', home: 'Real Madrid', away: 'Barcelona', time: futureDate(6, 16, 0), venueIdx: 4, hostIdx: 13, title: 'El Clásico! Real Madrid vs Barça ⚽', notes: "The biggest match in world football! Hala Madrid!", attendeeCount: 25, supportedTeam: 'Real Madrid' },
  { gameId: 'nfl2', sport: 'NFL', home: 'San Francisco 49ers', away: 'Dallas Cowboys', time: futureDate(2, 20, 30), venueIdx: 3, hostIdx: 22, title: "Niners Faithful Watch Party! 🔴⚪", notes: "49ers fans in South FL represent!", attendeeCount: 10, supportedTeam: 'San Francisco 49ers' },
  { gameId: 'nfl2', sport: 'NFL', home: 'San Francisco 49ers', away: 'Dallas Cowboys', time: futureDate(2, 20, 30), venueIdx: 9, hostIdx: 9, title: 'Cowboys Nation Boca Watch Party ⭐', notes: "America's Team! Lets go Boys!", attendeeCount: 14, supportedTeam: 'Dallas Cowboys' },
  { gameId: 'nba3', sport: 'NBA', home: 'Milwaukee Bucks', away: 'Philadelphia 76ers', time: futureDate(4, 20, 0), venueIdx: 1, hostIdx: 45, title: 'Bucks Watch Party 🦌', notes: "Bucks in 6! Wisconsin crew in Boca!", attendeeCount: 6, supportedTeam: 'Milwaukee Bucks' },
  { gameId: 'f1_2', sport: 'Formula 1', home: 'Miami Grand Prix', away: 'Race Weekend', time: futureDate(10, 15, 30), venueIdx: 11, hostIdx: 46, title: 'F1 Miami GP Watch Party 🏎️', notes: "Race day! Pre-race coverage at 2PM!", attendeeCount: 19, supportedTeam: 'Formula 1' },
  { gameId: 'nhl3', sport: 'NHL', home: 'Colorado Avalanche', away: 'Vegas Golden Knights', time: futureDate(3, 21, 0), venueIdx: 5, hostIdx: 23, title: 'Avs Watch Party in FL! 🏔️', notes: "Colorado transplants unite! Go Avs!", attendeeCount: 5, supportedTeam: 'Colorado Avalanche' },
  { gameId: 'box1', sport: 'Boxing', home: 'Sebastian Fundora', away: 'Keith Thurman', time: futureDate(8, 21, 0), venueIdx: 6, hostIdx: 10, title: 'Fundora vs Thurman Boxing Night 🥊', notes: "Big fight! WBC title on the line!", attendeeCount: 12, supportedTeam: 'Boxing' },
  { gameId: 'cfb1', sport: 'College Football', home: 'Alabama Crimson Tide', away: 'Georgia Bulldogs', time: futureDate(14, 15, 30), venueIdx: 8, hostIdx: 28, title: 'Roll Tide Watch Party! 🐘', notes: "Bama fans in Boca! Roll Tide Roll!", attendeeCount: 11, supportedTeam: 'Alabama Crimson Tide' },
  { gameId: 'ucl1', sport: 'Champions League', home: 'Real Madrid', away: 'Manchester City', time: futureDate(6, 15, 0), venueIdx: 7, hostIdx: 46, title: 'Champions League Watch Party ⭐', notes: "The biggest club competition! Don't miss it!", attendeeCount: 13, supportedTeam: 'Real Madrid' },
  { gameId: 'nba1', sport: 'NBA', home: 'Miami Heat', away: 'Boston Celtics', time: pastDate(3, 19, 30), venueIdx: 3, hostIdx: 35, title: 'HEAT NATION GAME NIGHT 🔥🔥', notes: "What a game!! Heat pulled it off in OT!", attendeeCount: 21, supportedTeam: 'Miami Heat' },
  { gameId: 'nfl3', sport: 'NFL', home: 'Green Bay Packers', away: 'Chicago Bears', time: pastDate(7, 13, 0), venueIdx: 1, hostIdx: 2, title: 'Packers vs Bears - Classic Rivalry', notes: "Great turnout! Pack won 31-17!", attendeeCount: 15, supportedTeam: 'Green Bay Packers' },
  { gameId: 'nhl1', sport: 'NHL', home: 'Florida Panthers', away: 'Tampa Bay Lightning', time: pastDate(5, 19, 0), venueIdx: 10, hostIdx: 24, title: 'Battle of Florida! Panthers vs Bolts ⚡🏒', notes: "Incredible game! Panthers 4-3 in shootout!", attendeeCount: 24, supportedTeam: 'Florida Panthers' },
  { gameId: 'epl2', sport: 'Premier League', home: 'Arsenal', away: 'Chelsea', time: pastDate(2, 15, 0), venueIdx: 4, hostIdx: 15, title: 'London Derby Watch Party 🏴', notes: "Great atmosphere! Arsenal 2-1!", attendeeCount: 12, supportedTeam: 'Arsenal' },
  { gameId: 'ufc1', sport: 'UFC', home: 'UFC Fight Night', away: 'Prelims & Main Card', time: pastDate(10, 19, 0), venueIdx: 6, hostIdx: 44, title: 'UFC Fight Night Watch Party 🥊', notes: "Epic KO in the main event! What a night!", attendeeCount: 16, supportedTeam: 'UFC' },
];

const CHAT_TEMPLATES = {
  upcoming: [
    { offset: -3, msgs: [
      [0, "Party starts at {time}! Get there early for good seats! 🎉"],
      [1, "I'll be there! Can't wait!"],
      [2, "Anyone know if they have good wings?"],
      [0, "Best wings in town! You won't be disappointed"],
      [3, "Just RSVP'd! See you all there 🙌"],
      [4, "Is there parking nearby?"],
      [0, "Yeah plenty of parking behind the building"],
      [5, "LET'S GOOOOO!!! So hyped for this game!"],
    ]},
    { offset: -2, msgs: [
      [0, "Who's ready for game day?! 🔥"],
      [1, "Born ready!! This is gonna be awesome"],
      [2, "Can we get a headcount? How many are coming?"],
      [0, "We got {count} confirmed so far!"],
      [3, "just signed up! dragging my roommate too 😂"],
      [4, "What time should we get there?"],
      [0, "I'd say 30 min before game time to grab a spot"],
    ]},
    { offset: -1, msgs: [
      [0, "Alright fam, TOMORROW is the day!! 🎊"],
      [1, "Let's gooo! Wearing my jersey for sure"],
      [2, "can't wait to meet everyone!"],
      [3, "This is my first watch party, super excited"],
      [0, "You're gonna love it! We always have a blast"],
      [4, "See everyone tomorrow! 💪"],
    ]},
  ],
  past: [
    { offset: 0, msgs: [
      [0, "We're live!! Game is starting! 🎬"],
      [1, "Just got here, place is packed!"],
      [2, "WHAT A PLAY!!! 🔥🔥🔥"],
      [3, "This atmosphere is incredible"],
      [0, "GOOOAL!! / TOUCHDOWN!! 🚨🚨"],
      [4, "I can't believe that just happened!!"],
      [1, "Best watch party I've been to!"],
      [5, "We need to do this every week"],
      [2, "GG everyone! What a game!"],
      [0, "Thanks for coming everyone!! Same time next week? 🙏"],
      [3, "Absolutely! Following you for the next one"],
      [1, "10/10 would come again! Great group!"],
    ]},
  ],
};

const REVIEW_COMMENTS = [
  { atm: 5, food: 5, crowd: 5, text: "Best watch party ever! Amazing energy and great people. Will definitely be back!" },
  { atm: 4, food: 5, crowd: 4, text: "Food was incredible and the crowd was into it. Great host!" },
  { atm: 5, food: 4, crowd: 5, text: "The atmosphere was electric! Everyone was cheering and having a blast." },
  { atm: 4, food: 4, crowd: 4, text: "Really fun time. Good vibes, good food, good company." },
  { atm: 5, food: 3, crowd: 5, text: "The energy in the room was unreal! Felt like being at the actual game." },
  { atm: 4, food: 5, crowd: 3, text: "Amazing wings and beer selection. Solid watch party experience." },
  { atm: 3, food: 4, crowd: 4, text: "Nice spot, good people. Would come again for sure." },
  { atm: 5, food: 4, crowd: 5, text: "This is what watch parties should be! Host was awesome, crowd was lit 🔥" },
];

export async function seedDemoData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingCheck = await client.query("SELECT COUNT(*) FROM users WHERE email LIKE $1", [`%${SEED_EMAIL_DOMAIN}`]);
    if (parseInt(existingCheck.rows[0].count) > 0) {
      await clearDemoData();
    }

    const hash = await bcrypt.hash('DemoUser123!', 10);
    const userIds = [];

    for (let i = 0; i < SEED_USERS.length; i++) {
      const u = SEED_USERS[i];
      const email = `${u.name.toLowerCase().replace(/[^a-z]/g, '')}${SEED_EMAIL_DOMAIN}`;
      const joinedDaysAgo = Math.floor(Math.random() * 90) + 7;
      const joinDate = new Date(now.getTime() - joinedDaysAgo * day);
      const dob = new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));

      const result = await client.query(
        `INSERT INTO users (email, password_hash, name, gender, joined_at, country, date_of_birth, user_city, bio, profile_picture, user_type)
         VALUES ($1, $2, $3, $4, $5, 'US', $6, $7, $8, $9, 'fan')
         RETURNING id`,
        [email, hash, u.name, u.gender, joinDate.toISOString(), dob.toISOString().split('T')[0], u.city, u.bio, `https://i.pravatar.cc/150?img=${u.img}`]
      );
      const userId = result.rows[0].id;
      userIds.push(userId);

      const teamSportMap = {
        'Miami Heat': 'NBA', 'Boston Celtics': 'NBA', 'LA Lakers': 'NBA', 'Golden State Warriors': 'NBA',
        'Milwaukee Bucks': 'NBA', 'Philadelphia 76ers': 'NBA', 'Dallas Mavericks': 'NBA', 'New York Knicks': 'NBA',
        'Chicago Bulls': 'NBA', 'Toronto Raptors': 'NBA', 'Cleveland Cavaliers': 'NBA', 'Cincinnati Reds': 'NBA',
        'Miami Dolphins': 'NFL', 'Buffalo Bills': 'NFL', 'Green Bay Packers': 'NFL', 'New England Patriots': 'NFL',
        'Pittsburgh Steelers': 'NFL', 'Dallas Cowboys': 'NFL', 'Chicago Bears': 'NFL', 'New York Giants': 'NFL',
        'San Francisco 49ers': 'NFL', 'Denver Broncos': 'NFL', 'Philadelphia Eagles': 'NFL', 'Kansas City Chiefs': 'NFL',
        'Atlanta Falcons': 'NFL', 'Carolina Panthers': 'NFL', 'Seattle Seahawks': 'NFL', 'New York Jets': 'NFL',
        'Cincinnati Bengals': 'NFL', 'Cleveland Browns': 'NFL',
        'Florida Panthers': 'NHL', 'Pittsburgh Penguins': 'NHL', 'Boston Bruins': 'NHL', 'New York Rangers': 'NHL',
        'Colorado Avalanche': 'NHL', 'Tampa Bay Lightning': 'NHL', 'Toronto Maple Leafs': 'NHL',
        'New York Yankees': 'MLB', 'Boston Red Sox': 'MLB', 'LA Dodgers': 'MLB', 'Chicago Cubs': 'MLB',
        'Atlanta Braves': 'MLB', 'Kansas City Royals': 'MLB',
        'Inter Miami': 'MLS', 'Seattle Sounders': 'MLS', 'LA Galaxy': 'MLS',
        'Barcelona': 'La Liga', 'Real Madrid': 'La Liga', 'Atletico Madrid': 'La Liga',
        'Arsenal': 'Premier League', 'Manchester United': 'Premier League', 'Liverpool': 'Premier League',
        'Manchester City': 'Premier League',
        'Club América': 'Liga MX', 'Chivas Guadalajara': 'Liga MX',
        'Alabama Crimson Tide': 'College Football', 'Georgia Bulldogs': 'College Football', 'Ohio State Buckeyes': 'College Football',
        'Florida Gators': 'College Football', 'USC Trojans': 'College Football',
        'Duke Blue Devils': 'College Basketball', 'UConn Huskies': 'College Basketball',
        'USA': 'FIFA World Cup',
      };
      const usedSports = new Set();
      for (const team of u.teams) {
        const sport = teamSportMap[team] || 'Other';
        if (usedSports.has(sport)) continue;
        usedSports.add(sport);
        await client.query('INSERT INTO user_favorite_teams (user_id, sport, team) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [userId, sport, team]);
      }

      await client.query(
        `INSERT INTO user_points (user_id, total_points, lifetime_points, updated_at)
         VALUES ($1, $2, $2, NOW()) ON CONFLICT (user_id) DO NOTHING`,
        [userId, u.points]
      );
    }

    const venueIds = [];
    for (const v of SEED_VENUES) {
      const result = await client.query(
        `INSERT INTO venues (name, address, city, type, verified, featured, capacity, description)
         VALUES ($1, $2, $3, $4, true, $5, $6, $7)
         RETURNING id`,
        [v.name, `${v.address}, ${v.city}`, v.city, v.type, Math.random() > 0.5, v.capacity,
         `Great spot to watch games in ${v.city.split(',')[0]}! Multiple screens, cold drinks, and amazing food.`]
      );
      venueIds.push(result.rows[0].id);
    }

    const partyIds = [];
    for (let pi = 0; pi < SEED_PARTIES.length; pi++) {
      const p = SEED_PARTIES[pi];
      const venue = SEED_VENUES[p.venueIdx];
      const hostId = userIds[p.hostIdx];

      const result = await client.query(
        `INSERT INTO parties (game_id, sport, home_team, away_team, game_time, venue_name, venue_address, city, title, notes, max_size, host_id, created_at, supported_team)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id`,
        [p.gameId, p.sport, p.home, p.away, p.time, venue.name, `${venue.address}, ${venue.city}`, venue.city, p.title, p.notes,
         p.attendeeCount + 5, hostId,
         new Date(new Date(p.time).getTime() - (Math.floor(Math.random() * 5) + 2) * day).toISOString(),
         p.supportedTeam]
      );
      const partyId = result.rows[0].id;
      partyIds.push(partyId);

      await client.query('INSERT INTO party_attendees (party_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [partyId, hostId]);

      const attendeePool = userIds.filter(id => id !== hostId);
      const shuffled = attendeePool.sort(() => Math.random() - 0.5);
      const attendeeSlice = shuffled.slice(0, Math.min(p.attendeeCount - 1, shuffled.length));

      for (const uid of attendeeSlice) {
        await client.query('INSERT INTO party_attendees (party_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [partyId, uid]);
      }

      const isPast = new Date(p.time) < now;
      const templates = isPast ? CHAT_TEMPLATES.past : CHAT_TEMPLATES.upcoming;
      const template = templates[Math.floor(Math.random() * templates.length)];
      const allAttendees = [hostId, ...attendeeSlice];

      for (const msg of template.msgs) {
        const senderIdx = msg[0] % allAttendees.length;
        const senderId = allAttendees[senderIdx];
        let text = msg[1]
          .replace('{time}', new Date(p.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
          .replace('{count}', String(p.attendeeCount));

        const msgTime = isPast
          ? new Date(new Date(p.time).getTime() + msg[0] * 5 * 60000)
          : new Date(now.getTime() - (template.offset + 1) * day + msg[0] * 15 * 60000);

        await client.query(
          'INSERT INTO party_messages (party_id, user_id, message, created_at) VALUES ($1, $2, $3, $4)',
          [partyId, senderId, text, msgTime.toISOString()]
        );
      }

      if (isPast) {
        const reviewers = attendeeSlice.slice(0, Math.min(3 + Math.floor(Math.random() * 4), attendeeSlice.length));
        for (const uid of reviewers) {
          const review = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];
          const overall = Math.round((review.atm + review.food + review.crowd) / 3);
          await client.query(
            `INSERT INTO party_reviews (party_id, user_id, atmosphere, food, crowd_energy, overall, comment, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
            [partyId, uid, review.atm, review.food, review.crowd, overall, review.text,
             new Date(new Date(p.time).getTime() + (1 + Math.random() * 24) * 3600000).toISOString()]
          );
        }

        const venueName = SEED_VENUES[p.venueIdx].name;
        for (const uid of attendeeSlice.slice(0, Math.min(5, attendeeSlice.length))) {
          await client.query(
            `INSERT INTO venue_checkins (user_id, party_id, venue_name, qr_verified, created_at)
             VALUES ($1, $2, $3, true, $4) ON CONFLICT DO NOTHING`,
            [uid, partyId, venueName, new Date(p.time).toISOString()]
          );
        }
      }
    }

    await client.query('COMMIT');
    return { users: userIds.length, venues: venueIds.length, parties: partyIds.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function clearDemoData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const seedUsers = await client.query("SELECT id FROM users WHERE email LIKE $1", [`%${SEED_EMAIL_DOMAIN}`]);
    const seedUserIds = seedUsers.rows.map(r => r.id);

    if (seedUserIds.length > 0) {
      const seedParties = await client.query("SELECT id FROM parties WHERE host_id = ANY($1)", [seedUserIds]);
      const seedPartyIds = seedParties.rows.map(r => r.id);

      if (seedPartyIds.length > 0) {
        await client.query("DELETE FROM party_messages WHERE party_id = ANY($1)", [seedPartyIds]);
        await client.query("DELETE FROM party_attendees WHERE party_id = ANY($1)", [seedPartyIds]);
        await client.query("DELETE FROM party_reviews WHERE party_id = ANY($1)", [seedPartyIds]);
        await client.query("DELETE FROM party_photos WHERE party_id = ANY($1)", [seedPartyIds]);
        await client.query("DELETE FROM party_invitations WHERE party_id = ANY($1)", [seedPartyIds]);
        await client.query("DELETE FROM venue_checkins WHERE party_id = ANY($1)", [seedPartyIds]);
        await client.query("DELETE FROM party_highlights WHERE party_id = ANY($1)", [seedPartyIds]);
        await client.query("DELETE FROM parties WHERE id = ANY($1)", [seedPartyIds]);
      }

      await client.query("DELETE FROM user_favorite_teams WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM user_points WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM points_history WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM friendships WHERE user_id = ANY($1) OR friend_id = ANY($1)", [seedUserIds, seedUserIds]);
      await client.query("DELETE FROM venue_checkins WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM users WHERE id = ANY($1)", [seedUserIds]);
    }

    await client.query("DELETE FROM venues WHERE claimed_by IS NULL AND description LIKE '%Great spot to watch games%'");

    await client.query('COMMIT');
    return { cleared: seedUserIds.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getSeedStats() {
  const users = await pool.query("SELECT COUNT(*) FROM users WHERE email LIKE $1", [`%${SEED_EMAIL_DOMAIN}`]);
  const parties = await pool.query("SELECT COUNT(*) FROM parties WHERE host_id IN (SELECT id FROM users WHERE email LIKE $1)", [`%${SEED_EMAIL_DOMAIN}`]);
  return { seedUsers: parseInt(users.rows[0].count), seedParties: parseInt(parties.rows[0].count) };
}

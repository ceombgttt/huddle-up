import pool from './db.js';
import bcrypt from 'bcryptjs';

const SEED_EMAIL_DOMAIN = '@huddleup-seed.demo';

const SEED_USERS = [
  { name: 'Mike R.', gender: 'male', bio: 'Heat fan since \'06. Never miss a game! 🏀', city: 'Boca Raton, FL', teams: ['Miami Heat', 'Miami Dolphins'], points: 870, img: 1, badge: 'founder', founderNum: 3 },
  { name: 'Sarah T.', gender: 'female', bio: 'Panthers season ticket holder. Let\'s go! 🏒', city: 'Fort Lauderdale, FL', teams: ['Florida Panthers', 'Inter Miami'], points: 720, img: 5, badge: 'founder', founderNum: 7 },
  { name: 'Alex M.', gender: 'male', bio: 'College hoops junkie. Go Gators! 🐊', city: 'Boca Raton, FL', teams: ['Florida Gators', 'Miami Heat'], points: 950, img: 3, badge: 'hotstreak', founderNum: 12 },
  { name: 'Jessica L.', gender: 'female', bio: 'Dolphins til I die 🐬 Sunday fundays!', city: 'Delray Beach, FL', teams: ['Miami Dolphins', 'Miami Heat'], points: 680, img: 9, badge: 'founder', founderNum: 15 },
  { name: 'David K.', gender: 'male', bio: 'Basketball junkie 🏀 Heat culture!', city: 'Fort Lauderdale, FL', teams: ['Miami Heat', 'LA Dodgers'], points: 540, img: 7, badge: null, founderNum: null },
  { name: 'Emma W.', gender: 'female', bio: 'Soccer & brunch vibes ⚽ Inter Miami!', city: 'Boca Raton, FL', teams: ['Inter Miami', 'Barcelona'], points: 430, img: 10, badge: null, founderNum: null },
  { name: 'Chris P.', gender: 'male', bio: 'Patriots fan in enemy territory 🏈', city: 'Boynton Beach, FL', teams: ['New England Patriots', 'Boston Celtics', 'Boston Red Sox'], points: 810, img: 11, badge: 'hotstreak', founderNum: 22 },
  { name: 'Lisa A.', gender: 'female', bio: 'Love game day energy! All sports 🎉', city: 'Fort Lauderdale, FL', teams: ['Miami Dolphins', 'Miami Heat'], points: 350, img: 16, badge: null, founderNum: null },
  { name: 'Ryan O.', gender: 'male', bio: 'Steelers nation! Terrible towel everywhere 🟡⚫', city: 'Boca Raton, FL', teams: ['Pittsburgh Steelers', 'Pittsburgh Penguins'], points: 620, img: 12, badge: 'founder', founderNum: 28 },
  { name: 'Rachel G.', gender: 'female', bio: 'Cowboys fan livin large in FL ⭐', city: 'Delray Beach, FL', teams: ['Dallas Cowboys', 'Dallas Mavericks'], points: 290, img: 20, badge: null, founderNum: null },
  { name: 'Kevin N.', gender: 'male', bio: 'UFC & boxing - combat sports all day 🥊', city: 'Fort Lauderdale, FL', teams: ['UFC', 'Miami Heat'], points: 480, img: 13, badge: null, founderNum: null },
  { name: 'Amanda L.', gender: 'female', bio: 'Baseball season is the best season ⚾', city: 'Boca Raton, FL', teams: ['New York Yankees', 'Miami Dolphins'], points: 180, img: 23, badge: null, founderNum: null },
  { name: 'Brandon R.', gender: 'male', bio: 'Chicago expat. Bears, Cubs, Bulls forever 🐻', city: 'Boynton Beach, FL', teams: ['Chicago Bears', 'Chicago Cubs', 'Chicago Bulls'], points: 560, img: 14, badge: null, founderNum: null },
  { name: 'Nicole R.', gender: 'female', bio: 'F1 and soccer 🏎️⚽ Vamos!', city: 'Boca Raton, FL', teams: ['Inter Miami', 'Real Madrid'], points: 340, img: 25, badge: null, founderNum: null },
  { name: 'Matt J.', gender: 'male', bio: 'Giants fan. NY forever 🗽', city: 'Boca Raton, FL', teams: ['New York Giants', 'New York Knicks', 'New York Yankees'], points: 410, img: 15, badge: null, founderNum: null },
  { name: 'Jen P.', gender: 'female', bio: 'Tennis & Premier League mornings ☕🎾', city: 'Fort Lauderdale, FL', teams: ['Arsenal', 'Inter Miami'], points: 270, img: 26, badge: null, founderNum: null },
  { name: 'Brian G.', gender: 'male', bio: 'Lakers fan in South FL 💜💛', city: 'Delray Beach, FL', teams: ['LA Lakers', 'LA Dodgers'], points: 730, img: 17, badge: 'hotstreak', founderNum: null },
  { name: 'Megan S.', gender: 'female', bio: 'Just moved to Boca, looking for watch party crews!', city: 'Boca Raton, FL', teams: ['Miami Heat', 'Florida Panthers'], points: 120, img: 28, badge: null, founderNum: null },
  { name: 'Carlos R.', gender: 'male', bio: 'Chivas fan! Liga MX 🇲🇽⚽', city: 'Fort Lauderdale, FL', teams: ['Chivas Guadalajara', 'Club América'], points: 390, img: 18, badge: null, founderNum: null },
  { name: 'Lauren M.', gender: 'female', bio: 'March Madness is my Super Bowl 🏀', city: 'Boynton Beach, FL', teams: ['Duke Blue Devils', 'Carolina Panthers'], points: 250, img: 32, badge: null, founderNum: null },
  { name: 'Jason B.', gender: 'male', bio: 'Celtics green runs deep ☘️', city: 'Boca Raton, FL', teams: ['Boston Celtics', 'New England Patriots', 'Boston Red Sox'], points: 580, img: 51, badge: 'founder', founderNum: 35 },
  { name: 'Stephanie W.', gender: 'female', bio: 'World Cup 2026 LFG!! 🇺🇸⚽', city: 'Delray Beach, FL', teams: ['USA', 'Inter Miami'], points: 160, img: 31, badge: null, founderNum: null },
  { name: 'Daniel C.', gender: 'male', bio: '49ers faithful all day 🔴⚪', city: 'Fort Lauderdale, FL', teams: ['San Francisco 49ers', 'Golden State Warriors'], points: 450, img: 52, badge: null, founderNum: null },
  { name: 'Victoria H.', gender: 'female', bio: 'Avs fan missing the mountains 🏔️🏒', city: 'Boca Raton, FL', teams: ['Colorado Avalanche', 'Denver Broncos'], points: 380, img: 36, badge: null, founderNum: null },
  { name: 'Marcus B.', gender: 'male', bio: 'Dolphins + Panthers = perfect FL sports life 🐬', city: 'Fort Lauderdale, FL', teams: ['Miami Dolphins', 'Florida Panthers'], points: 660, img: 53, badge: 'founder', founderNum: 41 },
  { name: 'Tiffany R.', gender: 'female', bio: 'Yankees & chill 💙🤍', city: 'Boynton Beach, FL', teams: ['New York Yankees', 'New York Knicks'], points: 140, img: 39, badge: null, founderNum: null },
  { name: 'Patrick S.', gender: 'male', bio: 'Eagles fly! Philly in paradise 🦅', city: 'Boca Raton, FL', teams: ['Philadelphia Eagles', 'Philadelphia 76ers'], points: 520, img: 54, badge: null, founderNum: null },
  { name: 'Kayla D.', gender: 'female', bio: 'Premier League Saturdays are sacred 🏴', city: 'Delray Beach, FL', teams: ['Manchester United', 'Miami Heat'], points: 310, img: 41, badge: null, founderNum: null },
  { name: 'Tyler H.', gender: 'male', bio: 'Roll Tide! 🐘 Bama football is life', city: 'Fort Lauderdale, FL', teams: ['Alabama Crimson Tide', 'Atlanta Falcons'], points: 440, img: 55, badge: null, founderNum: null },
  { name: 'Sam C.', gender: 'female', bio: 'Hockey girl living her best FL life 🏒🌞', city: 'Boca Raton, FL', teams: ['Florida Panthers', 'Tampa Bay Lightning'], points: 490, img: 43, badge: null, founderNum: null },
  { name: 'Derek M.', gender: 'male', bio: 'Browns fan. Yeah I know 🤷‍♂️😂', city: 'Boynton Beach, FL', teams: ['Cleveland Browns', 'Cleveland Cavaliers'], points: 200, img: 56, badge: null, founderNum: null },
  { name: 'Hannah Y.', gender: 'female', bio: 'Golden State all day! Splash zone 💦', city: 'Delray Beach, FL', teams: ['Golden State Warriors', 'San Francisco 49ers'], points: 360, img: 44, badge: null, founderNum: null },
  { name: 'Carlos M.', gender: 'male', bio: 'Club América y boxeo 🥊💛💙', city: 'Fort Lauderdale, FL', teams: ['Club América', 'Inter Miami'], points: 170, img: 57, badge: null, founderNum: null },
  { name: 'Brittany C.', gender: 'female', bio: 'Seahawks fan in sunshine state 💚💙', city: 'Boca Raton, FL', teams: ['Seattle Seahawks', 'Seattle Sounders'], points: 230, img: 45, badge: null, founderNum: null },
  { name: 'Jordan P.', gender: 'male', bio: 'Maple Leafs + Raptors 🍁🇨🇦', city: 'Fort Lauderdale, FL', teams: ['Toronto Maple Leafs', 'Toronto Raptors'], points: 510, img: 58, badge: null, founderNum: null },
  { name: 'Natalie W.', gender: 'female', bio: 'Heat culture baby! Let\'s go! 🔥🔥', city: 'Delray Beach, FL', teams: ['Miami Heat', 'Inter Miami'], points: 780, img: 47, badge: 'founder', founderNum: 48 },
  { name: 'Will T.', gender: 'male', bio: 'Tailgate king 👑 Any sport, any time', city: 'Boca Raton, FL', teams: ['Miami Dolphins', 'Florida Gators'], points: 920, img: 59, badge: 'hotstreak', founderNum: 52 },
  { name: 'Olivia T.', gender: 'female', bio: 'Liverpool YNWA ❤️ Early mornings worth it', city: 'Boynton Beach, FL', teams: ['Liverpool', 'Inter Miami'], points: 280, img: 48, badge: null, founderNum: null },
  { name: 'Sean K.', gender: 'male', bio: 'Bruins & Pats. New England forever 🐻', city: 'Fort Lauderdale, FL', teams: ['Boston Bruins', 'New England Patriots'], points: 600, img: 60, badge: 'founder', founderNum: 55 },
  { name: 'Christina F.', gender: 'female', bio: 'Watch party queen 👸 Been to 30+ parties!', city: 'Delray Beach, FL', teams: ['Miami Heat', 'Miami Dolphins', 'Florida Panthers'], points: 990, img: 49, badge: 'hotstreak', founderNum: 58 },
  { name: 'Ethan W.', gender: 'male', bio: 'Bengals Who Dey! 🐯', city: 'Boca Raton, FL', teams: ['Cincinnati Bengals', 'Cincinnati Reds'], points: 330, img: 61, badge: null, founderNum: null },
  { name: 'Alyssa J.', gender: 'female', bio: 'Chiefs Kingdom even in FL ❤️💛', city: 'Fort Lauderdale, FL', teams: ['Kansas City Chiefs', 'Kansas City Royals'], points: 460, img: 21, badge: null, founderNum: null },
  { name: 'Nick S.', gender: 'male', bio: 'Rangers & Jets 🏒🏈 NY sports pain', city: 'Boca Raton, FL', teams: ['New York Rangers', 'New York Jets'], points: 370, img: 62, badge: null, founderNum: null },
  { name: 'Kaitlyn B.', gender: 'female', bio: 'Ohio State alum! O-H! 🌰', city: 'Boynton Beach, FL', teams: ['Ohio State Buckeyes', 'Cleveland Browns'], points: 190, img: 22, badge: null, founderNum: null },
  { name: 'Trevor G.', gender: 'male', bio: 'MMA & football Sundays 🏈🥊', city: 'Delray Beach, FL', teams: ['Miami Dolphins', 'UFC'], points: 420, img: 63, badge: null, founderNum: null },
  { name: 'Vanessa R.', gender: 'female', bio: 'Bucks in 6! 🦌 Milwaukee represent', city: 'Fort Lauderdale, FL', teams: ['Milwaukee Bucks', 'Green Bay Packers'], points: 210, img: 24, badge: null, founderNum: null },
  { name: 'Cody M.', gender: 'male', bio: 'F1 & soccer Sunday funday 🏎️', city: 'Boca Raton, FL', teams: ['Manchester City', 'Inter Miami'], points: 380, img: 64, badge: null, founderNum: null },
  { name: 'Dana P.', gender: 'female', bio: 'Mexicana and proud! Liga MX ⚽🇲🇽', city: 'Delray Beach, FL', teams: ['Club América', 'Chivas Guadalajara', 'Inter Miami'], points: 150, img: 27, badge: null, founderNum: null },
  { name: 'Tyler B.', gender: 'male', bio: 'Dawgs on top! Go Georgia 🐶🏈', city: 'Fort Lauderdale, FL', teams: ['Georgia Bulldogs', 'Atlanta Braves'], points: 570, img: 65, badge: null, founderNum: null },
  { name: 'Monica V.', gender: 'female', bio: 'Panthers + Heat = my whole personality 🏒🏀', city: 'Boca Raton, FL', teams: ['Florida Panthers', 'Miami Heat'], points: 640, img: 29, badge: 'founder', founderNum: 62 },
  { name: 'Jake F.', gender: 'male', bio: 'Just here for the wings and the game 🍗', city: 'Boynton Beach, FL', teams: ['Miami Heat', 'Miami Dolphins'], points: 90, img: 33, badge: null, founderNum: null },
  { name: 'Amber H.', gender: 'female', bio: 'Packers fan. Cheese head in FL 💚💛', city: 'Delray Beach, FL', teams: ['Green Bay Packers', 'Milwaukee Bucks'], points: 310, img: 34, badge: null, founderNum: null },
  { name: 'Tony D.', gender: 'male', bio: 'Soccer is life. GOLAZO! ⚽🔥', city: 'Fort Lauderdale, FL', teams: ['Inter Miami', 'Real Madrid'], points: 250, img: 35, badge: null, founderNum: null },
  { name: 'Priya K.', gender: 'female', bio: 'Celtics fan checking in from Boca ☘️', city: 'Boca Raton, FL', teams: ['Boston Celtics', 'New England Patriots'], points: 400, img: 37, badge: null, founderNum: null },
  { name: 'Omar S.', gender: 'male', bio: 'Texans fan. Houston pride in SoFla 🤘', city: 'Fort Lauderdale, FL', teams: ['Houston Texans', 'Houston Astros'], points: 130, img: 38, badge: null, founderNum: null },
  { name: 'Heather N.', gender: 'female', bio: 'Wine + football = perfect Sunday 🍷🏈', city: 'Delray Beach, FL', teams: ['Miami Dolphins', 'Florida Panthers'], points: 220, img: 40, badge: null, founderNum: null },
  { name: 'Ricky L.', gender: 'male', bio: 'Ravens flock! Baltimore born 💜🖤', city: 'Boca Raton, FL', teams: ['Baltimore Ravens', 'Baltimore Orioles'], points: 470, img: 42, badge: null, founderNum: null },
  { name: 'Sophia E.', gender: 'female', bio: 'First watch party was last week - I\'m hooked!', city: 'Boynton Beach, FL', teams: ['Miami Heat', 'Inter Miami'], points: 35, img: 46, badge: null, founderNum: null },
  { name: 'Andre J.', gender: 'male', bio: 'Sixers trust the process 🔔', city: 'Fort Lauderdale, FL', teams: ['Philadelphia 76ers', 'Philadelphia Eagles'], points: 530, img: 50, badge: null, founderNum: null },
  { name: 'Gabby M.', gender: 'female', bio: 'Marlins fan? Anyone? Just me? 😂⚾', city: 'Boca Raton, FL', teams: ['Miami Marlins', 'Miami Heat'], points: 180, img: 30, badge: null, founderNum: null },
  { name: 'Dante W.', gender: 'male', bio: 'New to the area. Where do I watch games? 🤔', city: 'Delray Beach, FL', teams: ['LA Lakers', 'LA Chargers'], points: 25, img: 66, badge: null, founderNum: null },
  { name: 'Riley C.', gender: 'female', bio: 'Fantasy football champ 3 years running 🏆', city: 'Boca Raton, FL', teams: ['Kansas City Chiefs', 'Miami Heat'], points: 500, img: 67, badge: null, founderNum: null },
  { name: 'Marco T.', gender: 'male', bio: 'Inter Miami desde el día uno 💗🖤', city: 'Fort Lauderdale, FL', teams: ['Inter Miami', 'Barcelona'], points: 340, img: 68, badge: null, founderNum: null },
  { name: 'Zoe R.', gender: 'female', bio: 'Hockey > everything. Fight me. 🏒', city: 'Boynton Beach, FL', teams: ['Florida Panthers', 'Tampa Bay Lightning'], points: 410, img: 69, badge: null, founderNum: null },
  { name: 'Leo V.', gender: 'male', bio: 'Nuggets fan in paradise 🏀🏔️', city: 'Delray Beach, FL', teams: ['Denver Nuggets', 'Denver Broncos'], points: 260, img: 70, badge: null, founderNum: null },
  { name: 'Jasmine A.', gender: 'female', bio: 'Game day nachos are my love language 🧀', city: 'Boca Raton, FL', teams: ['Miami Heat', 'Miami Dolphins'], points: 100, img: 2, badge: null, founderNum: null },
  { name: 'Ian P.', gender: 'male', bio: 'Bucs fan. Brady era was peak 🏈', city: 'Fort Lauderdale, FL', teams: ['Tampa Bay Buccaneers', 'Tampa Bay Lightning'], points: 320, img: 4, badge: null, founderNum: null },
  { name: 'Maya S.', gender: 'female', bio: 'Just here for the vibes ✨🍻', city: 'Delray Beach, FL', teams: ['Inter Miami', 'Miami Heat'], points: 60, img: 6, badge: null, founderNum: null },
  { name: 'Greg T.', gender: 'male', bio: 'Gators born and raised. Go Gata! 🐊', city: 'Boca Raton, FL', teams: ['Florida Gators', 'Jacksonville Jaguars'], points: 440, img: 8, badge: null, founderNum: null },
  { name: 'Lena K.', gender: 'female', bio: 'Arsenal through and through. COYG! 🔴⚪', city: 'Fort Lauderdale, FL', teams: ['Arsenal', 'Inter Miami'], points: 350, img: 19, badge: null, founderNum: null },
  { name: 'Pete R.', gender: 'male', bio: 'Moved from Boston. Miss Fenway. Love FL 🌴', city: 'Boynton Beach, FL', teams: ['Boston Red Sox', 'New England Patriots'], points: 280, img: 33, badge: null, founderNum: null },
  { name: 'Camila G.', gender: 'female', bio: 'Barca fan 💙❤️ Visca el Barça!', city: 'Boca Raton, FL', teams: ['Barcelona', 'Inter Miami'], points: 195, img: 43, badge: null, founderNum: null },
  { name: 'Danny F.', gender: 'male', bio: 'Nets fan stuck in Heat country 🤣', city: 'Delray Beach, FL', teams: ['Brooklyn Nets', 'New York Giants'], points: 75, img: 52, badge: null, founderNum: null },
  { name: 'Taylor M.', gender: 'female', bio: 'Soccer mom who actually loves soccer ⚽🤣', city: 'Boca Raton, FL', teams: ['Inter Miami', 'USA'], points: 145, img: 48, badge: null, founderNum: null },
  { name: 'Nolan J.', gender: 'male', bio: 'Chargers bolt up! ⚡ SoFla transplant', city: 'Fort Lauderdale, FL', teams: ['LA Chargers', 'LA Lakers'], points: 85, img: 58, badge: null, founderNum: null },
  { name: 'Bianca L.', gender: 'female', bio: 'Spurs fan from San Antonio 🤍🖤', city: 'Delray Beach, FL', teams: ['San Antonio Spurs', 'Dallas Cowboys'], points: 110, img: 31, badge: null, founderNum: null },
  { name: 'Wes H.', gender: 'male', bio: 'Jags fan. Duval til I die! 🏈', city: 'Boca Raton, FL', teams: ['Jacksonville Jaguars', 'Florida Gators'], points: 155, img: 53, badge: null, founderNum: null },
];

const SEED_VENUES = [
  { name: "BRU's Room Sports Grill", address: '6065 SW 18th St', city: 'Boca Raton, FL', type: 'Sports Bar', capacity: 200, desc: 'Massive sports bar with 100+ TVs. Best place to watch any game in Boca!', featured: true, featuredTier: 'featured' },
  { name: 'Barrel of Monks', address: '1141 S Rogers Cir', city: 'Boca Raton, FL', type: 'Brewery', capacity: 80, desc: 'Craft beer bar with great atmosphere. 50+ beers on tap.', featured: true, featuredTier: 'standard' },
  { name: "Rocco's Tacos", address: '32 SE 3rd Ave', city: 'Delray Beach, FL', type: 'Restaurant & Bar', capacity: 150, desc: 'Lively Mexican restaurant with multiple TVs and incredible margaritas.', featured: true, featuredTier: 'standard' },
  { name: "Flanigan's Seafood Bar", address: '2505 N Federal Hwy', city: 'Boca Raton, FL', type: 'Sports Bar', capacity: 130, desc: 'Local favorite. Ribs, wings, and sports!', featured: false, featuredTier: null },
  { name: 'Two Georges Waterfront Grille', address: '728 Casa Loma Blvd', city: 'Boynton Beach, FL', type: 'Restaurant & Bar', capacity: 140, desc: 'Waterfront dining with amazing sunset views and big screens.', featured: true, featuredTier: 'featured' },
  { name: 'Deck 84', address: '840 E Atlantic Ave', city: 'Delray Beach, FL', type: 'Restaurant & Bar', capacity: 120, desc: 'Waterfront restaurant perfect for game day.', featured: true, featuredTier: 'standard' },
  { name: "Miller's Ale House", address: '911 Yamato Rd', city: 'Boca Raton, FL', type: 'Sports Bar', capacity: 160, desc: 'Sports bar chain with great wings and beer selection.', featured: false, featuredTier: null },
  { name: "Duffy's Sports Grill", address: '1750 N Congress Ave', city: 'Boynton Beach, FL', type: 'Sports Bar', capacity: 140, desc: 'Local sports bar with TVs everywhere.', featured: false, featuredTier: null },
  { name: 'Tap 42', address: '5050 Town Center Circle', city: 'Boca Raton, FL', type: 'Gastropub', capacity: 130, desc: 'Craft cocktails and cold brews. Perfect for watch parties.', featured: false, featuredTier: null },
  { name: "Boston's on the Beach", address: '40 S Ocean Blvd', city: 'Delray Beach, FL', type: 'Restaurant & Bar', capacity: 110, desc: 'Beachfront sports bar. Cold beer, ocean views, and sports.', featured: true, featuredTier: 'standard' },
  { name: 'Batch Gastropub', address: '1400 E Las Olas Blvd', city: 'Fort Lauderdale, FL', type: 'Gastropub', capacity: 100, desc: 'Upscale pub with multiple screens and craft cocktails.', featured: false, featuredTier: null },
  { name: 'Bokampers Sports Bar', address: '3115 NE 32nd Ave', city: 'Fort Lauderdale, FL', type: 'Sports Bar', capacity: 180, desc: 'Ultimate sports bar experience. Huge screens and great food.', featured: true, featuredTier: 'featured' },
  { name: 'American Social', address: '721 E Las Olas Blvd', city: 'Fort Lauderdale, FL', type: 'Restaurant & Bar', capacity: 160, desc: 'Trendy bar with waterfront views and tons of TVs.', featured: false, featuredTier: null },
  { name: 'Dubliner Irish Pub', address: '435 Plaza Real', city: 'Boca Raton, FL', type: 'Pub', capacity: 90, desc: 'Cozy Irish pub. Perfect for Premier League mornings.', featured: false, featuredTier: null },
  { name: 'Old Heidelberg', address: '1450 E Hillsboro Blvd', city: 'Deerfield Beach, FL', type: 'Restaurant & Bar', capacity: 100, desc: 'German restaurant with great beer and a fun game day crowd.', featured: false, featuredTier: null },
  { name: 'Park Tavern', address: '282 S Federal Hwy', city: 'Boca Raton, FL', type: 'Restaurant & Bar', capacity: 120, desc: 'Chill spot with big TVs, solid food, and cold drinks.', featured: false, featuredTier: null },
  { name: 'Galway Bay Irish Pub', address: '4520 PGA Blvd', city: 'Palm Beach Gardens, FL', type: 'Pub', capacity: 85, desc: 'Authentic Irish pub. Soccer mornings and pints.', featured: false, featuredTier: null },
];

const now = new Date();
const day = 24*60*60*1000;
const hour = 60*60*1000;

function futureDate(daysFromNow, h, min=0) {
  const d = new Date(now.getTime() + daysFromNow * day);
  d.setHours(h, min, 0, 0);
  return d.toISOString();
}

function pastDate(daysAgo, h, min=0) {
  const d = new Date(now.getTime() - daysAgo * day);
  d.setHours(h, min, 0, 0);
  return d.toISOString();
}

const SEED_PARTIES = [
  { gameId: 'nba1', sport: 'NBA', home: 'Miami Heat', away: 'Boston Celtics', time: futureDate(1, 19, 30), venueIdx: 0, hostIdx: 0, title: 'Heat game tonight! 🔥', notes: "Grabbing a table in the back. Wings and beer. Let's go! 🏀🔥", attendeeCount: 23, supportedTeam: 'Miami Heat' },
  { gameId: 'nba1', sport: 'NBA', home: 'Miami Heat', away: 'Boston Celtics', time: futureDate(1, 19, 30), venueIdx: 8, hostIdx: 20, title: 'Celtics Watch Party ☘️', notes: "Boston fans in Boca! Let's get this W!", attendeeCount: 13, supportedTeam: 'Boston Celtics' },
  { gameId: 'nhl1', sport: 'NHL', home: 'Florida Panthers', away: 'Toronto Maple Leafs', time: futureDate(2, 19, 0), venueIdx: 11, hostIdx: 1, title: 'Panthers Watch Party! 🏒', notes: "Let's go Cats! Getting there early. Who's in? 🏒", attendeeCount: 18, supportedTeam: 'Florida Panthers' },
  { gameId: 'nba2', sport: 'NBA', home: 'Miami Heat', away: 'LA Lakers', time: futureDate(3, 20, 0), venueIdx: 1, hostIdx: 2, title: 'Heat vs Lakers! 🔥💜', notes: "Big matchup! Barrel of Monks has great beer for this one.", attendeeCount: 15, supportedTeam: 'Miami Heat' },
  { gameId: 'nba2', sport: 'NBA', home: 'Miami Heat', away: 'LA Lakers', time: futureDate(3, 20, 0), venueIdx: 12, hostIdx: 16, title: 'Lakers Watch Party 💜💛', notes: "LA fans in Fort Lauderdale! Late night hoops!", attendeeCount: 8, supportedTeam: 'LA Lakers' },
  { gameId: 'nfl1', sport: 'NFL', home: 'Miami Dolphins', away: 'Buffalo Bills', time: futureDate(4, 13, 0), venueIdx: 0, hostIdx: 3, title: 'Fins Up! Dolphins Game Day 🐬', notes: "Dolphins prime time! This place gets packed so arrive early. See you there! 🏈", attendeeCount: 28, supportedTeam: 'Miami Dolphins' },
  { gameId: 'nfl1', sport: 'NFL', home: 'Miami Dolphins', away: 'Buffalo Bills', time: futureDate(4, 13, 0), venueIdx: 7, hostIdx: 41, title: 'Bills Mafia SoFla! 🦬', notes: "Go Bills! Folding table not included 😂", attendeeCount: 12, supportedTeam: 'Buffalo Bills' },
  { gameId: 'nhl2', sport: 'NHL', home: 'Florida Panthers', away: 'New York Rangers', time: futureDate(3, 19, 0), venueIdx: 3, hostIdx: 29, title: 'Cats vs Rangers hockey night 🏒', notes: "Hockey night at Flanigan's! Great ribs and cold beer.", attendeeCount: 10, supportedTeam: 'Florida Panthers' },
  { gameId: 'epl1', sport: 'Premier League', home: 'Manchester United', away: 'Liverpool', time: futureDate(5, 12, 30), venueIdx: 13, hostIdx: 27, title: 'Man United vs Liverpool! 🏴', notes: "Early morning pints and football! GGMU!", attendeeCount: 14, supportedTeam: 'Manchester United' },
  { gameId: 'epl1', sport: 'Premier League', home: 'Manchester United', away: 'Liverpool', time: futureDate(5, 12, 30), venueIdx: 16, hostIdx: 37, title: 'YNWA Liverpool Watch Party ❤️', notes: "You'll never walk alone! Liverpool supporters welcome!", attendeeCount: 9, supportedTeam: 'Liverpool' },
  { gameId: 'nba3', sport: 'NBA', home: 'Denver Nuggets', away: 'Miami Heat', time: futureDate(6, 21, 0), venueIdx: 2, hostIdx: 35, title: 'Heat Nation at Rocco\'s! 🔥🍹', notes: "Friday night Heat! Margaritas and hoops. See you there!", attendeeCount: 16, supportedTeam: 'Miami Heat' },
  { gameId: 'nfl2', sport: 'NFL', home: 'Kansas City Chiefs', away: 'Miami Dolphins', time: futureDate(5, 16, 25), venueIdx: 6, hostIdx: 61, title: 'Chiefs vs Dolphins watch 🏈', notes: "Big game! Getting the crew together at Miller's.", attendeeCount: 11, supportedTeam: 'Miami Dolphins' },
  { gameId: 'mls1', sport: 'MLS', home: 'Inter Miami', away: 'Atlanta United', time: futureDate(7, 19, 30), venueIdx: 12, hostIdx: 62, title: 'Inter Miami Watch Party ⚽💗', notes: "Messi magic! Let's support our local team!", attendeeCount: 22, supportedTeam: 'Inter Miami' },
  { gameId: 'mx1', sport: 'Liga MX', home: 'Club América', away: 'Chivas Guadalajara', time: futureDate(4, 20, 0), venueIdx: 2, hostIdx: 18, title: 'El Clásico Nacional! 🇲🇽', notes: "The biggest rivalry in Mexican football! Vamos América!", attendeeCount: 17, supportedTeam: 'Club América' },
  { gameId: 'lla1', sport: 'La Liga', home: 'Real Madrid', away: 'Barcelona', time: futureDate(6, 16, 0), venueIdx: 13, hostIdx: 13, title: 'El Clásico Watch Party ⚽', notes: "The biggest match in world football! Hala Madrid!", attendeeCount: 20, supportedTeam: 'Real Madrid' },
  { gameId: 'nfl3', sport: 'NFL', home: 'San Francisco 49ers', away: 'Dallas Cowboys', time: futureDate(5, 20, 15), venueIdx: 0, hostIdx: 22, title: 'Niners Watch Party! 🔴⚪', notes: "49ers fans in South FL represent!", attendeeCount: 9, supportedTeam: 'San Francisco 49ers' },
  { gameId: 'nfl3', sport: 'NFL', home: 'San Francisco 49ers', away: 'Dallas Cowboys', time: futureDate(5, 20, 15), venueIdx: 8, hostIdx: 9, title: 'Cowboys Nation Boca ⭐', notes: "America's Team! Lets go Boys!", attendeeCount: 14, supportedTeam: 'Dallas Cowboys' },
  { gameId: 'cbb1', sport: 'College Basketball', home: 'Duke Blue Devils', away: 'North Carolina Tar Heels', time: futureDate(8, 21, 0), venueIdx: 3, hostIdx: 19, title: 'Duke vs UNC - The Rivalry! 🏀', notes: "March Madness vibes! Who you got?", attendeeCount: 15, supportedTeam: 'Duke Blue Devils' },
  { gameId: 'ufc1', sport: 'UFC', home: 'UFC 314', away: 'Main Card', time: futureDate(9, 22, 0), venueIdx: 10, hostIdx: 10, title: 'UFC 314 Watch Party! 🥊', notes: "Main card starts at 10! Let's watch some fights!", attendeeCount: 19, supportedTeam: 'UFC' },
  { gameId: 'nba4', sport: 'NBA', home: 'Milwaukee Bucks', away: 'Philadelphia 76ers', time: futureDate(4, 19, 0), venueIdx: 1, hostIdx: 45, title: 'Bucks Watch Party 🦌', notes: "Bucks in 6! Wisconsin crew in Boca!", attendeeCount: 6, supportedTeam: 'Milwaukee Bucks' },
  { gameId: 'f1_1', sport: 'Formula 1', home: 'Miami Grand Prix', away: 'Race Weekend', time: futureDate(10, 15, 0), venueIdx: 12, hostIdx: 46, title: 'F1 Miami GP Watch Party 🏎️', notes: "Race day! Pre-race coverage at 2PM!", attendeeCount: 18, supportedTeam: 'Formula 1' },
  { gameId: 'nhl3', sport: 'NHL', home: 'Colorado Avalanche', away: 'Vegas Golden Knights', time: futureDate(3, 21, 0), venueIdx: 14, hostIdx: 23, title: 'Avs Watch Party! 🏔️', notes: "Colorado transplants unite! Go Avs!", attendeeCount: 5, supportedTeam: 'Colorado Avalanche' },
  { gameId: 'nfl4', sport: 'NFL', home: 'Green Bay Packers', away: 'Chicago Bears', time: futureDate(7, 13, 0), venueIdx: 1, hostIdx: 51, title: 'Pack vs Bears! 💚💛', notes: "Wisconsin expats unite! Go Pack Go! Brats & beer!", attendeeCount: 11, supportedTeam: 'Green Bay Packers' },
  { gameId: 'cfb1', sport: 'College Football', home: 'Florida Gators', away: 'Georgia Bulldogs', time: futureDate(11, 15, 30), venueIdx: 15, hostIdx: 69, title: 'Gators Watch Party! 🐊', notes: "Go Gata! Chomp chomp! Getting there early.", attendeeCount: 13, supportedTeam: 'Florida Gators' },
  { gameId: 'nba5', sport: 'NBA', home: 'Golden State Warriors', away: 'LA Lakers', time: futureDate(2, 22, 0), venueIdx: 5, hostIdx: 31, title: 'Warriors Watch Party 💦', notes: "Splash zone! Late night hoops at Deck 84.", attendeeCount: 7, supportedTeam: 'Golden State Warriors' },
  { gameId: 'box1', sport: 'Boxing', home: 'Canelo Álvarez', away: 'Dmitry Bivol', time: futureDate(12, 21, 0), venueIdx: 10, hostIdx: 44, title: 'Boxing Night! 🥊', notes: "Big fight! Getting the crew together!", attendeeCount: 14, supportedTeam: 'Boxing' },
  { gameId: 'epl2', sport: 'Premier League', home: 'Arsenal', away: 'Chelsea', time: futureDate(6, 12, 30), venueIdx: 16, hostIdx: 15, title: 'Arsenal vs Chelsea ⚽🔴', notes: "London Derby! Early morning pints!", attendeeCount: 10, supportedTeam: 'Arsenal' },
  { gameId: 'nba6', sport: 'NBA', home: 'Miami Heat', away: 'New York Knicks', time: futureDate(8, 19, 30), venueIdx: 4, hostIdx: 0, title: 'Heat vs Knicks waterfront! 🔥', notes: "Waterfront watch party! Best views in Boynton.", attendeeCount: 16, supportedTeam: 'Miami Heat' },
  { gameId: 'nhl4', sport: 'NHL', home: 'Florida Panthers', away: 'Tampa Bay Lightning', time: futureDate(9, 19, 0), venueIdx: 11, hostIdx: 49, title: 'Battle of Florida! ⚡🏒', notes: "Panthers vs Bolts! Rivalry night!", attendeeCount: 21, supportedTeam: 'Florida Panthers' },
  { gameId: 'ucl1', sport: 'Champions League', home: 'Real Madrid', away: 'Manchester City', time: futureDate(7, 15, 0), venueIdx: 13, hostIdx: 52, title: 'Champions League Watch ⭐', notes: "The biggest club competition! Don't miss it!", attendeeCount: 12, supportedTeam: 'Real Madrid' },

  { gameId: 'nba_p1', sport: 'NBA', home: 'Miami Heat', away: 'Boston Celtics', time: pastDate(2, 19, 30), venueIdx: 0, hostIdx: 35, title: 'HEAT NATION GAME NIGHT 🔥🔥', notes: "What a game!! Heat pulled it off in OT!", attendeeCount: 25, supportedTeam: 'Miami Heat' },
  { gameId: 'nhl_p1', sport: 'NHL', home: 'Florida Panthers', away: 'Tampa Bay Lightning', time: pastDate(4, 19, 0), venueIdx: 11, hostIdx: 24, title: 'Battle of Florida! 🏒⚡', notes: "Incredible game! Panthers 4-3 in shootout!", attendeeCount: 22, supportedTeam: 'Florida Panthers' },
  { gameId: 'nfl_p1', sport: 'NFL', home: 'Miami Dolphins', away: 'New York Jets', time: pastDate(3, 13, 0), venueIdx: 0, hostIdx: 3, title: 'Fins Up! Sunday Funday 🐬', notes: "Dolphins crushed it! 34-17! Great crew today.", attendeeCount: 30, supportedTeam: 'Miami Dolphins' },
  { gameId: 'nfl_p2', sport: 'NFL', home: 'Green Bay Packers', away: 'Chicago Bears', time: pastDate(7, 13, 0), venueIdx: 1, hostIdx: 12, title: 'Packers vs Bears Classic', notes: "Great turnout! Pack won 31-17!", attendeeCount: 14, supportedTeam: 'Green Bay Packers' },
  { gameId: 'epl_p1', sport: 'Premier League', home: 'Arsenal', away: 'Tottenham', time: pastDate(5, 12, 30), venueIdx: 13, hostIdx: 15, title: 'North London Derby! 🔴⚪', notes: "Great atmosphere! Arsenal 2-1!", attendeeCount: 11, supportedTeam: 'Arsenal' },
  { gameId: 'ufc_p1', sport: 'UFC', home: 'UFC Fight Night', away: 'Prelims & Main Card', time: pastDate(6, 19, 0), venueIdx: 10, hostIdx: 44, title: 'UFC Fight Night 🥊', notes: "Epic KO in the main event! What a night!", attendeeCount: 16, supportedTeam: 'UFC' },
  { gameId: 'nba_p2', sport: 'NBA', home: 'LA Lakers', away: 'Golden State Warriors', time: pastDate(1, 22, 0), venueIdx: 12, hostIdx: 16, title: 'Lakers vs Warriors 💜💛', notes: "Classic! Lakers pulled it out in the 4th!", attendeeCount: 10, supportedTeam: 'LA Lakers' },
  { gameId: 'mls_p1', sport: 'MLS', home: 'Inter Miami', away: 'LAFC', time: pastDate(3, 19, 30), venueIdx: 12, hostIdx: 62, title: 'Inter Miami Game Night ⚽', notes: "Messi with a brace! What a night!", attendeeCount: 19, supportedTeam: 'Inter Miami' },
  { gameId: 'nhl_p2', sport: 'NHL', home: 'Florida Panthers', away: 'Boston Bruins', time: pastDate(5, 19, 0), venueIdx: 11, hostIdx: 1, title: 'Panthers vs Bruins 🏒', notes: "Tough loss but great party! Next time 🐱", attendeeCount: 15, supportedTeam: 'Florida Panthers' },
  { gameId: 'nba_p3', sport: 'NBA', home: 'Miami Heat', away: 'Philadelphia 76ers', time: pastDate(6, 19, 30), venueIdx: 8, hostIdx: 39, title: 'Heat vs Sixers 🔥', notes: "Butler went off! 38 points!", attendeeCount: 17, supportedTeam: 'Miami Heat' },
  { gameId: 'cfb_p1', sport: 'College Football', home: 'Alabama Crimson Tide', away: 'Auburn Tigers', time: pastDate(8, 15, 30), venueIdx: 3, hostIdx: 28, title: 'Roll Tide Watch Party! 🐘', notes: "Iron Bowl baby!! Roll Tide!", attendeeCount: 12, supportedTeam: 'Alabama Crimson Tide' },
  { gameId: 'nfl_p3', sport: 'NFL', home: 'Kansas City Chiefs', away: 'Buffalo Bills', time: pastDate(4, 16, 25), venueIdx: 6, hostIdx: 61, title: 'Chiefs vs Bills 🏈', notes: "Instant classic! Chiefs win in OT!", attendeeCount: 18, supportedTeam: 'Kansas City Chiefs' },
  { gameId: 'nba_p4', sport: 'NBA', home: 'Miami Heat', away: 'Denver Nuggets', time: pastDate(9, 20, 0), venueIdx: 2, hostIdx: 0, title: 'Heat vs Nuggets 🔥🏔️', notes: "Close game! Heat fell short by 3.", attendeeCount: 14, supportedTeam: 'Miami Heat' },

  { gameId: 'nba_t1', sport: 'NBA', home: 'Miami Heat', away: 'Charlotte Hornets', time: futureDate(0, 19, 0), venueIdx: 0, hostIdx: 39, title: 'Heat game TONIGHT! 🔥', notes: "Game is tonight! Table reserved in the back. Come thru!", attendeeCount: 20, supportedTeam: 'Miami Heat' },
  { gameId: 'nhl_t1', sport: 'NHL', home: 'Florida Panthers', away: 'Ottawa Senators', time: futureDate(0, 19, 0), venueIdx: 11, hostIdx: 29, title: 'Panthers tonight! 🏒', notes: "Let's go Cats! Bokampers has the best screens.", attendeeCount: 12, supportedTeam: 'Florida Panthers' },
  { gameId: 'nba_tw1', sport: 'NBA', home: 'Boston Celtics', away: 'New York Knicks', time: futureDate(1, 20, 0), venueIdx: 8, hostIdx: 53, title: 'Celtics vs Knicks tomorrow 🏀', notes: "Boston fans link up! Tap 42 has great food.", attendeeCount: 8, supportedTeam: 'Boston Celtics' },
];

const COORDINATION_MSGS = [
  "Running 10 min late, save me a seat!",
  "I'm here, blue shirt by the bar",
  "Table in the back left corner",
  "Parking is tight, might want to Uber",
  "Anyone ordering wings? I'm getting a bucket",
  "Got here early, grabbed a big table 🙌",
  "Where is everyone sitting?",
  "Just parked. Walking in now!",
  "I'll be the one in the jersey lol",
  "Saved seats for 4 more people",
  "Can someone order me a beer? Almost there!",
  "Traffic was crazy but I made it!",
];

const GAME_TALK_MSGS = [
  "Let's goooo! 🔥",
  "This ref is blind 😤",
  "We need this W so bad",
  "WHAT A PLAY!!! 🔥🔥🔥",
  "That was a terrible call",
  "OT! This is insane!",
  "GOOOAL!! 🚨🚨",
  "HE'S ON FIRE TONIGHT 🔥",
  "Defense needs to step up",
  "No way that's not a foul!!",
  "YESSSS!! Let's gooo!!!",
  "This game is INTENSE",
  "We're up by 10! Keep it going!",
  "Come on! We can't blow this lead",
  "That dunk was NASTY 😤",
  "Clutch three pointer!!",
  "I can't watch this is too stressful 😂",
  "MVP! MVP! MVP!",
  "This is the best game I've seen all season",
  "TOUCHDOWN!! 🏈🔥🔥",
];

const SOCIAL_MSGS = [
  "Great party! See you next week",
  "Thanks for organizing this!",
  "This place has amazing wings",
  "First time here, loving the vibe",
  "We should do this every week!",
  "Best watch party I've been to!",
  "The food here is 🔥",
  "Such a fun group! Glad I came",
  "Round of shots on me if we win! 🥃",
  "This is way better than watching at home",
];

const NEW_PEOPLE_MSGS = [
  "First time here, where should I sit?",
  "Is this the right group?",
  "Anyone here yet?",
  "Just signed up on the app, first party!",
  "My friend told me about this, excited to be here!",
];

const REVIEW_COMMENTS = [
  { atm: 5, food: 5, crowd: 5, text: "Best watch party ever! Amazing energy and great people. Will definitely be back!" },
  { atm: 4, food: 5, crowd: 4, text: "Food was incredible and the crowd was into it. Great host!" },
  { atm: 5, food: 4, crowd: 5, text: "The atmosphere was electric! Everyone was cheering and having a blast." },
  { atm: 4, food: 4, crowd: 4, text: "Really fun time. Good vibes, good food, good company." },
  { atm: 5, food: 3, crowd: 5, text: "The energy in the room was unreal! Felt like being at the actual game." },
  { atm: 4, food: 5, crowd: 3, text: "Amazing wings and beer selection. Solid watch party experience." },
  { atm: 3, food: 4, crowd: 4, text: "Nice spot, good people. Would come again for sure." },
  { atm: 5, food: 4, crowd: 5, text: "This is what watch parties should be! Host was awesome, crowd was lit 🔥" },
  { atm: 4, food: 4, crowd: 3, text: "Had a great time. Venue was a bit crowded but still fun." },
  { atm: 5, food: 5, crowd: 4, text: "Incredible food, incredible atmosphere. 10/10 would recommend!" },
  { atm: 3, food: 3, crowd: 5, text: "The crowd made it! Everyone was so into the game." },
  { atm: 4, food: 3, crowd: 4, text: "Good vibes overall. Drinks were a bit pricey but worth it for the experience." },
];

const teamSportMap = {
  'Miami Heat': 'NBA', 'Boston Celtics': 'NBA', 'LA Lakers': 'NBA', 'Golden State Warriors': 'NBA',
  'Milwaukee Bucks': 'NBA', 'Philadelphia 76ers': 'NBA', 'Dallas Mavericks': 'NBA', 'New York Knicks': 'NBA',
  'Chicago Bulls': 'NBA', 'Toronto Raptors': 'NBA', 'Cleveland Cavaliers': 'NBA', 'Denver Nuggets': 'NBA',
  'Brooklyn Nets': 'NBA', 'San Antonio Spurs': 'NBA', 'Miami Marlins': 'MLB',
  'Miami Dolphins': 'NFL', 'Buffalo Bills': 'NFL', 'Green Bay Packers': 'NFL', 'New England Patriots': 'NFL',
  'Pittsburgh Steelers': 'NFL', 'Dallas Cowboys': 'NFL', 'Chicago Bears': 'NFL', 'New York Giants': 'NFL',
  'San Francisco 49ers': 'NFL', 'Denver Broncos': 'NFL', 'Philadelphia Eagles': 'NFL', 'Kansas City Chiefs': 'NFL',
  'Atlanta Falcons': 'NFL', 'Carolina Panthers': 'NFL', 'Seattle Seahawks': 'NFL', 'New York Jets': 'NFL',
  'Cincinnati Bengals': 'NFL', 'Cleveland Browns': 'NFL', 'Houston Texans': 'NFL', 'Baltimore Ravens': 'NFL',
  'Tampa Bay Buccaneers': 'NFL', 'Jacksonville Jaguars': 'NFL', 'LA Chargers': 'NFL',
  'Florida Panthers': 'NHL', 'Pittsburgh Penguins': 'NHL', 'Boston Bruins': 'NHL', 'New York Rangers': 'NHL',
  'Colorado Avalanche': 'NHL', 'Tampa Bay Lightning': 'NHL', 'Toronto Maple Leafs': 'NHL',
  'New York Yankees': 'MLB', 'Boston Red Sox': 'MLB', 'LA Dodgers': 'MLB', 'Chicago Cubs': 'MLB',
  'Atlanta Braves': 'MLB', 'Kansas City Royals': 'MLB', 'Cincinnati Reds': 'MLB', 'Houston Astros': 'MLB',
  'Baltimore Orioles': 'MLB',
  'Inter Miami': 'MLS', 'Seattle Sounders': 'MLS',
  'Barcelona': 'La Liga', 'Real Madrid': 'La Liga',
  'Arsenal': 'Premier League', 'Manchester United': 'Premier League', 'Liverpool': 'Premier League',
  'Manchester City': 'Premier League',
  'Club América': 'Liga MX', 'Chivas Guadalajara': 'Liga MX',
  'Alabama Crimson Tide': 'College Football', 'Georgia Bulldogs': 'College Football', 'Ohio State Buckeyes': 'College Football',
  'Florida Gators': 'College Football',
  'Duke Blue Devils': 'College Basketball',
  'USA': 'International',
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateChatMessages(isPast, partyTime, attendeeIds, hostId, count) {
  const messages = [];
  const allUsers = [hostId, ...attendeeIds.filter(id => id !== hostId)];

  if (isPast) {
    const beforeCount = Math.floor(count * 0.2);
    const duringCount = Math.floor(count * 0.6);
    const afterCount = count - beforeCount - duringCount;

    for (let i = 0; i < beforeCount; i++) {
      const msg = COORDINATION_MSGS[Math.floor(Math.random() * COORDINATION_MSGS.length)];
      const sender = allUsers[Math.floor(Math.random() * allUsers.length)];
      const msgTime = new Date(new Date(partyTime).getTime() - (30 - i * 5) * 60000);
      messages.push({ userId: sender, message: msg, time: msgTime.toISOString() });
    }
    for (let i = 0; i < duringCount; i++) {
      const msg = GAME_TALK_MSGS[Math.floor(Math.random() * GAME_TALK_MSGS.length)];
      const sender = allUsers[Math.floor(Math.random() * allUsers.length)];
      const msgTime = new Date(new Date(partyTime).getTime() + (i * 8 + Math.floor(Math.random() * 5)) * 60000);
      messages.push({ userId: sender, message: msg, time: msgTime.toISOString() });
    }
    for (let i = 0; i < afterCount; i++) {
      const msg = SOCIAL_MSGS[Math.floor(Math.random() * SOCIAL_MSGS.length)];
      const sender = allUsers[Math.floor(Math.random() * allUsers.length)];
      const msgTime = new Date(new Date(partyTime).getTime() + (150 + i * 10) * 60000);
      messages.push({ userId: sender, message: msg, time: msgTime.toISOString() });
    }
  } else {
    const coordCount = Math.floor(count * 0.5);
    const socialCount = Math.floor(count * 0.3);
    const newCount = count - coordCount - socialCount;

    for (let i = 0; i < coordCount; i++) {
      const msg = COORDINATION_MSGS[Math.floor(Math.random() * COORDINATION_MSGS.length)];
      const sender = allUsers[Math.floor(Math.random() * allUsers.length)];
      const daysBeforeParty = Math.floor(Math.random() * 3) + 1;
      const msgTime = new Date(now.getTime() - daysBeforeParty * day + Math.floor(Math.random() * 12) * hour);
      messages.push({ userId: sender, message: msg, time: msgTime.toISOString() });
    }
    for (let i = 0; i < socialCount; i++) {
      const pool2 = [...SOCIAL_MSGS, "Who's coming to this one?", "Can't wait! 🙌", "This is gonna be epic!", "Just RSVP'd! See you all there"];
      const msg = pool2[Math.floor(Math.random() * pool2.length)];
      const sender = allUsers[Math.floor(Math.random() * allUsers.length)];
      const daysBeforeParty = Math.floor(Math.random() * 2) + 1;
      const msgTime = new Date(now.getTime() - daysBeforeParty * day + Math.floor(Math.random() * 12) * hour);
      messages.push({ userId: sender, message: msg, time: msgTime.toISOString() });
    }
    for (let i = 0; i < newCount; i++) {
      const msg = NEW_PEOPLE_MSGS[Math.floor(Math.random() * NEW_PEOPLE_MSGS.length)];
      const sender = allUsers[Math.floor(Math.random() * Math.min(allUsers.length, 10))];
      const msgTime = new Date(now.getTime() - Math.floor(Math.random() * 2) * day);
      messages.push({ userId: sender, message: msg, time: msgTime.toISOString() });
    }
  }

  return messages;
}

export async function seedDemoData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingCheck = await client.query("SELECT COUNT(*) FROM users WHERE email LIKE $1", [`%${SEED_EMAIL_DOMAIN}`]);
    if (parseInt(existingCheck.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      client.release();
      await clearDemoData();
      const client2 = await pool.connect();
      try {
        return await insertSeedData(client2);
      } finally {
        client2.release();
      }
    }

    return await insertSeedData(client);
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch(e) {}
    throw err;
  } finally {
    try { client.release(); } catch(e) {}
  }
}

async function insertSeedData(client) {
  await client.query('BEGIN');
  try {
    const hash = await bcrypt.hash('DemoUser123!', 10);
    const userIds = [];

    for (let i = 0; i < SEED_USERS.length; i++) {
      const u = SEED_USERS[i];
      const email = `seed${i.toString().padStart(3,'0')}${SEED_EMAIL_DOMAIN}`;

      const joinSpread = [
        { range: [25, 30], count: 12 },
        { range: [15, 24], count: 25 },
        { range: [5, 14], count: 28 },
        { range: [1, 4], count: 12 },
      ];
      let joinDaysAgo;
      const bucket = Math.floor(i / (SEED_USERS.length / joinSpread.length));
      const spread = joinSpread[Math.min(bucket, joinSpread.length - 1)];
      joinDaysAgo = spread.range[0] + Math.floor(Math.random() * (spread.range[1] - spread.range[0] + 1));

      const joinDate = new Date(now.getTime() - joinDaysAgo * day);
      const dob = new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));

      const result = await client.query(
        `INSERT INTO users (email, password_hash, name, gender, joined_at, country, date_of_birth, user_city, bio, profile_picture, user_type, is_founder, founder_number)
         VALUES ($1, $2, $3, $4, $5, 'US', $6, $7, $8, $9, 'fan', $10, $11)
         RETURNING id`,
        [email, hash, u.name, u.gender, joinDate.toISOString(), dob.toISOString().split('T')[0], u.city, u.bio,
         `https://i.pravatar.cc/150?img=${u.img}`, u.founderNum ? true : false, u.founderNum || null]
      );
      const userId = result.rows[0].id;
      userIds.push(userId);

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
        `INSERT INTO venues (name, address, city, type, verified, featured, featured_tier, capacity, description)
         VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8)
         RETURNING id`,
        [v.name, `${v.address}, ${v.city}`, v.city, v.type, v.featured, v.featuredTier, v.capacity, v.desc]
      );
      venueIds.push(result.rows[0].id);
    }

    const partyIds = [];
    let totalMessages = 0;
    for (let pi = 0; pi < SEED_PARTIES.length; pi++) {
      const p = SEED_PARTIES[pi];
      const venue = SEED_VENUES[p.venueIdx];
      const hostIdx = Math.min(p.hostIdx, SEED_USERS.length - 1);
      const hostId = userIds[hostIdx];

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
      const shuffled = shuffle(attendeePool);
      const attendeeSlice = shuffled.slice(0, Math.min(p.attendeeCount - 1, shuffled.length));

      for (const uid of attendeeSlice) {
        await client.query('INSERT INTO party_attendees (party_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [partyId, uid]);
      }

      const isPast = new Date(p.time) < now;
      const msgCount = isPast ? (6 + Math.floor(Math.random() * 8)) : (3 + Math.floor(Math.random() * 5));
      const chatMsgs = generateChatMessages(isPast, p.time, attendeeSlice, hostId, msgCount);
      totalMessages += chatMsgs.length;

      for (const msg of chatMsgs) {
        await client.query(
          'INSERT INTO party_messages (party_id, user_id, message, created_at) VALUES ($1, $2, $3, $4)',
          [partyId, msg.userId, msg.message, msg.time]
        );
      }

      if (isPast) {
        const reviewerCount = 2 + Math.floor(Math.random() * 5);
        const reviewers = attendeeSlice.slice(0, Math.min(reviewerCount, attendeeSlice.length));
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

        const checkinCount = Math.min(Math.floor(attendeeSlice.length * 0.7), attendeeSlice.length);
        for (const uid of attendeeSlice.slice(0, checkinCount)) {
          const venueName = venue.name;
          await client.query(
            `INSERT INTO venue_checkins (user_id, party_id, venue_name, qr_verified, created_at)
             VALUES ($1, $2, $3, true, $4) ON CONFLICT DO NOTHING`,
            [uid, partyId, venueName, new Date(p.time).toISOString()]
          );
        }
      }
    }

    const predictionUsers = shuffle(userIds).slice(0, 40);
    let predictionCount = 0;
    const pastParties = SEED_PARTIES.filter(p => new Date(p.time) < now);

    for (const userId of predictionUsers) {
      const numPredictions = 1 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numPredictions && i < pastParties.length; i++) {
        const party = pastParties[i % pastParties.length];
        const predictedTeam = Math.random() > 0.4 ? party.home : party.away;
        const confidence = 1 + Math.floor(Math.random() * 10);
        const isCorrect = Math.random() > 0.4;
        const resolved = true;
        const basePoints = 50 * confidence;
        const points = isCorrect ? basePoints : 0;
        const predTime = new Date(new Date(party.time).getTime() - (1 + Math.random() * 4) * hour);

        try {
          await client.query(
            `INSERT INTO predictions (user_id, game_id, game_time, predicted_team, confidence, is_correct, resolved, points_earned, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
            [userId, party.gameId, party.time, predictedTeam, confidence, isCorrect, resolved, points, predTime.toISOString()]
          );
          predictionCount++;
        } catch(e) {}
      }
    }

    const friendPairs = [];
    const friendUserPool = shuffle(userIds).slice(0, 30);
    for (let i = 0; i < friendUserPool.length - 1; i++) {
      if (Math.random() > 0.4) {
        try {
          await client.query(
            `INSERT INTO friendships (user_id, friend_id, status, created_at)
             VALUES ($1, $2, 'accepted', NOW()) ON CONFLICT DO NOTHING`,
            [friendUserPool[i], friendUserPool[i+1]]
          );
          friendPairs.push([friendUserPool[i], friendUserPool[i+1]]);
        } catch(e) {}
      }
    }

    for (let i = 0; i < SEED_VENUES.length; i++) {
      const followCount = 3 + Math.floor(Math.random() * 8);
      const followers = shuffle(userIds).slice(0, followCount);
      for (const uid of followers) {
        try {
          await client.query(
            `INSERT INTO venue_follows (user_id, venue_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
            [uid, venueIds[i]]
          );
        } catch(e) {}
      }

      if (Math.random() > 0.4) {
        const reviewerCount = 1 + Math.floor(Math.random() * 4);
        const reviewers = shuffle(userIds).slice(0, reviewerCount);
        for (const uid of reviewers) {
          const overall = 3 + Math.floor(Math.random() * 3);
          const atmosphere = 3 + Math.floor(Math.random() * 3);
          const service = 3 + Math.floor(Math.random() * 3);
          const value = 3 + Math.floor(Math.random() * 3);
          const comments = [
            "Great spot for game day! Love the atmosphere.",
            "Good food, cold beer, lots of TVs. What more do you need?",
            "A bit pricey but the experience is worth it.",
            "My go-to spot for watching games!",
            "Staff is friendly and they know sports. Love it.",
            "Best wings in town. Period.",
            "Solid venue. Gets packed on big game nights though.",
          ];
          try {
            await client.query(
              `INSERT INTO venue_reviews (user_id, venue_id, overall, atmosphere, service, value, comment, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) ON CONFLICT DO NOTHING`,
              [uid, venueIds[i], overall, atmosphere, service, value, comments[Math.floor(Math.random() * comments.length)]]
            );
          } catch(e) {}
        }
      }
    }

    await client.query('COMMIT');
    return { users: userIds.length, venues: venueIds.length, parties: partyIds.length, messages: totalMessages, predictions: predictionCount, friendships: friendPairs.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
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

      await client.query("DELETE FROM predictions WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM prediction_streaks WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM user_favorite_teams WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM user_points WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM points_history WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM friendships WHERE user_id = ANY($1) OR friend_id = ANY($1)", [seedUserIds, seedUserIds]);
      await client.query("DELETE FROM venue_checkins WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM venue_follows WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM venue_reviews WHERE user_id = ANY($1)", [seedUserIds]);
      await client.query("DELETE FROM users WHERE id = ANY($1)", [seedUserIds]);
    }

    await client.query("DELETE FROM venues WHERE claimed_by IS NULL AND description = ANY($1)", [SEED_VENUES.map(v => v.desc)]);

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

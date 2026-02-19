import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, MapPin, Users, Plus, ArrowLeft, LogOut, User, Trophy, Search, Filter, CheckCircle, Building2, BarChart3, Settings, Navigation, Star, Phone, Globe, Map, UserPlus, Bell, Send, Heart, X, Share2, Link, Check, Eye, EyeOff, Camera, Loader2, Pencil, DollarSign, Trash2, ChevronDown, Megaphone, MessageCircle, Gift, Award, Clock, Zap, Crown, Copy, Shield, ChevronRight } from 'lucide-react';
import { api } from './api.js';

// Sample games data for different sports
const SAMPLE_GAMES = [
  // NFL
  { id: 'nfl1', sport: 'NFL', homeTeam: 'Kansas City Chiefs', awayTeam: 'Buffalo Bills', startTime: '2026-02-16T18:00:00', venue: 'Arrowhead Stadium' },
  { id: 'nfl2', sport: 'NFL', homeTeam: 'San Francisco 49ers', awayTeam: 'Dallas Cowboys', startTime: '2026-02-16T20:30:00', venue: "Levi's Stadium" },
  { id: 'nfl3', sport: 'NFL', homeTeam: 'Green Bay Packers', awayTeam: 'Chicago Bears', startTime: '2026-02-17T13:00:00', venue: 'Lambeau Field' },
  
  // NBA
  { id: 'nba1', sport: 'NBA', homeTeam: 'Miami Heat', awayTeam: 'Boston Celtics', startTime: '2026-02-16T19:30:00', venue: 'FTX Arena' },
  { id: 'nba2', sport: 'NBA', homeTeam: 'LA Lakers', awayTeam: 'Golden State Warriors', startTime: '2026-02-16T22:00:00', venue: 'Crypto.com Arena' },
  { id: 'nba3', sport: 'NBA', homeTeam: 'Milwaukee Bucks', awayTeam: 'Philadelphia 76ers', startTime: '2026-02-17T20:00:00', venue: 'Fiserv Forum' },
  
  // MLB
  { id: 'mlb1', sport: 'MLB', homeTeam: 'New York Yankees', awayTeam: 'Boston Red Sox', startTime: '2026-04-15T19:05:00', venue: 'Yankee Stadium' },
  { id: 'mlb2', sport: 'MLB', homeTeam: 'LA Dodgers', awayTeam: 'San Francisco Giants', startTime: '2026-04-15T22:10:00', venue: 'Dodger Stadium' },
  { id: 'mlb3', sport: 'MLB', homeTeam: 'Chicago Cubs', awayTeam: 'St. Louis Cardinals', startTime: '2026-04-16T14:20:00', venue: 'Wrigley Field' },
  
  // NHL
  { id: 'nhl1', sport: 'NHL', homeTeam: 'Toronto Maple Leafs', awayTeam: 'Montreal Canadiens', startTime: '2026-02-16T19:00:00', venue: 'Scotiabank Arena' },
  { id: 'nhl2', sport: 'NHL', homeTeam: 'Boston Bruins', awayTeam: 'New York Rangers', startTime: '2026-02-17T18:00:00', venue: 'TD Garden' },
  { id: 'nhl3', sport: 'NHL', homeTeam: 'Colorado Avalanche', awayTeam: 'Vegas Golden Knights', startTime: '2026-02-17T21:00:00', venue: 'Ball Arena' },
  
  // College Football
  { id: 'cfb1', sport: 'College Football', homeTeam: 'Alabama Crimson Tide', awayTeam: 'Georgia Bulldogs', startTime: '2026-09-12T15:30:00', venue: 'Bryant-Denny Stadium' },
  { id: 'cfb2', sport: 'College Football', homeTeam: 'Ohio State Buckeyes', awayTeam: 'Michigan Wolverines', startTime: '2026-11-28T12:00:00', venue: 'Ohio Stadium' },
  { id: 'cfb3', sport: 'College Football', homeTeam: 'USC Trojans', awayTeam: 'Notre Dame Fighting Irish', startTime: '2026-10-17T19:30:00', venue: 'LA Memorial Coliseum' },
  
  // College Basketball
  { id: 'cbb1', sport: 'College Basketball', homeTeam: 'Duke Blue Devils', awayTeam: 'North Carolina Tar Heels', startTime: '2026-02-18T21:00:00', venue: 'Cameron Indoor Stadium' },
  { id: 'cbb2', sport: 'College Basketball', homeTeam: 'Kansas Jayhawks', awayTeam: 'Kentucky Wildcats', startTime: '2026-02-20T20:00:00', venue: 'Allen Fieldhouse' },
  { id: 'cbb3', sport: 'College Basketball', homeTeam: 'UConn Huskies', awayTeam: 'Villanova Wildcats', startTime: '2026-02-22T14:00:00', venue: 'Gampel Pavilion' },
  
  // Premier League
  { id: 'epl1', sport: 'Premier League', homeTeam: 'Manchester United', awayTeam: 'Liverpool', startTime: '2026-02-16T12:30:00', venue: 'Old Trafford' },
  { id: 'epl2', sport: 'Premier League', homeTeam: 'Arsenal', awayTeam: 'Chelsea', startTime: '2026-02-16T15:00:00', venue: 'Emirates Stadium' },
  { id: 'epl3', sport: 'Premier League', homeTeam: 'Manchester City', awayTeam: 'Tottenham', startTime: '2026-02-17T16:30:00', venue: 'Etihad Stadium' },
  
  // Liga MX
  { id: 'mx1', sport: 'Liga MX', homeTeam: 'Club América', awayTeam: 'Chivas Guadalajara', startTime: '2026-02-16T20:00:00', venue: 'Estadio Azteca' },
  { id: 'mx2', sport: 'Liga MX', homeTeam: 'Cruz Azul', awayTeam: 'Pumas UNAM', startTime: '2026-02-17T18:00:00', venue: 'Estadio Azul' },

  // La Liga
  { id: 'lla1', sport: 'La Liga', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', startTime: '2026-03-01T16:00:00', venue: 'Santiago Bernabéu' },
  { id: 'lla2', sport: 'La Liga', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', startTime: '2026-03-08T14:00:00', venue: 'Metropolitano Stadium' },

  // Champions League
  { id: 'ucl1', sport: 'Champions League', homeTeam: 'Real Madrid', awayTeam: 'Manchester City', startTime: '2026-02-18T15:00:00', venue: 'Santiago Bernabéu' },
  { id: 'ucl2', sport: 'Champions League', homeTeam: 'Bayern Munich', awayTeam: 'PSG', startTime: '2026-02-19T15:00:00', venue: 'Allianz Arena' },
  { id: 'ucl3', sport: 'Champions League', homeTeam: 'Arsenal', awayTeam: 'Inter Milan', startTime: '2026-03-11T15:00:00', venue: 'Emirates Stadium' },
  
  // MLS
  { id: 'mls1', sport: 'MLS', homeTeam: 'LA Galaxy', awayTeam: 'LAFC', startTime: '2026-02-16T22:30:00', venue: 'Dignity Health Sports Park' },
  { id: 'mls2', sport: 'MLS', homeTeam: 'Seattle Sounders', awayTeam: 'Portland Timbers', startTime: '2026-02-17T19:00:00', venue: 'Lumen Field' },
  
  // UFC
  { id: 'ufc1', sport: 'UFC', homeTeam: 'UFC 314', awayTeam: 'Main Card', startTime: '2026-02-22T22:00:00', venue: 'T-Mobile Arena, Las Vegas' },
  { id: 'ufc2', sport: 'UFC', homeTeam: 'UFC Fight Night', awayTeam: 'Prelims & Main Card', startTime: '2026-02-28T19:00:00', venue: 'UFC APEX, Las Vegas' },
  
  // Boxing
  { id: 'box1', sport: 'Boxing', homeTeam: 'Heavyweight Championship', awayTeam: 'Title Fight', startTime: '2026-03-15T21:00:00', venue: 'MGM Grand, Las Vegas' },
  { id: 'box2', sport: 'Boxing', homeTeam: 'Welterweight Bout', awayTeam: 'Main Event', startTime: '2026-03-29T20:00:00', venue: 'Madison Square Garden, NYC' },
  
  // FIFA World Cup
  { id: 'wc1', sport: 'FIFA World Cup', homeTeam: 'USA', awayTeam: 'Mexico', startTime: '2026-06-20T14:00:00', venue: 'MetLife Stadium, New Jersey' },
  { id: 'wc2', sport: 'FIFA World Cup', homeTeam: 'Brazil', awayTeam: 'Argentina', startTime: '2026-06-25T17:00:00', venue: 'AT&T Stadium, Dallas' },
  { id: 'wc3', sport: 'FIFA World Cup', homeTeam: 'England', awayTeam: 'Germany', startTime: '2026-06-28T12:00:00', venue: 'SoFi Stadium, Los Angeles' },
  { id: 'wcw1', sport: 'FIFA World Cup', homeTeam: "USA Women's", awayTeam: "Canada Women's", startTime: '2027-07-10T19:00:00', venue: 'Rose Bowl, Pasadena' },

  // Formula 1
  { id: 'f1_1', sport: 'Formula 1', homeTeam: 'Bahrain Grand Prix', awayTeam: 'Race Weekend', startTime: '2026-03-08T15:00:00', venue: 'Bahrain International Circuit' },
  { id: 'f1_2', sport: 'Formula 1', homeTeam: 'Miami Grand Prix', awayTeam: 'Race Weekend', startTime: '2026-05-03T15:30:00', venue: 'Miami International Autodrome' },
  { id: 'f1_3', sport: 'Formula 1', homeTeam: 'Monaco Grand Prix', awayTeam: 'Race Weekend', startTime: '2026-05-24T09:00:00', venue: 'Circuit de Monaco' },

  // Tennis
  { id: 'ten1', sport: 'Tennis', homeTeam: 'Australian Open', awayTeam: 'Grand Slam', startTime: '2026-01-19T04:00:00', venue: 'Melbourne Park, Australia' },
  { id: 'ten2', sport: 'Tennis', homeTeam: 'French Open', awayTeam: 'Grand Slam', startTime: '2026-05-25T11:00:00', venue: 'Roland Garros, Paris' },
  { id: 'ten3', sport: 'Tennis', homeTeam: 'Wimbledon', awayTeam: 'Grand Slam', startTime: '2026-06-29T07:00:00', venue: 'All England Club, London' },

  // Rugby
  { id: 'rug1', sport: 'Rugby', homeTeam: 'New Zealand All Blacks', awayTeam: 'South Africa Springboks', startTime: '2026-07-11T08:00:00', venue: 'Eden Park, Auckland' },
  { id: 'rug2', sport: 'Rugby', homeTeam: 'England', awayTeam: 'Ireland', startTime: '2026-02-21T10:00:00', venue: 'Twickenham Stadium, London' },
  { id: 'rug3', sport: 'Rugby', homeTeam: 'France', awayTeam: 'Wales', startTime: '2026-03-14T09:00:00', venue: 'Stade de France, Paris' },

  // Cricket
  { id: 'cri1', sport: 'Cricket', homeTeam: 'India', awayTeam: 'Australia', startTime: '2026-02-20T04:30:00', venue: 'Wankhede Stadium, Mumbai' },
  { id: 'cri2', sport: 'Cricket', homeTeam: 'England', awayTeam: 'West Indies', startTime: '2026-06-10T06:00:00', venue: "Lord's Cricket Ground, London" },
  { id: 'cri3', sport: 'Cricket', homeTeam: 'IPL Final', awayTeam: 'Championship Match', startTime: '2026-05-30T10:00:00', venue: 'Narendra Modi Stadium, Ahmedabad' },
];

const SPORTS = ['All', 'UFC', 'NFL', 'NBA', 'MLB', 'NHL', 'College Football', 'College Basketball', 'Premier League', 'La Liga', 'Liga MX', 'MLS', 'Champions League', 'Formula 1', 'Tennis', 'Rugby', 'Cricket'];

const SPORT_ICONS = {
  'All': '🏟️',
  'NFL': '🏈',
  'NBA': '🏀',
  'MLB': '⚾',
  'NHL': '🏒',
  'College Football': '🎓🏈',
  'College Basketball': '🎓🏀',
  'Premier League': '⚽',
  'Liga MX': '⚽',
  'La Liga': '⚽',
  'Champions League': '🏆',
  'MLS': '⚽',
  'Formula 1': '🏎️',
  'Tennis': '🎾',
  'Rugby': '🏉',
  'Cricket': '🏏',
  'UFC': '🥊',
  'Boxing': '🥊',
  'FIFA World Cup': '🏆⚽',
};

// Teams database for favorite team selection
const TEAMS_BY_SPORT = {
  'NFL': ['Arizona Cardinals', 'Atlanta Falcons', 'Baltimore Ravens', 'Buffalo Bills', 'Carolina Panthers', 'Chicago Bears', 'Cincinnati Bengals', 'Cleveland Browns', 'Dallas Cowboys', 'Denver Broncos', 'Detroit Lions', 'Green Bay Packers', 'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Kansas City Chiefs', 'Las Vegas Raiders', 'LA Chargers', 'LA Rams', 'Miami Dolphins', 'Minnesota Vikings', 'New England Patriots', 'New Orleans Saints', 'NY Giants', 'NY Jets', 'Philadelphia Eagles', 'Pittsburgh Steelers', 'San Francisco 49ers', 'Seattle Seahawks', 'Tampa Bay Buccaneers', 'Tennessee Titans', 'Washington Commanders'],
  'NBA': ['Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets', 'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets', 'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers', 'LA Clippers', 'LA Lakers', 'Memphis Grizzlies', 'Miami Heat', 'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'NY Knicks', 'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns', 'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors', 'Utah Jazz', 'Washington Wizards'],
  'MLB': ['Arizona Diamondbacks', 'Atlanta Braves', 'Baltimore Orioles', 'Boston Red Sox', 'Chicago Cubs', 'Chicago White Sox', 'Cincinnati Reds', 'Cleveland Guardians', 'Colorado Rockies', 'Detroit Tigers', 'Houston Astros', 'Kansas City Royals', 'LA Angels', 'LA Dodgers', 'Miami Marlins', 'Milwaukee Brewers', 'Minnesota Twins', 'NY Mets', 'NY Yankees', 'Oakland Athletics', 'Philadelphia Phillies', 'Pittsburgh Pirates', 'San Diego Padres', 'San Francisco Giants', 'Seattle Mariners', 'St. Louis Cardinals', 'Tampa Bay Rays', 'Texas Rangers', 'Toronto Blue Jays', 'Washington Nationals'],
  'NHL': ['Anaheim Ducks', 'Arizona Coyotes', 'Boston Bruins', 'Buffalo Sabres', 'Calgary Flames', 'Carolina Hurricanes', 'Chicago Blackhawks', 'Colorado Avalanche', 'Columbus Blue Jackets', 'Dallas Stars', 'Detroit Red Wings', 'Edmonton Oilers', 'Florida Panthers', 'LA Kings', 'Minnesota Wild', 'Montreal Canadiens', 'Nashville Predators', 'New Jersey Devils', 'NY Islanders', 'NY Rangers', 'Ottawa Senators', 'Philadelphia Flyers', 'Pittsburgh Penguins', 'San Jose Sharks', 'Seattle Kraken', 'St. Louis Blues', 'Tampa Bay Lightning', 'Toronto Maple Leafs', 'Vancouver Canucks', 'Vegas Golden Knights', 'Washington Capitals', 'Winnipeg Jets'],
  'College Football': ['Alabama', 'Georgia', 'Ohio State', 'Michigan', 'Texas', 'USC', 'Notre Dame', 'Penn State', 'Florida', 'LSU', 'Oklahoma', 'Clemson', 'Oregon', 'Tennessee', 'Auburn', 'Florida State', 'Wisconsin', 'Miami', 'Texas A&M', 'Washington'],
  'College Basketball': ['Duke', 'North Carolina', 'Kansas', 'Kentucky', 'UCLA', 'Villanova', 'Michigan State', 'UConn', 'Arizona', 'Gonzaga', 'Louisville', 'Syracuse', 'Indiana', 'Michigan', 'Virginia', 'Texas'],
  'Premier League': ['Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United', 'Tottenham', 'Newcastle', 'Aston Villa', 'Brighton', 'West Ham', 'Everton', 'Leicester City', 'Wolves'],
  'Liga MX': ['Club América', 'Chivas Guadalajara', 'Cruz Azul', 'Pumas UNAM', 'Tigres UANL', 'Monterrey', 'Atlas', 'Santos Laguna', 'León', 'Pachuca'],
  'La Liga': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Real Sociedad', 'Athletic Bilbao', 'Real Betis', 'Villarreal', 'Sevilla', 'Valencia', 'Girona'],
  'Champions League': ['Real Madrid', 'Manchester City', 'Bayern Munich', 'Barcelona', 'PSG', 'Inter Milan', 'AC Milan', 'Borussia Dortmund', 'Arsenal', 'Liverpool', 'Juventus', 'Atletico Madrid'],
  'MLS': ['LA Galaxy', 'LAFC', 'Seattle Sounders', 'Portland Timbers', 'Atlanta United', 'Inter Miami', 'NY Red Bulls', 'NYCFC', 'Toronto FC', 'Vancouver Whitecaps', 'Austin FC', 'Chicago Fire'],
  'Formula 1': ['Red Bull Racing', 'Ferrari', 'Mercedes', 'McLaren', 'Aston Martin', 'Alpine', 'Williams', 'RB', 'Kick Sauber', 'Haas'],
  'Tennis': ['Novak Djokovic', 'Carlos Alcaraz', 'Jannik Sinner', 'Daniil Medvedev', 'Alexander Zverev', 'Stefanos Tsitsipas', 'Holger Rune', 'Andrey Rublev', 'Iga Swiatek', 'Aryna Sabalenka', 'Coco Gauff', 'Elena Rybakina'],
  'Rugby': ['New Zealand All Blacks', 'South Africa Springboks', 'England', 'Ireland', 'France', 'Australia Wallabies', 'Wales', 'Scotland', 'Argentina Pumas', 'Japan'],
  'Cricket': ['India', 'Australia', 'England', 'South Africa', 'New Zealand', 'Pakistan', 'West Indies', 'Sri Lanka', 'Bangladesh', 'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore'],
  'UFC': ['Jon Jones', 'Islam Makhachev', 'Alex Pereira', 'Leon Edwards', 'Ilia Topuria', 'Sean O\'Malley', 'Dricus du Plessis', 'Max Holloway', 'Conor McGregor', 'Dustin Poirier', 'Charles Oliveira', 'Kamaru Usman', 'Israel Adesanya', 'Amanda Nunes', 'Valentina Shevchenko'],
  'FIFA World Cup': ['USA', 'Mexico', 'Canada', 'Brazil', 'Argentina', 'England', 'France', 'Germany', 'Spain', 'Portugal', 'Netherlands', 'Italy', 'Japan', 'South Korea', 'Australia']
};

const TEAM_LOGO_MAP = {
  'NFL': { league: 'nfl', teams: { 'Arizona Cardinals': 'ari', 'Atlanta Falcons': 'atl', 'Baltimore Ravens': 'bal', 'Buffalo Bills': 'buf', 'Carolina Panthers': 'car', 'Chicago Bears': 'chi', 'Cincinnati Bengals': 'cin', 'Cleveland Browns': 'cle', 'Dallas Cowboys': 'dal', 'Denver Broncos': 'den', 'Detroit Lions': 'det', 'Green Bay Packers': 'gb', 'Houston Texans': 'hou', 'Indianapolis Colts': 'ind', 'Jacksonville Jaguars': 'jax', 'Kansas City Chiefs': 'kc', 'Las Vegas Raiders': 'lv', 'LA Chargers': 'lac', 'LA Rams': 'lar', 'Miami Dolphins': 'mia', 'Minnesota Vikings': 'min', 'New England Patriots': 'ne', 'New Orleans Saints': 'no', 'NY Giants': 'nyg', 'NY Jets': 'nyj', 'Philadelphia Eagles': 'phi', 'Pittsburgh Steelers': 'pit', 'San Francisco 49ers': 'sf', 'Seattle Seahawks': 'sea', 'Tampa Bay Buccaneers': 'tb', 'Tennessee Titans': 'ten', 'Washington Commanders': 'wsh' }},
  'NBA': { league: 'nba', teams: { 'Atlanta Hawks': 'atl', 'Boston Celtics': 'bos', 'Brooklyn Nets': 'bkn', 'Charlotte Hornets': 'cha', 'Chicago Bulls': 'chi', 'Cleveland Cavaliers': 'cle', 'Dallas Mavericks': 'dal', 'Denver Nuggets': 'den', 'Detroit Pistons': 'det', 'Golden State Warriors': 'gs', 'Houston Rockets': 'hou', 'Indiana Pacers': 'ind', 'LA Clippers': 'lac', 'LA Lakers': 'lal', 'Memphis Grizzlies': 'mem', 'Miami Heat': 'mia', 'Milwaukee Bucks': 'mil', 'Minnesota Timberwolves': 'min', 'New Orleans Pelicans': 'no', 'NY Knicks': 'ny', 'Oklahoma City Thunder': 'okc', 'Orlando Magic': 'orl', 'Philadelphia 76ers': 'phi', 'Phoenix Suns': 'phx', 'Portland Trail Blazers': 'por', 'Sacramento Kings': 'sac', 'San Antonio Spurs': 'sa', 'Toronto Raptors': 'tor', 'Utah Jazz': 'uta', 'Washington Wizards': 'wsh' }},
  'MLB': { league: 'mlb', teams: { 'Arizona Diamondbacks': 'ari', 'Atlanta Braves': 'atl', 'Baltimore Orioles': 'bal', 'Boston Red Sox': 'bos', 'Chicago Cubs': 'chc', 'Chicago White Sox': 'chw', 'Cincinnati Reds': 'cin', 'Cleveland Guardians': 'cle', 'Colorado Rockies': 'col', 'Detroit Tigers': 'det', 'Houston Astros': 'hou', 'Kansas City Royals': 'kc', 'LA Angels': 'laa', 'LA Dodgers': 'lad', 'Miami Marlins': 'mia', 'Milwaukee Brewers': 'mil', 'Minnesota Twins': 'min', 'NY Mets': 'nym', 'NY Yankees': 'nyy', 'Oakland Athletics': 'oak', 'Philadelphia Phillies': 'phi', 'Pittsburgh Pirates': 'pit', 'San Diego Padres': 'sd', 'San Francisco Giants': 'sf', 'Seattle Mariners': 'sea', 'St. Louis Cardinals': 'stl', 'Tampa Bay Rays': 'tb', 'Texas Rangers': 'tex', 'Toronto Blue Jays': 'tor', 'Washington Nationals': 'wsh' }},
  'NHL': { league: 'nhl', teams: { 'Anaheim Ducks': 'ana', 'Arizona Coyotes': 'ari', 'Boston Bruins': 'bos', 'Buffalo Sabres': 'buf', 'Calgary Flames': 'cgy', 'Carolina Hurricanes': 'car', 'Chicago Blackhawks': 'chi', 'Colorado Avalanche': 'col', 'Columbus Blue Jackets': 'cbj', 'Dallas Stars': 'dal', 'Detroit Red Wings': 'det', 'Edmonton Oilers': 'edm', 'Florida Panthers': 'fla', 'LA Kings': 'la', 'Minnesota Wild': 'min', 'Montreal Canadiens': 'mtl', 'Nashville Predators': 'nsh', 'New Jersey Devils': 'njd', 'NY Islanders': 'nyi', 'NY Rangers': 'nyr', 'Ottawa Senators': 'ott', 'Philadelphia Flyers': 'phi', 'Pittsburgh Penguins': 'pit', 'San Jose Sharks': 'sjs', 'Seattle Kraken': 'sea', 'St. Louis Blues': 'stl', 'Tampa Bay Lightning': 'tb', 'Toronto Maple Leafs': 'tor', 'Vancouver Canucks': 'van', 'Vegas Golden Knights': 'vgk', 'Washington Capitals': 'wsh', 'Winnipeg Jets': 'wpg' }},
  'MLS': { league: 'usa.1', teams: { 'LA Galaxy': 'lag', 'LAFC': 'lafc', 'Seattle Sounders': 'sea', 'Portland Timbers': 'por', 'Atlanta United': 'atl', 'Inter Miami': 'mia', 'NY Red Bulls': 'rbny', 'NYCFC': 'nyc', 'Toronto FC': 'tor', 'Vancouver Whitecaps': 'van', 'Austin FC': 'atx', 'Chicago Fire': 'chi' }},
};

const TEAM_COLORS = {
  'Green Bay Packers': ['#203731', '#FFB612'], 'Dallas Cowboys': ['#003594', '#869397'], 'Kansas City Chiefs': ['#E31837', '#FFB81C'],
  'San Francisco 49ers': ['#AA0000', '#B3995D'], 'Pittsburgh Steelers': ['#101820', '#FFB612'], 'New England Patriots': ['#002244', '#C60C30'],
  'Chicago Bears': ['#0B162A', '#C83803'], 'Miami Dolphins': ['#008E97', '#FC4C02'], 'Philadelphia Eagles': ['#004C54', '#A5ACAF'],
  'Buffalo Bills': ['#00338D', '#C60C30'], 'Denver Broncos': ['#FB4F14', '#002244'], 'LA Rams': ['#003594', '#FFD100'],
  'Minnesota Vikings': ['#4F2683', '#FFC62F'], 'Baltimore Ravens': ['#241773', '#9E7C0C'], 'Tampa Bay Buccaneers': ['#D50A0A', '#34302B'],
  'Seattle Seahawks': ['#002244', '#69BE28'], 'NY Giants': ['#0B2265', '#A71930'], 'LA Chargers': ['#0080C6', '#FFC20E'],
  'Cleveland Browns': ['#311D00', '#FF3C00'], 'Detroit Lions': ['#0076B6', '#B0B7BC'], 'Cincinnati Bengals': ['#FB4F14', '#000000'],
  'New Orleans Saints': ['#101820', '#D3BC8D'], 'Las Vegas Raiders': ['#000000', '#A5ACAF'], 'Atlanta Falcons': ['#A71930', '#000000'],
  'Arizona Cardinals': ['#97233F', '#000000'], 'Jacksonville Jaguars': ['#006778', '#D7A22A'], 'Tennessee Titans': ['#0C2340', '#4B92DB'],
  'Houston Texans': ['#03202F', '#A71930'], 'Indianapolis Colts': ['#002C5F', '#A2AAAD'], 'Carolina Panthers': ['#0085CA', '#101820'],
  'NY Jets': ['#125740', '#000000'], 'Washington Commanders': ['#5A1414', '#FFB612'],
  'LA Lakers': ['#552583', '#FDB927'], 'Boston Celtics': ['#007A33', '#BA9653'], 'Golden State Warriors': ['#1D428A', '#FFC72C'],
  'Miami Heat': ['#98002E', '#F9A01B'], 'Chicago Bulls': ['#CE1141', '#000000'], 'Brooklyn Nets': ['#000000', '#FFFFFF'],
  'Philadelphia 76ers': ['#006BB6', '#ED174C'], 'Dallas Mavericks': ['#00538C', '#002B5E'], 'Milwaukee Bucks': ['#00471B', '#EEE1C6'],
  'Denver Nuggets': ['#0E2240', '#FEC524'], 'Phoenix Suns': ['#1D1160', '#E56020'], 'Cleveland Cavaliers': ['#860038', '#FDBB30'],
  'NY Knicks': ['#006BB6', '#F58426'], 'Toronto Raptors': ['#CE1141', '#000000'], 'Atlanta Hawks': ['#E03A3E', '#C1D32F'],
  'Oklahoma City Thunder': ['#007AC1', '#EF6024'], 'Sacramento Kings': ['#5A2D81', '#63727A'], 'Memphis Grizzlies': ['#5D76A9', '#12173F'],
  'Indiana Pacers': ['#002D62', '#FDBB30'], 'LA Clippers': ['#C8102E', '#1D428A'], 'Portland Trail Blazers': ['#E03A3E', '#000000'],
  'Orlando Magic': ['#0077C0', '#C4CED4'], 'Minnesota Timberwolves': ['#0C2340', '#236192'], 'Charlotte Hornets': ['#1D1160', '#00788C'],
  'San Antonio Spurs': ['#C4CED4', '#000000'], 'Houston Rockets': ['#CE1141', '#000000'], 'Utah Jazz': ['#002B5C', '#00471B'],
  'New Orleans Pelicans': ['#0C2340', '#C8102E'], 'Detroit Pistons': ['#C8102E', '#1D42BA'], 'Washington Wizards': ['#002B5C', '#E31837'],
  'NY Yankees': ['#003087', '#E4002B'], 'LA Dodgers': ['#005A9C', '#EF3E42'], 'Boston Red Sox': ['#BD3039', '#0C2340'],
  'Chicago Cubs': ['#0E3386', '#CC3433'], 'Atlanta Braves': ['#CE1141', '#13274F'], 'Houston Astros': ['#002D62', '#EB6E1F'],
  'St. Louis Cardinals': ['#C41E3A', '#0C2340'], 'Philadelphia Phillies': ['#E81828', '#002D72'], 'San Diego Padres': ['#2F241D', '#FFC425'],
  'Toronto Blue Jays': ['#134A8E', '#1D2D5C'], 'NY Mets': ['#002D72', '#FF5910'], 'Seattle Mariners': ['#0C2C56', '#005C5C'],
  'San Francisco Giants': ['#FD5A1E', '#27251F'], 'Tampa Bay Rays': ['#092C5C', '#8FBCE6'], 'Texas Rangers': ['#003278', '#C0111F'],
  'Inter Miami': ['#F7B5CD', '#231F20'], 'LA Galaxy': ['#00245D', '#FFD200'], 'LAFC': ['#C39E6D', '#000000'],
  'Seattle Sounders': ['#005695', '#658D1B'], 'Atlanta United': ['#80000B', '#231F20'], 'NYCFC': ['#6CACE4', '#F15524'],
};

const getTeamColors = (sport, team) => {
  if (TEAM_COLORS[team]) return TEAM_COLORS[team];
  return null;
};

const getTeamLogoUrl = (sport, team) => {
  const sportData = TEAM_LOGO_MAP[sport];
  if (!sportData) return null;
  const abbr = sportData.teams?.[team];
  if (!abbr) return null;
  return `https://a.espncdn.com/i/teamlogos/${sportData.league}/500/${abbr}.png`;
};

const COUNTRY_FLAGS = {
  'USA': '🇺🇸', 'Mexico': '🇲🇽', 'Canada': '🇨🇦', 'Brazil': '🇧🇷', 'Argentina': '🇦🇷',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'France': '🇫🇷', 'Germany': '🇩🇪', 'Spain': '🇪🇸', 'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱', 'Italy': '🇮🇹', 'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺',
  'Colombia': '🇨🇴', 'Uruguay': '🇺🇾', 'Chile': '🇨🇱', 'Peru': '🇵🇪', 'Ecuador': '🇪🇨',
  'Belgium': '🇧🇪', 'Croatia': '🇭🇷', 'Denmark': '🇩🇰', 'Switzerland': '🇨🇭', 'Poland': '🇵🇱',
  'Sweden': '🇸🇪', 'Serbia': '🇷🇸', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Ireland': '🇮🇪',
  'Nigeria': '🇳🇬', 'Senegal': '🇸🇳', 'Ghana': '🇬🇭', 'Cameroon': '🇨🇲', 'Morocco': '🇲🇦',
  'Egypt': '🇪🇬', 'Tunisia': '🇹🇳', 'South Africa': '🇿🇦', 'Algeria': '🇩🇿',
  'India': '🇮🇳', 'Pakistan': '🇵🇰', 'Iran': '🇮🇷', 'Saudi Arabia': '🇸🇦', 'Qatar': '🇶🇦',
  'Costa Rica': '🇨🇷', 'Honduras': '🇭🇳', 'Jamaica': '🇯🇲', 'Panama': '🇵🇦',
  'New Zealand': '🇳🇿', 'China': '🇨🇳', 'Russia': '🇷🇺', 'Turkey': '🇹🇷', 'Greece': '🇬🇷',
  'Czech Republic': '🇨🇿', 'Romania': '🇷🇴', 'Hungary': '🇭🇺', 'Norway': '🇳🇴', 'Austria': '🇦🇹',
  'Paraguay': '🇵🇾', 'Bolivia': '🇧🇴', 'Venezuela': '🇻🇪', 'Cuba': '🇨🇺', 'Haiti': '🇭🇹',
  'Trinidad & Tobago': '🇹🇹', 'El Salvador': '🇸🇻', 'Guatemala': '🇬🇹', 'Dominican Republic': '🇩🇴',
};

const SLOT_STYLES = [
  { color: 'from-cyan-600/40 to-blue-600/40', borderColor: 'border-cyan-500/30' },
  { color: 'from-purple-600/40 to-pink-600/40', borderColor: 'border-purple-500/30' },
  { color: 'from-amber-600/40 to-orange-600/40', borderColor: 'border-amber-500/30' },
  { color: 'from-emerald-600/40 to-teal-600/40', borderColor: 'border-emerald-500/30' },
  { color: 'from-rose-600/40 to-red-600/40', borderColor: 'border-rose-500/30' },
];

const DEMO_SPONSORS = [
  { name: 'Game Day Grill', tagline: 'Fuel your game day experience', demoLogo: '/demo-sponsors/gameday-grill.png', url: '#', sport: 'NFL', slot: 1 },
  { name: 'Cold Brew Co', tagline: 'Craft beers for every quarter', demoLogo: '/demo-sponsors/cold-brew-co.png', url: '#', sport: 'NFL', slot: 2 },
  { name: 'FanBet', tagline: 'Your game, your call - bet smarter', demoLogo: '/demo-sponsors/fanbet.png', url: '#', sport: 'NFL', slot: 3 },
  { name: 'Gridiron Gear', tagline: 'Gear up for game day', demoLogo: '/demo-sponsors/gameday-grill.png', url: '#', sport: 'NFL', slot: 4 },
  { name: 'Tailgate Nation', tagline: 'The ultimate tailgate experience', demoLogo: '/demo-sponsors/cold-brew-co.png', url: '#', sport: 'NFL', slot: 5, tier: 'premium' },
  { name: 'Peak Athletics', tagline: 'Performance gear for real fans', demoLogo: '/demo-sponsors/peak-athletics.png', url: '#', sport: 'NBA', slot: 1 },
  { name: 'Surge Energy', tagline: 'Powered by fans, fueled by Surge', demoLogo: '/demo-sponsors/surge-energy.png', url: '#', sport: 'NBA', slot: 2 },
  { name: 'Slam Dunk Pizza', tagline: 'Score big with every slice', demoLogo: '/demo-sponsors/slam-dunk-pizza.png', url: '#', sport: 'NBA', slot: 3 },
  { name: 'Courtside Kicks', tagline: 'Step up your sneaker game', demoLogo: '/demo-sponsors/peak-athletics.png', url: '#', sport: 'NBA', slot: 4 },
  { name: 'Hoops & Hops', tagline: 'Where basketball meets craft beer', demoLogo: '/demo-sponsors/surge-energy.png', url: '#', sport: 'NBA', slot: 5, tier: 'premium' },
];

const DEMO_MAIN_SPONSOR = {
  name: 'Victory Sports Drink',
  tagline: 'Fuel the Fans. Own the Moment.',
  logoUrl: '/demo-sponsors/victory-sports-main.png',
  url: '#',
  isDemo: true,
};

const MainSponsorBanner = ({ mainSponsor, onAdvertise }) => {
  const sponsor = mainSponsor || DEMO_MAIN_SPONSOR;
  const isExample = !mainSponsor;
  return (
    <div
      onClick={() => sponsor.url && sponsor.url !== '#' && window.open(sponsor.url, '_blank')}
      className={`w-full h-14 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800 ${sponsor.url && sponsor.url !== '#' ? 'cursor-pointer' : ''}`}
    >
      <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-center gap-3">
        <div className="flex-shrink-0 h-12 min-w-[140px] max-w-[220px] rounded-lg overflow-hidden bg-white/15 flex items-center justify-center px-3">
          {sponsor.logoUrl ? (
            <img src={sponsor.logoUrl} alt={sponsor.name} className="h-10 w-auto max-w-full object-contain" />
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-cyan-200 font-black text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap">MAIN SPONSOR</span>
          <span className="text-white/60 hidden sm:inline">—</span>
          <span className="text-white font-bold text-sm sm:text-base truncate">{sponsor.name}</span>
          <span className="text-white/70 text-xs sm:text-sm truncate hidden sm:inline">{sponsor.tagline}</span>
        </div>
        {isExample && onAdvertise && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdvertise(); }}
            className="flex-shrink-0 px-3 py-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full text-white text-xs font-bold transition-all whitespace-nowrap"
          >
            Advertise
          </button>
        )}
      </div>
    </div>
  );
};

const COUNTRIES_LIST = Object.keys(COUNTRY_FLAGS).sort();

// Sample verified venues (in production, this comes from database)
const SAMPLE_VENUES = [
  { id: 'v1', name: "Buffalo Wild Wings Downtown", address: "123 Main St, Fort Lauderdale, FL", verified: true, featured: true, type: 'Sports Bar' },
  { id: 'v2', name: "The Pub Sports Bar", address: "456 Ocean Ave, Fort Lauderdale, FL", verified: true, featured: false, type: 'Sports Bar' },
  { id: 'v3', name: "Yard House", address: "789 Las Olas Blvd, Fort Lauderdale, FL", verified: true, featured: true, type: 'Restaurant & Bar' },
  { id: 'v4', name: "Bokampers Sports Bar", address: "321 Commercial Blvd, Fort Lauderdale, FL", verified: true, featured: false, type: 'Sports Bar' },
];

// Multi-location venue pricing
const VENUE_PRICING = {
  single: { name: "Single Location", featured: 199 },
  chain: { name: "Multi-Location (2-5)", featured: 499 },
  chainPlus: { name: "Regional Chain (6-20)", featured: 999 },
  enterprise: { name: "Enterprise (20+)", featured: "Custom" }
};

const getProfilePicUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('/objects/')) {
    return `/api/uploads/serve/${path.replace('/objects/', '')}`;
  }
  return path;
};

const ProfileAvatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-28 h-28 text-4xl',
  };
  const picUrl = getProfilePicUrl(src);
  if (picUrl) {
    return (
      <img
        src={picUrl}
        alt={name || ''}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white/20 ${className}`}
      />
    );
  }
  const initial = (name || '?')[0].toUpperCase();
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold border-2 border-white/20 ${className}`}>
      {initial}
    </div>
  );
};

const getFanBadge = (attended, hosted) => {
  const total = attended + hosted;
  if (total >= 50) return { tier: 'Legend', emoji: '🏆', color: 'from-yellow-400 to-amber-500', textColor: 'text-yellow-300', bg: 'bg-yellow-500/20' };
  if (total >= 25) return { tier: 'MVP', emoji: '🥇', color: 'from-purple-400 to-pink-500', textColor: 'text-purple-300', bg: 'bg-purple-500/20' };
  if (total >= 10) return { tier: 'All-Star', emoji: '⭐', color: 'from-cyan-400 to-blue-500', textColor: 'text-cyan-300', bg: 'bg-cyan-500/20' };
  if (total >= 5) return { tier: 'Starter', emoji: '🔥', color: 'from-orange-400 to-red-500', textColor: 'text-orange-300', bg: 'bg-orange-500/20' };
  if (total >= 1) return { tier: 'Rookie', emoji: '🎽', color: 'from-green-400 to-emerald-500', textColor: 'text-green-300', bg: 'bg-green-500/20' };
  return { tier: 'New Fan', emoji: '👋', color: 'from-gray-400 to-gray-500', textColor: 'text-gray-300', bg: 'bg-gray-500/20' };
};

const getVenueBadge = (totalParties, totalFans) => {
  if (totalParties >= 50) return { tier: 'Hall of Fame', emoji: '🏟️', color: 'from-yellow-400 to-amber-500', textColor: 'text-yellow-300' };
  if (totalParties >= 25) return { tier: 'Championship', emoji: '🏆', color: 'from-purple-400 to-pink-500', textColor: 'text-purple-300' };
  if (totalParties >= 10) return { tier: 'All-Star Venue', emoji: '⭐', color: 'from-cyan-400 to-blue-500', textColor: 'text-cyan-300' };
  if (totalParties >= 5) return { tier: 'Rising Spot', emoji: '📈', color: 'from-orange-400 to-red-500', textColor: 'text-orange-300' };
  if (totalParties >= 1) return { tier: 'Game Day Ready', emoji: '🍺', color: 'from-green-400 to-emerald-500', textColor: 'text-green-300' };
  return { tier: 'New Venue', emoji: '🏠', color: 'from-gray-400 to-gray-500', textColor: 'text-gray-300' };
};

const BadgeDisplay = ({ attended, hosted, size = 'sm' }) => {
  const badge = getFanBadge(attended, hosted);
  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl shadow-lg`}>
          {badge.emoji}
        </div>
        <div className="text-center">
          <div className={`font-black text-lg ${badge.textColor}`}>{badge.tier}</div>
          <div className="text-gray-400 text-xs mt-1">
            {attended} attended &middot; {hosted} hosted
          </div>
        </div>
      </div>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.bg} ${badge.textColor}`}>
      {badge.emoji} {badge.tier}
    </span>
  );
};

const VenueBadgeDisplay = ({ totalParties, totalFans }) => {
  const badge = getVenueBadge(totalParties, totalFans);
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${badge.color} text-white`}>
        {badge.emoji} {badge.tier}
      </span>
      {totalParties > 0 && (
        <span className="text-gray-400 text-xs">{totalParties} parties &middot; {totalFans} fans</span>
      )}
    </div>
  );
};

const DebouncedInput = React.memo(({ value, onChange, delay = 300, ...props }) => {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChangeRef.current(newVal);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return <input {...props} value={localValue} onChange={handleChange} />;
});

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [editName, setEditName] = useState(user.name || '');
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editPhone, setEditPhone] = useState(user.phoneNumber || '');
  const [editCity, setEditCity] = useState(user.userCity || '');
  const [editDob, setEditDob] = useState(user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
  const [ageConfirmed, setAgeConfirmed] = useState(!!user.dateOfBirth);
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const emailChanged = editEmail.trim().toLowerCase() !== (user.email || '').toLowerCase();

  const calcAge = (dobStr) => {
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!editName.trim()) { setError('Name is required'); return; }
    if (!editEmail.trim() || !editEmail.includes('@')) { setError('Valid email is required'); return; }
    if (emailChanged && !currentPassword) { setError('Enter your current password to change email'); return; }
    if (editDob && !ageConfirmed) { setError('You must confirm you are 21 years of age or older'); return; }
    if (editDob && calcAge(editDob) < 21) { setError('You must be 21 years of age or older'); return; }
    setSaving(true);
    try {
      const data = {
        name: editName.trim(),
        email: editEmail.trim(),
      };
      if (emailChanged) data.currentPassword = currentPassword;
      if (editPhone.trim()) data.phoneNumber = editPhone.trim();
      else data.phoneNumber = '';
      if (editCity.trim()) data.userCity = editCity.trim();
      else data.userCity = '';
      if (editDob) {
        data.dateOfBirth = editDob;
        data.ageConfirmed = ageConfirmed;
      }
      await onSave(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto overscroll-contain" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <Pencil className="inline w-5 h-5 mr-2 text-cyan-400" />
            EDIT PROFILE
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {emailChanged && (
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">Current Password (required to change email)</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-3 bg-slate-700 border border-amber-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Your City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={e => setEditCity(e.target.value)}
                  placeholder="e.g., Miami, FL"
                  className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={editDob}
                onChange={e => setEditDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {editDob && (
                <p className="text-gray-400 text-sm mt-1">Age: {calcAge(editDob)}</p>
              )}
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={e => setAgeConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-2 border-amber-500/50 bg-slate-700 text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <div>
                  <span className="text-amber-300 font-bold text-sm">Age Verification Disclaimer</span>
                  <p className="text-amber-200/70 text-xs mt-1">
                    I confirm that I am 21 years of age or older. I understand that Huddle Up watch parties may take place at venues that serve alcohol, and I meet the legal age requirement to attend such establishments.
                  </p>
                </div>
              </label>
            </div>
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VenueQrSection = ({ userVenue }) => {
  const [qrData, setQrData] = useState(null);
  const [venueStats, setVenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadQrData();
  }, []);

  const loadQrData = async () => {
    try {
      const [qr, stats] = await Promise.all([
        api.qr.getVenueQr(),
        api.qr.venueStats()
      ]);
      setQrData(qr);
      setVenueStats(stats);
    } catch (e) {
      console.error('Load QR data error:', e);
    }
    setLoading(false);
  };

  const generateQr = async () => {
    setGenerating(true);
    try {
      const result = await api.qr.generateQr();
      setQrData({ hasQr: true, ...result });
    } catch (e) {
      alert(e.message || 'Failed to generate QR code');
    }
    setGenerating(false);
  };

  const copyCheckinLink = async () => {
    if (qrData?.checkinUrl) {
      try {
        await navigator.clipboard.writeText(qrData.checkinUrl);
        alert('Check-in link copied!');
      } catch (e) {}
    }
  };

  const downloadQr = () => {
    if (!qrData?.qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${userVenue.name.replace(/\s+/g, '_')}_QR_Code.png`;
    link.href = qrData.qrDataUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 p-6 rounded-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          <CheckCircle className="inline w-6 h-6 mr-2 text-amber-400" />
          QR CODE CHECK-IN
        </h2>
        {qrData?.hasQr && (
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-1.5 bg-white/10 text-amber-300 text-sm font-bold rounded-lg hover:bg-white/20 transition-all border border-amber-500/30"
          >
            {showStats ? 'Show QR Code' : 'View Turnout Stats'}
          </button>
        )}
      </div>

      <p className="text-gray-300 text-sm">
        Generate a unique QR code for your venue. Fans scan it to check in and prove attendance, earning points and the "Verified Attendee" badge.
      </p>

      {!showStats ? (
        <>
          {qrData?.hasQr ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <img src={qrData.qrDataUrl} alt="Venue QR Code" className="w-48 h-48" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="text-white font-bold text-lg">{userVenue.name}</div>
                <p className="text-gray-400 text-sm">
                  Print this QR code and display it at your venue. Fans scan it with their phone camera to check in instantly.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={downloadQr}
                    className="px-4 py-2 bg-amber-500/20 text-amber-300 font-bold rounded-xl hover:bg-amber-500/30 transition-all text-sm border border-amber-500/30">
                    Download QR
                  </button>
                  <button onClick={copyCheckinLink}
                    className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm border border-white/20">
                    Copy Link
                  </button>
                  <button onClick={generateQr} disabled={generating}
                    className="px-4 py-2 bg-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/20 transition-all text-sm border border-white/20">
                    {generating ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Regenerating creates a new code and deactivates the old one.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-amber-400" />
              </div>
              <p className="text-gray-400 mb-4">No QR code generated yet.</p>
              <button onClick={generateQr} disabled={generating}
                className={`px-6 py-3 font-bold rounded-xl transition-all ${
                  generating ? 'bg-gray-500 text-gray-300' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/50'
                }`}>
                {generating ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {venueStats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                  <div className="text-2xl font-black text-white">{venueStats.totalCheckins}</div>
                  <div className="text-xs text-gray-400 mt-1">Total Check-ins</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                  <div className="text-2xl font-black text-green-400">{venueStats.verifiedCheckins}</div>
                  <div className="text-xs text-gray-400 mt-1">QR Verified</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                  <div className="text-2xl font-black text-cyan-400">{venueStats.uniqueVisitors}</div>
                  <div className="text-xs text-gray-400 mt-1">Unique Visitors</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                  <div className="text-2xl font-black text-purple-400">{venueStats.totalParties}</div>
                  <div className="text-xs text-gray-400 mt-1">Total Parties</div>
                </div>
              </div>

              {venueStats.recentCheckins.length > 0 && (
                <div>
                  <h3 className="text-white font-bold mb-3">Recent Check-ins</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {venueStats.recentCheckins.map((ci, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ci.qrVerified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {ci.qrVerified ? <CheckCircle className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-white text-sm font-bold">{ci.userName}</div>
                            {ci.gameTitle && <div className="text-gray-400 text-xs">{ci.gameTitle}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ci.qrVerified && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-bold rounded-full">VERIFIED</span>
                          )}
                          <span className="text-gray-500 text-xs">{new Date(ci.checkedInAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const SubscriptionSection = () => {
  const [products, setProducts] = useState([]);
  const [subInfo, setSubInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, sub] = await Promise.all([
          api.stripe.products(),
          api.stripe.subscription()
        ]);
        setProducts(prods);
        setSubInfo(sub);
      } catch (err) {
        console.error('Load subscription info:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCheckout = async (priceId, tier) => {
    setCheckoutLoading(tier);
    try {
      const { url } = await api.stripe.checkout(priceId);
      if (url) window.location.href = url;
    } catch (err) {
      alert('Could not start checkout: ' + err.message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    try {
      const { url } = await api.stripe.portal();
      if (url) window.location.href = url;
    } catch (err) {
      alert('Could not open billing: ' + err.message);
    }
  };

  const tierConfig = {
    fan: { icon: '\u{1F3DF}\u{FE0F}', color: 'cyan', label: 'Fan', features: ['Join unlimited watch parties', 'Fan Finder access', 'My Crew features', 'Live scores & alerts'] },
    venue: { icon: '\u{1F3EA}', color: 'green', label: 'Venue Owner', features: ['Claim & manage your venue', 'Upload photos & logo', 'Appear in search results', 'Analytics dashboard'] },
    sponsor: { icon: '\u{1F4E2}', color: 'orange', label: 'Sponsor', features: ['Premium banner ads', 'All sports coverage', 'Featured placement', 'Reach analytics'] },
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  const currentTier = subInfo?.tier || 'free';

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        <DollarSign className="inline w-6 h-6 mr-2 text-yellow-400" />
        MEMBERSHIP
      </h2>
      {currentTier !== 'free' && (
        <div className="mb-4 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-green-300 font-bold text-sm">Active: {tierConfig[currentTier]?.label || currentTier} Plan</span>
              <p className="text-green-400/70 text-xs mt-0.5">Your subscription is active</p>
            </div>
            <button
              onClick={handlePortal}
              className="px-3 py-1.5 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              Manage Billing
            </button>
          </div>
        </div>
      )}
      <div className="grid gap-3">
        {products.sort((a, b) => {
          const orderA = parseInt(a.metadata?.order || '99');
          const orderB = parseInt(b.metadata?.order || '99');
          return orderA - orderB;
        }).map(product => {
          const tier = product.metadata?.tier || 'fan';
          const config = tierConfig[tier] || tierConfig.fan;
          const price = product.prices?.[0];
          const isCurrentPlan = currentTier === tier;

          return (
            <div key={product.id} className={`p-4 rounded-xl border ${isCurrentPlan ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="text-white font-bold">{product.name}</div>
                    {price && (
                      <div className="text-sm text-gray-400">
                        ${(price.unitAmount / 100).toFixed(2)}/month
                      </div>
                    )}
                  </div>
                </div>
                {isCurrentPlan ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">
                    CURRENT
                  </span>
                ) : price ? (
                  <button
                    onClick={() => handleCheckout(price.id, tier)}
                    disabled={checkoutLoading === tier}
                    className={`px-4 py-2 bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50`}
                  >
                    {checkoutLoading === tier ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
                  </button>
                ) : null}
              </div>
              <ul className="space-y-1 mt-2">
                {config.features.map((f, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-green-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {products.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">Subscription plans coming soon!</p>
        )}
      </div>
    </div>
  );
};

const ReferralSection = ({ user }) => {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [codeRes, statsRes] = await Promise.all([
          api.referrals.myCode(),
          api.referrals.stats()
        ]);
        setReferralData({ ...codeRes, ...statsRes });
      } catch (err) {
        console.error('Load referral data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = referralData.referralCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = async () => {
    if (!applyCode.trim()) return;
    try {
      const result = await api.referrals.apply(applyCode.trim());
      setApplyMessage(result.message || 'Code applied!');
      setApplyCode('');
    } catch (err) {
      setApplyMessage(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-900/30 to-slate-900 p-6 rounded-2xl border border-orange-500/20 shadow-xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-900/30 to-slate-900 p-6 rounded-2xl border border-orange-500/20 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        <Link className="inline w-6 h-6 mr-2 text-orange-400" />
        AFFILIATE PROGRAM
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Share your code and earn 10% commission on every subscription from your referrals!
      </p>

      {referralData?.referralCode && (
        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-xs text-gray-400 mb-1 font-bold">YOUR REFERRAL CODE</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xl font-black text-orange-400 tracking-widest">{referralData.referralCode}</code>
            <button
              onClick={copyCode}
              className="px-3 py-1.5 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors text-sm font-bold flex items-center gap-1"
            >
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Link className="w-4 h-4" /> Copy</>}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/5 p-3 rounded-xl text-center">
          <div className="text-2xl font-black text-white">{referralData?.totalReferrals || 0}</div>
          <div className="text-[10px] text-gray-400 font-bold">REFERRALS</div>
        </div>
        <div className="bg-white/5 p-3 rounded-xl text-center">
          <div className="text-2xl font-black text-green-400">{referralData?.conversions || 0}</div>
          <div className="text-[10px] text-gray-400 font-bold">CONVERSIONS</div>
        </div>
        <div className="bg-white/5 p-3 rounded-xl text-center">
          <div className="text-2xl font-black text-yellow-400">${(referralData?.totalEarnings || 0).toFixed(2)}</div>
          <div className="text-[10px] text-gray-400 font-bold">EARNINGS</div>
        </div>
      </div>

      {!user?.referred_by && (
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="text-xs text-gray-400 mb-2 font-bold">HAVE A REFERRAL CODE?</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={applyCode}
              onChange={e => setApplyCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., HU-ABCD1234)"
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Apply
            </button>
          </div>
          {applyMessage && (
            <p className={`text-xs mt-2 ${applyMessage.includes('applied') ? 'text-green-400' : 'text-red-400'}`}>
              {applyMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const SmsFieldsSection = ({ user, setUser }) => {
  const [phone, setPhone] = useState(user.phoneNumber || '');
  const [city, setCity] = useState(user.userCity || '');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);

  useEffect(() => {
    if (!phoneFocused) setPhone(user.phoneNumber || '');
  }, [user.phoneNumber, phoneFocused]);

  useEffect(() => {
    if (!cityFocused) setCity(user.userCity || '');
  }, [user.userCity, cityFocused]);

  const savePhone = async () => {
    const val = phone.trim();
    if (val !== (user.phoneNumber || '')) {
      try {
        await api.users.updateSmsSettings({
          phoneNumber: val,
          userCity: user.userCity,
          smsNotifications: user.smsNotifications
        });
        setUser(prev => ({ ...prev, phoneNumber: val || null }));
      } catch (err) { alert(err.message); }
    }
  };

  const saveCity = async () => {
    const val = city.trim();
    if (val !== (user.userCity || '')) {
      try {
        await api.users.updateSmsSettings({
          phoneNumber: user.phoneNumber,
          userCity: val,
          smsNotifications: user.smsNotifications
        });
        setUser(prev => ({ ...prev, userCity: val || null }));
      } catch (err) { alert(err.message); }
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onFocus={() => setPhoneFocused(true)}
          onBlur={() => { setPhoneFocused(false); savePhone(); }}
          placeholder="+1 (555) 123-4567"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Your City</label>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          onFocus={() => setCityFocused(true)}
          onBlur={() => { setCityFocused(false); saveCity(); }}
          placeholder="e.g., Fort Lauderdale, FL"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );
};

const HuddleUpApp = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [selectedSport, setSelectedSport] = useState('All');
  const [showSportsScrollArrow, setShowSportsScrollArrow] = useState(true);
  const sportsScrollRef = useRef(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [parties, setParties] = useState([]);
  const [userParties, setUserParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false); // Onboarding tutorial
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [myTeamsOnly, setMyTeamsOnly] = useState(false); // Filter by favorite teams
  const [venues, setVenues] = useState(SAMPLE_VENUES);
  const [venueClaims, setVenueClaims] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [games, setGames] = useState(SAMPLE_GAMES);
  const [loadingGames, setLoadingGames] = useState(false);
  
  const [sponsorIndex, setSponsorIndex] = useState(0);
  const [sponsorBanners, setSponsorBanners] = useState([]);
  const [adminSponsors, setAdminSponsors] = useState([]);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(false);
  const [venueEditName, setVenueEditName] = useState('');
  const [venueEditAddress, setVenueEditAddress] = useState('');
  const [venueEditCity, setVenueEditCity] = useState('');
  const [venueEditType, setVenueEditType] = useState('');
  const [venueEditPhone, setVenueEditPhone] = useState('');
  const [venueEditWebsite, setVenueEditWebsite] = useState('');
  const [venueEditCapacity, setVenueEditCapacity] = useState('');
  const [venueEditDescription, setVenueEditDescription] = useState('');
  const [savingVenue, setSavingVenue] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorContactName, setSponsorContactName] = useState('');
  const [sponsorContactEmail, setSponsorContactEmail] = useState('');
  const [sponsorContactPhone, setSponsorContactPhone] = useState('');
  const [sponsorWebsite, setSponsorWebsite] = useState('');
  const [sponsorNotes, setSponsorNotes] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState('');
  const [sponsorFrequency, setSponsorFrequency] = useState('one-time');
  const [sponsorStartDate, setSponsorStartDate] = useState('');
  const [sponsorEndDate, setSponsorEndDate] = useState('');
  const [sponsorStatus, setSponsorStatus] = useState('active');
  const [sponsorLogo, setSponsorLogo] = useState(null);
  const [savingSponsor, setSavingSponsor] = useState(false);
  const [uploadingSponsorLogo, setUploadingSponsorLogo] = useState(false);
  const [adminEditVenue, setAdminEditVenue] = useState(null);
  const [adminEditForm, setAdminEditForm] = useState({});
  const [adminSavingVenue, setAdminSavingVenue] = useState(false);
  const [totalUsers, setTotalUsersCount] = useState(0);
  const [adminTab, setAdminTab] = useState('analytics');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [qrCheckinToken, setQrCheckinToken] = useState(null);
  const [adminQrModal, setAdminQrModal] = useState(null);
  const [editPartyModal, setEditPartyModal] = useState(null);
  const [editPartyForm, setEditPartyForm] = useState({ venueName: '', streetAddress: '', city: '', state: '', notes: '', maxSize: '', gameTime: '' });
  const [editPartySaving, setEditPartySaving] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [fanSearchSport, setFanSearchSport] = useState('');
  const [fanSearchTeam, setFanSearchTeam] = useState('');
  const [fanResults, setFanResults] = useState([]);
  const [fanSearchLoading, setFanSearchLoading] = useState(false);
  const [invitePartyId, setInvitePartyId] = useState(null);
  const [inviteSending, setInviteSending] = useState({});
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState({});
  const [crewTab, setCrewTab] = useState('friends');
  const [crewInvitePartyId, setCrewInvitePartyId] = useState(null);
  const [badgeStats, setBadgeStats] = useState({ partiesHosted: 0, partiesAttended: 0 });
  const [showShareToast, setShowShareToast] = useState(false);
  const [showSignupShare, setShowSignupShare] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [watchedGames, setWatchedGames] = useState([]);
  const [pushSubscription, setPushSubscription] = useState(null);
  const [openChatPartyId, setOpenChatPartyId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatTrashTalk, setChatTrashTalk] = useState(false);
  const chatEndRef = useRef(null);
  const chatPollRef = useRef(null);
  const [openPhotoPartyId, setOpenPhotoPartyId] = useState(null);
  const [partyPhotos, setPartyPhotos] = useState([]);
  const [checkedInParties, setCheckedInParties] = useState({});
  const [rewardsBalance, setRewardsBalance] = useState({ totalPoints: 0, lifetimePoints: 0 });
  const [rewardsHistory, setRewardsHistory] = useState([]);
  const [rewardsCatalog, setRewardsCatalog] = useState([]);
  const [rewardsRedemptions, setRewardsRedemptions] = useState([]);
  const [rewardsTab, setRewardsTab] = useState('earn');
  const [redeemingReward, setRedeemingReward] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [tagMenuPhotoId, setTagMenuPhotoId] = useState(null);
  const photoInputRef = useRef(null);

  const [fantasyLeagues, setFantasyLeagues] = useState([]);
  const [fantasySelectedLeague, setFantasySelectedLeague] = useState(null);
  const [fantasyTab, setFantasyTab] = useState('leagues');
  const [showCreateLeague, setShowCreateLeague] = useState(false);
  const [showJoinLeague, setShowJoinLeague] = useState(false);
  const [fantasyNewLeague, setFantasyNewLeague] = useState({ name: '', platform: 'espn', sport: 'NFL', season: '2025-26', teamName: '' });
  const [fantasyJoinCode, setFantasyJoinCode] = useState('');
  const [fantasyJoinTeamName, setFantasyJoinTeamName] = useState('');
  const [fantasyAddPlayerForm, setFantasyAddPlayerForm] = useState({ playerName: '', position: 'QB', nflTeam: '', isStarter: true });
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [fantasyLoading, setFantasyLoading] = useState(false);

  const shareApp = async () => {
    const shareUrl = window.location.origin;
    const shareData = { title: 'Huddle Up', text: 'Find your crew. Watch the game. Join me on Huddle Up!', url: shareUrl };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareUrl}`);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (e) {}
    }
  };

  const setupPushNotifications = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      const reg = await navigator.serviceWorker.register('/sw.js');
      const { publicKey } = await api.push.getVapidKey();
      if (!publicKey) return;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setPushSubscription(existing);
        setPushEnabled(true);
        await api.push.subscribe(existing.toJSON());
        return existing;
      }
      return reg;
    } catch (err) {
      console.error('Push setup error:', err);
    }
  }, []);

  const enablePush = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push notifications are not supported in this browser');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const { publicKey } = await api.push.getVapidKey();
      if (!publicKey) { alert('Push notifications not configured'); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });
      await api.push.subscribe(sub.toJSON());
      setPushSubscription(sub);
      setPushEnabled(true);
    } catch (err) {
      console.error('Enable push error:', err);
      if (err.name === 'NotAllowedError') {
        alert('Please allow notifications in your browser settings');
      }
    }
  }, []);

  const disablePush = useCallback(async () => {
    try {
      if (pushSubscription) {
        await api.push.unsubscribe(pushSubscription.endpoint);
        await pushSubscription.unsubscribe();
      }
      setPushSubscription(null);
      setPushEnabled(false);
      setWatchedGames([]);
    } catch (err) {
      console.error('Disable push error:', err);
    }
  }, [pushSubscription]);

  const toggleWatchGame = useCallback(async (game) => {
    if (!pushEnabled) {
      await enablePush();
    }
    const gameId = game.id || game.gameId;
    if (watchedGames.includes(gameId)) {
      await api.push.unwatchGame(gameId);
      setWatchedGames(prev => prev.filter(id => id !== gameId));
    } else {
      await api.push.watchGame({
        gameId,
        sport: game.sport,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam
      });
      setWatchedGames(prev => [...prev, gameId]);
      if (!pushEnabled) {
        await enablePush();
      }
    }
  }, [pushEnabled, watchedGames, enablePush]);

  const isAdmin = user?.isAdmin || user?.email === 'admin@huddleupusa.com';
  const userVenue = user ? venues.find(v => v.claimedBy === user.email) : null;
  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const totalAlerts = pendingInvitations.length + unreadNotifications.length;

  const loadGames = async () => {
    try {
      const liveGames = await api.games.list();
      if (liveGames && liveGames.length > 0) {
        setGames(liveGames);
      } else {
        setGames(SAMPLE_GAMES);
      }
    } catch (error) {
      console.log('Failed to fetch live games, using sample data');
      setGames(SAMPLE_GAMES);
    }
  };

  const loadSponsors = useCallback(async () => {
    try {
      const data = await api.sponsors.list();
      setAdminSponsors(data);
    } catch (err) {
      console.error('Failed to load sponsors:', err);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [overview, userGrowth, partyTrends, topSports, topCities, topTeams, venuePerf, engagement, recentActivity, userCities, hourlyActivity] = await Promise.all([
        api.analytics.overview(),
        api.analytics.userGrowth(90),
        api.analytics.partyTrends(90),
        api.analytics.topSports(),
        api.analytics.topCities(),
        api.analytics.topTeams(),
        api.analytics.venuePerformance(),
        api.analytics.engagement(),
        api.analytics.recentActivity(),
        api.analytics.userCities(),
        api.analytics.hourlyActivity(),
      ]);
      setAnalyticsData({ overview, userGrowth, partyTrends, topSports, topCities, topTeams, venuePerf, engagement, recentActivity, userCities, hourlyActivity });
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
    setAnalyticsLoading(false);
  }, []);

  useEffect(() => {
    if (currentScreen === 'admin' && user?.isAdmin) {
      loadSponsors();
      loadAnalytics();
      api.users.stats().then(s => setTotalUsersCount(s.totalUsers)).catch(() => {});
    }
    if (currentScreen === 'rewards' && user) {
      loadRewards();
    }
    if (currentScreen === 'fantasy' && user) {
      loadFantasyLeagues();
    }
  }, [currentScreen, user?.isAdmin, loadSponsors]);

  const resetSponsorForm = () => {
    setSponsorName(''); setSponsorContactName(''); setSponsorContactEmail('');
    setSponsorContactPhone(''); setSponsorWebsite(''); setSponsorNotes('');
    setSponsorAmount(''); setSponsorFrequency('one-time'); setSponsorStartDate('');
    setSponsorEndDate(''); setSponsorStatus('active'); setSponsorLogo(null);
    setEditingSponsor(null); setShowSponsorForm(false);
  };

  const startEditSponsor = (s) => {
    setSponsorName(s.name || ''); setSponsorContactName(s.contactName || '');
    setSponsorContactEmail(s.contactEmail || ''); setSponsorContactPhone(s.contactPhone || '');
    setSponsorWebsite(s.website || ''); setSponsorNotes(s.notes || '');
    setSponsorAmount(s.amountPaid ? String(s.amountPaid) : '');
    setSponsorFrequency(s.paymentFrequency || 'one-time');
    setSponsorStartDate(s.startDate ? s.startDate.split('T')[0] : '');
    setSponsorEndDate(s.endDate ? s.endDate.split('T')[0] : '');
    setSponsorStatus(s.status || 'active'); setSponsorLogo(s.logo || null);
    setEditingSponsor(s.id); setShowSponsorForm(true);
  };

  const handleSponsorLogoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
      setUploadingSponsorLogo(true);
      try {
        const fileBuffer = await file.arrayBuffer();
        const uploadRes = await fetch('/api/uploads/venue-image/upload', {
          method: 'POST',
          headers: { 'Content-Type': file.type, 'x-image-type': 'sponsor-logo' },
          credentials: 'include',
          body: fileBuffer,
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Upload failed');
        }
        const { objectPath } = await uploadRes.json();
        setSponsorLogo(objectPath);
      } catch (err) { alert('Failed to upload logo: ' + err.message); }
      setUploadingSponsorLogo(false);
    };
    input.click();
  };

  const saveSponsor = async () => {
    if (!sponsorName) { alert('Sponsor name is required'); return; }
    setSavingSponsor(true);
    try {
      const data = {
        name: sponsorName, contactName: sponsorContactName, contactEmail: sponsorContactEmail,
        contactPhone: sponsorContactPhone, logo: sponsorLogo, website: sponsorWebsite,
        notes: sponsorNotes, amountPaid: sponsorAmount ? parseFloat(sponsorAmount) : 0,
        paymentFrequency: sponsorFrequency, startDate: sponsorStartDate || null,
        endDate: sponsorEndDate || null, status: sponsorStatus
      };
      if (editingSponsor) { await api.sponsors.update(editingSponsor, data); }
      else { await api.sponsors.create(data); }
      await loadSponsors(); resetSponsorForm();
    } catch (err) { alert('Failed to save sponsor: ' + err.message); }
    setSavingSponsor(false);
  };

  const deleteSponsor = async (id) => {
    if (!confirm('Are you sure you want to remove this sponsor?')) return;
    try { await api.sponsors.delete(id); await loadSponsors(); }
    catch (err) { alert('Failed to delete sponsor: ' + err.message); }
  };

  const totalSponsorRevenue = adminSponsors.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
  const activeSponsors = adminSponsors.filter(s => s.status === 'active');

  const formScreens = ['welcome', 'login', 'signup', 'forgotPassword', 'claimVenue', 'createParty'];
  const pauseScreens = ['profile', 'rewards', 'fans', 'friends', 'notifications', 'admin', 'qrCheckin', 'myParties', 'myCrew', 'fanFinder', 'invitations', 'venueDashboard', 'sponsorDashboard', ...formScreens];
  const isFormScreen = formScreens.includes(currentScreen);
  const isPauseScreen = pauseScreens.includes(currentScreen);

  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, {
            headers: { 'User-Agent': 'HuddleUp/1.0' }
          });
          if (!resp.ok) throw new Error('Geocoding failed');
          const data = await resp.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const state = addr.state || '';
          const US_STATE_ABBR = { 'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA','Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA','Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY' };
          const stateAbbr = US_STATE_ABBR[state] || (state.length <= 2 ? state : '');
          if (city) {
            const cityStr = stateAbbr ? `${city}, ${stateAbbr}` : city;
            setCurrentCity(cityStr);
            setLocationDetected(true);
          }
        } catch (e) {
          console.log('Reverse geocoding failed:', e);
        }
        setLocationLoading(false);
      },
      (err) => {
        console.log('Geolocation denied or unavailable:', err.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    loadUserData();
    loadParties();
    loadVenues();
    loadGames();
    detectUserLocation();
    api.sponsors.banners().then(b => setSponsorBanners(b || [])).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setTimeout(async () => {
        try {
          await api.stripe.syncSubscription();
        } catch (e) { console.error('Sync subscription:', e); }
      }, 2000);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('checkout') === 'cancel') {
      window.history.replaceState({}, '', window.location.pathname);
    }

    const checkinMatch = window.location.pathname.match(/^\/checkin\/(.+)$/);
    if (checkinMatch) {
      setQrCheckinToken(checkinMatch[1]);
      setCurrentScreen('qrCheckin');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user?.id]);

  useEffect(() => {
    if (isPauseScreen) return;
    const gamesInterval = setInterval(loadGames, 60000);
    return () => clearInterval(gamesInterval);
  }, [isPauseScreen]);

  const getSponsorsForSport = useCallback((sport) => {
    const standardForSport = sponsorBanners.filter(s =>
      s.tier !== 'premium' && s.targetSports?.includes(sport)
    );
    const premiumForSport = sponsorBanners.filter(s =>
      s.tier === 'premium' && (s.targetSports?.includes(sport) || s.targetSports?.length === 0)
    );

    const demoForSport = DEMO_SPONSORS.filter(d => d.sport === sport);
    const totalSlots = 5;
    const slots = Array(totalSlots).fill(null);

    standardForSport.slice(0, 4).forEach((s, i) => {
      slots[i] = {
        name: s.name,
        tagline: s.tagline || 'Official Huddle Up Sponsor',
        icon: null,
        logoUrl: s.logo ? `/api/uploads/serve/${s.logo.replace('/objects/', '')}` : null,
        ...SLOT_STYLES[i % SLOT_STYLES.length],
        url: s.url || null,
        isReal: true,
        tier: 'standard',
        slotNum: i + 1,
      };
    });

    if (premiumForSport.length > 0) {
      const p = premiumForSport[0];
      slots[4] = {
        name: p.name,
        tagline: p.tagline || 'Official Huddle Up Sponsor',
        icon: null,
        logoUrl: p.logo ? `/api/uploads/serve/${p.logo.replace('/objects/', '')}` : null,
        ...SLOT_STYLES[4 % SLOT_STYLES.length],
        url: p.url || null,
        isReal: true,
        tier: 'premium',
        slotNum: 5,
      };
    }

    for (let i = 0; i < totalSlots; i++) {
      if (!slots[i]) {
        const demo = demoForSport.find(d => d.slot === i + 1);
        if (demo) {
          slots[i] = {
            name: demo.name,
            tagline: demo.tagline,
            icon: null,
            logoUrl: demo.demoLogo,
            ...SLOT_STYLES[i % SLOT_STYLES.length],
            url: demo.url,
            isDemo: true,
            tier: demo.tier || 'standard',
            slotNum: demo.slot,
          };
        }
      }
    }

    for (let i = 0; i < totalSlots; i++) {
      if (!slots[i]) {
        slots[i] = {
          name: `${sport === 'All' ? '' : sport + ' '}Sponsor Slot ${i + 1}`,
          tagline: 'Become a sponsor today',
          icon: SPORT_ICONS[sport] || '📢',
          logoUrl: null,
          ...SLOT_STYLES[i % SLOT_STYLES.length],
          url: null,
          isEmpty: true,
          tier: i === 4 ? 'premium' : 'standard',
          slotNum: i + 1,
        };
      }
    }

    return slots;
  }, [sponsorBanners]);

  useEffect(() => {
    if (isPauseScreen) return;
    const sponsors = getSponsorsForSport(selectedSport);
    if (sponsors.length > 1) {
      setSponsorIndex(0);
      const interval = setInterval(() => {
        setSponsorIndex(prev => (prev + 1) % sponsors.length);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setSponsorIndex(0);
    }
  }, [selectedSport, isPauseScreen, getSponsorsForSport]);

  const loadUserData = async () => {
    try {
      const userData = await api.auth.me();
      if (userData) {
        setUser(userData);
        setCurrentScreen(prev => {
          const authScreens = ['welcome', 'login', 'signup', 'forgotPassword'];
          if (qrCheckinToken) return 'qrCheckin';
          return authScreens.includes(prev) ? 'games' : prev;
        });
        loadUserParties();
        loadVenueClaims();
        loadInvitations();
        loadNotifications();
        loadBadgeStats();
        setupPushNotifications();
        api.push.watchedGames().then(ids => setWatchedGames(ids || [])).catch(() => {});
      }
    } catch (error) {
      console.log('No saved user');
    }
  };

  const loadParties = async () => {
    try {
      const data = await api.parties.list();
      setParties(data);
    } catch (error) {
      console.log('No parties yet');
      setParties([]);
    }
  };

  const loadVenues = async () => {
    try {
      const data = await api.venues.list();
      setVenues(data);
    } catch (error) {
      console.log('Initializing venues');
      setVenues(SAMPLE_VENUES);
    }
  };

  const loadVenueClaims = async () => {
    try {
      const data = await api.venues.claims();
      setVenueClaims(data);
    } catch (error) {
      setVenueClaims([]);
    }
  };

  const loadUserParties = async () => {
    try {
      const data = await api.parties.mine();
      setUserParties(data);
    } catch (error) {
      setUserParties([]);
    }
  };

  const handleSignUp = async (email, password, name, gender, dateOfBirth, rememberMe = true, referralCode = '') => {
    try {
      const userData = await api.auth.signup(email, password, name, gender, dateOfBirth, rememberMe, referralCode);
      setUser(userData);
      setShowOnboarding(true);
      setOnboardingStep(0);
      setShowSignupShare(true);
      setCurrentScreen('games');
      loadParties();
      loadVenues();
      loadVenueClaims();
      loadInvitations();
      loadNotifications();
      loadBadgeStats();
      loadFriends();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async (email, password, rememberMe = true) => {
    try {
      const userData = await api.auth.login(email, password, rememberMe);
      setUser(userData);
      loadUserParties();
      loadParties();
      loadVenues();
      loadVenueClaims();
      loadInvitations();
      loadNotifications();
      loadBadgeStats();
      loadFriends();
      setCurrentScreen('games');
    } catch (error) {
      alert(error.message);
    }
  };

  const updateFavoriteTeams = async (sport, team) => {
    try {
      const result = await api.users.updateFavorite(sport, team);
      setUser(prev => ({ ...prev, favoriteTeams: result.favoriteTeams }));
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  const removeFavoriteTeam = async (sport) => {
    try {
      const result = await api.users.removeFavorite(sport);
      setUser(prev => ({ ...prev, favoriteTeams: result.favoriteTeams }));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      const data = await api.fans.invitations();
      setInvitations(data);
    } catch (error) {
      setInvitations([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (error) {
      setNotifications([]);
    }
  };

  const loadBadgeStats = async () => {
    try {
      const data = await api.users.badge();
      setBadgeStats(data);
    } catch (error) {
      setBadgeStats({ partiesHosted: 0, partiesAttended: 0 });
    }
  };

  const toggleNotifications = async () => {
    const newVal = !user.notificationsEnabled;
    try {
      await api.notifications.updateSettings(newVal);
      setUser(prev => ({ ...prev, notificationsEnabled: newVal }));
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const loadFriends = async () => {
    if (!user) return;
    try {
      const [friends, requests] = await Promise.all([
        api.friends.list(),
        api.friends.requests()
      ]);
      setFriendsList(friends);
      setFriendRequests(requests);
    } catch (e) {
      console.log('Friends load error:', e);
    }
  };

  const loadRewards = async () => {
    if (!user) return;
    try {
      const [balance, history, catalog, redemptions] = await Promise.all([
        api.rewards.balance(),
        api.rewards.history(),
        api.rewards.catalog(),
        api.rewards.redemptions(),
      ]);
      setRewardsBalance(balance);
      setRewardsHistory(history);
      setRewardsCatalog(catalog);
      setRewardsRedemptions(redemptions);
    } catch (e) {
      console.log('Rewards load error:', e);
    }
  };

  const handleCheckin = async (partyId) => {
    try {
      const result = await api.rewards.checkin(partyId);
      setCheckedInParties(prev => ({ ...prev, [partyId]: true }));
      alert(`Checked in! You earned ${result.pointsEarned} points!`);
      loadRewards();
    } catch (e) {
      if (e.message?.includes('already checked in')) {
        setCheckedInParties(prev => ({ ...prev, [partyId]: true }));
      }
      alert(e.message || 'Check-in failed');
    }
  };

  const handleRedeemReward = async (rewardId) => {
    setRedeemingReward(rewardId);
    try {
      const result = await api.rewards.redeem(rewardId);
      alert(`Redeemed: ${result.reward.name}! You now have ${result.totalPoints} points.`);
      loadRewards();
    } catch (e) {
      alert(e.message || 'Redemption failed');
    } finally {
      setRedeemingReward(null);
    }
  };

  const loadFantasyLeagues = async () => {
    if (!user) return;
    try {
      const leagues = await api.fantasy.leagues();
      setFantasyLeagues(leagues);
    } catch (e) {
      console.log('Fantasy load error:', e);
    }
  };

  const loadFantasyLeague = async (id) => {
    try {
      setFantasyLoading(true);
      const league = await api.fantasy.getLeague(id);
      setFantasySelectedLeague(league);
    } catch (e) {
      alert(e.message || 'Failed to load league');
    } finally {
      setFantasyLoading(false);
    }
  };

  const handleCreateFantasyLeague = async () => {
    if (!fantasyNewLeague.name || !fantasyNewLeague.teamName) {
      alert('Please enter a league name and your team name');
      return;
    }
    try {
      setFantasyLoading(true);
      await api.fantasy.createLeague(fantasyNewLeague);
      setShowCreateLeague(false);
      setFantasyNewLeague({ name: '', platform: 'espn', sport: 'NFL', season: '2025-26', teamName: '' });
      await loadFantasyLeagues();
    } catch (e) {
      alert(e.message || 'Failed to create league');
    } finally {
      setFantasyLoading(false);
    }
  };

  const handleJoinFantasyByCode = async () => {
    if (!fantasyJoinCode || !fantasyJoinTeamName) {
      alert('Please enter an invite code and your team name');
      return;
    }
    try {
      setFantasyLoading(true);
      await api.fantasy.joinByCode({ inviteCode: fantasyJoinCode, teamName: fantasyJoinTeamName });
      setShowJoinLeague(false);
      setFantasyJoinCode('');
      setFantasyJoinTeamName('');
      await loadFantasyLeagues();
    } catch (e) {
      alert(e.message || 'Failed to join league');
    } finally {
      setFantasyLoading(false);
    }
  };

  const handleAddFantasyPlayer = async (teamId) => {
    if (!fantasyAddPlayerForm.playerName) {
      alert('Player name is required');
      return;
    }
    try {
      await api.fantasy.addPlayer(teamId, fantasyAddPlayerForm);
      setFantasyAddPlayerForm({ playerName: '', position: 'QB', nflTeam: '', isStarter: true });
      setShowAddPlayer(false);
      if (fantasySelectedLeague) await loadFantasyLeague(fantasySelectedLeague.id);
    } catch (e) {
      alert(e.message || 'Failed to add player');
    }
  };

  const handleRemoveFantasyPlayer = async (playerId) => {
    try {
      await api.fantasy.removePlayer(playerId);
      if (fantasySelectedLeague) await loadFantasyLeague(fantasySelectedLeague.id);
    } catch (e) {
      alert(e.message || 'Failed to remove player');
    }
  };

  const handleDeleteFantasyLeague = async (leagueId) => {
    if (!confirm('Delete this fantasy league? This cannot be undone.')) return;
    try {
      await api.fantasy.deleteLeague(leagueId);
      setFantasySelectedLeague(null);
      await loadFantasyLeagues();
    } catch (e) {
      alert(e.message || 'Failed to delete league');
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await api.friends.sendRequest(userId);
      setFriendStatuses(prev => ({ ...prev, [userId]: 'sent' }));
      alert('Friend request sent!');
    } catch (e) {
      alert(e.message || 'Failed to send request');
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await api.friends.accept(requestId);
      await loadFriends();
    } catch (e) {
      alert('Failed to accept');
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      await api.friends.decline(requestId);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (e) {
      alert('Failed to decline');
    }
  };

  const removeFriend = async (friendId) => {
    if (!confirm('Remove this friend from your crew?')) return;
    try {
      await api.friends.remove(friendId);
      setFriendsList(prev => prev.filter(f => f.id !== friendId));
    } catch (e) {
      alert('Failed to remove');
    }
  };

  const searchFans = async () => {
    if (!fanSearchSport || !fanSearchTeam) return;
    setFanSearchLoading(true);
    try {
      const data = await api.fans.byTeam(fanSearchSport, fanSearchTeam);
      setFanResults(data);
    } catch (error) {
      console.error('Fan search error:', error);
      setFanResults([]);
    } finally {
      setFanSearchLoading(false);
    }
  };

  const handleInviteFan = async (toUserId, partyId) => {
    setInviteSending(prev => ({ ...prev, [`${toUserId}-${partyId}`]: true }));
    try {
      await api.fans.invite(partyId, toUserId);
      setInviteSending(prev => ({ ...prev, [`${toUserId}-${partyId}`]: 'sent' }));
    } catch (error) {
      alert(error.message);
      setInviteSending(prev => ({ ...prev, [`${toUserId}-${partyId}`]: false }));
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await api.fans.acceptInvitation(invitationId);
      await loadInvitations();
      await loadParties();
      await loadUserParties();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await api.fans.declineInvitation(invitationId);
      await loadInvitations();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.log('Error logging out');
    }
    setUser(null);
    setUserParties([]);
    setCurrentScreen('welcome');
  };

  const handleCreateParty = async (partyData) => {
    try {
      await api.parties.create(partyData);
      await loadParties();
      await loadUserParties();
      loadNotifications();
      loadBadgeStats();
      setCurrentScreen('gameDetail');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleJoinParty = async (partyId) => {
    try {
      await api.parties.join(partyId);
      await loadParties();
      await loadUserParties();
      loadBadgeStats();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLeaveParty = async (partyId) => {
    try {
      await api.parties.leave(partyId);
      await loadParties();
      await loadUserParties();
      loadBadgeStats();
    } catch (error) {
      alert(error.message);
    }
  };

  const US_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
  ];
  const US_STATE_NAMES = {
    AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',
    DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
    KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',
    MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',
    NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
    OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',
    TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'Washington DC'
  };

  const parseAddressParts = (fullAddress, city) => {
    let streetAddress = '';
    let parsedCity = city || '';
    let parsedState = '';
    if (fullAddress) {
      const parts = fullAddress.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        streetAddress = parts[0];
        parsedCity = parsedCity || parts[1];
        const stateZip = parts[2].trim().split(' ');
        const stateCode = stateZip[0]?.toUpperCase();
        if (US_STATES.includes(stateCode)) parsedState = stateCode;
        else {
          const found = Object.entries(US_STATE_NAMES).find(([, name]) => name.toLowerCase() === parts[2].trim().toLowerCase());
          if (found) parsedState = found[0];
        }
      } else if (parts.length === 2) {
        streetAddress = parts[0];
        parsedCity = parsedCity || parts[1];
      } else {
        streetAddress = fullAddress;
      }
    }
    return { streetAddress, city: parsedCity, state: parsedState };
  };

  const openEditParty = (party) => {
    const parsed = parseAddressParts(party.venueAddress, party.city);
    setEditPartyForm({
      venueName: party.venueName || '',
      streetAddress: parsed.streetAddress,
      city: parsed.city,
      state: parsed.state,
      notes: party.notes || '',
      maxSize: party.maxSize || party.capacity || '',
      gameTime: party.customTime || party.gameTime || ''
    });
    setEditPartyModal(party);
  };

  const handleSaveEditParty = async () => {
    setEditPartySaving(true);
    try {
      const parts = [editPartyForm.streetAddress, editPartyForm.city, editPartyForm.state].filter(Boolean);
      const combinedAddress = parts.join(', ');
      await api.parties.update(editPartyModal.id, {
        venueName: editPartyForm.venueName,
        venueAddress: combinedAddress,
        city: editPartyForm.city,
        notes: editPartyForm.notes,
        maxSize: editPartyForm.maxSize,
        gameTime: editPartyForm.gameTime
      });
      await loadParties();
      setEditPartyModal(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setEditPartySaving(false);
    }
  };

  const openPartyChat = async (partyId) => {
    if (openChatPartyId === partyId) {
      setOpenChatPartyId(null);
      setChatMessages([]);
      if (chatPollRef.current) clearInterval(chatPollRef.current);
      return;
    }
    setOpenChatPartyId(partyId);
    setChatInput('');
    setChatLoading(true);
    try {
      const msgs = await api.chat.getMessages(partyId);
      setChatMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      console.error('Load chat error:', e);
    } finally {
      setChatLoading(false);
    }
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    chatPollRef.current = setInterval(async () => {
      try {
        const msgs = await api.chat.getMessages(partyId);
        setChatMessages(msgs);
      } catch (e) {}
    }, 5000);
  };

  const sendChatMessage = async (partyId) => {
    if (!chatInput.trim() || chatSending) return;
    setChatSending(true);
    try {
      const msg = await api.chat.sendMessage(partyId, chatInput.trim(), chatTrashTalk ? 'fantasy' : 'text');
      setChatMessages(prev => [...prev, msg]);
      setChatInput('');
      setChatTrashTalk(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      alert(e.message);
    } finally {
      setChatSending(false);
    }
  };

  useEffect(() => {
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, []);

  const openPartyPhotos = async (partyId) => {
    if (openPhotoPartyId === partyId) {
      setOpenPhotoPartyId(null);
      setPartyPhotos([]);
      setSelectedPhoto(null);
      setTagMenuPhotoId(null);
      return;
    }
    setOpenPhotoPartyId(partyId);
    setSelectedPhoto(null);
    setTagMenuPhotoId(null);
    try {
      const photos = await api.photos.getPartyPhotos(partyId);
      setPartyPhotos(photos);
    } catch (e) {
      console.error('Load photos error:', e);
    }
  };

  const handlePhotoUpload = async (partyId, file) => {
    if (!file || photoUploading) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be under 10MB');
      return;
    }
    setPhotoUploading(true);
    try {
      const photo = await api.photos.uploadPhoto(partyId, file, photoCaption);
      setPartyPhotos(prev => [photo, ...prev]);
      setPhotoCaption('');
      if (photoInputRef.current) photoInputRef.current.value = '';
    } catch (e) {
      alert('Upload failed: ' + e.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await api.photos.deletePhoto(photoId);
      setPartyPhotos(prev => prev.filter(p => p.id !== photoId));
      if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleTagFriend = async (photoId, taggedUserId) => {
    try {
      const tags = await api.photos.tagPhoto(photoId, taggedUserId);
      setPartyPhotos(prev => prev.map(p => p.id === photoId ? { ...p, tags } : p));
      if (selectedPhoto?.id === photoId) setSelectedPhoto(prev => ({ ...prev, tags }));
      setTagMenuPhotoId(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRemoveTag = async (photoId, taggedUserId) => {
    try {
      await api.photos.removeTag(photoId, taggedUserId);
      setPartyPhotos(prev => prev.map(p => p.id === photoId ? { ...p, tags: p.tags.filter(t => t.userId !== taggedUserId) } : p));
      if (selectedPhoto?.id === photoId) setSelectedPhoto(prev => ({ ...prev, tags: prev.tags.filter(t => t.userId !== taggedUserId) }));
    } catch (e) {
      alert(e.message);
    }
  };

  const sharePhoto = async (photo, party) => {
    const shareText = `Check out this photo from the ${party.title || party.sport} watch party! #HuddleUp`;
    const shareUrl = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Huddle Up Party Photo', text: shareText, url: shareUrl });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('Share text copied to clipboard!');
      } catch (e) {
        alert('Could not share');
      }
    }
  };

  const handleVenueClaim = async (claimData) => {
    try {
      await api.venues.submitClaim(claimData);
      await loadVenueClaims();
      alert('Venue claim submitted! We\'ll review it within 24-48 hours.');
      setCurrentScreen('games');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApproveVenueClaim = async (claimId) => {
    try {
      await api.venues.approveClaim(claimId);
      await loadVenues();
      await loadVenueClaims();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRejectVenueClaim = async (claimId) => {
    try {
      await api.venues.rejectClaim(claimId);
      await loadVenueClaims();
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSport = selectedSport === 'All' || game.sport === selectedSport;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = term === '' || 
      game.homeTeam.toLowerCase().includes(term) ||
      game.awayTeam.toLowerCase().includes(term) ||
      game.sport.toLowerCase().includes(term) ||
      (game.venue && game.venue.toLowerCase().includes(term));
    
    const matchesMyTeams = !myTeamsOnly || !user?.favoriteTeams || 
      Object.values(user.favoriteTeams).some(team => 
        game.homeTeam.toLowerCase().includes(team.toLowerCase()) || 
        game.awayTeam.toLowerCase().includes(team.toLowerCase())
      );
    
    return matchesSport && matchesSearch && matchesMyTeams;
  });

  const isCityMatch = (partyCity) => {
    if (!currentCity || !partyCity) return false;
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const userCityName = normalize(currentCity.split(',')[0]);
    const partyCityName = normalize(partyCity.split(',')[0]);
    if (!userCityName || !partyCityName) return false;
    if (userCityName === partyCityName) return true;
    if (userCityName.length >= 4 && partyCityName.length >= 4) {
      if (partyCityName.startsWith(userCityName) || userCityName.startsWith(partyCityName)) return true;
    }
    return false;
  };

  const getPartiesForGame = (gameId) => {
    const gameParties = parties.filter(party => party.gameId === gameId);
    if (!currentCity) return gameParties;
    return gameParties.sort((a, b) => {
      const aMatch = isCityMatch(a.city) ? 1 : 0;
      const bMatch = isCityMatch(b.city) ? 1 : 0;
      return bMatch - aMatch;
    });
  };

  const getMapsUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const AddressLink = ({ address, className = '' }) => (
    <a
      href={getMapsUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className={`hover:text-cyan-300 hover:underline transition-colors inline-block select-all cursor-pointer ${className}`}
      onClick={(e) => e.stopPropagation()}
      style={{ WebkitUserSelect: 'all', userSelect: 'all', wordBreak: 'keep-all' }}
    >
      {address}
    </a>
  );

  const getMapsEmbedUrl = (address) => `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const VenueMap = ({ address, venueName }) => {
    const [expanded, setExpanded] = useState(false);
    if (!address) return null;
    return (
      <div className="mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
        >
          <MapPin className="w-4 h-4" />
          {expanded ? 'Hide Map' : 'Show Map & Directions'}
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className="mt-2 rounded-xl overflow-hidden border border-white/20 shadow-lg">
            <iframe
              src={getMapsEmbedUrl(address)}
              width="100%"
              height="200"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map to ${venueName || address}`}
            />
            <a
              href={getMapsUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Navigation className="w-4 h-4" />
              Get Directions in Google Maps
            </a>
          </div>
        )}
      </div>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // FEATURE 1: ONBOARDING TUTORIAL OVERLAY
  const OnboardingOverlay = () => {
    const steps = [
      { title: "Welcome to Huddle Up! 🎉", description: "Find watch parties for any game, in any city. Let's show you how it works!", icon: "👋" },
      { title: "Tap a Game to Start 🏈", description: "Browse the schedule and tap any game you want to watch. From there, you can create a watch party or join one that already exists!", icon: "📅" },
      { title: "Search Any City 📍", description: "Traveling? Type any city in the location bar to find parties near you. Dallas, Miami, NYC - we've got you covered!", icon: "🌎" },
      { title: "Use the Menu Icons 🧭", description: "Share the app, find fans of your team, check your alerts and invitations, or view your profile and badges - it's all at the top!", icon: "📱" },
      { title: "Level Up Your Badge! 🏆", description: "Every party you join or host earns you badge points. Climb from New Fan all the way to Legend status!", icon: "⭐" },
      { title: "Show Up & Have Fun! 🍻", description: "That's it! Meet new people, watch the game, and enjoy. Ready to find your first party?", icon: "🎯" }
    ];
    
    if (!showOnboarding) return null;
    
    const currentStep = steps[onboardingStep];
    const isLastStep = onboardingStep === steps.length - 1;
    
    const handleNext = () => {
      if (isLastStep) {
        setShowOnboarding(false);
      } else {
        setOnboardingStep(onboardingStep + 1);
      }
    };
    
    const handleSkip = () => {
      setShowOnboarding(false);
    };
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border-2 border-cyan-500/30 shadow-2xl">
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div key={index} className={`h-2 rounded-full transition-all ${index === onboardingStep ? 'w-8 bg-cyan-400' : index < onboardingStep ? 'w-2 bg-cyan-600' : 'w-2 bg-gray-600'}`} />
            ))}
          </div>
          <div className="text-6xl text-center mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-black text-white text-center mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{currentStep.title}</h2>
          <p className="text-gray-300 text-center mb-8 leading-relaxed">{currentStep.description}</p>
          <div className="flex gap-3">
            {!isLastStep && (
              <button onClick={handleSkip} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">
                Skip
              </button>
            )}
            <button onClick={handleNext} className={`${isLastStep ? 'w-full' : 'flex-1'} py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all`}>
              {isLastStep ? "Let's Go! 🚀" : 'Next'}
            </button>
          </div>
          <div className="text-center mt-4 text-sm text-gray-500">Step {onboardingStep + 1} of {steps.length}</div>
        </div>
      </div>
    );
  };

  // FEATURE 4: EMPTY PARTY STATE - When no parties exist for a game
  const EmptyPartyState = ({ gameName, onCreateParty }) => (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-8 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        No Parties Yet - Be The Hero!
      </h3>
      <p className="text-gray-300 mb-6">
        Be the first to create a watch party for {gameName}. Other fans are waiting for someone like you to start the fun!
      </p>
      <button
        onClick={onCreateParty}
        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all"
      >
        🚀 Create First Party
      </button>
      <p className="text-gray-500 text-sm mt-4">Don't be shy - someone has to be first!</p>
    </div>
  );

  // Screen Components
  const CopyrightFooter = ({ light }) => (
    <div className={`text-center py-4 ${light ? 'text-gray-500' : 'text-gray-500/70'} text-xs`}>
      <p>&copy; {new Date().getFullYear()} Huddle Up USA. All rights reserved.</p>
      <p className="mt-1">
        <a href="/terms" target="_blank" className="hover:text-gray-300 underline">Terms of Service</a>
        {' | '}
        <a href="/privacy" target="_blank" className="hover:text-gray-300 underline">Privacy Policy</a>
      </p>
    </div>
  );

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <img src="/huddle-up-logo-3-transparent.png" alt="Huddle Up - Find Your Crew. Watch The Game!" className="mx-auto animate-logo-pop" style={{ width: '358px' }} />
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
          >
            LOG IN
          </button>
          <button
            onClick={() => setCurrentScreen('signup')}
            className="w-full py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-2xl border-2 border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-200"
          >
            SIGN UP
          </button>
        </div>
      </div>
      <CopyrightFooter />
    </div>
  );

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginRememberMe, setLoginRememberMe] = useState(true);

  const loginScreenJSX = (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 flex-1 flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              WELCOME BACK
            </h2>
            <p className="text-gray-400">Log in to find watch parties</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl space-y-6 border border-white/10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                >
                  {loginShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={loginRememberMe}
                onChange={(e) => setLoginRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-white/10"
              />
              <span className="text-sm text-gray-300">Remember me</span>
            </label>

            <button
              onClick={() => handleLogin(loginEmail, loginPassword, loginRememberMe)}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
            >
              LOG IN
            </button>

            <button
              onClick={() => setCurrentScreen('forgotPassword')}
              className="w-full py-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Forgot your password?
            </button>

            <button
              onClick={() => setCurrentScreen('welcome')}
              className="w-full py-3 text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
        <CopyrightFooter />
      </div>
  );

  const [fpStep, setFpStep] = useState(1);
  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const handleFpVerifyEmail = async () => {
    setFpError('');
    if (!fpEmail) { setFpError('Please enter your email'); return; }
    setFpLoading(true);
    try {
      await api.auth.verifyEmail(fpEmail);
      setFpStep(2);
    } catch (err) {
      setFpError(err.message);
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpReset = async () => {
    setFpError('');
    if (!fpCode || fpCode.length !== 6) { setFpError('Please enter the 6-digit code'); return; }
    if (!fpNewPassword || fpNewPassword.length < 6) { setFpError('Password must be at least 6 characters'); return; }
    if (fpNewPassword !== fpConfirmPassword) { setFpError('Passwords do not match'); return; }
    setFpLoading(true);
    try {
      await api.auth.resetPassword(fpEmail, fpCode, fpNewPassword);
      setFpStep(3);
    } catch (err) {
      setFpError(err.message);
    } finally {
      setFpLoading(false);
    }
  };

  const forgotPasswordScreenJSX = (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {fpStep === 3 ? 'PASSWORD RESET' : 'RESET PASSWORD'}
            </h2>
            <p className="text-gray-400">
              {fpStep === 1 && 'Enter your email to get started'}
              {fpStep === 2 && 'Enter the code and set your new password'}
              {fpStep === 3 && 'Your password has been updated!'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl space-y-6 border border-white/10">
            {fpStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="your@email.com"
                  />
                </div>
                <button
                  onClick={handleFpVerifyEmail}
                  disabled={fpLoading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  {fpLoading ? 'VERIFYING...' : 'CONTINUE'}
                </button>
              </>
            )}

            {fpStep === 2 && (
              <>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
                  <span className="text-cyan-300 text-sm">Resetting password for {fpEmail}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={fpCode}
                    onChange={(e) => setFpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <p className="text-gray-500 text-xs mt-1 text-center">Check the server console for your verification code</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={fpConfirmPassword}
                    onChange={(e) => setFpConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Re-enter your password"
                  />
                </div>
                <button
                  onClick={handleFpReset}
                  disabled={fpLoading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  {fpLoading ? 'RESETTING...' : 'RESET PASSWORD'}
                </button>
              </>
            )}

            {fpStep === 3 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-300">You can now log in with your new password.</p>
                <button
                  onClick={() => setCurrentScreen('login')}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
                >
                  GO TO LOGIN
                </button>
              </div>
            )}

            {fpError && <p className="text-red-400 text-sm text-center">{fpError}</p>}

            {fpStep !== 3 && (
              <button
                onClick={() => fpStep === 1 ? setCurrentScreen('login') : setFpStep(1)}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
  );

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupGender, setSignupGender] = useState('');
  const [signupDateOfBirth, setSignupDateOfBirth] = useState('');
  const [signupAcceptedTerms, setSignupAcceptedTerms] = useState(false);
  const [signupAgeConfirmed, setSignupAgeConfirmed] = useState(false);
  const [signupRememberMe, setSignupRememberMe] = useState(true);
  const [signupReferralCode, setSignupReferralCode] = useState('');

  const handleSignupSubmit = () => {
    if (!signupAcceptedTerms) {
      alert('You must accept the Terms of Service and Privacy Policy to sign up.');
      return;
    }
    if (!signupAgeConfirmed) {
      alert('You must confirm you are 21 years of age or older.');
      return;
    }
    if (!signupEmail || !signupPassword || !signupName || !signupGender || !signupDateOfBirth) {
      alert('Please fill in all fields.');
      return;
    }
    const dob = new Date(signupDateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 21) {
      alert('You must be 21 or older to join Huddle Up.');
      return;
    }
    handleSignUp(signupEmail, signupPassword, signupName, signupGender, signupDateOfBirth, signupRememberMe, signupReferralCode);
  };

  const signUpScreenJSX = (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 flex-1 flex flex-col justify-center">
          <div className="text-center">
            <img src="/huddle-up-logo-3-transparent.png" alt="Huddle Up" className="h-16 mx-auto mb-4 drop-shadow-lg" />
            <h2 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              JOIN THE CREW
            </h2>
            <p className="text-gray-400">Create your account</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl space-y-6 border border-white/10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender (shown to other attendees)</label>
              <select
                value={signupGender}
                onChange={(e) => setSignupGender(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select gender...</option>
                <option value="male">Male ♂</option>
                <option value="female">Female ♀</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Helps other users see group composition</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
              <input
                type="date"
                value={signupDateOfBirth}
                onChange={(e) => setSignupDateOfBirth(e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-amber-400 mt-1 font-semibold">You must be 21 or older to attend watch parties</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={signupShowPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setSignupShowPassword(!signupShowPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                >
                  {signupShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={signupRememberMe}
                onChange={(e) => setSignupRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-white/10"
              />
              <span className="text-sm text-gray-300">Remember me</span>
            </label>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signupAcceptedTerms}
                  onChange={(e) => setSignupAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-white/10"
                />
                <span className="text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                    Privacy Policy
                  </a>
                  . I understand that Huddle Up US is a platform only and is not responsible for venues, events, or user conduct.
                </span>
              </label>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signupAgeConfirmed}
                  onChange={(e) => setSignupAgeConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 bg-white/10 accent-amber-500"
                />
                <div>
                  <span className="text-amber-300 font-bold text-sm">Age Verification Disclaimer</span>
                  <p className="text-amber-200/70 text-xs mt-1">
                    I confirm that I am 21 years of age or older. I understand that Huddle Up watch parties may take place at venues that serve alcohol, and I meet the legal age requirement to attend such establishments.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">Referral Code (optional)</label>
              <input
                type="text"
                value={signupReferralCode}
                onChange={e => setSignupReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g., HU-ABCD1234"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSignupSubmit}
              disabled={!signupAcceptedTerms || !signupAgeConfirmed}
              className={`w-full py-4 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-200 ${
                signupAcceptedTerms && signupAgeConfirmed
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-cyan-500/50 hover:scale-105'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              SIGN UP
            </button>

            <button
              onClick={() => setCurrentScreen('welcome')}
              className="w-full py-3 text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
        <CopyrightFooter />
      </div>
  );

  const gamesScreenJSX = () => (
    <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0">
              <img src="/huddle-up-logo-3-transparent.png" alt="Huddle Up" className="h-12 drop-shadow-lg" />
            </div>
            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex gap-1.5 w-max">
              {userVenue && (
                <button
                  onClick={() => setCurrentScreen('venueDashboard')}
                  className="flex flex-col items-center px-2 py-1.5 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30"
                >
                  <Building2 className="w-5 h-5 text-green-300" />
                  <span className="text-[9px] text-green-300 mt-0.5 leading-none">Venue</span>
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setCurrentScreen('admin')}
                  className="flex flex-col items-center px-2 py-1.5 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                >
                  <Settings className="w-5 h-5 text-purple-300" />
                  <span className="text-[9px] text-purple-300 mt-0.5 leading-none">Admin</span>
                </button>
              )}
              <button
                onClick={() => setCurrentScreen('myParties')}
                className="flex flex-col items-center px-2 py-1.5 bg-orange-500/20 rounded-xl hover:bg-orange-500/30 transition-colors border border-orange-500/30"
              >
                <Calendar className="w-5 h-5 text-orange-300" />
                <span className="text-[9px] text-orange-300 mt-0.5 leading-none">Parties</span>
              </button>
              <button
                onClick={shareApp}
                className="flex flex-col items-center px-2 py-1.5 bg-emerald-500/20 rounded-xl hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
              >
                <Share2 className="w-5 h-5 text-emerald-300" />
                <span className="text-[9px] text-emerald-300 mt-0.5 leading-none">Share</span>
              </button>
              <button
                onClick={() => setCurrentScreen('myCrew')}
                className="flex flex-col items-center px-2 py-1.5 bg-cyan-500/20 rounded-xl hover:bg-cyan-500/30 transition-colors border border-cyan-500/30 relative"
              >
                <Users className="w-5 h-5 text-cyan-300" />
                <span className="text-[9px] text-cyan-300 mt-0.5 leading-none">My Crew</span>
                {friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">{friendRequests.length}</span>
                )}
              </button>
              <button
                onClick={() => setCurrentScreen('rewards')}
                className="flex flex-col items-center px-2 py-1.5 bg-yellow-500/20 rounded-xl hover:bg-yellow-500/30 transition-colors border border-yellow-500/30"
              >
                <Gift className="w-5 h-5 text-yellow-300" />
                <span className="text-[9px] text-yellow-300 mt-0.5 leading-none">Rewards</span>
              </button>
              <button
                onClick={() => setCurrentScreen('fanFinder')}
                className="flex flex-col items-center px-2 py-1.5 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-colors border border-blue-500/30"
              >
                <UserPlus className="w-5 h-5 text-blue-300" />
                <span className="text-[9px] text-blue-300 mt-0.5 leading-none">Find Fans</span>
              </button>
              <button
                onClick={() => setCurrentScreen('fantasy')}
                className="flex flex-col items-center px-2 py-1.5 bg-orange-500/20 rounded-xl hover:bg-orange-500/30 transition-colors border border-orange-500/30"
              >
                <Trophy className="w-5 h-5 text-orange-300" />
                <span className="text-[9px] text-orange-300 mt-0.5 leading-none">Fantasy</span>
              </button>
              <button
                onClick={() => setCurrentScreen('invitations')}
                className="flex flex-col items-center px-2 py-1.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-white" />
                <span className="text-[9px] text-gray-300 mt-0.5 leading-none">Alerts</span>
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {totalAlerts}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className="flex flex-col items-center px-2 py-1.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                {user.profilePicture ? (
                  <ProfileAvatar src={user.profilePicture} name={user.name} size="xs" className="border border-cyan-400/50" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
                <span className="text-[9px] text-gray-300 mt-0.5 leading-none">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex flex-col items-center px-2 py-1.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <LogOut className="w-5 h-5 text-white" />
                <span className="text-[9px] text-gray-300 mt-0.5 leading-none">Logout</span>
              </button>
              </div>
            </div>
          </div>

          {/* LOCATION SEARCH */}
          <div className="relative mb-3">
            <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-600" />
            <DebouncedInput
              type="text"
              value={currentCity}
              onChange={(val) => { setCurrentCity(val); setLocationDetected(false); }}
              delay={400}
              placeholder={locationLoading ? "Detecting your location..." : "Enter city (e.g., Dallas, TX)"}
              className="w-full pl-10 pr-12 py-3 bg-cyan-100 border-2 border-cyan-300 rounded-xl text-black placeholder-cyan-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
            />
            <button
              onClick={detectUserLocation}
              disabled={locationLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-cyan-200 transition-colors"
              title="Use my location"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 text-cyan-600" />
              )}
            </button>
          </div>
          {locationDetected && currentCity && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-semibold">Showing parties near {currentCity}</span>
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <DebouncedInput
              type="text"
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              delay={300}
              placeholder="Search teams..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* MY TEAMS ONLY FILTER */}
          {user?.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 && (
            <button
              onClick={() => setMyTeamsOnly(!myTeamsOnly)}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-3 ${
                myTeamsOnly
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Star className={`w-5 h-5 ${myTeamsOnly ? 'fill-white' : ''}`} />
              {myTeamsOnly ? 'Showing My Teams Only' : 'Show My Teams Only'}
              {myTeamsOnly && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {Object.keys(user.favoriteTeams).length} teams
                </span>
              )}
            </button>
          )}

          <div className="relative">
            <div
              ref={sportsScrollRef}
              onScroll={() => {
                if (sportsScrollRef.current) {
                  const el = sportsScrollRef.current;
                  setShowSportsScrollArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
                }
              }}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            >
              {SPORTS.map(sport => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedSport === sport
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <span className="text-base">{SPORT_ICONS[sport] || '🏅'}</span>
                  {sport}
                </button>
              ))}
            </div>
            {showSportsScrollArrow && (
              <button
                onClick={() => {
                  if (sportsScrollRef.current) {
                    sportsScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                  }
                }}
                className="absolute right-0 top-0 bottom-2 w-12 flex items-center justify-end bg-gradient-to-l from-slate-900 via-slate-900/90 to-transparent pr-1"
              >
                <span className="w-8 h-8 rounded-full bg-cyan-500/30 border border-cyan-400/60 flex items-center justify-center animate-scroll-glow">
                  <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            )}
          </div>

          <button
            onClick={loadGames}
            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh scores
          </button>
        </div>
      </div>

      {/* MAIN SPONSOR BANNER - 5 slots per sport */}
      {(() => {
        const sponsors = getSponsorsForSport(selectedSport);
        const sponsor = sponsors[sponsorIndex % sponsors.length];
        return (
          <div className="max-w-4xl mx-auto px-4 pt-3 space-y-2">
            <div
              onClick={() => sponsor.url && sponsor.url !== '#' && window.open(sponsor.url, '_blank')}
              className={`relative overflow-hidden rounded-2xl border-2 ${sponsor.borderColor} bg-gradient-to-r ${sponsor.color} ${sponsor.url && sponsor.url !== '#' ? 'cursor-pointer' : ''} transition-all duration-500 hover:scale-[1.01] shadow-lg shadow-black/20`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sponsor-shimmer pointer-events-none" />
              <div className="relative flex items-stretch min-h-[120px]">
                <div className="flex-shrink-0 w-[45%] bg-black/20 flex items-center justify-center overflow-hidden rounded-l-2xl">
                  {sponsor.logoUrl ? (
                    <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                  ) : null}
                  {sponsor.icon && !sponsor.logoUrl ? (
                    <span className="text-6xl">{sponsor.icon}</span>
                  ) : null}
                  {sponsor.logoUrl ? (
                    <span className="text-6xl hidden items-center justify-center">{SPORT_ICONS[selectedSport] || '📢'}</span>
                  ) : null}
                </div>
                <div className="flex-1 flex flex-col justify-center p-5 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {sponsor.tier === 'premium' && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-yellow-300 text-xs font-bold uppercase rounded tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3" fill="currentColor" /> Premium
                      </span>
                    )}
                    {sponsor.isDemo && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-bold uppercase rounded tracking-wider">
                        Example
                      </span>
                    )}
                    {sponsor.isEmpty && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase rounded tracking-wider animate-pulse">
                        Available
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-extrabold text-2xl sm:text-3xl truncate leading-tight">{sponsor.name}</h3>
                  <p className="text-gray-200 text-base sm:text-lg mt-1 truncate">{sponsor.tagline}</p>
                  <div className="flex gap-1.5 mt-3">
                    {sponsors.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === sponsorIndex % sponsors.length ? 'bg-white w-6' : 'bg-white/25 w-1.5'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* FEATURED: FIFA WORLD CUP 2026 BANNER */}
      <div className="max-w-4xl mx-auto px-4 pt-3">
        <button
          onClick={() => setSelectedSport('FIFA World Cup')}
          className="w-full animate-wc-glow rounded-2xl overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-amber-900/80 via-yellow-700/60 to-amber-900/80 border-2 border-yellow-500/50 rounded-2xl p-4 sm:p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-wc-shimmer pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/40 animate-flag-wave">
                  <span className="text-3xl sm:text-4xl">🏆</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-red-500/80 text-white text-[10px] font-black uppercase rounded tracking-wider">Featured Event</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  FIFA WORLD CUP 2026
                </h3>
                <p className="text-yellow-200/80 text-xs sm:text-sm mt-0.5">
                  USA, Mexico & Canada · June 2026
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-lg">🇲🇽</span>
                  <span className="text-lg">🇨🇦</span>
                  <span className="text-lg">🇧🇷</span>
                  <span className="text-lg">🇩🇪</span>
                  <span className="text-lg">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  <span className="text-lg">🇦🇷</span>
                  <span className="text-lg">🇫🇷</span>
                  <span className="text-yellow-300 text-xs font-bold ml-auto">Tap to view →</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-3">
        <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-2 border-cyan-400/40 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg shadow-cyan-500/10 animate-pulse-slow">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
            <span className="text-2xl">👇</span>
          </div>
          <div>
            <p className="text-white font-bold text-base">Tap any game to start a watch party!</p>
            <p className="text-cyan-300/80 text-xs mt-0.5">Pick a game, choose a venue, and invite your crew</p>
          </div>
        </div>
      </div>

      {/* GLOWING SCROLL DOWN ARROW */}
      <div className="flex flex-col items-center py-4">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 animate-pulse">Scroll for more games</p>
        <div className="animate-scroll-bounce">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-scroll-glow">
            <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {filteredGames.map(game => {
          const gameParties = getPartiesForGame(game.id);
          return (
            <div
              key={game.id}
              onClick={() => {
                setSelectedGame(game);
                setCurrentScreen('gameDetail');
              }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 cursor-pointer transform hover:scale-[1.02] transition-all duration-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30">
                  {game.sport}
                </span>
                <div className="flex items-center gap-2">
                  {gameParties.length > 0 && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
                      {gameParties.length} {gameParties.length === 1 ? 'Party' : 'Parties'}
                    </span>
                  )}
                  {user && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWatchGame(game); }}
                      className={`p-1.5 rounded-full transition-all ${
                        watchedGames.includes(game.id)
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                          : 'bg-white/5 text-gray-500 border border-white/10 hover:text-yellow-400 hover:border-yellow-500/30'
                      }`}
                      title={watchedGames.includes(game.id) ? 'Stop score alerts' : 'Get score alerts'}
                    >
                      <svg className="w-4 h-4" fill={watchedGames.includes(game.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-center mb-4">
                {game.gameStatus === 'live' || game.gameStatus === 'final' ? (
                  <div className="mb-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="flex-1 flex flex-col items-center gap-1">
                        {game.homeLogo && <img src={game.homeLogo} alt="" className="w-14 h-14 object-contain" />}
                        <span className="text-base font-black text-white text-center leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{game.homeTeam}</span>
                      </div>
                      <div className="text-3xl font-black px-3 flex-shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                        <span className={game.homeScore > game.awayScore ? 'text-emerald-400' : 'text-white'}>{game.homeScore}</span>
                        <span className="text-gray-500 mx-1">-</span>
                        <span className={game.awayScore > game.homeScore ? 'text-emerald-400' : 'text-white'}>{game.awayScore}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        {game.awayLogo && <img src={game.awayLogo} alt="" className="w-14 h-14 object-contain" />}
                        <span className="text-base font-black text-white text-center leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{game.awayTeam}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${game.gameStatus === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                      {game.statusDetail}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      {game.homeLogo && <img src={game.homeLogo} alt="" className="w-14 h-14 object-contain" />}
                      <span className="text-base font-black text-white text-center leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{game.homeTeam}</span>
                    </div>
                    <span className="text-lg font-black text-cyan-400 flex-shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>VS</span>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      {game.awayLogo && <img src={game.awayLogo} alt="" className="w-14 h-14 object-contain" />}
                      <span className="text-base font-black text-white text-center leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{game.awayTeam}</span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center gap-1 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDateTime(game.startTime)}
                  </div>
                  {game.broadcast && (
                    <span className="text-cyan-400 text-xs">{game.broadcast}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <CopyrightFooter />
    </div>
  );

  const GameDetailScreen = () => {
    const gameParties = getPartiesForGame(selectedGame.id);

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setCurrentScreen('games')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Games
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30">
                {selectedGame.sport}
              </span>
              {user && (
                <button
                  onClick={() => toggleWatchGame(selectedGame)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    watchedGames.includes(selectedGame.id)
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:text-yellow-400 hover:border-yellow-500/30'
                  }`}
                >
                  <svg className="w-4 h-4" fill={watchedGames.includes(selectedGame.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {watchedGames.includes(selectedGame.id) ? 'Watching' : 'Score Alerts'}
                </button>
              )}
            </div>
            
            <div className="text-center mb-6">
              {selectedGame.gameStatus === 'live' || selectedGame.gameStatus === 'final' ? (
                <>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      {selectedGame.homeLogo && <img src={selectedGame.homeLogo} alt="" className="w-16 h-16 object-contain mx-auto" />}
                      <div className="text-base font-black text-white text-center leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{selectedGame.homeTeam}</div>
                      {selectedGame.homeRecord && <div className="text-xs text-gray-500">{selectedGame.homeRecord}</div>}
                    </div>
                    <div className="text-5xl font-black flex-shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      <span className={selectedGame.homeScore > selectedGame.awayScore ? 'text-emerald-400' : 'text-white'}>{selectedGame.homeScore}</span>
                      <span className="text-gray-500 mx-2">-</span>
                      <span className={selectedGame.awayScore > selectedGame.homeScore ? 'text-emerald-400' : 'text-white'}>{selectedGame.awayScore}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      {selectedGame.awayLogo && <img src={selectedGame.awayLogo} alt="" className="w-16 h-16 object-contain mx-auto" />}
                      <div className="text-base font-black text-white text-center leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{selectedGame.awayTeam}</div>
                      {selectedGame.awayRecord && <div className="text-xs text-gray-500">{selectedGame.awayRecord}</div>}
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${selectedGame.gameStatus === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                    {selectedGame.statusDetail}
                  </span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    {selectedGame.homeLogo && <img src={selectedGame.homeLogo} alt="" className="w-16 h-16 object-contain mx-auto" />}
                    <div className="text-base font-black text-white text-center leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{selectedGame.homeTeam}</div>
                  </div>
                  <span className="text-2xl font-black text-cyan-400 flex-shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>VS</span>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    {selectedGame.awayLogo && <img src={selectedGame.awayLogo} alt="" className="w-16 h-16 object-contain mx-auto" />}
                    <div className="text-base font-black text-white text-center leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{selectedGame.awayTeam}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-1 text-gray-400 mb-2 mt-4">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(selectedGame.startTime)}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{selectedGame.venue}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('createParty')}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              CREATE WATCH PARTY
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Watch Parties ({gameParties.length})
            </h2>
            
            {gameParties.length === 0 ? (
              <EmptyPartyState 
                gameName={`${selectedGame.homeTeam} vs ${selectedGame.awayTeam}`}
                onCreateParty={() => setCurrentScreen('createParty')}
              />
            ) : (
              <div className="space-y-4">
                {gameParties.map(party => {
                  const isAttending = party.attendees.includes(user.email);
                  const isFull = party.capacity && party.attendees.length >= party.capacity;
                  const matchedVenue = venues.find(v => v.name?.toLowerCase() === party.venueName?.toLowerCase());
                  const venue = {
                    logo: party.venueLogo || matchedVenue?.logo || null,
                    picture: party.venuePicture || matchedVenue?.picture || null,
                    verified: matchedVenue?.verified || false,
                    featured: matchedVenue?.featured || false,
                  };
                  
                  const teamColors = party.supportedTeam ? getTeamColors(party.sport, party.supportedTeam) : null;
                  const teamLogo = party.supportedTeam ? getTeamLogoUrl(party.sport, party.supportedTeam) : null;
                  
                  return (
                    <div
                      key={party.id}
                      className="relative overflow-hidden rounded-2xl border shadow-xl"
                      style={teamColors ? {
                        borderColor: `${teamColors[1]}60`,
                        background: `linear-gradient(135deg, ${teamColors[0]}dd 0%, ${teamColors[0]}99 40%, ${teamColors[1]}44 100%)`
                      } : {
                        borderColor: 'rgba(255,255,255,0.1)',
                        background: 'linear-gradient(135deg, rgb(30,41,59), rgb(15,23,42))'
                      }}
                    >
                      {venue.picture && (
                        <div className="w-full h-36 overflow-hidden">
                          <img src={`/api/uploads/serve/${venue.picture.replace('/objects/', '')}`} alt={party.venueName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {teamLogo && !venue.picture && (
                        <div className="absolute top-4 right-4 opacity-15 pointer-events-none">
                          <img src={teamLogo} alt="" className="w-32 h-32 object-contain" />
                        </div>
                      )}
                      <div className="relative p-6">
                      {party.supportedTeam && (
                        <div className="flex items-center gap-3 mb-4">
                          {teamLogo && <img src={teamLogo} alt="" className="w-14 h-14 object-contain drop-shadow-lg" />}
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: teamColors ? teamColors[1] : '#94a3b8' }}>Supporting</div>
                            <div className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{party.supportedTeam}</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {venue?.logo && (
                              <img src={`/api/uploads/serve/${venue.logo.replace('/objects/', '')}`} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/20" />
                            )}
                            <h3 className="text-xl font-bold text-white">{party.hostName}'s Party</h3>
                            {party.hostEmail === user.email && (
                              <>
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                                  HOST
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditParty(party); }}
                                  className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                                >
                                  Edit
                                </button>
                              </>
                            )}
                            {venue?.verified && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                VERIFIED
                              </span>
                            )}
                            {venue?.featured && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
                                ⭐ FEATURED
                              </span>
                            )}
                            {currentCity && isCityMatch(party.city) && (
                              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                NEAR YOU
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-cyan-400" />
                              <AddressLink address={party.venueAddress || party.location} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              <span>{party.customTime || formatDateTime(selectedGame.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-cyan-400" />
                              <span>
                                {party.attendees.length}
                                {party.capacity ? ` / ${party.capacity}` : ''} people
                              </span>
                            </div>
                          </div>
                          <VenueMap address={party.venueAddress || party.location} venueName={party.venueName || party.location} />

                          {party.notes && (
                            <p className="mt-3 text-gray-300 text-sm">{party.notes}</p>
                          )}

                          {/* Attendee List */}
                          {party.attendeeDetails && party.attendeeDetails.length > 0 && (
                            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                              <div className="text-xs text-gray-400 mb-2 font-bold">Who's Going:</div>
                              <div className="flex flex-wrap gap-2">
                                {party.attendeeDetails.map((attendee, idx) => {
                                  const genderIcon = attendee.gender === 'male' ? '♂' : attendee.gender === 'female' ? '♀' : '';
                                  const genderColor = attendee.gender === 'male' ? 'text-blue-400' : attendee.gender === 'female' ? 'text-pink-400' : 'text-gray-400';
                                  const attendeeTeamLogos = attendee.favoriteTeams ? Object.entries(attendee.favoriteTeams).map(([sport, team]) => getTeamLogoUrl(sport, team)).filter(Boolean) : [];
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20"
                                    >
                                      <ProfileAvatar src={attendee.profilePicture} name={attendee.name} size="xs" />
                                      <span className="text-white text-sm">{attendee.name}</span>
                                      {genderIcon && (
                                        <span className={`${genderColor} font-bold`}>{genderIcon}</span>
                                      )}
                                      {attendeeTeamLogos.length > 0 && (
                                        <div className="flex items-center gap-0.5 ml-0.5">
                                          {attendeeTeamLogos.slice(0, 3).map((logo, i) => (
                                            <img key={i} src={logo} alt="" className="w-4 h-4 object-contain" />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* FELLOW FANS INDICATOR - Show fans of same teams */}
                      {user?.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 && (
                        (() => {
                          // Check if this game involves any of user's favorite teams
                          const myTeams = Object.values(user.favoriteTeams);
                          const isMyTeamPlaying = myTeams.some(team => 
                            selectedGame.homeTeam.includes(team) || selectedGame.awayTeam.includes(team)
                          );
                          
                          if (isMyTeamPlaying) {
                            const myTeam = myTeams.find(team => 
                              selectedGame.homeTeam.includes(team) || selectedGame.awayTeam.includes(team)
                            );
                            return (
                              <div className="mb-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                  <span className="text-white font-bold text-sm">
                                    Your team is playing! {party.attendees.length} {myTeam} fans going! 🎉
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}

                      {/* FEATURE 5: Capacity Warnings */}
                      {party.capacity && (
                        <div className={`mb-3 p-3 rounded-lg text-center font-bold ${
                          party.attendees.length >= party.capacity
                            ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                            : party.attendees.length / party.capacity >= 0.8
                            ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                            : 'bg-white/5 border border-white/10 text-gray-400'
                        }`}>
                          {party.attendees.length >= party.capacity ? (
                            <span>🔒 PARTY FULL - No More Spots</span>
                          ) : party.attendees.length / party.capacity >= 0.8 ? (
                            <span>⚠️ Only {party.capacity - party.attendees.length} spots left! Join now!</span>
                          ) : (
                            <span>{party.attendees.length} / {party.capacity} spots filled</span>
                          )}
                        </div>
                      )}

                      {/* FEATURE 3: Email Reminder Notification */}
                      {isAttending && (
                        <div className="mb-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">📧</span>
                            <span className="text-white font-bold text-sm">You'll Get Reminders!</span>
                          </div>
                          <p className="text-cyan-200 text-xs">
                            We'll email you 2 hours before the party starts so you don't forget. See you there!
                          </p>
                        </div>
                      )}

                      {party.hostEmail !== user.email && (
                        <button
                          onClick={() => isAttending ? handleLeaveParty(party.id) : handleJoinParty(party.id)}
                          disabled={!isAttending && isFull}
                          className={`w-full py-3 rounded-xl font-bold transition-all ${
                            isAttending
                              ? 'bg-red-500/20 text-red-300 border-2 border-red-500/30 hover:bg-red-500/30'
                              : isFull
                              ? 'bg-gray-500/20 text-gray-500 border-2 border-gray-500/30 cursor-not-allowed'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-cyan-500/50'
                          }`}
                        >
                          {isAttending ? 'LEAVE PARTY' : isFull ? 'PARTY FULL' : 'JOIN PARTY'}
                        </button>
                      )}

                      {(isAttending || party.hostEmail === user.email) && (
                        <>
                          <button
                            onClick={() => openPartyChat(party.id)}
                            className={`w-full mt-2 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                              openChatPartyId === party.id
                                ? 'bg-purple-500/30 text-purple-300 border-2 border-purple-500/40'
                                : 'bg-white/10 text-gray-300 border-2 border-white/20 hover:bg-white/20'
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            {openChatPartyId === party.id ? 'Close Chat' : 'Party Chat'}
                          </button>

                          <button
                            onClick={() => openPartyPhotos(party.id)}
                            className={`w-full mt-2 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                              openPhotoPartyId === party.id
                                ? 'bg-orange-500/30 text-orange-300 border-2 border-orange-500/40'
                                : 'bg-white/10 text-gray-300 border-2 border-white/20 hover:bg-white/20'
                            }`}
                          >
                            <Camera className="w-4 h-4" />
                            {openPhotoPartyId === party.id ? 'Close Photos' : `Party Photos${partyPhotos.length > 0 && openPhotoPartyId === party.id ? ` (${partyPhotos.length})` : ''}`}
                          </button>

                          {!checkedInParties[party.id] && (
                            <button
                              onClick={() => handleCheckin(party.id)}
                              className="w-full mt-2 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-2 border-yellow-500/30 hover:bg-yellow-500/30"
                            >
                              <MapPin className="w-4 h-4" />
                              Check In (+75 pts)
                            </button>
                          )}
                          {checkedInParties[party.id] && (
                            <div className="w-full mt-2 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-green-500/20 text-green-300 border-2 border-green-500/30">
                              <CheckCircle className="w-4 h-4" />
                              Checked In!
                            </div>
                          )}

                          {openPhotoPartyId === party.id && (
                            <div className="mt-3 bg-slate-800/80 rounded-xl border border-white/10 overflow-hidden">
                              <div className="p-3 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-b border-white/10">
                                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                  <Camera className="w-4 h-4 text-orange-400" />
                                  Party Photo Album ({partyPhotos.length})
                                </h4>
                              </div>

                              <div className="p-3 border-b border-white/10">
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={photoCaption}
                                    onChange={(e) => setPhotoCaption(e.target.value)}
                                    placeholder="Add a caption..."
                                    maxLength={200}
                                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                                  />
                                  <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) handlePhotoUpload(party.id, e.target.files[0]);
                                    }}
                                  />
                                  <button
                                    onClick={() => photoInputRef.current?.click()}
                                    disabled={photoUploading}
                                    className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-2.5 rounded-full hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {photoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {partyPhotos.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                  No photos yet. Be the first to share!
                                </div>
                              ) : (
                                <div className="p-3">
                                  <div className="grid grid-cols-3 gap-2">
                                    {partyPhotos.map((photo) => (
                                      <div key={photo.id} className="relative group cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                                        <img
                                          src={`/api/uploads/serve/${photo.object_path.replace('/objects/', '')}`}
                                          alt={photo.caption || 'Party photo'}
                                          className="w-full aspect-square object-cover rounded-lg border border-white/10"
                                        />
                                        {photo.tags?.length > 0 && (
                                          <div className="absolute bottom-1 left-1 bg-black/70 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                                            <User className="w-2.5 h-2.5 text-cyan-400" />
                                            <span className="text-[9px] text-white">{photo.tags.length}</span>
                                          </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                          <Eye className="w-5 h-5 text-white" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedPhoto && (
                                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedPhoto(null); setTagMenuPhotoId(null); } }}>
                                  <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-2">
                                      <ProfileAvatar src={selectedPhoto.user_profile_picture} name={selectedPhoto.user_name} size="sm" />
                                      <div>
                                        <p className="text-white font-bold text-sm">{selectedPhoto.user_name}</p>
                                        <p className="text-gray-400 text-xs">{new Date(selectedPhoto.created_at).toLocaleString()}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setTagMenuPhotoId(tagMenuPhotoId === selectedPhoto.id ? null : selectedPhoto.id)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all" title="Tag friends">
                                        <UserPlus className="w-4 h-4 text-cyan-400" />
                                      </button>
                                      <button onClick={() => sharePhoto(selectedPhoto, party)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all" title="Share">
                                        <Share2 className="w-4 h-4 text-green-400" />
                                      </button>
                                      {(selectedPhoto.user_id === user.id || party.hostEmail === user.email) && (
                                        <button onClick={() => handleDeletePhoto(selectedPhoto.id)} className="p-2 bg-white/10 rounded-full hover:bg-red-500/30 transition-all" title="Delete">
                                          <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                      )}
                                      <button onClick={() => { setSelectedPhoto(null); setTagMenuPhotoId(null); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                                        <X className="w-4 h-4 text-white" />
                                      </button>
                                    </div>
                                  </div>

                                  {tagMenuPhotoId === selectedPhoto.id && (
                                    <div className="px-4 pb-3">
                                      <div className="bg-slate-800 rounded-lg p-3 border border-white/10">
                                        <p className="text-white text-xs font-bold mb-2">Tag a party member:</p>
                                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                          {party.attendees
                                            .filter(a => !selectedPhoto.tags?.some(t => t.userId === a.userId))
                                            .map(a => (
                                              <button
                                                key={a.userId}
                                                onClick={() => handleTagFriend(selectedPhoto.id, a.userId)}
                                                className="flex items-center gap-1 bg-white/10 hover:bg-cyan-500/20 border border-white/20 rounded-full px-2.5 py-1 text-xs text-white transition-all"
                                              >
                                                <UserPlus className="w-3 h-3 text-cyan-400" />
                                                {a.name}
                                              </button>
                                            ))}
                                          {party.attendees.filter(a => !selectedPhoto.tags?.some(t => t.userId === a.userId)).length === 0 && (
                                            <span className="text-gray-500 text-xs">Everyone is already tagged!</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex-1 flex items-center justify-center px-4">
                                    <img
                                      src={`/api/uploads/serve/${selectedPhoto.object_path.replace('/objects/', '')}`}
                                      alt={selectedPhoto.caption || 'Party photo'}
                                      className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                    />
                                  </div>

                                  <div className="p-4">
                                    {selectedPhoto.caption && (
                                      <p className="text-white text-sm mb-2">{selectedPhoto.caption}</p>
                                    )}
                                    {selectedPhoto.tags?.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-2">
                                        {selectedPhoto.tags.map(tag => (
                                          <span key={tag.userId} className="inline-flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full px-2.5 py-1 text-xs text-cyan-300">
                                            <User className="w-3 h-3" />
                                            {tag.name}
                                            {(selectedPhoto.user_id === user.id || tag.userId === user.id) && (
                                              <button onClick={() => handleRemoveTag(selectedPhoto.id, tag.userId)} className="ml-0.5 hover:text-red-400">
                                                <X className="w-3 h-3" />
                                              </button>
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <p className="text-gray-500 text-xs text-center">Share with #HuddleUp</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {openChatPartyId === party.id && (
                            <div className="mt-3 bg-slate-800/80 rounded-xl border border-white/10 overflow-hidden">
                              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
                                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4 text-purple-400" />
                                  Party Chat
                                </h4>
                              </div>
                              <div className="h-64 overflow-y-auto p-3 space-y-3">
                                {chatLoading ? (
                                  <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                                  </div>
                                ) : chatMessages.length === 0 ? (
                                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    No messages yet. Start the conversation!
                                  </div>
                                ) : (
                                  chatMessages.map((msg) => {
                                    const isMe = msg.user_id === user.id;
                                    const isFantasy = msg.message_type === 'fantasy';
                                    return (
                                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] ${isMe ? 'order-2' : ''}`}>
                                          {!isMe && (
                                            <div className="flex items-center gap-1.5 mb-1">
                                              <ProfileAvatar src={msg.profile_picture} name={msg.user_name} size="xs" />
                                              <span className="text-xs text-gray-400 font-medium">{msg.user_name}</span>
                                            </div>
                                          )}
                                          {isFantasy && (
                                            <div className="flex items-center gap-1 mb-0.5">
                                              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">🏈 Trash Talk</span>
                                            </div>
                                          )}
                                          <div className={`px-3 py-2 rounded-2xl text-sm ${
                                            isFantasy
                                              ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-100 border border-orange-500/40 rounded-br-md'
                                              : isMe
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-md'
                                                : 'bg-white/10 text-gray-200 rounded-bl-md'
                                          }`}>
                                            {msg.message}
                                          </div>
                                          <div className={`text-[10px] text-gray-500 mt-0.5 ${isMe ? 'text-right' : ''}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                                <div ref={chatEndRef} />
                              </div>
                              <div className="p-3 border-t border-white/10">
                                {chatTrashTalk && (
                                  <div className="mb-2 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center gap-1">
                                    <span className="text-[10px] text-orange-400 font-bold">🏈 TRASH TALK MODE</span>
                                    <button onClick={() => setChatTrashTalk(false)} className="ml-auto text-orange-400 hover:text-orange-300">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setChatTrashTalk(!chatTrashTalk)}
                                    className={`p-2 rounded-full transition-all ${chatTrashTalk ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400 hover:text-orange-400'}`}
                                    title="Fantasy Trash Talk"
                                  >
                                    <Trophy className="w-4 h-4" />
                                  </button>
                                  <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(party.id)}
                                    placeholder={chatTrashTalk ? "Talk trash about their fantasy team..." : "Type a message..."}
                                    maxLength={500}
                                    className={`flex-1 bg-white/10 border rounded-full px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none ${chatTrashTalk ? 'border-orange-500/50 focus:border-orange-500' : 'border-white/20 focus:border-purple-500/50'}`}
                                  />
                                  <button
                                    onClick={() => sendChatMessage(party.id)}
                                    disabled={!chatInput.trim() || chatSending}
                                    className={`text-white p-2 rounded-full hover:opacity-90 transition-all disabled:opacity-50 ${chatTrashTalk ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [claimVenueName, setClaimVenueName] = useState('');
  const [claimAddress, setClaimAddress] = useState('');
  const [claimVenueType, setClaimVenueType] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimWebsite, setClaimWebsite] = useState('');
  const [claimProofDocument, setClaimProofDocument] = useState('');
  const [claimAcceptedTerms, setClaimAcceptedTerms] = useState(false);

  const handleClaimSubmit = () => {
    if (!claimVenueName || !claimAddress || !claimVenueType) {
      alert('Please fill in all required fields');
      return;
    }
    if (!claimAcceptedTerms) {
      alert('You must accept the Venue Terms and Conditions to claim a venue.');
      return;
    }
    handleVenueClaim({
      venueName: claimVenueName,
      address: claimAddress,
      venueType: claimVenueType,
      phone: claimPhone,
      website: claimWebsite,
      proofDocument: claimProofDocument
    });
  };

  const claimVenueScreenJSX = () => (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setCurrentScreen('createParty')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                CLAIM YOUR VENUE
              </h2>
              <p className="text-gray-400">Submit your business for verification to get featured on Huddle Up</p>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🎁</span>
                <div>
                  <div className="text-white font-black text-xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    14-Day FREE Trial
                  </div>
                  <div className="text-green-300 text-sm font-bold">No Credit Card Required!</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Try <strong>Featured</strong> status absolutely FREE for 14 days. See the results for yourself - more visibility, more parties, more customers. After the trial, it's only $199/month. Cancel anytime, no questions asked.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Join 50+ venues already getting more customers with Huddle Up!</span>
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-sm text-cyan-200">
              <div className="font-bold mb-2">✓ Benefits of Verified Venues:</div>
              <ul className="space-y-1 ml-4">
                <li>• Show up first in watch party searches</li>
                <li>• Verified badge builds trust with customers</li>
                <li>• Track how many people find you through Huddle Up</li>
                <li>• Upgrade to Featured status for maximum visibility</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={claimVenueName}
                onChange={(e) => setClaimVenueName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Buffalo Wild Wings Downtown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                value={claimAddress}
                onChange={(e) => setClaimAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="123 Main St, Fort Lauderdale, FL 33301"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Type *
              </label>
              <select
                value={claimVenueType}
                onChange={(e) => setClaimVenueType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="" className="bg-slate-700 text-white">Select type...</option>
                <option value="Sports Bar" className="bg-slate-700 text-white">Sports Bar</option>
                <option value="Restaurant & Bar" className="bg-slate-700 text-white">Restaurant & Bar</option>
                <option value="Brewery/Taproom" className="bg-slate-700 text-white">Brewery/Taproom</option>
                <option value="Entertainment Venue" className="bg-slate-700 text-white">Entertainment Venue</option>
                <option value="Other" className="bg-slate-700 text-white">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={claimPhone}
                onChange={(e) => setClaimPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={claimWebsite}
                onChange={(e) => setClaimWebsite(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proof of Ownership (optional)
              </label>
              <textarea
                value={claimProofDocument}
                onChange={(e) => setClaimProofDocument(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Business license number, tax ID, or link to proof..."
              />
              <p className="text-xs text-gray-500 mt-1">Helps us verify faster. We'll follow up if needed.</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={claimAcceptedTerms}
                  onChange={(e) => setClaimAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-white/10"
                />
                <span className="text-sm text-gray-300">
                  <strong className="text-white">Venue Agreement:</strong> I confirm that I am authorized to represent this venue. I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                    Terms of Service
                  </a>
                  {' '}and understand that:
                  <ul className="mt-2 ml-4 space-y-1 text-xs">
                    <li>• I am solely responsible for all venue operations, safety, and compliance</li>
                    <li>• Huddle Up US is a platform only and not liable for any incidents at my venue</li>
                    <li>• I hold all necessary licenses, permits, and insurance</li>
                    <li>• Verification does not constitute endorsement or guarantee</li>
                  </ul>
                </span>
              </label>
            </div>

            <button
              onClick={handleClaimSubmit}
              disabled={!claimAcceptedTerms}
              className={`w-full py-4 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-200 ${
                claimAcceptedTerms
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-cyan-500/50 hover:scale-105'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              SUBMIT FOR VERIFICATION
            </button>

            <p className="text-xs text-gray-500 text-center">
              We typically review claims within 24-48 hours. You'll be notified at {user?.email}
            </p>
          </div>
        </div>
      </div>
  );

  const AdminPanelScreen = () => {
    const sponsors = adminSponsors;

    const openAdminEditVenue = (venue) => {
      setAdminEditForm({
        name: venue.name || '',
        address: venue.address || '',
        city: venue.city || '',
        type: venue.type || 'Sports Bar',
        phone: venue.phone || '',
        website: venue.website || '',
        capacity: venue.capacity || '',
        description: venue.description || '',
        featured: venue.featured || false,
      });
      setAdminEditVenue(venue);
    };

    const handleAdminSaveVenue = async () => {
      if (!adminEditForm.name || !adminEditForm.address) {
        alert('Name and address are required.');
        return;
      }
      setAdminSavingVenue(true);
      try {
        await api.venues.adminUpdate(adminEditVenue.id, adminEditForm);
        await loadVenues();
        setAdminEditVenue(null);
      } catch (error) {
        alert(error.message);
      } finally {
        setAdminSavingVenue(false);
      }
    };

    const pendingClaims = venueClaims.filter(c => c.status === 'pending');
    const approvedClaims = venueClaims.filter(c => c.status === 'approved');
    const rejectedClaims = venueClaims.filter(c => c.status === 'rejected');
    
    // Revenue Calculations
    const featuredVenues = venues.filter(v => v.featured && v.verified);
    const regularVenues = venues.filter(v => !v.featured && v.verified);
    const monthlyRecurringRevenue = (featuredVenues.length * 199) + (regularVenues.length * 0); // Free tier = $0
    const projectedAnnualRevenue = monthlyRecurringRevenue * 12;
    
    const activeParties = parties.filter(p => {
      const game = games.find(g => g.id === p.gameId);
      return game && new Date(game.startTime) > new Date();
    });
    const totalAttendees = parties.reduce((sum, party) => sum + party.attendees.length, 0);
    
    // Sport Performance
    const sportStats = {};
    parties.forEach(party => {
      const game = games.find(g => g.id === party.gameId);
      if (game) {
        if (!sportStats[game.sport]) {
          sportStats[game.sport] = { parties: 0, attendees: 0 };
        }
        sportStats[game.sport].parties += 1;
        sportStats[game.sport].attendees += party.attendees.length;
      }
    });
    
    // Venue Performance Rankings
    const venuePerformance = venues
      .filter(v => v.verified)
      .map(venue => {
        const venueParties = parties.filter(p => p.venueId === venue.id);
        const venueAttendees = venueParties.reduce((sum, p) => sum + p.attendees.length, 0);
        return {
          ...venue,
          partiesHosted: venueParties.length,
          totalAttendees: venueAttendees,
          avgPartySize: venueParties.length > 0 ? Math.round(venueAttendees / venueParties.length) : 0
        };
      })
      .sort((a, b) => b.totalAttendees - a.totalAttendees);

    const MiniBar = ({ data, maxVal, color = 'cyan' }) => {
      if (!data || data.length === 0) return null;
      const max = maxVal || Math.max(...data, 1);
      return (
        <div className="flex items-end gap-px h-12">
          {data.map((val, i) => (
            <div key={i} className={`flex-1 rounded-t bg-${color}-500/60 min-w-[2px]`} style={{ height: `${Math.max((val / max) * 100, 2)}%` }} />
          ))}
        </div>
      );
    };

    const ProgressRing = ({ value, max, label, color = '#06b6d4' }) => {
      const pct = max > 0 ? Math.round((value / max) * 100) : 0;
      const circumference = 2 * Math.PI * 36;
      const offset = circumference - (pct / 100) * circumference;
      return (
        <div className="flex flex-col items-center">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 44 44)" className="transition-all duration-1000" />
            <text x="44" y="44" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="18" fontWeight="bold">{pct}%</text>
          </svg>
          <div className="text-xs text-gray-400 mt-1 text-center">{label}</div>
        </div>
      );
    };

    const a = analyticsData;

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Settings className="inline w-8 h-8 mr-2 text-cyan-400" />
                ADMIN DASHBOARD
              </h1>
              <button
                onClick={() => setCurrentScreen('games')}
                className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-white"
              >
                Back to App
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              {[
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'management', label: 'Management', icon: Settings },
              ].map(tab => (
                <button key={tab.id} onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    adminTab === tab.id ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {adminTab === 'analytics' && (
          <>
            {analyticsLoading && !a ? (
              <div className="text-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading analytics...</p>
              </div>
            ) : a ? (
              <>
                {/* KPI Cards Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Total Users', value: a.overview.totalUsers, sub: `+${a.overview.newUsersWeek} this week`, color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
                    { label: 'Total Parties', value: a.overview.totalParties, sub: `+${a.overview.newPartiesWeek} this week`, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
                    { label: 'Venues', value: a.overview.totalVenues, sub: `${a.overview.pendingClaims} pending`, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
                    { label: 'Attendees', value: a.overview.totalAttendees, sub: 'Party joins', color: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30' },
                    { label: 'Messages', value: a.overview.totalMessages, sub: `+${a.overview.newMessagesWeek} this week`, color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30' },
                    { label: 'Friendships', value: a.overview.totalFriendships, sub: 'Connections', color: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/30' },
                  ].map(kpi => (
                    <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} border ${kpi.border} p-4 rounded-2xl`}>
                      <div className="text-xs text-gray-400 mb-1">{kpi.label}</div>
                      <div className="text-2xl font-black text-white">{kpi.value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-1">{kpi.sub}</div>
                    </div>
                  ))}
                </div>

                {/* User Growth Chart */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    USER GROWTH (Last 90 Days)
                  </h3>
                  {a.userGrowth.length > 0 ? (
                    <div>
                      <div className="flex items-end gap-[2px] h-32 mb-2">
                        {a.userGrowth.map((d, i) => {
                          const max = Math.max(...a.userGrowth.map(x => parseInt(x.signups)), 1);
                          const h = (parseInt(d.signups) / max) * 100;
                          return (
                            <div key={i} className="flex-1 group relative">
                              <div className="bg-cyan-500/70 hover:bg-cyan-400 rounded-t transition-all min-w-[2px]" style={{ height: `${Math.max(h, 3)}%` }} />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {d.signups} signups
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{a.userGrowth.length > 0 ? new Date(a.userGrowth[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                        <span>{a.userGrowth.length > 0 ? new Date(a.userGrowth[a.userGrowth.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No signup data yet</div>
                  )}
                </div>

                {/* Engagement Rings */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    USER ENGAGEMENT
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <ProgressRing value={a.engagement.usersWithFavorites} max={a.engagement.totalUsers} label="Set Favorites" color="#06b6d4" />
                    <ProgressRing value={a.engagement.usersWithProfilePic} max={a.engagement.totalUsers} label="Profile Pic" color="#8b5cf6" />
                    <ProgressRing value={a.engagement.usersWithFriends} max={a.engagement.totalUsers} label="Have Friends" color="#ec4899" />
                    <ProgressRing value={a.engagement.usersWithParties} max={a.engagement.totalUsers} label="Joined Party" color="#f59e0b" />
                    <ProgressRing value={a.engagement.chatActiveUsers} max={a.engagement.totalUsers} label="Used Chat" color="#10b981" />
                    <ProgressRing value={a.overview.totalUsers - a.engagement.usersWithFavorites} max={a.engagement.totalUsers} label="No Favorites" color="#ef4444" />
                  </div>
                </div>

                {/* Demographics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gender */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      GENDER BREAKDOWN
                    </h3>
                    <div className="space-y-3">
                      {a.engagement.genderBreakdown.map(g => {
                        const pct = a.engagement.totalUsers > 0 ? Math.round((g.count / a.engagement.totalUsers) * 100) : 0;
                        const genderLabel = g.gender === 'male' ? 'Male' : g.gender === 'female' ? 'Female' : g.gender === 'non-binary' ? 'Non-Binary' : g.gender === 'prefer-not-to-say' ? 'Prefer Not to Say' : g.gender;
                        return (
                          <div key={g.gender}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{genderLabel}</span>
                              <span className="text-white font-bold">{g.count} ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Age */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      AGE DISTRIBUTION
                    </h3>
                    <div className="space-y-3">
                      {a.engagement.ageBreakdown.map(ag => {
                        const pct = a.engagement.totalUsers > 0 ? Math.round((ag.count / a.engagement.totalUsers) * 100) : 0;
                        return (
                          <div key={ag.ageGroup}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{ag.ageGroup}</span>
                              <span className="text-white font-bold">{ag.count} ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Top Sports & Top Cities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      TOP SPORTS
                    </h3>
                    {a.topSports.length > 0 ? (
                      <div className="space-y-3">
                        {a.topSports.slice(0, 10).map((s, i) => {
                          const maxParties = Math.max(...a.topSports.map(x => x.partyCount), 1);
                          return (
                            <div key={s.sport} className="flex items-center gap-3">
                              <div className="w-6 text-center text-gray-500 text-xs font-bold">#{i + 1}</div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-white font-medium">{s.sport}</span>
                                  <span className="text-cyan-400 font-bold">{s.partyCount} parties</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(s.partyCount / maxParties) * 100}%` }} />
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">{s.attendeeCount} attendees | {s.uniqueHosts} hosts</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <div className="text-center py-4 text-gray-500">No data yet</div>}
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      TOP CITIES
                    </h3>
                    {a.topCities.length > 0 ? (
                      <div className="space-y-3">
                        {a.topCities.slice(0, 10).map((c, i) => {
                          const maxParties = Math.max(...a.topCities.map(x => x.partyCount), 1);
                          return (
                            <div key={c.city} className="flex items-center gap-3">
                              <div className="w-6 text-center text-gray-500 text-xs font-bold">#{i + 1}</div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-white font-medium">{c.city}</span>
                                  <span className="text-purple-400 font-bold">{c.partyCount} parties</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(c.partyCount / maxParties) * 100}%` }} />
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">{c.attendeeCount} attendees | {c.uniqueHosts} hosts</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <div className="text-center py-4 text-gray-500">No data yet</div>}
                  </div>
                </div>

                {/* Top Teams */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    MOST POPULAR TEAMS
                  </h3>
                  {a.topTeams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {a.topTeams.slice(0, 15).map((t, i) => (
                        <div key={`${t.sport}-${t.team}`} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                            #{i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm truncate">{t.team}</div>
                            <div className="text-xs text-gray-500">{t.sport}</div>
                          </div>
                          <div className="text-cyan-400 font-bold text-sm">{t.fanCount} fans</div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-center py-4 text-gray-500">No favorite teams set yet</div>}
                </div>

                {/* Venue Performance */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    VENUE PERFORMANCE
                  </h3>
                  {a.venuePerf.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="text-left py-2 px-2">#</th>
                            <th className="text-left py-2 px-2">Venue</th>
                            <th className="text-left py-2 px-2">City</th>
                            <th className="text-right py-2 px-2">Parties</th>
                            <th className="text-right py-2 px-2">Attendees</th>
                            <th className="text-right py-2 px-2">Messages</th>
                            <th className="text-center py-2 px-2">Featured</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.venuePerf.map((v, i) => (
                            <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                              <td className="py-2 px-2 text-white font-medium">{v.name}</td>
                              <td className="py-2 px-2 text-gray-400">{v.city || '-'}</td>
                              <td className="py-2 px-2 text-right text-cyan-400 font-bold">{v.partiesHosted}</td>
                              <td className="py-2 px-2 text-right text-purple-400 font-bold">{v.totalAttendees}</td>
                              <td className="py-2 px-2 text-right text-pink-400 font-bold">{v.totalMessages}</td>
                              <td className="py-2 px-2 text-center">{v.featured ? <Star className="w-4 h-4 text-yellow-400 inline" /> : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <div className="text-center py-4 text-gray-500">No venue data yet</div>}
                </div>

                {/* User Cities & Hourly Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      USER LOCATIONS
                    </h3>
                    {a.userCities.length > 0 ? (
                      <div className="space-y-2">
                        {a.userCities.slice(0, 10).map((c, i) => (
                          <div key={c.city} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-white text-sm">{c.city}</span>
                            </div>
                            <span className="text-green-400 font-bold text-sm">{c.userCount} users</span>
                          </div>
                        ))}
                      </div>
                    ) : <div className="text-center py-4 text-gray-500">No city data yet</div>}
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      CHAT ACTIVITY BY HOUR
                    </h3>
                    {a.hourlyActivity.length > 0 ? (
                      <div>
                        <div className="flex items-end gap-[2px] h-24">
                          {Array.from({ length: 24 }, (_, h) => {
                            const entry = a.hourlyActivity.find(x => x.hour === h);
                            const count = entry ? entry.count : 0;
                            const max = Math.max(...a.hourlyActivity.map(x => x.count), 1);
                            return (
                              <div key={h} className="flex-1 group relative">
                                <div className="bg-pink-500/60 hover:bg-pink-400 rounded-t transition-all" style={{ height: `${Math.max((count / max) * 100, 2)}%` }} />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                  {h}:00 - {count} msgs
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
                        </div>
                      </div>
                    ) : <div className="text-center py-4 text-gray-500">No chat data yet</div>}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      RECENT SIGNUPS
                    </h3>
                    <div className="space-y-3">
                      {a.recentActivity.recentUsers.map(u => (
                        <div key={u.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm truncate">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                          <div className="text-xs text-gray-500">{new Date(u.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      RECENT PARTIES
                    </h3>
                    <div className="space-y-3">
                      {a.recentActivity.recentParties.map(p => (
                        <div key={p.id} className="bg-white/5 p-3 rounded-lg">
                          <div className="text-white text-sm font-medium truncate">{p.title || `${p.sport} Watch Party`}</div>
                          <div className="text-xs text-gray-500 mt-0.5">by {p.host_name} | {p.city || 'Unknown city'}</div>
                          <div className="flex justify-between mt-1 text-xs">
                            <span className="text-purple-400">{p.sport}</span>
                            <span className="text-cyan-400">{p.attendee_count} going</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      RECENT CHAT
                    </h3>
                    <div className="space-y-3">
                      {a.recentActivity.recentMessages.map((m, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <span className="text-cyan-400 text-xs font-bold">{m.user_name}</span>
                            <span className="text-xs text-gray-600">{new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="text-white text-sm mt-1 line-clamp-2">{m.message}</div>
                          <div className="text-xs text-gray-500 mt-0.5">in {m.party_title || 'party'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={loadAnalytics} disabled={analyticsLoading}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all text-sm font-medium">
                  {analyticsLoading ? 'Refreshing...' : 'Refresh Analytics'}
                </button>
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">Failed to load analytics. Try refreshing.</div>
            )}
          </>
        )}

        {adminTab === 'management' && (
          <>
          {/* Revenue Overview */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 sm:p-8 rounded-2xl overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              💰 REVENUE OVERVIEW
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-green-300 mb-2">Monthly Recurring Revenue (MRR)</div>
                <div className="text-4xl font-black text-white mb-1">
                  ${monthlyRecurringRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  {featuredVenues.length} Featured venues × $199/mo
                </div>
              </div>
              
              <div>
                <div className="text-sm text-green-300 mb-2">Projected Annual Revenue (ARR)</div>
                <div className="text-4xl font-black text-white mb-1">
                  ${projectedAnnualRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  Based on current subscriptions
                </div>
              </div>
              
              <div>
                <div className="text-sm text-green-300 mb-2">Average Revenue Per Venue</div>
                <div className="text-4xl font-black text-white mb-1">
                  ${venues.filter(v => v.verified).length > 0 ? 
                    Math.round(monthlyRecurringRevenue / venues.filter(v => v.verified).length) : 0}
                </div>
                <div className="text-xs text-gray-400">
                  Per month
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Total Users</div>
              <div className="text-3xl font-black text-white">{totalUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Registered accounts</div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Active Parties</div>
              <div className="text-3xl font-black text-cyan-400">{activeParties.length}</div>
              <div className="text-xs text-gray-500 mt-1">Upcoming watch parties</div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Verified Venues</div>
              <div className="text-3xl font-black text-white">{venues.filter(v => v.verified).length}</div>
              <div className="text-xs text-gray-500 mt-1">
                {featuredVenues.length} Featured, {regularVenues.length} Free
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Total Reach</div>
              <div className="text-3xl font-black text-purple-400">{totalAttendees}</div>
              <div className="text-xs text-gray-500 mt-1">People using platform</div>
            </div>
          </div>

          {/* Pending Actions */}
          {pendingClaims.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white mb-1">⚠️ Action Required</h3>
                  <p className="text-yellow-200 text-sm">
                    You have {pendingClaims.length} pending venue claim{pendingClaims.length !== 1 ? 's' : ''} to review
                  </p>
                </div>
                <button
                  onClick={() => {
                    document.getElementById('venue-claims-section').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all"
                >
                  Review Claims
                </button>
              </div>
            </div>
          )}

          {/* Sport Performance */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-8 rounded-2xl border border-white/10 overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <BarChart3 className="inline w-6 h-6 mr-2 text-cyan-400" />
              SPORT PERFORMANCE
            </h2>
            
            {Object.keys(sportStats).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No watch parties created yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(sportStats)
                  .sort((a, b) => b[1].attendees - a[1].attendees)
                  .map(([sport, stats]) => (
                    <div key={sport} className="bg-white/5 p-5 rounded-xl border border-white/10">
                      <div className="text-cyan-400 font-bold mb-2">{sport}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Parties:</span>
                          <span className="text-white font-bold">{stats.parties}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Attendees:</span>
                          <span className="text-white font-bold">{stats.attendees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Size:</span>
                          <span className="text-white font-bold">
                            {Math.round(stats.attendees / stats.parties)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Top Performing Venues */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-8 rounded-2xl border border-white/10 overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              🏆 TOP PERFORMING VENUES
            </h2>
            
            {venuePerformance.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No venues yet
              </div>
            ) : (
              <div className="space-y-3">
                {venuePerformance.slice(0, 10).map((venue, index) => (
                  <div
                    key={venue.id}
                    className="bg-white/5 p-4 rounded-xl border border-white/10"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl font-black text-gray-600 flex-shrink-0">#{index + 1}</div>
                      {venue.logo && (
                        <img src={`/api/uploads/serve/${venue.logo.replace('/objects/', '')}`} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/20 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white text-sm truncate">{venue.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <VenueBadgeDisplay totalParties={venue.partiesHosted || 0} totalFans={venue.totalAttendees || 0} />
                          {venue.subscribed && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 text-[10px] font-bold rounded-full flex items-center gap-0.5">
                              <CheckCircle className="w-2.5 h-2.5" /> SUB
                            </span>
                          )}
                          {venue.featured && (
                            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full">
                              ⭐ FEATURED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-1"><AddressLink address={venue.address} /></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-center bg-white/5 rounded-lg p-2">
                      <div>
                        <div className="text-[10px] text-gray-500">Parties</div>
                        <div className="text-sm font-bold text-white">{venue.partiesHosted}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Attendees</div>
                        <div className="text-sm font-bold text-cyan-400">{venue.totalAttendees}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Avg Size</div>
                        <div className="text-sm font-bold text-purple-400">{venue.avgPartySize}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Venue Claims */}
          <div id="venue-claims-section" className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-8 rounded-2xl border border-white/10 overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Venue Claims to Review ({pendingClaims.length} Pending)
            </h2>

            {pendingClaims.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No pending claims to review
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClaims.map(claim => (
                  <div
                    key={claim.id}
                    className="bg-white/5 p-6 rounded-xl border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{claim.venueName}</h3>
                        <div className="space-y-1 text-sm text-gray-400">
                          <div><span className="text-gray-500">Address:</span> {claim.address}</div>
                          <div><span className="text-gray-500">Type:</span> {claim.venueType}</div>
                          {claim.phone && <div><span className="text-gray-500">Phone:</span> {claim.phone}</div>}
                          {claim.website && <div><span className="text-gray-500">Website:</span> {claim.website}</div>}
                          {claim.proofDocument && <div><span className="text-gray-500">Proof:</span> {claim.proofDocument}</div>}
                          <div className="mt-2"><span className="text-gray-500">Submitted by:</span> {claim.submittedByName} ({claim.submittedBy})</div>
                          <div><span className="text-gray-500">Date:</span> {new Date(claim.submittedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveVenueClaim(claim.id)}
                        className="flex-1 py-3 bg-green-500/20 text-green-300 rounded-xl font-bold hover:bg-green-500/30 border border-green-500/30 transition-all"
                      >
                        ✓ APPROVE
                      </button>
                      <button
                        onClick={() => handleRejectVenueClaim(claim.id)}
                        className="flex-1 py-3 bg-red-500/20 text-red-300 rounded-xl font-bold hover:bg-red-500/30 border border-red-500/30 transition-all"
                      >
                        ✗ REJECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Claim History */}
            {(approvedClaims.length > 0 || rejectedClaims.length > 0) && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Recent Claim History</h3>
                <div className="space-y-2">
                  {[...approvedClaims, ...rejectedClaims]
                    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                    .slice(0, 5)
                    .map(claim => (
                      <div key={claim.id} className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-lg">
                        <div>
                          <span className="text-white font-bold">{claim.venueName}</span>
                          <span className="text-gray-500 ml-2">by {claim.submittedByName}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          claim.status === 'approved' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* All Venues Management */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-8 rounded-2xl border border-white/10 overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              All Verified Venues ({venues.filter(v => v.verified).length})
            </h2>

            <div className="space-y-3">
              {venues.filter(v => v.verified).map(venue => (
                <div
                  key={venue.id}
                  className="bg-white/5 p-4 rounded-xl border border-white/10 overflow-hidden"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {venue.logo && (
                      <img src={`/api/uploads/serve/${venue.logo.replace('/objects/', '')}`} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/20 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-white text-sm">{venue.name}</h3>
                        {venue.featured ? (
                          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full whitespace-nowrap">
                            ⭐ FEATURED ($199/mo)
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-300 text-[10px] font-bold rounded-full whitespace-nowrap">
                            FREE TIER
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate"><AddressLink address={venue.address} /></div>
                      <div className="text-[10px] text-gray-500">{venue.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-4">
                      <div>
                        <div className="text-gray-400 text-[10px]">Parties Hosted</div>
                        <div className="text-white font-bold text-sm">
                          {parties.filter(p => p.venueId === venue.id).length}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[10px]">Revenue</div>
                        <div className="text-green-400 font-bold text-sm">
                          ${venue.featured ? '199' : '0'}/mo
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            const qr = await api.qr.adminGetVenueQr(venue.id);
                            if (qr.hasQr) {
                              setAdminQrModal({ venue, qrDataUrl: qr.qrDataUrl, checkinUrl: qr.checkinUrl });
                            } else {
                              if (confirm(`Generate a QR code for ${venue.name}?`)) {
                                const result = await api.qr.adminGenerateQr(venue.id);
                                setAdminQrModal({ venue, qrDataUrl: result.qrDataUrl, checkinUrl: result.checkinUrl });
                              }
                            }
                          } catch (e) { alert(e.message); }
                        }}
                        className="px-2.5 py-1.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                      >
                        QR Code
                      </button>
                      <button
                        onClick={() => openAdminEditVenue(venue)}
                        className="px-2.5 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg text-[10px] font-bold hover:bg-cyan-500/30 border border-cyan-500/30 transition-all"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor Management Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-8 rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <DollarSign className="inline w-6 h-6 mr-2 text-green-400" />
                SPONSOR MANAGEMENT
              </h2>
              <button
                onClick={() => { resetSponsorForm(); setShowSponsorForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Sponsor
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                <div className="text-sm text-green-300 mb-1">Total Revenue</div>
                <div className="text-2xl font-black text-white">${totalSponsorRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl">
                <div className="text-sm text-cyan-300 mb-1">Active Sponsors</div>
                <div className="text-2xl font-black text-white">{activeSponsors.length}</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                <div className="text-sm text-purple-300 mb-1">Total Sponsors</div>
                <div className="text-2xl font-black text-white">{sponsors.length}</div>
              </div>
            </div>

            {showSponsorForm && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
                  </h3>
                  <button onClick={resetSponsorForm} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Sponsor/Company Name *</label>
                    <input type="text" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="e.g., Bud Light"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contact Name</label>
                    <input type="text" value={sponsorContactName} onChange={(e) => setSponsorContactName(e.target.value)}
                      placeholder="Rep name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
                    <input type="email" value={sponsorContactEmail} onChange={(e) => setSponsorContactEmail(e.target.value)}
                      placeholder="sponsor@company.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contact Phone</label>
                    <input type="tel" value={sponsorContactPhone} onChange={(e) => setSponsorContactPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                    <input type="text" value={sponsorWebsite} onChange={(e) => setSponsorWebsite(e.target.value)}
                      placeholder="sponsor-website.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Amount Paid ($)</label>
                    <input type="number" step="0.01" value={sponsorAmount} onChange={(e) => setSponsorAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Payment Frequency</label>
                    <select value={sponsorFrequency} onChange={(e) => setSponsorFrequency(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="one-time" className="bg-slate-700">One-Time</option>
                      <option value="monthly" className="bg-slate-700">Monthly</option>
                      <option value="quarterly" className="bg-slate-700">Quarterly</option>
                      <option value="yearly" className="bg-slate-700">Yearly</option>
                    </select>
                  </div>
                  {editingSponsor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select value={sponsorStatus} onChange={(e) => setSponsorStatus(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="active" className="bg-slate-700">Active</option>
                        <option value="paused" className="bg-slate-700">Paused</option>
                        <option value="ended" className="bg-slate-700">Ended</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <input type="date" value={sponsorStartDate} onChange={(e) => setSponsorStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <input type="date" value={sponsorEndDate} onChange={(e) => setSponsorEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea value={sponsorNotes} onChange={(e) => setSponsorNotes(e.target.value)}
                    rows={2} placeholder="Deal details, special terms, deliverables..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sponsor Logo</label>
                  <div className="flex items-center gap-4">
                    {sponsorLogo ? (
                      <img src={`/api/uploads/serve/${sponsorLogo.replace('/objects/', '')}`} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-white/20" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-gray-500">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <button type="button" disabled={uploadingSponsorLogo}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSponsorLogoUpload(); }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${uploadingSponsorLogo ? 'bg-gray-500 text-gray-300' : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'}`}>
                      {uploadingSponsorLogo ? 'Uploading...' : 'Upload Logo'}
                    </button>
                    {sponsorLogo && (
                      <button onClick={() => setSponsorLogo(null)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveSponsor} disabled={savingSponsor || !sponsorName}
                    className={`flex-1 py-3 font-bold rounded-xl transition-all ${savingSponsor || !sponsorName ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/50'}`}>
                    {savingSponsor ? 'Saving...' : editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
                  </button>
                  <button onClick={resetSponsorForm} className="px-6 py-3 bg-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/20 transition-all">Cancel</button>
                </div>
              </div>
            )}

            {sponsors.length === 0 && !showSponsorForm ? (
              <div className="text-center py-8 text-gray-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-bold mb-1">No sponsors yet</p>
                <p className="text-sm">Add sponsors to track their logos, deals, and revenue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sponsors.map(s => (
                  <div key={s.id} className={`bg-white/5 p-5 rounded-xl border ${s.status === 'active' ? 'border-green-500/20' : s.status === 'paused' ? 'border-yellow-500/20' : 'border-gray-500/20'}`}>
                    <div className="flex items-start gap-4">
                      {s.logo ? (
                        <img src={`/api/uploads/serve/${s.logo.replace('/objects/', '')}`} alt={s.name} className="w-14 h-14 rounded-xl object-cover border border-white/20 flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-gray-500 flex-shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-white font-bold text-lg">{s.name}</span>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${s.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : s.status === 'paused' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                            {s.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                          {s.contactName && <span>{s.contactName}</span>}
                          {s.contactEmail && <span>{s.contactEmail}</span>}
                          {s.contactPhone && <span>{s.contactPhone}</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                          <span className="text-green-400 font-bold">${(s.amountPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className="text-gray-500">{s.paymentFrequency === 'one-time' ? 'One-Time' : s.paymentFrequency.charAt(0).toUpperCase() + s.paymentFrequency.slice(1)}</span>
                          {s.startDate && <span className="text-gray-500">From: {new Date(s.startDate).toLocaleDateString()}</span>}
                          {s.endDate && <span className="text-gray-500">To: {new Date(s.endDate).toLocaleDateString()}</span>}
                        </div>
                        {s.notes && <p className="text-gray-500 text-xs mt-2 italic">"{s.notes}"</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEditSponsor(s)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-gray-300 hover:text-white" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteSponsor(s.id)} className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all text-red-400 hover:text-red-300" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {adminQrModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setAdminQrModal(null); }}>
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10" onMouseDown={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>QR CODE - {adminQrModal.venue.name}</h3>
                <button onClick={() => setAdminQrModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-2xl">
                  <img src={adminQrModal.qrDataUrl} alt="Venue QR Code" className="w-48 h-48" />
                </div>
                <p className="text-gray-400 text-sm text-center">Fans scan this to check in at {adminQrModal.venue.name}</p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `${adminQrModal.venue.name.replace(/\s+/g, '_')}_QR.png`;
                      link.href = adminQrModal.qrDataUrl;
                      link.click();
                    }}
                    className="flex-1 py-2 bg-amber-500/20 text-amber-300 font-bold rounded-xl text-sm hover:bg-amber-500/30 border border-amber-500/30"
                  >
                    Download
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(adminQrModal.checkinUrl);
                        alert('Check-in link copied!');
                      } catch (e) {}
                    }}
                    className="flex-1 py-2 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 border border-white/20"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Regenerate QR code? The old one will stop working.')) {
                        try {
                          const result = await api.qr.adminGenerateQr(adminQrModal.venue.id);
                          setAdminQrModal({ venue: adminQrModal.venue, qrDataUrl: result.qrDataUrl, checkinUrl: result.checkinUrl });
                        } catch (e) { alert(e.message); }
                      }
                    }}
                    className="flex-1 py-2 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20 border border-white/20"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {adminEditVenue && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setAdminEditVenue(null); }}>
            <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10 overscroll-contain" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EDIT VENUE</h3>
                <button onClick={() => setAdminEditVenue(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Business Name *</label>
                  <input
                    value={adminEditForm.name}
                    onChange={e => setAdminEditForm({...adminEditForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Address *</label>
                  <input
                    value={adminEditForm.address}
                    onChange={e => setAdminEditForm({...adminEditForm, address: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                  <input
                    value={adminEditForm.city}
                    onChange={e => setAdminEditForm({...adminEditForm, city: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Business Type</label>
                  <select
                    value={adminEditForm.type}
                    onChange={e => setAdminEditForm({...adminEditForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Sports Bar">Sports Bar</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Bar & Grill">Bar & Grill</option>
                    <option value="Brewery/Taproom">Brewery/Taproom</option>
                    <option value="Pub">Pub</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <input
                      value={adminEditForm.phone}
                      onChange={e => setAdminEditForm({...adminEditForm, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                    <input
                      value={adminEditForm.website}
                      onChange={e => setAdminEditForm({...adminEditForm, website: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={adminEditForm.capacity}
                    onChange={e => setAdminEditForm({...adminEditForm, capacity: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={adminEditForm.description}
                    onChange={e => setAdminEditForm({...adminEditForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminEditForm.featured}
                    onChange={e => setAdminEditForm({...adminEditForm, featured: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-white/10"
                  />
                  <span className="text-sm text-gray-300">Featured Venue ($199/mo)</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAdminEditVenue(null)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminSaveVenue}
                  disabled={adminSavingVenue || !adminEditForm.name || !adminEditForm.address}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    adminSavingVenue || !adminEditForm.name || !adminEditForm.address
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-cyan-500/30 hover:shadow-lg'
                  }`}
                >
                  {adminSavingVenue ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
        </>
        )}

      </div>
    </div>
    );
  };

  const [cpUseVerifiedVenue, setCpUseVerifiedVenue] = useState(true);
  const [cpSelectedVenueId, setCpSelectedVenueId] = useState('');
  const [cpCustomLocation, setCpCustomLocation] = useState('');
  const [cpCustomAddress, setCpCustomAddress] = useState('');
  const [cpCustomCity, setCpCustomCity] = useState('');
  const [cpCustomState, setCpCustomState] = useState('');
  const [cpCustomTime, setCpCustomTime] = useState('');
  const [cpCapacity, setCpCapacity] = useState('');
  const [cpNotes, setCpNotes] = useState('');
  const [cpSupportedTeam, setCpSupportedTeam] = useState('');

  const handleCpSubmit = () => {
    let location = '';
    let venueId = null;
    
    if (cpUseVerifiedVenue) {
      if (!cpSelectedVenueId) {
        alert('Please select a venue');
        return;
      }
      const venue = venues.find(v => v.id === cpSelectedVenueId);
      location = `${venue.name} - ${venue.address}`;
      venueId = cpSelectedVenueId;
    } else {
      if (!cpCustomLocation) {
        alert('Please enter a location');
        return;
      }
      location = cpCustomLocation;
    }

    const venue = cpUseVerifiedVenue ? venues.find(v => v.id === cpSelectedVenueId) : null;
    const customFullAddress = [cpCustomAddress, cpCustomCity, cpCustomState].filter(Boolean).join(', ');
    handleCreateParty({
      gameId: selectedGame.id,
      sport: selectedGame.sport,
      homeTeam: selectedGame.homeTeam,
      awayTeam: selectedGame.awayTeam,
      gameTime: cpCustomTime || selectedGame.gameTime || selectedGame.startTime,
      venueName: venue ? venue.name : cpCustomLocation,
      venueAddress: venue ? venue.address : (customFullAddress || ''),
      city: venue ? (venue.city || '') : (cpCustomCity || ''),
      title: cpSupportedTeam ? `Go ${cpSupportedTeam}!` : `${selectedGame.awayTeam} @ ${selectedGame.homeTeam}`,
      notes: cpNotes,
      maxSize: cpCapacity ? parseInt(cpCapacity) : null,
      supportedTeam: cpSupportedTeam || null
    });
    setCpSupportedTeam('');
  };

  const createPartyScreenJSX = () => selectedGame ? (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setCurrentScreen('gameDetail')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              CREATE WATCH PARTY
            </h2>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="text-sm text-cyan-300 font-bold mb-1">GAME</div>
              <div className="text-white font-bold">
                {selectedGame.homeTeam} vs {selectedGame.awayTeam}
              </div>
              <div className="text-gray-400 text-sm">
                {formatDateTime(selectedGame.startTime)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Which team are you rooting for? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[selectedGame.homeTeam, selectedGame.awayTeam].filter(Boolean).map(team => {
                  const logo = getTeamLogoUrl(selectedGame.sport, team);
                  const colors = getTeamColors(selectedGame.sport, team);
                  const isSelected = cpSupportedTeam === team;
                  return (
                    <button
                      key={team}
                      onClick={() => setCpSupportedTeam(isSelected ? '' : team)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-yellow-400 shadow-lg shadow-yellow-500/20'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={isSelected && colors ? {
                        background: `linear-gradient(135deg, ${colors[0]}cc, ${colors[1]}66)`
                      } : { background: 'rgba(255,255,255,0.05)' }}
                    >
                      {logo && <img src={logo} alt="" className="w-10 h-10 object-contain" />}
                      <span className="text-white font-bold text-sm">{team}</span>
                      {isSelected && <span className="ml-auto text-yellow-400 text-lg">✓</span>}
                    </button>
                  );
                })}
              </div>
              {!cpSupportedTeam && (
                <p className="text-xs text-gray-500 mt-2">Select the team your watch party will be cheering for</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Location Type
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setCpUseVerifiedVenue(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    cpUseVerifiedVenue
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Building2 className="w-5 h-5 inline mr-2" />
                  Verified Venue
                </button>
                <button
                  onClick={() => setCpUseVerifiedVenue(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    !cpUseVerifiedVenue
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <MapPin className="w-5 h-5 inline mr-2" />
                  Custom Location
                </button>
              </div>
            </div>

            {cpUseVerifiedVenue ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Verified Venue *
                </label>
                <select
                  value={cpSelectedVenueId}
                  onChange={(e) => setCpSelectedVenueId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Choose a venue...</option>
                  {venues.filter(v => v.verified).map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.subscribed ? '✓ ' : ''}{venue.featured ? '⭐ ' : ''}{venue.name} - {venue.address}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Verified venues are legitimate businesses we've confirmed
                </p>
                <button
                  onClick={() => setCurrentScreen('claimVenue')}
                  className="text-cyan-400 text-sm hover:text-cyan-300 mt-2"
                >
                  Don't see your venue? Claim it here →
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Location *
                </label>
                <input
                  type="text"
                  value={cpCustomLocation}
                  onChange={(e) => setCpCustomLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., My house, Dave's apartment, etc."
                />
                <p className="text-xs text-gray-500 mt-1">For home watch parties or informal meetups</p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 mt-4">
                  <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Address Details (optional)
                  </div>
                  <p className="text-xs text-gray-500">Adding an address helps guests find you and shows a map</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={cpCustomAddress}
                      onChange={(e) => setCpCustomAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., 123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">City</label>
                      <input
                        type="text"
                        value={cpCustomCity}
                        onChange={(e) => setCpCustomCity(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="e.g., Austin"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">State</label>
                      <select
                        value={cpCustomState}
                        onChange={(e) => setCpCustomState(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Select state</option>
                        {US_STATES.map(st => (
                          <option key={st} value={st}>{st} - {US_STATE_NAMES[st]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {cpCustomAddress && cpCustomCity && (
                    <div className="text-xs text-gray-500 bg-white/5 rounded-lg p-2">
                      Full address: {[cpCustomAddress, cpCustomCity, cpCustomState].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Time (optional)
              </label>
              <input
                type="text"
                value={cpCustomTime}
                onChange={(e) => setCpCustomTime(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Meet at 5:30 PM (game starts at 6 PM)"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to use game start time</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capacity (optional)
              </label>
              <input
                type="number"
                value={cpCapacity}
                onChange={(e) => setCpCapacity(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Max number of people"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes / Description (optional)
              </label>
              <textarea
                value={cpNotes}
                onChange={(e) => setCpNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Any additional details about your watch party..."
              />
            </div>

            <button
              onClick={handleCpSubmit}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
            >
              CREATE PARTY
            </button>
          </div>
        </div>
      </div>
  ) : null;

  const VenueAnalyticsDashboard = () => {
    const startEditing = () => {
      setVenueEditName(userVenue.name || '');
      setVenueEditAddress(userVenue.address || '');
      setVenueEditCity(userVenue.city || '');
      setVenueEditType(userVenue.type || '');
      setVenueEditPhone(userVenue.phone || '');
      setVenueEditWebsite(userVenue.website || '');
      setVenueEditCapacity(userVenue.capacity ? String(userVenue.capacity) : '');
      setVenueEditDescription(userVenue.description || '');
      setEditingVenue(true);
    };

    const handleVenueImageUpload = async (imageType) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Image must be under 5MB');
          return;
        }
        const setter = imageType === 'logo' ? setUploadingLogo : setUploadingPicture;
        setter(true);
        try {
          const fileBuffer = await file.arrayBuffer();
          const uploadRes = await fetch('/api/uploads/venue-image/upload', {
            method: 'POST',
            headers: { 'Content-Type': file.type, 'x-image-type': imageType },
            credentials: 'include',
            body: fileBuffer,
          });
          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}));
            throw new Error(errData.error || 'Upload failed');
          }
          const { objectPath } = await uploadRes.json();
          await api.venues.updateMine({
            name: userVenue.name,
            address: userVenue.address,
            [imageType]: objectPath
          });
          await loadVenues();
        } catch (err) {
          alert('Failed to upload image: ' + err.message);
        }
        setter(false);
      };
      input.click();
    };

    const saveVenueDetails = async () => {
      setSavingVenue(true);
      try {
        await api.venues.updateMine({
          name: venueEditName,
          address: venueEditAddress,
          city: venueEditCity,
          type: venueEditType,
          phone: venueEditPhone,
          website: venueEditWebsite,
          capacity: venueEditCapacity ? parseInt(venueEditCapacity) : null,
          description: venueEditDescription
        });
        await loadVenues();
        setEditingVenue(false);
      } catch (error) {
        alert(error.message);
      }
      setSavingVenue(false);
    };

    if (!userVenue) {
      return (
        <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Venue Found</h2>
            <p className="text-gray-400 mb-6">You don't have a claimed venue yet.</p>
            <button
              onClick={() => setCurrentScreen('claimVenue')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl"
            >
              Claim Your Venue
            </button>
          </div>
        </div>
      );
    }

    // Calculate analytics
    const venueParties = parties.filter(p => p.venueId === userVenue.id);
    const totalAttendees = venueParties.reduce((sum, party) => sum + party.attendees.length, 0);
    const upcomingParties = venueParties.filter(party => {
      const game = games.find(g => g.id === party.gameId);
      return game && new Date(game.startTime) > new Date();
    });
    
    // Sport breakdown
    const sportBreakdown = {};
    venueParties.forEach(party => {
      const game = games.find(g => g.id === party.gameId);
      if (game) {
        sportBreakdown[game.sport] = (sportBreakdown[game.sport] || 0) + 1;
      }
    });

    // Recent parties
    const recentParties = venueParties
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentScreen('games')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex items-center gap-2">
                {userVenue.featured && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-bold rounded-full border border-purple-500/30">
                    ⭐ FEATURED VENUE
                  </span>
                )}
                {userVenue.verified && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-bold rounded-full border border-green-500/30 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    VERIFIED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Venue Header */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl">
            {!editingVenue ? (
              <>
                {userVenue.picture && (
                  <div className="mb-6 -mt-2 -mx-2 rounded-xl overflow-hidden">
                    <img src={`/api/uploads/serve/${userVenue.picture.replace('/objects/', '')}`} alt={userVenue.name} className="w-full h-48 object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {userVenue.logo && (
                      <img src={`/api/uploads/serve/${userVenue.logo.replace('/objects/', '')}`} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-white/20" />
                    )}
                    <div>
                      <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                        {userVenue.name}
                      </h1>
                      <p className="text-gray-400 mb-1"><AddressLink address={userVenue.address} /></p>
                      {userVenue.city && <p className="text-gray-400 text-sm mb-1">{userVenue.city}</p>}
                      <p className="text-sm text-gray-500">{userVenue.type}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-400">
                        {userVenue.phone && <span>Phone: {userVenue.phone}</span>}
                        {userVenue.website && <span>Web: {userVenue.website}</span>}
                        {userVenue.capacity && <span>Seats: {userVenue.capacity}</span>}
                      </div>
                      {userVenue.description && (
                        <p className="text-gray-400 text-sm mt-3 italic">"{userVenue.description}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Your Plan</div>
                      <div className="text-2xl font-black text-cyan-400">
                        {userVenue.featured ? 'FEATURED' : 'FREE'}
                      </div>
                    </div>
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm font-bold border border-white/20"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Details
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    EDIT VENUE DETAILS
                  </h2>
                  <button
                    onClick={() => setEditingVenue(false)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Name *</label>
                    <input type="text" value={venueEditName} onChange={(e) => setVenueEditName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Type</label>
                    <select value={venueEditType} onChange={(e) => setVenueEditType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="Sports Bar" className="bg-slate-700 text-white">Sports Bar</option>
                      <option value="Restaurant & Bar" className="bg-slate-700 text-white">Restaurant & Bar</option>
                      <option value="Brewery/Taproom" className="bg-slate-700 text-white">Brewery/Taproom</option>
                      <option value="Entertainment Venue" className="bg-slate-700 text-white">Entertainment Venue</option>
                      <option value="Other" className="bg-slate-700 text-white">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Address *</label>
                    <input type="text" value={venueEditAddress} onChange={(e) => setVenueEditAddress(e.target.value)}
                      placeholder="123 Main St, Suite #110"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">City, State</label>
                    <input type="text" value={venueEditCity} onChange={(e) => setVenueEditCity(e.target.value)}
                      placeholder="e.g., Fort Lauderdale, FL"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                    <input type="tel" value={venueEditPhone} onChange={(e) => setVenueEditPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                    <input type="text" value={venueEditWebsite} onChange={(e) => setVenueEditWebsite(e.target.value)}
                      placeholder="yourwebsite.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Seating Capacity</label>
                    <input type="number" value={venueEditCapacity} onChange={(e) => setVenueEditCapacity(e.target.value)}
                      placeholder="e.g., 150"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Venue Description & Special Features</label>
                  <textarea value={venueEditDescription} onChange={(e) => setVenueEditDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell fans what makes your venue great! e.g., 20 big screens, outdoor patio, game day drink specials, private party rooms..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Venue Logo</label>
                    <div className="flex items-center gap-4">
                      {userVenue.logo ? (
                        <img src={`/api/uploads/serve/${userVenue.logo.replace('/objects/', '')}`} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-white/20" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-gray-500">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      <button type="button" disabled={uploadingLogo}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVenueImageUpload('logo'); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${uploadingLogo ? 'bg-gray-500 text-gray-300' : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'}`}>
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Square image works best (e.g., 200x200)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Venue Photo</label>
                    <div className="flex items-center gap-4">
                      {userVenue.picture ? (
                        <img src={`/api/uploads/serve/${userVenue.picture.replace('/objects/', '')}`} alt="Venue" className="w-24 h-16 rounded-xl object-cover border border-white/20" />
                      ) : (
                        <div className="w-24 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-gray-500">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                      <button type="button" disabled={uploadingPicture}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVenueImageUpload('picture'); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${uploadingPicture ? 'bg-gray-500 text-gray-300' : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'}`}>
                        {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Show fans what your venue looks like</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={saveVenueDetails}
                    disabled={savingVenue || !venueEditName || !venueEditAddress}
                    className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                      savingVenue || !venueEditName || !venueEditAddress
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                    }`}
                  >
                    {savingVenue ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditingVenue(false)}
                    className="px-6 py-3 bg-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upgrade CTA - only show if not featured */}
          {!userVenue.featured && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6 rounded-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-2">Upgrade to Featured</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Get 3x more visibility! Featured venues appear first in party creation and get priority placement in search results.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-4">
                    <li>✓ ⭐ Featured badge on all your parties</li>
                    <li>✓ Top of venue selection dropdown</li>
                    <li>✓ Priority in search results</li>
                    <li>✓ Advanced analytics & insights</li>
                  </ul>
                  <div className="text-2xl font-black text-white mb-4">
                    $99<span className="text-sm text-gray-400">/month</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                  UPGRADE NOW
                </button>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-sm text-gray-400">Total Reach</div>
              </div>
              <div className="text-3xl font-black text-white">{totalAttendees}</div>
              <div className="text-xs text-gray-500 mt-1">People found you</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-sm text-gray-400">Total Parties</div>
              </div>
              <div className="text-3xl font-black text-white">{venueParties.length}</div>
              <div className="text-xs text-gray-500 mt-1">All time</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-sm text-gray-400">Upcoming</div>
              </div>
              <div className="text-3xl font-black text-white">{upcomingParties.length}</div>
              <div className="text-xs text-gray-500 mt-1">Next 7 days</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-sm text-gray-400">Avg Party Size</div>
              </div>
              <div className="text-3xl font-black text-white">
                {venueParties.length > 0 ? Math.round(totalAttendees / venueParties.length) : 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">People per party</div>
            </div>
          </div>

          {/* Sport Breakdown */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <BarChart3 className="inline w-6 h-6 mr-2 text-cyan-400" />
              Sport Breakdown
            </h2>
            
            {Object.keys(sportBreakdown).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No watch parties yet
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(sportBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sport, count]) => {
                    const percentage = Math.round((count / venueParties.length) * 100);
                    return (
                      <div key={sport}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">{sport}</span>
                          <span className="text-gray-400 text-sm">{count} parties ({percentage}%)</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recent Parties */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Recent Watch Parties
            </h2>
            
            {recentParties.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No watch parties yet. People will start hosting at your venue soon!
              </div>
            ) : (
              <div className="space-y-3">
                {recentParties.map(party => {
                  const game = games.find(g => g.id === party.gameId);
                  if (!game) return null;
                  
                  return (
                    <div
                      key={party.id}
                      className="bg-white/5 p-5 rounded-xl border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full">
                            {game.sport}
                          </span>
                          <span className="text-white font-bold">
                            {game.homeTeam} vs {game.awayTeam}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Hosted by {party.hostName} • {party.attendees.length} attendees
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(party.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Promote & Share Section */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-2 border-emerald-500/30 p-6 rounded-2xl space-y-5">
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <Share2 className="inline w-6 h-6 mr-2 text-emerald-400" />
              PROMOTE YOUR VENUE
            </h2>
            <p className="text-gray-300 text-sm">Share your venue with fans and drive more watch parties to your business.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  const shareUrl = window.location.origin;
                  const text = `Watch the game at ${userVenue.name}! Find watch parties and join the crew on Huddle Up.`;
                  if (navigator.share) {
                    try { await navigator.share({ title: userVenue.name + ' on Huddle Up', text, url: shareUrl }); } catch (e) {}
                  } else {
                    try {
                      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
                      setShowShareToast(true);
                      setTimeout(() => setShowShareToast(false), 2000);
                    } catch (e) {}
                  }
                }}
                className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all text-sm"
              >
                <Share2 className="w-5 h-5" />
                Share Your Venue
              </button>

              <button
                onClick={shareApp}
                className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-sm"
              >
                <Users className="w-5 h-5" />
                Invite Fans to Huddle Up
              </button>

              <button
                onClick={async () => {
                  const shareUrl = window.location.origin;
                  const text = `🏈 Watch parties happening at ${userVenue.name}! Download Huddle Up to find your crew and join the fun.`;
                  try {
                    await navigator.clipboard.writeText(`${text} ${shareUrl}`);
                    setShowShareToast(true);
                    setTimeout(() => setShowShareToast(false), 2000);
                  } catch (e) {}
                }}
                className="flex items-center justify-center gap-3 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm"
              >
                <span className="text-lg">📋</span>
                Copy Social Media Post
              </button>

              <button
                onClick={() => setCurrentScreen('games')}
                className="flex items-center justify-center gap-3 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm"
              >
                <Calendar className="w-5 h-5" />
                Create a Watch Party
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-white font-bold text-sm">Quick promo ideas:</p>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li>• Post your Huddle Up link on Instagram, Facebook, and X</li>
                <li>• Add a QR code or table tent: "Find tonight's watch party on Huddle Up!"</li>
                <li>• Text your regulars the link before big game days</li>
                <li>• Offer a game day special and mention it in your party description</li>
              </ul>
            </div>
          </div>

          <VenueQrSection userVenue={userVenue} />

          {/* Tips for Venues */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-6 rounded-2xl">
            <h3 className="text-lg font-black text-white mb-4">💡 Tips to Get More Watch Parties</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Promote your Huddle Up presence on social media and in-store</li>
              <li>• Offer specials during big games to attract more groups</li>
              <li>• Encourage hosts to leave notes about your venue's amenities</li>
              <li>• Consider upgrading to Featured to appear first in searches</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };



  const MyPartiesScreen = () => {
    const [deletingPartyId, setDeletingPartyId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [leavingPartyId, setLeavingPartyId] = useState(null);
    const myParties = parties.filter(party => userParties.includes(party.id));
    const hostedParties = myParties.filter(party => party.hostEmail === user.email);
    const joinedParties = myParties.filter(party => party.hostEmail !== user.email);

    const handleDeleteParty = async (partyId) => {
      setDeletingPartyId(partyId);
      try {
        await api.parties.delete(partyId);
        await loadParties();
        setConfirmDeleteId(null);
      } catch (err) {
        alert('Could not delete party: ' + err.message);
      } finally {
        setDeletingPartyId(null);
      }
    };

    const handleLeaveParty = async (partyId) => {
      setLeavingPartyId(partyId);
      try {
        await api.parties.leave(partyId);
        await loadParties();
      } catch (err) {
        alert('Could not leave party: ' + err.message);
      } finally {
        setLeavingPartyId(null);
      }
    };

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setCurrentScreen('games')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            MY WATCH PARTIES
          </h2>

          {myParties.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">You haven't joined any watch parties yet</p>
              <button
                onClick={() => setCurrentScreen('games')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl"
              >
                Browse Games
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {hostedParties.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-orange-300 mb-3">Hosting ({hostedParties.length})</h3>
                  <div className="space-y-3">
                    {hostedParties.map(party => (
                      <div
                        key={party.id}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                              HOST
                            </span>
                            <span className="text-white font-bold">
                              {party.homeTeam} vs {party.awayTeam}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditParty(party)}
                              className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                            >
                              Edit
                            </button>
                            {confirmDeleteId === party.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteParty(party.id)}
                                  disabled={deletingPartyId === party.id}
                                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                  {deletingPartyId === party.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1.5 bg-white/10 text-gray-300 text-xs rounded-lg hover:bg-white/20 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(party.id)}
                                className="px-2 py-1.5 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all"
                                title="Delete party"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <AddressLink address={party.venueAddress || party.venueName || party.location} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{party.gameTime || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            {party.attendees.length}{party.maxSize ? ` / ${party.maxSize}` : ''} people joined
                          </div>
                          {party.notes && (
                            <p className="text-gray-500 text-xs mt-1">{party.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {joinedParties.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-cyan-300 mb-3">Joined ({joinedParties.length})</h3>
                  <div className="space-y-3">
                    {joinedParties.map(party => (
                      <div
                        key={party.id}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-white font-bold">
                            {party.homeTeam} vs {party.awayTeam}
                          </div>
                          <button
                            onClick={() => handleLeaveParty(party.id)}
                            disabled={leavingPartyId === party.id}
                            className="px-3 py-1.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-50"
                          >
                            {leavingPartyId === party.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Leave'}
                          </button>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>Hosted by {party.hostName}</div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <AddressLink address={party.venueAddress || party.venueName || party.location} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{party.gameTime || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            {party.attendees.length} people joined
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SponsorDashboard = () => {
    const [sponsorData, setSponsorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', tagline: '', website: '', logo: '', targetSports: [] });

    useEffect(() => {
      const load = async () => {
        try {
          const data = await api.sponsors.me();
          if (data) {
            setSponsorData(data);
            setForm({ name: data.name || '', tagline: data.tagline || '', website: data.website || '', logo: data.logo || '', targetSports: data.targetSports || [] });
          }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      };
      load();
    }, []);

    const handleSave = async () => {
      setSaving(true);
      try {
        await api.sponsors.updateMe(form);
        alert('Sponsor profile saved!');
      } catch (err) { alert('Error: ' + err.message); }
      finally { setSaving(false); }
    };

    const handleLogoUpload = async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (ev) => {
        const file = ev.target.files?.[0];
        if (!file || file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
        try {
          const fileBuffer = await file.arrayBuffer();
          const uploadRes = await fetch('/api/uploads/venue-image/upload', {
            method: 'POST',
            headers: { 'Content-Type': file.type, 'X-Image-Type': 'sponsor-logo' },
            credentials: 'include',
            body: fileBuffer,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.objectPath) {
            setForm(f => ({ ...f, logo: uploadData.objectPath }));
          }
        } catch (err) { alert('Upload failed: ' + err.message); }
      };
      input.click();
    };

    const toggleSport = (sport) => {
      setForm(f => ({
        ...f,
        targetSports: f.targetSports.includes(sport)
          ? f.targetSports.filter(s => s !== sport)
          : [...f.targetSports, sport]
      }));
    };

    if (loading) return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    );

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button onClick={() => setCurrentScreen('profile')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Profile
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <Megaphone className="inline w-7 h-7 mr-2 text-orange-400" />
            SPONSOR DASHBOARD
          </h2>

          {!sponsorData ? (
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center">
              <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No sponsor profile found.</p>
              <p className="text-gray-500 text-sm">Subscribe to the Sponsor plan to manage your banner ad.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-6 rounded-2xl border border-orange-500/30">
                <h3 className="text-lg font-bold text-orange-300 mb-4">Your Banner Ad</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Business / Brand Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your Business Name" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tagline / Message</label>
                    <input type="text" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Reach sports fans nationwide!" maxLength={80} />
                    <p className="text-xs text-gray-500 mt-1">{form.tagline.length}/80 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Website URL</label>
                    <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://yourbusiness.com" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Logo</label>
                    <div className="flex items-center gap-3">
                      {form.logo ? (
                        <img src={`/api/uploads/serve/${form.logo}`} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-white/20" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <button onClick={handleLogoUpload} className="px-4 py-2 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-colors">
                        {form.logo ? 'Change Logo' : 'Upload Logo'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Target Sports (your ad shows on these sport pages)</label>
                    <div className="flex flex-wrap gap-2">
                      {SPORTS.filter(s => s !== 'All').map(sport => (
                        <button key={sport} onClick={() => toggleSport(sport)}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                            form.targetSports.includes(sport)
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          }`}>
                          {SPORT_ICONS[sport] || '🏅'} {sport}
                        </button>
                      ))}
                    </div>
                    {form.targetSports.length === 0 && (
                      <p className="text-xs text-amber-400 mt-2">Select at least one sport, or your ad will show on all pages.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">Banner Preview</h3>
                <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-600/40 to-amber-600/40 p-4">
                  <div className="flex items-center gap-3">
                    {form.logo ? (
                      <img src={`/api/uploads/serve/${form.logo}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <span className="text-2xl">📢</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm">{form.name || 'Your Brand'}</div>
                      <div className="text-orange-200 text-xs">{form.tagline || 'Your tagline here'}</div>
                    </div>
                    {form.website && (
                      <span className="px-3 py-1 bg-orange-500/30 text-orange-200 text-xs font-bold rounded-full">Visit</span>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={handleSave} disabled={saving || !form.name}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Sponsor Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProfileScreen = () => {
    const myParties = parties.filter(party => userParties.includes(party.id));
    const hostedParties = myParties.filter(party => party.hostEmail === user.email);
    const joinedParties = myParties.filter(party => party.hostEmail !== user.email);

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentScreen('games')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <ProfileAvatar src={user.profilePicture} name={user.name} size="xl" className="border-4 border-cyan-500/30" />
                <button type="button" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (ev) => {
                      const file = ev.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image must be under 5MB');
                        return;
                      }
                      if (!file.type.startsWith('image/')) {
                        alert('Please select an image file');
                        return;
                      }
                      try {
                        const fileBuffer = await file.arrayBuffer();
                        const uploadRes = await fetch('/api/uploads/profile-picture/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': file.type },
                          credentials: 'include',
                          body: fileBuffer,
                        });
                        if (!uploadRes.ok) {
                          const errData = await uploadRes.json().catch(() => ({}));
                          throw new Error(errData.error || 'Upload failed');
                        }
                        const { objectPath } = await uploadRes.json();
                        setUser({ ...user, profilePicture: objectPath });
                      } catch (err) {
                        alert('Failed to upload photo: ' + err.message);
                      }
                    };
                    input.click();
                  }}>
                  <Camera className="w-8 h-8 text-white" />
                </button>
                {!user.profilePicture && (
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1.5 border-2 border-slate-800">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {user.name}
                </h1>
                <p className="text-gray-400 text-sm">{user.email}</p>
                {user.subscriptionTier && user.subscriptionTier !== 'free' && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs font-bold border ${
                    user.subscriptionTier === 'sponsor' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                    user.subscriptionTier === 'venue' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {user.subscriptionTier === 'sponsor' ? '📢 Sponsor' :
                     user.subscriptionTier === 'venue' ? '🏪 Venue Owner' :
                     '🏟️ Fan'}
                  </span>
                )}
                {user.dateOfBirth && (
                  <p className="text-sm text-gray-400 mt-1">
                    Age: {(() => {
                      const dob = new Date(user.dateOfBirth);
                      const today = new Date();
                      let age = today.getFullYear() - dob.getFullYear();
                      const m = today.getMonth() - dob.getMonth();
                      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                      return age;
                    })()}
                  </p>
                )}
                {user.country && (
                  <p className="text-sm mt-1">
                    <span className="text-lg mr-1">{COUNTRY_FLAGS[user.country] || '🌍'}</span>
                    <span className="text-cyan-300 font-semibold">{user.country}</span>
                  </p>
                )}
                <button
                  onClick={() => setEditProfileOpen(true)}
                  className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto"
                >
                  <Pencil className="w-4 h-4" /> Edit Profile
                </button>
                {!user.profilePicture && (
                  <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Add a profile photo for trust & transparency
                  </p>
                )}
                {user.profilePicture && (
                  <button
                    onClick={async () => {
                      if (confirm('Remove your profile picture?')) {
                        try {
                          await api.users.removeProfilePicture();
                          setUser({ ...user, profilePicture: null });
                        } catch (err) {
                          alert(err.message);
                        }
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 mt-2"
                  >
                    Remove photo
                  </button>
                )}
              </div>
              <BadgeDisplay attended={badgeStats.partiesAttended} hosted={badgeStats.partiesHosted} size="lg" />
              <div className="flex gap-6 mt-2">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{badgeStats.partiesAttended}</div>
                  <div className="text-gray-400 text-xs">Attended</div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{badgeStats.partiesHosted}</div>
                  <div className="text-gray-400 text-xs">Hosted</div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{badgeStats.partiesAttended + badgeStats.partiesHosted}</div>
                  <div className="text-gray-400 text-xs">Total</div>
                </div>
              </div>
              {(() => {
                const badge = getFanBadge(badgeStats.partiesAttended, badgeStats.partiesHosted);
                const total = badgeStats.partiesAttended + badgeStats.partiesHosted;
                const nextTier = total < 1 ? 1 : total < 5 ? 5 : total < 10 ? 10 : total < 25 ? 25 : total < 50 ? 50 : null;
                if (!nextTier) return null;
                const progress = Math.round((total / nextTier) * 100);
                return (
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{badge.tier}</span>
                      <span>{total}/{nextTier} to next rank</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${badge.color} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {editProfileOpen && (
            <EditProfileModal
              user={user}
              onClose={() => setEditProfileOpen(false)}
              onSave={async (data) => {
                const updatedUser = await api.users.updateProfile(data);
                setUser(updatedUser);
                setEditProfileOpen(false);
              }}
            />
          )}

          <div>
            <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              My Watch Parties
            </h2>

            {myParties.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">You haven't joined any watch parties yet</p>
                <button
                  onClick={() => setCurrentScreen('games')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl"
                >
                  Browse Games
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {hostedParties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-300 mb-3">Hosting ({hostedParties.length})</h3>
                    <div className="space-y-3">
                      {hostedParties.map(party => {
                        const game = SAMPLE_GAMES.find(g => g.gameId === party.gameId);
                        return (
                          <div
                            key={party.id}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-white/10"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                                HOST
                              </span>
                            </div>
                            <div className="text-white font-bold mb-1">
                              {party.homeTeam || SAMPLE_GAMES.find(g => g.id === party.gameId)?.homeTeam} vs{' '}
                              {party.awayTeam || SAMPLE_GAMES.find(g => g.id === party.gameId)?.awayTeam}
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                <AddressLink address={party.venueName || party.location} />
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {party.attendees.length} people joined
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {joinedParties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-300 mb-3">Joined ({joinedParties.length})</h3>
                    <div className="space-y-3">
                      {joinedParties.map(party => (
                        <div
                          key={party.id}
                          className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-white/10"
                        >
                          <div className="text-white font-bold mb-1">
                            {party.homeTeam || SAMPLE_GAMES.find(g => g.id === party.gameId)?.homeTeam} vs{' '}
                            {party.awayTeam || SAMPLE_GAMES.find(g => g.id === party.gameId)?.awayTeam}
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Hosted by {party.hostName}</div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <AddressLink address={party.venueName || party.location} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {user.subscriptionTier === 'sponsor' && (
            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-6 rounded-2xl border border-orange-500/30 shadow-xl">
              <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Megaphone className="inline w-6 h-6 mr-2 text-orange-400" />
                SPONSOR DASHBOARD
              </h2>
              <p className="text-gray-400 text-sm mb-4">Manage your banner ad, logo, and target sports.</p>
              <button
                onClick={() => setCurrentScreen('sponsorDashboard')}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Open Sponsor Dashboard
              </button>
            </div>
          )}

          <SubscriptionSection />

          <ReferralSection user={user} />

          <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
            <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <Share2 className="inline w-6 h-6 mr-2 text-emerald-400" />
              INVITE FRIENDS
            </h2>
            <p className="text-gray-400 text-sm mb-4">Share Huddle Up with your friends so they can join your watch parties!</p>
            <button
              onClick={shareApp}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" /> Share Huddle Up
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              NOTIFICATIONS
            </h2>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
              <div>
                <div className="text-white font-semibold">Fan Party Alerts</div>
                <div className="text-gray-400 text-sm mt-1">
                  Get notified when a fellow fan of your favorite team creates a new watch party
                </div>
              </div>
              <button
                onClick={toggleNotifications}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  user.notificationsEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  user.notificationsEnabled ? 'translate-x-7' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                <div>
                  <div className="text-white font-semibold flex items-center gap-2">
                    <span>📱</span> Text Message Alerts
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    Get a "HUDDLE UP" text when a watch party is created for your team in your city
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const newVal = !user.smsNotifications;
                    if (newVal && !user.phoneNumber) {
                      alert('Please add your phone number below first');
                      return;
                    }
                    if (newVal && !user.userCity) {
                      alert('Please add your city below first');
                      return;
                    }
                    try {
                      await api.users.updateSmsSettings({
                        phoneNumber: user.phoneNumber,
                        userCity: user.userCity,
                        smsNotifications: newVal
                      });
                      setUser(prev => ({ ...prev, smsNotifications: newVal }));
                    } catch (err) { alert(err.message); }
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    user.smsNotifications ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    user.smsNotifications ? 'translate-x-7' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <SmsFieldsSection user={user} setUser={setUser} />
              {!user.smsNotifications && (
                <p className="text-xs text-gray-500 italic">Add your phone number and city, then enable the toggle to receive text alerts when parties match your teams.</p>
              )}
            </div>
          </div>

          {/* MY COUNTRY SECTION */}
          <div className="bg-gradient-to-br from-amber-900/30 to-slate-900 p-6 rounded-2xl border border-amber-500/20 shadow-xl">
            <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              🌍 MY COUNTRY
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Select the country you support for the FIFA World Cup and other international events!
            </p>
            <select
              value={user.country || ''}
              onChange={async (e) => {
                const country = e.target.value;
                try {
                  await api.users.updateCountry(country);
                  setUser({ ...user, country: country || null });
                } catch (err) {
                  alert(err.message);
                }
              }}
              className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select your country...</option>
              {COUNTRIES_LIST.map(c => (
                <option key={c} value={c}>{COUNTRY_FLAGS[c]} {c}</option>
              ))}
            </select>
            {user.country && (
              <div className="mt-4 flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                <span className="text-4xl">{COUNTRY_FLAGS[user.country] || '🌍'}</span>
                <div>
                  <div className="text-white font-bold">{user.country}</div>
                  <div className="text-amber-300 text-xs">Your country for international events</div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.users.updateCountry('');
                      setUser({ ...user, country: null });
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                  className="ml-auto text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* MY FAVORITE TEAMS SECTION */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              MY FAVORITE TEAMS
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Select your favorite teams so you can find fellow fans anywhere!
            </p>

            <div className="space-y-4">
              {['NFL', 'NBA', 'MLB', 'NHL', 'College Football', 'College Basketball', 'Premier League', 'La Liga', 'Liga MX', 'MLS', 'Champions League', 'Formula 1', 'Tennis', 'Rugby', 'Cricket', 'FIFA World Cup'].map(sport => {
                const currentTeam = user.favoriteTeams?.[sport];
                return (
                  <div key={sport} className="bg-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold flex items-center gap-2">
                        <span>{SPORT_ICONS[sport] || '🏅'}</span> {sport}
                      </span>
                      {currentTeam && (
                        <button
                          onClick={() => removeFavoriteTeam(sport)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <select
                      value={currentTeam || ''}
                      onChange={(e) => updateFavoriteTeams(sport, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select your {sport} team...</option>
                      {TEAMS_BY_SPORT[sport]?.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                    {currentTeam && (
                      <div className="mt-2 flex items-center gap-2 text-cyan-400 text-sm">
                        {(() => {
                          const logoUrl = getTeamLogoUrl(sport, currentTeam);
                          return logoUrl ? (
                            <img src={logoUrl} alt={currentTeam} className="w-8 h-8 object-contain" />
                          ) : (
                            <span className="text-lg">{SPORT_ICONS[sport] || '🏅'}</span>
                          );
                        })()}
                        <span className="font-semibold">You support the {currentTeam}!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const fanFinderMyParties = parties.filter(p =>
    userParties.includes(p.id) || p.hostId === user?.id
  );

  const renderFanFinderScreen = () => (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setCurrentScreen('games')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:bg-white/30 cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <UserPlus className="inline w-6 h-6 mr-2 text-cyan-400" />
                FIND FANS
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Search by Team</h2>
            <div className="space-y-3">
              <select
                value={fanSearchSport}
                onChange={(e) => { setFanSearchSport(e.target.value); setFanSearchTeam(''); setFanResults([]); }}
                className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="" className="bg-slate-700">Select a sport...</option>
                {Object.keys(TEAMS_BY_SPORT).sort().map(sport => (
                  <option key={sport} value={sport} className="bg-slate-700">{sport}</option>
                ))}
              </select>

              {fanSearchSport && TEAMS_BY_SPORT[fanSearchSport] && (
                <select
                  value={fanSearchTeam}
                  onChange={(e) => { setFanSearchTeam(e.target.value); setFanResults([]); }}
                  className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="" className="bg-slate-700">Select a team...</option>
                  {TEAMS_BY_SPORT[fanSearchSport].map(team => (
                    <option key={team} value={team} className="bg-slate-700">{team}</option>
                  ))}
                </select>
              )}

              <button
                onClick={searchFans}
                disabled={!fanSearchSport || !fanSearchTeam || fanSearchLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
              >
                {fanSearchLoading ? 'Searching...' : 'Find Fans'}
              </button>
            </div>
          </div>

          {fanResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">
                {fanResults.length} fan{fanResults.length !== 1 ? 's' : ''} found for {fanSearchTeam}
              </h2>

              {fanFinderMyParties.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <label className="text-sm text-gray-400 mb-2 block">Select a party to invite fans to:</label>
                  <select
                    value={invitePartyId || ''}
                    onChange={(e) => setInvitePartyId(e.target.value || null)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="" className="bg-slate-800">Choose a party...</option>
                    {fanFinderMyParties.map(p => (
                      <option key={p.id} value={p.id} className="bg-slate-800">
                        {p.title || `${p.homeTeam} vs ${p.awayTeam}`} - {p.venueName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {fanResults.map(fan => {
                const isFriend = friendsList.some(f => f.id === fan.id);
                const requestSent = friendStatuses[fan.id] === 'sent';
                return (
                <div key={fan.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar src={fan.profilePicture} name={fan.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold">{fan.name}</span>
                        <BadgeDisplay attended={fan.partiesAttended || 0} hosted={fan.partiesHosted || 0} size="sm" />
                        {fan.subscriptionTier === 'sponsor' && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-full border border-orange-500/30">📢 Sponsor</span>
                        )}
                        {fan.subscriptionTier === 'venue' && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">🏪 Venue</span>
                        )}
                        {isFriend && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                            <Users className="w-3 h-3 inline mr-1" />In Your Crew
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm flex flex-wrap gap-1 mt-1">
                        {fan.favoriteTeams.map((ft, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                            {ft.team}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!isFriend && !requestSent && (
                        <button
                          onClick={() => sendFriendRequest(fan.id)}
                          className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-1"
                        >
                          <Heart className="w-3 h-3" /> Add
                        </button>
                      )}
                      {requestSent && (
                        <span className="px-3 py-2 bg-white/10 text-gray-400 text-xs font-bold rounded-xl">Sent</span>
                      )}
                    </div>
                  </div>

                  {invitePartyId && (
                    <div className="mt-3 pl-12">
                      <button
                        onClick={() => handleInviteFan(fan.id, invitePartyId)}
                        disabled={inviteSending[`${fan.id}-${invitePartyId}`] === true || inviteSending[`${fan.id}-${invitePartyId}`] === 'sent'}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                          inviteSending[`${fan.id}-${invitePartyId}`] === 'sent'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                        } disabled:opacity-60`}
                      >
                        {inviteSending[`${fan.id}-${invitePartyId}`] === 'sent' ? (
                          <><CheckCircle className="w-4 h-4" /> Invited</>
                        ) : inviteSending[`${fan.id}-${invitePartyId}`] === true ? (
                          'Sending...'
                        ) : (
                          <><Send className="w-4 h-4" /> Invite to Party</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                );
              })}

              {fanFinderMyParties.length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                  <p className="text-yellow-200 text-sm">
                    Join or create a party first to invite fans.
                  </p>
                  <button
                    onClick={() => setCurrentScreen('games')}
                    className="mt-2 px-4 py-2 bg-yellow-500/20 text-yellow-200 rounded-xl text-sm font-semibold hover:bg-yellow-500/30"
                  >
                    Browse Games
                  </button>
                </div>
              )}
            </div>
          )}

          {fanResults.length === 0 && fanSearchTeam && !fanSearchLoading && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-400">No fans found for {fanSearchTeam} yet. Be the first to set them as your favorite!</p>
            </div>
          )}

          {!fanSearchTeam && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-gray-400">Select a sport and team above to find other fans and invite them to your watch parties.</p>
            </div>
          )}
        </div>
      </div>
  );

  const RewardsScreen = () => {
    const pointActions = [
      { action: 'Create a Party', points: 50, icon: <Plus className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500' },
      { action: 'Attend a Party', points: 25, icon: <Users className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
      { action: 'Invite a Friend', points: 100, icon: <Send className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
      { action: 'Check In at Venue', points: 75, icon: <MapPin className="w-5 h-5" />, color: 'from-orange-500 to-amber-500' },
    ];

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentScreen('games')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Gift className="inline w-6 h-6 mr-2 text-yellow-400" />
                REWARDS
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20 rounded-3xl border border-yellow-500/30 p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div className="text-5xl font-black text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {rewardsBalance.totalPoints.toLocaleString()}
            </div>
            <div className="text-yellow-300 text-sm font-bold">AVAILABLE POINTS</div>
            <div className="text-gray-400 text-xs mt-1">Lifetime earned: {rewardsBalance.lifetimePoints.toLocaleString()} pts</div>
          </div>

          <div className="flex gap-2 bg-slate-800/50 rounded-2xl p-1 border border-white/10">
            {[
              { key: 'earn', label: 'Earn', icon: <Zap className="w-4 h-4" /> },
              { key: 'redeem', label: 'Redeem', icon: <Gift className="w-4 h-4" /> },
              { key: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setRewardsTab(tab.key)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
                  rewardsTab === tab.key
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {rewardsTab === 'earn' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> How to Earn Points
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {pointActions.map((item, i) => (
                  <div key={i} className="bg-slate-800/80 rounded-2xl border border-white/10 p-4 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-2 text-white shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="text-white font-bold text-sm">{item.action}</div>
                    <div className="text-yellow-400 font-black text-lg mt-1">+{item.points}</div>
                    <div className="text-gray-500 text-xs">points</div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-4 mt-4">
                <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" /> Quick Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Create parties for upcoming games to earn 50 points each
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Invite friends from Fan Finder for 100 points per invite
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Check in when you arrive at the venue for 75 bonus points
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Join other fans' parties to earn 25 points per party
                  </li>
                </ul>
              </div>
            </div>
          )}

          {rewardsTab === 'redeem' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-400" /> Rewards Store
              </h3>
              {rewardsCatalog.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No rewards available right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewardsCatalog.map(reward => {
                    const canAfford = rewardsBalance.totalPoints >= reward.points_cost;
                    return (
                      <div key={reward.id} className="bg-slate-800/80 rounded-2xl border border-white/10 p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                            {reward.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-bold">{reward.name}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{reward.description}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-yellow-400 font-black text-sm">{reward.points_cost.toLocaleString()} pts</span>
                              <button
                                onClick={() => handleRedeemReward(reward.id)}
                                disabled={!canAfford || redeemingReward === reward.id}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  canAfford
                                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:shadow-lg hover:shadow-yellow-500/30'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {redeemingReward === reward.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : canAfford ? 'Redeem' : `Need ${(reward.points_cost - rewardsBalance.totalPoints).toLocaleString()} more`}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {rewardsRedemptions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-400 mb-3">YOUR REDEMPTIONS</h4>
                  <div className="space-y-2">
                    {rewardsRedemptions.map(r => (
                      <div key={r.id} className="bg-slate-800/60 rounded-xl border border-white/5 p-3 flex items-center gap-3">
                        <span className="text-xl">{r.reward_icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">{r.reward_name}</div>
                          <div className="text-gray-500 text-xs">{new Date(r.redeemed_at).toLocaleDateString()}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          r.status === 'redeemed' ? 'bg-green-500/20 text-green-400' :
                          r.status === 'used' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {rewardsTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" /> Points History
              </h3>
              {rewardsHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No points activity yet</p>
                  <p className="text-xs mt-1">Start earning by creating or joining parties!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rewardsHistory.map(entry => {
                    const isEarn = entry.points > 0;
                    const actionIcons = {
                      create_party: <Plus className="w-4 h-4" />,
                      attend_party: <Users className="w-4 h-4" />,
                      invite_friend: <Send className="w-4 h-4" />,
                      venue_checkin: <MapPin className="w-4 h-4" />,
                      redeem: <Gift className="w-4 h-4" />,
                    };
                    return (
                      <div key={entry.id} className="bg-slate-800/60 rounded-xl border border-white/5 p-3 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isEarn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {actionIcons[entry.action] || <Zap className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">{entry.description || entry.action.replace(/_/g, ' ')}</div>
                          <div className="text-gray-500 text-xs">{new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <span className={`font-black text-sm ${isEarn ? 'text-green-400' : 'text-red-400'}`}>
                          {isEarn ? '+' : ''}{entry.points}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const InvitationsScreen = () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    return (
    <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentScreen('games')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <Bell className="inline w-6 h-6 mr-2 text-cyan-400" />
              NOTIFICATIONS
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {unreadNotifications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Fan Alerts</h2>
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mark all read
              </button>
            </div>
            <div className="space-y-3">
              {unreadNotifications.map(notif => (
                <div key={`notif-${notif.id}`} className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{notif.message}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-white mb-3">Party Invitations</h2>
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No invitations yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
            {invitations.map(inv => (
              <div key={inv.id} className={`border rounded-2xl p-5 ${
                inv.status === 'pending'
                  ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30'
                  : inv.status === 'accepted'
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-white/5 border-white/10 opacity-60'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-300">
                        {inv.sport}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        inv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        inv.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg">
                      {inv.partyTitle || `${inv.homeTeam} vs ${inv.awayTeam}`}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      <span className="text-cyan-300">{inv.fromName}</span> invited you
                    </p>
                    {inv.venueName && (
                      <p className="text-gray-400 text-sm mt-1">
                        <MapPin className="inline w-3 h-3 mr-1" />{inv.venueName}{inv.city ? `, ${inv.city}` : ''}
                      </p>
                    )}
                    {inv.gameTime && (
                      <p className="text-gray-400 text-sm mt-1">
                        <Calendar className="inline w-3 h-3 mr-1" />{formatDateTime(inv.gameTime)}
                      </p>
                    )}
                  </div>
                </div>

                {inv.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleAcceptInvitation(inv.id)}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvitation(inv.id)}
                      className="flex-1 py-3 bg-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
            </div>
          )}
        </div>

        {unreadNotifications.length === 0 && invitations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-gray-400">No notifications yet. When someone invites you or a fellow fan creates a party, it will show up here.</p>
          </div>
        )}
      </div>
    </div>
    );
  };

  const QrCheckinScreen = () => {
    const [checkinStatus, setCheckinStatus] = useState('loading');
    const [venueInfo, setVenueInfo] = useState(null);
    const [checkinResult, setCheckinResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
      if (!qrCheckinToken) {
        setCheckinStatus('error');
        setError('No QR code token found');
        return;
      }
      verifyAndCheckin();
    }, [qrCheckinToken]);

    const verifyAndCheckin = async () => {
      try {
        const verify = await api.qr.verifyToken(qrCheckinToken);
        if (!verify.valid) {
          setCheckinStatus('invalid');
          setError(verify.error || 'Invalid or expired QR code');
          return;
        }
        setVenueInfo(verify);

        if (!user) {
          setCheckinStatus('needsLogin');
          return;
        }

        const result = await api.qr.scan(qrCheckinToken);
        setCheckinResult(result);
        setCheckinStatus('success');
      } catch (e) {
        setCheckinStatus('error');
        setError(e.message || 'Check-in failed');
      }
    };

    const handleLoginAndCheckin = () => {
      setCurrentScreen('login');
    };

    const retryCheckin = async () => {
      if (!user) return;
      setCheckinStatus('loading');
      try {
        const result = await api.qr.scan(qrCheckinToken);
        setCheckinResult(result);
        setCheckinStatus('success');
      } catch (e) {
        setCheckinStatus('error');
        setError(e.message || 'Check-in failed');
      }
    };

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {checkinStatus === 'loading' && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 p-8 text-center">
              <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                CHECKING IN...
              </h2>
              <p className="text-gray-400">Verifying your QR code</p>
            </div>
          )}

          {checkinStatus === 'success' && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-green-500/30 p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {checkinResult?.alreadyCheckedIn ? 'ALREADY VERIFIED!' : 'CHECKED IN!'}
              </h2>
              <p className="text-gray-300 text-lg">{checkinResult?.message}</p>
              {checkinResult?.pointsEarned > 0 && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
                  <div className="text-amber-400 font-black text-2xl">+{checkinResult.pointsEarned} pts</div>
                  <div className="text-amber-300 text-sm">Points earned!</div>
                </div>
              )}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 text-green-300 font-bold">
                  <Award className="w-5 h-5" />
                  Verified Attendee
                </div>
                <p className="text-green-300/70 text-xs mt-1">Your attendance has been verified via QR scan</p>
              </div>
              <button
                onClick={() => { setQrCheckinToken(null); setCurrentScreen('games'); }}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Continue to Huddle Up
              </button>
            </div>
          )}

          {checkinStatus === 'needsLogin' && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-amber-500/30 p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                CHECK IN AT {venueInfo?.venueName?.toUpperCase()}
              </h2>
              <p className="text-gray-300">Log in or sign up to check in and earn points!</p>
              <button
                onClick={handleLoginAndCheckin}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Log In to Check In
              </button>
              <button
                onClick={() => { setQrCheckinToken(null); setCurrentScreen('signup'); }}
                className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                Sign Up for Huddle Up
              </button>
            </div>
          )}

          {(checkinStatus === 'invalid' || checkinStatus === 'error') && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-red-500/30 p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <X className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                CHECK-IN FAILED
              </h2>
              <p className="text-gray-300">{error}</p>
              {user && (
                <button
                  onClick={retryCheckin}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => { setQrCheckinToken(null); setCurrentScreen(user ? 'games' : 'welcome'); }}
                className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                {user ? 'Back to Games' : 'Go to Huddle Up'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const crewMyParties = parties.filter(p => userParties.includes(p.id) || p.hostId === user?.id);

  const getFriendTeamLogos = (friend) => {
    if (!friend.favoriteTeams) return [];
    return Object.entries(friend.favoriteTeams).map(([sport, team]) => getTeamLogoUrl(sport, team)).filter(Boolean);
  };

  const renderFantasyScreen = () => {
    const platformColors = { espn: 'bg-red-500', yahoo: 'bg-purple-500', sleeper: 'bg-green-500', other: 'bg-gray-500' };
    const platformLabels = { espn: 'ESPN', yahoo: 'Yahoo', sleeper: 'Sleeper', other: 'Other' };

    const myTeam = fantasySelectedLeague?.teams?.find(t => t.user_id === user?.id);

    if (fantasySelectedLeague) {
      return (
        <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative z-0">
          <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setFantasySelectedLeague(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:bg-white/30 cursor-pointer" type="button">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex-1">
                  <h1 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    {fantasySelectedLeague.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${platformColors[fantasySelectedLeague.platform] || platformColors.other}`}>
                      {platformLabels[fantasySelectedLeague.platform] || fantasySelectedLeague.platform}
                    </span>
                    <span className="text-xs text-slate-400">{fantasySelectedLeague.sport}</span>
                    {fantasySelectedLeague.season && <span className="text-xs text-slate-400">• {fantasySelectedLeague.season}</span>}
                  </div>
                </div>
                <img src="/huddle-up-logo-3-transparent.png" alt="Huddle Up" className="w-10 h-10 object-contain" />
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">Invite Code:</span>
                  <span className="font-mono text-cyan-400 font-bold">{fantasySelectedLeague.invite_code}</span>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(fantasySelectedLeague.invite_code); alert('Invite code copied!'); }}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer"
                  type="button"
                >
                  <Copy className="w-4 h-4 text-white" />
                </button>
              </div>
              {fantasySelectedLeague.commissioner_name && (
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Commissioner: {fantasySelectedLeague.commissioner_name}</span>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Standings
              </h3>
              {fantasySelectedLeague.teams?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-white/10">
                        <th className="text-left py-2 px-2">#</th>
                        <th className="text-left py-2 px-2">Team</th>
                        <th className="text-left py-2 px-2">Owner</th>
                        <th className="text-center py-2 px-2">W-L</th>
                        <th className="text-right py-2 px-2">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fantasySelectedLeague.teams.map((team, idx) => (
                        <tr key={team.id} className={`border-b border-white/5 ${team.user_id === user?.id ? 'bg-cyan-500/10' : ''}`}>
                          <td className="py-2 px-2 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-2 px-2 text-white font-semibold">{team.team_name}</td>
                          <td className="py-2 px-2 text-slate-300">{team.owner_name || 'Unknown'}</td>
                          <td className="py-2 px-2 text-center text-slate-300">{team.wins}-{team.losses}</td>
                          <td className="py-2 px-2 text-right text-amber-400 font-bold">{Number(team.points || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">No teams yet</p>
              )}
            </div>

            {myTeam && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-cyan-400" />
                    Your Roster - {myTeam.team_name}
                  </h3>
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-lg hover:shadow-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <Plus className="w-3 h-3" /> Add Player
                  </button>
                </div>

                {showAddPlayer && (
                  <div className="bg-slate-800/80 border border-white/10 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Add Player</h4>
                      <button onClick={() => setShowAddPlayer(false)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer" type="button">
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Player Name"
                      value={fantasyAddPlayerForm.playerName}
                      onChange={e => setFantasyAddPlayerForm(p => ({ ...p, playerName: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={fantasyAddPlayerForm.position}
                        onChange={e => setFantasyAddPlayerForm(p => ({ ...p, position: e.target.value }))}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                      >
                        {['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'FLEX', 'PG', 'SG', 'SF', 'PF', 'C', 'UTIL'].map(pos => (
                          <option key={pos} value={pos} className="bg-slate-800">{pos}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="NFL Team"
                        value={fantasyAddPlayerForm.nflTeam}
                        onChange={e => setFantasyAddPlayerForm(p => ({ ...p, nflTeam: e.target.value }))}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={fantasyAddPlayerForm.isStarter}
                        onChange={e => setFantasyAddPlayerForm(p => ({ ...p, isStarter: e.target.checked }))}
                        className="rounded"
                      />
                      Starter
                    </label>
                    <button
                      onClick={() => handleAddFantasyPlayer(myTeam.id)}
                      className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                      type="button"
                    >
                      Add Player
                    </button>
                  </div>
                )}

                {myTeam.players?.length > 0 ? (
                  <div className="space-y-2">
                    {myTeam.players.map(player => (
                      <div key={player.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${player.is_starter ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-600/30 text-slate-400'}`}>
                            {player.position}
                          </span>
                          <div>
                            <p className="text-white text-sm font-semibold">{player.player_name}</p>
                            {player.nfl_team && <p className="text-slate-400 text-xs">{player.nfl_team}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-400 text-sm font-bold">{Number(player.points || 0).toFixed(1)} pts</span>
                          <button
                            onClick={() => handleRemoveFantasyPlayer(player.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg cursor-pointer"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">No players added yet</p>
                )}
              </div>
            )}

            {fantasySelectedLeague.commissioner_id === user?.id && (
              <button
                onClick={() => handleDeleteFantasyLeague(fantasySelectedLeague.id)}
                className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <Trash2 className="w-4 h-4" /> Delete League
              </button>
            )}
          </div>

          {fantasyLoading && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative z-0">
        <div className="sticky top-14 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentScreen('games')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:bg-white/30 cursor-pointer" type="button">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Trophy className="inline w-6 h-6 mr-2 text-amber-400" />
                FANTASY LEAGUES
              </h1>
              <div className="ml-auto">
                <img src="/huddle-up-logo-3-transparent.png" alt="Huddle Up" className="w-10 h-10 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowCreateLeague(true)}
              className="py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <Plus className="w-5 h-5" /> Create League
            </button>
            <button
              onClick={() => setShowJoinLeague(true)}
              className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <Users className="w-5 h-5" /> Join League
            </button>
          </div>

          {showCreateLeague && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Create League</h3>
                <button onClick={() => setShowCreateLeague(false)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer" type="button">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <input
                type="text"
                placeholder="League Name"
                value={fantasyNewLeague.name}
                onChange={e => setFantasyNewLeague(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={fantasyNewLeague.platform}
                onChange={e => setFantasyNewLeague(p => ({ ...p, platform: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="espn" className="bg-slate-800">ESPN</option>
                <option value="yahoo" className="bg-slate-800">Yahoo</option>
                <option value="sleeper" className="bg-slate-800">Sleeper</option>
                <option value="other" className="bg-slate-800">Other</option>
              </select>
              <select
                value={fantasyNewLeague.sport}
                onChange={e => setFantasyNewLeague(p => ({ ...p, sport: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="NFL" className="bg-slate-800">NFL</option>
                <option value="NBA" className="bg-slate-800">NBA</option>
                <option value="MLB" className="bg-slate-800">MLB</option>
                <option value="NHL" className="bg-slate-800">NHL</option>
                <option value="Soccer" className="bg-slate-800">Soccer</option>
              </select>
              <input
                type="text"
                placeholder="Season (e.g. 2025-26)"
                value={fantasyNewLeague.season}
                onChange={e => setFantasyNewLeague(p => ({ ...p, season: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Your Team Name"
                value={fantasyNewLeague.teamName}
                onChange={e => setFantasyNewLeague(p => ({ ...p, teamName: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleCreateFantasyLeague}
                disabled={fantasyLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                type="button"
              >
                {fantasyLoading ? 'Creating...' : 'Create League'}
              </button>
            </div>
          )}

          {showJoinLeague && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Join League</h3>
                <button onClick={() => setShowJoinLeague(false)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer" type="button">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Invite Code"
                value={fantasyJoinCode}
                onChange={e => setFantasyJoinCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <input
                type="text"
                placeholder="Your Team Name"
                value={fantasyJoinTeamName}
                onChange={e => setFantasyJoinTeamName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleJoinFantasyByCode}
                disabled={fantasyLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                type="button"
              >
                {fantasyLoading ? 'Joining...' : 'Join League'}
              </button>
            </div>
          )}

          {fantasyLeagues.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Leagues</h3>
              {fantasyLeagues.map(league => (
                <button
                  key={league.id}
                  onClick={() => loadFantasyLeague(league.id)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 active:scale-[0.98] transition-all text-left cursor-pointer"
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-bold">{league.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${platformColors[league.platform] || platformColors.other}`}>
                          {platformLabels[league.platform] || league.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span>{league.sport}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {league.team_count || 0} teams</span>
                        <span className="font-mono text-xs text-cyan-400">{league.invite_code}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Fantasy Leagues Yet</h3>
              <p className="text-slate-400">Create a new league or join one with an invite code</p>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 pb-8 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <Star className="w-5 h-5 text-yellow-400" /> NEW TO FANTASY SPORTS?
            </h3>
            <p className="text-slate-300 text-sm mb-4">Fantasy sports let you build your own dream team of real players and compete against friends based on how those players perform in real games.</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-300 text-xs font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Join or Create a League</h4>
                  <p className="text-slate-400 text-xs">Create a league and invite your friends with the invite code, or join an existing one. Pick which platform you play on (ESPN, Yahoo, Sleeper, etc.).</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-300 text-xs font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Draft Your Team</h4>
                  <p className="text-slate-400 text-xs">Each person in the league picks real players for their roster. You take turns choosing so everyone gets a fair shot at the best players.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-300 text-xs font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Set Your Lineup</h4>
                  <p className="text-slate-400 text-xs">Each week, choose which players on your roster are starters vs. on the bench. Starters earn you points based on their real-game stats (touchdowns, yards, goals, etc.).</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-300 text-xs font-bold">4</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Compete Weekly</h4>
                  <p className="text-slate-400 text-xs">You go head-to-head against someone in your league each week. The team with the most total points from their starters wins that matchup.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Trophy className="w-3.5 h-3.5 text-orange-300" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Talk Trash & Have Fun</h4>
                  <p className="text-slate-400 text-xs">Use the Trash Talk feature in party chats to brag about your team or roast your friends. The best part of fantasy is the friendly competition!</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <p className="text-cyan-300 text-xs"><span className="font-bold">Tip:</span> Track your leagues here on Huddle Up, but set your actual lineups on your fantasy platform (ESPN, Yahoo, Sleeper). This is your hub to see standings, manage rosters, and trash talk with your crew!</p>
            </div>
          </div>
        </div>

        {fantasyLoading && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}
      </div>
    );
  };

  const renderMyCrewScreen = () => (
      <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative z-0">
        <div className="sticky top-14 z-30 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentScreen('games')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:bg-white/30 cursor-pointer" type="button">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Users className="inline w-6 h-6 mr-2 text-cyan-400" />
                MY CREW
              </h1>
              <div className="ml-auto">
                <button
                  onClick={() => setCurrentScreen('fanFinder')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  <UserPlus className="w-4 h-4" /> Find Fans
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setCrewTab('friends')}
                type="button"
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer ${crewTab === 'friends' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}
              >
                My Crew ({friendsList.length})
              </button>
              <button
                onClick={() => setCrewTab('requests')}
                type="button"
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer relative ${crewTab === 'requests' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-gray-400'}`}
              >
                Requests
                {friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{friendRequests.length}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {crewTab === 'friends' && (
            <>
              {friendsList.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                    <Users className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Build Your Crew</h3>
                  <p className="text-gray-400 mb-6 max-w-sm mx-auto">Find fans who love the same teams and add them to your crew. Then invite them to watch parties!</p>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('fanFinder')}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all cursor-pointer active:scale-95"
                  >
                    <UserPlus className="w-5 h-5 inline mr-2" /> Find Fellow Fans
                  </button>
                </div>
              ) : (
                <>
                  {crewInvitePartyId && (
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-300 text-sm font-bold">Tap a friend to invite them to your party</span>
                        </div>
                        <button onClick={() => setCrewInvitePartyId(null)} className="text-gray-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {!crewInvitePartyId && crewMyParties.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <label className="block text-sm font-bold text-gray-300 mb-2">Invite crew to a party:</label>
                      <select
                        value={crewInvitePartyId || ''}
                        onChange={(e) => setCrewInvitePartyId(e.target.value || null)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Select a party...</option>
                        {crewMyParties.map(p => (
                          <option key={p.id} value={p.id}>{p.title || `${p.homeTeam} vs ${p.awayTeam}`} - {p.venueName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {friendsList.map(friend => {
                    const teamLogos = getFriendTeamLogos(friend);
                    const badge = getFanBadge(friend.partiesAttended, friend.partiesHosted);
                    return (
                      <div key={friend.id} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-white/10 p-5 hover:border-cyan-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <ProfileAvatar src={friend.profilePicture} name={friend.name} size="lg" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-bold text-lg">{friend.name}</span>
                              {badge && <span className="text-sm">{badge.icon} {badge.name}</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {teamLogos.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {teamLogos.slice(0, 4).map((logo, i) => (
                                    <img key={i} src={logo} alt="" className="w-5 h-5 object-contain" />
                                  ))}
                                </div>
                              )}
                              {friend.favoriteTeams && Object.entries(friend.favoriteTeams).length > 0 && (
                                <span className="text-gray-400 text-xs">
                                  {Object.values(friend.favoriteTeams).join(', ')}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {friend.partiesAttended} parties attended · {friend.partiesHosted} hosted
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {crewInvitePartyId && (
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    await api.fans.invite(crewInvitePartyId, friend.id);
                                    alert(`Invited ${friend.name}!`);
                                  } catch (e) {
                                    alert(e.message || 'Failed to invite');
                                  }
                                }}
                                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all"
                              >
                                <Send className="w-3 h-3 inline mr-1" /> Invite
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFriend(friend.id); }}
                              className="p-2 bg-white/5 hover:bg-red-500/20 active:bg-red-500/30 text-gray-500 hover:text-red-400 rounded-xl transition-all"
                              title="Remove from crew"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}

          {crewTab === 'requests' && (
            <>
              {friendRequests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">📬</div>
                  <p className="text-gray-400">No pending friend requests right now.</p>
                </div>
              ) : (
                friendRequests.map(req => {
                  const reqTeams = req.favoriteTeams ? Object.entries(req.favoriteTeams).map(([s, t]) => getTeamLogoUrl(s, t)).filter(Boolean) : [];
                  return (
                    <div key={req.id} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-purple-500/20 p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <ProfileAvatar src={req.profilePicture} name={req.name} size="lg" />
                        <div className="flex-1">
                          <span className="text-white font-bold text-lg">{req.name}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {reqTeams.slice(0, 4).map((logo, i) => (
                              <img key={i} src={logo} alt="" className="w-5 h-5 object-contain" />
                            ))}
                            {req.favoriteTeams && Object.values(req.favoriteTeams).length > 0 && (
                              <span className="text-gray-400 text-xs ml-1">{Object.values(req.favoriteTeams).join(', ')}</span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-1">Sent {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); acceptFriendRequest(req.id); }}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); declineFriendRequest(req.id); }}
                          className="flex-1 py-3 bg-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
  );

  return (
    <div className="font-sans fixed inset-0 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {!['welcome', 'login', 'signup', 'forgotPassword'].includes(currentScreen) && !showOnboarding && (
        <div className="relative z-40 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
            <Megaphone className="w-4 h-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
              MAIN SPONSOR — <span className="font-normal opacity-90">Your brand here! Premium placement across all pages.</span>
            </span>
            <a
              href="mailto:sponsor@huddleupusa.com"
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-full border border-white/30 transition-colors flex-shrink-0"
            >
              Advertise
            </a>
          </div>
        </div>
      )}

      {/* FEATURE 1: Onboarding Tutorial Overlay */}
      {showOnboarding && <OnboardingOverlay />}

      {user && !['welcome', 'login', 'signup', 'forgotPassword'].includes(currentScreen) && (
        <div className="fixed top-0 left-0 right-0 z-[60]">
          <MainSponsorBanner onAdvertise={() => setCurrentScreen('sponsorDashboard')} />
        </div>
      )}

      {currentScreen === 'welcome' && <WelcomeScreen />}
      {currentScreen === 'login' && loginScreenJSX}
      {currentScreen === 'signup' && signUpScreenJSX}
      {currentScreen === 'forgotPassword' && forgotPasswordScreenJSX}
      {currentScreen === 'games' && gamesScreenJSX()}
      {currentScreen === 'gameDetail' && <GameDetailScreen />}
      {currentScreen === 'createParty' && createPartyScreenJSX()}
      {currentScreen === 'claimVenue' && claimVenueScreenJSX()}
      {currentScreen === 'admin' && AdminPanelScreen()}
      {currentScreen === 'venueDashboard' && <VenueAnalyticsDashboard />}
      {currentScreen === 'sponsorDashboard' && <SponsorDashboard />}
      {currentScreen === 'myParties' && <MyPartiesScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
      {currentScreen === 'fanFinder' && renderFanFinderScreen()}
      {currentScreen === 'myCrew' && renderMyCrewScreen()}
      {currentScreen === 'rewards' && <RewardsScreen />}
      {currentScreen === 'invitations' && <InvitationsScreen />}
      {currentScreen === 'qrCheckin' && <QrCheckinScreen />}
      {currentScreen === 'fantasy' && renderFantasyScreen()}

      {editPartyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditPartyModal(null); }}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10 overscroll-contain" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EDIT PARTY</h3>
              <button onClick={() => setEditPartyModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location Name</label>
                <input
                  type="text"
                  value={editPartyForm.venueName}
                  onChange={e => setEditPartyForm({...editPartyForm, venueName: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Buffalo Wild Wings, My house"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="text-sm font-bold text-cyan-300 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Address Details
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editPartyForm.streetAddress}
                    onChange={e => setEditPartyForm({...editPartyForm, streetAddress: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., 123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">City</label>
                    <input
                      type="text"
                      value={editPartyForm.city}
                      onChange={e => setEditPartyForm({...editPartyForm, city: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., Austin"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">State</label>
                    <select
                      value={editPartyForm.state}
                      onChange={e => setEditPartyForm({...editPartyForm, state: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select state</option>
                      {US_STATES.map(st => (
                        <option key={st} value={st}>{st} - {US_STATE_NAMES[st]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {editPartyForm.streetAddress && editPartyForm.city && (
                  <div className="text-xs text-gray-500 bg-white/5 rounded-lg p-2 mt-1">
                    Full address: {[editPartyForm.streetAddress, editPartyForm.city, editPartyForm.state].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                <input
                  type="text"
                  value={editPartyForm.gameTime}
                  onChange={e => setEditPartyForm({...editPartyForm, gameTime: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Meet at 5:30 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                <input
                  type="number"
                  value={editPartyForm.maxSize}
                  onChange={e => setEditPartyForm({...editPartyForm, maxSize: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Max number of people"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes / Description</label>
                <textarea
                  value={editPartyForm.notes}
                  onChange={e => setEditPartyForm({...editPartyForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Any additional details..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditPartyModal(null)}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditParty}
                disabled={editPartySaving}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  editPartySaving
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-cyan-500/30 hover:shadow-lg'
                }`}
              >
                {editPartySaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" /> Link copied to clipboard!
        </div>
      )}

      {showSignupShare && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 p-8 max-w-md w-full text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              WELCOME TO HUDDLE UP!
            </h2>
            <p className="text-gray-300 text-lg">
              Watch parties are better with friends!
            </p>
            <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl p-4 space-y-3">
              <p className="text-white font-bold text-sm">Earn badge points and level up!</p>
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-2xl">🎉</div>
                  <div className="text-xs text-gray-300 mt-1">Join parties</div>
                </div>
                <div>
                  <div className="text-2xl">📣</div>
                  <div className="text-xs text-gray-300 mt-1">Host parties</div>
                </div>
                <div>
                  <div className="text-2xl">👥</div>
                  <div className="text-xs text-gray-300 mt-1">Invite friends</div>
                </div>
              </div>
              <p className="text-cyan-300 text-xs">New Fan → Rookie → Starter → All-Star → MVP → Legend</p>
            </div>
            <button
              onClick={() => { shareApp(); setShowSignupShare(false); }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" /> Share with Friends
            </button>
            <button
              onClick={() => setShowSignupShare(false)}
              className="w-full py-3 bg-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HuddleUpApp;
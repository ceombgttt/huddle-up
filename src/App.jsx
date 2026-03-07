import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, MapPin, Users, Plus, ArrowLeft, LogOut, User, Trophy, Search, Filter, CheckCircle, Building2, BarChart3, Settings, Navigation, Star, Phone, Globe, Map, UserPlus, Bell, Send, Heart, X, Share2, Link, Check, Eye, EyeOff, Camera, Loader2, Pencil, DollarSign, Trash2, ChevronDown, ChevronUp, Megaphone, MessageCircle, Gift, Award, Clock, Zap, Crown, Copy, Shield, ChevronRight, Info, Flame, TrendingUp, Menu, ScanLine, Download, Smartphone, Target, Lock, Home, HelpCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from './api.js';
import adNFL from '@assets/20260304_2334_Image_Generation_remix_01kjy4adavfs9vfwhwt6a1fzj_1772686251670.png';
import adNBA from '@assets/20260304_2335_Image_Generation_remix_01kjy4dgpvf3p83bfvzkzbget_1772686251669.png';
import adNHL from '@assets/20260304_2342_Huddle_Up_Sports_Banner_remix_01kjy4tqf6fj3bwgpk_1772686251669.png';
import adMLB from '@assets/20260304_2331_Sports_Bar_Excitement_remix_01kjy46em3em9ss98wh8_1772686251670.png';
import adMain from '@assets/20260304_2344_Image_Generation_remix_01kjy4zcxhfyrremqej8jp2mv_1772686251665.png';

class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Screen crash:', error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', { className: 'min-h-screen bg-[#0F1115] flex items-center justify-center p-8', style: { paddingTop: '60px' } },
        React.createElement('div', { className: 'bg-[#151A22] rounded-2xl border border-red-500/30 p-6 max-w-md text-center' },
          React.createElement('h3', { className: 'text-white font-bold text-lg mb-2' }, 'Something went wrong'),
          React.createElement('p', { className: 'text-[#A0A4AB] text-sm mb-4' }, String(this.state.error?.message || 'Unknown error')),
          React.createElement('button', {
            className: 'px-5 py-2.5 bg-[#1E90FF] text-white font-bold rounded-xl text-sm',
            onClick: () => { this.setState({ hasError: false, error: null }); if (this.props.onReset) this.props.onReset(); }
          }, 'Go Back')
        )
      );
    }
    return this.props.children;
  }
}

function QrScannerInit({ isOpen, onResult, scannerRef, onError }) {
 useEffect(() => {
 if (!isOpen) return;
 let scanner = null;
 let mounted = true;
 let starting = false;
 const startScanner = async () => {
 if (starting) return;
 starting = true;
 await new Promise(r => setTimeout(r, 400));
 if (!mounted) return;
 const el = document.getElementById('qr-reader');
 if (!el) { starting = false; return; }
 scanner = new Html5Qrcode('qr-reader');
 scannerRef.current = scanner;
 try {
 await scanner.start(
 { facingMode: 'environment' },
 { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
 (decodedText) => onResult(decodedText),
 () => {}
 );
 } catch (err) {
 console.error('QR Scanner error:', err);
 if (onError) {
 const msg = String(err?.message || err || '');
 if (msg.includes('Permission') || msg.includes('NotAllowed') || msg.includes('denied')) {
 onError('Camera access denied. Please allow camera permissions in your browser settings and try again.');
 } else if (msg.includes('NotFound') || msg.includes('no camera')) {
 onError('No camera found on this device. Please try from a phone with a camera.');
 } else {
 onError('Could not start camera. Please check permissions and try again.');
 }
 }
 }
 starting = false;
 };
 startScanner();
 return () => {
 mounted = false;
 const cleanup = async () => {
 if (scanner) {
 try { await scanner.stop(); } catch(e) {}
 }
 scannerRef.current = null;
 };
 cleanup();
 };
 }, [isOpen]);
 return null;
}

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
 { id: 'box1', sport: 'Boxing', homeTeam: 'Sebastian Fundora', awayTeam: 'Keith Thurman', startTime: '2026-03-28T21:00:00', venue: 'Las Vegas', eventTitle: 'WBC Jr. Middleweight Title' },
 { id: 'box2', sport: 'Boxing', homeTeam: 'Tyson Fury', awayTeam: 'Arslanbek Makhmudov', startTime: '2026-04-11T20:00:00', venue: 'United Kingdom', eventTitle: 'Heavyweight - Netflix' },
 { id: 'box3', sport: 'Boxing', homeTeam: 'Deontay Wilder', awayTeam: 'Derek Chisora', startTime: '2026-05-09T21:00:00', venue: 'Co-op Live Arena, Manchester', eventTitle: 'Heavyweight - DAZN' },
 { id: 'box4', sport: 'Boxing', homeTeam: 'David Benavidez', awayTeam: 'Gilberto Ramirez', startTime: '2026-05-17T22:00:00', venue: 'Las Vegas', eventTitle: 'WBO/WBA Cruiserweight Titles' },
 { id: 'box5', sport: 'Boxing', homeTeam: 'Fabio Wardley', awayTeam: 'Daniel Dubois', startTime: '2026-03-28T19:00:00', venue: 'Manchester, England', eventTitle: 'Heavyweight' },
 { id: 'box6', sport: 'Boxing', homeTeam: 'Caroline Dubois', awayTeam: 'Terri Harper', startTime: '2026-04-05T18:00:00', venue: 'London, England', eventTitle: 'WBC & WBO Lightweight Titles' },
 
 // FIFA World Cup 2026 — Opening & Group Stage
 { id: 'wc_open', sport: 'FIFA World Cup', homeTeam: 'Mexico', awayTeam: 'TBD', startTime: '2026-06-11T19:00:00Z', venue: 'Estadio Azteca, Mexico City', eventTitle: 'Opening Match' },
 { id: 'wc_gs1', sport: 'FIFA World Cup', homeTeam: 'USA', awayTeam: 'TBD', startTime: '2026-06-12T19:00:00Z', venue: 'SoFi Stadium, Los Angeles', eventTitle: 'Group Stage' },
 { id: 'wc_gs2', sport: 'FIFA World Cup', homeTeam: 'Canada', awayTeam: 'TBD', startTime: '2026-06-13T17:00:00Z', venue: 'BMO Field, Toronto', eventTitle: 'Group Stage' },
 { id: 'wc_gs3', sport: 'FIFA World Cup', homeTeam: 'Brazil', awayTeam: 'TBD', startTime: '2026-06-14T21:00:00Z', venue: 'Hard Rock Stadium, Miami', eventTitle: 'Group Stage' },
 { id: 'wc_gs4', sport: 'FIFA World Cup', homeTeam: 'Argentina', awayTeam: 'TBD', startTime: '2026-06-15T00:00:00Z', venue: 'MetLife Stadium, New Jersey', eventTitle: 'Group Stage' },
 { id: 'wc_gs5', sport: 'FIFA World Cup', homeTeam: 'England', awayTeam: 'TBD', startTime: '2026-06-15T19:00:00Z', venue: 'Lincoln Financial Field, Philadelphia', eventTitle: 'Group Stage' },
 { id: 'wc_gs6', sport: 'FIFA World Cup', homeTeam: 'France', awayTeam: 'TBD', startTime: '2026-06-16T19:00:00Z', venue: 'MetLife Stadium, New Jersey', eventTitle: 'Group Stage' },
 { id: 'wc_gs7', sport: 'FIFA World Cup', homeTeam: 'Germany', awayTeam: 'TBD', startTime: '2026-06-17T17:00:00Z', venue: 'Lincoln Financial Field, Philadelphia', eventTitle: 'Group Stage' },
 { id: 'wc_gs8', sport: 'FIFA World Cup', homeTeam: 'Spain', awayTeam: 'TBD', startTime: '2026-06-18T00:00:00Z', venue: 'Hard Rock Stadium, Miami', eventTitle: 'Group Stage' },
 { id: 'wc_gs9', sport: 'FIFA World Cup', homeTeam: 'Portugal', awayTeam: 'TBD', startTime: '2026-06-18T19:00:00Z', venue: 'MetLife Stadium, New Jersey', eventTitle: 'Group Stage' },
 { id: 'wc_gs10', sport: 'FIFA World Cup', homeTeam: 'Netherlands', awayTeam: 'TBD', startTime: '2026-06-19T17:00:00Z', venue: 'Lumen Field, Seattle', eventTitle: 'Group Stage' },
 { id: 'wc_gs11', sport: 'FIFA World Cup', homeTeam: 'Italy', awayTeam: 'TBD', startTime: '2026-06-19T21:00:00Z', venue: 'AT&T Stadium, Dallas', eventTitle: 'Group Stage' },
 { id: 'wc1', sport: 'FIFA World Cup', homeTeam: 'USA', awayTeam: 'Mexico', startTime: '2026-06-20T19:00:00Z', venue: 'MetLife Stadium, New Jersey', eventTitle: 'Group Stage' },
 { id: 'wc_gs12', sport: 'FIFA World Cup', homeTeam: 'Japan', awayTeam: 'TBD', startTime: '2026-06-21T17:00:00Z', venue: 'Levi\'s Stadium, San Francisco', eventTitle: 'Group Stage' },
 { id: 'wc_gs13', sport: 'FIFA World Cup', homeTeam: 'South Korea', awayTeam: 'TBD', startTime: '2026-06-22T19:00:00Z', venue: 'SoFi Stadium, Los Angeles', eventTitle: 'Group Stage' },
 { id: 'wc2', sport: 'FIFA World Cup', homeTeam: 'Brazil', awayTeam: 'Argentina', startTime: '2026-06-25T21:00:00Z', venue: 'AT&T Stadium, Dallas', eventTitle: 'Group Stage' },
 { id: 'wc3', sport: 'FIFA World Cup', homeTeam: 'England', awayTeam: 'Germany', startTime: '2026-06-28T19:00:00Z', venue: 'SoFi Stadium, Los Angeles', eventTitle: 'Group Stage' },
 // FIFA World Cup 2026 — Knockout Rounds
 { id: 'wc_r32a', sport: 'FIFA World Cup', homeTeam: '1A', awayTeam: '2B', startTime: '2026-06-29T19:00:00Z', venue: 'MetLife Stadium, New Jersey', eventTitle: 'Round of 32' },
 { id: 'wc_r32b', sport: 'FIFA World Cup', homeTeam: '1C', awayTeam: '2D', startTime: '2026-06-29T23:00:00Z', venue: 'Hard Rock Stadium, Miami', eventTitle: 'Round of 32' },
 { id: 'wc_r16a', sport: 'FIFA World Cup', homeTeam: 'TBD', awayTeam: 'TBD', startTime: '2026-07-03T19:00:00Z', venue: 'AT&T Stadium, Dallas', eventTitle: 'Round of 16' },
 { id: 'wc_r16b', sport: 'FIFA World Cup', homeTeam: 'TBD', awayTeam: 'TBD', startTime: '2026-07-04T19:00:00Z', venue: 'SoFi Stadium, Los Angeles', eventTitle: 'Round of 16' },
 { id: 'wc_qf1', sport: 'FIFA World Cup', homeTeam: 'TBD', awayTeam: 'TBD', startTime: '2026-07-09T19:00:00Z', venue: 'MetLife Stadium, New Jersey', eventTitle: 'Quarterfinal' },
 { id: 'wc_qf2', sport: 'FIFA World Cup', homeTeam: 'TBD', awayTeam: 'TBD', startTime: '2026-07-10T19:00:00Z', venue: 'Levi\'s Stadium, San Francisco', eventTitle: 'Quarterfinal' },
 { id: 'wc_sf1', sport: 'FIFA World Cup', homeTeam: 'TBD', awayTeam: 'TBD', startTime: '2026-07-13T21:00:00Z', venue: 'AT&T Stadium, Dallas', eventTitle: 'Semifinal' },
 { id: 'wc_sf2', sport: 'FIFA World Cup', homeTeam: 'TBD', awayTeam: 'TBD', startTime: '2026-07-14T21:00:00Z', venue: 'MetLife Stadium, New Jersey', eventTitle: 'Semifinal' },
 { id: 'wc_3rd', sport: 'FIFA World Cup', homeTeam: 'TBD', awayTeam: 'TBD', startTime: '2026-07-18T21:00:00Z', venue: 'Hard Rock Stadium, Miami', eventTitle: 'Third Place Match' },
 { id: 'wc_final', sport: 'FIFA World Cup', homeTeam: 'TBD', awayTeam: 'TBD', startTime: '2026-07-19T21:00:00Z', venue: 'MetLife Stadium, New Jersey', eventTitle: '🏆 FINAL' },

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

const SPORTS = ['All', 'UFC', 'Boxing', 'NFL', 'NBA', 'MLB', 'NHL', 'College Football', 'College Basketball', 'Premier League', 'La Liga', 'Liga MX', 'MLS', 'Champions League', 'Formula 1', 'Tennis', 'Rugby', 'Cricket'];

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
 'Champions League': '⭐⚽',
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
 'College Football': ['Air Force', 'Akron', 'Alabama', 'Appalachian State', 'Arizona', 'Arizona State', 'Arkansas', 'Arkansas State', 'Army', 'Auburn', 'Ball State', 'Baylor', 'Boise State', 'Boston College', 'Bowling Green', 'Buffalo', 'BYU', 'California', 'Central Michigan', 'Charlotte', 'Cincinnati', 'Clemson', 'Coastal Carolina', 'Colorado', 'Colorado State', 'Connecticut', 'Duke', 'East Carolina', 'Eastern Michigan', 'Florida', 'Florida Atlantic', 'Florida International', 'Florida State', 'Fresno State', 'Georgia', 'Georgia Southern', 'Georgia State', 'Georgia Tech', 'Hawaii', 'Houston', 'Illinois', 'Indiana', 'Iowa', 'Iowa State', 'Jacksonville State', 'James Madison', 'Kansas', 'Kansas State', 'Kent State', 'Kentucky', 'Liberty', 'Louisiana', 'Louisiana Tech', 'Louisville', 'LSU', 'Marshall', 'Maryland', 'Memphis', 'Miami', 'Miami (OH)', 'Michigan', 'Michigan State', 'Middle Tennessee', 'Minnesota', 'Mississippi State', 'Missouri', 'Navy', 'Nebraska', 'Nevada', 'New Mexico', 'New Mexico State', 'North Carolina', 'NC State', 'North Texas', 'Northern Illinois', 'Northwestern', 'Notre Dame', 'Ohio', 'Ohio State', 'Oklahoma', 'Oklahoma State', 'Old Dominion', 'Ole Miss', 'Oregon', 'Oregon State', 'Penn State', 'Pittsburgh', 'Purdue', 'Rice', 'Rutgers', 'Sam Houston State', 'San Diego State', 'San Jose State', 'SMU', 'South Alabama', 'South Carolina', 'South Florida', 'Southern Miss', 'Stanford', 'Syracuse', 'TCU', 'Temple', 'Tennessee', 'Texas', 'Texas A&M', 'Texas State', 'Texas Tech', 'Toledo', 'Troy', 'Tulane', 'Tulsa', 'UAB', 'UCF', 'UCLA', 'UNLV', 'USC', 'UTEP', 'UTSA', 'Utah', 'Utah State', 'Vanderbilt', 'Virginia', 'Virginia Tech', 'Wake Forest', 'Washington', 'Washington State', 'West Virginia', 'Western Kentucky', 'Western Michigan', 'Wisconsin', 'Wyoming'],
 'College Basketball': ['Air Force', 'Akron', 'Alabama', 'Appalachian State', 'Arizona', 'Arizona State', 'Arkansas', 'Auburn', 'Ball State', 'Baylor', 'Boise State', 'Boston College', 'Bowling Green', 'Buffalo', 'Butler', 'BYU', 'California', 'Central Michigan', 'Charlotte', 'Cincinnati', 'Clemson', 'Coastal Carolina', 'Colorado', 'Colorado State', 'Connecticut', 'Creighton', 'Dayton', 'Duke', 'East Carolina', 'Eastern Michigan', 'Florida', 'Florida Atlantic', 'Florida State', 'Fresno State', 'Georgetown', 'Georgia', 'Georgia Tech', 'Gonzaga', 'Hawaii', 'Houston', 'Illinois', 'Indiana', 'Iowa', 'Iowa State', 'James Madison', 'Kansas', 'Kansas State', 'Kent State', 'Kentucky', 'Liberty', 'Louisiana', 'Louisville', 'LSU', 'Marquette', 'Marshall', 'Maryland', 'Memphis', 'Miami', 'Michigan', 'Michigan State', 'Middle Tennessee', 'Minnesota', 'Mississippi State', 'Missouri', 'Nebraska', 'Nevada', 'New Mexico', 'North Carolina', 'NC State', 'North Texas', 'Northern Illinois', 'Northwestern', 'Notre Dame', 'Ohio', 'Ohio State', 'Oklahoma', 'Oklahoma State', 'Old Dominion', 'Ole Miss', 'Oregon', 'Oregon State', 'Penn State', 'Pittsburgh', 'Providence', 'Purdue', 'Rice', 'Rutgers', 'Saint Louis', 'San Diego State', 'Seton Hall', 'SMU', 'South Carolina', 'South Florida', 'Southern Miss', 'St. Johns', 'Stanford', 'Syracuse', 'TCU', 'Temple', 'Tennessee', 'Texas', 'Texas A&M', 'Texas Tech', 'Toledo', 'Troy', 'Tulane', 'UAB', 'UCF', 'UCLA', 'UNLV', 'USC', 'Utah', 'Vanderbilt', 'Villanova', 'Virginia', 'Virginia Tech', 'Wake Forest', 'Washington', 'Washington State', 'West Virginia', 'Western Kentucky', 'Wichita State', 'Wisconsin', 'Wyoming', 'Xavier'],
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
 'College Football': { league: 'ncaa/500', idBased: true, teams: { 'Alabama': 333, 'Arizona': 12, 'Arizona State': 9, 'Arkansas': 8, 'Auburn': 2, 'Baylor': 239, 'Boise State': 68, 'Boston College': 103, 'BYU': 252, 'California': 25, 'Cincinnati': 2132, 'Clemson': 228, 'Colorado': 38, 'Duke': 150, 'Florida': 57, 'Florida State': 52, 'Georgia': 61, 'Georgia Tech': 59, 'Houston': 248, 'Illinois': 356, 'Indiana': 84, 'Iowa': 2294, 'Iowa State': 66, 'Kansas': 2305, 'Kansas State': 2306, 'Kentucky': 96, 'LSU': 99, 'Louisville': 97, 'Maryland': 120, 'Memphis': 235, 'Miami': 2390, 'Michigan': 130, 'Michigan State': 127, 'Minnesota': 135, 'Mississippi State': 344, 'Missouri': 142, 'NC State': 152, 'Nebraska': 158, 'North Carolina': 153, 'Northwestern': 77, 'Notre Dame': 87, 'Ohio State': 194, 'Oklahoma': 201, 'Oklahoma State': 197, 'Ole Miss': 145, 'Oregon': 2483, 'Oregon State': 204, 'Penn State': 213, 'Pittsburgh': 221, 'Purdue': 2509, 'Rutgers': 164, 'SMU': 2567, 'South Carolina': 2579, 'Stanford': 24, 'Syracuse': 183, 'TCU': 2628, 'Tennessee': 2633, 'Texas': 251, 'Texas A&M': 245, 'Texas Tech': 2641, 'Tulane': 2655, 'UAB': 5, 'UCF': 2116, 'UCLA': 26, 'USC': 30, 'Utah': 254, 'Vanderbilt': 238, 'Virginia': 258, 'Virginia Tech': 259, 'Wake Forest': 154, 'Washington': 264, 'Washington State': 265, 'West Virginia': 277, 'Wisconsin': 275 }},
 'College Basketball': { league: 'ncaa/500', idBased: true, teams: { 'Alabama': 333, 'Arizona': 12, 'Arkansas': 8, 'Auburn': 2, 'Baylor': 239, 'BYU': 252, 'Cincinnati': 2132, 'Clemson': 228, 'Colorado': 38, 'Connecticut': 41, 'Creighton': 156, 'Dayton': 2168, 'Duke': 150, 'Florida': 57, 'Georgetown': 46, 'Gonzaga': 2250, 'Houston': 248, 'Illinois': 356, 'Indiana': 84, 'Iowa': 2294, 'Iowa State': 66, 'Kansas': 2305, 'Kentucky': 96, 'LSU': 99, 'Louisville': 97, 'Marquette': 269, 'Maryland': 120, 'Memphis': 235, 'Miami': 2390, 'Michigan': 130, 'Michigan State': 127, 'Minnesota': 135, 'Missouri': 142, 'NC State': 152, 'North Carolina': 153, 'Northwestern': 77, 'Notre Dame': 87, 'Ohio State': 194, 'Oklahoma': 201, 'Oregon': 2483, 'Penn State': 213, 'Pittsburgh': 221, 'Providence': 2507, 'Purdue': 2509, 'Rutgers': 164, 'San Diego State': 21, 'Seton Hall': 2550, 'St. Johns': 2599, 'Stanford': 24, 'Syracuse': 183, 'TCU': 2628, 'Tennessee': 2633, 'Texas': 251, 'Texas A&M': 245, 'Texas Tech': 2641, 'UCLA': 26, 'USC': 30, 'Vanderbilt': 238, 'Villanova': 222, 'Virginia': 258, 'Wake Forest': 154, 'Washington': 264, 'West Virginia': 277, 'Wichita State': 2724, 'Wisconsin': 275, 'Xavier': 2752 }},
 'Premier League': { league: 'soccer/500', idBased: true, teams: { 'Arsenal': 359, 'Aston Villa': 362, 'Bournemouth': 349, 'Brentford': 337, 'Brighton': 331, 'Chelsea': 363, 'Crystal Palace': 384, 'Everton': 368, 'Fulham': 370, 'Ipswich Town': 373, 'Leicester City': 375, 'Liverpool': 364, 'Manchester City': 382, 'Manchester United': 360, 'Newcastle United': 361, 'Nottingham Forest': 393, 'Southampton': 376, 'Tottenham Hotspur': 367, 'West Ham United': 371, 'Wolverhampton': 380 }},
 'La Liga': { league: 'soccer/500', idBased: true, teams: { 'Athletic Bilbao': 93, 'Atletico Madrid': 1068, 'Barcelona': 83, 'Celta Vigo': 85, 'Espanyol': 88, 'Getafe': 9812, 'Girona': 12321, 'Las Palmas': 472, 'Leganes': 9864, 'Mallorca': 3709, 'Osasuna': 97, 'Rayo Vallecano': 98, 'Real Betis': 244, 'Real Madrid': 86, 'Real Sociedad': 89, 'Real Valladolid': 102, 'Sevilla': 243, 'Valencia': 94, 'Villarreal': 102 }},
 'Champions League': { league: 'soccer/500', idBased: true, teams: { 'Arsenal': 359, 'Barcelona': 83, 'Bayern Munich': 132, 'Benfica': 1903, 'Borussia Dortmund': 124, 'Chelsea': 363, 'Inter Milan': 110, 'Juventus': 111, 'Liverpool': 364, 'Manchester City': 382, 'AC Milan': 103, 'Paris Saint-Germain': 160, 'Porto': 37, 'Real Madrid': 86, 'Atletico Madrid': 1068 }},
 'Liga MX': { league: 'soccer/500', idBased: true, teams: { 'America': 47, 'Atlas': 12172, 'Chivas': 12171, 'Cruz Azul': 12167, 'Leon': 12164, 'Monterrey': 12170, 'Pachuca': 12168, 'Pumas': 12169, 'Santos Laguna': 12173, 'Tigres': 12166, 'Toluca': 12165 }},
};

const EXTRA_TEAM_LOGOS = {
 'College Football': { 'Air Force': 2005, 'Akron': 2006, 'Appalachian State': 2026, 'Arkansas State': 2032, 'Army': 349, 'Ball State': 2050, 'Bowling Green': 189, 'Buffalo': 2084, 'Central Michigan': 2117, 'Charlotte': 2429, 'Coastal Carolina': 324, 'Colorado State': 36, 'Connecticut': 41, 'East Carolina': 151, 'Eastern Michigan': 2199, 'Florida Atlantic': 2226, 'Florida International': 2229, 'Fresno State': 278, 'Georgia Southern': 290, 'Georgia State': 2247, 'Hawaii': 62, 'Jacksonville State': 55, 'James Madison': 256, 'Kent State': 2309, 'Liberty': 2335, 'Louisiana': 309, 'Louisiana Tech': 2348, 'Marshall': 276, 'Miami (OH)': 193, 'Middle Tennessee': 2393, 'Navy': 2426, 'Nevada': 2440, 'New Mexico': 167, 'New Mexico State': 166, 'North Texas': 249, 'Northern Illinois': 2459, 'Ohio': 195, 'Old Dominion': 295, 'Rice': 242, 'Sam Houston State': 2534, 'San Diego State': 21, 'San Jose State': 23, 'South Alabama': 6, 'South Florida': 58, 'Southern Miss': 2572, 'Temple': 218, 'Texas State': 326, 'Toledo': 2649, 'Troy': 2653, 'Tulsa': 202, 'UNLV': 2439, 'UTEP': 2638, 'UTSA': 2636, 'Utah State': 328, 'Western Kentucky': 98, 'Western Michigan': 2711, 'Wyoming': 2704 },
 'College Basketball': { 'Air Force': 2005, 'Akron': 2006, 'Appalachian State': 2026, 'Ball State': 2050, 'Boise State': 68, 'Bowling Green': 189, 'Buffalo': 2084, 'Central Michigan': 2117, 'Charlotte': 2429, 'Coastal Carolina': 324, 'Colorado State': 36, 'East Carolina': 151, 'Eastern Michigan': 2199, 'Florida Atlantic': 2226, 'Fresno State': 278, 'Hawaii': 62, 'James Madison': 256, 'Kent State': 2309, 'Liberty': 2335, 'Louisiana': 309, 'Marshall': 276, 'Middle Tennessee': 2393, 'Nevada': 2440, 'New Mexico': 167, 'North Texas': 249, 'Northern Illinois': 2459, 'Ohio': 195, 'Old Dominion': 295, 'Rice': 242, 'South Florida': 58, 'Southern Miss': 2572, 'Temple': 218, 'Toledo': 2649, 'Troy': 2653, 'UNLV': 2439, 'Western Kentucky': 98 },
 'Premier League': { 'Tottenham': 367, 'Newcastle': 361, 'Wolves': 380, 'West Ham': 371 },
 'Liga MX': { 'Club América': 47, 'Chivas Guadalajara': 12171, 'Pumas UNAM': 12169, 'Tigres UANL': 12166, 'León': 12164, 'Santos Laguna': 12173 },
 'Champions League': { 'PSG': 160 },
};

const COUNTRY_LOGO_URLS = {
 'USA': 'us', "USA Women's": 'us', 'Mexico': 'mx', 'Canada': 'ca', "Canada Women's": 'ca',
 'Brazil': 'br', 'Argentina': 'ar', 'England': 'gb-eng', 'France': 'fr', 'Germany': 'de',
 'Spain': 'es', 'Portugal': 'pt', 'Netherlands': 'nl', 'Italy': 'it', 'Japan': 'jp',
 'South Korea': 'kr', 'Australia': 'au', 'Colombia': 'co', 'Uruguay': 'uy',
 'Chile': 'cl', 'Peru': 'pe', 'Ecuador': 'ec', 'Belgium': 'be', 'Croatia': 'hr',
 'Denmark': 'dk', 'Switzerland': 'ch', 'Poland': 'pl', 'Sweden': 'se', 'Serbia': 'rs',
 'Wales': 'gb-wls', 'Scotland': 'gb-sct', 'Ireland': 'ie',
 'Nigeria': 'ng', 'Senegal': 'sn', 'Ghana': 'gh', 'Cameroon': 'cm', 'Morocco': 'ma',
 'Egypt': 'eg', 'Tunisia': 'tn', 'South Africa': 'za', 'Algeria': 'dz',
 'India': 'in', 'Pakistan': 'pk', 'Iran': 'ir', 'Saudi Arabia': 'sa', 'Qatar': 'qa',
 'Costa Rica': 'cr', 'Honduras': 'hn', 'Jamaica': 'jm', 'Panama': 'pa',
 'New Zealand': 'nz', 'China': 'cn', 'Russia': 'ru', 'Turkey': 'tr', 'Greece': 'gr',
 'New Zealand All Blacks': 'nz', 'South Africa Springboks': 'za', 'Australia Wallabies': 'au',
 'Argentina Pumas': 'ar', 'West Indies': 'jm', 'Sri Lanka': 'lk', 'Bangladesh': 'bd',
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
 if (sportData) {
 const val = sportData.teams?.[team];
 if (val !== undefined && val !== null) {
 if (sportData.idBased) {
 return `https://a.espncdn.com/i/teamlogos/${sportData.league}/${val}.png`;
 }
 return `https://a.espncdn.com/i/teamlogos/${sportData.league}/500/${val}.png`;
 }
 }
 const extraData = EXTRA_TEAM_LOGOS[sport];
 if (extraData) {
 const val = extraData[team];
 if (val !== undefined && val !== null) {
 const baseData = TEAM_LOGO_MAP[sport];
 if (baseData?.idBased) {
 return `https://a.espncdn.com/i/teamlogos/${baseData.league}/${val}.png`;
 }
 if (baseData) {
 return `https://a.espncdn.com/i/teamlogos/${baseData.league}/500/${val}.png`;
 }
 }
 }
 const countryCode = COUNTRY_LOGO_URLS[team];
 if (countryCode) {
 return `https://flagcdn.com/w80/${countryCode}.png`;
 }
 return null;
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
 { color: 'from-cyan-600/40 to-blue-600/40', borderColor: 'border-[#1E90FF]/30' },
 { color: 'from-purple-600/40 to-pink-600/40', borderColor: 'border-purple-500/30' },
 { color: 'from-amber-600/40 to-orange-600/40', borderColor: 'border-amber-500/30' },
 { color: 'from-emerald-600/40 to-teal-600/40', borderColor: 'border-emerald-500/30' },
 { color: 'from-rose-600/40 to-red-600/40', borderColor: 'border-rose-500/30' },
];

const DEMO_SPONSORS = [
 { name: 'Tailgate Nation', tagline: 'The ultimate tailgate experience', demoLogo: '/demo-sponsors/cold-brew-co.png', url: '#', sport: 'NFL', slot: 1, tier: 'premium' },
 { name: 'Game Day Grill', tagline: 'Fuel your game day experience', demoLogo: '/demo-sponsors/gameday-grill.png', url: '#', sport: 'NFL', slot: 2 },
 { name: 'Cold Brew Co', tagline: 'Craft beers for every quarter', demoLogo: '/demo-sponsors/cold-brew-co.png', url: '#', sport: 'NFL', slot: 3 },
 { name: 'FanBet', tagline: 'Your game, your call - bet smarter', demoLogo: '/demo-sponsors/fanbet.png', url: '#', sport: 'NFL', slot: 4 },
 { name: 'Gridiron Gear', tagline: 'Gear up for game day', demoLogo: '/demo-sponsors/gameday-grill.png', url: '#', sport: 'NFL', slot: 5 },
 { name: 'Hoops & Hops', tagline: 'Where basketball meets craft beer', demoLogo: '/demo-sponsors/surge-energy.png', url: '#', sport: 'NBA', slot: 1, tier: 'premium' },
 { name: 'Peak Athletics', tagline: 'Performance gear for real fans', demoLogo: '/demo-sponsors/peak-athletics.png', url: '#', sport: 'NBA', slot: 2 },
 { name: 'Surge Energy', tagline: 'Powered by fans, fueled by Surge', demoLogo: '/demo-sponsors/surge-energy.png', url: '#', sport: 'NBA', slot: 3 },
 { name: 'Slam Dunk Pizza', tagline: 'Score big with every slice', demoLogo: '/demo-sponsors/slam-dunk-pizza.png', url: '#', sport: 'NBA', slot: 4 },
 { name: 'Courtside Kicks', tagline: 'Step up your sneaker game', demoLogo: '/demo-sponsors/peak-athletics.png', url: '#', sport: 'NBA', slot: 5 },
];

const DEMO_MAIN_SPONSOR = {
 name: 'Apex Athletics',
 tagline: 'Gear Up for Game Day',
 logoUrl: '/images/main-sponsor-banner.png',
 bannerUrl: '/images/main-sponsor-banner.png',
 url: '#',
 isDemo: true,
};

const MAIN_BANNER_HEIGHT = 60;
const MainBrandBanner = ({ user: bannerUser, onProfileClick, onMenuClick, totalAlerts = 0 }) => {
 return (
 <div
 className="compact-header w-full"
 style={{ height: `${MAIN_BANNER_HEIGHT}px` }}
 >
 <div className="header-gradient-overlay" />
 <div className="relative z-[2] flex items-center justify-between h-full px-4 max-w-4xl mx-auto">
 <div className="flex items-center gap-2 flex-1 min-w-0">
 <button onClick={onMenuClick} className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-white/10 transition-colors active:scale-95 flex-shrink-0">
 <Menu className="w-7 h-7 text-white" />
 <span className="text-[9px] font-bold text-white/60 leading-none">MENU</span>
 </button>
 <img src="/huddle-up-shield.png" alt="Huddle Up" className="h-10 w-10 flex-shrink-0" style={{ filter: 'drop-shadow(0 2px 8px rgba(30, 144, 255, 0.3))' }} />
 <div className="flex flex-col gap-0.5 min-w-0">
 <span className="text-lg font-black text-white tracking-wide whitespace-nowrap leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>HUDDLE UP</span>
 <span className="text-[11px] font-semibold whitespace-nowrap leading-tight" style={{ background: 'linear-gradient(90deg, #1E90FF 0%, #FFD700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Find Your Crew. Watch The Game.</span>
 </div>
 </div>
 <div className="flex items-center gap-3 flex-shrink-0">
 <button onClick={onProfileClick} className="relative p-0.5 rounded-full active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #1E90FF, #FFD700)', padding: '2px' }}>
 <div className="rounded-full overflow-hidden bg-[#151A22]">
 {bannerUser?.profilePicture ? (
 <ProfileAvatar src={bannerUser.profilePicture} name={bannerUser.name} size="sm" className="border-0" />
 ) : (
 <div className="w-8 h-8 rounded-full bg-[#151A22] flex items-center justify-center">
 <User className="w-5 h-5 text-white" />
 </div>
 )}
 </div>
 {totalAlerts > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg">{totalAlerts}</span>}
 </button>
 </div>
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
 single: { name: "Single Location", base: 29.99, featured: 49.99 },
 chain: { name: "Multi-Location (2-5)", base: 29.99, featured: 49.99 },
 chainPlus: { name: "Regional Chain (6-20)", base: 29.99, featured: 49.99 },
 enterprise: { name: "Enterprise (20+)", base: 29.99, featured: 49.99 }
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
 className={`${sizeClasses[size]} rounded-full object-cover border-2 border-[#222A36] ${className}`}
 />
 );
 }
 const initial = (name || '?')[0].toUpperCase();
 return (
 <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#1E90FF] to-[#1E90FF] flex items-center justify-center text-white font-bold border-2 border-[#222A36] ${className}`}>
 {initial}
 </div>
 );
};

const getFanBadge = (attended, hosted) => {
 const total = attended + hosted;
 if (total >= 50) return { tier: 'Legend', emoji: '🏆', color: 'from-yellow-400 to-amber-500', textColor: 'text-yellow-300', bg: 'bg-yellow-500/20' };
 if (total >= 25) return { tier: 'MVP', emoji: '🥇', color: 'from-purple-400 to-pink-500', textColor: 'text-purple-300', bg: 'bg-purple-500/20' };
 if (total >= 10) return { tier: 'All-Star', emoji: '⭐', color: 'from-[#1E90FF] to-[#1E90FF]', textColor: 'text-[#1E90FF]', bg: 'bg-[#1E90FF]/20' };
 if (total >= 5) return { tier: 'Starter', emoji: '🔥', color: 'from-orange-400 to-red-500', textColor: 'text-orange-300', bg: 'bg-orange-500/20' };
 if (total >= 1) return { tier: 'Rookie', emoji: '🎽', color: 'from-green-400 to-emerald-500', textColor: 'text-green-300', bg: 'bg-green-500/20' };
 return { tier: 'New Fan', emoji: '👋', color: 'from-gray-400 to-gray-500', textColor: 'text-[#A0A4AB]', bg: 'bg-gray-500/20' };
};

const getVenueBadge = (totalParties, totalFans) => {
 if (totalParties >= 50) return { tier: 'Hall of Fame', emoji: '🏟️', color: 'from-yellow-400 to-amber-500', textColor: 'text-yellow-300' };
 if (totalParties >= 25) return { tier: 'Championship', emoji: '🏆', color: 'from-purple-400 to-pink-500', textColor: 'text-purple-300' };
 if (totalParties >= 10) return { tier: 'All-Star Venue', emoji: '⭐', color: 'from-[#1E90FF] to-[#1E90FF]', textColor: 'text-[#1E90FF]' };
 if (totalParties >= 5) return { tier: 'Rising Spot', emoji: '📈', color: 'from-orange-400 to-red-500', textColor: 'text-orange-300' };
 if (totalParties >= 1) return { tier: 'Game Day Ready', emoji: '🍺', color: 'from-green-400 to-emerald-500', textColor: 'text-green-300' };
 return { tier: 'New Venue', emoji: '🏠', color: 'from-gray-400 to-gray-500', textColor: 'text-[#A0A4AB]' };
};

const BadgeDisplay = ({ attended, hosted, size = 'sm' }) => {
 const badge = getFanBadge(attended, hosted);
 if (size === 'lg') {
 return (
 <div className="flex flex-col items-center gap-2">
 <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl shadow-sm`}>
 {badge.emoji}
 </div>
 <div className="text-center">
 <div className={`font-black text-lg ${badge.textColor}`}>{badge.tier}</div>
 <div className="text-[#A0A4AB] text-xs mt-1">
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
 <span className="text-[#A0A4AB] text-xs">{totalParties} parties &middot; {totalFans} fans</span>
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
 if (!dobStr || dobStr.length < 10) return null;
 const dob = new Date(dobStr + 'T00:00:00');
 if (isNaN(dob.getTime())) return null;
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
 const computedAge = editDob ? calcAge(editDob) : null;
 if (editDob && computedAge !== null && computedAge < 21) { setError('You must be 21 years of age or older'); return; }
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
 <div className="bg-[#151A22] rounded-2xl p-6 max-w-md w-full border border-[#222A36] shadow-2xl max-h-[90vh] overflow-y-auto overscroll-contain" onMouseDown={e => e.stopPropagation()}>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Pencil className="inline w-5 h-5 mr-2 text-[#1E90FF]" />
 EDIT PROFILE
 </h2>
 <button onClick={onClose} className="text-[#A0A4AB] hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>
 <form onSubmit={handleSubmit}>
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Name</label>
 <input
 type="text"
 value={editName}
 onChange={e => setEditName(e.target.value)}
 placeholder="Your name"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Email</label>
 <input
 type="email"
 value={editEmail}
 onChange={e => setEditEmail(e.target.value)}
 placeholder="your@email.com"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
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
 className="w-full px-4 py-3 bg-[#151A22] border border-amber-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
 />
 </div>
 )}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Phone Number</label>
 <input
 type="tel"
 value={editPhone}
 onChange={e => setEditPhone(e.target.value)}
 placeholder="+1 (555) 123-4567"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Your City</label>
 <input
 type="text"
 value={editCity}
 onChange={e => setEditCity(e.target.value)}
 placeholder="e.g., Miami, FL"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Date of Birth</label>
 <input
 type="date"
 value={editDob}
 onChange={e => setEditDob(e.target.value)}
 max={new Date().toISOString().split('T')[0]}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 {editDob && calcAge(editDob) !== null && (
 <p className="text-[#A0A4AB] text-sm mt-1">Age: {calcAge(editDob)}</p>
 )}
 </div>
 <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
 <label className="flex items-start gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={ageConfirmed}
 onChange={e => setAgeConfirmed(e.target.checked)}
 className="mt-1 w-5 h-5 rounded border-2 border-amber-500/50 bg-[#151A22] text-amber-500 focus:ring-amber-500 accent-amber-500"
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
 className="w-full py-3 bg-[#1E90FF] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
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
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36]">
 <div className="flex items-center justify-center py-8">
 <Loader2 className="w-8 h-8 text-[#1E90FF] animate-spin" />
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
 className="px-3 py-1.5 bg-[#151A22] text-amber-300 text-sm font-bold rounded-lg hover:bg-[#222A36] transition-all border border-amber-500/30"
 >
 {showStats ? 'Show QR Code' : 'View Turnout Stats'}
 </button>
 )}
 </div>

 <p className="text-[#A0A4AB] text-sm">
 Generate a unique QR code for your venue. Fans scan it to check in and prove attendance, earning points and the "Verified Attendee" badge.
 </p>

 {!showStats ? (
 <>
 {qrData?.hasQr ? (
 <div className="flex flex-col sm:flex-row items-center gap-6">
 <div className="bg-white p-4 rounded-2xl shadow-sm">
 <img src={qrData.qrDataUrl} alt="Venue QR Code" className="w-48 h-48" />
 </div>
 <div className="flex-1 space-y-3">
 <div className="text-white font-bold text-lg">{userVenue.name}</div>
 <p className="text-[#A0A4AB] text-sm">
 Print this QR code and display it at your venue. Fans scan it with their phone camera to check in instantly.
 </p>
 <div className="flex flex-wrap gap-2">
 <button onClick={downloadQr}
 className="px-4 py-2 bg-amber-500/20 text-amber-300 font-bold rounded-xl hover:bg-amber-500/30 transition-all text-sm border border-amber-500/30">
 Download QR
 </button>
 <button onClick={copyCheckinLink}
 className="px-4 py-2 bg-[#151A22] text-white font-bold rounded-xl hover:bg-[#222A36] transition-all text-sm border border-[#222A36]">
 Copy Link
 </button>
 <button onClick={generateQr} disabled={generating}
 className="px-4 py-2 bg-[#151A22] text-[#A0A4AB] font-bold rounded-xl hover:bg-[#222A36] transition-all text-sm border border-[#222A36]">
 {generating ? 'Regenerating...' : 'Regenerate'}
 </button>
 </div>
 <p className="text-xs text-[#A0A4AB]/70">
 Regenerating creates a new code and deactivates the old one.
 </p>
 </div>
 </div>
 ) : (
 <div className="text-center py-6">
 <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
 <CheckCircle className="w-10 h-10 text-amber-400" />
 </div>
 <p className="text-[#A0A4AB] mb-4">No QR code generated yet.</p>
 <button onClick={generateQr} disabled={generating}
 className={`px-6 py-3 font-bold rounded-xl transition-all ${
 generating ? 'bg-gray-500 text-[#A0A4AB]' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-500/50'
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
 <div className="bg-[#151A22] p-4 rounded-xl border border-[#222A36] text-center">
 <div className="text-2xl font-black text-white">{venueStats.totalCheckins}</div>
 <div className="text-xs text-[#A0A4AB] mt-1">Total Check-ins</div>
 </div>
 <div className="bg-[#151A22] p-4 rounded-xl border border-[#222A36] text-center">
 <div className="text-2xl font-black text-green-400">{venueStats.verifiedCheckins}</div>
 <div className="text-xs text-[#A0A4AB] mt-1">QR Verified</div>
 </div>
 <div className="bg-[#151A22] p-4 rounded-xl border border-[#222A36] text-center">
 <div className="text-2xl font-black text-[#1E90FF]">{venueStats.uniqueVisitors}</div>
 <div className="text-xs text-[#A0A4AB] mt-1">Unique Visitors</div>
 </div>
 <div className="bg-[#151A22] p-4 rounded-xl border border-[#222A36] text-center">
 <div className="text-2xl font-black text-purple-400">{venueStats.totalParties}</div>
 <div className="text-xs text-[#A0A4AB] mt-1">Total Parties</div>
 </div>
 </div>

 {venueStats.recentCheckins.length > 0 && (
 <div>
 <h3 className="text-white font-bold mb-3">Recent Check-ins</h3>
 <div className="space-y-2 max-h-64 overflow-y-auto">
 {venueStats.recentCheckins.map((ci, i) => (
 <div key={i} className="bg-[#151A22] p-3 rounded-xl border border-[#222A36] flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ci.qrVerified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-[#A0A4AB]'}`}>
 {ci.qrVerified ? <CheckCircle className="w-4 h-4" /> : <User className="w-4 h-4" />}
 </div>
 <div>
 <div className="text-white text-sm font-bold">{ci.userName}</div>
 {ci.gameTitle && <div className="text-[#A0A4AB] text-xs">{ci.gameTitle}</div>}
 </div>
 </div>
 <div className="flex items-center gap-2">
 {ci.qrVerified && (
 <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-bold rounded-full">VERIFIED</span>
 )}
 <span className="text-[#A0A4AB]/70 text-xs">{new Date(ci.checkedInAt).toLocaleDateString()}</span>
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

const SubscriptionSection = ({ userType }) => {
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
 pro: { icon: '⭐', btnClass: 'bg-gradient-to-r from-amber-500 to-amber-600', label: 'Pro', features: ['VIP badge', '3x points multiplier', 'Early party access', 'Custom profile themes', 'Advanced analytics'] },
 venue: { icon: '\u{1F3EA}', btnClass: 'bg-gradient-to-r from-green-500 to-green-600', label: 'Venue Owner', features: ['Claim & manage your venue', 'Upload photos & logo', 'Appear in search results', 'Analytics dashboard'] },
 sponsor: { icon: '\u{1F4E2}', btnClass: 'bg-gradient-to-r from-orange-500 to-orange-600', label: 'Sponsor', features: ['Premium banner ads', 'All sports coverage', 'Featured placement', 'Reach analytics'] },
 }

 if (loading) {
 return (
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36] shadow-xl">
 <div className="flex items-center justify-center py-8">
 <Loader2 className="w-6 h-6 animate-spin text-[#1E90FF]" />
 </div>
 </div>
 );
 }

 const currentTier = subInfo?.tier || 'free';

 return (
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36] shadow-xl">
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
 className="px-3 py-1.5 bg-[#151A22] text-white text-sm rounded-lg hover:bg-[#222A36] transition-colors"
 >
 Manage Billing
 </button>
 </div>
 </div>
 )}
 <div className="grid gap-3">
 {products.filter(product => {
 const tier = product.metadata?.tier || 'pro';
 if (userType === 'venue') return tier === 'venue';
 return tier === 'pro';
 }).sort((a, b) => {
 const orderA = parseInt(a.metadata?.order || '99');
 const orderB = parseInt(b.metadata?.order || '99');
 return orderA - orderB;
 }).map(product => {
 const tier = product.metadata?.tier || 'pro';
 const config = tierConfig[tier] || tierConfig.pro;
 const price = product.prices?.[0];
 const isCurrentPlan = currentTier === tier;

 return (
 <div key={product.id} className={`p-4 rounded-xl border ${isCurrentPlan ? 'border-green-500/50 bg-green-500/10' : 'border-[#222A36] bg-[#151A22]'}`}>
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span className="text-2xl">{config.icon}</span>
 <div>
 <div className="text-white font-bold">{product.name}</div>
 {price && (
 <div className="text-sm text-[#A0A4AB]">
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
 className={`px-4 py-2 ${config.btnClass} text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50`}
 >
 {checkoutLoading === tier ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
 </button>
 ) : null}
 </div>
 <ul className="space-y-1 mt-2">
 {config.features.map((f, i) => (
 <li key={i} className="text-xs text-[#A0A4AB] flex items-center gap-1.5">
 <Check className="w-3 h-3 text-green-400 flex-shrink-0" /> {f}
 </li>
 ))}
 </ul>
 </div>
 );
 })}
 {products.length === 0 && (
 <p className="text-[#A0A4AB]/70 text-sm text-center py-4">Subscription plans coming soon!</p>
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
 <div className="bg-gradient-to-br from-orange-900/30 to-[#151A22] p-6 rounded-2xl border border-orange-500/20 shadow-xl">
 <div className="flex items-center justify-center py-8">
 <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
 </div>
 </div>
 );
 }

 return (
 <div className="bg-gradient-to-br from-orange-900/30 to-[#151A22] p-6 rounded-2xl border border-orange-500/20 shadow-xl">
 <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Link className="inline w-6 h-6 mr-2 text-orange-400" />
 AFFILIATE PROGRAM
 </h2>
 <p className="text-[#A0A4AB] text-sm mb-4">
 Share your code and earn rewards when your referrals join Huddle Up!
 </p>

 {referralData?.referralCode && (
 <div className="mb-4 p-4 bg-[#151A22] rounded-xl border border-[#222A36]">
 <div className="text-xs text-[#A0A4AB] mb-1 font-bold">YOUR REFERRAL CODE</div>
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
 <div className="bg-[#151A22] p-3 rounded-xl text-center">
 <div className="text-2xl font-black text-white">{referralData?.totalReferrals || 0}</div>
 <div className="text-[10px] text-[#A0A4AB] font-bold">REFERRALS</div>
 </div>
 <div className="bg-[#151A22] p-3 rounded-xl text-center">
 <div className="text-2xl font-black text-green-400">{referralData?.conversions || 0}</div>
 <div className="text-[10px] text-[#A0A4AB] font-bold">CONVERSIONS</div>
 </div>
 <div className="bg-[#151A22] p-3 rounded-xl text-center">
 <div className="text-2xl font-black text-yellow-400">${(referralData?.totalEarnings || 0).toFixed(2)}</div>
 <div className="text-[10px] text-[#A0A4AB] font-bold">EARNINGS</div>
 </div>
 </div>

 {!user?.referred_by && (
 <div className="p-3 bg-[#151A22] rounded-xl border border-[#222A36]">
 <div className="text-xs text-[#A0A4AB] mb-2 font-bold">HAVE A REFERRAL CODE?</div>
 <div className="flex gap-2">
 <input
 type="text"
 value={applyCode}
 onChange={e => setApplyCode(e.target.value.toUpperCase())}
 placeholder="Enter code (e.g., HU-ABCD1234)"
 className="flex-1 px-3 py-2 bg-[#151A22] border border-[#222A36] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Phone Number</label>
 <input
 type="tel"
 value={phone}
 onChange={e => setPhone(e.target.value)}
 onFocus={() => setPhoneFocused(true)}
 onBlur={() => { setPhoneFocused(false); savePhone(); }}
 placeholder="+1 (555) 123-4567"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Your City</label>
 <input
 type="text"
 value={city}
 onChange={e => setCity(e.target.value)}
 onFocus={() => setCityFocused(true)}
 onBlur={() => { setCityFocused(false); saveCity(); }}
 placeholder="e.g., Fort Lauderdale, FL"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
 />
 </div>
 </div>
 );
};

const HuddleUpApp = () => {
 const [currentScreen, setCurrentScreenRaw] = useState('welcome');
 const screenHistoryRef = useRef([]);
 const setCurrentScreen = useCallback((screenOrFn) => {
   setCurrentScreenRaw(prev => {
     const next = typeof screenOrFn === 'function' ? screenOrFn(prev) : screenOrFn;
     if (next !== prev) {
       const authScreens = ['welcome', 'login', 'signup', 'signupType', 'forgotPassword'];
       if (!authScreens.includes(prev)) {
         screenHistoryRef.current = [...screenHistoryRef.current.slice(-19), prev];
       }
       setTimeout(() => window.scrollTo(0, 0), 0);
     }
     return next;
   });
 }, []);
 const goBack = useCallback(() => {
   const history = screenHistoryRef.current;
   if (history.length > 0) {
     const prevScreen = history[history.length - 1];
     screenHistoryRef.current = history.slice(0, -1);
     setCurrentScreenRaw(prevScreen);
   }
 }, []);
 const [user, setUser] = useState(null);
 const [selectedSports, setSelectedSports] = useState([]);
 const [showSportsScrollArrow, setShowSportsScrollArrow] = useState(true);
 const sportsScrollRef = useRef(null);
 const [selectedGame, setSelectedGame] = useState(null);
 const [parties, setParties] = useState([]);
 const [userParties, setUserParties] = useState([]);
 const [hotParties, setHotParties] = useState([]);
 const [lastChanceParties, setLastChanceParties] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [currentCity, setCurrentCity] = useState('');
 const [userCoords, setUserCoords] = useState(null);
 const [locationLoading, setLocationLoading] = useState(false);
 const [locationDetected, setLocationDetected] = useState(false);
 const [showOnboarding, setShowOnboarding] = useState(false);
 const [onboardingStep, setOnboardingStep] = useState(0);
 const [showWelcomePopup, setShowWelcomePopup] = useState(false);
 const [showQA, setShowQA] = useState(false);
 const [qaExpandedIndex, setQaExpandedIndex] = useState(null);
 const [showTourGuide, setShowTourGuide] = useState(false);
 const [prelaunchUserCount, setPrelaunchUserCount] = useState(0);
 const [showPrelaunchModal, setShowPrelaunchModal] = useState(false);
 const [prelaunchDismissed, setPrelaunchDismissed] = useState(false);
 const [showTutorial, setShowTutorial] = useState(false);
 const [tutorialStep, setTutorialStep] = useState(0);
 const [featuredTab, setFeaturedTab] = useState('parties');
 const [showIntroSplash, setShowIntroSplash] = useState(false);
 const [introStage, setIntroStage] = useState(0);
 const launchIntroSplash = () => {
   if (localStorage.getItem('skipIntros') === 'true') return;
   setIntroStage(0);
   setShowIntroSplash(true);
   setTimeout(() => setIntroStage(1), 1000);
   setTimeout(() => setIntroStage(2), 2000);
   setTimeout(() => setIntroStage(3), 3000);
   setTimeout(() => setIntroStage(4), 4000);
   setTimeout(() => setIntroStage(5), 4500);
   setTimeout(() => setShowIntroSplash(false), 5000);
 };
 const skipIntroSplash = () => { setShowIntroSplash(false); };
 const neverShowIntro = () => { localStorage.setItem('skipIntros', 'true'); setShowIntroSplash(false); };
 const closeTutorial = () => { localStorage.setItem('huddle_tutorial_done', 'true'); setShowTutorial(false); };
 const scrollToFindYourSport = () => {
   const el = document.getElementById('find-your-sport');
   if (el) {
     el.scrollIntoView({ behavior: 'smooth', block: 'start' });
   }
 };
 useEffect(() => {
   if (user && !localStorage.getItem('huddle_tutorial_done') && !showPrelaunchModal && !showOnboarding) {
     const timer = setTimeout(() => setShowTutorial(true), 1000);
     return () => clearTimeout(timer);
   }
 }, [user, showPrelaunchModal, showOnboarding]);
 const [wcTick, setWcTick] = useState(Date.now());
 useEffect(() => { if (currentScreen !== 'games') return; const id = setInterval(() => setWcTick(Date.now()), 1000); return () => clearInterval(id); }, [currentScreen]);
useEffect(() => { window.scrollTo(0, 0); }, [currentScreen]);
useEffect(() => { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, []);
useEffect(() => { if (user) { window.scrollTo(0, 0); } }, [user]);
 const [softLaunchDismissed, setSoftLaunchDismissed] = useState(() => {
   const stored = localStorage.getItem('softlaunch_banner_dismissed');
   if (!stored) return false;
   try { const parsed = JSON.parse(stored); return Date.now() - parsed.time < 7 * 24 * 60 * 60 * 1000; } catch { return false; }
 });
 const [softLaunchStats, setSoftLaunchStats] = useState({ users: 0, parties: 0, venues: 0 });
 const [tourTab, setTourTab] = useState('fans');
 const [spotlightTourActive, setSpotlightTourActive] = useState(false);
 const [spotlightStep, setSpotlightStep] = useState(0);
 const [showInviteReminder, setShowInviteReminder] = useState(false);
 const inviteReminderShown = useRef(false);
 const [showProScreen, setShowProScreen] = useState(false);
 const [myTeamsOnly, setMyTeamsOnly] = useState(false);
 const [dateFilter, setDateFilter] = useState('All');
 const [sortOption, setSortOption] = useState('Soonest');
 const [showFilterPanel, setShowFilterPanel] = useState(false);
 const [hamburgerOpen, setHamburgerOpen] = useState(false);
 const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
 const [adSlideIndex, setAdSlideIndex] = useState(0);
 const adTouchStartRef = React.useRef(0);
 const [pwaInstallPrompt, setPwaInstallPrompt] = useState(null);
 const [showInstallBanner, setShowInstallBanner] = useState(false);
 const [showIosInstallModal, setShowIosInstallModal] = useState(false);
 const [isAppInstalled, setIsAppInstalled] = useState(false);
const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
const [findPartiesSearch, setFindPartiesSearch] = useState('');
const [findPartiesCityInput, setFindPartiesCityInput] = useState('');
const [findPartiesShowCity, setFindPartiesShowCity] = useState(false);
const [findPartiesSport, setFindPartiesSport] = useState('All');
 const [venues, setVenues] = useState(SAMPLE_VENUES);
 const [venueClaims, setVenueClaims] = useState([]);
 const [selectedVenue, setSelectedVenue] = useState(null);
 const [selectedVenueId, setSelectedVenueId] = useState(null);
 const [games, setGames] = useState(SAMPLE_GAMES);
 const [loadingGames, setLoadingGames] = useState(false);
 const prevScoresRef = useRef({});
 const [scoreCelebration, setScoreCelebration] = useState(null);
 const [scoreCelebrationsEnabled, setScoreCelebrationsEnabled] = useState(() => localStorage.getItem('score_celebrations') !== 'false');

 const [celebrateActive, setCelebrateActive] = useState(false);
 const [celebrateCount, setCelebrateCount] = useState(0);

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
 const [sponsorPlacementType, setSponsorPlacementType] = useState('sport_banner');
 const [sponsorTagline, setSponsorTagline] = useState('');
 const [sponsorTargetSports, setSponsorTargetSports] = useState([]);
 const [sponsorTierField, setSponsorTierField] = useState('standard');
 const [sponsorSlotNumber, setSponsorSlotNumber] = useState('');
 const [savingSponsor, setSavingSponsor] = useState(false);
 const [uploadingSponsorLogo, setUploadingSponsorLogo] = useState(false);
 const [adminEditVenue, setAdminEditVenue] = useState(null);
 const [adminEditForm, setAdminEditForm] = useState({});
 const [adminSavingVenue, setAdminSavingVenue] = useState(false);
 const [adminRaffles, setAdminRaffles] = useState([]);
 const [adminRaffleForm, setAdminRaffleForm] = useState(null);
 const [adminRaffleSaving, setAdminRaffleSaving] = useState(false);
const [adminRaffleImageUploading, setAdminRaffleImageUploading] = useState(false);
 const [adminAffiliates, setAdminAffiliates] = useState([]);
 const [adminAffiliateForm, setAdminAffiliateForm] = useState(null);
 const [adminAffiliateSaving, setAdminAffiliateSaving] = useState(false);
 const [adminAffiliateDetail, setAdminAffiliateDetail] = useState(null);
 const [adminAffiliateReferrals, setAdminAffiliateReferrals] = useState([]);
 const [adminPayoutForm, setAdminPayoutForm] = useState(null);
 const [totalUsers, setTotalUsersCount] = useState(0);
 const [adminTab, setAdminTab] = useState('analytics');
 const [analyticsData, setAnalyticsData] = useState(null);
 const [analyticsLoading, setAnalyticsLoading] = useState(false);
 const [qrCheckinToken, setQrCheckinToken] = useState(null);
 const [deepLinkPartyId, setDeepLinkPartyId] = useState(null);
 const [influencerDashboardToken, setInfluencerDashboardToken] = useState(null);
 const [initialInfluencerCode, setInitialInfluencerCode] = useState('');
 const [adminQrModal, setAdminQrModal] = useState(null);
 const [editPartyModal, setEditPartyModal] = useState(null);
 const [editPartyForm, setEditPartyForm] = useState({ venueName: '', streetAddress: '', city: '', state: '', notes: '', maxSize: '', gameTime: '' });
 const [editPartySaving, setEditPartySaving] = useState(false);
 const [invitations, setInvitations] = useState([]);
 const [notifications, setNotifications] = useState([]);
 const notificationCountRef = useRef(0);
 const [fanSearchSport, setFanSearchSport] = useState('');
 const [fanSearchTeam, setFanSearchTeam] = useState('');
 const [fanResults, setFanResults] = useState([]);
 const [fanSearchLoading, setFanSearchLoading] = useState(false);
 const [fanNameQuery, setFanNameQuery] = useState('');
 const [fanNameResults, setFanNameResults] = useState([]);
 const [fanNameSearchLoading, setFanNameSearchLoading] = useState(false);
 const [fanSearchTab, setFanSearchTab] = useState('nearby');
 const [nearbyFans, setNearbyFans] = useState([]);
 const [nearbyParties, setNearbyParties] = useState([]);
 const [nearbyLoading, setNearbyLoading] = useState(false);
 const [nearbyCity, setNearbyCity] = useState('');
 const [invitePartyId, setInvitePartyId] = useState(null);
 const [inviteSending, setInviteSending] = useState({});
 const [friendsList, setFriendsList] = useState([]);
 const [friendRequests, setFriendRequests] = useState([]);
 const [friendStatuses, setFriendStatuses] = useState({});
 const [crewTab, setCrewTab] = useState('friends');
 const [crewInvitePartyId, setCrewInvitePartyId] = useState(null);
 const [crewSearchQuery, setCrewSearchQuery] = useState('');
 const [crewSearchResults, setCrewSearchResults] = useState([]);
 const [crewSearchLoading, setCrewSearchLoading] = useState(false);
 const [friendActivity, setFriendActivity] = useState([]);
 const [friendActivityLoading, setFriendActivityLoading] = useState(false);
 const [dmChatUser, setDmChatUser] = useState(null);
 const [dmMessages, setDmMessages] = useState([]);
 const [dmNewMsg, setDmNewMsg] = useState('');
 const [dmSending, setDmSending] = useState(false);
 const [dmUnreadCount, setDmUnreadCount] = useState(0);
 const [dmConversations, setDmConversations] = useState([]);
 const [dmPopup, setDmPopup] = useState(null);
 const dmEndRef = useRef(null);
 const dmPrevUnreadRef = useRef(-1);
 const [badgeStats, setBadgeStats] = useState({ partiesHosted: 0, partiesAttended: 0 });
 const [showShareToast, setShowShareToast] = useState(false);
 const [showSignupShare, setShowSignupShare] = useState(false);
 const [editProfileOpen, setEditProfileOpen] = useState(false);
 const [pushEnabled, setPushEnabled] = useState(false);
 const [watchedGames, setWatchedGames] = useState([]);
 const [pushSubscription, setPushSubscription] = useState(null);
 const [showPushBanner, setShowPushBanner] = useState(false);
 const [notifPrefs, setNotifPrefs] = useState(null);
 const [openChatPartyId, setOpenChatPartyId] = useState(null);
 const [chatPartyName, setChatPartyName] = useState('');
 const [chatPrevScreen, setChatPrevScreen] = useState('gameDetail');
 const [chatMessages, setChatMessages] = useState([]);
 const [chatInput, setChatInput] = useState('');
 const [chatLoading, setChatLoading] = useState(false);
 const [chatSending, setChatSending] = useState(false);
 const [chatTrashTalk, setChatTrashTalk] = useState(false);
 const chatEndRef = useRef(null);
const chatInputRef = useRef(null);
 const chatPollRef = useRef(null);
 const [openPhotoPartyId, setOpenPhotoPartyId] = useState(null);
 const [partyPhotos, setPartyPhotos] = useState([]);
 const [checkedInParties, setCheckedInParties] = useState({});
const [qrScannerOpen, setQrScannerOpen] = useState(false);
const [qrScanPartyId, setQrScanPartyId] = useState(null);
const [qrScanStatus, setQrScanStatus] = useState(null);
const qrScannerRef = useRef(null);
 const [rewardsBalance, setRewardsBalance] = useState({ totalPoints: 0, lifetimePoints: 0 });
 const [rewardsHistory, setRewardsHistory] = useState([]);
 const [rewardsCatalog, setRewardsCatalog] = useState([]);
 const [rewardsRedemptions, setRewardsRedemptions] = useState([]);
 const [rewardsTab, setRewardsTab] = useState('raffles');
 const [redeemingReward, setRedeemingReward] = useState(null);
 const [raffles, setRaffles] = useState([]);
 const [raffleEntryCount, setRaffleEntryCount] = useState({});
 const [enteringRaffle, setEnteringRaffle] = useState(null);
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

 const [showShareMenu, setShowShareMenu] = useState(false);
 const [shareParty, setShareParty] = useState(null);
 const [linkCopied, setLinkCopied] = useState(false);
 const [showCalendarMenu, setShowCalendarMenu] = useState(false);
 const [calendarParty, setCalendarParty] = useState(null);

 const [myPredictions, setMyPredictions] = useState([]);
 const [predictionStats, setPredictionStats] = useState(null);
 const [predictionLeaderboard, setPredictionLeaderboard] = useState([]);
 const [predictionLeaderPeriod, setPredictionLeaderPeriod] = useState('weekly');
 const [predictionsTab, setPredictionsTab] = useState('upcoming');
 const [predictionLoading, setPredictionLoading] = useState(false);
 const [gamePredictionCache, setGamePredictionCache] = useState({});
 const [expandedPrediction, setExpandedPrediction] = useState(null);
 const [predictionConfidence, setPredictionConfidence] = useState(5);
 const [adminPendingGames, setAdminPendingGames] = useState([]);
 const [adminResolveGame, setAdminResolveGame] = useState(null);

 const generatePartyLink = (party) => {
 return `${window.location.origin}/party/${party.id}`;
 };

 const generateShareText = (party) => {
 const game = games.find(g => g.id === party.gameId);
 const teams = game ? `${game.homeTeam} vs ${game.awayTeam}` : (party.homeTeam && party.awayTeam ? `${party.homeTeam} vs ${party.awayTeam}` : party.sport);
 const venue = party.venueName || party.location || '';
 const date = party.customTime || (game ? formatDateTime(game.startTime) : '');
 const url = generatePartyLink(party);
 return `${teams}\n${venue}\n${date}\n\nJoin the party on Huddle Up!\n${url}`;
 };

 const shareToSocial = (party, platform) => {
 const url = generatePartyLink(party);
 const text = generateShareText(party);
 const encodedUrl = encodeURIComponent(url);
 const encodedText = encodeURIComponent(text);
 switch (platform) {
 case 'native':
 if (navigator.share) {
 navigator.share({ title: `${party.hostName}'s Watch Party`, text: text, url: url }).catch(() => {});
 }
 break;
 case 'twitter':
 window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=HuddleUp`, '_blank');
 break;
 case 'facebook':
 window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
 break;
 case 'whatsapp':
 window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
 break;
 case 'instagram':
 window.open('https://www.instagram.com/', '_blank');
 break;
 case 'sms': {
 const smsBody = encodeURIComponent(text);
 window.open(`sms:?&body=${smsBody}`, '_self');
 break;
 }
 }
 };

 const copyPartyLink = async (party) => {
 const url = generatePartyLink(party);
 try {
 if (navigator.clipboard && navigator.clipboard.writeText) {
 await navigator.clipboard.writeText(url);
 } else {
 const textarea = document.createElement('textarea');
 textarea.value = url;
 textarea.style.position = 'fixed';
 textarea.style.opacity = '0';
 document.body.appendChild(textarea);
 textarea.select();
 document.execCommand('copy');
 document.body.removeChild(textarea);
 }
 setLinkCopied(true);
 setTimeout(() => setLinkCopied(false), 2000);
 } catch (e) {}
 };

 const openShareMenu = (party) => {
 setShareParty(party);
 setLinkCopied(false);
 setShowShareMenu(true);
 };

 const openCalendarMenu = (party) => {
 setCalendarParty(party);
 setShowCalendarMenu(true);
 };

 const getCalendarUrls = (party) => {
 const title = encodeURIComponent(party.title || `${party.hostName}'s Watch Party - ${party.homeTeam || ''} vs ${party.awayTeam || ''}`);
 const location = encodeURIComponent([party.venueName, party.venueAddress, party.city].filter(Boolean).join(', '));
 const gameTime = party.gameTime || party.customTime;
 const startDate = gameTime ? new Date(gameTime) : new Date();
 const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
 const formatGoogleDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
 const details = encodeURIComponent(`Watch Party hosted by ${party.hostName}\n${party.venueName || ''}\nJoin on Huddle Up!`);
 const start = formatGoogleDate(startDate);
 const end = formatGoogleDate(endDate);
 return {
   google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`,
   outlook: `https://outlook.live.com/calendar/0/action/compose?subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&location=${location}&body=${details}`,
   yahoo: `https://calendar.yahoo.com/?v=60&title=${title}&st=${start}&et=${end}&in_loc=${location}&desc=${details}`,
   ics: `/api/parties/${party.id}/calendar`
 };
 };

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
 console.log('Push notifications not supported in this browser - using in-app notifications instead');
 return;
 }
 const reg = await navigator.serviceWorker.ready;
 const { publicKey } = await api.push.getVapidKey();
 if (!publicKey) { console.log('Push notifications not configured on server'); return; }
 const sub = await reg.pushManager.subscribe({
 userVisibleOnly: true,
 applicationServerKey: publicKey
 });
 await api.push.subscribe(sub.toJSON());
 setPushSubscription(sub);
 setPushEnabled(true);
 } catch (err) {
 console.error('Enable push error:', err);
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
 const FALLBACK_SPORTS = new Set(['Boxing', 'FIFA World Cup', 'Formula 1', 'Tennis', 'Rugby', 'Cricket']);
 const now = new Date();
 const sportHasUpcoming = {};
 for (const g of liveGames) {
   if (FALLBACK_SPORTS.has(g.sport)) {
     const isUpcoming = g.gameStatus === 'scheduled' && new Date(g.startTime) > now;
     if (isUpcoming) sportHasUpcoming[g.sport] = true;
   }
 }
 const missingSamples = SAMPLE_GAMES.filter(g =>
   FALLBACK_SPORTS.has(g.sport) && !sportHasUpcoming[g.sport] && new Date(g.startTime) > now
 );
 const existingIds = new Set(liveGames.map(g => g.id));
 const deduped = missingSamples.filter(g => !existingIds.has(g.id));
 const allGames = [...liveGames, ...deduped];
 checkScoreChanges(allGames);
 setGames(allGames);
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
 api.raffles.adminAll().then(d => setAdminRaffles(d)).catch(() => {});
 api.affiliates.adminAll().then(d => setAdminAffiliates(d)).catch(() => {});
 }
 if (currentScreen === 'rewards' && user) {
 loadRewards();
 }
 if (currentScreen === 'fantasy' && user) {
 loadFantasyLeagues();
 }
 }, [currentScreen, user?.isAdmin, loadSponsors]);

 const isPro = user?.subscriptionTier === 'pro';



 const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
 const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

 useEffect(() => {
   if (isStandalone) { setIsAppInstalled(true); return; }
   const dismissed = localStorage.getItem('pwa_install_dismissed');
   if (dismissed) {
     const dismissedAt = parseInt(dismissed);
     if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
   }
   const handler = (e) => {
     e.preventDefault();
     setPwaInstallPrompt(e);
     setShowInstallBanner(true);
   };
   window.addEventListener('beforeinstallprompt', handler);
   const installedHandler = () => {
     setIsAppInstalled(true);
     setShowInstallBanner(false);
     setPwaInstallPrompt(null);
   };
   window.addEventListener('appinstalled', installedHandler);
   if (isIos) {
     const iosDismissed = localStorage.getItem('pwa_install_dismissed');
     if (!iosDismissed || (Date.now() - parseInt(iosDismissed)) >= 7 * 24 * 60 * 60 * 1000) {
       setTimeout(() => setShowInstallBanner(true), 3000);
     }
   }
   return () => {
     window.removeEventListener('beforeinstallprompt', handler);
     window.removeEventListener('appinstalled', installedHandler);
   };
 }, []);

 const handlePwaInstall = async () => {
   if (isIos) {
     setShowIosInstallModal(true);
     setShowInstallBanner(false);
     return;
   }
   if (pwaInstallPrompt) {
     pwaInstallPrompt.prompt();
     const { outcome } = await pwaInstallPrompt.userChoice;
     if (outcome === 'accepted') {
       setIsAppInstalled(true);
     }
     setPwaInstallPrompt(null);
     setShowInstallBanner(false);
   }
 };

 const dismissInstallBanner = () => {
   setShowInstallBanner(false);
   localStorage.setItem('pwa_install_dismissed', String(Date.now()));
 };

 const resetSponsorForm = () => {
 setSponsorName(''); setSponsorContactName(''); setSponsorContactEmail('');
 setSponsorContactPhone(''); setSponsorWebsite(''); setSponsorNotes('');
 setSponsorAmount(''); setSponsorFrequency('one-time'); setSponsorStartDate('');
 setSponsorEndDate(''); setSponsorStatus('active'); setSponsorLogo(null);
 setSponsorPlacementType('sport_banner'); setSponsorTagline('');
 setSponsorTargetSports([]); setSponsorTierField('standard'); setSponsorSlotNumber('');
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
 setSponsorPlacementType(s.placementType || 'sport_banner'); setSponsorTagline(s.tagline || '');
 setSponsorTargetSports(s.targetSports || []); setSponsorTierField(s.sponsorTier || 'standard');
 setSponsorSlotNumber(s.slotNumber ? String(s.slotNumber) : '');
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
 endDate: sponsorEndDate || null, status: sponsorStatus,
 placementType: sponsorPlacementType, tagline: sponsorTagline,
 targetSports: sponsorTargetSports, sponsorTier: sponsorTierField,
 slotNumber: sponsorSlotNumber ? parseInt(sponsorSlotNumber) : null
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
 const pauseScreens = ['profile', 'rewards', 'fans', 'friends', 'notifications', 'admin', 'qrCheckin', 'myParties', 'myCrew', 'fanFinder', 'invitations', 'venueDashboard', 'sponsorDashboard', 'teamChats', 'trending', 'myTickets', 'alerts', 'userProfile', 'dmChat', 'partyChat', 'proUpgrade', 'venueDetail', 'inviteFriends', 'notificationSettings', 'nearbyParties', 'browseParties', 'findVenues', 'findParties', 'gameDetail', ...formScreens];
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
 loadHotParties();
 loadLastChanceParties();
 detectUserLocation();
 api.sponsors.banners().then(b => setSponsorBanners(b || [])).catch(() => {});
 api.auth.userCount().then(d => setPrelaunchUserCount(170924 + (d?.count || 0))).catch(() => setPrelaunchUserCount(170924));
 fetch('/api/users/soft-launch-stats').then(r => r.json()).then(d => setSoftLaunchStats(d)).catch(() => {});
 const hotInterval = setInterval(loadHotParties, 5 * 60 * 1000);
 const lcInterval = setInterval(loadLastChanceParties, 60 * 1000);

 if (!localStorage.getItem('huddle_prelaunch_seen')) {
   setTimeout(() => {
     setShowPrelaunchModal(true);
     localStorage.setItem('huddle_prelaunch_seen', '1');
   }, 2000);
 }

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

 const influencerMatch = window.location.pathname.match(/^\/influencer\/(.+)$/);
 if (influencerMatch) {
 setInfluencerDashboardToken(influencerMatch[1]);
 setCurrentScreen('influencerDashboard');
 window.history.replaceState({}, '', '/');
 }

 const partyMatch = window.location.pathname.match(/^\/party\/(.+)$/);
 if (partyMatch) {
 const partyId = partyMatch[1];
 setDeepLinkPartyId(partyId);
 window.history.replaceState({}, '', '/');
 }

 if (window.location.pathname === '/terms') {
 setCurrentScreen('termsOfService');
 window.history.replaceState({}, '', '/');
 }
 if (window.location.pathname === '/privacy') {
 setCurrentScreen('privacyPolicy');
 window.history.replaceState({}, '', '/');
 }

 const signupCodeMatch = new URLSearchParams(window.location.search).get('code');
 if (signupCodeMatch) {
 setInitialInfluencerCode(signupCodeMatch.toUpperCase());
 setCurrentScreen('signup');
 window.history.replaceState({}, '', window.location.pathname);
 }
 return () => { clearInterval(hotInterval); clearInterval(lcInterval); };
 }, []);

 useEffect(() => {
 if (user) {
 loadFriends();
 loadDmUnread();
 }
 }, [user?.id]);

 useEffect(() => {
 if (!deepLinkPartyId || !user) return;
 const openDeepLinkParty = async () => {
   try {
     const res = await fetch(`/api/parties/${deepLinkPartyId}`);
     if (res.ok) {
       const party = await res.json();
       const game = games.find(g => g.id === party.gameId) || {
         id: party.gameId || party.id,
         sport: party.sport,
         homeTeam: party.homeTeam || party.home_team,
         awayTeam: party.awayTeam || party.away_team,
         startTime: party.gameTime || party.game_time,
         gameStatus: 'scheduled'
       };
       setSelectedGame(game);
       setCurrentScreen('gameDetail');
     }
   } catch (e) {
     console.error('Deep link party error:', e);
   }
   setDeepLinkPartyId(null);
 };
 openDeepLinkParty();
 }, [deepLinkPartyId, user]);

 useEffect(() => {
 if (isPauseScreen) return;
 const gamesInterval = setInterval(loadGames, 60000);
 return () => clearInterval(gamesInterval);
 }, [isPauseScreen]);

 useEffect(() => {
   if (!user) return;
   const dmInterval = setInterval(loadDmUnread, 15000);
   return () => clearInterval(dmInterval);
 }, [user?.id]);

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

 if (premiumForSport.length > 0) {
 const p = premiumForSport[0];
 slots[0] = {
 name: p.name,
 tagline: p.tagline || 'Official Huddle Up Sponsor',
 icon: null,
 logoUrl: p.logo ? `/api/uploads/serve/${p.logo.replace('/objects/', '')}` : null,
 ...SLOT_STYLES[0],
 url: p.url || null,
 isReal: true,
 tier: 'premium',
 slotNum: 1,
 };
 }

 const startSlot = premiumForSport.length > 0 ? 1 : 0;
 standardForSport.slice(0, totalSlots - startSlot).forEach((s, i) => {
 const idx = startSlot + i;
 slots[idx] = {
 name: s.name,
 tagline: s.tagline || 'Official Huddle Up Sponsor',
 icon: null,
 logoUrl: s.logo ? `/api/uploads/serve/${s.logo.replace('/objects/', '')}` : null,
 ...SLOT_STYLES[idx % SLOT_STYLES.length],
 url: s.url || null,
 isReal: true,
 tier: 'standard',
 slotNum: idx + 1,
 };
 });

 const demoPremium = demoForSport.filter(d => d.tier === 'premium');
 const demoStandard = demoForSport.filter(d => d.tier !== 'premium');
 const demoSorted = [...demoPremium, ...demoStandard];

 for (let i = 0; i < totalSlots; i++) {
 if (!slots[i]) {
 const demo = demoSorted.shift();
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
 slotNum: i + 1,
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
 tier: 'standard',
 slotNum: i + 1,
 };
 }
 }

 return slots;
 }, [sponsorBanners]);

 useEffect(() => {
 if (isPauseScreen) return;
 const sponsors = getSponsorsForSport(selectedSports.length === 1 ? selectedSports[0] : 'All');
 if (sponsors.length > 1) {
 setSponsorIndex(0);
 const interval = setInterval(() => {
 setSponsorIndex(prev => (prev + 1) % sponsors.length);
 }, 3000);
 return () => clearInterval(interval);
 } else {
 setSponsorIndex(0);
 }
 }, [selectedSports, isPauseScreen, getSponsorsForSport]);

 useEffect(() => {
 if (isPauseScreen) return;
 const interval = setInterval(() => {
 setAdSlideIndex(prev => (prev + 1) % 5);
 }, 3000);
 return () => clearInterval(interval);
 }, [isPauseScreen]);

 const loadUserData = async () => {
 try {
 const userData = await api.auth.me();
 if (userData) {
 setUser(userData);
 setCurrentScreen(prev => {
 const authScreens = ['welcome', 'login', 'signup', 'signupType', 'forgotPassword'];
 if (qrCheckinToken) return 'qrCheckin';
 if (authScreens.includes(prev)) {
 return userData.userType === 'venue' ? 'venueDashboard' : 'games';
 }
 return prev;
 });
 loadUserParties();
 loadVenueClaims();
 loadInvitations();
 loadNotifications();
 loadBadgeStats();
 setupPushNotifications();
 api.push.watchedGames().then(ids => setWatchedGames(ids || [])).catch(() => {});
 api.push.getPreferences().then(prefs => setNotifPrefs(prefs)).catch(() => {});
 const visits = parseInt(localStorage.getItem('hu_visit_count') || '0') + 1;
 localStorage.setItem('hu_visit_count', String(visits));
 if (visits >= 3 && typeof Notification !== 'undefined' && Notification.permission === 'default') {
   setTimeout(() => setShowPushBanner(true), 30000);
 }
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

 const loadHotParties = async () => {
 try {
 const res = await fetch('/api/parties/hot');
 if (res.ok) setHotParties(await res.json());
 } catch (e) { /* silent */ }
 };

 const loadLastChanceParties = async () => {
 try {
 const res = await fetch('/api/parties/last-chance');
 if (res.ok) setLastChanceParties(await res.json());
 } catch (e) { /* silent */ }
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

 const handleSignUp = async (email, password, name, gender, dateOfBirth, rememberMe = true, referralCode = '', userType = 'fan', venueName = '', venueAddress = '', affiliateCode = '') => {
 try {
 const userData = await api.auth.signup(email, password, name, gender, dateOfBirth, rememberMe, referralCode, userType, venueName, venueAddress, affiliateCode);
 try {
   const founderRes = await fetch('/api/users/claim-founder', { method: 'POST', credentials: 'include' });
   const founderData = await founderRes.json();
   if (founderData.success) { userData.isFounder = true; userData.founderNumber = founderData.founderNumber || null; userData.subscriptionTier = 'pro'; }
 } catch {}
 setUser(userData);
 setShowWelcomePopup(true);
 setShowOnboarding(false);
 setOnboardingStep(0);
 setShowSignupShare(true);
 if (userType === 'venue') {
 setCurrentScreen('venueDashboard');
 } else {
 setCurrentScreen('profile');
 }
 loadParties();
 loadVenues();
 loadVenueClaims();
 loadInvitations();
 loadNotifications();
 loadBadgeStats();
 loadFriends();
 launchIntroSplash();
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
 if (userData.userType === 'venue') {
 setCurrentScreen('venueDashboard');
 } else {
 setCurrentScreen('games');
 }
 launchIntroSplash();
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

 const playNotificationSound = useCallback(() => {
 try {
 const ctx = new (window.AudioContext || window.webkitAudioContext)();
 const playTone = (freq, startTime, dur) => {
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.frequency.value = freq;
 osc.type = 'sine';
 gain.gain.setValueAtTime(0.3, startTime);
 gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
 osc.start(startTime);
 osc.stop(startTime + dur);
 };
 const now = ctx.currentTime;
 playTone(880, now, 0.15);
 playTone(1320, now + 0.12, 0.15);
 playTone(1760, now + 0.24, 0.2);
 } catch (e) {}
 }, []);

 const loadNotifications = async () => {
 try {
 const data = await api.notifications.list();
 const unreadCount = data.filter(n => !n.isRead).length;
 if (unreadCount > notificationCountRef.current && notificationCountRef.current >= 0) {
 playNotificationSound();
 }
 notificationCountRef.current = unreadCount;
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

 const openDmChat = async (friend) => {
   setDmChatUser(friend);
   setDmMessages([]);
   setDmNewMsg('');
   setCurrentScreen('dmChat');
   window.scrollTo(0, 0);
   try {
     const msgs = await api.dm.messages(friend.id);
     setDmMessages(msgs);
     const unread = await api.dm.unreadCount();
     setDmUnreadCount(unread.count);
     setTimeout(() => dmEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
   } catch (e) {
     console.error('Load DM error:', e);
   }
 };

 const sendDm = async () => {
   if (!dmNewMsg.trim() || dmSending || !dmChatUser) return;
   setDmSending(true);
   try {
     const msg = await api.dm.send(dmChatUser.id, dmNewMsg.trim());
     setDmMessages(prev => [...prev, msg]);
     setDmNewMsg('');
     setTimeout(() => dmEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
   } catch (e) {
     alert(e.message || 'Failed to send message');
   }
   setDmSending(false);
 };

 const loadDmUnread = async () => {
   if (!user) return;
   try {
     const { count } = await api.dm.unreadCount();
     if (count > dmPrevUnreadRef.current && dmPrevUnreadRef.current >= 0 && currentScreen !== 'dmChat') {
       playNotificationSound();
       const latest = await api.dm.latestUnread();
       if (latest) {
         setDmPopup({ senderName: latest.senderName, senderPicture: latest.senderPicture, message: latest.message, senderId: latest.senderId });
         setTimeout(() => setDmPopup(null), 4000);
       }
     }
     if (count !== dmPrevUnreadRef.current) {
       setDmUnreadCount(count);
     }
     dmPrevUnreadRef.current = count;
   } catch (e) {}
 };

 const loadRewards = async () => {
 if (!user) return;
 try {
 const [balance, history, catalog, redemptions, raffleData] = await Promise.all([
 api.rewards.balance(),
 api.rewards.history(),
 api.rewards.catalog(),
 api.rewards.redemptions(),
 api.raffles.list().catch(() => []),
 ]);
 setRewardsBalance(balance);
 setRewardsHistory(history);
 setRewardsCatalog(catalog);
 setRewardsRedemptions(redemptions);
 setRaffles(raffleData);
 } catch (e) {
 console.log('Rewards load error:', e);
 }
 };

 const loadPredictions = async () => {
 if (!user) return;
 try {
 const [preds, stats] = await Promise.all([
   api.predictions.mine(),
   api.predictions.stats(),
 ]);
 setMyPredictions(preds);
 setPredictionStats(stats);
 } catch (e) { console.log('Predictions load error:', e); }
 };

 const loadPredictionLeaderboard = async (period) => {
 try {
 const data = await api.predictions.leaderboard(period || predictionLeaderPeriod);
 setPredictionLeaderboard(data);
 } catch (e) { console.log('Leaderboard error:', e); }
 };

 const submitPrediction = async (game, pickedTeam, confidence) => {
 if (!user) { alert('Please log in to make predictions'); return; }
 try {
 setPredictionLoading(true);
 await api.predictions.submit({
   gameId: game.id,
   sport: game.sport,
   homeTeam: game.homeTeam,
   awayTeam: game.awayTeam,
   pickedTeam,
   confidence,
   gameTime: game.startTime,
 });
 setGamePredictionCache(prev => ({ ...prev, [game.id]: { picked_team: pickedTeam, confidence, status: 'pending' } }));
 await loadPredictions();
 setExpandedPrediction(null);
 } catch (e) { alert(e.message); }
 finally { setPredictionLoading(false); }
 };

 const openQrScanner = (partyId) => {
 setQrScanPartyId(partyId);
 setQrScanStatus(null);
 setQrScannerOpen(true);
 };

 const closeQrScanner = () => {
 if (qrScannerRef.current) {
 try { qrScannerRef.current.stop(); } catch(e) {}
 qrScannerRef.current = null;
 }
 setQrScannerOpen(false);
 setQrScanPartyId(null);
 setQrScanStatus(null);
 };

 const handleQrScanResult = async (decodedText) => {
 if (qrScannerRef.current) {
 try { qrScannerRef.current.pause(true); } catch(e) {}
 }
 setQrScanStatus({ type: 'loading', message: 'Verifying...' });
 try {
 const urlParts = decodedText.split('/checkin/');
 if (urlParts.length < 2) {
 setQrScanStatus({ type: 'error', message: 'Invalid QR code. Please scan the venue check-in QR code.' });
 setTimeout(() => { try { qrScannerRef.current?.resume(); } catch(e) {} }, 2000);
 return;
 }
 const token = urlParts[1];
 const result = await api.qr.scan(token, qrScanPartyId);
 if (result.ok) {
 setCheckedInParties(prev => ({ ...prev, [qrScanPartyId]: true }));
 setQrScanStatus({ type: 'success', message: result.alreadyCheckedIn ? 'Already checked in! Attendance verified.' : `Checked in! +${result.pointsEarned || 75} points earned!` });
 if (!result.alreadyCheckedIn) {
   const end = Date.now() + 2000;
   const fireworkInterval = setInterval(() => {
     if (Date.now() > end) { clearInterval(fireworkInterval); return; }
     confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#1E90FF', '#FFD700', '#FF4757', '#10B981'] });
     confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#1E90FF', '#FFD700', '#FF4757', '#10B981'] });
   }, 200);
 }
 loadRewards();
 setTimeout(() => closeQrScanner(), 2000);
 }
 } catch (e) {
 setQrScanStatus({ type: 'error', message: e.message || 'Check-in failed. Try again.' });
 if (e.message?.includes('already')) {
 setCheckedInParties(prev => ({ ...prev, [qrScanPartyId]: true }));
 setTimeout(() => closeQrScanner(), 2000);
 } else {
 setTimeout(() => {
 setQrScanStatus(null);
 try { qrScannerRef.current?.resume(); } catch(e) {}
 }, 2500);
 }
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

 const handleEnterRaffle = async (raffleId) => {
 const entries = raffleEntryCount[raffleId] || 1;
 setEnteringRaffle(raffleId);
 try {
 const result = await api.raffles.enter(raffleId, entries);
 alert(`Entered! You now have ${result.totalEntries} entries. ${result.pointsSpent} points spent.`);
 setRaffleEntryCount(prev => ({ ...prev, [raffleId]: 1 }));
 loadRewards();
 } catch (e) {
 alert(e.message || 'Entry failed');
 } finally {
 setEnteringRaffle(null);
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

 const searchUsers = async (query) => {
 if (!query || query.trim().length < 2) { setCrewSearchResults([]); return; }
 setCrewSearchLoading(true);
 try {
 const results = await api.users.search(query);
 setCrewSearchResults(results);
 } catch (e) {
 console.error('User search error:', e);
 }
 setCrewSearchLoading(false);
 };

 const loadFriendActivity = async () => {
 setFriendActivityLoading(true);
 try {
 const data = await api.friends.activity();
 setFriendActivity(data);
 } catch (e) {
 console.error('Friend activity error:', e);
 }
 setFriendActivityLoading(false);
 };

 const shareReferralLink = async () => {
 try {
 const { referralCode } = await api.referrals.myCode();
 const url = `${window.location.origin}?ref=${referralCode}`;
 const shareData = { title: 'Join me on Huddle Up!', text: `Join me on Huddle Up! Use my referral code ${referralCode} for bonus points.`, url };
 if (navigator.share) {
 await navigator.share(shareData);
 } else {
 await navigator.clipboard.writeText(`${shareData.text} ${url}`);
 setShowShareToast(true);
 setTimeout(() => setShowShareToast(false), 2000);
 }
 } catch (e) {
 console.error('Share referral error:', e);
 }
 };

 const copyReferralLink = async () => {
 try {
 const { referralCode } = await api.referrals.myCode();
 const url = `${window.location.origin}?ref=${referralCode}`;
 await navigator.clipboard.writeText(url);
 setShowShareToast(true);
 setTimeout(() => setShowShareToast(false), 2000);
 } catch (e) {
 alert('Failed to copy link');
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

 const searchNearbyFans = async (cityOverride) => {
 const searchCity = cityOverride || nearbyCity || currentCity;
 if (!searchCity || searchCity.trim().length < 2) return;
 setNearbyLoading(true);
 setNearbyCity(searchCity);
 try {
 const data = await api.fans.nearby(searchCity.trim());
 setNearbyFans(data.fans || []);
 setNearbyParties(data.parties || []);
 } catch (error) {
 console.error('Nearby fans error:', error);
 setNearbyFans([]);
 setNearbyParties([]);
 } finally {
 setNearbyLoading(false);
 }
 };

 const searchFansByName = async () => {
 if (!fanNameQuery || fanNameQuery.trim().length < 2) return;
 setFanNameSearchLoading(true);
 try {
 const data = await api.fans.search(fanNameQuery.trim());
 setFanNameResults(data);
 } catch (error) {
 console.error('Fan name search error:', error);
 setFanNameResults([]);
 } finally {
 setFanNameSearchLoading(false);
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
 const newParty = await api.parties.create(partyData);
 await loadParties();
 await loadUserParties();
 loadNotifications();
 loadBadgeStats();
 setCurrentScreen('gameDetail');
 if (newParty && newParty.id) {
 const shareData = { ...newParty, ...partyData, hostName: user.name };
 setTimeout(() => openShareMenu(shareData), 500);
 }
 } catch (error) {
 alert(error.message);
 }
 };

 const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

 const fireJoinConfetti = () => {
 if (prefersReducedMotion) return;
 const colors = ['#1E90FF', '#FFD700', '#10B981', '#ff6b6b'];
 const end = Date.now() + 1800;
 const interval = setInterval(() => {
 if (Date.now() > end) { clearInterval(interval); return; }
 confetti({ particleCount: 40, startVelocity: 45, spread: 80, origin: { x: 0, y: 0.6 }, colors, ticks: 200, gravity: 1.2, scalar: 1.2 });
 confetti({ particleCount: 40, startVelocity: 45, spread: 80, origin: { x: 1, y: 0.6 }, colors, ticks: 200, gravity: 1.2, scalar: 1.2 });
 confetti({ particleCount: 60, startVelocity: 55, spread: 100, origin: { x: 0.5, y: 1 }, colors, ticks: 300, gravity: 0.8, scalar: 1.4, shapes: ['circle', 'square'] });
 }, 250);
 };

 const fireScoreCelebration = (teamName, points, sport) => {
   const rm = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   setScoreCelebration({ team: teamName, points, sport });
   setTimeout(() => setScoreCelebration(null), 4000);
   if (rm) return;
   const tc = TEAM_COLORS[teamName] || ['#1E90FF', '#FFD700'];
   const isThreePointer = sport === 'NBA' && points === 3;
   const isTouchdown = sport === 'NFL' && points >= 6;
   const dur = (isThreePointer || isTouchdown) ? 3000 : 2000;
   const end = Date.now() + dur;
   const interval = setInterval(() => {
     if (Date.now() > end) { clearInterval(interval); return; }
     if (isThreePointer || isTouchdown) {
       confetti({ particleCount: 80, startVelocity: 55, spread: 120, origin: { x: 0.5, y: 0.3 }, colors: tc, scalar: 2, shapes: ['circle'] });
       confetti({ particleCount: 40, startVelocity: 50, spread: 80, origin: { x: 0, y: 0.5 }, colors: tc, scalar: 1.5 });
       confetti({ particleCount: 40, startVelocity: 50, spread: 80, origin: { x: 1, y: 0.5 }, colors: tc, scalar: 1.5 });
     } else {
       confetti({ particleCount: 50, startVelocity: 45, spread: 80, origin: { x: Math.random(), y: 0.6 }, colors: tc, scalar: 1.5 });
     }
   }, 250);
   if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
 };

 const checkScoreChanges = (newGames) => {
   if (!user?.favoriteTeams || !scoreCelebrationsEnabled) return;
   const myTeamNames = Object.values(user.favoriteTeams).map(t => t.toLowerCase());
   if (!myTeamNames.length) return;
   const liveIds = new Set();
   for (const game of newGames) {
     if (game.gameStatus !== 'live') continue;
     liveIds.add(game.id);
     const prev = prevScoresRef.current[game.id];
     if (!prev) { prevScoresRef.current[game.id] = { h: game.homeScore || 0, a: game.awayScore || 0 }; continue; }
     const newH = game.homeScore || 0;
     const newA = game.awayScore || 0;
     const homeMatch = myTeamNames.includes(game.homeTeam?.toLowerCase());
     const awayMatch = myTeamNames.includes(game.awayTeam?.toLowerCase());
     if (newH > prev.h && homeMatch) {
       fireScoreCelebration(game.homeTeam, newH - prev.h, game.sport);
     }
     if (newA > prev.a && awayMatch) {
       fireScoreCelebration(game.awayTeam, newA - prev.a, game.sport);
     }
     prevScoresRef.current[game.id] = { h: newH, a: newA };
   }
   for (const id of Object.keys(prevScoresRef.current)) {
     if (!liveIds.has(id)) delete prevScoresRef.current[id];
   }
 };

 const [joiningPartyId, setJoiningPartyId] = useState(null);
 const [justJoinedPartyId, setJustJoinedPartyId] = useState(null);

 const handleJoinParty = async (partyId) => {
 try {
 setJoiningPartyId(partyId);
 await api.parties.join(partyId);
 fireJoinConfetti();
 if (!prefersReducedMotion && navigator.vibrate) navigator.vibrate([50, 100, 50]);
 setJoiningPartyId(null);
 setJustJoinedPartyId(partyId);
 setTimeout(() => setJustJoinedPartyId(null), 2500);
 await loadParties();
 await loadUserParties();
 loadBadgeStats();
 } catch (error) {
 setJoiningPartyId(null);
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

 const openPartyChat = async (partyId, partyName) => {
 setChatPrevScreen(currentScreen);
 setOpenChatPartyId(partyId);
 setChatPartyName(partyName || 'Party Chat');
 setChatInput('');
 setChatMessages([]);
 setChatTrashTalk(false);
 setCurrentScreen('partyChat');
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
 const inputVal = chatInputRef.current ? chatInputRef.current.value.trim() : chatInput.trim();
 if (!inputVal || chatSending) return;
 setChatSending(true);
 try {
 const msg = await api.chat.sendMessage(partyId, inputVal, chatTrashTalk ? 'fantasy' : 'text');
 setChatMessages(prev => [...prev, msg]);
 if (chatInputRef.current) chatInputRef.current.value = '';
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
 const matchesSport = selectedSports.length === 0 || selectedSports.includes(game.sport);
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

 let matchesDate = true;
 if (dateFilter !== 'All') {
   const now = new Date();
   const gameDate = new Date(game.startTime);
   const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
   const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);
   const tomorrowEnd = new Date(todayStart); tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
   const dayOfWeek = now.getDay();
   const satStart = new Date(todayStart); satStart.setDate(satStart.getDate() + (6 - dayOfWeek));
   const sunEnd = new Date(satStart); sunEnd.setDate(sunEnd.getDate() + 2);
   const weekEnd = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + (7 - dayOfWeek));
   const nextWeekEnd = new Date(weekEnd); nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
   if (dateFilter === 'Today') matchesDate = gameDate >= todayStart && gameDate < todayEnd;
   else if (dateFilter === 'Tomorrow') matchesDate = gameDate >= todayEnd && gameDate < tomorrowEnd;
   else if (dateFilter === 'This Weekend') matchesDate = gameDate >= satStart && gameDate < sunEnd;
   else if (dateFilter === 'This Week') matchesDate = gameDate >= todayStart && gameDate < weekEnd;
   else if (dateFilter === 'Next Week') matchesDate = gameDate >= weekEnd && gameDate < nextWeekEnd;
 }
 
 return matchesSport && matchesSearch && matchesMyTeams && matchesDate;
 }).sort((a, b) => {
   const aLive = a.gameStatus === 'live' ? 0 : 1;
   const bLive = b.gameStatus === 'live' ? 0 : 1;
   if (aLive !== bLive) return aLive - bLive;
   if (sortOption === 'Soonest') {
     return new Date(a.startTime) - new Date(b.startTime);
   }
   if (sortOption === 'Most Popular') {
     const aParties = parties.filter(p => p.gameId === a.id);
     const bParties = parties.filter(p => p.gameId === b.id);
     const aAttendees = aParties.reduce((sum, p) => sum + (p.attendees?.length || 0), 0);
     const bAttendees = bParties.reduce((sum, p) => sum + (p.attendees?.length || 0), 0);
     return bAttendees - aAttendees || bParties.length - aParties.length;
   }
   if (sortOption === 'Newest') {
     return new Date(b.startTime) - new Date(a.startTime);
   }
   const aParties = parties.filter(p => p.gameId === a.id);
   const bParties = parties.filter(p => p.gameId === b.id);
   const aAttendees = aParties.reduce((sum, p) => sum + (p.attendees?.length || 0), 0);
   const bAttendees = bParties.reduce((sum, p) => sum + (p.attendees?.length || 0), 0);
   const aHasParties = aParties.length > 0 ? 1 : 0;
   const bHasParties = bParties.length > 0 ? 1 : 0;
   if (aHasParties !== bHasParties) return bHasParties - aHasParties;
   if (aHasParties && bHasParties) return bAttendees - aAttendees;
   return 0;
 });
 const hasActiveFilters = dateFilter !== 'All' || sortOption !== 'Soonest' || selectedSports.length > 0 || searchTerm.trim() !== '';

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
 className={`hover:text-[#1E90FF]/80 hover:underline transition-colors inline-block select-all cursor-pointer ${className}`}
 onClick={(e) => e.stopPropagation()}
 style={{ WebkitUserSelect: 'all', userSelect: 'all', wordBreak: 'keep-all' }}
 >
 {address}
 </a>
 );

 const getMapsEmbedUrl = (address) => `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

 const VenueDealsPreview = ({ venueId, homeTeam, awayTeam }) => {
 const [deals, setDeals] = useState([]);
 const [promos, setPromos] = useState([]);
 const [loaded, setLoaded] = useState(false);

 useEffect(() => {
 if (!venueId) return;
 Promise.all([
 api.venueHub.getVenueDeals(venueId).catch(() => []),
 api.venueHub.getVenuePromotions(venueId).catch(() => [])
 ]).then(([d, p]) => {
 const filteredPromos = (homeTeam || awayTeam) ? p.filter(pr => {
   const matchHome = homeTeam && pr.home_team && pr.home_team.toLowerCase().includes(homeTeam.toLowerCase());
   const matchAway = awayTeam && pr.away_team && pr.away_team.toLowerCase().includes(awayTeam.toLowerCase());
   return matchHome || matchAway;
 }) : p;
 setDeals(d); setPromos(filteredPromos); setLoaded(true);
 });
 }, [venueId, homeTeam, awayTeam]);

 if (!loaded || (deals.length === 0 && promos.length === 0)) return null;

 return (
 <div className="mt-3 space-y-2">
 {promos.length > 0 && (
 <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
 <p className="text-green-300 text-xs font-bold mb-1.5 flex items-center gap-1">📢 Game Day Specials</p>
 {promos.slice(0, 2).map(p => (
 <div key={p.id} className="text-xs text-white mb-1">
 <span className="font-semibold">{p.title}</span>
 {p.specials && <span className="text-amber-300 ml-1">- {p.specials}</span>}
 </div>
 ))}
 </div>
 )}
 {deals.length > 0 && (
 <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
 <p className="text-amber-300 text-xs font-bold mb-1.5 flex items-center gap-1">🏷️ Venue Specials</p>
 {deals.slice(0, 2).map(d => (
 <div key={d.id} className="text-xs text-white mb-1">
 <span className="font-semibold">{d.title}</span>
 <span className="text-[#A0A4AB] ml-1">- {d.description}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 };

 const VenueMap = ({ address, venueName }) => {
 const [expanded, setExpanded] = useState(false);
 if (!address) return null;
 return (
 <div className="mt-3">
 <button
 onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
 className="flex items-center gap-2 text-sm text-[#1E90FF] hover:text-[#1E90FF]/80 transition-colors font-semibold"
 >
 <MapPin className="w-4 h-4" />
 {expanded ? 'Hide Map' : 'Show Map & Directions'}
 <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
 </button>
 {expanded && (
 <div className="mt-2 rounded-xl overflow-hidden border border-[#222A36] shadow-sm">
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
 className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-[#1E90FF] text-white text-sm font-bold transition-colors"
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
 { title: "Find Parties by Sport or Team", description: "Browse games by sport, search for your favorite teams, and discover watch parties happening near you!", icon: "🏈" },
 { title: "Join Parties & Chat with Fans", description: "Join a watch party, chat with other fans in real-time, and connect with your crew on game day!", icon: "🏟️" },
 { title: "Check In with QR Code", description: "Scan the QR code at the venue to check in, earn points, and unlock badges. The more you show up, the higher you climb!", icon: "📱" },
 { title: "Make Predictions & Win Raffles", description: "Predict game winners, build win streaks, and earn points you can use for raffle entries and prizes!", icon: "🏆" }
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
 <div className="bg-[#151A22] rounded-3xl p-8 max-w-md w-full border-2 border-[#1E90FF]/30 shadow-2xl">
 <div className="flex justify-center gap-2 mb-6">
 {steps.map((_, index) => (
 <div key={index} className={`h-2 rounded-full transition-all ${index === onboardingStep ? 'w-8 bg-[#1E90FF]' : index < onboardingStep ? 'w-2 bg-[#1E90FF]/70' : 'w-2 bg-gray-600'}`} />
 ))}
 </div>
 <div className="text-6xl text-center mb-4">{currentStep.icon}</div>
 <h2 className="text-2xl font-black text-white text-center mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{currentStep.title}</h2>
 <p className="text-[#A0A4AB] text-center mb-8 leading-relaxed">{currentStep.description}</p>
 <div className="flex gap-3">
 {!isLastStep && (
 <button onClick={handleSkip} className="flex-1 py-3 bg-[#151A22] text-white rounded-xl font-bold hover:bg-[#222A36] transition-all">
 Skip
 </button>
 )}
 <button onClick={handleNext} className={`${isLastStep ? 'w-full' : 'flex-1'} py-3 bg-[#1E90FF] text-white rounded-xl font-bold hover:opacity-90 transition-all`}>
 {isLastStep ? "Let's Go!" : 'Next'}
 </button>
 </div>
 <div className="text-center mt-4 text-sm text-[#A0A4AB]/70">Step {onboardingStep + 1} of {steps.length}</div>
 </div>
 </div>
 );
 };

 const TourGuidePopup = () => {
 if (!showTourGuide) return null;
 const fanSteps = [
 { icon: '🏈', title: 'Browse Games', desc: 'Scroll through upcoming games across 15+ sports. Tap any game to see details or create a watch party.' },
 { icon: '📍', title: 'Search by City', desc: 'Use the location search bar to find parties in any city. Traveling? Just type the city name!' },
 { icon: '🎉', title: 'Join or Create Parties', desc: 'Tap a game, then join an existing party or create your own. Pick a venue, set a time, invite friends!' },
 { icon: '⭐', title: 'Set Favorite Teams', desc: 'Go to your Profile and add your favorite teams. Use "Show My Teams Only" to filter games you care about.' },
 { icon: '👥', title: 'Find Fans & Build Your Crew', desc: 'Use Fan Finder to search by team, name, or phone number. Add friends to build your crew!' },
 { icon: '💬', title: 'Team Chat Rooms', desc: 'Join chat rooms for your favorite teams. Talk trash, share highlights, and connect with fans.' },
 { icon: '🏆', title: 'Earn Points & Rewards', desc: 'Get points for hosting, attending, inviting friends, and checking in. Enter raffles for prizes!' },
 { icon: '📱', title: 'Install the App', desc: 'Add Huddle Up to your home screen for the best experience. Tap Share > Add to Home Screen.' },
 { icon: '🔔', title: 'Stay in the Loop', desc: 'Turn on notifications in your Profile to get alerts about games, parties, and score updates.' },
 { icon: '📸', title: 'Share the Fun', desc: 'Share parties with friends using the share button. Post party highlights and recaps after the game!' },
 ];
 const venueSteps = [
 { icon: '🏪', title: 'Claim Your Venue', desc: 'Go to any game detail and create a party at your venue. Then go to Profile > Claim a Venue to register it.' },
 { icon: '📊', title: 'Venue Dashboard', desc: 'Once approved, access your Venue Dashboard to see analytics, visitor stats, and party history.' },
 { icon: '📱', title: 'QR Code Check-In', desc: 'Generate a unique QR code for your venue. Customers scan it to check in and earn rewards.' },
 { icon: '🎯', title: 'Host Game Day Events', desc: 'Create watch parties at your venue for big games. Fans will find you through the app!' },
 { icon: '💰', title: 'Promote Your Venue', desc: 'Promoted parties appear at the top of search results. Set up ticketing for special events.' },
 { icon: '📢', title: 'Become a Sponsor', desc: 'Get premium visibility with sponsored banners. Your brand seen by thousands of sports fans!' },
 { icon: '🏅', title: 'Build Your Reputation', desc: 'Earn venue badges based on parties hosted and check-ins. Higher badges = more visibility!' },
 { icon: '📈', title: 'Track Performance', desc: 'See real-time stats: total check-ins, unique visitors, popular game days, and more.' },
 ];
 const steps = tourTab === 'fans' ? fanSteps : venueSteps;
 return (
 <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-y-auto" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowTourGuide(false); }}>
 <div className="bg-[#151A22] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-[#1E90FF]/30 shadow-2xl my-4 overscroll-contain" onMouseDown={e => e.stopPropagation()}>
 <div className="sticky top-0 bg-[#151A22] p-5 border-b border-[#222A36] z-10">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Map className="inline w-6 h-6 mr-2 text-[#1E90FF]" />
 LEARN HOW TO USE THE APP
 </h2>
 <button onClick={() => setShowTourGuide(false)} className="p-1 text-[#A0A4AB] hover:text-white"><X className="w-5 h-5" /></button>
 </div>
 <div className="flex gap-2">
 <button onClick={() => setTourTab('fans')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tourTab === 'fans' ? 'bg-[#1E90FF] text-white' : 'bg-[#0F1115] text-[#A0A4AB] border border-[#222A36]'}`}>
 For Fans
 </button>
 <button onClick={() => setTourTab('venues')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tourTab === 'venues' ? 'bg-green-500 text-white' : 'bg-[#0F1115] text-[#A0A4AB] border border-[#222A36]'}`}>
 For Venues
 </button>
 </div>
 </div>
 <div className="p-5 space-y-3">
 {steps.map((step, i) => (
 <div key={i} className="flex gap-4 items-start p-4 bg-[#0F1115] rounded-xl border border-[#222A36] hover:border-[#1E90FF]/30 transition-all">
 <div className="text-3xl flex-shrink-0 mt-0.5">{step.icon}</div>
 <div>
 <h3 className="text-white font-bold text-sm mb-1">{step.title}</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">{step.desc}</p>
 </div>
 </div>
 ))}
 </div>
 <div className="sticky bottom-0 bg-[#151A22] p-4 border-t border-[#222A36]">
 <button onClick={() => setShowTourGuide(false)} className="w-full py-3 bg-[#1E90FF] text-white font-bold rounded-xl hover:opacity-90 transition-all text-lg">
 Got It!
 </button>
 </div>
 </div>
 </div>
 );
 };

 const SPOTLIGHT_TOUR_STEPS = [
 {
   targetId: 'nav-buttons',
   title: 'Your Toolbox',
   description: 'All your features are right here! Scroll left and right to see everything Huddle Up offers.',
   icon: '🧰',
   position: 'below',
 },
 {
   targetId: 'location-search',
   title: 'Find Your City',
   description: 'Type any city to find watch parties near you. Or tap the pin icon to auto-detect your location!',
   icon: '📍',
   position: 'below',
 },
 {
   targetId: 'sports-scroller',
   title: 'Pick Your Sport',
   description: 'Scroll through 15+ sports to filter games. Tap a sport to see only those matchups.',
   icon: '🏈',
   position: 'below',
 },
 {
   targetId: 'game-cards',
   title: 'Tap a Game',
   description: 'Each card shows a live or upcoming game. Tap it to see details, join a watch party, or create your own!',
   icon: '🎮',
   position: 'above',
 },
 {
   targetId: 'my-crew',
   title: 'My Crew',
   description: 'Find friends, send messages, and build your sports crew. The red badge shows unread messages & friend requests.',
   icon: '👥',
   position: 'below',
 },
 {
   targetId: 'rewards',
   title: 'Earn Rewards',
   description: 'Get points for hosting parties, attending events, and inviting friends. Enter raffles to win prizes!',
   icon: '🏆',
   position: 'below',
 },
 {
   targetId: 'trending',
   title: 'Featured',
   description: 'See the hottest parties and most popular venues. This icon lights up when there\'s action happening!',
   icon: '🔥',
   position: 'below',
 },
 {
   targetId: 'alerts',
   title: 'Alerts & Invitations',
   description: 'Party invites, score updates, and friend activity all show up here. Never miss a game day!',
   icon: '🔔',
   position: 'below',
 },
 {
   targetId: 'profile',
   title: 'Your Profile',
   description: 'Set your favorite teams, upload a photo, manage notifications, and personalize your experience.',
   icon: '⚙️',
   position: 'below',
 },
 ];

 const [spotlightRect, setSpotlightRect] = useState(null);

 const startSpotlightTour = () => {
   setSpotlightStep(0);
   setSpotlightTourActive(true);
   setSpotlightRect(null);
   localStorage.setItem('huddle_tour_seen', 'true');
 };

 useEffect(() => {
   if (!spotlightTourActive) { setSpotlightRect(null); return; }
   const step = SPOTLIGHT_TOUR_STEPS[spotlightStep];
   if (!step) return;

   const updateRect = () => {
     const target = document.querySelector(`[data-tour-id="${step.targetId}"]`);
     if (target) {
       const r = target.getBoundingClientRect();
       setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
     } else {
       setSpotlightRect(null);
     }
   };

   const target = document.querySelector(`[data-tour-id="${step.targetId}"]`);
   if (target) {
     const r = target.getBoundingClientRect();
     const viewH = window.innerHeight;
     const isVisible = r.top >= 0 && r.bottom <= viewH;
     if (!isVisible) {
       const scrollY = window.scrollY + r.top - (viewH / 3);
       window.scrollTo({ top: Math.max(0, scrollY), behavior: 'smooth' });
     }
     setTimeout(updateRect, 100);
     setTimeout(updateRect, 350);
     setTimeout(updateRect, 600);
   } else {
     window.scrollTo({ top: 0, behavior: 'smooth' });
     setTimeout(updateRect, 400);
   }

   window.addEventListener('resize', updateRect);
   window.addEventListener('scroll', updateRect, true);
   const scrollInterval = setInterval(updateRect, 500);
   return () => {
     window.removeEventListener('resize', updateRect);
     window.removeEventListener('scroll', updateRect, true);
     clearInterval(scrollInterval);
   };
 }, [spotlightTourActive, spotlightStep]);

 const spotlightTourJSX = () => {
   if (!spotlightTourActive) return null;
   const step = SPOTLIGHT_TOUR_STEPS[spotlightStep];
   if (!step) return null;
   const rect = spotlightRect;
   const isLast = spotlightStep === SPOTLIGHT_TOUR_STEPS.length - 1;
   const padding = 8;

   const handleNext = () => {
     if (spotlightStep < SPOTLIGHT_TOUR_STEPS.length - 1) {
       setSpotlightStep(spotlightStep + 1);
     } else {
       setSpotlightTourActive(false);
     }
   };
   const handlePrev = () => { if (spotlightStep > 0) setSpotlightStep(spotlightStep - 1); };
   const handleSkip = () => { setSpotlightTourActive(false); };

   const tooltipWidth = Math.min(300, window.innerWidth - 32);
   const tooltipHeight = 220;
   const minTop = 60;
   const maxTop = window.innerHeight - tooltipHeight - 20;
   let tooltipStyle = { pointerEvents: 'auto', width: tooltipWidth };
   if (rect) {
     tooltipStyle.left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
     if (step.position === 'below') {
       const topPos = rect.top + rect.height + padding + 12;
       tooltipStyle.top = Math.max(minTop, Math.min(topPos, maxTop));
     } else {
       const topPos = rect.top - padding - tooltipHeight;
       tooltipStyle.top = Math.max(minTop, Math.min(topPos, maxTop));
     }
   } else {
     tooltipStyle.left = (window.innerWidth - tooltipWidth) / 2;
     tooltipStyle.top = Math.max(minTop, Math.min(window.innerHeight / 2 - 120, maxTop));
   }

   return (
     <div className="fixed inset-0 z-[100]" style={{ pointerEvents: 'auto' }}>
       <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
         <defs>
           <mask id="spotlight-mask">
             <rect x="0" y="0" width="100%" height="100%" fill="white" />
             {rect && (
               <rect
                 x={rect.left - padding}
                 y={rect.top - padding}
                 width={rect.width + padding * 2}
                 height={rect.height + padding * 2}
                 rx="16"
                 fill="black"
               />
             )}
           </mask>
         </defs>
         <rect
           x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.82)"
           mask="url(#spotlight-mask)"
         />
         {rect && (
           <rect
             x={rect.left - padding}
             y={rect.top - padding}
             width={rect.width + padding * 2}
             height={rect.height + padding * 2}
             rx="16"
             fill="none"
             stroke="#1E90FF"
             strokeWidth="2.5"
             className="animate-pulse"
           />
         )}
       </svg>

       <div className="absolute inset-0" onClick={handleSkip} style={{ pointerEvents: 'auto' }} />

       <div
         className="absolute z-[101] animate-fadeIn"
         style={tooltipStyle}
         onClick={(e) => e.stopPropagation()}
       >
         <div className="bg-[#1a1f2e] border-2 border-[#1E90FF]/50 rounded-2xl p-5 shadow-2xl shadow-blue-500/20">
           <div className="flex items-center gap-2 mb-1">
             <span className="text-2xl">{step.icon}</span>
             <span className="text-xs font-bold text-[#1E90FF] uppercase tracking-wider">Step {spotlightStep + 1} of {SPOTLIGHT_TOUR_STEPS.length}</span>
           </div>
           <h3 className="text-white text-lg font-black mb-1.5" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.5px' }}>{step.title}</h3>
           <p className="text-[#A0A4AB] text-sm leading-relaxed mb-4">{step.description}</p>

           <div className="flex items-center gap-2 mb-3">
             {SPOTLIGHT_TOUR_STEPS.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === spotlightStep ? 'w-6 bg-[#1E90FF]' : i < spotlightStep ? 'w-3 bg-[#1E90FF]/60' : 'w-2 bg-gray-600'}`} />
             ))}
           </div>

           <div className="flex gap-2">
             {spotlightStep > 0 && (
               <button onClick={handlePrev} className="px-4 py-2 bg-[#222A36] text-white rounded-xl text-sm font-bold hover:bg-[#2a3344] transition-colors">
                 Back
               </button>
             )}
             <button onClick={handleSkip} className="px-4 py-2 text-[#A0A4AB] hover:text-white text-sm font-bold transition-colors">
               Skip
             </button>
             <button onClick={handleNext} className="flex-1 px-4 py-2.5 bg-[#1E90FF] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">
               {isLast ? "Let's Go!" : 'Next →'}
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 };

 const InviteReminderPopup = () => {
 if (!showInviteReminder) return null;
 const shareApp = async () => {
 const shareData = { title: 'Huddle Up - Find Watch Parties', text: 'Join me on Huddle Up! Find watch parties for every sport near you.', url: 'https://huddleupusa.com' };
 try {
 if (navigator.share) {
 await navigator.share(shareData);
 } else {
 await navigator.clipboard.writeText('Join me on Huddle Up! Find watch parties for every sport near you. https://huddleupusa.com');
 alert('Link copied to clipboard!');
 }
 } catch (err) {}
 };
 const isVenue = user?.subscriptionTier === 'venue';
 return (
 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) { setShowInviteReminder(false); localStorage.setItem('lastInviteReminder', Date.now().toString()); } }}>
 <div className="bg-[#151A22] rounded-2xl p-6 max-w-md w-full border-2 border-[#1E90FF]/30 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
 <div className="text-center mb-5">
 <div className="text-5xl mb-3">{isVenue ? '🏪' : '🏟️'}</div>
 <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 {isVenue ? 'BRING MORE FANS IN!' : 'THE MORE THE MERRIER!'}
 </h2>
 <p className="text-[#A0A4AB] leading-relaxed">
 {isVenue
 ? 'Invite your customers and regulars to join Huddle Up! More fans on the app means more people finding your venue for watch parties.'
 : 'Watch parties are better with friends! Invite your friends and family to Huddle Up and earn 100 bonus points for each invite.'}
 </p>
 </div>
 <div className="space-y-3 mb-5">
 {isVenue ? (
 <>
 <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
 <div className="text-2xl">📱</div>
 <div>
 <p className="text-white text-sm font-semibold">Share with your customers</p>
 <p className="text-[#A0A4AB] text-xs">Put up a sign or share the link on social media</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
 <div className="text-2xl">📊</div>
 <div>
 <p className="text-white text-sm font-semibold">More visibility for your venue</p>
 <p className="text-[#A0A4AB] text-xs">More users = more people discovering your watch parties</p>
 </div>
 </div>
 </>
 ) : (
 <>
 <div className="flex items-center gap-3 p-3 bg-[#1E90FF]/10 rounded-xl border border-[#1E90FF]/20">
 <div className="text-2xl">👥</div>
 <div>
 <p className="text-white text-sm font-semibold">Build your crew</p>
 <p className="text-[#A0A4AB] text-xs">Invite friends to join and find watch parties together</p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
 <div className="text-2xl">🏆</div>
 <div>
 <p className="text-white text-sm font-semibold">Earn 100 points per invite</p>
 <p className="text-[#A0A4AB] text-xs">Rack up points and enter raffles for awesome prizes</p>
 </div>
 </div>
 </>
 )}
 </div>
 <div className="space-y-2">
 <button onClick={shareApp} className="w-full py-3 bg-gradient-to-r from-[#1E90FF] to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
 <Share2 className="w-5 h-5" /> Share Huddle Up
 </button>
 <button onClick={() => { setShowInviteReminder(false); localStorage.setItem('lastInviteReminder', Date.now().toString()); }} className="w-full py-2.5 bg-[#0F1115] text-[#A0A4AB] rounded-xl hover:text-white transition-all text-sm">
 Maybe Later
 </button>
 </div>
 </div>
 </div>
 );
 };

 const InfluencerDashboard = () => {
 const [dashData, setDashData] = useState(null);
 const [dashLoading, setDashLoading] = useState(true);
 const [dashError, setDashError] = useState(null);

 useEffect(() => {
 if (!influencerDashboardToken) return;
 (async () => {
 try {
 const data = await api.affiliates.influencerDashboard(influencerDashboardToken);
 setDashData(data);
 } catch (e) {
 setDashError(e.message || 'Dashboard not found');
 } finally {
 setDashLoading(false);
 }
 })();
 }, [influencerDashboardToken]);

 if (dashLoading) return (
 <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
 </div>
 );

 if (dashError) return (
 <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center p-4">
 <div className="bg-[#0F1115] border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
 <div className="text-4xl mb-4">🔒</div>
 <h2 className="text-xl font-bold text-white mb-2">Dashboard Not Found</h2>
 <p className="text-[#A0A4AB] mb-6">{dashError}</p>
 <button onClick={() => setCurrentScreen('games')} className="px-6 py-2.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400">Go Home</button>
 </div>
 </div>
 );

 const inf = dashData.influencer;
 const stats = dashData.stats;
 const unpaidCents = inf.pendingPayoutCents || 0;
 const monthlyRecurring = parseInt(stats.monthly_recurring_cents || 0);

 return (
 <div className="min-h-screen bg-[#0A0E14]">
 <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-b border-amber-500/20">
 <div className="max-w-4xl mx-auto px-4 py-6">
 <div className="flex items-center gap-3 mb-1">
 <span className="text-2xl">⭐</span>
 <h1 className="text-2xl font-black text-white">Influencer Dashboard</h1>
 </div>
 <p className="text-amber-300/70 text-sm">Welcome back, {inf.name}</p>
 </div>
 </div>
 <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
 <div className="bg-[#0F1115] border border-amber-500/20 rounded-2xl p-5">
 <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
 <div>
 <p className="text-[#A0A4AB] text-xs mb-1">Your Code</p>
 <div className="flex items-center gap-2">
 <span className="text-2xl font-black text-amber-400 font-mono tracking-wider">{inf.code}</span>
 <button onClick={() => { navigator.clipboard.writeText(inf.code); }} className="text-xs text-[#A0A4AB] hover:text-white bg-[#151A22] px-2 py-1 rounded">Copy</button>
 </div>
 </div>
 <div className="text-right">
 <p className="text-[#A0A4AB] text-xs mb-1">Commission Rate</p>
 <span className="text-xl font-bold text-green-400">{Math.round(inf.commissionRate * 100)}%</span>
 </div>
 </div>
 <div className="bg-[#151A22] rounded-xl p-3 text-sm text-[#A0A4AB]">
 <p>Share your code with fans! They get <span className="text-amber-400 font-bold">50% off Pro</span> ($1.50/mo instead of $2.99), and you earn <span className="text-green-400 font-bold">{Math.round(inf.commissionRate * 100)}% recurring commission</span> (~${((150 * inf.commissionRate) / 100).toFixed(2)}/mo per user).</p>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-[#0F1115] border border-[#222A36] rounded-xl p-4 text-center">
 <p className="text-2xl font-black text-white">{stats.total_redemptions || 0}</p>
 <p className="text-[#A0A4AB] text-xs mt-1">Total Signups</p>
 </div>
 <div className="bg-[#0F1115] border border-cyan-500/20 rounded-xl p-4 text-center">
 <p className="text-2xl font-black text-cyan-400">{stats.total_signups || 0}</p>
 <p className="text-[#A0A4AB] text-xs mt-1">Total Signups</p>
 </div>
 <div className="bg-[#0F1115] border border-purple-500/20 rounded-xl p-4 text-center">
 <p className="text-2xl font-black text-purple-400">{stats.active_paying || 0}</p>
 <p className="text-[#A0A4AB] text-xs mt-1">Paying Users</p>
 </div>
 <div className="bg-[#0F1115] border border-green-500/20 rounded-xl p-4 text-center">
 <p className="text-2xl font-black text-green-400">${(monthlyRecurring / 100).toFixed(2)}</p>
 <p className="text-[#A0A4AB] text-xs mt-1">Monthly Recurring</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div className="bg-[#0F1115] border border-green-500/20 rounded-xl p-4">
 <p className="text-[#A0A4AB] text-xs mb-1">Total Earned</p>
 <p className="text-xl font-bold text-green-400">${((inf.totalEarnedCents || 0) / 100).toFixed(2)}</p>
 </div>
 <div className="bg-[#0F1115] border border-blue-500/20 rounded-xl p-4">
 <p className="text-[#A0A4AB] text-xs mb-1">Already Paid</p>
 <p className="text-xl font-bold text-blue-400">${((inf.totalPaidCents || 0) / 100).toFixed(2)}</p>
 </div>
 <div className="bg-[#0F1115] border border-yellow-500/20 rounded-xl p-4">
 <p className="text-[#A0A4AB] text-xs mb-1">Pending Payout</p>
 <p className="text-xl font-bold text-yellow-400">${(unpaidCents / 100).toFixed(2)}</p>
 </div>
 </div>

 {dashData.recentRedemptions && dashData.recentRedemptions.length > 0 && (
 <div className="bg-[#0F1115] border border-[#222A36] rounded-2xl p-5">
 <h3 className="text-white font-bold mb-3">Recent Signups</h3>
 <div className="space-y-2 max-h-80 overflow-y-auto">
 {dashData.recentRedemptions.map((ref, i) => {
 const isPaying = ref.converted_to_paid && ref.subscription_active;
 const isChurned = ref.converted_to_paid && !ref.subscription_active;
 const isSignedUp = !ref.converted_to_paid;
 return (
 <div key={i} className="flex items-center justify-between bg-[#151A22] rounded-lg px-3 py-2">
 <div>
 <span className="text-white text-sm font-medium">{ref.user_name || 'User'}</span>
 <span className="text-[#A0A4AB] text-xs ml-2">{new Date(ref.created_at).toLocaleDateString()}</span>
 </div>
 <div className="flex items-center gap-2">
 {isPaying && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">Paying · ${((ref.monthly_commission_cents || 0) / 100).toFixed(2)}/mo</span>}
 {isSignedUp && <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">Signed Up</span>}
 {isChurned && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">Churned</span>}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {dashData.payouts && dashData.payouts.length > 0 && (
 <div className="bg-[#0F1115] border border-[#222A36] rounded-2xl p-5">
 <h3 className="text-white font-bold mb-3">Payout History</h3>
 <div className="space-y-2">
 {dashData.payouts.map((p, i) => (
 <div key={i} className="flex items-center justify-between bg-[#151A22] rounded-lg px-3 py-2">
 <span className="text-white text-sm">${(p.amount_cents / 100).toFixed(2)}</span>
 <div className="flex items-center gap-2">
 <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{p.status}</span>
 <span className="text-[#A0A4AB] text-xs">{new Date(p.created_at).toLocaleDateString()}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="text-center py-4">
 <button onClick={() => setCurrentScreen('games')} className="text-[#A0A4AB] hover:text-white text-sm">← Back to Huddle Up</button>
 </div>
 </div>
 </div>
 );
 };

 const ProUpgradeScreen = () => {
 const [proYearly, setProYearly] = useState(false);
 const [upgrading, setUpgrading] = useState(false);
 const [proAffCode, setProAffCode] = useState('');
 const [proAffValid, setProAffValid] = useState(null);
 const [proAffMsg, setProAffMsg] = useState('');
 const proPerks = [
 { icon: <Clock className="w-5 h-5" />, title: 'Priority Party Placement', desc: 'Your parties appear at the top of listings in your city', color: 'text-blue-400' },
 { icon: <Star className="w-5 h-5" />, title: 'VIP Badge', desc: 'Gold VIP badge next to your name everywhere in the app', color: 'text-amber-400' },
 { icon: <Trophy className="w-5 h-5" />, title: '3x Points Multiplier', desc: 'Earn triple points for every action you take', color: 'text-purple-400' },
 { icon: <Crown className="w-5 h-5" />, title: 'Custom Profile Themes', desc: 'Choose from 5 exclusive color schemes for your profile', color: 'text-pink-400' },
 { icon: <BarChart3 className="w-5 h-5" />, title: 'Advanced Analytics', desc: 'See detailed stats on your parties and engagement', color: 'text-cyan-400' },
 { icon: <Camera className="w-5 h-5" />, title: 'Custom Party Backgrounds', desc: 'Upload custom banners for parties you host', color: 'text-green-400' },
 { icon: <Shield className="w-5 h-5" />, title: 'Priority Support', desc: 'Get faster responses from our support team', color: 'text-orange-400' },
 ];
 const comparisonRows = [
 { feature: 'Browse & join parties', free: true, pro: true },
 { feature: 'Create unlimited parties', free: true, pro: true },
 { feature: 'Party chat & messaging', free: true, pro: true },
 { feature: 'Live scores & updates', free: true, pro: true },
 { feature: 'Fan Finder & My Crew', free: true, pro: true },
 { feature: 'Team Chat Rooms', free: true, pro: true },
 { feature: 'Points & badges', free: true, pro: true },
 { feature: 'QR check-in', free: true, pro: true },
 { feature: 'Notifications & alerts', free: true, pro: true },
 { feature: 'Priority party placement', free: false, pro: true },
 { feature: 'VIP badge', free: false, pro: true },
 { feature: '3x points multiplier', free: false, pro: true },
 { feature: 'Custom profile themes', free: false, pro: true },
 { feature: 'Custom party backgrounds', free: false, pro: true },
 { feature: 'Advanced analytics', free: false, pro: true },
 { feature: 'Priority support', free: false, pro: true },
 ];
 const handleUpgrade = async () => {
 setUpgrading(true);
 try {
 let products = await api.stripe.products();
 let proProduct = products.find(p => p.metadata?.tier === 'pro');
 if (!proProduct || proProduct.prices.length === 0) {
 await new Promise(r => setTimeout(r, 2000));
 products = await api.stripe.products();
 proProduct = products.find(p => p.metadata?.tier === 'pro');
 }
 if (proProduct && proProduct.prices.length > 0) {
 const targetPrice = proYearly
 ? proProduct.prices.find(p => p.recurring?.interval === 'year') || proProduct.prices[0]
 : proProduct.prices.find(p => p.recurring?.interval === 'month') || proProduct.prices[0];
 const result = await api.stripe.checkout(targetPrice.id, proAffValid ? proAffCode : '');
 if (result?.url) window.location.href = result.url;
 } else {
 alert('Plans are loading. Please wait a moment and try again.');
 }
 } catch(e) { console.error(e); alert('Something went wrong. Please try again.'); }
 setUpgrading(false);
 };
 return (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-lg mx-auto px-4 py-3">
 <button onClick={() => setCurrentScreen('profile')} className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors mb-2">
 <ArrowLeft className="w-5 h-5" /> Back
 </button>
 </div>
 </div>
 <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
 {isPro ? (
 <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-yellow-900/20 p-5">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
 <Crown className="w-6 h-6 text-white" />
 </div>
 <div>
 <h2 className="text-xl font-black text-white">You're a Pro!</h2>
 <p className="text-amber-300 text-xs font-bold">All Pro perks are active</p>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2 mt-4">
 {proPerks.slice(0, 4).map((perk, i) => (
 <div key={i} className="bg-black/20 rounded-xl p-3 border border-amber-500/20">
 <div className={`${perk.color} mb-1`}>{perk.icon}</div>
 <p className="text-white font-bold text-xs">{perk.title}</p>
 </div>
 ))}
 </div>
 <button onClick={async () => { try { const d = await api.stripe.portal(); if (d?.url) window.location.href = d.url; } catch(e) { console.error(e); } }} className="w-full mt-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all">
 Manage Subscription
 </button>
 </div>
 ) : (
 <>
 <div className="relative overflow-hidden rounded-2xl border border-[#222A36] bg-gradient-to-br from-[#151A22] via-[#1A1F2B] to-[#151A22] p-5">
 <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
 <div className="text-center mb-4">
 <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
 <Crown className="w-8 h-8 text-white" />
 </div>
 <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>UPGRADE TO PRO</h2>
 <p className="text-[#A0A4AB] text-sm">Get premium perks. Core features stay free forever.</p>
 </div>
 <div className="space-y-2.5">
 {proPerks.map((perk, i) => (
 <div key={i} className="flex items-start gap-3 p-3 bg-black/20 rounded-xl border border-[#222A36]">
 <div className={`w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center flex-shrink-0 ${perk.color}`}>
 {perk.icon}
 </div>
 <div>
 <p className="text-white font-bold text-sm">{perk.title}</p>
 <p className="text-white/50 text-xs">{perk.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-amber-900/30 p-5">
 <div className="text-center">
 <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">Huddle Up Pro</p>
 <div className="flex items-center justify-center gap-3 mb-3">
 <button onClick={() => setProYearly(false)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!proYearly ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>Monthly</button>
 <button onClick={() => setProYearly(true)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${proYearly ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>Yearly <span className="text-[10px]">(Save $6)</span></button>
 </div>
 <div className="flex items-baseline justify-center gap-1 mb-1">
 <span className="text-4xl font-black text-white">{proYearly ? '$29' : '$2'}</span>
 <span className="text-lg text-white">{proYearly ? '.99' : '.99'}</span>
 <span className="text-[#A0A4AB] text-sm">/{proYearly ? 'year' : 'month'}</span>
 </div>
 {proYearly && <p className="text-green-300 text-xs font-bold mb-2">That's only $2.50/month!</p>}
 <p className="text-white/50 text-xs mb-4">Cancel anytime. Core app stays free forever.</p>
 <div className="mb-3">
 <label className="block text-amber-300/80 text-xs font-bold mb-1.5">Have an influencer code? Get 50% off Pro!</label>
 <div className="flex gap-2">
 <input type="text" value={proAffCode} onChange={e => { setProAffCode(e.target.value.toUpperCase()); setProAffValid(null); setProAffMsg(''); }}
 placeholder="Enter code" className="flex-1 px-3 py-2 bg-black/30 border border-amber-500/20 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" />
 <button type="button" onClick={async () => {
 if (!proAffCode.trim()) return;
 try {
 const r = await api.affiliates.validateCode(proAffCode);
 if (r.valid) { setProAffValid(true); setProAffMsg('Code applied! 50% off — only $1.50/mo'); }
 else { setProAffValid(false); setProAffMsg(r.error || 'Invalid code'); }
 } catch { setProAffValid(false); setProAffMsg('Could not validate code'); }
 }} className="px-3 py-2 bg-amber-500/20 text-amber-300 font-bold rounded-lg text-xs border border-amber-500/30 hover:bg-amber-500/30">Apply</button>
 </div>
 {proAffMsg && <p className={`text-xs mt-1 ${proAffValid ? 'text-green-400' : 'text-red-400'}`}>{proAffMsg}</p>}
 </div>
 <button onClick={handleUpgrade} disabled={upgrading} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em' }}>
 {upgrading ? 'LOADING...' : (proAffValid ? 'GET 50% OFF PRO' : 'START PRO NOW')}
 </button>
 </div>
 </div>
 <div className="rounded-2xl border border-[#222A36] bg-[#151A22] p-4">
 <h3 className="text-white font-bold text-sm mb-3 text-center">Free vs Pro Comparison</h3>
 <div className="flex items-center justify-between pb-2 border-b border-[#222A36] mb-2">
 <span className="text-white/40 text-xs">Feature</span>
 <div className="flex items-center gap-6">
 <span className="text-[10px] text-[#A0A4AB] w-12 text-center font-bold">Free</span>
 <span className="text-[10px] text-amber-300 w-12 text-center font-bold">Pro</span>
 </div>
 </div>
 <div className="space-y-1.5">
 {comparisonRows.map((row, i) => (
 <div key={i} className="flex items-center justify-between py-1">
 <span className="text-white/70 text-xs">{row.feature}</span>
 <div className="flex items-center gap-6">
 <span className="w-12 text-center">{row.free ? <CheckCircle className="w-3.5 h-3.5 text-green-400 mx-auto" /> : <X className="w-3.5 h-3.5 text-[#333] mx-auto" />}</span>
 <span className="w-12 text-center"><CheckCircle className="w-3.5 h-3.5 text-amber-400 mx-auto" /></span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </>
 )}
 </div>
 </div>
 );
 };

 const WelcomePopup = () => {
 if (!showWelcomePopup) return null;
 return (
 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-y-auto">
 <div className="rounded-2xl p-6 sm:p-8 w-[90%] max-w-[500px] shadow-2xl my-4" style={{ backgroundColor: '#0F1115', border: '2px solid rgba(30, 144, 255, 0.4)' }}>
 <div className="text-center mb-6">
 <div className="text-5xl mb-3">🎉</div>
 <h2 className="text-2xl sm:text-3xl font-black text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>Welcome to Huddle Up!</h2>
 </div>
 <div className="mb-5 p-4 bg-gradient-to-br from-[#F5B400]/10 to-[#F5B400]/5 border border-[#F5B400]/30 rounded-xl text-center">
 <p className="text-white font-bold text-base sm:text-lg mb-1">You're one of the first 100 members</p>
 <p className="text-[#F5B400] text-sm font-semibold">to join during our soft launch!</p>
 </div>
 <div className="mb-5">
 <p className="text-[#A0A4AB] text-sm font-semibold mb-3">Here's what that means:</p>
 <div className="space-y-2">
 <div className="flex items-center gap-3 bg-[#151A22] rounded-xl px-4 py-3 border border-[#222A36]">
 <span className="text-green-400 text-lg font-bold flex-shrink-0">✓</span>
 <span className="text-white font-semibold text-sm">Lifetime Pro FREE</span>
 </div>
 <div className="flex items-center gap-3 bg-[#151A22] rounded-xl px-4 py-3 border border-[#222A36]">
 <span className="text-green-400 text-lg font-bold flex-shrink-0">✓</span>
 <span className="text-white font-semibold text-sm">Exclusive "Founder" badge</span>
 </div>
 <div className="flex items-center gap-3 bg-[#151A22] rounded-xl px-4 py-3 border border-[#222A36]">
 <span className="text-green-400 text-lg font-bold flex-shrink-0">✓</span>
 <span className="text-white font-semibold text-sm">Help shape our features</span>
 </div>
 </div>
 </div>
 <div className="mb-5 p-4 bg-[#151A22] rounded-xl border border-[#222A36]">
 <p className="text-[#A0A4AB] text-sm font-semibold mb-2">We're just getting started in Boca Raton, so you might see:</p>
 <div className="space-y-1.5 text-sm text-[#A0A4AB]">
 <p>• Some parties with few attendees</p>
 <p>• New features being added weekly</p>
 <p>• Bugs (please report them!)</p>
 </div>
 </div>
 <div className="mb-6 text-center">
 <p className="text-[#A0A4AB] text-sm">Your feedback matters! Message us anytime with suggestions.</p>
 </div>
 <button onClick={() => { setShowWelcomePopup(false); setShowOnboarding(true); setOnboardingStep(0); setUser(prev => prev ? ({ ...prev, onboardingCompleted: true }) : prev); fetch('/api/users/onboarding-complete', { method: 'POST', credentials: 'include' }).catch(() => {}); }} className="w-full py-3.5 text-white font-black transition-all text-lg hover:opacity-90 active:scale-[0.98]" style={{ backgroundColor: '#1E90FF', borderRadius: '14px' }}>
 Let's Go!
 </button>
 </div>
 </div>
 );
 };

 const QA_ITEMS = [
 { q: 'What is Huddle Up?', a: 'Huddle Up is the #1 app for finding and creating sports watch parties. We connect fans with local venues, other fans, and events for 15+ sports leagues including NFL, NBA, MLB, NHL, MLS, Premier League, and more.' },
 { q: 'Is Huddle Up free to use?', a: 'Yes! Huddle Up is 100% free for all core features - creating parties, joining parties, live scores, chat, fan finder, rewards, and more. We also offer an optional Pro upgrade ($2.99/mo) for premium perks like VIP badge, 3x points, and priority party placement.' },
 { q: 'How do I create a watch party?', a: 'Tap any game on the schedule, then tap "Create Watch Party." Choose a venue, add details about your party, and invite friends. It\'s that simple!' },
 { q: 'How do I find parties near me?', a: 'Use the search bar to type your city name, or enable location services and we\'ll show you parties nearby automatically.' },
 { q: 'What are badges and how do I earn them?', a: 'Badges are achievements you earn by participating! Host parties to earn "Party Starter," attend 5+ to get "Social Butterfly," leave reviews for "Critic," and more. Your fan score goes up with every activity.' },
 { q: 'How do rewards and points work?', a: 'You earn points for creating parties (50 pts), attending (25 pts), inviting friends (100 pts), and checking in at venues (75 pts). Redeem points for rewards like free drinks, merch discounts, and VIP status.' },
 { q: 'Can I claim my venue on Huddle Up?', a: 'Yes! If you own or manage a venue, you can claim it on the platform. This lets you manage your venue\'s profile, upload photos, and see which parties are happening at your location.' },
 { q: 'How do Team Chat Rooms work?', a: 'Team Chat Rooms let you chat with other fans of your favorite team. Find or create a room for any team, and start talking game day strategy, trash talk, and more!' },
 { q: 'What sports does Huddle Up cover?', a: 'We cover NFL, NBA, MLB, NHL, MLS, NWSL, Premier League, La Liga, Serie A, Champions League, College Football, College Basketball, WNBA, UFC, Boxing, and more!' },
 { q: 'How do I become a sponsor?', a: 'Huddle Up offers sponsorship opportunities for businesses. Visit the Sponsor section in the app or contact us at sponsor@huddleupusa.com for partnership details.' },
 ];

 const QAScreen = () => (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => setShowQA(false)} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <Shield className="w-6 h-6 text-[#1E90FF]" />
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Q & A</h2>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-3">
 <p className="text-[#A0A4AB] text-sm mb-4">Frequently asked questions about Huddle Up</p>
 {QA_ITEMS.map((item, i) => (
 <div key={i} className="bg-[#151A22] border border-[#222A36] rounded-xl overflow-hidden">
 <button onClick={() => setQaExpandedIndex(qaExpandedIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
 <span className="text-white font-medium text-sm pr-4">{item.q}</span>
 <ChevronDown className={`w-5 h-5 text-[#A0A4AB] flex-shrink-0 transition-transform ${qaExpandedIndex === i ? 'rotate-180' : ''}`} />
 </button>
 {qaExpandedIndex === i && (
 <div className="px-4 pb-4 text-[#A0A4AB] text-sm leading-relaxed border-t border-white/5 pt-3">
 {item.a}
 </div>
 )}
 </div>
 ))}
 <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-[#1E90FF]/10 border border-[#1E90FF]/20 rounded-xl p-6 text-center">
 <h3 className="text-white font-bold mb-2">Still have questions?</h3>
 <p className="text-[#A0A4AB] text-sm mb-4">We'd love to hear from you</p>
 <a href="mailto:support@huddleupusa.com" className="inline-block px-6 py-2 bg-[#1E90FF] hover:bg-[#1E90FF]/70 text-white font-bold rounded-lg transition-colors">
 Email Support
 </a>
 </div>
 </div>
 </div>
 );

 const VenueDetailScreen = () => {
 const [venueData, setVenueData] = useState(null);
 const [venueTab, setVenueTab] = useState('upcoming');
 const [venueParties, setVenueParties] = useState([]);
 const [venueReviews, setVenueReviews] = useState({ reviews: [], summary: { total: 0, avgRating: null, breakdown: {} } });
 const [venuePhotos, setVenuePhotos] = useState([]);
 const [venueLoading, setVenueLoading] = useState(true);
 const [reviewForm, setReviewForm] = useState({ rating: 5, atmosphere: 5, service: 5, value: 5, comment: '' });
 const [submittingReview, setSubmittingReview] = useState(false);
 const [followLoading, setFollowLoading] = useState(false);

 useEffect(() => {
   if (!selectedVenueId) return;
   setVenueLoading(true);
   api.venues.detail(selectedVenueId).then(d => { setVenueData(d); setVenueLoading(false); }).catch(() => setVenueLoading(false));
 }, [selectedVenueId]);

 useEffect(() => {
   if (!selectedVenueId) return;
   if (venueTab === 'upcoming' || venueTab === 'past') {
     api.venues.parties(selectedVenueId, venueTab === 'past' ? 'past' : 'upcoming').then(setVenueParties).catch(() => {});
   } else if (venueTab === 'reviews') {
     api.venues.getReviews(selectedVenueId).then(setVenueReviews).catch(() => {});
   } else if (venueTab === 'photos') {
     api.venues.getPhotos(selectedVenueId).then(setVenuePhotos).catch(() => {});
   }
 }, [selectedVenueId, venueTab]);

 const toggleFollow = async () => {
   if (!venueData || followLoading) return;
   setFollowLoading(true);
   try {
     const res = venueData.isFollowing ? await api.venues.unfollow(selectedVenueId) : await api.venues.follow(selectedVenueId);
     setVenueData(prev => ({ ...prev, isFollowing: res.following, followerCount: res.followerCount }));
   } catch(e) {}
   setFollowLoading(false);
 };

 const submitVenueReview = async () => {
   setSubmittingReview(true);
   try {
     await api.venues.submitReview(selectedVenueId, reviewForm);
     const data = await api.venues.getReviews(selectedVenueId);
     setVenueReviews(data);
     setReviewForm({ rating: 5, atmosphere: 5, service: 5, value: 5, comment: '' });
     const detail = await api.venues.detail(selectedVenueId);
     setVenueData(detail);
   } catch(e) { alert(e.message); }
   setSubmittingReview(false);
 };

 const openDirections = () => {
   if (!venueData?.address) return;
   window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venueData.address)}`, '_blank');
 };

 if (venueLoading) return (
   <div className="min-h-screen bg-[#0F1115] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#1E90FF] animate-spin" /></div>
 );
 if (!venueData) return (
   <div className="min-h-screen bg-[#0F1115] flex items-center justify-center flex-col gap-4">
     <p className="text-[#A0A4AB]">Venue not found</p>
     <button onClick={goBack} className="text-[#1E90FF]">Go Back</button>
   </div>
 );

 const tabs = [
   { key: 'upcoming', label: 'Upcoming' },
   { key: 'past', label: 'Past' },
   { key: 'about', label: 'About' },
   { key: 'reviews', label: 'Reviews' },
   { key: 'photos', label: 'Photos' },
 ];

 const StarRating = ({ value, onChange, size = 'md' }) => {
   const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
   return (
     <div className="flex gap-1">
       {[1,2,3,4,5].map(s => (
         <button key={s} onClick={() => onChange?.(s)} className="focus:outline-none">
           <Star className={`${sz} ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-[#A0A4AB]/30'}`} />
         </button>
       ))}
     </div>
   );
 };

 return (
   <div className="min-h-screen bg-[#0F1115]">
     <div className="relative">
       {venueData.picture ? (
         <div className="h-48 w-full">
           <img src={`/api/uploads/serve/${venueData.picture.replace('/objects/', '')}`} alt={venueData.name} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-transparent" />
         </div>
       ) : (
         <div className="h-48 w-full bg-gradient-to-br from-[#1E90FF]/30 to-[#0F1115]">
           <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-transparent" />
         </div>
       )}
       <button onClick={goBack} className="absolute top-4 left-4 z-10 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
         <ArrowLeft className="w-5 h-5 text-white" />
       </button>
     </div>

     <div className="px-4 -mt-12 relative z-10">
       <div className="flex items-end gap-4 mb-4">
         <div className="w-20 h-20 rounded-2xl bg-[#1A1D23] border-2 border-[#222A36] flex items-center justify-center overflow-hidden flex-shrink-0">
           {venueData.logo ? (
             <img src={`/api/uploads/serve/${venueData.logo.replace('/objects/', '')}`} alt="" className="w-full h-full object-cover" />
           ) : (
             <Building2 className="w-10 h-10 text-[#1E90FF]" />
           )}
         </div>
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2">
             <h1 className="text-xl font-black text-white truncate">{venueData.name}</h1>
             {venueData.verified && <CheckCircle className="w-5 h-5 text-[#1E90FF] flex-shrink-0" />}
           </div>
           <p className="text-[#A0A4AB] text-sm truncate">{venueData.type}</p>
         </div>
       </div>

       {venueData.avgRating && (
         <div className="flex items-center gap-2 mb-3">
           <div className="flex items-center gap-1">
             <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
             <span className="text-white font-bold">{venueData.avgRating}</span>
           </div>
           <span className="text-[#A0A4AB] text-sm">({venueData.reviewCount} reviews)</span>
         </div>
       )}

       <div className="flex items-center gap-2 mb-2">
         <MapPin className="w-4 h-4 text-[#A0A4AB] flex-shrink-0" />
         <p className="text-[#A0A4AB] text-sm">{venueData.address}</p>
       </div>
       {venueData.phone && (
         <div className="flex items-center gap-2 mb-2">
           <Phone className="w-4 h-4 text-[#A0A4AB] flex-shrink-0" />
           <a href={`tel:${venueData.phone}`} className="text-[#1E90FF] text-sm">{venueData.phone}</a>
         </div>
       )}
       {venueData.website && (
         <div className="flex items-center gap-2 mb-3">
           <Globe className="w-4 h-4 text-[#A0A4AB] flex-shrink-0" />
           <a href={venueData.website.startsWith('http') ? venueData.website : `https://${venueData.website}`} target="_blank" rel="noopener noreferrer" className="text-[#1E90FF] text-sm truncate">{venueData.website}</a>
         </div>
       )}

       <div className="flex gap-2 mb-4">
         <button onClick={openDirections} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1E90FF] rounded-xl text-white font-bold text-sm">
           <Navigation className="w-4 h-4" /> Get Directions
         </button>
         <button onClick={toggleFollow} disabled={followLoading} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border ${venueData.isFollowing ? 'bg-[#1E90FF]/20 border-[#1E90FF] text-[#1E90FF]' : 'bg-[#1A1D23] border-[#222A36] text-white'}`}>
           {venueData.isFollowing ? <><Check className="w-4 h-4" /> Following</> : <><Heart className="w-4 h-4" /> Follow</>}
         </button>
       </div>
       <p className="text-[#A0A4AB] text-xs mb-4">{venueData.followerCount} followers</p>
     </div>

     <div className="flex gap-1 px-4 mb-4 overflow-x-auto scrollbar-hide">
       {tabs.map(t => (
         <button key={t.key} onClick={() => setVenueTab(t.key)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${venueTab === t.key ? 'bg-[#1E90FF] text-white' : 'bg-[#1A1D23] text-[#A0A4AB] border border-[#222A36]'}`}>
           {t.label}
         </button>
       ))}
     </div>

     <div className="px-4 pb-20">
       {(venueTab === 'upcoming' || venueTab === 'past') && (
         <div className="space-y-3">
           {venueParties.length === 0 ? (
             <div className="text-center py-12">
               <Calendar className="w-12 h-12 text-[#A0A4AB]/30 mx-auto mb-3" />
               <p className="text-[#A0A4AB]">{venueTab === 'upcoming' ? 'No upcoming parties' : 'No past parties'}</p>
             </div>
           ) : venueParties.map(p => (
             <div key={p.id} onClick={() => { setSelectedGame({ id: p.gameId, sport: p.sport, homeTeam: p.homeTeam, awayTeam: p.awayTeam, startTime: p.gameTime }); setCurrentScreen('gameDetail'); }} className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36] cursor-pointer hover:border-[#1E90FF]/40 transition-all">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-[#1E90FF] bg-[#1E90FF]/10 px-2 py-0.5 rounded">{p.sport}</span>
                 <span className="text-[#A0A4AB] text-xs">{new Date(p.gameTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
               </div>
               <h3 className="text-white font-bold text-sm mb-1">{p.homeTeam} vs {p.awayTeam}</h3>
               {p.title && <p className="text-[#A0A4AB] text-xs mb-2">{p.title}</p>}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[#A0A4AB] text-xs">
                   <Users className="w-3.5 h-3.5" />
                   <span>{p.attendeeCount} attending</span>
                 </div>
                 <span className="text-[#A0A4AB] text-xs">Hosted by {p.hostName}</span>
               </div>
             </div>
           ))}
         </div>
       )}

       {venueTab === 'about' && (
         <div className="space-y-4">
           <div className="grid grid-cols-2 gap-3">
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36] text-center">
               <p className="text-2xl font-black text-white">{venueData.totalParties}</p>
               <p className="text-[#A0A4AB] text-xs">Total Parties</p>
             </div>
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36] text-center">
               <p className="text-2xl font-black text-white">{venueData.totalFans}</p>
               <p className="text-[#A0A4AB] text-xs">Total Fans</p>
             </div>
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36] text-center">
               <p className="text-2xl font-black text-white">{venueData.avgAttendance || '—'}</p>
               <p className="text-[#A0A4AB] text-xs">Avg Attendance</p>
             </div>
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36] text-center">
               <p className="text-2xl font-black text-white">{venueData.popularSport || '—'}</p>
               <p className="text-[#A0A4AB] text-xs">Popular Sport</p>
             </div>
           </div>
           {venueData.avgRating && (
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36] flex items-center gap-3">
               <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
               <div>
                 <p className="text-white font-bold">{venueData.avgRating} / 5</p>
                 <p className="text-[#A0A4AB] text-xs">{venueData.reviewCount} reviews</p>
               </div>
             </div>
           )}
           {venueData.description && (
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36]">
               <h3 className="text-white font-bold mb-2">About</h3>
               <p className="text-[#A0A4AB] text-sm leading-relaxed">{venueData.description}</p>
             </div>
           )}
           {venueData.capacity && (
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36] flex items-center gap-3">
               <Users className="w-5 h-5 text-[#1E90FF]" />
               <div>
                 <p className="text-white font-bold">Capacity: {venueData.capacity}</p>
                 <p className="text-[#A0A4AB] text-xs">Maximum capacity</p>
               </div>
             </div>
           )}
         </div>
       )}

       {venueTab === 'reviews' && (
         <div className="space-y-4">
           {venueReviews.summary.total > 0 && (
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36]">
               <div className="flex items-center gap-4 mb-3">
                 <div className="text-center">
                   <p className="text-3xl font-black text-white">{venueReviews.summary.avgRating}</p>
                   <StarRating value={Math.round(venueReviews.summary.avgRating || 0)} size="sm" />
                   <p className="text-[#A0A4AB] text-xs mt-1">{venueReviews.summary.total} reviews</p>
                 </div>
                 <div className="flex-1 space-y-1">
                   {[5,4,3,2,1].map(s => (
                     <div key={s} className="flex items-center gap-2">
                       <span className="text-[#A0A4AB] text-xs w-3">{s}</span>
                       <div className="flex-1 h-2 bg-[#222A36] rounded-full overflow-hidden">
                         <div className="h-full bg-amber-400 rounded-full" style={{ width: `${venueReviews.summary.total ? ((venueReviews.summary.breakdown[s] || 0) / venueReviews.summary.total * 100) : 0}%` }} />
                       </div>
                       <span className="text-[#A0A4AB] text-xs w-6 text-right">{venueReviews.summary.breakdown[s] || 0}</span>
                     </div>
                   ))}
                 </div>
               </div>
               {venueReviews.summary.avgAtmosphere && (
                 <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#222A36]">
                   <div className="text-center">
                     <p className="text-white font-bold text-sm">{venueReviews.summary.avgAtmosphere}</p>
                     <p className="text-[#A0A4AB] text-xs">Atmosphere</p>
                   </div>
                   <div className="text-center">
                     <p className="text-white font-bold text-sm">{venueReviews.summary.avgService}</p>
                     <p className="text-[#A0A4AB] text-xs">Service</p>
                   </div>
                   <div className="text-center">
                     <p className="text-white font-bold text-sm">{venueReviews.summary.avgValue}</p>
                     <p className="text-[#A0A4AB] text-xs">Value</p>
                   </div>
                 </div>
               )}
             </div>
           )}

           {user && (
             <div className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36]">
               <h3 className="text-white font-bold mb-3">Write a Review</h3>
               <div className="space-y-3">
                 <div>
                   <label className="text-[#A0A4AB] text-xs mb-1 block">Overall Rating</label>
                   <StarRating value={reviewForm.rating} onChange={v => setReviewForm(f => ({...f, rating: v}))} />
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                   <div>
                     <label className="text-[#A0A4AB] text-xs mb-1 block">Atmosphere</label>
                     <StarRating value={reviewForm.atmosphere} onChange={v => setReviewForm(f => ({...f, atmosphere: v}))} size="sm" />
                   </div>
                   <div>
                     <label className="text-[#A0A4AB] text-xs mb-1 block">Service</label>
                     <StarRating value={reviewForm.service} onChange={v => setReviewForm(f => ({...f, service: v}))} size="sm" />
                   </div>
                   <div>
                     <label className="text-[#A0A4AB] text-xs mb-1 block">Value</label>
                     <StarRating value={reviewForm.value} onChange={v => setReviewForm(f => ({...f, value: v}))} size="sm" />
                   </div>
                 </div>
                 <textarea
                   value={reviewForm.comment}
                   onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                   placeholder="Share your experience..."
                   className="w-full bg-[#0F1115] border border-[#222A36] rounded-xl p-3 text-white text-sm resize-none h-20 focus:border-[#1E90FF] focus:outline-none"
                 />
                 <button onClick={submitVenueReview} disabled={submittingReview} className="w-full py-2.5 bg-[#1E90FF] text-white font-bold rounded-xl disabled:opacity-50">
                   {submittingReview ? 'Submitting...' : 'Submit Review'}
                 </button>
               </div>
             </div>
           )}

           <div className="space-y-3">
             {venueReviews.reviews.length === 0 && (
               <div className="text-center py-12">
                 <Star className="w-12 h-12 text-[#A0A4AB]/30 mx-auto mb-3" />
                 <p className="text-[#A0A4AB]">No reviews yet</p>
                 <p className="text-[#A0A4AB]/60 text-sm">Be the first to review this venue!</p>
               </div>
             )}
             {venueReviews.reviews.map(r => (
               <div key={r.id} className="bg-[#1A1D23] rounded-xl p-4 border border-[#222A36]">
                 <div className="flex items-center gap-3 mb-2">
                   <ProfileAvatar src={r.profilePicture} name={r.userName} size="sm" />
                   <div className="flex-1">
                     <p className="text-white font-bold text-sm">{r.userName}</p>
                     <p className="text-[#A0A4AB] text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                   </div>
                   <div className="flex items-center gap-1">
                     <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                     <span className="text-white font-bold text-sm">{r.rating}</span>
                   </div>
                 </div>
                 {r.comment && <p className="text-[#A0A4AB] text-sm">{r.comment}</p>}
               </div>
             ))}
           </div>
         </div>
       )}

       {venueTab === 'photos' && (
         <div>
           {venuePhotos.length === 0 ? (
             <div className="text-center py-12">
               <Camera className="w-12 h-12 text-[#A0A4AB]/30 mx-auto mb-3" />
               <p className="text-[#A0A4AB]">No photos yet</p>
               <p className="text-[#A0A4AB]/60 text-sm">Photos from parties at this venue will appear here</p>
             </div>
           ) : (
             <div className="grid grid-cols-3 gap-1">
               {venuePhotos.map(photo => (
                 <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-[#1A1D23]">
                   <img
                     src={`/api/uploads/serve/${photo.objectPath.replace('/objects/', '')}`}
                     alt={photo.caption || ''}
                     className="w-full h-full object-cover"
                   />
                 </div>
               ))}
             </div>
           )}
         </div>
       )}
     </div>
   </div>
 );
 };

 const ContactUsScreen = () => (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('profile')} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <Send className="w-6 h-6 text-[#1E90FF]" />
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>CONTACT US</h2>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-4">
 <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-6">
 <div className="flex items-center gap-3 mb-3">
 <Megaphone className="w-8 h-8 text-orange-400" />
 <div>
 <h3 className="text-white font-bold text-lg">Partnerships & Sponsorships</h3>
 <p className="text-[#A0A4AB] text-sm">Get your brand in front of millions of sports fans</p>
 </div>
 </div>
 <p className="text-[#A0A4AB] text-sm mb-4">Interested in sponsoring Huddle Up? We offer main sponsor placement, per-sport banner ads, and custom sponsorship packages.</p>
 <a href="mailto:sponsor@huddleupusa.com" className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
 sponsor@huddleupusa.com
 </a>
 </div>
 <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
 <div className="flex items-center gap-3 mb-3">
 <Calendar className="w-8 h-8 text-purple-400" />
 <div>
 <h3 className="text-white font-bold text-lg">Special Events</h3>
 <p className="text-[#A0A4AB] text-sm">Host a major event on Huddle Up</p>
 </div>
 </div>
 <p className="text-[#A0A4AB] text-sm mb-4">Planning a Super Bowl party, championship viewing, or large-scale sports event? We can help promote and manage your event.</p>
 <a href="mailto:events@huddleupusa.com" className="inline-block px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors">
 events@huddleupusa.com
 </a>
 </div>
 <div className="bg-gradient-to-br from-cyan-500/10 to-[#1E90FF]/10 border border-[#1E90FF]/20 rounded-xl p-6">
 <div className="flex items-center gap-3 mb-3">
 <Building2 className="w-8 h-8 text-[#1E90FF]" />
 <div>
 <h3 className="text-white font-bold text-lg">Venue Partnerships</h3>
 <p className="text-[#A0A4AB] text-sm">List your venue on Huddle Up</p>
 </div>
 </div>
 <p className="text-[#A0A4AB] text-sm mb-4">Own a sports bar or restaurant? Claim your venue to get featured placement, manage your profile, and attract more fans on game day.</p>
 <a href="mailto:venues@huddleupusa.com" className="inline-block px-6 py-2 bg-[#1E90FF] hover:bg-[#1E90FF]/70 text-white font-bold rounded-lg transition-colors">
 venues@huddleupusa.com
 </a>
 </div>
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-6">
 <div className="flex items-center gap-3 mb-3">
 <MessageCircle className="w-8 h-8 text-[#A0A4AB]" />
 <div>
 <h3 className="text-white font-bold text-lg">General Support</h3>
 <p className="text-[#A0A4AB] text-sm">Questions, feedback, or need help?</p>
 </div>
 </div>
 <a href="mailto:support@huddleupusa.com" className="inline-block px-6 py-2 bg-[#151A22] hover:bg-[#222A36] text-white font-bold rounded-lg transition-colors border border-[#222A36]">
 support@huddleupusa.com
 </a>
 </div>
 </div>
 </div>
 );

 const TermsOfServiceScreen = () => (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('profile')} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <Shield className="w-6 h-6 text-[#1E90FF]" />
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>TERMS OF SERVICE</h2>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-6">
 <p className="text-[#A0A4AB] text-xs font-semibold">Last Updated: February 26, 2026</p>

 <div className="space-y-6">

 <div>
 <h3 className="text-white font-bold text-lg mb-2">1. ACCEPTANCE OF TERMS</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">By accessing or using Huddle Up (huddleupus.com) ("the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2">Huddle Up is a platform that connects users who wish to organize or attend watch parties at various venues. We are a <strong className="text-white">technology platform only</strong> and are <strong className="text-white">not responsible</strong> for the actions, conduct, or services provided by venues or users.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">2. DESCRIPTION OF SERVICE</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">Huddle Up provides:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>A platform for users to discover and organize watch party events</li>
 <li>Listings of venues where watch parties may be held</li>
 <li>Tools for communication and coordination between users</li>
 <li>Venue verification services (at our sole discretion)</li>
 </ul>
 <p className="text-white font-bold text-sm mt-3">WE ARE NOT:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Event organizers or hosts</li>
 <li>Venue operators or managers</li>
 <li>Responsible for the actual watch party experiences</li>
 <li>Insurance providers or guarantors of safety</li>
 </ul>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">3. NO LIABILITY - PLATFORM USE AT YOUR OWN RISK</h3>
 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-3">
 <h4 className="text-red-300 font-bold text-sm mb-2">3.1 DISCLAIMER OF LIABILITY</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed font-semibold">YOU ACKNOWLEDGE AND AGREE THAT:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed mt-2 space-y-2">
 <li><strong className="text-white">A. Huddle Up is a PLATFORM ONLY.</strong> We connect users and venues but do not control, operate, manage, or have any involvement in actual watch party events or venue operations.</li>
 <li><strong className="text-white">B. USE AT YOUR OWN RISK.</strong> Your use of the Platform and attendance at any watch parties listed on the Platform is ENTIRELY AT YOUR OWN RISK.</li>
 <li><strong className="text-white">C. NO RESPONSIBILITY FOR EVENTS.</strong> We are not responsible or liable for: the safety, quality, legality, or suitability of any venue; the conduct, behavior, or actions of any users or venue patrons; any injuries, damages, losses, or harm occurring at venues or watch parties; food poisoning, illness, or health issues; theft, assault, harassment, or criminal acts; overcrowding or unsafe conditions; alcohol-related incidents; misrepresentation by venue owners or party hosts; cancellations or failures of watch parties; the accuracy of venue information; disputes between users, hosts, and venues.</li>
 <li><strong className="text-white">D. NO VERIFICATION GUARANTEE.</strong> While we may verify certain venues, this verification does NOT guarantee safety, quality, or legality; does NOT constitute an endorsement or recommendation; is performed for administrative purposes only; and may be revoked at any time without notice.</li>
 </ul>
 </div>
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4 mb-3">
 <h4 className="text-orange-300 font-bold text-sm mb-2">3.2 INDEMNIFICATION</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">YOU AGREE TO INDEMNIFY AND HOLD HARMLESS</strong> Huddle Up, its owners, officers, employees, contractors, and agents from any and all claims, damages, losses, liabilities, costs, and expenses (including attorney fees) arising from or related to: your use of the Platform; your attendance at any watch party or venue; your violation of these Terms; your violation of any rights of third parties; any content you post or share on the Platform; any disputes with other users or venues.</p>
 </div>
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <h4 className="text-orange-300 font-bold text-sm mb-2">3.3 LIMITATION OF LIABILITY</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong> Huddle Up shall NOT be liable for any direct, indirect, incidental, special, consequential, or punitive damages; loss of profits, revenue, data, or use; personal injury or property damage; death or serious bodily injury; emotional distress or mental anguish.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">EVEN IF</strong> we have been advised of the possibility of such damages.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">IN NO EVENT</strong> shall our total liability to you for all damages, losses, and causes of action exceed <strong className="text-white">$100 USD</strong> or the amount you paid us in the last 12 months, whichever is less.</p>
 </div>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">4. VENUE-SPECIFIC TERMS</h3>
 <div className="space-y-3">
 <div>
 <h4 className="text-orange-300 font-bold text-sm mb-2">4.1 For Venue Owners/Operators</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">BY CLAIMING A VENUE, YOU REPRESENT AND WARRANT THAT:</strong></p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>You are authorized to represent the venue</li>
 <li>All information you provide is accurate and up-to-date</li>
 <li>You hold all necessary licenses, permits, and insurance for operation</li>
 <li>You comply with all local, state, and federal laws</li>
 <li>You are solely responsible for the safety and legality of your venue</li>
 <li>You will not hold Huddle Up liable for any issues arising from watch parties</li>
 </ul>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">YOU AGREE:</strong> Huddle Up may list your venue but makes no guarantees about traffic or attendance. Featured or Premium status can be revoked at any time. You are responsible for all venue operations, staffing, and safety. You will not misrepresent your capacity, amenities, or services. Any disputes with patrons are between you and the patron only.</p>
 </div>
 <div>
 <h4 className="text-orange-300 font-bold text-sm mb-2">4.2 For Users Attending Watch Parties</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">BY ATTENDING A WATCH PARTY, YOU ACKNOWLEDGE:</strong></p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>You are responsible for your own safety and wellbeing</li>
 <li>You should verify venue information independently</li>
 <li>Huddle Up does not control venue conditions, staffing, or safety</li>
 <li>You assume all risks associated with attending events</li>
 <li>You are responsible for transportation to and from venues</li>
 <li>You should not drink and drive</li>
 </ul>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">5. USER CONDUCT AND CONTENT</h3>
 <h4 className="text-orange-300 font-bold text-sm mb-2">5.1 Prohibited Conduct</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">You agree NOT to: post false, misleading, or fraudulent information; harass, threaten, or harm other users; use the Platform for illegal purposes; impersonate others or create fake accounts; spam, advertise, or solicit without permission; attempt to hack, disrupt, or damage the Platform; scrape data or use automated tools without permission.</p>
 <h4 className="text-orange-300 font-bold text-sm mb-2 mt-3">5.2 User-Generated Content</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">YOU ARE SOLELY RESPONSIBLE</strong> for any content you post, including party descriptions, comments, and reviews.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-1"><strong className="text-white">YOU GRANT US</strong> a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content on the Platform.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-1"><strong className="text-white">WE MAY REMOVE</strong> any content that violates these Terms or is otherwise objectionable, in our sole discretion.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">6. VERIFICATION AND FEATURED STATUS</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">We may verify venues through manual review, but verification is not a guarantee of quality, safety, or legality; does not constitute an inspection or audit; can be revoked at any time; and does not create any special relationship or liability.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2">Featured and Premium status are <strong className="text-white">paid advertising services only</strong>. They do not guarantee quality or safety, create endorsement or partnership, obligate us to provide any specific results, or make us responsible for venue operations.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">7. PAYMENT AND SUBSCRIPTIONS</h3>
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <p className="text-white font-bold text-sm mb-1">Fan Subscriptions:</p>
 <p className="text-[#A0A4AB] text-sm">Pro: $2.99/month or $29.99/year. All fees are non-refundable unless otherwise stated. Subject to change with 30 days notice.</p>
 <p className="text-white font-bold text-sm mb-1 mt-3">Venue Subscriptions:</p>
 <p className="text-[#A0A4AB] text-sm">Featured: $29.99/month. Premium: $49.99/month. All fees are non-refundable unless otherwise stated. Subject to change with 30 days notice. Billed monthly.</p>
 </div>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-3"><strong className="text-white">PAYMENT DOES NOT GUARANTEE:</strong> Increased attendance or traffic; positive reviews or ratings; continued listing on the Platform; any specific results or outcomes.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2">We may suspend or terminate paid services at any time for violation of these Terms, fraudulent or illegal activity, non-payment of fees, or any reason in our sole discretion.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">8. INTELLECTUAL PROPERTY</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">All content on the Platform, including logos, designs, text, and software, is owned by Huddle Up or licensed to us. You may not copy, modify, or distribute our content; use our trademarks or branding without permission; or reverse engineer or decompile our software.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">9. THIRD-PARTY SERVICES</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">The Platform may integrate with third-party services (payment processors, map providers, etc.). We are not responsible for these third-party services and your use is subject to their own terms.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">10. PRIVACY</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">Your use of the Platform is subject to our <span onClick={() => setCurrentScreen('privacyPolicy')} className="text-[#1E90FF] hover:underline cursor-pointer">Privacy Policy</span>, which is incorporated into these Terms by reference.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">11. MODIFICATIONS TO TERMS</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">We may modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">12. TERMINATION</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">We may terminate or suspend your account at any time, with or without cause, with or without notice.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">13. DISPUTE RESOLUTION</h3>
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">Governing Law:</strong> These Terms are governed by the laws of the State of Florida, USA, without regard to conflict of law principles.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">Arbitration:</strong> ANY DISPUTE ARISING FROM THESE TERMS OR USE OF THE PLATFORM SHALL BE RESOLVED BY BINDING ARBITRATION in accordance with the American Arbitration Association rules.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">YOU WAIVE YOUR RIGHT TO:</strong> A jury trial; participate in class action lawsuits; pursue claims in court (except small claims court).</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">Venue:</strong> Any legal action must be brought in Palm Beach County, Florida.</p>
 </div>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">14. SEVERABILITY</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">15. ENTIRE AGREEMENT</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">These Terms constitute the entire agreement between you and Huddle Up regarding use of the Platform.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">16. CONTACT</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">For questions about these Terms, contact us at:</p>
 <ul className="text-[#A0A4AB] text-sm mt-1 space-y-1">
 <li><strong className="text-white">Email:</strong> <a href="mailto:legal@huddleupus.com" className="text-[#1E90FF] hover:underline">legal@huddleupus.com</a></li>
 <li><strong className="text-white">Support:</strong> <a href="mailto:contact@huddleupus.com" className="text-[#1E90FF] hover:underline">contact@huddleupus.com</a></li>
 <li><strong className="text-white">Website:</strong> huddleupus.com</li>
 </ul>
 </div>

 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-5 mt-4">
 <h3 className="text-white font-bold text-sm mb-3">ACKNOWLEDGMENT AND ACCEPTANCE</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed font-semibold mb-3">BY USING HUDDLE UP, YOU ACKNOWLEDGE THAT:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed space-y-1">
 <li>&#10003; You have read and understood these Terms</li>
 <li>&#10003; You agree to be bound by these Terms</li>
 <li>&#10003; You understand that Huddle Up is a platform only and is not responsible for venues or events</li>
 <li>&#10003; You use the Platform at your own risk</li>
 <li>&#10003; You waive any claims against Huddle Up for injuries, damages, or losses</li>
 <li>&#10003; You agree to arbitration and waive your right to a jury trial</li>
 </ul>
 <p className="text-red-300 font-bold text-sm mt-4">IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE PLATFORM.</p>
 </div>

 </div>
 </div>
 </div>
 );

 const PrivacyPolicyScreen = () => (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('profile')} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <Lock className="w-6 h-6 text-[#1E90FF]" />
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>PRIVACY POLICY</h2>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-6">
 <p className="text-[#A0A4AB] text-xs font-semibold">Last Updated: February 26, 2026</p>

 <div className="space-y-6">

 <div>
 <h3 className="text-white font-bold text-lg mb-2">1. INTRODUCTION</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">Huddle Up ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, share, and protect your information when you use our Platform at huddleupus.com.</p>
 <p className="text-white text-sm leading-relaxed mt-2 font-semibold">By using Huddle Up, you consent to the practices described in this Privacy Policy.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">2. INFORMATION WE COLLECT</h3>
 <h4 className="text-orange-300 font-bold text-sm mb-2">2.1 Information You Provide</h4>
 <p className="text-white font-semibold text-sm">Account Information:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Name</li>
 <li>Email address</li>
 <li>Password (encrypted)</li>
 <li>Phone number (optional)</li>
 <li>Gender (optional - for community building)</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">Venue Information (for venue owners):</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Business name and address</li>
 <li>Contact information</li>
 <li>Business license or proof of ownership</li>
 <li>Payment information (processed by third parties)</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">User-Generated Content:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Watch party descriptions</li>
 <li>Comments and reviews</li>
 <li>Profile information</li>
 <li>Messages to other users</li>
 <li>Photos uploaded to parties</li>
 </ul>
 <h4 className="text-orange-300 font-bold text-sm mb-2 mt-4">2.2 Automatically Collected Information</h4>
 <p className="text-white font-semibold text-sm">Usage Data:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>IP address, browser type and version, device information</li>
 <li>Operating system, pages viewed and links clicked</li>
 <li>Time spent on pages, referring website</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">Location Data:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>General location based on IP address</li>
 <li>Precise location (if you grant permission)</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">Cookies and Tracking:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Session cookies, persistent cookies</li>
 <li>Analytics cookies</li>
 <li>Advertising cookies (third-party)</li>
 </ul>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">3. HOW WE USE YOUR INFORMATION</h3>
 <p className="text-white font-semibold text-sm">Provide Services:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Create and manage your account</li>
 <li>Display watch parties and venue listings</li>
 <li>Process payments (via third-party processors)</li>
 <li>Verify venue ownership</li>
 <li>Send service-related notifications</li>
 <li>Enable QR code check-ins</li>
 <li>Show predictions and leaderboards</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">Improve Platform:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Analyze usage patterns, fix bugs and improve features</li>
 <li>Develop new features, conduct research and analytics</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">Marketing and Communication:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Send promotional emails (you can opt out)</li>
 <li>Notify you of new features, share updates about sports events</li>
 <li>Send newsletters, SMS/Push notifications for parties</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">Legal and Safety:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Comply with legal obligations, prevent fraud and abuse</li>
 <li>Enforce our Terms of Service, protect our rights and property</li>
 </ul>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">4. HOW WE SHARE YOUR INFORMATION</h3>
 <h4 className="text-orange-300 font-bold text-sm mb-2">4.1 Public Information</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">The following information is PUBLIC and visible to all users:</strong></p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Your first name (if you create or join a watch party)</li>
 <li>Your gender (if provided, shown to party attendees)</li>
 <li>Watch party details you create</li>
 <li>Venue information for claimed venues</li>
 <li>Reviews and comments you post</li>
 <li>Your "Founder" badge (if applicable)</li>
 </ul>
 <h4 className="text-orange-300 font-bold text-sm mb-2 mt-4">4.2 Shared Information</h4>
 <p className="text-white font-semibold text-sm">Venue Owners:</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-1">If you join a watch party at a venue, the venue owner can see: your name, your gender (if provided), number of attendees in your party, and any notes you provide.</p>
 <p className="text-white font-semibold text-sm mt-3">Service Providers:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Payment processors (Stripe)</li>
 <li>Hosting providers (Replit, Vercel)</li>
 <li>Analytics services (Google Analytics)</li>
 <li>Email services (SendGrid, Mailchimp)</li>
 <li>SMS services (Twilio)</li>
 <li>Customer support tools</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">Legal Requirements:</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-1">Law enforcement (if required by law), court orders or subpoenas, protection of rights and safety.</p>
 <p className="text-white font-semibold text-sm mt-3">Business Transfers:</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-1">In the event of a merger, acquisition, or sale of assets.</p>
 <h4 className="text-orange-300 font-bold text-sm mb-2 mt-4">4.3 We DO NOT Sell Your Data</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">We do not sell your personal information to third parties.</strong> However, we may share aggregated, anonymized data for research or marketing purposes.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">5. DATA RETENTION</h3>
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <ul className="text-[#A0A4AB] text-sm leading-relaxed space-y-2">
 <li><strong className="text-white">Account data:</strong> Until you delete your account, plus 90 days</li>
 <li><strong className="text-white">Payment records:</strong> 7 years (for tax/legal compliance)</li>
 <li><strong className="text-white">Usage logs:</strong> 2 years</li>
 <li><strong className="text-white">Deleted accounts:</strong> Anonymized data may be retained indefinitely</li>
 </ul>
 </div>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">6. YOUR RIGHTS AND CHOICES</h3>
 <h4 className="text-orange-300 font-bold text-sm mb-2">6.1 Account Management</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">You can: update your profile information, change your password, delete your account (contact <a href="mailto:contact@huddleupus.com" className="text-[#1E90FF] hover:underline">contact@huddleupus.com</a>).</p>
 <h4 className="text-orange-300 font-bold text-sm mb-2 mt-3">6.2 Communication Preferences</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">You can: opt out of marketing emails (click "unsubscribe"), disable push notifications in your device settings, manage notification preferences in Settings, contact us to opt out of all non-essential communications.</p>
 <h4 className="text-orange-300 font-bold text-sm mb-2 mt-3">6.3 Data Access and Portability</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">You can request: a copy of your personal data, correction of inaccurate data, deletion of your data (subject to legal requirements).</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">To exercise these rights, email:</strong> <a href="mailto:privacy@huddleupus.com" className="text-[#1E90FF] hover:underline">privacy@huddleupus.com</a></p>
 <h4 className="text-orange-300 font-bold text-sm mb-2 mt-3">6.4 Cookies</h4>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">You can: disable cookies in your browser settings, use browser extensions to block trackers. Note: Disabling cookies may affect functionality.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">7. DATA SECURITY</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">We implement reasonable security measures to protect your information:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Encrypted data transmission (HTTPS/SSL)</li>
 <li>Encrypted password storage</li>
 <li>Secure servers and databases</li>
 <li>Regular security audits</li>
 <li>Limited employee access to data</li>
 </ul>
 <p className="text-white text-sm leading-relaxed mt-2 font-semibold">However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">8. CHILDREN'S PRIVACY</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">Huddle Up is <strong className="text-white">not intended for users under 18 years old.</strong></p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2">We do not knowingly collect information from minors. If we discover we have collected data from a minor, we will delete it immediately.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">Parents:</strong> If you believe your child has provided information to us, contact <a href="mailto:privacy@huddleupus.com" className="text-[#1E90FF] hover:underline">privacy@huddleupus.com</a>.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">9. THIRD-PARTY LINKS AND SERVICES</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">Our Platform may contain links to third-party websites or integrate with third-party services. We are not responsible for their privacy practices. Review their privacy policies separately.</p>
 <p className="text-white font-semibold text-sm mt-3">Third-party services we use:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Stripe (payment processing)</li>
 <li>Google Maps (venue locations)</li>
 <li>Google Analytics (usage analytics)</li>
 <li>Social media platforms (sharing features)</li>
 <li>ESPN (live scores)</li>
 <li>Twilio (SMS notifications)</li>
 </ul>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">10. INTERNATIONAL USERS</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">Huddle Up is based in the United States. If you access the Platform from outside the U.S.: your information will be transferred to and stored in the U.S.; U.S. privacy laws may differ from your country's laws; by using the Platform, you consent to this transfer.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">11. CALIFORNIA PRIVACY RIGHTS (CCPA)</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">If you are a California resident, you have the right to:</strong></p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Know what personal information we collect</li>
 <li>Know whether we sell or share your information</li>
 <li>Access your personal information</li>
 <li>Request deletion of your information</li>
 <li>Opt out of the sale of your information (we don't sell data)</li>
 <li>Non-discrimination for exercising your rights</li>
 </ul>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">To exercise these rights:</strong> Email <a href="mailto:privacy@huddleupus.com" className="text-[#1E90FF] hover:underline">privacy@huddleupus.com</a> with subject line "California Privacy Request." We will respond within 45 days.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">12. EUROPEAN USERS (GDPR)</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed"><strong className="text-white">If you are in the European Economic Area (EEA), you have additional rights:</strong></p>
 <p className="text-white font-semibold text-sm mt-3">Legal Basis for Processing:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Consent (you agreed to these terms)</li>
 <li>Contract performance (providing services)</li>
 <li>Legitimate interests (improving the Platform)</li>
 <li>Legal obligations</li>
 </ul>
 <p className="text-white font-semibold text-sm mt-3">Your GDPR Rights:</p>
 <ul className="text-[#A0A4AB] text-sm leading-relaxed list-disc ml-5 mt-1 space-y-1">
 <li>Right to access your data</li>
 <li>Right to rectification (correct errors)</li>
 <li>Right to erasure ("right to be forgotten")</li>
 <li>Right to restrict processing</li>
 <li>Right to data portability</li>
 <li>Right to object to processing</li>
 <li>Right to withdraw consent</li>
 </ul>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">To exercise these rights:</strong> Email <a href="mailto:privacy@huddleupus.com" className="text-[#1E90FF] hover:underline">privacy@huddleupus.com</a> with subject line "GDPR Request."</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">Data Protection Officer:</strong> <a href="mailto:privacy@huddleupus.com" className="text-[#1E90FF] hover:underline">privacy@huddleupus.com</a></p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2">You have the right to lodge a complaint with your local data protection authority.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">13. DO NOT TRACK SIGNALS</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">Our Platform does not currently respond to "Do Not Track" browser signals. We may implement this in the future.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">14. CHANGES TO THIS PRIVACY POLICY</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2"><strong className="text-white">Material changes</strong> will be communicated via: email notification, prominent notice on the Platform, pop-up notification at login.</p>
 <p className="text-[#A0A4AB] text-sm leading-relaxed mt-2 font-semibold">Continued use of the Platform after changes constitutes acceptance of the updated Privacy Policy.</p>
 </div>

 <div>
 <h3 className="text-white font-bold text-lg mb-2">15. CONTACT US</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">For questions or concerns about this Privacy Policy or our data practices:</p>
 <ul className="text-[#A0A4AB] text-sm mt-2 space-y-1">
 <li><strong className="text-white">Email:</strong> <a href="mailto:privacy@huddleupus.com" className="text-[#1E90FF] hover:underline">privacy@huddleupus.com</a></li>
 <li><strong className="text-white">Support:</strong> <a href="mailto:contact@huddleupus.com" className="text-[#1E90FF] hover:underline">contact@huddleupus.com</a></li>
 <li><strong className="text-white">Website:</strong> huddleupus.com</li>
 </ul>
 </div>

 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-5 mt-4">
 <h3 className="text-white font-bold text-sm mb-3">CONSENT</h3>
 <p className="text-[#A0A4AB] text-sm leading-relaxed font-semibold">By using Huddle Up, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and sharing of your information as described.</p>
 </div>

 </div>
 </div>
 </div>
 );

 // FEATURE 4: EMPTY PARTY STATE - When no parties exist for a game
 const EmptyPartyState = ({ gameName, onCreateParty }) => (
 <div className="bg-gradient-to-br from-[#1E90FF]/10 to-emerald-500/10 border border-[#1E90FF]/30 rounded-2xl p-8 text-center">
 <div className="text-5xl mb-4">🏟️</div>
 <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 No parties yet — but you can be the first!
 </h3>
 <p className="text-[#A0A4AB] text-sm mb-5 leading-relaxed">
 We're just launching in Boca Raton, so some days might be quiet. Create a party and we'll help promote it to local fans.
 </p>
 <button
 onClick={onCreateParty}
 className="primary-btn create-btn px-8 py-3.5 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20"
 >
 <span className="btn-icon">+</span> Create First Party
 </button>
 <p className="text-[#A0A4AB]/50 text-xs mt-3">Soft launch — early hosts get extra visibility</p>
 </div>
 );

 // Screen Components
 const CopyrightFooter = ({ light }) => (
 <div className="text-center py-4 text-xs">
 <p className="text-[#F5B400]">&copy; {new Date().getFullYear()} Huddle Up USA. All rights reserved.</p>
 <p className="mt-1 text-[#F5B400]">
 <span onClick={() => setCurrentScreen('termsOfService')} className="hover:text-[#F5B400]/80 underline cursor-pointer">Terms of Service</span>
 {' | '}
 <span onClick={() => setCurrentScreen('privacyPolicy')} className="hover:text-[#F5B400]/80 underline cursor-pointer">Privacy Policy</span>
 </p>
 </div>
 );

 const WelcomeScreen = () => (
 <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at center, #161A22 0%, #0F1115 70%)' }}>
 <div className="w-full text-center flex-1 flex flex-col items-center justify-center" style={{ gap: '48px', maxWidth: '720px' }}>
 <div className="space-y-6">
 <img src="/huddle-up-logo.png" alt="Huddle Up - Find Your Crew. Watch The Game!" className="mx-auto" style={{ width: '716px' }} />
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '448px' }}>
 <button
 onClick={() => setCurrentScreen('login')}
 className="w-full py-4 text-white font-bold text-lg transition-colors duration-200 hover:opacity-90"
 style={{ backgroundColor: '#1E90FF', borderRadius: '12px' }}
 >
 LOG IN
 </button>
 <button
 onClick={() => setCurrentScreen('signupType')}
 className="w-full py-4 font-bold text-lg transition-colors duration-200 hover:opacity-80"
 style={{ backgroundColor: 'transparent', border: '2px solid #1E90FF', color: '#1E90FF', borderRadius: '12px' }}
 >
 SIGN UP
 </button>
 </div>
 </div>
 <CopyrightFooter />
 </div>
 );

 const signupTypeScreenJSX = (
 <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at center, #161A22 0%, #0F1115 70%)' }}>
 <div className="max-w-md w-full space-y-8 flex-1 flex flex-col justify-center">
 <div className="text-center">
 <img src="/huddle-up-logo.png" alt="Huddle Up" className="h-16 mx-auto mb-4" />
 <h2 className="text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}>
 HOW WILL YOU USE HUDDLE UP?
 </h2>
 <p style={{ color: '#A0A4AB' }}>Select your account type to get started</p>
 </div>

 <div className="space-y-4">
 <button
 onClick={() => { setSignupUserType('fan'); setCurrentScreen('signup'); }}
 className="w-full p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] text-left"
 style={{ backgroundColor: 'rgba(30,144,255,0.08)', borderColor: 'rgba(30,144,255,0.3)' }}
 >
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-2xl bg-[#1E90FF]/20 flex items-center justify-center flex-shrink-0">
 <Users className="w-8 h-8 text-[#1E90FF]" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-white mb-1">Sports Fan</h3>
 <p className="text-sm text-[#A0A4AB]">Find watch parties, connect with other fans, and join the action at local venues</p>
 </div>
 </div>
 </button>

 <button
 onClick={() => { setSignupUserType('venue'); setCurrentScreen('signup'); }}
 className="w-full p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] text-left"
 style={{ backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }}
 >
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
 <Building2 className="w-8 h-8 text-green-400" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-white mb-1">I'm a Venue</h3>
 <p className="text-sm text-[#A0A4AB]">List your venue, promote games, create deals, and attract sports fans to your location</p>
 </div>
 </div>
 </button>
 </div>

 <button
 onClick={() => setCurrentScreen('welcome')}
 className="w-full py-3 text-[#A0A4AB] hover:text-white transition-colors"
 >
 &larr; Back
 </button>
 </div>
 <CopyrightFooter />
 </div>
 );

 const [loginEmail, setLoginEmail] = useState('');
 const [loginPassword, setLoginPassword] = useState('');
 const [loginShowPassword, setLoginShowPassword] = useState(false);
 const [loginRememberMe, setLoginRememberMe] = useState(true);

 const loginScreenJSX = (
 <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at center, #161A22 0%, #0F1115 70%)' }}>
 <div className="max-w-md w-full space-y-8 flex-1 flex flex-col justify-center">
 <div className="text-center">
 <h2 className="text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}>
 WELCOME BACK
 </h2>
 <p style={{ color: '#A0A4AB' }}>Log in to find watch parties</p>
 </div>
 
 <div className="p-8 space-y-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
 <div>
 <label className="block text-sm font-medium mb-2" style={{ color: '#A0A4AB' }}>Email</label>
 <input
 type="email"
 value={loginEmail}
 onChange={(e) => setLoginEmail(e.target.value)}
 className="w-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2"
 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', focusRingColor: '#1E90FF' }}
 placeholder="your@email.com"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-2" style={{ color: '#A0A4AB' }}>Password</label>
 <div className="relative">
 <input
 type={loginShowPassword ? 'text' : 'password'}
 value={loginPassword}
 onChange={(e) => setLoginPassword(e.target.value)}
 className="w-full px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2"
 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }}
 placeholder="••••••••"
 />
 <button
 type="button"
 onClick={() => setLoginShowPassword(!loginShowPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-white transition-colors p-1"
 style={{ color: '#A0A4AB' }}
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
 className="w-4 h-4 rounded border-[#222A36] bg-[#151A22]"
 style={{ accentColor: '#1E90FF' }}
 />
 <span className="text-sm" style={{ color: '#A0A4AB' }}>Remember me</span>
 </label>

 <button
 onClick={() => handleLogin(loginEmail, loginPassword, loginRememberMe)}
 className="w-full py-4 text-white font-bold text-lg transition-colors duration-200 hover:opacity-90"
 style={{ backgroundColor: '#1E90FF', borderRadius: '12px' }}
 >
 LOG IN
 </button>

 <button
 onClick={() => setCurrentScreen('forgotPassword')}
 className="w-full py-2 text-sm font-medium transition-colors hover:opacity-80"
 style={{ color: '#1E90FF' }}
 >
 Forgot your password?
 </button>

 <button
 onClick={() => setCurrentScreen('welcome')}
 className="w-full py-3 transition-colors"
 style={{ color: '#A0A4AB' }}
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
 <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at center, #161A22 0%, #0F1115 70%)' }}>
 <div className="max-w-md w-full space-y-8">
 <div className="text-center">
 <h2 className="text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}>
 {fpStep === 3 ? 'PASSWORD RESET' : 'RESET PASSWORD'}
 </h2>
 <p className="text-[#A0A4AB]">
 {fpStep === 1 && 'Enter your email to get started'}
 {fpStep === 2 && 'Enter the code and set your new password'}
 {fpStep === 3 && 'Your password has been updated!'}
 </p>
 </div>

 <div className="bg-[#151A22] backdrop-blur-lg p-8 rounded-3xl space-y-6 border border-[#222A36]">
 {fpStep === 1 && (
 <>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Email</label>
 <input
 type="email"
 value={fpEmail}
 onChange={(e) => setFpEmail(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="your@email.com"
 />
 </div>
 <button
 onClick={handleFpVerifyEmail}
 disabled={fpLoading}
 className="w-full py-4 bg-[#1E90FF] text-white font-bold text-lg rounded-2xl shadow-sm hover:opacity-90 transition-all duration-200 disabled:opacity-50"
 >
 {fpLoading ? 'VERIFYING...' : 'CONTINUE'}
 </button>
 </>
 )}

 {fpStep === 2 && (
 <>
 <div className="bg-[#1E90FF]/10 border border-[#1E90FF]/20 rounded-xl p-3 text-center">
 <span className="text-[#1E90FF] text-sm">Resetting password for {fpEmail}</span>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Verification Code</label>
 <input
 type="text"
 value={fpCode}
 onChange={(e) => setFpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] text-center text-2xl tracking-widest"
 placeholder="000000"
 maxLength={6}
 />
 <p className="text-[#A0A4AB]/70 text-xs mt-1 text-center">Check the server console for your verification code</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">New Password</label>
 <input
 type="password"
 value={fpNewPassword}
 onChange={(e) => setFpNewPassword(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="At least 6 characters"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Confirm Password</label>
 <input
 type="password"
 value={fpConfirmPassword}
 onChange={(e) => setFpConfirmPassword(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="Re-enter your password"
 />
 </div>
 <button
 onClick={handleFpReset}
 disabled={fpLoading}
 className="w-full py-4 bg-[#1E90FF] text-white font-bold text-lg rounded-2xl shadow-sm hover:opacity-90 transition-all duration-200 disabled:opacity-50"
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
 <p className="text-[#A0A4AB]">You can now log in with your new password.</p>
 <button
 onClick={() => setCurrentScreen('login')}
 className="w-full py-4 bg-[#1E90FF] text-white font-bold text-lg rounded-2xl shadow-sm hover:opacity-90 transition-all duration-200"
 >
 GO TO LOGIN
 </button>
 </div>
 )}

 {fpError && <p className="text-red-400 text-sm text-center">{fpError}</p>}

 {fpStep !== 3 && (
 <button
 onClick={() => fpStep === 1 ? setCurrentScreen('login') : setFpStep(1)}
 className="w-full py-3 text-[#A0A4AB] hover:text-white transition-colors"
 >
 ← Back
 </button>
 )}
 </div>
 </div>
 </div>
 );

 const [signupUserType, setSignupUserType] = useState('');
 const [signupVenueName, setSignupVenueName] = useState('');
 const [signupVenueAddress, setSignupVenueAddress] = useState('');
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
 const [signupInfluencerCode, setSignupInfluencerCode] = useState(initialInfluencerCode || '');
 const [signupInfluencerValid, setSignupInfluencerValid] = useState(null);
 const [signupInfluencerMsg, setSignupInfluencerMsg] = useState('');

 const handleSignupSubmit = () => {
 if (!signupUserType || !['fan', 'venue'].includes(signupUserType)) {
 alert('Please select an account type first.');
 setCurrentScreen('signupType');
 return;
 }
 if (!signupAcceptedTerms) {
 alert('You must accept the Terms of Service and Privacy Policy to sign up.');
 return;
 }
 if (!signupEmail || !signupPassword || !signupName) {
 alert('Please fill in all fields.');
 return;
 }
 if (signupUserType === 'fan') {
 if (!signupAgeConfirmed) {
 alert('You must confirm you are 21 years of age or older.');
 return;
 }
 if (!signupGender || !signupDateOfBirth) {
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
 }
 if (signupUserType === 'venue' && !signupVenueName) {
 alert('Please enter your venue name.');
 return;
 }
 handleSignUp(signupEmail, signupPassword, signupName, signupGender, signupDateOfBirth, signupRememberMe, signupReferralCode, signupUserType, signupVenueName, signupVenueAddress, signupInfluencerCode);
 };

 const signUpScreenJSX = (
 <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at center, #161A22 0%, #0F1115 70%)' }}>
 <div className="max-w-md w-full space-y-8 flex-1 flex flex-col justify-center">
 <div className="text-center">
 <img src="/huddle-up-logo.png" alt="Huddle Up" className="h-16 mx-auto mb-4" />
 <h2 className="text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}>
 {signupUserType === 'venue' ? 'REGISTER YOUR VENUE' : 'JOIN THE CREW'}
 </h2>
 <p style={{ color: '#A0A4AB' }}>
 {signupUserType === 'venue' ? 'Set up your venue account' : 'Create your fan account'}
 </p>
 <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: signupUserType === 'venue' ? 'rgba(34,197,94,0.15)' : 'rgba(30,144,255,0.15)', color: signupUserType === 'venue' ? '#4ade80' : '#1E90FF', border: `1px solid ${signupUserType === 'venue' ? 'rgba(34,197,94,0.3)' : 'rgba(30,144,255,0.3)'}` }}>
 {signupUserType === 'venue' ? <><Building2 className="w-3 h-3" /> VENUE ACCOUNT</> : <><Users className="w-3 h-3" /> FAN ACCOUNT</>}
 </div>
 </div>
 
 <div className="p-8 space-y-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
 {signupUserType === 'venue' && (
 <>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Venue Name</label>
 <input
 type="text"
 value={signupVenueName}
 onChange={(e) => setSignupVenueName(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
 placeholder="e.g., The Sports Bar & Grill"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Venue Address</label>
 <input
 type="text"
 value={signupVenueAddress}
 onChange={(e) => setSignupVenueAddress(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
 placeholder="123 Main St, City, State"
 />
 </div>
 </>
 )}

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">{signupUserType === 'venue' ? 'Contact Name' : 'Name'}</label>
 <input
 type="text"
 value={signupName}
 onChange={(e) => setSignupName(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder={signupUserType === 'venue' ? 'Your name or manager name' : 'Your name'}
 />
 </div>

 {signupUserType === 'fan' && (
 <>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Gender (shown to other attendees)</label>
 <select
 value={signupGender}
 onChange={(e) => setSignupGender(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="">Select gender...</option>
 <option value="male">Male ♂</option>
 <option value="female">Female ♀</option>
 </select>
 <p className="text-xs text-[#A0A4AB]/70 mt-1">Helps other users see group composition</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Date of Birth</label>
 <input
 type="date"
 value={signupDateOfBirth}
 onChange={(e) => setSignupDateOfBirth(e.target.value)}
 max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 <p className="text-xs text-amber-400 mt-1 font-semibold">You must be 21 or older to attend watch parties</p>
 </div>
 </>
 )}

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Email</label>
 <input
 type="email"
 value={signupEmail}
 onChange={(e) => setSignupEmail(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="your@email.com"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Password</label>
 <div className="relative">
 <input
 type={signupShowPassword ? 'text' : 'password'}
 value={signupPassword}
 onChange={(e) => setSignupPassword(e.target.value)}
 className="w-full px-4 py-3 pr-12 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="••••••••"
 />
 <button
 type="button"
 onClick={() => setSignupShowPassword(!signupShowPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A4AB] hover:text-white transition-colors p-1"
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
 className="w-4 h-4 rounded border-[#222A36] text-[#1E90FF] focus:ring-[#1E90FF] focus:ring-offset-0 bg-[#151A22]"
 />
 <span className="text-sm text-[#A0A4AB]">Remember me</span>
 </label>

 <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
 <label className="flex items-start gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={signupAcceptedTerms}
 onChange={(e) => setSignupAcceptedTerms(e.target.checked)}
 className="mt-1 w-4 h-4 rounded border-[#222A36] text-[#1E90FF] focus:ring-[#1E90FF] focus:ring-offset-0 bg-[#151A22]"
 />
 <span className="text-sm text-[#A0A4AB]">
 I agree to the{' '}
 <span onClick={(e) => { e.preventDefault(); setCurrentScreen('termsOfService'); }} className="text-[#1E90FF] hover:text-[#1E90FF]/80 underline cursor-pointer">
 Terms of Service
 </span>{' '}
 and{' '}
 <span onClick={(e) => { e.preventDefault(); setCurrentScreen('privacyPolicy'); }} className="text-[#1E90FF] hover:text-[#1E90FF]/80 underline cursor-pointer">
 Privacy Policy
 </span>
 . I understand that Huddle Up US is a platform only and is not responsible for venues, events, or user conduct.
 </span>
 </label>
 </div>

 {signupUserType === 'fan' && (
 <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
 <label className="flex items-start gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={signupAgeConfirmed}
 onChange={(e) => setSignupAgeConfirmed(e.target.checked)}
 className="mt-1 w-4 h-4 rounded border-[#222A36] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 bg-[#151A22] accent-amber-500"
 />
 <div>
 <span className="text-amber-300 font-bold text-sm">Age Verification Disclaimer</span>
 <p className="text-amber-200/70 text-xs mt-1">
 I confirm that I am 21 years of age or older. I understand that Huddle Up watch parties may take place at venues that serve alcohol, and I meet the legal age requirement to attend such establishments.
 </p>
 </div>
 </label>
 </div>
 )}

 <div>
 <label className="block text-sm font-semibold text-[#A0A4AB] mb-1">Referral Code (optional)</label>
 <input
 type="text"
 value={signupReferralCode}
 onChange={e => setSignupReferralCode(e.target.value.toUpperCase())}
 placeholder="e.g., HU-ABCD1234"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-semibold text-amber-400 mb-1">Have an influencer code? (optional)</label>
 <div className="flex gap-2">
 <input
 type="text"
 value={signupInfluencerCode}
 onChange={e => { setSignupInfluencerCode(e.target.value.toUpperCase()); setSignupInfluencerValid(null); setSignupInfluencerMsg(''); }}
 placeholder="e.g., SPORTS50"
 className="flex-1 px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
 />
 <button
 type="button"
 onClick={async () => {
 if (!signupInfluencerCode.trim()) return;
 try {
 const result = await api.affiliates.validateCode(signupInfluencerCode);
 if (result.valid) {
 setSignupInfluencerValid(true);
 setSignupInfluencerMsg(`Code applied! Get 50% off Pro — only $1.50/mo`);
 } else {
 setSignupInfluencerValid(false);
 setSignupInfluencerMsg(result.error || 'Invalid code');
 }
 } catch { setSignupInfluencerValid(false); setSignupInfluencerMsg('Could not validate code'); }
 }}
 className="px-4 py-3 bg-amber-500/20 text-amber-300 font-bold rounded-xl text-sm border border-amber-500/30 hover:bg-amber-500/30 transition-all"
 >Apply</button>
 </div>
 {signupInfluencerMsg && (
 <p className={`text-xs mt-1 ${signupInfluencerValid ? 'text-green-400' : 'text-red-400'}`}>{signupInfluencerMsg}</p>
 )}
 </div>

 <button
 onClick={handleSignupSubmit}
 disabled={!signupAcceptedTerms || (signupUserType === 'fan' && !signupAgeConfirmed)}
 className={`w-full py-4 text-white font-bold text-lg transition-colors duration-200 ${
 signupAcceptedTerms && (signupUserType === 'venue' || signupAgeConfirmed)
 ? 'hover:opacity-90'
 : 'cursor-not-allowed opacity-50'
 }`}
 style={{ backgroundColor: signupAcceptedTerms && (signupUserType === 'venue' || signupAgeConfirmed) ? (signupUserType === 'venue' ? '#22c55e' : '#1E90FF') : '#4B5563', borderRadius: '12px' }}
 >
 {signupUserType === 'venue' ? 'REGISTER VENUE' : 'SIGN UP'}
 </button>

 <button
 onClick={() => setCurrentScreen('signupType')}
 className="w-full py-3 text-[#A0A4AB] hover:text-white transition-colors"
 >
 &larr; Back
 </button>
 </div>
 </div>
 <CopyrightFooter />
 </div>
 );

 const gamesScreenJSX = () => (
 <div className="min-h-screen pt-2 pb-[72px] brand-gradient-bg">

 {showInstallBanner && !isAppInstalled && !isStandalone && (
 <div className="sticky top-[60px] left-0 right-0 z-[60]" style={{ animation: 'slideDown 300ms ease-out' }}>
 <div className="flex items-center justify-between px-4 py-3" style={{ background: 'linear-gradient(135deg, #1E90FF 0%, #F5B400 100%)' }}>
 <div className="flex items-center gap-3 flex-1 min-w-0">
 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
 <Smartphone className="w-5 h-5 text-white" />
 </div>
 <span className="text-white font-semibold text-sm truncate">Get the Huddle Up App!</span>
 </div>
 <div className="flex items-center gap-2 flex-shrink-0">
 <button onClick={handlePwaInstall} className="px-4 py-1.5 bg-white text-[#0F1115] font-bold text-xs rounded-full hover:bg-white/90 transition-colors active:scale-95">
 Install
 </button>
 <button onClick={dismissInstallBanner} className="p-1 text-white/80 hover:text-white transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 )}

 {showIosInstallModal && (
 <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" onClick={() => setShowIosInstallModal(false)}>
 <div className="bg-[#151A22] rounded-2xl w-full max-w-sm overflow-hidden border border-[#222A36]" onClick={e => e.stopPropagation()}>
 <div className="p-5 text-center" style={{ background: 'linear-gradient(135deg, #1E90FF 0%, #F5B400 100%)' }}>
 <div className="w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center">
 <img src="/pwa-icon-192.png" alt="Huddle Up" className="w-12 h-12 rounded-xl" />
 </div>
 <h3 className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>INSTALL HUDDLE UP</h3>
 <p className="text-white/80 text-xs mt-1">Add to your home screen for the best experience</p>
 </div>
 <div className="p-5 space-y-4">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-full bg-[#1E90FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
 <span className="text-[#1E90FF] font-bold text-sm">1</span>
 </div>
 <div>
 <p className="text-white font-semibold text-sm">Tap the Share button</p>
 <p className="text-[#A0A4AB] text-xs mt-0.5">Look for the <span className="inline-block px-1.5 py-0.5 bg-[#222A36] rounded text-white text-xs">⬆ Share</span> icon at the bottom of Safari</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-full bg-[#1E90FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
 <span className="text-[#1E90FF] font-bold text-sm">2</span>
 </div>
 <div>
 <p className="text-white font-semibold text-sm">Scroll down & tap "Add to Home Screen"</p>
 <p className="text-[#A0A4AB] text-xs mt-0.5">Look for the <span className="inline-block px-1.5 py-0.5 bg-[#222A36] rounded text-white text-xs">+ Add to Home Screen</span> option</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-full bg-[#1E90FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
 <span className="text-[#1E90FF] font-bold text-sm">3</span>
 </div>
 <div>
 <p className="text-white font-semibold text-sm">Tap "Add" in the top right</p>
 <p className="text-[#A0A4AB] text-xs mt-0.5">Huddle Up will appear on your home screen like a native app!</p>
 </div>
 </div>
 </div>
 <div className="px-5 pb-5">
 <button onClick={() => setShowIosInstallModal(false)} className="w-full py-3 bg-[#1E90FF] hover:bg-[#1E90FF]/80 text-white font-bold text-sm rounded-xl transition-colors active:scale-[0.98]">
 Got It!
 </button>
 </div>
 </div>
 </div>
 )}

 <div className="max-w-4xl mx-auto px-4">

{/* SOFT LAUNCH BANNER */}
{!softLaunchDismissed && (
<div className="mb-3 relative overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #1E90FF 0%, #0066CC 50%, #F5B400 100%)' }}>
<button onClick={() => { setSoftLaunchDismissed(true); localStorage.setItem('softlaunch_banner_dismissed', JSON.stringify({ time: Date.now() })); }} className="absolute top-2 right-2 text-white/60 hover:text-white z-10">
<X className="w-4 h-4" />
</button>
<div className="p-3 flex items-center gap-3">
<Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
<div className="flex-1 min-w-0">
<p className="text-white font-bold text-sm">Soft Launch — Boca Raton</p>
<p className="text-white/80 text-xs">First 100 members get Lifetime Pro FREE + Founder badge</p>
</div>
<div className="text-white/70 text-xs font-bold flex-shrink-0">{softLaunchStats.users}/100</div>
</div>
</div>
)}

<div className="grid grid-cols-2 gap-3 mb-3">
<button type="button" onClick={scrollToFindYourSport} className="relative overflow-hidden rounded-2xl border border-[#1E90FF]/40 bg-gradient-to-br from-[#1E90FF]/20 to-[#151A22] p-4 text-center hover:border-[#1E90FF]/60 transition-all active:scale-[0.97] cursor-pointer" style={{ minHeight: '80px' }}>
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 bg-gradient-to-br from-[#1E90FF] to-[#1565C0] rounded-xl flex items-center justify-center shadow-lg shadow-[#1E90FF]/30">
<Plus className="w-6 h-6 text-white" />
</div>
<div>
<div className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>CREATE PARTY</div>
<div className="text-[#1E90FF]/70 text-sm font-semibold">Pick a game below</div>
</div>
</div>
</button>
<button onClick={() => { setCurrentScreen('findParties'); window.scrollTo(0,0); }} className="relative overflow-hidden rounded-2xl border border-[#FFD700]/40 bg-gradient-to-br from-[#FFD700]/15 to-[#151A22] p-4 text-center hover:border-[#FFD700]/60 transition-all active:scale-[0.97]" style={{ minHeight: '80px' }}>
<div className="flex flex-col items-center gap-2">
<div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#F5A623] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFD700]/30">
<Search className="w-6 h-6 text-white" />
</div>
<div>
<div className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>FIND PARTIES</div>
{(() => { const upcoming = parties.filter(p => new Date(p.gameTime) >= new Date()).length; return upcoming > 0 ? <div className="text-[#FFD700]/70 text-xs font-semibold">{upcoming} near you</div> : <div className="text-white/50 text-xs">Join a watch party</div>; })()}
</div>
</div>
</button>
</div>


 {lastChanceParties.length > 0 && (
 <div className="mb-4 rounded-2xl overflow-hidden border border-red-500/30 bg-gradient-to-r from-red-900/30 via-[#151A22] to-pink-900/20">
   <div className="px-4 pt-3 pb-2 flex items-center gap-2">
     <Clock className="w-5 h-5 text-red-400 animate-pulse" />
     <h3 className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>LAST CHANCE — STARTING SOON</h3>
   </div>
   <div className="px-4 pb-3 space-y-2">
     {lastChanceParties.map(lp => {
       const gt = new Date(lp.gameTime);
       const diff = gt - new Date();
       const isLiveNow = diff <= 0;
       const mins = Math.max(0, Math.floor(diff / 60000));
       const hrs = Math.floor(mins / 60);
       const remMins = mins % 60;
       const countdown = isLiveNow ? 'STARTING NOW!' : hrs > 0 ? `${hrs}h ${remMins}m` : `${mins}m`;
       return (
         <div key={lp.id} onClick={() => { const g = games.find(g => g.id === lp.gameId) || { id: lp.gameId, sport: lp.sport, homeTeam: lp.homeTeam, awayTeam: lp.awayTeam, startTime: lp.gameTime }; setSelectedGame(g); setCurrentScreen('gameDetail'); }}
           className={`p-3 rounded-xl cursor-pointer active:scale-[0.99] transition-all ${isLiveNow ? 'bg-red-500/20 border border-red-500/40' : 'bg-[#151A22] border border-[#222A36] hover:border-red-500/30'}`}>
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 min-w-0">
               {isLiveNow && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full live-badge-pulse">LIVE</span>}
               <span className="text-white font-bold text-sm truncate">{lp.awayTeam} @ {lp.homeTeam}</span>
             </div>
             <span className={`text-xs font-black px-2 py-1 rounded-full flex-shrink-0 ${isLiveNow ? 'bg-red-500 text-white live-badge-pulse' : 'bg-red-500/20 text-red-400'}`}>{countdown}</span>
           </div>
           <div className="flex items-center gap-3 mt-1.5 text-xs text-[#A0A4AB]">
             <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" />{lp.venueName || 'TBD'}</span>
             <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#1E90FF]" />{lp.attendeeCount} going</span>
           </div>
           <div className="mt-2">
           {userParties.includes(lp.id) || justJoinedPartyId === lp.id ? (
             <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Joined</span>
           ) : (
             <button onClick={(e) => { e.stopPropagation(); handleJoinParty(lp.id); }} disabled={joiningPartyId === lp.id} className="w-full py-2 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white font-bold text-sm rounded-lg shadow-lg shadow-[#1E90FF]/20 hover:shadow-[#1E90FF]/40 transition-all active:scale-[0.97]">
               {joiningPartyId === lp.id ? 'Joining...' : 'Join This Party'}
             </button>
           )}
           </div>
         </div>
       );
     })}
   </div>
 </div>
 )}

 {hotParties.length > 0 && (
 <div className="mb-4 rounded-2xl overflow-hidden border border-orange-500/30 bg-gradient-to-br from-orange-900/30 via-[#151A22] to-amber-900/20">
   <div className="px-4 pt-3 pb-2 flex items-center gap-2">
     <Flame className="w-5 h-5 text-orange-400" />
     <h3 className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>TRENDING PARTIES RIGHT NOW</h3>
   </div>
   <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
     {hotParties.map(hp => {
       const gt = new Date(hp.gameTime);
       const isLive = gt <= new Date() && new Date(gt.getTime() + 10800000) >= new Date();
       return (
         <div key={hp.id} onClick={() => { const g = games.find(g => g.id === hp.gameId) || { id: hp.gameId, sport: hp.sport, homeTeam: hp.homeTeam, awayTeam: hp.awayTeam, startTime: hp.gameTime }; setSelectedGame(g); setCurrentScreen('gameDetail'); }}
           className="p-3 rounded-xl bg-[#151A22] border border-[#222A36] hover:border-orange-500/40 cursor-pointer active:scale-[0.99] transition-all">
           <div className="flex items-center gap-2 mb-1.5">
             <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black rounded-full animate-pulse flex items-center gap-1"><Flame className="w-2.5 h-2.5" />TRENDING</span>
             {isLive && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">LIVE</span>}
           </div>
           <p className="text-white font-bold text-sm">{hp.awayTeam} @ {hp.homeTeam}</p>
           <div className="flex items-center gap-3 mt-1 text-xs text-[#A0A4AB]">
             <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" />{hp.venueName || 'TBD'}</span>
             <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#1E90FF]" />{hp.attendeeCount} fans</span>
           </div>
           <p className="text-xs text-orange-400/60 mt-1">{gt.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
           <div className="mt-2">
           {userParties.includes(hp.id) || justJoinedPartyId === hp.id ? (
             <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Joined</span>
           ) : (
             <button onClick={(e) => { e.stopPropagation(); handleJoinParty(hp.id); }} disabled={joiningPartyId === hp.id} className="w-full py-2 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white font-bold text-sm rounded-lg shadow-lg shadow-[#1E90FF]/20 hover:shadow-[#1E90FF]/40 transition-all active:scale-[0.97]">
               {joiningPartyId === hp.id ? 'Joining...' : 'Join This Party'}
             </button>
           )}
           </div>
         </div>
       );
     })}
   </div>
 </div>
 )}

 <div className="mt-5 mb-[10px]">
 {user?.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 ? (
 <button
 onClick={() => setMyTeamsOnly(!myTeamsOnly)}
 className={`w-full h-[45px] rounded-[10px] font-semibold text-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
 myTeamsOnly
 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
 : 'bg-[#151A22] text-[#A0A4AB] hover:bg-[#222A36] border border-[#222A36]'
 }`}
 >
 <Star className={`w-4 h-4 ${myTeamsOnly ? 'fill-white' : ''}`} />
 My Teams ({Object.keys(user.favoriteTeams).length})
 </button>
 ) : (
 <button
 onClick={() => setCurrentScreen('profile')}
 className="w-full h-[45px] rounded-[10px] font-semibold text-sm bg-[#151A22] text-[#A0A4AB] hover:bg-[#222A36] border border-[#222A36] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
 >
 <Star className="w-4 h-4" />
 My Teams
 </button>
 )}
 </div>

 {/* SECTION DIVIDER */}
 <div className="glow-divider my-[15px]" />

 {/* ROW 2: SEARCH BAR + FILTER BUTTON */}
 <div className="flex gap-2 mb-[15px]">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A4AB]" />
 <DebouncedInput
 type="text"
 value={searchTerm}
 onChange={(val) => setSearchTerm(val)}
 delay={300}
 placeholder="Search teams..."
 className="w-full pl-9 pr-3 h-[50px] bg-[#151A22] border border-[#222A36] rounded-[10px] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <button
 onClick={() => setShowFilterPanel(!showFilterPanel)}
 className={`h-[50px] w-[50px] flex-shrink-0 flex items-center justify-center rounded-[10px] transition-all active:scale-[0.95] ${
   showFilterPanel || hasActiveFilters
     ? 'bg-[#1E90FF] text-white shadow-sm shadow-[#1E90FF]/30'
     : 'bg-[#151A22] border border-[#222A36] text-[#A0A4AB] hover:border-[#1E90FF]/40 hover:text-[#1E90FF]'
 }`}
 >
 <Filter className="w-5 h-5" />
 {hasActiveFilters && !showFilterPanel && (
   <span className="absolute top-1 right-1 w-2 h-2 bg-[#1E90FF] rounded-full" />
 )}
 </button>
 </div>

 {showFilterPanel && (
 <div className="mb-[15px] p-4 bg-[#151A22] border border-[#222A36] rounded-[12px] space-y-4" style={{ animation: 'slideDown 200ms ease-out' }}>
 <div>
 <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Date</h4>
 <div className="flex flex-wrap gap-2">
 {['All', 'Today', 'Tomorrow', 'This Weekend', 'This Week', 'Next Week'].map(d => (
   <button
     key={d}
     onClick={() => setDateFilter(d)}
     className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.95] ${
       dateFilter === d
         ? 'bg-[#1E90FF] text-white'
         : 'bg-[#0F1115] text-[#A0A4AB] border border-[#222A36] hover:border-[#1E90FF]/40'
     }`}
   >
     {d}
   </button>
 ))}
 </div>
 </div>
 <div>
 <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Sort By</h4>
 <div className="flex flex-wrap gap-2">
 {['Soonest', 'Most Popular', 'Newest'].map(s => (
   <button
     key={s}
     onClick={() => setSortOption(s)}
     className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.95] ${
       sortOption === s
         ? 'bg-[#1E90FF] text-white'
         : 'bg-[#0F1115] text-[#A0A4AB] border border-[#222A36] hover:border-[#1E90FF]/40'
     }`}
   >
     {s}
   </button>
 ))}
 </div>
 </div>
 {hasActiveFilters && (
 <button
   onClick={() => { setDateFilter('All'); setSortOption('Soonest'); setSelectedSports([]); setSearchTerm(''); }}
   className="text-red-400 text-xs font-bold hover:text-red-300 transition-colors"
 >
   Clear All Filters
 </button>
 )}
 </div>
 )}

 {hasActiveFilters && (
 <div className="flex flex-wrap gap-2 mb-[15px]">
{selectedSports.length > 0 && selectedSports.map(sp => (
   <span key={sp} className="inline-flex items-center gap-1 px-3 py-1 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-full border border-[#1E90FF]/30">
     {SPORT_ICONS[sp] || '🏅'} {sp}
     <button onClick={() => setSelectedSports(prev => prev.filter(s => s !== sp))} className="ml-1 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
   </span>
))}
 {dateFilter !== 'All' && (
   <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
     <Calendar className="w-3 h-3" /> {dateFilter}
     <button onClick={() => setDateFilter('All')} className="ml-1 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
   </span>
 )}
 {sortOption !== 'Soonest' && (
   <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
     {sortOption}
     <button onClick={() => setSortOption('Soonest')} className="ml-1 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
   </span>
 )}
 {searchTerm.trim() !== '' && (
   <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-full border border-orange-500/30">
     <Search className="w-3 h-3" /> "{searchTerm}"
     <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
   </span>
 )}
 </div>
 )}

 <div className="glow-divider my-[15px]" />

 <h2 id="find-your-sport" className="text-white font-bold text-2xl mb-[15px] uppercase tracking-[1px] section-header-glow" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em', scrollMarginTop: '116px' }}>FIND YOUR SPORT</h2>
 <div className="relative" data-tour-id="sports-scroller">
 <div
 ref={sportsScrollRef}
 onScroll={() => {
 if (sportsScrollRef.current) {
 const el = sportsScrollRef.current;
 setShowSportsScrollArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
 }
 }}
 className="flex gap-[12px] overflow-x-auto pb-3 scrollbar-hide"
 >
 {(() => {
 const liveSports = new Set(games.filter(g => g.gameStatus === 'live').map(g => g.sport));
 const activeSports = new Set(games.map(g => g.sport));
 const sorted = ['All', ...SPORTS.filter(s => s !== 'All' && liveSports.has(s)), ...SPORTS.filter(s => s !== 'All' && !liveSports.has(s) && activeSports.has(s)), ...SPORTS.filter(s => s !== 'All' && !activeSports.has(s))];
 const unique = [...new Set(sorted)];
 return unique.map(sport => {
 const isLive = liveSports.has(sport);
 return (
 <button
 key={sport}
 onClick={() => { if (sport === 'All') { setSelectedSports([]); } else { setSelectedSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]); } }}
 className={`flex flex-col items-center justify-center min-w-[60px] px-2 py-2 rounded-[10px] font-bold transition-all active:scale-[0.98] ${
 (sport === 'All' && selectedSports.length === 0) || (sport !== 'All' && selectedSports.includes(sport))
 ? 'bg-[#1E90FF] text-white shadow-sm shadow-[#1E90FF]/30 sport-pill-active'
 : isLive
 ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 sport-pill-live'
 : !activeSports.has(sport) && sport !== 'All'
 ? 'bg-[#151A22]/50 text-[#A0A4AB]/50'
 : 'bg-[#151A22] text-[#A0A4AB] hover:bg-[#222A36]'
 }`}
 >
 <span className="text-lg leading-none">{SPORT_ICONS[sport] || '🏅'}</span>
 <span className="text-[11px] font-semibold leading-tight mt-[6px] text-center whitespace-nowrap">{({'College Football':'NCAAF','College Basketball':'NCAA BB','Champions League':'CHL','Premier League':'EPL','Formula 1':'F1'})[sport] || sport}</span>
 {isLive && sport !== 'All' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mt-0.5" />}
 </button>
 );
 });
 })()}
 </div>
 {showSportsScrollArrow && (
 <button
 onClick={() => {
 if (sportsScrollRef.current) {
 sportsScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
 }
 }}
 className="absolute right-0 top-0 bottom-2 w-10 flex items-center justify-end bg-gradient-to-l from-[#0F1115] via-[#0F1115]/95 to-transparent pr-0.5"
 >
 <span className="w-6 h-6 rounded-full bg-[#1E90FF]/20 border border-[#1E90FF]/40 flex items-center justify-center">
 <svg className="w-3 h-3 text-[#1E90FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
 </svg>
 </span>
 </button>
 )}
 </div>

 </div>

 <div className="max-w-4xl mx-auto px-4 pt-4 pb-2" data-tour-id="game-cards">
 <div className="flex items-center justify-between mb-3">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-lg">👇</span>
 <span className="text-white font-black text-base uppercase tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Tap Any Game to Start a Watch Party</span>
 </div>
 <span className="text-[#A0A4AB] text-xs">({filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'})</span>
 </div>
 {hasActiveFilters && (
   <button onClick={() => { setDateFilter('All'); setSortOption('Soonest'); setSelectedSports([]); setSearchTerm(''); setMyTeamsOnly(false); }} className="text-[#1E90FF] text-xs font-bold hover:text-[#1E90FF]/80 transition-colors">
     Clear Filters
   </button>
 )}
 </div>
 {filteredGames.length === 0 && (
 <div className="flex flex-col items-center justify-center py-12 text-center">
   <div className="w-14 h-14 bg-[#222A36] rounded-full flex items-center justify-center mb-3">
     <Search className="w-7 h-7 text-[#A0A4AB]/50" />
   </div>
   <h3 className="text-white font-bold text-base mb-1">No games match your search</h3>
   <p className="text-[#A0A4AB] text-xs max-w-xs mb-3">Try adjusting your filters or search term</p>
   <button
     onClick={() => { setDateFilter('All'); setSortOption('Soonest'); setSelectedSports([]); setSearchTerm(''); setMyTeamsOnly(false); }}
     className="px-4 py-1.5 bg-[#1E90FF] text-white font-bold text-xs rounded-full hover:bg-[#1E90FF]/80 transition-colors active:scale-[0.95]"
   >
     Clear All Filters
   </button>
 </div>
 )}
 {filteredGames.length > 0 && (
 <>
 <div className="overflow-x-auto scrollbar-hide pb-2" id="games-scroll-container" onScroll={(e) => { const el = e.target; const scrollPercentage = el.scrollLeft / (el.scrollWidth - el.clientWidth); const totalDots = Math.min(Math.ceil(filteredGames.length / 2), 8); const activeIdx = Math.round(scrollPercentage * (totalDots - 1)); const dotsEl = document.getElementById('games-scroll-dots'); if (dotsEl) { dotsEl.dataset.active = activeIdx; dotsEl.querySelectorAll('[data-dot]').forEach((d, i) => { d.className = i === activeIdx ? 'w-5 h-1.5 rounded-full bg-[#1E90FF] transition-all duration-300' : 'w-1.5 h-1.5 rounded-full bg-white/20 transition-all duration-300'; }); } }}>
 <div className="flex gap-3 w-max">
 {filteredGames.map(game => {
 const gameParties = getPartiesForGame(game.id);
 return (
 <div
 key={game.id}
 onClick={() => {
 setSelectedGame(game);
 setCurrentScreen('gameDetail');
 window.scrollTo(0, 0);
 }}
 className={`flex-shrink-0 w-[300px] bg-[#151A22] p-5 rounded-2xl border border-[#222A36] hover:border-[#1E90FF]/50 cursor-pointer active:scale-[0.98] transition-all duration-200 sport-card-glow ${game.gameStatus === 'live' ? 'sport-card-live' : ''}`}
 >
 <div className="flex items-center justify-between mb-2">
 <span className="px-2.5 py-1 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-full border border-[#1E90FF]/30">
 {game.sport}
 </span>
 <div className="flex items-center gap-1.5">
 {gameParties.length > 0 && (
 <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
 {gameParties.length} {gameParties.length === 1 ? 'Party' : 'Parties'}
 </span>
 )}
 <button
 onClick={(e) => { e.stopPropagation(); loadGames(); }}
 className="p-1 rounded-full text-[#A0A4AB]/50 hover:text-[#1E90FF] transition-all active:rotate-180"
 title="Refresh scores"
 >
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 </button>
 {user && (
 <button
 onClick={(e) => { e.stopPropagation(); toggleWatchGame(game); }}
 className={`p-1 rounded-full transition-all ${
 watchedGames.includes(game.id)
 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
 : 'text-[#A0A4AB]/50 hover:text-yellow-400'
 }`}
 >
 <svg className="w-3.5 h-3.5" fill={watchedGames.includes(game.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
 </svg>
 </button>
 )}
 </div>
 </div>

 <div className="text-center mb-3">
 {game.gameStatus === 'live' || game.gameStatus === 'final' ? (
 <div>
 <div className="flex items-center justify-center gap-2 mb-2">
 <div className="flex-1 flex flex-col items-center gap-1.5">
 {game.homeLogo && <img src={game.homeLogo} alt="" className="w-16 h-16 object-contain drop-shadow-lg" />}
 <span className="text-base font-black text-white text-center leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>{game.homeTeam}</span>
 </div>
 <div className={`text-3xl font-black flex-shrink-0 ${game.gameStatus === 'live' ? 'score-led' : ''}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <span className={game.homeScore > game.awayScore ? 'text-emerald-400' : 'text-white'}>{game.homeScore}</span>
 <span className="text-[#A0A4AB]/70 mx-1">-</span>
 <span className={game.awayScore > game.homeScore ? 'text-emerald-400' : 'text-white'}>{game.awayScore}</span>
 </div>
 <div className="flex-1 flex flex-col items-center gap-1.5">
 {game.awayLogo && <img src={game.awayLogo} alt="" className="w-16 h-16 object-contain drop-shadow-lg" />}
 <span className="text-base font-black text-white text-center leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>{game.awayTeam}</span>
 </div>
 </div>
 <span className={`px-3 py-1 text-xs font-bold rounded-full ${game.gameStatus === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30 live-badge-pulse' : 'bg-gray-500/20 text-[#A0A4AB] border border-gray-500/30'}`}>
 {game.statusDetail}
 </span>
 </div>
 ) : (
 <div className="flex items-center justify-center gap-3 mb-2">
 <div className="flex-1 flex flex-col items-center gap-1.5">
 {game.homeLogo && <img src={game.homeLogo} alt="" className="w-16 h-16 object-contain drop-shadow-lg" />}
 <span className="text-base font-black text-white text-center leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>{game.homeTeam}</span>
 </div>
 <span className="text-xl font-black text-[#1E90FF] flex-shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>VS</span>
 <div className="flex-1 flex flex-col items-center gap-1.5">
 {game.awayLogo && <img src={game.awayLogo} alt="" className="w-16 h-16 object-contain drop-shadow-lg" />}
 <span className="text-base font-black text-white text-center leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>{game.awayTeam}</span>
 </div>
 </div>
 )}
 <div className="flex flex-col items-center gap-0.5 text-[#A0A4AB] text-sm mt-1">
 <div className="flex items-center gap-1">
 <Calendar className="w-3 h-3" />
 {formatDateTime(game.startTime)}
 </div>
 {game.broadcast && (
 <span className="text-[#1E90FF] text-[10px]">{game.broadcast}</span>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 <div id="games-scroll-dots" className="flex items-center justify-center gap-1.5 pt-3 pb-1">
 {Array.from({ length: Math.min(Math.ceil(filteredGames.length / 2), 8) }).map((_, i) => (
   <div key={i} data-dot className={i === 0 ? 'w-5 h-1.5 rounded-full bg-[#1E90FF] transition-all duration-300' : 'w-1.5 h-1.5 rounded-full bg-white/20 transition-all duration-300'} />
 ))}
 </div>
 <p className="text-center text-[#A0A4AB]/60 text-[10px] pb-1">Swipe to see more games</p>
 </>
 )}
 </div>

 {/* MAIN SPONSOR BANNER - 5 slots per sport (visible to all users) */}
 {(() => {
 const sponsors = getSponsorsForSport(selectedSports.length === 1 ? selectedSports[0] : 'All');
 const sponsor = sponsors[sponsorIndex % sponsors.length];
 return (
 <div className="max-w-4xl mx-auto px-4 pt-3 pb-2">
 <div
 className={`relative overflow-hidden rounded-[10px] border ${sponsor.borderColor} bg-gradient-to-r ${sponsor.color} transition-all duration-200`}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sponsor-shimmer pointer-events-none" />
 <div className="relative flex items-center">
 <div className="flex-shrink-0 w-[28%] bg-black/20 flex items-center justify-center overflow-hidden rounded-l-[10px] h-[56px]">
 {sponsor.logoUrl ? (
 <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
 ) : null}
 {sponsor.icon && !sponsor.logoUrl ? (
 <span className="text-3xl">{sponsor.icon}</span>
 ) : null}
 {sponsor.logoUrl ? (
 <span className="text-3xl hidden items-center justify-center">{SPORT_ICONS[selectedSports[0] || 'All'] || '📢'}</span>
 ) : null}
 </div>
 <div className="flex-1 flex flex-col justify-center px-3 py-2 min-w-0">
 <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
 {sponsor.tier === 'premium' && (
 <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-yellow-300 text-[9px] font-bold uppercase rounded tracking-wider flex items-center gap-0.5">
 <Star className="w-2.5 h-2.5" fill="currentColor" /> Premium
 </span>
 )}
 {sponsor.isDemo && (
 <span className="px-1.5 py-0.5 bg-[#1E90FF]/20 text-[#1E90FF]/80 text-[9px] font-bold uppercase rounded tracking-wider">
 Example
 </span>
 )}
 {sponsor.isEmpty && (
 <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase rounded tracking-wider animate-pulse">
 Available
 </span>
 )}
 </div>
 <h3 className="text-white font-extrabold text-sm truncate leading-tight">{sponsor.name}</h3>
 <p className="text-gray-200 text-[11px] truncate">{sponsor.tagline}</p>
 <div className="flex gap-1 mt-1.5">
 {sponsors.map((_, i) => (
 <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === sponsorIndex % sponsors.length ? 'bg-white w-4' : 'bg-white/25 w-1'}`} />
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 })()}

 {/* SPECIAL EVENTS - Big games, finals, playoffs */}
 {(() => {
 const MAJOR_SPORTS = new Set(['UFC', 'Boxing', 'Formula 1', 'Champions League', 'FIFA World Cup', 'UFC/MMA']);
 const BIG_EVENT_KEYWORDS = ['playoff', 'finals', 'championship', 'super bowl', 'world series', 'stanley cup', 'all-star', 'bowl game', 'march madness', 'title fight', 'main event', 'grand prix', 'semi-final', 'semifinal', 'quarter-final', 'quarterfinal', 'conference final', 'wild card', 'elimination'];
 const isBigEvent = (g) => { const text = `${g.homeTeam || ''} ${g.awayTeam || ''} ${g.title || ''} ${g.headline || ''} ${g.notes || ''}`.toLowerCase(); return MAJOR_SPORTS.has(g.sport) || BIG_EVENT_KEYWORDS.some(kw => text.includes(kw)); };
 const upcomingMajor = games
   .filter(g => g.gameStatus === 'scheduled' && isBigEvent(g) && new Date(g.startTime) > new Date())
   .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
   .slice(0, 10);
 if (upcomingMajor.length === 0) return null;
const GRADIENT_MAP = {
  'UFC': 'from-red-900/80 to-red-700/40', 'UFC/MMA': 'from-red-900/80 to-red-700/40',
  'Boxing': 'from-amber-900/80 to-amber-700/40',
  'Formula 1': 'from-red-800/80 to-gray-900/60', 'F1': 'from-red-800/80 to-gray-900/60',
  'Champions League': 'from-blue-900/80 to-indigo-800/40',
  'FIFA World Cup': 'from-green-900/80 to-emerald-700/40',
  'NFL': 'from-green-900/80 to-emerald-800/40', 'NBA': 'from-orange-900/80 to-red-800/40',
  'MLB': 'from-blue-900/80 to-red-800/40', 'NHL': 'from-slate-900/80 to-blue-900/40',
  'MLS': 'from-emerald-900/80 to-green-700/40',
  'College Football': 'from-amber-900/80 to-orange-800/40', 'College Basketball': 'from-orange-900/80 to-amber-800/40',
  'Premier League': 'from-purple-900/80 to-indigo-800/40',
};
const BORDER_MAP = {
  'UFC': 'border-red-500/40', 'UFC/MMA': 'border-red-500/40',
  'Boxing': 'border-amber-500/40',
  'Formula 1': 'border-red-500/30', 'F1': 'border-red-500/30',
  'Champions League': 'border-blue-500/40',
  'FIFA World Cup': 'border-green-500/40',
  'NFL': 'border-green-500/40', 'NBA': 'border-orange-500/40',
  'MLB': 'border-blue-500/40', 'NHL': 'border-slate-400/40',
  'MLS': 'border-emerald-500/40',
  'College Football': 'border-amber-500/40', 'College Basketball': 'border-orange-500/40',
  'Premier League': 'border-purple-500/40',
};
 return (
   <div className="max-w-4xl mx-auto px-4 py-5">
   <div className="glow-divider-amber mb-[15px]" />
   <div className="flex items-center justify-between mb-[15px]">
   <h3 className="text-white font-bold text-lg flex items-center gap-2 uppercase tracking-[1px] section-header-glow" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
   <Flame className="w-5 h-5 text-orange-400" />
   SPECIAL EVENTS
   </h3>
   <span className="text-[10px] text-white/40 font-semibold">{upcomingMajor.length} events</span>
   </div>
   <div className="overflow-x-auto scrollbar-hide">
   <div className="flex gap-[15px] w-max pb-1">
   {upcomingMajor.map((event) => {
   const eventDate = new Date(event.startTime);
   const timeStr = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
   const timeOfDay = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
   return (
   <div
   key={event.id}
   onClick={() => { setSelectedGame(event); setCurrentScreen('gameDetail'); window.scrollTo(0, 0); }}
   className={`flex-shrink-0 w-64 p-[15px] rounded-[12px] border ${BORDER_MAP[event.sport] || 'border-[#222A36]'} bg-gradient-to-br ${GRADIENT_MAP[event.sport] || 'from-[#151A22] to-[#0F1115]'} cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
   >
   <div className="flex items-center justify-between mb-2">
   <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{event.sport}</span>
   <span className="text-lg">{SPORT_ICONS[event.sport] || '🏅'}</span>
   </div>
   {event.eventTitle ? (
   <p className="text-white/50 text-[10px] font-bold mb-0.5">{event.eventTitle}</p>
   ) : null}
   <div className="flex items-center gap-3 my-1.5">
   {(() => { const homeLogo = event.homeLogo || getTeamLogoUrl(event.sport, event.homeTeam); const awayLogo = event.awayLogo || getTeamLogoUrl(event.sport, event.awayTeam); return (
   <>
   <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
   {homeLogo ? <img src={homeLogo} alt="" className="w-14 h-14 object-contain drop-shadow-md" onError={(e) => e.target.style.display='none'} /> : <span className="text-3xl">{SPORT_ICONS[event.sport] || '🏅'}</span>}
   <span className="text-white font-black text-xs leading-tight text-center truncate w-full uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{event.homeTeam}</span>
   </div>
   <span className="text-white/40 font-black text-sm flex-shrink-0">VS</span>
   <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
   {awayLogo ? <img src={awayLogo} alt="" className="w-14 h-14 object-contain drop-shadow-md" onError={(e) => e.target.style.display='none'} /> : <span className="text-3xl">{SPORT_ICONS[event.sport] || '🏅'}</span>}
   <span className="text-white/70 font-black text-xs leading-tight text-center truncate w-full uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{event.awayTeam}</span>
   </div>
   </>
   ); })()}
   </div>
   <div className="flex items-center gap-2 mt-2">
   <Calendar className="w-3 h-3 text-white/50" />
   <span className="text-white/70 text-[11px]">{timeStr} • {timeOfDay}</span>
   </div>
   {event.venue && (
   <div className="flex items-center gap-2 mt-0.5">
   <MapPin className="w-3 h-3 text-white/50" />
   <span className="text-white/50 text-[10px] truncate">{event.venue}</span>
   </div>
   )}
   </div>
   );
   })}
   </div>
   </div>
   </div>
 );
 })()}

{(() => {
const adSlots = [
{ id: 'slot1', title: 'NFL Watch Party Sponsor', sport: 'NFL', image: adNFL, available: true },
{ id: 'slot2', title: 'NBA Game Night Sponsor', sport: 'NBA', image: adNBA, available: true },
{ id: 'slot3', title: 'Official Game Night Sponsor', sport: 'MLB', image: adMLB, available: true },
{ id: 'slot4', title: 'NHL Game Night Sponsor', sport: 'NHL', image: adNHL, available: true },
{ id: 'main', title: 'Host Your Watch Party Here', sport: 'Main', image: adMain, available: true, featured: true }
];
return (
<div className="ad-carousel-wrap">
<div className="ad-carousel-track"
onTouchStart={(e) => { adTouchStartRef.current = e.touches[0].clientX; }}
onTouchEnd={(e) => { const diff = adTouchStartRef.current - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) { setAdSlideIndex(prev => diff > 0 ? (prev + 1) % adSlots.length : (prev - 1 + adSlots.length) % adSlots.length); } }}
>
<div className="ad-carousel-slides" style={{ transform: `translateX(-${adSlideIndex * 100}%)` }}>
{adSlots.map((ad) => (
<div key={ad.id} className="ad-slide" style={{ padding: 0, minHeight: 'auto', background: 'none' }}>
<div className="relative w-full">
<img src={ad.image} alt={ad.title} className="w-full h-auto rounded-2xl" style={{ display: 'block' }} />
<div className="absolute top-3 left-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-lg">Available</div>
<button onClick={() => { if (window.confirm('Interested in sponsoring? Contact us at sponsors@huddleupusa.com')) { window.location.href = 'mailto:sponsors@huddleupusa.com?subject=Sponsor Inquiry - ' + ad.title; } }} className="absolute bottom-3 right-3 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 bg-white/90 text-gray-900 backdrop-blur-sm shadow-lg hover:bg-white">
Become a Sponsor →
</button>
</div>
</div>
))}
</div>
</div>
<div className="ad-carousel-dots" role="tablist" aria-label="Ad carousel">
{adSlots.map((slot, i) => (
<button key={i} role="tab" aria-selected={i === adSlideIndex} aria-label={`Sponsor slot ${i + 1}: ${slot.title}`} className={`ad-dot ${i === adSlideIndex ? 'active' : ''}`} onClick={() => setAdSlideIndex(i)} />
))}
</div>
</div>
);
})()}

{(() => {
 const wcStart = new Date('2026-06-11T19:00:00Z');
 const diff = wcStart.getTime() - wcTick;
 if (diff <= 0) return null;
 const days = Math.floor(diff / 86400000);
 const hrs = Math.floor((diff % 86400000) / 3600000);
 const mins = Math.floor((diff % 3600000) / 60000);
 const secs = Math.floor((diff % 60000) / 1000);
 return (
 <div className="max-w-4xl mx-auto px-4 pb-2">
 <div
 onClick={() => { setSelectedSports(['FIFA World Cup']); setCurrentScreen('games'); window.scrollTo(0,0); }}
 className="mb-3 relative overflow-hidden rounded-2xl border border-emerald-500/40 cursor-pointer hover:border-emerald-400/60 transition-all active:scale-[0.99]"
 style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 30%, #047857 60%, #059669 100%)' }}
 >
 <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
 <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
 <div className="relative p-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
 <img src="https://flagcdn.com/w80/us.png" alt="USA" className="w-5 h-4 object-cover rounded-sm" onError={(e) => { e.target.onerror=null; e.target.style.display='none'; }} />
 </div>
 <div className="flex-1">
 <h3 className="text-white font-black text-sm tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>FIFA WORLD CUP 2026</h3>
 <p className="text-emerald-200/80 text-[10px] font-semibold">USA • MEXICO • CANADA</p>
 </div>
 <div className="flex gap-1">
 <img src="https://flagcdn.com/w40/mx.png" alt="" className="w-5 h-3.5 object-cover rounded-sm opacity-70" onError={(e) => { e.target.onerror=null; e.target.style.display='none'; }} />
 <img src="https://flagcdn.com/w40/ca.png" alt="" className="w-5 h-3.5 object-cover rounded-sm opacity-70" onError={(e) => { e.target.onerror=null; e.target.style.display='none'; }} />
 </div>
 </div>
 <div className="grid grid-cols-4 gap-2 mb-2">
 {[{v: days, l: 'DAYS'}, {v: hrs, l: 'HRS'}, {v: mins, l: 'MIN'}, {v: secs, l: 'SEC'}].map(({v, l}) => (
 <div key={l} className="text-center bg-black/30 rounded-lg py-2 border border-white/10">
 <div className="text-white font-black text-xl leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{String(v).padStart(2, '0')}</div>
 <div className="text-emerald-300/60 text-[9px] font-bold mt-1">{l}</div>
 </div>
 ))}
 </div>
 <p className="text-emerald-200/50 text-[10px] text-center font-semibold">Tap to see World Cup matches & create watch parties</p>
 </div>
 </div>
 </div>
 );
})()}

 <CopyrightFooter />
 </div>
 );

 const GameDetailScreen = () => {
 const gameParties = getPartiesForGame(selectedGame.id);

 useEffect(() => {
   window.scrollTo({ top: 0, behavior: 'instant' });
 }, []);

 return (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115] sports-tech-bg">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
 <button
 onClick={() => setCurrentScreen('games')}
 className="flex items-center gap-1.5 text-[#A0A4AB] hover:text-white transition-colors"
 >
 <ArrowLeft className="w-5 h-5" />
 <span className="text-sm font-medium">Back</span>
 </button>
 <span className="px-3 py-1 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-full border border-[#1E90FF]/30">
 {selectedGame.sport}
 </span>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-4 py-2 space-y-4">
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36] shadow-xl">
 <div className="flex items-center justify-end mb-3">
 {user && (
 <button
 onClick={() => toggleWatchGame(selectedGame)}
 className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
 watchedGames.includes(selectedGame.id)
 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
 : 'bg-[#151A22] text-[#A0A4AB] border border-[#222A36] hover:text-yellow-400 hover:border-yellow-500/30'
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
 <div className="flex-1 flex flex-col items-center gap-2">
 {selectedGame.homeLogo && <img src={selectedGame.homeLogo} alt="" className="w-20 h-20 object-contain mx-auto drop-shadow-lg" />}
 <div className="text-lg font-black text-white text-center leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>{selectedGame.homeTeam}</div>
 {selectedGame.homeRecord && <div className="text-xs text-[#A0A4AB]/70">{selectedGame.homeRecord}</div>}
 </div>
 <div className={`text-5xl font-black flex-shrink-0 ${selectedGame.gameStatus === 'live' ? 'score-led' : ''}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <span className={selectedGame.homeScore > selectedGame.awayScore ? 'text-emerald-400' : 'text-white'}>{selectedGame.homeScore}</span>
 <span className="text-[#A0A4AB]/70 mx-2">-</span>
 <span className={selectedGame.awayScore > selectedGame.homeScore ? 'text-emerald-400' : 'text-white'}>{selectedGame.awayScore}</span>
 </div>
 <div className="flex-1 flex flex-col items-center gap-2">
 {selectedGame.awayLogo && <img src={selectedGame.awayLogo} alt="" className="w-20 h-20 object-contain mx-auto drop-shadow-lg" />}
 <div className="text-lg font-black text-white text-center leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>{selectedGame.awayTeam}</div>
 {selectedGame.awayRecord && <div className="text-xs text-[#A0A4AB]/70">{selectedGame.awayRecord}</div>}
 </div>
 </div>
 <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${selectedGame.gameStatus === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30 live-badge-pulse' : 'bg-gray-500/20 text-[#A0A4AB] border border-gray-500/30'}`}>
 {selectedGame.statusDetail}
 </span>
 </>
 ) : (
 <div className="flex items-center justify-center gap-6 mb-4">
 <div className="flex-1 flex flex-col items-center gap-2">
 {selectedGame.homeLogo && <img src={selectedGame.homeLogo} alt="" className="w-20 h-20 object-contain mx-auto drop-shadow-lg" />}
 <div className="text-lg font-black text-white text-center leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>{selectedGame.homeTeam}</div>
 </div>
 <span className="text-3xl font-black text-[#1E90FF] flex-shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>VS</span>
 <div className="flex-1 flex flex-col items-center gap-2">
 {selectedGame.awayLogo && <img src={selectedGame.awayLogo} alt="" className="w-20 h-20 object-contain mx-auto drop-shadow-lg" />}
 <div className="text-lg font-black text-white text-center leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>{selectedGame.awayTeam}</div>
 </div>
 </div>
 )}
 <div className="flex items-center justify-center gap-1 text-[#A0A4AB] mb-2 mt-4">
 <Calendar className="w-4 h-4" />
 <span>{formatDateTime(selectedGame.startTime)}</span>
 </div>
 <div className="flex items-center justify-center gap-1 text-[#A0A4AB]">
 <MapPin className="w-4 h-4" />
 <span>{selectedGame.venue}</span>
 </div>
 </div>

 {user && selectedGame.gameStatus === 'scheduled' && (() => {
   const existingPred = gamePredictionCache[selectedGame.id] || myPredictions.find(p => p.game_id === selectedGame.id);
   const isLocked = new Date(selectedGame.startTime) <= new Date();
   return (
   <div className="bg-[#0D1117] border border-emerald-500/30 rounded-2xl p-4 mt-4">
   <div className="flex items-center gap-2 mb-3">
     <Target className="w-5 h-5 text-emerald-400" />
     <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>PREDICT THE WINNER</h3>
     <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+{predictionConfidence * 50} pts</span>
   </div>
   {existingPred && existingPred.status === 'pending' && expandedPrediction !== selectedGame.id ? (
     <div className="text-center py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
       <div className="flex items-center justify-center gap-2 mb-2">
         <CheckCircle className="w-5 h-5 text-emerald-400" />
         <p className="text-emerald-400 font-bold text-lg">Prediction Locked In!</p>
       </div>
       <div className="flex items-center justify-center gap-4 mb-2">
         <div className={`flex-1 py-2 rounded-lg text-center ${existingPred.picked_team === selectedGame.homeTeam ? 'bg-emerald-500/20 border border-emerald-500/40' : 'opacity-40'}`}>
           {selectedGame.homeLogo && <img src={selectedGame.homeLogo} alt="" className="w-8 h-8 object-contain mx-auto mb-1" />}
           <span className="text-white text-sm font-bold">{selectedGame.homeTeam}</span>
         </div>
         <div className={`flex-1 py-2 rounded-lg text-center ${existingPred.picked_team === selectedGame.awayTeam ? 'bg-emerald-500/20 border border-emerald-500/40' : 'opacity-40'}`}>
           {selectedGame.awayLogo && <img src={selectedGame.awayLogo} alt="" className="w-8 h-8 object-contain mx-auto mb-1" />}
           <span className="text-white text-sm font-bold">{selectedGame.awayTeam}</span>
         </div>
       </div>
       <p className="text-white text-sm">Confidence: <span className="text-emerald-400 font-bold">{existingPred.confidence}/10</span></p>
       <p className="text-emerald-400 text-sm font-bold mt-1">Potential: +{existingPred.confidence * 50} points</p>
       {!isLocked && <button onClick={() => setExpandedPrediction(selectedGame.id)} className="text-xs text-[#1E90FF] mt-3 underline">Change prediction</button>}
     </div>
   ) : null}
   {existingPred && existingPred.status === 'correct' ? (
     <div className="text-center py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
       <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
       <p className="text-emerald-400 font-bold text-lg">Correct! +{existingPred.points_earned} pts</p>
       <p className="text-[#A0A4AB] text-xs">You picked {existingPred.picked_team}</p>
     </div>
   ) : null}
   {existingPred && existingPred.status === 'incorrect' ? (
     <div className="text-center py-3 bg-red-500/10 rounded-xl border border-red-500/20">
       <X className="w-8 h-8 text-red-400 mx-auto mb-1" />
       <p className="text-red-400 font-bold">Incorrect</p>
       <p className="text-[#A0A4AB] text-xs">You picked {existingPred.picked_team} | Winner: {existingPred.winner}</p>
     </div>
   ) : null}
   {(!existingPred || expandedPrediction === selectedGame.id) && !isLocked ? (
     <>
     <p className="text-sm text-[#A0A4AB] text-center mb-2">Who will win?</p>
     <div className="flex gap-3 mb-3">
       <button onClick={() => submitPrediction(selectedGame, selectedGame.homeTeam, predictionConfidence)}
         disabled={predictionLoading}
         className="flex-1 py-3 rounded-xl font-bold text-sm transition-all bg-[#151A22] border border-[#222A36] text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-95">
         {selectedGame.homeLogo && <img src={selectedGame.homeLogo} alt="" className="w-8 h-8 object-contain mx-auto mb-1" />}
         {selectedGame.homeTeam}
       </button>
       <button onClick={() => submitPrediction(selectedGame, selectedGame.awayTeam, predictionConfidence)}
         disabled={predictionLoading}
         className="flex-1 py-3 rounded-xl font-bold text-sm transition-all bg-[#151A22] border border-[#222A36] text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-95">
         {selectedGame.awayLogo && <img src={selectedGame.awayLogo} alt="" className="w-8 h-8 object-contain mx-auto mb-1" />}
         {selectedGame.awayTeam}
       </button>
     </div>
     <div className="mb-2">
       <div className="flex justify-between text-xs text-[#A0A4AB] mb-1"><span>Confidence</span><span>{predictionConfidence}/10</span></div>
       <input type="range" min="1" max="10" value={predictionConfidence} onChange={e => setPredictionConfidence(parseInt(e.target.value))}
         className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #10B981 0%, #F59E0B ${predictionConfidence * 10}%, #333 ${predictionConfidence * 10}%)` }} />
       <div className="flex justify-between text-[10px] text-[#A0A4AB]/60 mt-1"><span>Safe bet</span><span>All in!</span></div>
     </div>
     <p className="text-xs text-[#A0A4AB] text-center">Win: <span className="text-emerald-400 font-bold">+{predictionConfidence * 50} points</span> | No penalty for wrong picks</p>
     <p className="text-[10px] text-[#A0A4AB]/50 text-center mt-1">For entertainment only - points have no cash value</p>
     </>
   ) : isLocked && !existingPred ? (
     <p className="text-center text-[#A0A4AB] text-sm py-2">Predictions locked - game has started</p>
   ) : null}
   </div>
   );
 })()}
 </div>

 <div>
 <div className="glow-divider mb-4" />
 <h2 className="text-2xl font-black text-white mb-4 section-header-glow" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 Watch Parties ({gameParties.length})
 </h2>
 
 {gameParties.length === 0 ? (
 <div className="text-center py-6">
 <p className="text-white font-bold text-sm mb-1">No parties yet — but you can be the first!</p>
 <p className="text-[#A0A4AB] text-xs leading-relaxed">We're just launching in Boca Raton, so some days might be quiet. Create a party and we'll help promote it to local fans.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {gameParties.map(party => {
 const isAttending = Array.isArray(party.attendees) && party.attendees.includes(user.email);
 const partyCapacity = party.maxSize || party.capacity || party.max_size;
 const isFull = partyCapacity && party.attendees.length >= partyCapacity;
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
 className={`relative overflow-hidden rounded-2xl border shadow-xl ${venue.featured ? 'featured-shimmer promoted-glow' : 'sport-card-glow'}`}
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
 {teamLogo && <img src={teamLogo} alt="" className="w-14 h-14 object-contain drop-shadow-sm" />}
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
 <img src={`/api/uploads/serve/${venue.logo.replace('/objects/', '')}`} alt="" className="w-8 h-8 rounded-lg object-cover border border-[#222A36]" />
 )}
 <h3 className="text-xl font-bold text-white">{party.hostName}'s Party</h3>
 {party.hostEmail === user.email && (
 <>
 <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
 HOST
 </span>
 <button
 onClick={(e) => { e.stopPropagation(); openEditParty(party); }}
 className="px-2 py-1 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-full border border-[#1E90FF]/30 hover:bg-[#1E90FF]/30 transition-all"
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
 
 <div className="space-y-2 text-sm text-[#A0A4AB]">
 {party.venueName && (
 <div className="flex items-center gap-2">
 <MapPin className="w-5 h-5 text-emerald-400" />
 <button onClick={() => { const mv = venues.find(v => v.name?.toLowerCase() === party.venueName?.toLowerCase()); if (mv?.id) { setSelectedVenueId(mv.id); setCurrentScreen('venueDetail'); } }} className="text-white font-black text-lg hover:text-[#1E90FF] transition-colors text-left">{party.venueName}</button>
 </div>
 )}
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4 text-[#1E90FF]" />
 <AddressLink address={party.venueAddress || party.location} />
 </div>
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4 text-[#1E90FF]" />
 <span>{party.customTime || formatDateTime(selectedGame.startTime)}</span>
 </div>
 <div className="flex items-center gap-2">
 <User className="w-4 h-4 text-[#1E90FF]" />
 <span>Hosted by <span className="text-white font-semibold">{party.hostName}</span></span>
 </div>
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-[#1E90FF]" />
 <span>
 {party.attendees.length}
 {partyCapacity ? ` of ${partyCapacity}` : ''} attending
 </span>
 </div>
 {(() => {
 const friendIds = (friendsList || []).map(f => f.id);
 const friendsGoing = party.attendeeDetails?.filter(a => a.userId && friendIds.includes(a.userId)) || [];
 if (friendsGoing.length > 0) return (
 <div className="flex items-center gap-2">
 <Heart className="w-4 h-4 text-pink-400" />
 <span className="text-pink-300 font-semibold">{friendsGoing.length} friend{friendsGoing.length !== 1 ? 's' : ''} attending</span>
 </div>
 );
 return null;
 })()}
 </div>
 <VenueMap address={party.venueAddress || party.location} venueName={party.venueName || party.location} />

 {matchedVenue?.id && <VenueDealsPreview venueId={matchedVenue.id} homeTeam={party.homeTeam} awayTeam={party.awayTeam} />}

 {party.notes && (
 <p className="mt-3 text-[#A0A4AB] text-sm">{party.notes}</p>
 )}

 {/* Attendee List */}
 {party.attendeeDetails && party.attendeeDetails.length > 0 && (
 <div className="mt-4 p-3 bg-[#151A22] rounded-xl border border-[#222A36]">
 <div className="flex items-center justify-between mb-2">
 <div className="text-xs text-[#A0A4AB] font-bold">Who's Going ({party.attendeeDetails.length})</div>
 <button
 onClick={(e) => { e.stopPropagation(); openShareMenu(party); }}
 className="text-xs text-[#1E90FF] font-semibold flex items-center gap-1 hover:text-[#1E90FF]/80 transition-colors"
 >
 <UserPlus className="w-3 h-3" /> Invite
 </button>
 </div>
 <div className="flex flex-wrap gap-2">
 {party.attendeeDetails.slice(0, 6).map((attendee, idx) => {
 const genderIcon = attendee.gender === 'male' ? '♂' : attendee.gender === 'female' ? '♀' : '';
 const genderColor = attendee.gender === 'male' ? 'text-[#1E90FF]' : attendee.gender === 'female' ? 'text-pink-400' : 'text-[#A0A4AB]';
 const attendeeTeamLogos = attendee.favoriteTeams ? Object.entries(attendee.favoriteTeams).map(([sport, team]) => getTeamLogoUrl(sport, team)).filter(Boolean) : [];
 return (
 <div
 key={idx}
 onClick={() => { if (attendee.userId) { setViewingProfileId(attendee.userId); setCurrentScreen('userProfile'); } }}
 className="flex items-center gap-1.5 px-3 py-1 bg-[#151A22] rounded-full border border-[#222A36] cursor-pointer hover:border-[#1E90FF]/30 transition-colors"
 >
 <ProfileAvatar src={attendee.profilePicture} name={attendee.name} size="xs" />
 <span className="text-white text-sm">{attendee.name}</span>
 {attendee.isFounder && (
 <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg font-bold" style={{ fontSize: '9px', backgroundColor: '#F5B400', color: '#0F1115' }} title="Founding Member">⭐ Founder</span>
 )}
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
 {party.attendeeDetails.length > 6 && (
 <div className="flex items-center px-3 py-1 bg-[#1E90FF]/10 rounded-full border border-[#1E90FF]/20 text-[#1E90FF] text-sm font-semibold">
 +{party.attendeeDetails.length - 6} more
 </div>
 )}
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
 Your team is playing! {party.attendees.length} {myTeam} fans going!
 </span>
 </div>
 </div>
 );
 }
 return null;
 })()
 )}

 {/* FEATURE 5: Capacity Warnings */}
 {partyCapacity && (
 <div className={`mb-3 p-3 rounded-lg text-center font-bold ${
 party.attendees.length >= partyCapacity
 ? 'bg-red-500/20 border border-red-500/30 text-red-300'
 : party.attendees.length / partyCapacity >= 0.8
 ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
 : 'bg-[#151A22] border border-[#222A36] text-[#A0A4AB]'
 }`}>
 {party.attendees.length >= partyCapacity ? (
 <span>🔒 PARTY FULL - No More Spots</span>
 ) : party.attendees.length / partyCapacity >= 0.8 ? (
 <span>⚠️ Only {partyCapacity - party.attendees.length} spots left! Join now!</span>
 ) : (
 <span>{party.attendees.length} / {partyCapacity} spots filled</span>
 )}
 </div>
 )}

 {/* FEATURE 3: Email Reminder Notification */}
 {isAttending && (
 <div className="mb-3 bg-[#1E90FF]/10 border border-[#1E90FF]/20 rounded-lg px-3 py-2 flex items-center gap-2">
 <span className="text-sm">📧</span>
 <span className="text-[#1E90FF]/90 text-xs font-semibold">Reminders enabled — we'll email you 2hrs before</span>
 <CheckCircle className="w-3.5 h-3.5 text-[#1E90FF]/60 ml-auto flex-shrink-0" />
 </div>
 )}


 {(isAttending || party.hostEmail === user.email) && (
 <>
 {!checkedInParties[party.id] ? (
 <button
 onClick={() => openQrScanner(party.id)}
 className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-2 border-yellow-500/30 hover:bg-yellow-500/30 active:scale-[0.98]"
 >
 <ScanLine className="w-5 h-5" />
 Scan QR to Check In (+75 pts)
 </button>
 ) : (
 <div className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-green-500/20 text-green-300 border-2 border-green-500/30">
 <CheckCircle className="w-4 h-4" />
 Checked In!
 </div>
 )}

 <button
 onClick={() => openPartyPhotos(party.id)}
 className={`w-full mt-2 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
 openPhotoPartyId === party.id
 ? 'bg-orange-500/30 text-orange-300 border-2 border-orange-500/40'
 : 'bg-[#151A22] text-[#A0A4AB] border-2 border-[#222A36] hover:bg-[#222A36]'
 } active:scale-[0.98]`}
 >
 <Camera className="w-4 h-4" />
 Party Photos
 </button>
 </>
 )}

 <button
 onClick={(e) => { e.stopPropagation(); openShareMenu(party); }}
 className="w-full mt-2 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/30 hover:bg-emerald-500/30 active:scale-[0.98]"
 >
 <Share2 className="w-4 h-4" /> Share Party
 </button>

 <button
 onClick={(e) => { e.stopPropagation(); openCalendarMenu(party); }}
 className="w-full mt-2 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-[#1E90FF]/20 text-[#1E90FF] border-2 border-[#1E90FF]/30 hover:bg-[#1E90FF]/30 active:scale-[0.98]"
 >
 <Calendar className="w-4 h-4" /> Add to Calendar
 </button>

 {(isAttending || party.hostEmail === user.email) && (
 <>
 <button
 onClick={() => openPartyChat(party.id, `${party.awayTeam || ''} ${party.awayTeam ? '@' : ''} ${party.homeTeam || party.sport || 'Party'}`)}
 className="w-full mt-2 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-purple-500/10 text-purple-300 border-2 border-purple-500/20 hover:bg-purple-500/20 active:scale-[0.98]"
 >
 <MessageCircle className="w-4 h-4" />
 Party Chat
 </button>

 {party.hostEmail !== user.email && (
 <button
 onClick={() => handleLeaveParty(party.id)}
 className="w-full mt-2 py-2.5 rounded-xl font-bold transition-all bg-red-500/10 text-red-300/80 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98] text-sm"
 >
 Leave Party
 </button>
 )}

 {openPhotoPartyId === party.id && (
 <div className="mt-3 bg-[#151A22]/80 rounded-xl border border-[#222A36] overflow-hidden">
 <div className="p-3 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-b border-[#222A36]">
 <h4 className="text-white font-bold text-sm flex items-center gap-2">
 <Camera className="w-4 h-4 text-orange-400" />
 Party Photo Album ({partyPhotos.length})
 </h4>
 </div>

 <div className="p-3 border-b border-[#222A36]">
 <div className="flex gap-2 items-center">
 <input
 type="text"
 value={photoCaption}
 onChange={(e) => setPhotoCaption(e.target.value)}
 placeholder="Add a caption..."
 maxLength={200}
 className="flex-1 bg-[#151A22] border border-[#222A36] rounded-full px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
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
 <div className="p-6 text-center text-[#A0A4AB]/70 text-sm">
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
 className="w-full aspect-square object-cover rounded-lg border border-[#222A36]"
 />
 {photo.tags?.length > 0 && (
 <div className="absolute bottom-1 left-1 bg-black/70 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
 <User className="w-2.5 h-2.5 text-[#1E90FF]" />
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
 <p className="text-[#A0A4AB] text-xs">{new Date(selectedPhoto.created_at).toLocaleString()}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button onClick={() => setTagMenuPhotoId(tagMenuPhotoId === selectedPhoto.id ? null : selectedPhoto.id)} className="p-2 bg-[#151A22] rounded-full hover:bg-[#222A36] transition-all" title="Tag friends">
 <UserPlus className="w-4 h-4 text-[#1E90FF]" />
 </button>
 <button onClick={() => sharePhoto(selectedPhoto, party)} className="p-2 bg-[#151A22] rounded-full hover:bg-[#222A36] transition-all" title="Share">
 <Share2 className="w-4 h-4 text-green-400" />
 </button>
 {(selectedPhoto.user_id === user.id || party.hostEmail === user.email) && (
 <button onClick={() => handleDeletePhoto(selectedPhoto.id)} className="p-2 bg-[#151A22] rounded-full hover:bg-red-500/30 transition-all" title="Delete">
 <Trash2 className="w-4 h-4 text-red-400" />
 </button>
 )}
 <button onClick={() => { setSelectedPhoto(null); setTagMenuPhotoId(null); }} className="p-2 bg-[#151A22] rounded-full hover:bg-[#222A36] transition-all">
 <X className="w-4 h-4 text-white" />
 </button>
 </div>
 </div>

 {tagMenuPhotoId === selectedPhoto.id && (
 <div className="px-4 pb-3">
 <div className="bg-[#151A22] rounded-lg p-3 border border-[#222A36]">
 <p className="text-white text-xs font-bold mb-2">Tag a party member:</p>
 <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
 {party.attendees
 .filter(a => !selectedPhoto.tags?.some(t => t.userId === a.userId))
 .map(a => (
 <button
 key={a.userId}
 onClick={() => handleTagFriend(selectedPhoto.id, a.userId)}
 className="flex items-center gap-1 bg-[#151A22] hover:bg-[#1E90FF]/20 border border-[#222A36] rounded-full px-2.5 py-1 text-xs text-white transition-all"
 >
 <UserPlus className="w-3 h-3 text-[#1E90FF]" />
 {a.name}
 </button>
 ))}
 {party.attendees.filter(a => !selectedPhoto.tags?.some(t => t.userId === a.userId)).length === 0 && (
 <span className="text-[#A0A4AB]/70 text-xs">Everyone is already tagged!</span>
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
 <span key={tag.userId} className="inline-flex items-center gap-1 bg-[#1E90FF]/20 border border-[#1E90FF]/30 rounded-full px-2.5 py-1 text-xs text-[#1E90FF]">
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
 <p className="text-[#A0A4AB]/70 text-xs text-center">Share with #HuddleUp</p>
 </div>
 </div>
 )}
 </div>
 )}


 </>
 )}

 {!isAttending && party.hostEmail !== user.email && (
 justJoinedPartyId === party.id ? (
 <button className="w-full mt-3 py-4 rounded-xl font-black text-lg join-btn-wow joined-success">
 <span className="checkmark-pop">✓</span> You're Going!
 </button>
 ) : (
 <button
 onClick={() => handleJoinParty(party.id)}
 disabled={isFull || joiningPartyId === party.id}
 className={`w-full mt-3 py-4 rounded-xl font-black text-lg join-btn-wow ${
 joiningPartyId === party.id ? 'joining bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white' :
 isFull
 ? 'bg-gray-500/20 text-[#A0A4AB]/70 border-2 border-gray-500/30 cursor-not-allowed'
 : 'bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white shadow-lg shadow-[#1E90FF]/20 hover:shadow-[#1E90FF]/40 hover:translate-y-[-1px]'
 }`}
 >
 {joiningPartyId === party.id ? 'Joining...' : isFull ? 'Party Full' : 'Join This Party'}
 </button>
 )
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>

 <button
 onClick={() => setCurrentScreen('createParty')}
 className="w-full py-4 bg-[#1E90FF] text-white font-bold text-lg rounded-2xl shadow-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 btn-glow"
 >
 <Plus className="w-5 h-5" />
 CREATE WATCH PARTY
 </button>

{user && (
<button
  onClick={() => {
    if (celebrateActive) return;
    setCelebrateActive(true);
    setCelebrateCount(p => p + 1);
    const rm = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!rm) {
      const tc = getTeamColors(selectedGame.sport, selectedGame.homeTeam) || getTeamColors(selectedGame.sport, selectedGame.awayTeam) || ['#1E90FF', '#FFD700'];
      const end = Date.now() + 15000;
      const iv = setInterval(() => {
        if (Date.now() > end) { clearInterval(iv); return; }
        confetti({ particleCount: 70, spread: 120, origin: { x: 0.5, y: 0.4 }, colors: tc, scalar: 2, shapes: ['circle', 'square'] });
        confetti({ particleCount: 35, startVelocity: 55, spread: 90, origin: { x: Math.random() * 0.4, y: 1 }, colors: tc, scalar: 1.5 });
        confetti({ particleCount: 35, startVelocity: 55, spread: 90, origin: { x: 0.6 + Math.random() * 0.4, y: 1 }, colors: tc, scalar: 1.5 });
      }, 300);
    }
    if (navigator.vibrate) navigator.vibrate([150, 60, 150, 60, 150, 60, 300]);
    try {
      const audio = new Audio('/crowd-cheer.mp3?v=2');
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch (e) {}
    setTimeout(() => setCelebrateActive(false), 15000);
  }}
  disabled={celebrateActive}
  className="fixed z-[45] flex flex-col items-center justify-center celebrate-btn"
  style={{ bottom: '24px', right: '20px', width: '72px', height: '72px', borderRadius: '50%', border: 'none', cursor: celebrateActive ? 'default' : 'pointer' }}
>
  <div className="celebrate-glow" />
  <span className={`text-3xl ${celebrateActive ? 'celebrate-icon-pop' : 'celebrate-icon-float'}`}>🎉</span>
  <span className="text-[8px] font-black text-white uppercase tracking-wider mt-0.5">Celebrate</span>
  {celebrateCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1">{celebrateCount}x</span>}
  <div className="celebrate-pulse-ring" />
  <div className="celebrate-pulse-ring" style={{ animationDelay: '0.5s' }} />
  <div className="celebrate-pulse-ring" style={{ animationDelay: '1s' }} />
</button>
)}

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
 <div className="min-h-screen bg-[#0F1115]" style={{ paddingTop: '60px', paddingBottom: '72px' }}>
     <div className="sticky top-[60px] left-0 right-0 z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <button
 onClick={() => setCurrentScreen('createParty')}
 className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors"
 >
 <ArrowLeft className="w-5 h-5" />
 Back
 </button>
 </div>
 </div>

 <div className="max-w-2xl mx-auto px-4 py-6">
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36] shadow-xl space-y-6">
 <div>
 <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 CLAIM YOUR VENUE
 </h2>
 <p className="text-[#A0A4AB]">Submit your business for verification to get featured on Huddle Up</p>
 </div>

 <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl p-5 shadow-sm">
 <div className="flex items-center gap-3 mb-3">
 <span className="text-4xl">🎁</span>
 <div>
 <div className="text-white font-black text-xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 14-Day FREE Trial
 </div>
 <div className="text-green-300 text-sm font-bold">No Credit Card Required!</div>
 </div>
 </div>
 <p className="text-[#A0A4AB] text-sm leading-relaxed">
 Try <strong>Featured</strong> status absolutely FREE for 14 days. See the results for yourself - more visibility, more parties, more customers. After the trial, base venue is $29.99/month and Featured is $49.99/month. Cancel anytime, no questions asked.
 </p>
 <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
 <CheckCircle className="w-4 h-4" />
 <span>Join 50+ venues already getting more customers with Huddle Up!</span>
 </div>
 </div>

 <div className="bg-[#1E90FF]/10 border border-[#1E90FF]/30 rounded-xl p-4 text-sm text-[#1E90FF]/80">
 <div className="font-bold mb-2">✓ Benefits of Verified Venues:</div>
 <ul className="space-y-1 ml-4">
 <li>• Show up first in watch party searches</li>
 <li>• Verified badge builds trust with customers</li>
 <li>• Track how many people find you through Huddle Up</li>
 <li>• Upgrade to Featured status for maximum visibility</li>
 </ul>
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Business Name *
 </label>
 <input
 type="text"
 value={claimVenueName}
 onChange={(e) => setClaimVenueName(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., Buffalo Wild Wings Downtown"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Full Address *
 </label>
 <input
 type="text"
 value={claimAddress}
 onChange={(e) => setClaimAddress(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="123 Main St, Fort Lauderdale, FL 33301"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Business Type *
 </label>
 <select
 value={claimVenueType}
 onChange={(e) => setClaimVenueType(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="" className="bg-[#151A22] text-white">Select type...</option>
 <option value="Sports Bar" className="bg-[#151A22] text-white">Sports Bar</option>
 <option value="Restaurant & Bar" className="bg-[#151A22] text-white">Restaurant & Bar</option>
 <option value="Brewery/Taproom" className="bg-[#151A22] text-white">Brewery/Taproom</option>
 <option value="Entertainment Venue" className="bg-[#151A22] text-white">Entertainment Venue</option>
 <option value="Other" className="bg-[#151A22] text-white">Other</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Phone Number
 </label>
 <input
 type="tel"
 value={claimPhone}
 onChange={(e) => setClaimPhone(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="(555) 123-4567"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Website
 </label>
 <input
 type="url"
 value={claimWebsite}
 onChange={(e) => setClaimWebsite(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="https://yourwebsite.com"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Proof of Ownership (optional)
 </label>
 <textarea
 value={claimProofDocument}
 onChange={(e) => setClaimProofDocument(e.target.value)}
 rows={2}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="Business license number, tax ID, or link to proof..."
 />
 <p className="text-xs text-[#A0A4AB]/70 mt-1">Helps us verify faster. We'll follow up if needed.</p>
 </div>

 <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
 <label className="flex items-start gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={claimAcceptedTerms}
 onChange={(e) => setClaimAcceptedTerms(e.target.checked)}
 className="mt-1 w-4 h-4 rounded border-[#222A36] text-[#1E90FF] focus:ring-[#1E90FF] focus:ring-offset-0 bg-[#151A22]"
 />
 <span className="text-sm text-[#A0A4AB]">
 <strong className="text-white">Venue Agreement:</strong> I confirm that I am authorized to represent this venue. I agree to the{' '}
 <span onClick={(e) => { e.preventDefault(); setCurrentScreen('termsOfService'); }} className="text-[#1E90FF] hover:text-[#1E90FF]/80 underline cursor-pointer">
 Terms of Service
 </span>
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
 className={`w-full py-4 text-white font-bold text-lg rounded-2xl shadow-sm transform transition-all duration-200 ${
 claimAcceptedTerms
 ? 'bg-[#1E90FF] hover:opacity-90 hover:scale-105'
 : 'bg-gray-500 cursor-not-allowed opacity-50'
 }`}
 >
 SUBMIT FOR VERIFICATION
 </button>

 <p className="text-xs text-[#A0A4AB]/70 text-center">
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
 const monthlyRecurringRevenue = (featuredVenues.length * 49.99) + (regularVenues.length * 29.99);
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
 <div className="text-xs text-[#A0A4AB] mt-1 text-center">{label}</div>
 </div>
 );
 };

 const a = analyticsData;

 return (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-7xl mx-auto px-4 py-4">
 <div className="flex items-center justify-between">
 <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Settings className="inline w-8 h-8 mr-2 text-[#1E90FF]" />
 ADMIN DASHBOARD
 </h1>
 <button
 onClick={() => setCurrentScreen('games')}
 className="px-4 py-2 bg-[#151A22] rounded-xl hover:bg-[#222A36] transition-colors text-white"
 >
 Back to App
 </button>
 </div>
 <div className="flex gap-2 mt-3 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
 {[
 { id: 'analytics', label: 'Analytics', icon: BarChart3 },
 { id: 'management', label: 'Management', icon: Settings },
 { id: 'rewards', label: 'Rewards', icon: Gift },
 { id: 'affiliates', label: 'Influencers', icon: Users },
 { id: 'predictions', label: 'Predictions', icon: Target },
 { id: 'seeddata', label: 'Seed Data', icon: Zap },
 ].map(tab => (
 <button key={tab.id} onClick={() => setAdminTab(tab.id)}
 className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0 whitespace-nowrap ${
 adminTab === tab.id ? 'bg-[#1E90FF] text-white shadow-sm shadow-cyan-500/25' : 'bg-[#151A22] text-[#A0A4AB] hover:bg-[#151A22] hover:text-white'
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
 <div className="animate-spin w-10 h-10 border-4 border-[#1E90FF] border-t-transparent rounded-full mx-auto mb-4" />
 <p className="text-[#A0A4AB]">Loading analytics...</p>
 </div>
 ) : a ? (
 <>
 {/* KPI Cards Row */}
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
 {[
 { label: 'Total Users', value: a.overview.totalUsers, sub: `+${a.overview.newUsersWeek} this week`, color: 'from-[#1E90FF]/20 to-[#1E90FF]/20', border: 'border-[#1E90FF]/30' },
 { label: 'Total Parties', value: a.overview.totalParties, sub: `+${a.overview.newPartiesWeek} this week`, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
 { label: 'Venues', value: a.overview.totalVenues, sub: `${a.overview.pendingClaims} pending`, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
 { label: 'Attendees', value: a.overview.totalAttendees, sub: 'Party joins', color: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30' },
 { label: 'Messages', value: a.overview.totalMessages, sub: `+${a.overview.newMessagesWeek} this week`, color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30' },
 { label: 'Friendships', value: a.overview.totalFriendships, sub: 'Connections', color: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/30' },
 ].map(kpi => (
 <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} border ${kpi.border} p-4 rounded-2xl`}>
 <div className="text-xs text-[#A0A4AB] mb-1">{kpi.label}</div>
 <div className="text-2xl font-black text-white">{kpi.value.toLocaleString()}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">{kpi.sub}</div>
 </div>
 ))}
 </div>

 {/* User Growth Chart */}
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
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
 <div className="bg-[#1E90FF]/70 hover:bg-[#1E90FF] rounded-t transition-all min-w-[2px]" style={{ height: `${Math.max(h, 3)}%` }} />
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#151A22] text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
 {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {d.signups} signups
 </div>
 </div>
 );
 })}
 </div>
 <div className="flex justify-between text-xs text-[#A0A4AB]/70">
 <span>{a.userGrowth.length > 0 ? new Date(a.userGrowth[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
 <span>{a.userGrowth.length > 0 ? new Date(a.userGrowth[a.userGrowth.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
 </div>
 </div>
 ) : (
 <div className="text-center py-8 text-[#A0A4AB]/70">No signup data yet</div>
 )}
 </div>

 {/* Engagement Rings */}
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
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
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
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
 <span className="text-[#A0A4AB]">{genderLabel}</span>
 <span className="text-white font-bold">{g.count} ({pct}%)</span>
 </div>
 <div className="h-2 bg-[#151A22] rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Age */}
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 AGE DISTRIBUTION
 </h3>
 <div className="space-y-3">
 {a.engagement.ageBreakdown.map(ag => {
 const pct = a.engagement.totalUsers > 0 ? Math.round((ag.count / a.engagement.totalUsers) * 100) : 0;
 return (
 <div key={ag.ageGroup}>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-[#A0A4AB]">{ag.ageGroup}</span>
 <span className="text-white font-bold">{ag.count} ({pct}%)</span>
 </div>
 <div className="h-2 bg-[#151A22] rounded-full overflow-hidden">
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
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 TOP SPORTS
 </h3>
 {a.topSports.length > 0 ? (
 <div className="space-y-3">
 {a.topSports.slice(0, 10).map((s, i) => {
 const maxParties = Math.max(...a.topSports.map(x => x.partyCount), 1);
 return (
 <div key={s.sport} className="flex items-center gap-3">
 <div className="w-6 text-center text-[#A0A4AB]/70 text-xs font-bold">#{i + 1}</div>
 <div className="flex-1">
 <div className="flex justify-between text-sm mb-1">
 <span className="text-white font-medium">{s.sport}</span>
 <span className="text-[#1E90FF] font-bold">{s.partyCount} parties</span>
 </div>
 <div className="h-1.5 bg-[#151A22] rounded-full overflow-hidden">
 <div className="h-full bg-[#1E90FF] rounded-full" style={{ width: `${(s.partyCount / maxParties) * 100}%` }} />
 </div>
 <div className="text-xs text-[#A0A4AB]/70 mt-0.5">{s.attendeeCount} attendees | {s.uniqueHosts} hosts</div>
 </div>
 </div>
 );
 })}
 </div>
 ) : <div className="text-center py-4 text-[#A0A4AB]/70">No data yet</div>}
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 TOP CITIES
 </h3>
 {a.topCities.length > 0 ? (
 <div className="space-y-3">
 {a.topCities.slice(0, 10).map((c, i) => {
 const maxParties = Math.max(...a.topCities.map(x => x.partyCount), 1);
 return (
 <div key={c.city} className="flex items-center gap-3">
 <div className="w-6 text-center text-[#A0A4AB]/70 text-xs font-bold">#{i + 1}</div>
 <div className="flex-1">
 <div className="flex justify-between text-sm mb-1">
 <span className="text-white font-medium">{c.city}</span>
 <span className="text-purple-400 font-bold">{c.partyCount} parties</span>
 </div>
 <div className="h-1.5 bg-[#151A22] rounded-full overflow-hidden">
 <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(c.partyCount / maxParties) * 100}%` }} />
 </div>
 <div className="text-xs text-[#A0A4AB]/70 mt-0.5">{c.attendeeCount} attendees | {c.uniqueHosts} hosts</div>
 </div>
 </div>
 );
 })}
 </div>
 ) : <div className="text-center py-4 text-[#A0A4AB]/70">No data yet</div>}
 </div>
 </div>

 {/* Top Teams */}
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 MOST POPULAR TEAMS
 </h3>
 {a.topTeams.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {a.topTeams.slice(0, 15).map((t, i) => (
 <div key={`${t.sport}-${t.team}`} className="flex items-center gap-3 bg-[#151A22] p-3 rounded-xl border border-white/5">
 <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-yellow-500 text-black' : 'bg-[#151A22] text-[#A0A4AB]'}`}>
 #{i + 1}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-white font-medium text-sm truncate">{t.team}</div>
 <div className="text-xs text-[#A0A4AB]/70">{t.sport}</div>
 </div>
 <div className="text-[#1E90FF] font-bold text-sm">{t.fanCount} fans</div>
 </div>
 ))}
 </div>
 ) : <div className="text-center py-4 text-[#A0A4AB]/70">No favorite teams set yet</div>}
 </div>

 {/* Venue Performance */}
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 VENUE PERFORMANCE
 </h3>
 {a.venuePerf.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-[#A0A4AB] border-b border-[#222A36]">
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
 <tr key={v.id} className="border-b border-white/5 hover:bg-[#151A22]">
 <td className="py-2 px-2 text-[#A0A4AB]/70">{i + 1}</td>
 <td className="py-2 px-2 text-white font-medium">{v.name}</td>
 <td className="py-2 px-2 text-[#A0A4AB]">{v.city || '-'}</td>
 <td className="py-2 px-2 text-right text-[#1E90FF] font-bold">{v.partiesHosted}</td>
 <td className="py-2 px-2 text-right text-purple-400 font-bold">{v.totalAttendees}</td>
 <td className="py-2 px-2 text-right text-pink-400 font-bold">{v.totalMessages}</td>
 <td className="py-2 px-2 text-center">{v.featured ? <Star className="w-4 h-4 text-yellow-400 inline" /> : '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : <div className="text-center py-4 text-[#A0A4AB]/70">No venue data yet</div>}
 </div>

 {/* User Cities & Hourly Activity */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 USER LOCATIONS
 </h3>
 {a.userCities.length > 0 ? (
 <div className="space-y-2">
 {a.userCities.slice(0, 10).map((c, i) => (
 <div key={c.city} className="flex items-center justify-between bg-[#151A22] px-3 py-2 rounded-lg">
 <div className="flex items-center gap-2">
 <MapPin className="w-3.5 h-3.5 text-green-400" />
 <span className="text-white text-sm">{c.city}</span>
 </div>
 <span className="text-green-400 font-bold text-sm">{c.userCount} users</span>
 </div>
 ))}
 </div>
 ) : <div className="text-center py-4 text-[#A0A4AB]/70">No city data yet</div>}
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
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
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#151A22] text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
 {h}:00 - {count} msgs
 </div>
 </div>
 );
 })}
 </div>
 <div className="flex justify-between text-xs text-[#A0A4AB]/70 mt-1">
 <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
 </div>
 </div>
 ) : <div className="text-center py-4 text-[#A0A4AB]/70">No chat data yet</div>}
 </div>
 </div>

 {/* Recent Activity */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 RECENT SIGNUPS
 </h3>
 <div className="space-y-3">
 {a.recentActivity.recentUsers.map(u => (
 <div key={u.id} className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-[#1E90FF]/20 flex items-center justify-center text-[#1E90FF] text-xs font-bold">
 {u.name?.charAt(0)?.toUpperCase()}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-white text-sm truncate">{u.name}</div>
 <div className="text-xs text-[#A0A4AB]/70">{u.email}</div>
 </div>
 <div className="text-xs text-[#A0A4AB]/70">{new Date(u.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
 </div>
 ))}
 </div>
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 RECENT PARTIES
 </h3>
 <div className="space-y-3">
 {a.recentActivity.recentParties.map(p => (
 <div key={p.id} className="bg-[#151A22] p-3 rounded-lg">
 <div className="text-white text-sm font-medium truncate">{p.title || `${p.sport} Watch Party`}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-0.5">by {p.host_name} | {p.city || 'Unknown city'}</div>
 <div className="flex justify-between mt-1 text-xs">
 <span className="text-purple-400">{p.sport}</span>
 <span className="text-[#1E90FF]">{p.attendee_count} going</span>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 RECENT CHAT
 </h3>
 <div className="space-y-3">
 {a.recentActivity.recentMessages.map((m, i) => (
 <div key={i} className="bg-[#151A22] p-3 rounded-lg">
 <div className="flex justify-between items-start">
 <span className="text-[#1E90FF] text-xs font-bold">{m.user_name}</span>
 <span className="text-xs text-gray-600">{new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
 </div>
 <div className="text-white text-sm mt-1 line-clamp-2">{m.message}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-0.5">in {m.party_title || 'party'}</div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <button onClick={loadAnalytics} disabled={analyticsLoading}
 className="w-full py-3 bg-[#151A22] hover:bg-[#151A22] text-[#A0A4AB] hover:text-white rounded-xl transition-all text-sm font-medium">
 {analyticsLoading ? 'Refreshing...' : 'Refresh Analytics'}
 </button>
 </>
 ) : (
 <div className="text-center py-20 text-[#A0A4AB]">Failed to load analytics. Try refreshing.</div>
 )}
 </>
 )}

 {adminTab === 'management' && (
 <>
 {/* Revenue Overview */}
 <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 sm:p-8 rounded-2xl overflow-hidden">
 <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 REVENUE OVERVIEW
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <div className="text-sm text-green-300 mb-2">Monthly Recurring Revenue (MRR)</div>
 <div className="text-4xl font-black text-white mb-1">
 ${monthlyRecurringRevenue.toLocaleString()}
 </div>
 <div className="text-xs text-[#A0A4AB]">
 {featuredVenues.length} Featured × $49.99/mo + {regularVenues.length} Base × $29.99/mo
 </div>
 </div>
 
 <div>
 <div className="text-sm text-green-300 mb-2">Projected Annual Revenue (ARR)</div>
 <div className="text-4xl font-black text-white mb-1">
 ${projectedAnnualRevenue.toLocaleString()}
 </div>
 <div className="text-xs text-[#A0A4AB]">
 Based on current subscriptions
 </div>
 </div>
 
 <div>
 <div className="text-sm text-green-300 mb-2">Average Revenue Per Venue</div>
 <div className="text-4xl font-black text-white mb-1">
 ${venues.filter(v => v.verified).length > 0 ? 
 Math.round(monthlyRecurringRevenue / venues.filter(v => v.verified).length) : 0}
 </div>
 <div className="text-xs text-[#A0A4AB]">
 Per month
 </div>
 </div>
 </div>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <div className="text-[#A0A4AB] text-sm mb-1">Total Users</div>
 <div className="text-3xl font-black text-white">{totalUsers}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">Registered accounts</div>
 </div>
 
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <div className="text-[#A0A4AB] text-sm mb-1">Active Parties</div>
 <div className="text-3xl font-black text-[#1E90FF]">{activeParties.length}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">Upcoming watch parties</div>
 </div>
 
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <div className="text-[#A0A4AB] text-sm mb-1">Verified Venues</div>
 <div className="text-3xl font-black text-white">{venues.filter(v => v.verified).length}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">
 {featuredVenues.length} Featured, {regularVenues.length} Free
 </div>
 </div>
 
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <div className="text-[#A0A4AB] text-sm mb-1">Total Reach</div>
 <div className="text-3xl font-black text-purple-400">{totalAttendees}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">People using platform</div>
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
 <div className="bg-[#151A22] p-4 sm:p-8 rounded-2xl border border-[#222A36] overflow-hidden">
 <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <BarChart3 className="inline w-6 h-6 mr-2 text-[#1E90FF]" />
 SPORT PERFORMANCE
 </h2>
 
 {Object.keys(sportStats).length === 0 ? (
 <div className="text-center py-8">
 <p className="text-white font-bold text-sm mb-1">No watch parties created yet</p>
 <p className="text-[#A0A4AB] text-xs">We're in soft launch — data will populate as fans create parties.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {Object.entries(sportStats)
 .sort((a, b) => b[1].attendees - a[1].attendees)
 .map(([sport, stats]) => (
 <div key={sport} className="bg-[#151A22] p-5 rounded-xl border border-[#222A36]">
 <div className="text-[#1E90FF] font-bold mb-2">{sport}</div>
 <div className="space-y-1 text-sm">
 <div className="flex justify-between">
 <span className="text-[#A0A4AB]">Parties:</span>
 <span className="text-white font-bold">{stats.parties}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[#A0A4AB]">Attendees:</span>
 <span className="text-white font-bold">{stats.attendees}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[#A0A4AB]">Avg Size:</span>
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
 <div className="bg-[#151A22] p-4 sm:p-8 rounded-2xl border border-[#222A36] overflow-hidden">
 <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 🏆 TOP PERFORMING VENUES
 </h2>
 
 {venuePerformance.length === 0 ? (
 <div className="text-center py-8">
 <p className="text-white font-bold text-sm mb-1">No venues yet</p>
 <p className="text-[#A0A4AB] text-xs">We're in soft launch — venues will appear as owners claim their spots.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {venuePerformance.slice(0, 10).map((venue, index) => (
 <div
 key={venue.id}
 className="bg-[#151A22] p-4 rounded-xl border border-[#222A36]"
 >
 <div className="flex items-start gap-3 mb-3">
 <div className="text-2xl font-black text-gray-600 flex-shrink-0">#{index + 1}</div>
 {venue.logo && (
 <img src={`/api/uploads/serve/${venue.logo.replace('/objects/', '')}`} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#222A36] flex-shrink-0" />
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
 <div className="text-xs text-[#A0A4AB] truncate mt-1"><AddressLink address={venue.address} /></div>
 </div>
 </div>
 
 <div className="grid grid-cols-3 gap-3 text-center bg-[#151A22] rounded-lg p-2">
 <div>
 <div className="text-[10px] text-[#A0A4AB]/70">Parties</div>
 <div className="text-sm font-bold text-white">{venue.partiesHosted}</div>
 </div>
 <div>
 <div className="text-[10px] text-[#A0A4AB]/70">Attendees</div>
 <div className="text-sm font-bold text-[#1E90FF]">{venue.totalAttendees}</div>
 </div>
 <div>
 <div className="text-[10px] text-[#A0A4AB]/70">Avg Size</div>
 <div className="text-sm font-bold text-purple-400">{venue.avgPartySize}</div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Venue Claims */}
 <div id="venue-claims-section" className="bg-[#151A22] p-4 sm:p-8 rounded-2xl border border-[#222A36] overflow-hidden">
 <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 Venue Claims to Review ({pendingClaims.length} Pending)
 </h2>

 {pendingClaims.length === 0 ? (
 <div className="text-center py-8 text-[#A0A4AB]">
 No pending claims to review
 </div>
 ) : (
 <div className="space-y-4">
 {pendingClaims.map(claim => (
 <div
 key={claim.id}
 className="bg-[#151A22] p-6 rounded-xl border border-[#222A36]"
 >
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <h3 className="text-xl font-bold text-white mb-2">{claim.venueName}</h3>
 <div className="space-y-1 text-sm text-[#A0A4AB]">
 <div><span className="text-[#A0A4AB]/70">Address:</span> {claim.address}</div>
 <div><span className="text-[#A0A4AB]/70">Type:</span> {claim.venueType}</div>
 {claim.phone && <div><span className="text-[#A0A4AB]/70">Phone:</span> {claim.phone}</div>}
 {claim.website && <div><span className="text-[#A0A4AB]/70">Website:</span> {claim.website}</div>}
 {claim.proofDocument && <div><span className="text-[#A0A4AB]/70">Proof:</span> {claim.proofDocument}</div>}
 <div className="mt-2"><span className="text-[#A0A4AB]/70">Submitted by:</span> {claim.submittedByName} ({claim.submittedBy})</div>
 <div><span className="text-[#A0A4AB]/70">Date:</span> {new Date(claim.submittedAt).toLocaleDateString()}</div>
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
 <div className="mt-8 pt-8 border-t border-[#222A36]">
 <h3 className="text-lg font-bold text-white mb-4">Recent Claim History</h3>
 <div className="space-y-2">
 {[...approvedClaims, ...rejectedClaims]
 .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
 .slice(0, 5)
 .map(claim => (
 <div key={claim.id} className="flex items-center justify-between text-sm p-3 bg-[#151A22] rounded-lg">
 <div>
 <span className="text-white font-bold">{claim.venueName}</span>
 <span className="text-[#A0A4AB]/70 ml-2">by {claim.submittedByName}</span>
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
 <div className="bg-[#151A22] p-4 sm:p-8 rounded-2xl border border-[#222A36] overflow-hidden">
 <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 All Verified Venues ({venues.filter(v => v.verified).length})
 </h2>

 <div className="space-y-3">
 {venues.filter(v => v.verified).map(venue => (
 <div
 key={venue.id}
 className="bg-[#151A22] p-4 rounded-xl border border-[#222A36] overflow-hidden"
 >
 <div className="flex items-start gap-3 mb-3">
 {venue.logo && (
 <img src={`/api/uploads/serve/${venue.logo.replace('/objects/', '')}`} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#222A36] flex-shrink-0" />
 )}
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-1.5 mb-1">
 <h3 className="font-bold text-white text-sm">{venue.name}</h3>
 {venue.featured ? (
 <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full whitespace-nowrap">
 ⭐ FEATURED ($49.99/mo)
 </span>
 ) : (
 <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-full whitespace-nowrap">
 BASE ($29.99/mo)
 </span>
 )}
 </div>
 <div className="text-xs text-[#A0A4AB] truncate"><AddressLink address={venue.address} /></div>
 <div className="text-[10px] text-[#A0A4AB]/70">{venue.type}</div>
 </div>
 </div>
 
 <div className="flex items-center justify-between gap-2">
 <div className="flex gap-4">
 <div>
 <div className="text-[#A0A4AB] text-[10px]">Parties Hosted</div>
 <div className="text-white font-bold text-sm">
 {parties.filter(p => p.venueId === venue.id).length}
 </div>
 </div>
 <div>
 <div className="text-[#A0A4AB] text-[10px]">Revenue</div>
 <div className="text-green-400 font-bold text-sm">
 ${venue.featured ? '49.99' : '29.99'}/mo
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
 className="px-2.5 py-1.5 bg-[#1E90FF]/20 text-[#1E90FF] rounded-lg text-[10px] font-bold hover:bg-[#1E90FF]/30 border border-[#1E90FF]/30 transition-all"
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
 <div className="bg-[#151A22] p-4 sm:p-8 rounded-2xl border border-[#222A36] overflow-hidden">
 <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
 <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <DollarSign className="inline w-6 h-6 mr-2 text-green-400" />
 SPONSOR MANAGEMENT
 </h2>
 <button
 onClick={() => { resetSponsorForm(); setShowSponsorForm(true); }}
 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-green-500/50 transition-all text-sm"
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
 <div className="bg-[#1E90FF]/10 border border-[#1E90FF]/20 p-4 rounded-xl">
 <div className="text-sm text-[#1E90FF] mb-1">Active Sponsors</div>
 <div className="text-2xl font-black text-white">{activeSponsors.length}</div>
 </div>
 <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
 <div className="text-sm text-purple-300 mb-1">Total Sponsors</div>
 <div className="text-2xl font-black text-white">{sponsors.length}</div>
 </div>
 </div>

 {showSponsorForm && (
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-6 mb-6 space-y-4">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-bold text-white">
 {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
 </h3>
 <button onClick={resetSponsorForm} className="text-[#A0A4AB] hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Sponsor/Company Name *</label>
 <input type="text" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)}
 placeholder="e.g., Bud Light"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Contact Name</label>
 <input type="text" value={sponsorContactName} onChange={(e) => setSponsorContactName(e.target.value)}
 placeholder="Rep name"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Contact Email</label>
 <input type="email" value={sponsorContactEmail} onChange={(e) => setSponsorContactEmail(e.target.value)}
 placeholder="sponsor@company.com"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Contact Phone</label>
 <input type="tel" value={sponsorContactPhone} onChange={(e) => setSponsorContactPhone(e.target.value)}
 placeholder="(555) 123-4567"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Website</label>
 <input type="text" value={sponsorWebsite} onChange={(e) => setSponsorWebsite(e.target.value)}
 placeholder="sponsor-website.com"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 </div>

 <div className="border border-green-500/20 rounded-xl p-4 space-y-4 bg-green-500/5">
 <h4 className="text-green-400 font-bold text-sm flex items-center gap-2">
 <MapPin className="w-4 h-4" /> AD PLACEMENT
 </h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Placement Type *</label>
 <select value={sponsorPlacementType} onChange={(e) => setSponsorPlacementType(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
 <option value="main_banner" className="bg-[#151A22]">Main Banner (Top of All Pages)</option>
 <option value="sport_banner" className="bg-[#151A22]">Sport Banner (Per-Sport Pages)</option>
 </select>
 <p className="text-xs text-[#A0A4AB] mt-1">{sponsorPlacementType === 'main_banner' ? 'Shows as the top banner across the entire app' : 'Shows on specific sport league pages'}</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Tagline</label>
 <input type="text" value={sponsorTagline} onChange={(e) => setSponsorTagline(e.target.value)}
 placeholder="e.g. Fuel Your Game Day"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div className="md:col-span-2">
 <div className={`rounded-lg p-3 border ${sponsorPlacementType === 'main_banner' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
 <p className={`text-xs font-bold mb-1 ${sponsorPlacementType === 'main_banner' ? 'text-amber-400' : 'text-blue-400'}`}>
 {sponsorPlacementType === 'main_banner' ? 'MAIN BANNER SPECS' : 'SPORT BANNER SPECS'}
 </p>
 {sponsorPlacementType === 'main_banner' ? (
 <div className="text-xs text-[#A0A4AB] space-y-0.5">
 <p><span className="text-white font-medium">Recommended Size:</span> 1200 x 150 px (8:1 ratio)</p>
 <p><span className="text-white font-medium">Minimum Size:</span> 800 x 100 px</p>
 <p><span className="text-white font-medium">Format:</span> PNG or JPG, max 2MB</p>
 <p><span className="text-white font-medium">Display:</span> Full-width banner fixed at top of all pages</p>
 <p className="text-amber-400/70 mt-1">Tip: Use a wide, horizontal image with bold text and logo. Dark backgrounds work best.</p>
 </div>
 ) : (
 <div className="text-xs text-[#A0A4AB] space-y-0.5">
 <p><span className="text-white font-medium">Recommended Size:</span> 400 x 100 px (4:1 ratio)</p>
 <p><span className="text-white font-medium">Logo Size:</span> 200 x 200 px (square)</p>
 <p><span className="text-white font-medium">Format:</span> PNG or JPG, max 2MB</p>
 <p><span className="text-white font-medium">Display:</span> Shown as sponsor card on sport-specific pages</p>
 <p className="text-blue-400/70 mt-1">Tip: Square logos with transparent backgrounds look cleanest.</p>
 </div>
 )}
 </div>
 </div>
 {sponsorPlacementType === 'sport_banner' && (
 <>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Tier</label>
 <select value={sponsorTierField} onChange={(e) => setSponsorTierField(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
 <option value="standard" className="bg-[#151A22]">Standard (1 sport)</option>
 <option value="premium" className="bg-[#151A22]">Premium (Multi-sport)</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Slot Number (1-5)</label>
 <select value={sponsorSlotNumber} onChange={(e) => setSponsorSlotNumber(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
 <option value="" className="bg-[#151A22]">Auto-assign</option>
 <option value="1" className="bg-[#151A22]">Slot 1</option>
 <option value="2" className="bg-[#151A22]">Slot 2</option>
 <option value="3" className="bg-[#151A22]">Slot 3</option>
 <option value="4" className="bg-[#151A22]">Slot 4</option>
 <option value="5" className="bg-[#151A22]">Slot 5</option>
 </select>
 </div>
 <div className="md:col-span-2">
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Target Sports</label>
 <div className="flex flex-wrap gap-2">
 {['NFL', 'NBA', 'MLB', 'NHL', 'College Football', 'College Basketball', 'Premier League', 'La Liga', 'Liga MX', 'MLS', 'Champions League', 'Formula 1', 'UFC', 'Tennis'].map(sport => (
 <button key={sport} type="button"
 onClick={() => {
 if (sponsorTargetSports.includes(sport)) {
 setSponsorTargetSports(sponsorTargetSports.filter(s => s !== sport));
 } else {
 if (sponsorTierField === 'standard' && sponsorTargetSports.length >= 1) {
 alert('Standard tier allows only 1 sport. Switch to Premium for multi-sport.');
 return;
 }
 setSponsorTargetSports([...sponsorTargetSports, sport]);
 }
 }}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
 sponsorTargetSports.includes(sport)
 ? 'bg-green-500/20 text-green-400 border-green-500/40'
 : 'bg-[#151A22] text-[#A0A4AB] border-[#222A36] hover:border-green-500/30'
 }`}>
 {sport}
 </button>
 ))}
 </div>
 {sponsorTierField === 'standard' && <p className="text-xs text-yellow-400/70 mt-1">Standard tier: 1 sport max. Upgrade to Premium for multiple sports.</p>}
 </div>
 </>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Amount Paid ($)</label>
 <input type="number" step="0.01" value={sponsorAmount} onChange={(e) => setSponsorAmount(e.target.value)}
 placeholder="0.00"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Payment Frequency</label>
 <select value={sponsorFrequency} onChange={(e) => setSponsorFrequency(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
 <option value="one-time" className="bg-[#151A22]">One-Time</option>
 <option value="monthly" className="bg-[#151A22]">Monthly</option>
 <option value="quarterly" className="bg-[#151A22]">Quarterly</option>
 <option value="yearly" className="bg-[#151A22]">Yearly</option>
 </select>
 </div>
 {editingSponsor && (
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Status</label>
 <select value={sponsorStatus} onChange={(e) => setSponsorStatus(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
 <option value="active" className="bg-[#151A22]">Active</option>
 <option value="paused" className="bg-[#151A22]">Paused</option>
 <option value="ended" className="bg-[#151A22]">Ended</option>
 </select>
 </div>
 )}
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Start Date</label>
 <input type="date" value={sponsorStartDate} onChange={(e) => setSponsorStartDate(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">End Date</label>
 <input type="date" value={sponsorEndDate} onChange={(e) => setSponsorEndDate(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Notes</label>
 <textarea value={sponsorNotes} onChange={(e) => setSponsorNotes(e.target.value)}
 rows={2} placeholder="Deal details, special terms, deliverables..."
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Sponsor Logo</label>
 <div className="flex items-center gap-4">
 {sponsorLogo ? (
 <img src={`/api/uploads/serve/${sponsorLogo.replace('/objects/', '')}`} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-[#222A36]" />
 ) : (
 <div className="w-16 h-16 rounded-xl bg-[#151A22] border border-[#222A36] flex items-center justify-center text-[#A0A4AB]/70">
 <Building2 className="w-6 h-6" />
 </div>
 )}
 <button type="button" disabled={uploadingSponsorLogo}
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSponsorLogoUpload(); }}
 className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${uploadingSponsorLogo ? 'bg-gray-500 text-[#A0A4AB]' : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'}`}>
 {uploadingSponsorLogo ? 'Uploading...' : 'Upload Logo'}
 </button>
 {sponsorLogo && (
 <button onClick={() => setSponsorLogo(null)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
 )}
 </div>
 </div>
 <div className="flex gap-3 pt-2">
 <button onClick={saveSponsor} disabled={savingSponsor || !sponsorName}
 className={`flex-1 py-3 font-bold rounded-xl transition-all ${savingSponsor || !sponsorName ? 'bg-gray-500 text-[#A0A4AB] cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-green-500/50'}`}>
 {savingSponsor ? 'Saving...' : editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
 </button>
 <button onClick={resetSponsorForm} className="px-6 py-3 bg-[#151A22] text-[#A0A4AB] font-bold rounded-xl hover:bg-[#222A36] transition-all">Cancel</button>
 </div>
 </div>
 )}

 {sponsors.length === 0 && !showSponsorForm ? (
 <div className="text-center py-8 text-[#A0A4AB]">
 <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
 <p className="font-bold mb-1">No sponsors yet</p>
 <p className="text-sm">Add sponsors to track their logos, deals, and revenue.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {sponsors.map(s => (
 <div key={s.id} className={`bg-[#151A22] p-5 rounded-xl border ${s.status === 'active' ? 'border-green-500/20' : s.status === 'paused' ? 'border-yellow-500/20' : 'border-gray-500/20'}`}>
 <div className="flex items-start gap-4">
 {s.logo ? (
 <img src={`/api/uploads/serve/${s.logo.replace('/objects/', '')}`} alt={s.name} className="w-14 h-14 rounded-xl object-cover border border-[#222A36] flex-shrink-0" />
 ) : (
 <div className="w-14 h-14 rounded-xl bg-[#151A22] border border-[#222A36] flex items-center justify-center text-[#A0A4AB]/70 flex-shrink-0">
 <Building2 className="w-6 h-6" />
 </div>
 )}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className="text-white font-bold text-lg">{s.name}</span>
 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${s.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : s.status === 'paused' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-gray-500/20 text-[#A0A4AB] border border-gray-500/30'}`}>
 {s.status.toUpperCase()}
 </span>
 </div>
 <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#A0A4AB]">
 {s.contactName && <span>{s.contactName}</span>}
 {s.contactEmail && <span>{s.contactEmail}</span>}
 {s.contactPhone && <span>{s.contactPhone}</span>}
 </div>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
 <span className="text-green-400 font-bold">${(s.amountPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
 <span className="text-[#A0A4AB]/70">{s.paymentFrequency === 'one-time' ? 'One-Time' : s.paymentFrequency.charAt(0).toUpperCase() + s.paymentFrequency.slice(1)}</span>
 {s.startDate && <span className="text-[#A0A4AB]/70">From: {new Date(s.startDate).toLocaleDateString()}</span>}
 {s.endDate && <span className="text-[#A0A4AB]/70">To: {new Date(s.endDate).toLocaleDateString()}</span>}
 </div>
 <div className="flex flex-wrap gap-1.5 mt-2">
 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${s.placementType === 'main_banner' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
 {s.placementType === 'main_banner' ? 'Main Banner' : 'Sport Banner'}
 </span>
 {s.placementType === 'sport_banner' && s.targetSports && s.targetSports.length > 0 && s.targetSports.map(sp => (
 <span key={sp} className="px-2 py-0.5 text-xs rounded-full bg-[#1E90FF]/10 text-[#1E90FF] border border-[#1E90FF]/20">{sp}</span>
 ))}
 {s.slotNumber && <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">Slot {s.slotNumber}</span>}
 {s.sponsorTier === 'premium' && <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">Premium</span>}
 </div>
 {s.notes && <p className="text-[#A0A4AB]/70 text-xs mt-2 italic">"{s.notes}"</p>}
 </div>
 <div className="flex gap-2 flex-shrink-0">
 <button onClick={() => startEditSponsor(s)} className="p-2 bg-[#151A22] rounded-lg hover:bg-[#222A36] transition-all text-[#A0A4AB] hover:text-white" title="Edit">
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
 <div className="bg-[#151A22] rounded-2xl p-6 max-w-md w-full border border-[#222A36]" onMouseDown={e => e.stopPropagation()}>
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>QR CODE - {adminQrModal.venue.name}</h3>
 <button onClick={() => setAdminQrModal(null)} className="text-[#A0A4AB] hover:text-white"><X className="w-5 h-5" /></button>
 </div>
 <div className="flex flex-col items-center gap-4">
 <div className="bg-white p-4 rounded-2xl">
 <img src={adminQrModal.qrDataUrl} alt="Venue QR Code" className="w-48 h-48" />
 </div>
 <p className="text-[#A0A4AB] text-sm text-center">Fans scan this to check in at {adminQrModal.venue.name}</p>
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
 className="flex-1 py-2 bg-[#151A22] text-white font-bold rounded-xl text-sm hover:bg-[#222A36] border border-[#222A36]"
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
 className="flex-1 py-2 bg-[#151A22] text-[#A0A4AB] font-bold rounded-xl text-sm hover:bg-[#222A36] border border-[#222A36]"
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
 <div className="bg-[#151A22] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#222A36] overscroll-contain" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EDIT VENUE</h3>
 <button onClick={() => setAdminEditVenue(null)} className="text-[#A0A4AB] hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Business Name *</label>
 <input
 value={adminEditForm.name}
 onChange={e => setAdminEditForm({...adminEditForm, name: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Address *</label>
 <input
 value={adminEditForm.address}
 onChange={e => setAdminEditForm({...adminEditForm, address: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">City</label>
 <input
 value={adminEditForm.city}
 onChange={e => setAdminEditForm({...adminEditForm, city: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Business Type</label>
 <select
 value={adminEditForm.type}
 onChange={e => setAdminEditForm({...adminEditForm, type: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
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
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Phone</label>
 <input
 value={adminEditForm.phone}
 onChange={e => setAdminEditForm({...adminEditForm, phone: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Website</label>
 <input
 value={adminEditForm.website}
 onChange={e => setAdminEditForm({...adminEditForm, website: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Capacity</label>
 <input
 type="number"
 value={adminEditForm.capacity}
 onChange={e => setAdminEditForm({...adminEditForm, capacity: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Description</label>
 <textarea
 value={adminEditForm.description}
 onChange={e => setAdminEditForm({...adminEditForm, description: e.target.value})}
 rows={3}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={adminEditForm.featured}
 onChange={e => setAdminEditForm({...adminEditForm, featured: e.target.checked})}
 className="w-4 h-4 rounded border-[#222A36] text-[#1E90FF] focus:ring-[#1E90FF] focus:ring-offset-0 bg-[#151A22]"
 />
 <span className="text-sm text-[#A0A4AB]">Featured Venue ($49.99/mo)</span>
 </label>
 </div>

 <div className="flex gap-3 mt-6">
 <button
 onClick={() => setAdminEditVenue(null)}
 className="flex-1 py-3 bg-[#151A22] text-white rounded-xl font-bold hover:bg-[#222A36] transition-all"
 >
 Cancel
 </button>
 <button
 onClick={handleAdminSaveVenue}
 disabled={adminSavingVenue || !adminEditForm.name || !adminEditForm.address}
 className={`flex-1 py-3 rounded-xl font-bold transition-all ${
 adminSavingVenue || !adminEditForm.name || !adminEditForm.address
 ? 'bg-gray-600 text-[#A0A4AB] cursor-not-allowed'
 : 'bg-[#1E90FF] text-white hover:shadow-[#1E90FF]/10 '
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

 {adminTab === 'rewards' && (
 <>
 <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Gift className="inline w-5 h-5 mr-2 text-yellow-400" /> RAFFLE MANAGEMENT
 </h2>
 <button
 onClick={() => setAdminRaffleForm({ title: '', description: '', prizeDescription: '', prizeIcon: '🎟️', pointsPerEntry: 100, maxEntriesPerUser: 10, endDate: '', imageUrl: '' })}
 className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-xl text-sm hover:shadow-yellow-500/30 transition-all"
 >
 <Plus className="w-4 h-4 inline mr-1" /> New Raffle
 </button>
 </div>

 {adminRaffleForm && (
 <div className="bg-[#0F1115] rounded-xl border border-[#222A36] p-5 mb-6 space-y-4">
 <h3 className="text-white font-bold text-sm">{adminRaffleForm.id ? 'EDIT RAFFLE' : 'CREATE NEW RAFFLE'}</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Title *</label>
 <input value={adminRaffleForm.title} onChange={e => setAdminRaffleForm(f => ({ ...f, title: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" placeholder="e.g. Super Bowl Tickets" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Prize Icon</label>
 <input value={adminRaffleForm.prizeIcon} onChange={e => setAdminRaffleForm(f => ({ ...f, prizeIcon: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" placeholder="🎟️" />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Prize Description *</label>
 <input value={adminRaffleForm.prizeDescription} onChange={e => setAdminRaffleForm(f => ({ ...f, prizeDescription: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" placeholder="e.g. 2x Super Bowl LX Tickets" />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Description</label>
 <textarea value={adminRaffleForm.description} onChange={e => setAdminRaffleForm(f => ({ ...f, description: e.target.value }))}
 rows={2} className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" placeholder="Optional details..." />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Prize Image</label>
 <div className="flex items-center gap-3">
 {adminRaffleForm.imageUrl ? (
 <div className="relative">
 <img src={adminRaffleForm.imageUrl.startsWith('/objects/') ? `/api/uploads/serve/${adminRaffleForm.imageUrl.replace('/objects/', '')}` : adminRaffleForm.imageUrl} alt="Prize" className="w-20 h-20 rounded-xl object-cover border border-[#222A36]" />
 <button onClick={() => setAdminRaffleForm(f => ({ ...f, imageUrl: '' }))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
 </div>
 ) : (
 <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[#222A36] flex items-center justify-center text-[#A0A4AB]">
 <Camera className="w-6 h-6" />
 </div>
 )}
 <button disabled={adminRaffleImageUploading} onClick={() => {
 const input = document.createElement('input');
 input.type = 'file'; input.accept = 'image/*';
 input.onchange = async (ev) => {
 const file = ev.target.files?.[0];
 if (!file) return;
 if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
 if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
 setAdminRaffleImageUploading(true);
 try {
 const buf = await file.arrayBuffer();
 const uploadRes = await fetch('/api/uploads/venue-image/upload', { method: 'POST', headers: { 'Content-Type': file.type, 'x-file-content-type': file.type, 'x-image-type': 'raffle-image' }, credentials: 'include', body: buf });
 if (!uploadRes.ok) throw new Error((await uploadRes.json().catch(() => ({}))).error || 'Upload failed');
 const { objectPath } = await uploadRes.json();
 setAdminRaffleForm(f => ({ ...f, imageUrl: objectPath }));
 } catch (err) { alert('Upload failed: ' + err.message); }
 setAdminRaffleImageUploading(false);
 };
 input.click();
 }} className="px-4 py-2 bg-[#151A22] border border-[#222A36] rounded-xl text-white text-sm font-semibold hover:bg-[#222A36] transition-colors"
 >{adminRaffleImageUploading ? 'Uploading...' : 'Upload Image'}</button>
 </div>
 <p className="text-[#A0A4AB] text-xs mt-1">Optional. Shows on the raffle card. Max 5MB.</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Points Per Entry</label>
 <input type="number" value={adminRaffleForm.pointsPerEntry} onChange={e => setAdminRaffleForm(f => ({ ...f, pointsPerEntry: parseInt(e.target.value) || 0 }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Max Entries Per User</label>
 <input type="number" value={adminRaffleForm.maxEntriesPerUser} onChange={e => setAdminRaffleForm(f => ({ ...f, maxEntriesPerUser: parseInt(e.target.value) || 0 }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">End Date *</label>
 <input type="datetime-local" value={adminRaffleForm.endDate ? adminRaffleForm.endDate.slice(0, 16) : ''} onChange={e => setAdminRaffleForm(f => ({ ...f, endDate: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" />
 </div>
 {adminRaffleForm.id && (
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Status</label>
 <select value={adminRaffleForm.status || 'active'} onChange={e => setAdminRaffleForm(f => ({ ...f, status: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]">
 <option value="active">Active</option>
 <option value="ended">Ended</option>
 <option value="cancelled">Cancelled</option>
 </select>
 </div>
 )}
 </div>
 <div className="flex gap-3 pt-2">
 <button
 disabled={adminRaffleSaving || !adminRaffleForm.title || !adminRaffleForm.prizeDescription || !adminRaffleForm.endDate}
 onClick={async () => {
 setAdminRaffleSaving(true);
 try {
 if (adminRaffleForm.id) {
 await api.raffles.adminUpdate(adminRaffleForm.id, adminRaffleForm);
 } else {
 await api.raffles.adminCreate(adminRaffleForm);
 }
 setAdminRaffleForm(null);
 const data = await api.raffles.adminAll();
 setAdminRaffles(data);
 } catch (e) { alert(e.message || 'Save failed'); }
 finally { setAdminRaffleSaving(false); }
 }}
 className={`flex-1 py-2.5 font-bold rounded-xl text-sm transition-all ${
 adminRaffleSaving || !adminRaffleForm.title || !adminRaffleForm.prizeDescription || !adminRaffleForm.endDate
 ? 'bg-gray-600 text-[#A0A4AB] cursor-not-allowed'
 : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-green-500/30'
 }`}
 >
 {adminRaffleSaving ? 'Saving...' : adminRaffleForm.id ? 'Update Raffle' : 'Create Raffle'}
 </button>
 <button onClick={() => setAdminRaffleForm(null)} className="px-6 py-2.5 bg-[#151A22] text-[#A0A4AB] font-bold rounded-xl hover:bg-[#222A36] text-sm">Cancel</button>
 </div>
 </div>
 )}

 {adminRaffles.length === 0 ? (
 <div className="text-center py-8 text-[#A0A4AB]">
 <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
 <p className="font-bold mb-1">No raffles yet</p>
 <p className="text-sm">Create a raffle to let users spend their points on grand prizes.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {adminRaffles.map(raffle => {
 const daysLeft = Math.max(0, Math.ceil((new Date(raffle.end_date) - new Date()) / (1000 * 60 * 60 * 24)));
 const totalEntries = parseInt(raffle.total_entries) || 0;
 const uniqueEntrants = parseInt(raffle.unique_entrants) || 0;
 return (
 <div key={raffle.id} className={`bg-[#0F1115] rounded-xl border p-4 ${
 raffle.status === 'active' ? 'border-green-500/20' : raffle.status === 'ended' ? 'border-yellow-500/20' : 'border-red-500/20'
 }`}>
 <div className="flex items-start gap-3">
 {raffle.image_url ? (
 <img src={raffle.image_url.startsWith('/objects/') ? `/api/uploads/serve/${raffle.image_url.replace('/objects/', '')}` : raffle.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
 ) : (
 <span className="text-2xl">{raffle.prize_icon}</span>
 )}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-white font-bold">{raffle.title}</span>
 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
 raffle.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
 : raffle.status === 'ended' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
 : 'bg-red-500/20 text-red-400 border border-red-500/30'
 }`}>{raffle.status.toUpperCase()}</span>
 </div>
 <div className="text-[#A0A4AB] text-xs mt-1">{raffle.prize_description}</div>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#A0A4AB]">
 <span>{totalEntries} entries</span>
 <span>{uniqueEntrants} users</span>
 <span>{raffle.points_per_entry} pts/entry</span>
 <span>{raffle.status === 'active' ? `${daysLeft} days left` : `Ended ${new Date(raffle.end_date).toLocaleDateString()}`}</span>
 </div>
 {raffle.winner_name && (
 <div className="mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5 text-sm">
 <Trophy className="w-3.5 h-3.5 inline mr-1 text-yellow-400" /> Winner: <span className="text-yellow-300 font-bold">{raffle.winner_name}</span>
 </div>
 )}
 </div>
 <div className="flex flex-col gap-2 flex-shrink-0">
 <button onClick={() => setAdminRaffleForm({
 id: raffle.id, title: raffle.title, description: raffle.description || '',
 prizeDescription: raffle.prize_description, prizeIcon: raffle.prize_icon,
 pointsPerEntry: raffle.points_per_entry, maxEntriesPerUser: raffle.max_entries_per_user,
 endDate: raffle.end_date, status: raffle.status, imageUrl: raffle.image_url || '',
 })} className="p-2 bg-[#151A22] rounded-lg hover:bg-[#222A36] text-[#A0A4AB] hover:text-white" title="Edit">
 <Pencil className="w-4 h-4" />
 </button>
 {raffle.status === 'active' && !raffle.winner_id && totalEntries > 0 && (
 <button onClick={async () => {
 if (!confirm(`Draw a random winner for "${raffle.title}"? This cannot be undone.`)) return;
 try {
 const result = await api.raffles.adminDrawWinner(raffle.id);
 alert(`Winner: ${result.winner.name} (${result.winner.email}) out of ${result.totalEntries} entries!`);
 const data = await api.raffles.adminAll();
 setAdminRaffles(data);
 } catch (e) { alert(e.message || 'Draw failed'); }
 }} className="p-2 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300" title="Draw Winner">
 <Trophy className="w-4 h-4" />
 </button>
 )}
 <button onClick={async () => {
 if (!confirm(`Delete/cancel raffle "${raffle.title}"?`)) return;
 try {
 await api.raffles.adminDelete(raffle.id);
 const data = await api.raffles.adminAll();
 setAdminRaffles(data);
 } catch (e) { alert(e.message || 'Delete failed'); }
 }} className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300" title="Delete">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </>
 )}

 {adminTab === 'affiliates' && (
 <>
 <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Users className="inline w-5 h-5 mr-2 text-amber-400" /> INFLUENCER MANAGEMENT
 </h2>
 <button
 onClick={() => setAdminAffiliateForm({ name: '', email: '', code: '', commissionRate: '0.30', maxRedemptions: '', expirationDate: '', paymentMethod: 'paypal', paymentDetails: '', notes: '' })}
 className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl text-sm hover:shadow-amber-500/30 transition-all"
 >
 <Plus className="w-4 h-4 inline mr-1" /> Add Influencer
 </button>
 </div>

 {adminAffiliateForm && (
 <div className="bg-[#0F1115] rounded-xl border border-amber-500/20 p-5 mb-6 space-y-4">
 <h3 className="text-amber-300 font-bold text-sm">{adminAffiliateForm.id ? 'EDIT INFLUENCER' : 'ADD NEW INFLUENCER'}</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Influencer Name *</label>
 <input value={adminAffiliateForm.name} onChange={e => setAdminAffiliateForm(f => ({ ...f, name: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Barstool Sports" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Email *</label>
 <input value={adminAffiliateForm.email} onChange={e => setAdminAffiliateForm(f => ({ ...f, email: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="influencer@example.com" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Influencer Code *</label>
 <div className="flex gap-2">
 <input value={adminAffiliateForm.code} onChange={e => setAdminAffiliateForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
 className="flex-1 px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase" placeholder="e.g. BARSTOOL" />
 <button type="button" onClick={() => {
 const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 let code = '';
 for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
 setAdminAffiliateForm(f => ({ ...f, code }));
 }} className="px-3 py-2 bg-amber-500/10 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/20 hover:bg-amber-500/20">Auto</button>
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Commission Rate (%)</label>
 <input type="number" min="10" max="50" step="1" value={Math.round(parseFloat(adminAffiliateForm.commissionRate || 0.30) * 100)}
 onChange={e => setAdminAffiliateForm(f => ({ ...f, commissionRate: (parseInt(e.target.value || 30) / 100).toFixed(2) }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
 <p className="text-xs text-[#A0A4AB] mt-1">Earns ${(299 * parseFloat(adminAffiliateForm.commissionRate || 0.30) / 100).toFixed(2)}/mo per paying user</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Max Redemptions (optional)</label>
 <input type="number" value={adminAffiliateForm.maxRedemptions || ''} onChange={e => setAdminAffiliateForm(f => ({ ...f, maxRedemptions: e.target.value ? parseInt(e.target.value) : '' }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Unlimited" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Expiration Date (optional)</label>
 <input type="date" value={adminAffiliateForm.expirationDate ? adminAffiliateForm.expirationDate.split('T')[0] : ''} onChange={e => setAdminAffiliateForm(f => ({ ...f, expirationDate: e.target.value || '' }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Payment Method</label>
 <select value={adminAffiliateForm.paymentMethod} onChange={e => setAdminAffiliateForm(f => ({ ...f, paymentMethod: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
 <option value="paypal">PayPal</option>
 <option value="venmo">Venmo</option>
 <option value="zelle">Zelle</option>
 <option value="check">Check</option>
 <option value="bank_transfer">Bank Transfer</option>
 </select>
 </div>
 <div className="sm:col-span-2">
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Payment Details</label>
 <input value={adminAffiliateForm.paymentDetails} onChange={e => setAdminAffiliateForm(f => ({ ...f, paymentDetails: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="PayPal email, Venmo handle, etc." />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Notes</label>
 <textarea value={adminAffiliateForm.notes} onChange={e => setAdminAffiliateForm(f => ({ ...f, notes: e.target.value }))}
 rows={2} className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Optional notes..." />
 </div>
 {adminAffiliateForm.id && (
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Status</label>
 <select value={adminAffiliateForm.status || 'active'} onChange={e => setAdminAffiliateForm(f => ({ ...f, status: e.target.value }))}
 className="w-full px-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
 <option value="active">Active</option>
 <option value="paused">Paused</option>
 <option value="expired">Expired</option>
 </select>
 </div>
 )}
 </div>
 <div className="flex gap-3 pt-2">
 <button
 disabled={adminAffiliateSaving || !adminAffiliateForm.name || !adminAffiliateForm.email || !adminAffiliateForm.code}
 onClick={async () => {
 setAdminAffiliateSaving(true);
 try {
 if (adminAffiliateForm.id) {
 await api.affiliates.adminUpdate(adminAffiliateForm.id, adminAffiliateForm);
 } else {
 await api.affiliates.adminCreate(adminAffiliateForm);
 }
 setAdminAffiliateForm(null);
 const data = await api.affiliates.adminAll();
 setAdminAffiliates(data);
 } catch (e) { alert(e.message || 'Save failed'); }
 finally { setAdminAffiliateSaving(false); }
 }}
 className={`flex-1 py-2.5 font-bold rounded-xl text-sm transition-all ${
 adminAffiliateSaving || !adminAffiliateForm.name || !adminAffiliateForm.email || !adminAffiliateForm.code
 ? 'bg-gray-600 text-[#A0A4AB] cursor-not-allowed'
 : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-amber-500/30'
 }`}
 >
 {adminAffiliateSaving ? 'Saving...' : adminAffiliateForm.id ? 'Update Influencer' : 'Add Influencer'}
 </button>
 <button onClick={() => { setAdminAffiliateForm(null); setAdminAffiliateDetail(null); }} className="px-6 py-2.5 bg-[#151A22] text-[#A0A4AB] font-bold rounded-xl hover:bg-[#222A36] text-sm">Cancel</button>
 </div>
 </div>
 )}

 {adminAffiliateDetail && (
 <div className="bg-[#0F1115] rounded-xl border border-[#222A36] p-5 mb-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-white font-bold text-sm">
 <Users className="w-4 h-4 inline mr-1" /> {adminAffiliateDetail.name} — REFERRALS & PAYOUTS
 </h3>
 <button onClick={() => { setAdminAffiliateDetail(null); setAdminAffiliateReferrals([]); setAdminPayoutForm(null); }}
 className="text-[#A0A4AB] hover:text-white text-sm font-bold">Close</button>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
 <div className="bg-[#151A22] rounded-lg p-3 text-center">
 <div className="text-lg font-bold text-white">{adminAffiliateDetail.total_referrals}</div>
 <div className="text-xs text-[#A0A4AB]">Total Referrals</div>
 </div>
 <div className="bg-[#151A22] rounded-lg p-3 text-center">
 <div className="text-lg font-bold text-green-400">${((adminAffiliateDetail.total_earned_cents || 0) / 100).toFixed(2)}</div>
 <div className="text-xs text-[#A0A4AB]">Total Earned</div>
 </div>
 <div className="bg-[#151A22] rounded-lg p-3 text-center">
 <div className="text-lg font-bold text-blue-400">${((adminAffiliateDetail.total_paid_cents || 0) / 100).toFixed(2)}</div>
 <div className="text-xs text-[#A0A4AB]">Total Paid</div>
 </div>
 <div className="bg-[#151A22] rounded-lg p-3 text-center">
 <div className="text-lg font-bold text-yellow-400">${(((adminAffiliateDetail.total_earned_cents || 0) - (adminAffiliateDetail.total_paid_cents || 0)) / 100).toFixed(2)}</div>
 <div className="text-xs text-[#A0A4AB]">Unpaid Balance</div>
 </div>
 </div>

 {!adminPayoutForm && ((adminAffiliateDetail.total_earned_cents || 0) - (adminAffiliateDetail.total_paid_cents || 0)) > 0 && (
 <button onClick={() => setAdminPayoutForm({ amountCents: (adminAffiliateDetail.total_earned_cents || 0) - (adminAffiliateDetail.total_paid_cents || 0), paymentMethod: adminAffiliateDetail.payment_method, paymentReference: '', notes: '' })}
 className="w-full mb-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl text-sm hover:shadow-green-500/30 transition-all">
 <DollarSign className="w-4 h-4 inline mr-1" /> Process Payout
 </button>
 )}

 {adminPayoutForm && (
 <div className="bg-[#151A22] rounded-lg border border-green-500/20 p-4 mb-4 space-y-3">
 <h4 className="text-green-400 font-bold text-sm">PROCESS PAYOUT</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Amount ($)</label>
 <input type="number" step="0.01" value={(adminPayoutForm.amountCents / 100).toFixed(2)}
 onChange={e => setAdminPayoutForm(f => ({ ...f, amountCents: Math.round(parseFloat(e.target.value || 0) * 100) }))}
 className="w-full px-3 py-2 bg-[#0F1115] border border-[#222A36] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Payment Method</label>
 <input value={adminPayoutForm.paymentMethod} onChange={e => setAdminPayoutForm(f => ({ ...f, paymentMethod: e.target.value }))}
 className="w-full px-3 py-2 bg-[#0F1115] border border-[#222A36] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Payment Reference</label>
 <input value={adminPayoutForm.paymentReference} onChange={e => setAdminPayoutForm(f => ({ ...f, paymentReference: e.target.value }))}
 placeholder="Transaction ID, check #, etc." className="w-full px-3 py-2 bg-[#0F1115] border border-[#222A36] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Notes</label>
 <input value={adminPayoutForm.notes} onChange={e => setAdminPayoutForm(f => ({ ...f, notes: e.target.value }))}
 placeholder="Optional" className="w-full px-3 py-2 bg-[#0F1115] border border-[#222A36] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
 </div>
 </div>
 <div className="flex gap-2">
 <button disabled={!adminPayoutForm.amountCents} onClick={async () => {
 if (!confirm(`Pay $${(adminPayoutForm.amountCents / 100).toFixed(2)} to ${adminAffiliateDetail.name}?`)) return;
 try {
 await api.affiliates.adminPayout(adminAffiliateDetail.id, adminPayoutForm);
 setAdminPayoutForm(null);
 const data = await api.affiliates.adminAll();
 setAdminAffiliates(data);
 const updated = data.find(a => a.id === adminAffiliateDetail.id);
 if (updated) setAdminAffiliateDetail(updated);
 alert('Payout recorded successfully!');
 } catch (e) { alert(e.message || 'Payout failed'); }
 }} className="flex-1 py-2 bg-green-500 text-white font-bold rounded-lg text-sm hover:bg-green-600">Confirm Payout</button>
 <button onClick={() => setAdminPayoutForm(null)} className="px-4 py-2 bg-[#0F1115] text-[#A0A4AB] rounded-lg text-sm hover:bg-[#222A36]">Cancel</button>
 </div>
 </div>
 )}

 <div className="mb-3">
 <h4 className="text-[#A0A4AB] font-bold text-xs mb-2">REFERRALS</h4>
 {adminAffiliateReferrals.length === 0 ? (
 <p className="text-[#A0A4AB] text-sm">No referrals yet.</p>
 ) : (
 <div className="space-y-2 max-h-64 overflow-y-auto">
 {adminAffiliateReferrals.map(ref => (
 <div key={ref.id} className="flex items-center justify-between bg-[#151A22] rounded-lg px-3 py-2">
 <div>
 <span className="text-white text-sm font-medium">{ref.user_name || ref.user_email}</span>
 <span className="text-[#A0A4AB] text-xs ml-2">${(ref.commission_cents / 100).toFixed(2)} commission</span>
 <span className="text-[#A0A4AB] text-xs ml-2">{new Date(ref.created_at).toLocaleDateString()}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
 ref.status === 'approved' ? 'bg-green-500/20 text-green-400' : ref.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
 }`}>{ref.status}</span>
 {ref.status === 'pending' && (
 <>
 <button onClick={async () => {
 try { await api.affiliates.adminApproveReferral(ref.id);
 const refs = await api.affiliates.adminReferrals(adminAffiliateDetail.id); setAdminAffiliateReferrals(refs);
 const data = await api.affiliates.adminAll(); setAdminAffiliates(data);
 const updated = data.find(a => a.id === adminAffiliateDetail.id); if (updated) setAdminAffiliateDetail(updated);
 } catch (e) { alert(e.message); }
 }} className="p-1 bg-green-500/10 rounded hover:bg-green-500/20 text-green-400" title="Approve">
 <Check className="w-3.5 h-3.5" />
 </button>
 <button onClick={async () => {
 try { await api.affiliates.adminRejectReferral(ref.id);
 const refs = await api.affiliates.adminReferrals(adminAffiliateDetail.id); setAdminAffiliateReferrals(refs);
 } catch (e) { alert(e.message); }
 }} className="p-1 bg-red-500/10 rounded hover:bg-red-500/20 text-red-400" title="Reject">
 <X className="w-3.5 h-3.5" />
 </button>
 </>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {adminAffiliates.length === 0 && !adminAffiliateForm ? (
 <div className="text-center py-8 text-[#A0A4AB]">
 <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
 <p className="font-bold mb-1">No influencers yet</p>
 <p className="text-sm">Add influencers who promote Huddle Up. They get unique codes that give users 50% off Pro ($1.50/mo) and earn recurring commissions on each paying user.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {adminAffiliates.map(aff => {
 const unpaidCents = (aff.total_earned_cents || 0) - (aff.total_paid_cents || 0);
 return (
 <div key={aff.id} className={`bg-[#0F1115] rounded-xl border p-4 ${
 aff.status === 'active' ? 'border-green-500/20' : aff.status === 'paused' ? 'border-yellow-500/20' : 'border-red-500/20'
 }`}>
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
 {aff.name.charAt(0).toUpperCase()}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-white font-bold">{aff.name}</span>
 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
 aff.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
 : aff.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
 : 'bg-red-500/20 text-red-400 border border-red-500/30'
 }`}>{aff.status.toUpperCase()}</span>
 <span className="bg-[#151A22] text-[#1E90FF] px-2 py-0.5 text-xs font-mono rounded border border-[#222A36]">{aff.code}</span>
 </div>
 <div className="text-[#A0A4AB] text-xs mt-1">{aff.email} · {Math.round(parseFloat(aff.commission_rate || 0.30) * 100)}% commission · {aff.payment_method}</div>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
 <span className="text-[#A0A4AB]">{aff.total_referrals || 0} signups</span>
 <span className="text-cyan-400">{aff.total_signups || 0} signups</span>
 <span className="text-purple-400">{aff.active_paying_users || 0} paying</span>
 <span className="text-green-400 font-medium">${((aff.total_earned_cents || 0) / 100).toFixed(2)} earned</span>
 {unpaidCents > 0 && <span className="text-yellow-400 font-medium">${(unpaidCents / 100).toFixed(2)} unpaid</span>}
 </div>
 {aff.dashboard_token && (
 <div className="mt-1">
 <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/influencer/${aff.dashboard_token}`); alert('Dashboard link copied!'); }}
 className="text-xs text-amber-400 hover:text-amber-300 underline">Copy Dashboard Link</button>
 </div>
 )}
 </div>
 <div className="flex flex-col gap-2 flex-shrink-0">
 <button onClick={async () => {
 setAdminAffiliateForm(null);
 setAdminAffiliateDetail(aff);
 setAdminPayoutForm(null);
 try { const refs = await api.affiliates.adminReferrals(aff.id); setAdminAffiliateReferrals(refs); } catch (e) { setAdminAffiliateReferrals([]); }
 }} className="p-2 bg-[#151A22] rounded-lg hover:bg-[#222A36] text-[#A0A4AB] hover:text-white" title="View Details">
 <Eye className="w-4 h-4" />
 </button>
 <button onClick={() => { setAdminAffiliateDetail(null); setAdminAffiliateForm({
 id: aff.id, name: aff.name, email: aff.email, code: aff.code,
 commissionRate: aff.commission_rate || '0.30',
 maxRedemptions: aff.max_redemptions || '', expirationDate: aff.expiration_date || '',
 paymentMethod: aff.payment_method, paymentDetails: aff.payment_details || '',
 notes: aff.notes || '', status: aff.status,
 }); }} className="p-2 bg-[#151A22] rounded-lg hover:bg-[#222A36] text-[#A0A4AB] hover:text-white" title="Edit">
 <Pencil className="w-4 h-4" />
 </button>
 <button onClick={async () => {
 if (!confirm(`Delete affiliate "${aff.name}"? This will also remove their referral tracking history.`)) return;
 try { await api.affiliates.adminDelete(aff.id);
 const data = await api.affiliates.adminAll(); setAdminAffiliates(data);
 } catch (e) { alert(e.message || 'Delete failed'); }
 }} className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300" title="Delete">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-6">
 <h3 className="text-lg font-bold text-white mb-3">How It Works</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
 <div className="bg-[#0F1115] rounded-xl p-4 border border-[#222A36]">
 <div className="text-2xl mb-2">1️⃣</div>
 <div className="text-white font-bold mb-1">Add Affiliates</div>
 <div className="text-[#A0A4AB]">Create affiliate accounts with unique codes, set commission rates and payment preferences.</div>
 </div>
 <div className="bg-[#0F1115] rounded-xl p-4 border border-[#222A36]">
 <div className="text-2xl mb-2">2️⃣</div>
 <div className="text-white font-bold mb-1">Track Signups</div>
 <div className="text-[#A0A4AB]">When new users sign up with an affiliate's code, the referral is tracked automatically. Review and approve each referral.</div>
 </div>
 <div className="bg-[#0F1115] rounded-xl p-4 border border-[#222A36]">
 <div className="text-2xl mb-2">3️⃣</div>
 <div className="text-white font-bold mb-1">Process Payouts</div>
 <div className="text-[#A0A4AB]">When you're ready, process payouts via their preferred method (PayPal, Venmo, Zelle, etc.) and record the transaction.</div>
 </div>
 </div>
 </div>
 </>
 )}

 {adminTab === 'predictions' && (
 <div className="space-y-4">
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>PREDICTION MANAGEMENT</h2>
 <p className="text-[#A0A4AB] text-sm">Resolve game predictions by selecting the winning team. Points are awarded automatically to users with correct picks.</p>

 <button onClick={async () => {
   try {
     const data = await api.predictions.adminPendingGames();
     setAdminPendingGames(data);
   } catch(e) { alert(e.message); }
 }} className="px-4 py-2 bg-[#1E90FF] text-white font-bold rounded-xl text-sm hover:opacity-90">
   Refresh Pending Games
 </button>

 {adminPendingGames.length === 0 ? (
   <p className="text-[#A0A4AB] text-center py-6">No pending predictions to resolve. Click "Refresh Pending Games" to check.</p>
 ) : (
   <div className="space-y-3">
   {adminPendingGames.map(game => (
     <div key={game.game_id} className="bg-[#151A22] rounded-xl border border-[#222A36] p-4">
       <div className="flex items-center justify-between mb-2">
         <span className="text-xs text-[#1E90FF] bg-[#1E90FF]/10 px-2 py-0.5 rounded-full font-bold">{game.sport}</span>
         <span className="text-xs text-[#A0A4AB]">{game.prediction_count} predictions</span>
       </div>
       <p className="text-white font-bold mb-2">{game.home_team} vs {game.away_team}</p>
       <p className="text-[#A0A4AB] text-xs mb-3">Game time: {game.game_time ? new Date(game.game_time).toLocaleString() : 'N/A'}</p>

       {adminResolveGame === game.game_id ? (
         <div className="flex gap-2">
           <button onClick={async () => {
             if (!confirm(`Set ${game.home_team} as winner? This will award points to all correct predictions.`)) return;
             try {
               const result = await api.predictions.adminResolve(game.game_id, game.home_team);
               alert(`Resolved! ${result.resolved} predictions processed. Winner: ${game.home_team}`);
               setAdminResolveGame(null);
               const data = await api.predictions.adminPendingGames();
               setAdminPendingGames(data);
             } catch(e) { alert(e.message); }
           }} className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-500/30">
             {game.home_team} Wins
           </button>
           <button onClick={async () => {
             if (!confirm(`Set ${game.away_team} as winner? This will award points to all correct predictions.`)) return;
             try {
               const result = await api.predictions.adminResolve(game.game_id, game.away_team);
               alert(`Resolved! ${result.resolved} predictions processed. Winner: ${game.away_team}`);
               setAdminResolveGame(null);
               const data = await api.predictions.adminPendingGames();
               setAdminPendingGames(data);
             } catch(e) { alert(e.message); }
           }} className="flex-1 py-2 bg-[#1E90FF]/20 border border-[#1E90FF]/40 text-[#1E90FF] rounded-xl font-bold text-sm hover:bg-[#1E90FF]/30">
             {game.away_team} Wins
           </button>
           <button onClick={() => setAdminResolveGame(null)} className="px-3 py-2 bg-[#222A36] text-[#A0A4AB] rounded-xl text-sm">
             Cancel
           </button>
         </div>
       ) : (
         <button onClick={() => setAdminResolveGame(game.game_id)}
           className="w-full py-2 bg-orange-500/20 border border-orange-500/40 text-orange-400 rounded-xl font-bold text-sm hover:bg-orange-500/30">
           Resolve Game
         </button>
       )}
     </div>
   ))}
   </div>
 )}
 </div>
 )}

 {adminTab === 'seeddata' && (
 <div className="bg-[#0F1115] rounded-2xl border border-[#222A36] p-6">
 <h3 className="text-lg font-bold text-white mb-2">Demo Seed Data</h3>
 <p className="text-[#A0A4AB] text-sm mb-4">Populate the app with realistic demo users, watch parties, chat messages, and reviews to make it feel alive for new visitors.</p>
 <div className="flex gap-3 mb-4">
 <button
 onClick={async () => {
   if (!confirm('This will create 50 demo users, 28 parties with chat/reviews, and 12 venues. Continue?')) return;
   try {
     const res = await fetch('/api/seed/create', { method: 'POST', credentials: 'include' });
     const data = await res.json();
     if (data.success) alert(`Seed data created! ${data.users} users, ${data.parties} parties, ${data.venues} venues`);
     else alert('Error: ' + (data.error || 'Unknown'));
   } catch (e) { alert('Error: ' + e.message); }
 }}
 className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-all active:scale-95"
 >Seed Demo Data</button>
 <button
 onClick={async () => {
   if (!confirm('This will remove ALL demo/seed data (users, parties, messages). Real user data is safe. Continue?')) return;
   try {
     const res = await fetch('/api/seed/clear', { method: 'POST', credentials: 'include' });
     const data = await res.json();
     if (data.success) alert(`Cleared ${data.cleared} seed users and all their data.`);
     else alert('Error: ' + (data.error || 'Unknown'));
   } catch (e) { alert('Error: ' + e.message); }
 }}
 className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl text-sm border border-red-500/30 transition-all active:scale-95"
 >Clear Demo Data</button>
 </div>
 <div className="bg-[#151A22] rounded-xl p-4 border border-[#222A36]">
 <h4 className="text-white font-bold text-sm mb-2">What Gets Created:</h4>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
 <div className="text-center p-3 bg-[#0F1115] rounded-lg">
 <div className="text-2xl font-black text-[#1E90FF]">77</div>
 <div className="text-[#A0A4AB] text-xs">Demo Users</div>
 </div>
 <div className="text-center p-3 bg-[#0F1115] rounded-lg">
 <div className="text-2xl font-black text-green-400">46</div>
 <div className="text-[#A0A4AB] text-xs">Watch Parties</div>
 </div>
 <div className="text-center p-3 bg-[#0F1115] rounded-lg">
 <div className="text-2xl font-black text-amber-400">17</div>
 <div className="text-[#A0A4AB] text-xs">Real Venues</div>
 </div>
 <div className="text-center p-3 bg-[#0F1115] rounded-lg">
 <div className="text-2xl font-black text-purple-400">200+</div>
 <div className="text-[#A0A4AB] text-xs">Chat Messages</div>
 </div>
 </div>
 <p className="text-[#A0A4AB] text-xs mt-3">Includes realistic profiles, favorite teams, points, party attendees, chat conversations, reviews, and venue check-ins. Demo users have @huddleup-seed.demo emails so they won't conflict with real accounts.</p>
 </div>
 </div>
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

 const [cpSearchTerm, setCpSearchTerm] = useState('');
 const [cpSportFilter, setCpSportFilter] = useState('All');
 const createPartyScreenJSX = () => !selectedGame ? (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
 <button
 onClick={() => setCurrentScreen('games')}
 className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors"
 >
 <ArrowLeft className="w-5 h-5" />
 Back
 </button>
 <button
 onClick={() => setCurrentScreen('games')}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E90FF]/10 border border-[#1E90FF]/30 text-[#1E90FF] font-bold text-xs rounded-full hover:bg-[#1E90FF]/20 transition-all"
 >
 <Search className="w-3.5 h-3.5" />
 Browse All Games
 </button>
 </div>
 </div>
 <div className="max-w-2xl mx-auto px-4 py-6">
 <div className="text-center mb-6">
 <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>CREATE WATCH PARTY</h2>
 <p className="text-[#A0A4AB] text-sm">Follow these steps to host your watch party</p>
 </div>
 <div className="flex items-center gap-3 mb-6">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-full bg-[#1E90FF] flex items-center justify-center text-white text-xs font-black">1</div>
 <span className="text-white font-bold text-sm">Find a Game</span>
 </div>
 <div className="flex-1 h-0.5 bg-[#222A36]" />
 <div className="flex items-center gap-2 opacity-40">
 <div className="w-7 h-7 rounded-full bg-[#222A36] flex items-center justify-center text-[#A0A4AB] text-xs font-black">2</div>
 <span className="text-[#A0A4AB] font-bold text-sm">Set Details</span>
 </div>
 <div className="flex-1 h-0.5 bg-[#222A36]" />
 <div className="flex items-center gap-2 opacity-40">
 <div className="w-7 h-7 rounded-full bg-[#222A36] flex items-center justify-center text-[#A0A4AB] text-xs font-black">3</div>
 <span className="text-[#A0A4AB] font-bold text-sm">Publish</span>
 </div>
 </div>
 <div className="relative mb-4">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A4AB]" />
 <input
 type="text"
 placeholder="Search by team name..."
 value={cpSearchTerm}
 onChange={e => setCpSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white text-sm placeholder-[#A0A4AB]/50 focus:outline-none focus:border-[#1E90FF]/50"
 />
 </div>
 <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
 {['All', ...new Set(games.map(g => g.sport))].map(sport => (
 <button
 key={sport}
 onClick={() => setCpSportFilter(sport)}
 className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${cpSportFilter === sport ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB] border border-[#222A36] hover:border-[#1E90FF]/30'}`}
 >
 {SPORT_ICONS[sport] || '🏅'} {({'College Football':'NCAAF','College Basketball':'NCAA BB','Champions League':'CHL','Premier League':'EPL','Formula 1':'F1'})[sport] || sport}
 </button>
 ))}
 </div>
 {(() => {
 const upcoming = games
 .filter(g => g.gameStatus === 'scheduled' && new Date(g.startTime) > new Date())
 .filter(g => cpSportFilter === 'All' || g.sport === cpSportFilter)
 .filter(g => {
 if (!cpSearchTerm.trim()) return true;
 const q = cpSearchTerm.toLowerCase();
 return g.homeTeam.toLowerCase().includes(q) || g.awayTeam.toLowerCase().includes(q) || g.sport.toLowerCase().includes(q);
 })
 .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
 return (
 <>
 <p className="text-[#A0A4AB] text-xs mb-3">{upcoming.length} {upcoming.length === 1 ? 'game' : 'games'} found</p>
 <div className="space-y-3">
 {upcoming.slice(0, 30).map(game => (
 <div
 key={game.id}
 onClick={() => { setSelectedGame(game); }}
 className="bg-[#151A22] p-4 rounded-xl border border-[#222A36] hover:border-[#1E90FF]/50 cursor-pointer active:scale-[0.98] transition-all"
 >
 <div className="flex items-center gap-3">
 <div className="flex-shrink-0 flex items-center gap-2">
 {game.homeLogo && <img src={game.homeLogo} alt="" className="w-8 h-8 object-contain" />}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-white font-bold text-sm truncate">{game.homeTeam} vs {game.awayTeam}</p>
 <p className="text-[#A0A4AB] text-xs">{formatDateTime(game.startTime)} · {game.sport}</p>
 </div>
 <div className="flex-shrink-0">
 {game.awayLogo && <img src={game.awayLogo} alt="" className="w-8 h-8 object-contain" />}
 </div>
 </div>
 </div>
 ))}
 </div>
 {upcoming.length === 0 && (
 <div className="text-center py-12">
 <Search className="w-10 h-10 text-[#A0A4AB]/30 mx-auto mb-3" />
 <p className="text-[#A0A4AB] text-sm mb-1">No games match your search</p>
 <p className="text-[#A0A4AB]/60 text-xs mb-4">Try a different team or sport, or browse all games</p>
 <button onClick={() => { setCpSearchTerm(''); setCpSportFilter('All'); }} className="px-4 py-2 bg-[#151A22] text-[#1E90FF] font-bold text-xs rounded-full border border-[#1E90FF]/30 hover:bg-[#1E90FF]/10 transition-all mr-2">Clear Filters</button>
 <button onClick={() => setCurrentScreen('games')} className="px-4 py-2 bg-[#1E90FF] text-white font-bold text-xs rounded-full hover:opacity-90 transition-all">Browse Games</button>
 </div>
 )}
 </>
 );
 })()}
 </div>
 </div>
) : (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <button
 onClick={() => setCurrentScreen('gameDetail')}
 className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors"
 >
 <ArrowLeft className="w-5 h-5" />
 Back
 </button>
 </div>
 </div>

 <div className="max-w-2xl mx-auto px-4 py-6">
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36] shadow-xl space-y-6">
 <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 CREATE WATCH PARTY
 </h2>

 <div className="bg-[#1E90FF]/10 border border-[#1E90FF]/30 rounded-xl p-4">
 <div className="text-sm text-[#1E90FF] font-bold mb-1">GAME</div>
 <div className="text-white font-bold">
 {selectedGame.homeTeam} vs {selectedGame.awayTeam}
 </div>
 <div className="text-[#A0A4AB] text-sm">
 {formatDateTime(selectedGame.startTime)}
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
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
 ? 'border-yellow-400 shadow-sm shadow-yellow-500/20'
 : 'border-[#222A36] hover:border-white/30'
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
 <p className="text-xs text-[#A0A4AB]/70 mt-2">Select the team your watch party will be cheering for</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-3">
 Choose Location Type
 </label>
 <div className="flex gap-3">
 <button
 onClick={() => setCpUseVerifiedVenue(true)}
 className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
 cpUseVerifiedVenue
 ? 'bg-[#1E90FF] text-white shadow-sm'
 : 'bg-[#151A22] text-[#A0A4AB] hover:bg-[#222A36]'
 }`}
 >
 <Building2 className="w-5 h-5 inline mr-2" />
 Verified Venue
 </button>
 <button
 onClick={() => setCpUseVerifiedVenue(false)}
 className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
 !cpUseVerifiedVenue
 ? 'bg-[#1E90FF] text-white shadow-sm'
 : 'bg-[#151A22] text-[#A0A4AB] hover:bg-[#222A36]'
 }`}
 >
 <MapPin className="w-5 h-5 inline mr-2" />
 Custom Location
 </button>
 </div>
 </div>

 {cpUseVerifiedVenue ? (
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Select Verified Venue *
 </label>
 <select
 value={cpSelectedVenueId}
 onChange={(e) => setCpSelectedVenueId(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="">Choose a venue...</option>
 {venues.filter(v => v.verified).map(venue => (
 <option key={venue.id} value={venue.id}>
 {venue.subscribed ? '✓ ' : ''}{venue.featured ? '⭐ ' : ''}{venue.name} - {venue.address}
 </option>
 ))}
 </select>
 <p className="text-xs text-[#A0A4AB]/70 mt-2">
 ✓ Verified venues are legitimate businesses we've confirmed
 </p>
 <button
 onClick={() => setCurrentScreen('claimVenue')}
 className="text-[#1E90FF] text-sm hover:text-[#1E90FF]/80 mt-2"
 >
 Don't see your venue? Claim it here →
 </button>
 </div>
 ) : (
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Custom Location *
 </label>
 <input
 type="text"
 value={cpCustomLocation}
 onChange={(e) => setCpCustomLocation(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., My house, Dave's apartment, etc."
 />
 <p className="text-xs text-[#A0A4AB]/70 mt-1">For home watch parties or informal meetups</p>

 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4 space-y-3 mt-4">
 <div className="text-sm font-bold text-[#1E90FF] flex items-center gap-2">
 <MapPin className="w-4 h-4" /> Address Details (optional)
 </div>
 <p className="text-xs text-[#A0A4AB]/70">Adding an address helps guests find you and shows a map</p>
 <div>
 <label className="block text-xs font-medium text-[#A0A4AB] mb-1">Street Address</label>
 <input
 type="text"
 value={cpCustomAddress}
 onChange={(e) => setCpCustomAddress(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., 123 Main St"
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-[#A0A4AB] mb-1">City</label>
 <input
 type="text"
 value={cpCustomCity}
 onChange={(e) => setCpCustomCity(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., Austin"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-[#A0A4AB] mb-1">State</label>
 <select
 value={cpCustomState}
 onChange={(e) => setCpCustomState(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="">Select state</option>
 {US_STATES.map(st => (
 <option key={st} value={st}>{st} - {US_STATE_NAMES[st]}</option>
 ))}
 </select>
 </div>
 </div>
 {cpCustomAddress && cpCustomCity && (
 <div className="text-xs text-[#A0A4AB]/70 bg-[#151A22] rounded-lg p-2">
 Full address: {[cpCustomAddress, cpCustomCity, cpCustomState].filter(Boolean).join(', ')}
 </div>
 )}
 </div>
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Custom Time (optional)
 </label>
 <input
 type="text"
 value={cpCustomTime}
 onChange={(e) => setCpCustomTime(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., Meet at 5:30 PM (game starts at 6 PM)"
 />
 <p className="text-xs text-[#A0A4AB]/70 mt-1">Leave blank to use game start time</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Capacity (optional)
 </label>
 <input
 type="number"
 value={cpCapacity}
 onChange={(e) => setCpCapacity(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="Max number of people"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">
 Notes / Description (optional)
 </label>
 <textarea
 value={cpNotes}
 onChange={(e) => setCpNotes(e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="Any additional details about your watch party..."
 />
 </div>

 <button
 onClick={handleCpSubmit}
 className="w-full py-4 bg-[#1E90FF] text-white font-bold text-lg rounded-2xl shadow-sm hover:opacity-90 transition-all duration-200"
 >
 CREATE PARTY
 </button>
 </div>
 </div>
 </div>
 );

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
 const fileType = file.type || 'image/jpeg';
 if (!fileType.startsWith('image/')) {
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
 headers: { 'Content-Type': fileType, 'x-file-content-type': fileType, 'x-image-type': imageType },
 credentials: 'include',
 body: fileBuffer,
 });
 if (!uploadRes.ok) {
 const errData = await uploadRes.json().catch(() => ({}));
 throw new Error(errData.error || 'Upload failed');
 }
 const { objectPath } = await uploadRes.json();
 await api.venues.updateMine({ [imageType]: objectPath });
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
 <div className="min-h-screen pt-[60px] bg-[#0F1115] flex items-center justify-center p-4">
 <div className="text-center">
 <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
 <h2 className="text-2xl font-bold text-white mb-2">No Venue Found</h2>
 <p className="text-[#A0A4AB] mb-6">You don't have a claimed venue yet.</p>
 <button
 onClick={() => setCurrentScreen('claimVenue')}
 className="px-6 py-3 bg-[#1E90FF] text-white font-bold rounded-xl"
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
 <div className="space-y-6">
 {/* Venue Header */}
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36] shadow-xl">
 {!editingVenue ? (
 <>
 {userVenue.picture && (
 <div className="mb-6 -mt-2 -mx-2 rounded-xl overflow-hidden">
 <img src={`/api/uploads/serve/${userVenue.picture.replace('/objects/', '')}`} alt={userVenue.name} className="w-full h-48 object-cover" />
 </div>
 )}
 <div className="flex items-start gap-3 mb-3">
 {userVenue.logo && (
 <img src={`/api/uploads/serve/${userVenue.logo.replace('/objects/', '')}`} alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#222A36] flex-shrink-0" />
 )}
 <div className="flex-1 min-w-0">
 <h1 className="text-2xl sm:text-4xl font-black text-white mb-1 break-words" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 {userVenue.name}
 </h1>
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-2 mb-3">
 <div className="px-3 py-1 bg-[#1E90FF]/20 border border-[#1E90FF]/30 rounded-lg">
 <span className="text-xs text-[#A0A4AB]">Plan: </span>
 <span className="text-sm font-black text-[#1E90FF]">{userVenue.featured ? 'FEATURED' : 'FREE'}</span>
 </div>
 <button
 onClick={startEditing}
 className="flex items-center gap-2 px-3 py-1.5 bg-[#151A22] text-white rounded-lg hover:bg-[#222A36] transition-all text-sm font-bold border border-[#222A36]"
 >
 <Settings className="w-4 h-4" />
 Edit Details
 </button>
 </div>
 <div className="space-y-1">
 <p className="text-[#A0A4AB] text-sm"><AddressLink address={userVenue.address} /></p>
 {userVenue.city && <p className="text-[#A0A4AB] text-sm">{userVenue.city}</p>}
 <p className="text-sm text-[#A0A4AB]/70">{userVenue.type}</p>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#A0A4AB]">
 {userVenue.phone && <span>Phone: {userVenue.phone}</span>}
 {userVenue.website && <span className="break-all">Web: {userVenue.website}</span>}
 {userVenue.capacity && <span>Seats: {userVenue.capacity}</span>}
 </div>
 {userVenue.description && (
 <p className="text-[#A0A4AB] text-sm mt-2 italic">"{userVenue.description}"</p>
 )}
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
 className="text-[#A0A4AB] hover:text-white transition-colors text-sm"
 >
 Cancel
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Business Name *</label>
 <input type="text" value={venueEditName} onChange={(e) => setVenueEditName(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Business Type</label>
 <select value={venueEditType} onChange={(e) => setVenueEditType(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="Sports Bar" className="bg-[#151A22] text-white">Sports Bar</option>
 <option value="Restaurant & Bar" className="bg-[#151A22] text-white">Restaurant & Bar</option>
 <option value="Brewery/Taproom" className="bg-[#151A22] text-white">Brewery/Taproom</option>
 <option value="Entertainment Venue" className="bg-[#151A22] text-white">Entertainment Venue</option>
 <option value="Other" className="bg-[#151A22] text-white">Other</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Full Address *</label>
 <input type="text" value={venueEditAddress} onChange={(e) => setVenueEditAddress(e.target.value)}
 placeholder="123 Main St, Suite #110"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">City, State</label>
 <input type="text" value={venueEditCity} onChange={(e) => setVenueEditCity(e.target.value)}
 placeholder="e.g., Fort Lauderdale, FL"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Phone Number</label>
 <input type="tel" value={venueEditPhone} onChange={(e) => setVenueEditPhone(e.target.value)}
 placeholder="(555) 123-4567"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Website</label>
 <input type="text" value={venueEditWebsite} onChange={(e) => setVenueEditWebsite(e.target.value)}
 placeholder="yourwebsite.com"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Seating Capacity</label>
 <input type="number" value={venueEditCapacity} onChange={(e) => setVenueEditCapacity(e.target.value)}
 placeholder="e.g., 150"
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-1">Venue Description & Special Features</label>
 <textarea value={venueEditDescription} onChange={(e) => setVenueEditDescription(e.target.value)}
 rows={3}
 placeholder="Tell fans what makes your venue great! e.g., 20 big screens, outdoor patio, game day drink specials, private party rooms..."
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Venue Logo</label>
 <div className="flex items-center gap-4">
 {userVenue.logo ? (
 <img src={`/api/uploads/serve/${userVenue.logo.replace('/objects/', '')}`} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-[#222A36]" />
 ) : (
 <div className="w-16 h-16 rounded-xl bg-[#151A22] border border-[#222A36] flex items-center justify-center text-[#A0A4AB]/70">
 <Building2 className="w-6 h-6" />
 </div>
 )}
 <button type="button" disabled={uploadingLogo}
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVenueImageUpload('logo'); }}
 className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${uploadingLogo ? 'bg-gray-500 text-[#A0A4AB]' : 'bg-[#1E90FF]/20 text-[#1E90FF] hover:bg-[#1E90FF]/30 border border-[#1E90FF]/30'}`}>
 {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
 </button>
 </div>
 <p className="text-xs text-[#A0A4AB]/70 mt-1">Square image works best (e.g., 200x200)</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Venue Photo</label>
 <div className="flex items-center gap-4">
 {userVenue.picture ? (
 <img src={`/api/uploads/serve/${userVenue.picture.replace('/objects/', '')}`} alt="Venue" className="w-24 h-16 rounded-xl object-cover border border-[#222A36]" />
 ) : (
 <div className="w-24 h-16 rounded-xl bg-[#151A22] border border-[#222A36] flex items-center justify-center text-[#A0A4AB]/70">
 <Camera className="w-6 h-6" />
 </div>
 )}
 <button type="button" disabled={uploadingPicture}
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVenueImageUpload('picture'); }}
 className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${uploadingPicture ? 'bg-gray-500 text-[#A0A4AB]' : 'bg-[#1E90FF]/20 text-[#1E90FF] hover:bg-[#1E90FF]/30 border border-[#1E90FF]/30'}`}>
 {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
 </button>
 </div>
 <p className="text-xs text-[#A0A4AB]/70 mt-1">Show fans what your venue looks like</p>
 </div>
 </div>

 <div className="flex gap-3 pt-2">
 <button
 onClick={saveVenueDetails}
 disabled={savingVenue || !venueEditName || !venueEditAddress}
 className={`flex-1 py-3 font-bold rounded-xl transition-all ${
 savingVenue || !venueEditName || !venueEditAddress
 ? 'bg-gray-500 text-[#A0A4AB] cursor-not-allowed'
 : 'bg-[#1E90FF] text-white hover:opacity-90'
 }`}
 >
 {savingVenue ? 'Saving...' : 'Save Changes'}
 </button>
 <button
 onClick={() => setEditingVenue(false)}
 className="px-6 py-3 bg-[#151A22] text-[#A0A4AB] font-bold rounded-xl hover:bg-[#222A36] transition-all"
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
 <p className="text-[#A0A4AB] text-sm mb-4">
 Get 3x more visibility! Featured venues appear first in party creation and get priority placement in search results.
 </p>
 <ul className="space-y-2 text-sm text-[#A0A4AB] mb-4">
 <li>✓ ⭐ Featured badge on all your parties</li>
 <li>✓ Top of venue selection dropdown</li>
 <li>✓ Priority in search results</li>
 <li>✓ Advanced analytics & insights</li>
 </ul>
 <div className="text-2xl font-black text-white mb-4">
 $49.99<span className="text-sm text-[#A0A4AB]">/month</span>
 </div>
 </div>
 <button
 onClick={async () => {
 try {
 let products = await api.stripe.products();
 let featuredProduct = products.find(p => p.metadata?.tier === 'featured_venue');
 if (!featuredProduct || featuredProduct.prices.length === 0) {
 await new Promise(r => setTimeout(r, 2000));
 products = await api.stripe.products();
 featuredProduct = products.find(p => p.metadata?.tier === 'featured_venue');
 }
 if (featuredProduct && featuredProduct.prices.length > 0) {
 const result = await api.stripe.checkout(featuredProduct.prices[0].id);
 if (result?.url) window.location.href = result.url;
 } else { alert('Plans are loading. Please wait a moment and try again.'); }
 } catch(e) { console.error(e); alert('Something went wrong. Please try again.'); }
 }}
 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-purple-500/50 transition-all"
 >
 UPGRADE NOW
 </button>
 </div>
 </div>
 )}

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-[#1E90FF]/20 rounded-lg">
 <Users className="w-5 h-5 text-[#1E90FF]" />
 </div>
 <div className="text-sm text-[#A0A4AB]">Total Reach</div>
 </div>
 <div className="text-3xl font-black text-white">{totalAttendees}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">People found you</div>
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-purple-500/20 rounded-lg">
 <Calendar className="w-5 h-5 text-purple-400" />
 </div>
 <div className="text-sm text-[#A0A4AB]">Total Parties</div>
 </div>
 <div className="text-3xl font-black text-white">{venueParties.length}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">All time</div>
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-green-500/20 rounded-lg">
 <Trophy className="w-5 h-5 text-green-400" />
 </div>
 <div className="text-sm text-[#A0A4AB]">Upcoming</div>
 </div>
 <div className="text-3xl font-black text-white">{upcomingParties.length}</div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">Next 7 days</div>
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-yellow-500/20 rounded-lg">
 <BarChart3 className="w-5 h-5 text-yellow-400" />
 </div>
 <div className="text-sm text-[#A0A4AB]">Avg Party Size</div>
 </div>
 <div className="text-3xl font-black text-white">
 {venueParties.length > 0 ? Math.round(totalAttendees / venueParties.length) : 0}
 </div>
 <div className="text-xs text-[#A0A4AB]/70 mt-1">People per party</div>
 </div>
 </div>

 {/* Sport Breakdown */}
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36]">
 <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <BarChart3 className="inline w-6 h-6 mr-2 text-[#1E90FF]" />
 Sport Breakdown
 </h2>
 
 {Object.keys(sportBreakdown).length === 0 ? (
 <div className="text-center py-8">
 <p className="text-white font-bold text-sm mb-1">No watch parties yet</p>
 <p className="text-[#A0A4AB] text-xs">We're in soft launch — parties will show up as fans start hosting at your venue.</p>
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
 <span className="text-[#A0A4AB] text-sm">{count} parties ({percentage}%)</span>
 </div>
 <div className="h-3 bg-[#151A22] rounded-full overflow-hidden">
 <div 
 className="h-full bg-[#1E90FF] rounded-full transition-all duration-500"
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
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36]">
 <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 Recent Watch Parties
 </h2>
 
 {recentParties.length === 0 ? (
 <div className="text-center py-8">
 <p className="text-white font-bold text-sm mb-1">No watch parties yet</p>
 <p className="text-[#A0A4AB] text-xs">We're in soft launch — people will start hosting at your venue soon!</p>
 </div>
 ) : (
 <div className="space-y-3">
 {recentParties.map(party => {
 const game = games.find(g => g.id === party.gameId);
 if (!game) return null;
 
 return (
 <div
 key={party.id}
 className="bg-[#151A22] p-5 rounded-xl border border-[#222A36] flex items-center justify-between"
 >
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="px-2 py-1 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-full">
 {game.sport}
 </span>
 <span className="text-white font-bold">
 {game.homeTeam} vs {game.awayTeam}
 </span>
 </div>
 <div className="text-sm text-[#A0A4AB]">
 Hosted by {party.hostName} • {party.attendees.length} attendees
 </div>
 </div>
 <div className="flex flex-col items-end gap-1">
 <div className="text-sm text-[#A0A4AB]/70">
 {new Date(party.createdAt).toLocaleDateString()}
 </div>
 <button onClick={(e) => { e.stopPropagation(); openShareMenu(party); }} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
 <Share2 className="w-3 h-3" /> Share
 </button>
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
 <p className="text-[#A0A4AB] text-sm">Share your venue with fans and drive more watch parties to your business.</p>

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
 className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:shadow-emerald-500/50 transition-all text-sm"
 >
 <Share2 className="w-5 h-5" />
 Share Your Venue
 </button>

 <button
 onClick={shareApp}
 className="flex items-center justify-center gap-3 py-4 bg-[#1E90FF] text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm"
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
 className="flex items-center justify-center gap-3 py-4 bg-[#151A22] text-white font-bold rounded-xl hover:bg-[#222A36] transition-all border border-[#222A36] text-sm"
 >
 <span className="text-lg">📋</span>
 Copy Social Media Post
 </button>

 <button
 onClick={() => setCurrentScreen('games')}
 className="flex items-center justify-center gap-3 py-4 bg-[#151A22] text-white font-bold rounded-xl hover:bg-[#222A36] transition-all border border-[#222A36] text-sm"
 >
 <Calendar className="w-5 h-5" />
 Create a Watch Party
 </button>
 </div>

 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4 space-y-2">
 <p className="text-white font-bold text-sm">Quick promo ideas:</p>
 <ul className="space-y-1.5 text-xs text-[#A0A4AB]">
 <li>• Post your Huddle Up link on Instagram, Facebook, and X</li>
 <li>• Add a QR code or table tent: "Find tonight's watch party on Huddle Up!"</li>
 <li>• Text your regulars the link before big game days</li>
 <li>• Offer a game day special and mention it in your party description</li>
 </ul>
 </div>
 </div>

 <VenueQrSection userVenue={userVenue} />

 {/* Tips for Venues */}
 <div className="bg-gradient-to-br from-cyan-500/10 to-[#1E90FF]/10 border border-[#1E90FF]/30 p-6 rounded-2xl">
 <h3 className="text-lg font-black text-white mb-4">Tips to Get More Watch Parties</h3>
 <ul className="space-y-2 text-sm text-[#A0A4AB]">
 <li>• Promote your Huddle Up presence on social media and in-store</li>
 <li>• Offer specials during big games to attract more groups</li>
 <li>• Encourage hosts to leave notes about your venue's amenities</li>
 <li>• Consider upgrading to Featured to appear first in searches</li>
 </ul>
 </div>
 </div>
 );
 };



 const VenueHubScreen = () => {
 const [hubTab, setHubTab] = useState('dashboard');
 const [promotions, setPromotions] = useState([]);
 const [deals, setDeals] = useState([]);
 const [loadingHub, setLoadingHub] = useState(true);
 const [showNewPromo, setShowNewPromo] = useState(false);
 const [showNewDeal, setShowNewDeal] = useState(false);
 const [promoForm, setPromoForm] = useState({ title: '', description: '', sport: '', homeTeam: '', awayTeam: '', specials: '', gameDate: '', expiresAt: '' });
 const [dealForm, setDealForm] = useState({ title: '', description: '', dealType: 'special', validUntil: '', terms: '', recurring: false, recurringDays: '' });
 const [saving, setSaving] = useState(false);

 useEffect(() => {
 if (userVenue) {
 Promise.all([
 api.venueHub.getPromotions().catch(() => []),
 api.venueHub.getDeals().catch(() => [])
 ]).then(([p, d]) => { setPromotions(p); setDeals(d); setLoadingHub(false); });
 } else { setLoadingHub(false); }
 }, [userVenue]);

 if (!userVenue) {
 return (
 <div className="min-h-screen pt-[60px] bg-[#0F1115] flex items-center justify-center p-4">
 <div className="text-center">
 <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
 <h2 className="text-2xl font-bold text-white mb-2">No Venue Found</h2>
 <p className="text-[#A0A4AB] mb-6">You don't have a claimed venue yet.</p>
 <button onClick={() => setCurrentScreen('claimVenue')} className="px-6 py-3 bg-[#1E90FF] text-white font-bold rounded-xl">Claim Your Venue</button>
 </div>
 </div>
 );
 }

 const savePromotion = async () => {
 if (!promoForm.title) return alert('Title is required');
 setSaving(true);
 try {
 const newPromo = await api.venueHub.createPromotion(promoForm);
 setPromotions([newPromo, ...promotions]);
 setShowNewPromo(false);
 setPromoForm({ title: '', description: '', sport: '', homeTeam: '', awayTeam: '', specials: '', gameDate: '', expiresAt: '' });
 } catch (err) { alert(err.message); }
 setSaving(false);
 };

 const saveDeal = async () => {
 if (!dealForm.title || !dealForm.description) return alert('Title and description are required');
 setSaving(true);
 try {
 const newDeal = await api.venueHub.createDeal(dealForm);
 setDeals([newDeal, ...deals]);
 setShowNewDeal(false);
 setDealForm({ title: '', description: '', dealType: 'special', validUntil: '', terms: '', recurring: false, recurringDays: '' });
 } catch (err) { alert(err.message); }
 setSaving(false);
 };

 const deletePromotion = async (id) => {
 if (!confirm('Delete this promotion?')) return;
 try { await api.venueHub.deletePromotion(id); setPromotions(promotions.filter(p => p.id !== id)); } catch (err) { alert(err.message); }
 };

 const deleteDeal = async (id) => {
 if (!confirm('Delete this deal?')) return;
 try { await api.venueHub.deleteDeal(id); setDeals(deals.filter(d => d.id !== id)); } catch (err) { alert(err.message); }
 };

 const toggleDealActive = async (deal) => {
 try {
 const updated = await api.venueHub.updateDeal(deal.id, { active: !deal.active });
 setDeals(deals.map(d => d.id === deal.id ? updated : d));
 } catch (err) { alert(err.message); }
 };

 const SPORTS_LIST = ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League', 'La Liga', 'Champions League', 'College Football', 'College Basketball', 'UFC/MMA', 'Boxing', 'NASCAR', 'F1', 'Tennis', 'Golf'];

 const trialActive = userVenue.onTrial;
 const trialEndsAt = userVenue.venueTrialEndsAt ? new Date(userVenue.venueTrialEndsAt) : null;
 const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24))) : 0;

 const tabs = [
 { id: 'dashboard', label: 'Dashboard', icon: '📊' },
 { id: 'featured', label: 'Plans & Pricing', icon: '⭐' },
 { id: 'promotions', label: 'Promote Games', icon: '📢' },
 { id: 'deals', label: 'Deals & Specials', icon: '🏷️' },
 ];

 return (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-3">
 <div className="flex items-center justify-between mb-3">
 <button onClick={() => setCurrentScreen('profile')} className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors">
 <ArrowLeft className="w-5 h-5" /> Back
 </button>
 <div className="flex items-center gap-2">
 {userVenue.featured && <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-300" /> Featured</span>}
 {userVenue.verified && <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>}
 </div>
 </div>
 <div className="flex items-center gap-3 mb-3">
 {userVenue.logo && <img src={`/api/uploads/serve/${userVenue.logo.replace('/objects/', '')}`} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-[#222A36]" />}
 <div>
 <h1 className="text-xl font-black text-white">{userVenue.name}</h1>
 <p className="text-xs text-[#A0A4AB]">Venue Hub</p>
 </div>
 </div>
 <div className="flex gap-1 overflow-x-auto scrollbar-hide">
 {tabs.map(tab => (
 <button key={tab.id} onClick={() => setHubTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${hubTab === tab.id ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-[#A0A4AB] hover:bg-[#222A36]'}`}>
 <span>{tab.icon}</span> {tab.label}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
 {hubTab === 'dashboard' && trialActive && (
 <div className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-blue-900/40 mb-2">
 <div className="p-4">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center"><Gift className="w-4 h-4 text-blue-300" /></div>
 <div>
 <h3 className="text-white font-black text-sm">FREE TRIAL ACTIVE</h3>
 <p className="text-blue-200 text-[10px]">{trialDaysLeft} days remaining</p>
 </div>
 </div>
 <p className="text-white/60 text-xs mb-2">You're on a free 3-month trial. All Base tier features are available. Choose a plan before your trial ends to keep your venue listed.</p>
 <button onClick={() => setHubTab('featured')} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold rounded-xl text-xs border border-blue-500/30 transition-all">
 View Plans & Pricing
 </button>
 </div>
 </div>
 )}
 {hubTab === 'dashboard' && (
 <div className="relative overflow-hidden rounded-2xl border border-green-500/40 bg-gradient-to-r from-green-900/60 via-emerald-900/50 to-teal-900/40 mb-2">
 <div className="p-4">
 <h3 className="text-white font-black text-base leading-tight mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
 SHARE YOUR VENUE WITH FANS
 </h3>
 <p className="text-white/60 text-xs mb-3">Get your venue set up so fans can find watch parties at your location!</p>
 <div className="grid grid-cols-3 gap-2 text-center">
 <div className="bg-black/20 rounded-xl p-2">
 <Camera className="w-4 h-4 text-green-300 mx-auto mb-1" />
 <p className="text-white text-[10px] font-bold">Add Photos</p>
 </div>
 <div className="bg-black/20 rounded-xl p-2">
 <Megaphone className="w-4 h-4 text-green-300 mx-auto mb-1" />
 <p className="text-white text-[10px] font-bold">Create Promos</p>
 </div>
 <div className="bg-black/20 rounded-xl p-2">
 <DollarSign className="w-4 h-4 text-green-300 mx-auto mb-1" />
 <p className="text-white text-[10px] font-bold">Set Up Deals</p>
 </div>
 </div>
 </div>
 </div>
 )}
 {hubTab === 'dashboard' && VenueAnalyticsDashboard()}

 {hubTab === 'featured' && (
 <div className="space-y-4">
 {trialActive && (
 <div className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-blue-900/40">
 <div className="p-4">
 <div className="flex items-center gap-2 mb-2">
 <Gift className="w-5 h-5 text-blue-300" />
 <h3 className="text-white font-black text-sm">FREE TRIAL - {trialDaysLeft} DAYS LEFT</h3>
 </div>
 <p className="text-white/60 text-xs">Your 3-month free trial includes all Base tier features. Choose a plan below to continue after your trial ends{trialEndsAt ? ` on ${trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}.</p>
 </div>
 </div>
 )}

 {userVenue.featured ? (
 <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-yellow-900/20">
 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
 <div className="p-5">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
 <Star className="w-6 h-6 text-white fill-white" />
 </div>
 <div>
 <h2 className="text-xl font-black text-white">Featured Venue</h2>
 <p className="text-amber-300 text-xs font-bold">Your venue is currently featured!</p>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3 mt-4">
 <div className="bg-black/20 rounded-xl p-3 border border-amber-500/20">
 <TrendingUp className="w-5 h-5 text-amber-400 mb-1" />
 <p className="text-white font-bold text-sm">Priority Search</p>
 <p className="text-white/50 text-xs">You appear first in results</p>
 </div>
 <div className="bg-black/20 rounded-xl p-3 border border-amber-500/20">
 <Award className="w-5 h-5 text-amber-400 mb-1" />
 <p className="text-white font-bold text-sm">Featured Badge</p>
 <p className="text-white/50 text-xs">Stand out from other venues</p>
 </div>
 <div className="bg-black/20 rounded-xl p-3 border border-amber-500/20">
 <Flame className="w-5 h-5 text-amber-400 mb-1" />
 <p className="text-white font-bold text-sm">Trending Boost</p>
 <p className="text-white/50 text-xs">Boosted in trending feed</p>
 </div>
 <div className="bg-black/20 rounded-xl p-3 border border-amber-500/20">
 <BarChart3 className="w-5 h-5 text-amber-400 mb-1" />
 <p className="text-white font-bold text-sm">Enhanced Stats</p>
 <p className="text-white/50 text-xs">Detailed analytics access</p>
 </div>
 </div>
 <button
 onClick={async () => { try { const d = await api.stripe.portal(); if (d?.url) window.location.href = d.url; } catch(e) { console.error(e); } }}
 className="w-full mt-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all"
 >
 Manage Subscription
 </button>
 </div>
 </div>
 ) : userVenue.subscribed ? (
 <div className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-900/40 via-[#151A22] to-blue-900/20">
 <div className="p-5">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
 <Building2 className="w-6 h-6 text-white" />
 </div>
 <div>
 <h2 className="text-xl font-black text-white">Base Venue Plan</h2>
 <p className="text-blue-300 text-xs font-bold">$29.99/month - Active</p>
 </div>
 </div>
 <p className="text-white/60 text-xs mb-4">You're on the Base plan. Upgrade to Featured for priority placement and more visibility.</p>
 <div className="flex gap-3">
 <button
 onClick={async () => { try { const d = await api.stripe.portal(); if (d?.url) window.location.href = d.url; } catch(e) { console.error(e); } }}
 className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all"
 >
 Manage Subscription
 </button>
 <button
 onClick={async () => {
 try {
 let products = await api.stripe.products();
 let featuredProduct = products.find(p => p.metadata?.tier === 'featured_venue');
 if (!featuredProduct || featuredProduct.prices.length === 0) {
 await new Promise(r => setTimeout(r, 2000));
 products = await api.stripe.products();
 featuredProduct = products.find(p => p.metadata?.tier === 'featured_venue');
 }
 if (featuredProduct && featuredProduct.prices.length > 0) {
 const result = await api.stripe.checkout(featuredProduct.prices[0].id);
 if (result?.url) window.location.href = result.url;
 } else { alert('Plans are loading. Please wait a moment and try again.'); }
 } catch(e) { console.error(e); alert('Something went wrong. Please try again.'); }
 }}
 className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl text-sm transition-all"
 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em' }}
 >
 Upgrade to Featured
 </button>
 </div>
 </div>
 </div>
 ) : null}

 {!userVenue.featured && (
 <div className="space-y-4">
 <h3 className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>CHOOSE YOUR PLAN</h3>

 <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-900/20 via-[#151A22] to-blue-900/20">
 <div className="p-5">
 <div className="flex items-center justify-between mb-3">
 <div>
 <p className="text-blue-300 text-xs font-bold uppercase tracking-wider">Base Venue</p>
 <div className="flex items-baseline gap-1 mt-1">
 <span className="text-3xl font-black text-white">$29</span>
 <span className="text-lg text-white">.99</span>
 <span className="text-[#A0A4AB] text-sm">/month</span>
 </div>
 </div>
 <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
 <Building2 className="w-7 h-7 text-white" />
 </div>
 </div>
 <ul className="space-y-2 mb-4">
 {['Listed on platform', 'Create watch parties', 'Post deals & specials', 'QR code check-ins', 'Basic analytics'].map((f, i) => (
 <li key={i} className="flex items-center gap-2 text-white/70 text-xs"><CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />{f}</li>
 ))}
 </ul>
 {!userVenue.subscribed && (
 <button
 onClick={async () => {
 try {
 let products = await api.stripe.products();
 let baseProduct = products.find(p => p.metadata?.tier === 'venue');
 if (!baseProduct || baseProduct.prices.length === 0) {
 await new Promise(r => setTimeout(r, 2000));
 products = await api.stripe.products();
 baseProduct = products.find(p => p.metadata?.tier === 'venue');
 }
 if (baseProduct && baseProduct.prices.length > 0) {
 const result = await api.stripe.checkout(baseProduct.prices[0].id);
 if (result?.url) window.location.href = result.url;
 } else { alert('Plans are loading. Please wait a moment and try again.'); }
 } catch(e) { console.error(e); alert('Something went wrong. Please try again.'); }
 }}
 className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20"
 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em' }}
 >
 {trialActive ? 'SELECT BASE PLAN' : 'SUBSCRIBE TO BASE'}
 </button>
 )}
 </div>
 </div>

 <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-amber-900/30">
 <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-full uppercase">Most Popular</div>
 <div className="p-5">
 <div className="flex items-center justify-between mb-3">
 <div>
 <p className="text-amber-300 text-xs font-bold uppercase tracking-wider">Featured Venue</p>
 <div className="flex items-baseline gap-1 mt-1">
 <span className="text-3xl font-black text-white">$49</span>
 <span className="text-lg text-white">.99</span>
 <span className="text-[#A0A4AB] text-sm">/month</span>
 </div>
 </div>
 <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
 <Star className="w-7 h-7 text-white fill-white" />
 </div>
 </div>
 <ul className="space-y-2 mb-4">
 {['Everything in Base, plus:', 'Priority search placement', 'Featured badge on profile', 'Trending feed boost', 'Fan notifications', 'Enhanced analytics', 'Promoted parties'].map((f, i) => (
 <li key={i} className={`flex items-center gap-2 text-xs ${i === 0 ? 'text-amber-300 font-bold' : 'text-white/70'}`}>{i > 0 && <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}{f}</li>
 ))}
 </ul>
 <button
 onClick={async () => {
 try {
 let products = await api.stripe.products();
 let featuredProduct = products.find(p => p.metadata?.tier === 'featured_venue');
 if (!featuredProduct || featuredProduct.prices.length === 0) {
 await new Promise(r => setTimeout(r, 2000));
 products = await api.stripe.products();
 featuredProduct = products.find(p => p.metadata?.tier === 'featured_venue');
 }
 if (featuredProduct && featuredProduct.prices.length > 0) {
 const result = await api.stripe.checkout(featuredProduct.prices[0].id);
 if (result?.url) window.location.href = result.url;
 } else { alert('Plans are loading. Please wait a moment and try again.'); }
 } catch(e) { console.error(e); alert('Something went wrong. Please try again.'); }
 }}
 className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em' }}
 >
 {trialActive ? 'SELECT FEATURED PLAN' : 'UPGRADE TO FEATURED'}
 </button>
 </div>
 </div>

 <div className="rounded-2xl border border-[#222A36] bg-[#151A22] p-4">
 <h3 className="text-white font-bold text-sm mb-3">Plan Comparison</h3>
 <div className="space-y-2">
 {[
 { feature: 'Listed on platform', base: true, featured: true },
 { feature: 'Create watch parties', base: true, featured: true },
 { feature: 'Post deals & specials', base: true, featured: true },
 { feature: 'QR code check-ins', base: true, featured: true },
 { feature: 'Basic analytics', base: true, featured: true },
 { feature: 'Priority search placement', base: false, featured: true },
 { feature: 'Featured badge', base: false, featured: true },
 { feature: 'Trending feed boost', base: false, featured: true },
 { feature: 'Fan notifications', base: false, featured: true },
 { feature: 'Enhanced analytics', base: false, featured: true },
 { feature: 'Promoted parties', base: false, featured: true },
 ].map((row, i) => (
 <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#222A36] last:border-0">
 <span className="text-white/70 text-xs">{row.feature}</span>
 <div className="flex items-center gap-6">
 <span className="text-xs w-16 text-center">{row.base ? <CheckCircle className="w-4 h-4 text-blue-400 mx-auto" /> : <X className="w-4 h-4 text-[#333] mx-auto" />}</span>
 <span className="text-xs w-16 text-center"><CheckCircle className="w-4 h-4 text-amber-400 mx-auto" /></span>
 </div>
 </div>
 ))}
 <div className="flex items-center justify-between pt-2">
 <span className="text-white/40 text-[10px]"></span>
 <div className="flex items-center gap-6">
 <span className="text-[10px] text-blue-300 w-16 text-center font-bold">$29.99/mo</span>
 <span className="text-[10px] text-amber-300 w-16 text-center font-bold">$49.99/mo</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 )}

 {hubTab === 'promotions' && (
 <div className="space-y-4">
 <div>
 <h2 className="text-xl font-black text-white">Promote Your Watch Parties</h2>
 <p className="text-sm text-[#A0A4AB]">Create a watch party first, then promote it to attract more fans</p>
 </div>

 {!showNewPromo && (() => {
 const myParties = parties.filter(p => (p.creatorId === user?.id || p.hostId === user?.id) && new Date(p.date || p.gameTime) >= new Date());
 return (
 <div className="space-y-4">
 {myParties.length > 0 ? (
 <div className="bg-[#151A22] p-5 rounded-2xl border border-green-500/20 space-y-3">
 <h3 className="text-lg font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-green-400" /> Your Watch Parties</h3>
 <p className="text-xs text-[#A0A4AB]">Promote a party you've created to let fans know about your specials</p>
 <div className="space-y-2">
 {myParties.map(p => {
 const partyDate = p.date || p.gameTime;
 const partyTitle = p.title || `${p.homeTeam || p.supportedTeam || ''} Watch Party`;
 const alreadyPromoted = promotions.some(pr => pr.title === partyTitle || (pr.home_team === p.homeTeam && pr.game_date && new Date(pr.game_date).toDateString() === new Date(partyDate).toDateString()));
 return (
 <div key={p.id} className="flex items-center justify-between bg-[#0F1115] rounded-xl p-3 border border-[#222A36] hover:border-green-500/30 transition-colors">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-white font-bold text-sm truncate">{partyTitle}</span>
 {p.sport && <span className="px-1.5 py-0.5 bg-[#1E90FF]/20 text-[#1E90FF] text-[10px] font-bold rounded-full">{p.sport}</span>}
 </div>
 <div className="flex items-center gap-3 mt-1 text-xs text-[#A0A4AB]">
 {partyDate && <span>{new Date(partyDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>}
 {(p.venueName || p.location) && <span className="truncate">{p.venueName || p.location}</span>}
 {p.homeTeam && p.awayTeam && <span>{p.awayTeam} @ {p.homeTeam}</span>}
 </div>
 </div>
 {alreadyPromoted ? (
 <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 flex-shrink-0">Promoted</span>
 ) : (
 <button onClick={() => {
 setPromoForm({ title: partyTitle, sport: p.sport || '', gameDate: partyDate ? new Date(partyDate).toISOString().slice(0, 16) : '', homeTeam: p.homeTeam || '', awayTeam: p.awayTeam || '', description: p.notes || p.description || '', specials: '' });
 setShowNewPromo(true);
 }} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors flex-shrink-0 flex items-center gap-1">
 <Megaphone className="w-3 h-3" /> Promote
 </button>
 )}
 </div>
 );
 })}
 </div>
 </div>
 ) : (
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36] text-center">
 <div className="text-4xl mb-3">🎉</div>
 <h3 className="text-lg font-bold text-white mb-2">Create a Watch Party First</h3>
 <p className="text-[#A0A4AB] text-sm mb-4">To promote a game at your venue, you need to create a watch party for it first. Then you can add specials and boost visibility.</p>
 <button onClick={() => setCurrentScreen('games')} className="primary-btn create-btn px-5 py-2.5 text-white font-bold rounded-xl text-sm inline-flex items-center gap-2">
 <Plus className="w-4 h-4 btn-icon" /> Browse Games & Create Party
 </button>
 </div>
 )}
 </div>
 );
 })()}

 {showNewPromo && (
 <div className="bg-[#151A22] p-5 rounded-2xl border-2 border-green-500/30 space-y-4">
 <h3 className="text-lg font-bold text-white">Create Game Promotion</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="sm:col-span-2">
 <label className="block text-xs text-[#A0A4AB] mb-1">Promotion Title *</label>
 <input value={promoForm.title} onChange={e => setPromoForm({...promoForm, title: e.target.value})} placeholder="e.g. Monday Night Football Watch Party!" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500" />
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Sport</label>
 <select value={promoForm.sport} onChange={e => setPromoForm({...promoForm, sport: e.target.value})} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm">
 <option value="">Select sport...</option>
 {SPORTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Game Date & Time</label>
 <input type="datetime-local" value={promoForm.gameDate} onChange={e => setPromoForm({...promoForm, gameDate: e.target.value})} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm" />
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Home Team</label>
 <input value={promoForm.homeTeam} onChange={e => setPromoForm({...promoForm, homeTeam: e.target.value})} placeholder="e.g. Miami Heat" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm" />
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Away Team</label>
 <input value={promoForm.awayTeam} onChange={e => setPromoForm({...promoForm, awayTeam: e.target.value})} placeholder="e.g. LA Lakers" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm" />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs text-[#A0A4AB] mb-1">Description</label>
 <textarea value={promoForm.description} onChange={e => setPromoForm({...promoForm, description: e.target.value})} placeholder="Tell fans what to expect..." rows={2} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm resize-none" />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs text-[#A0A4AB] mb-1">Game Day Specials</label>
 <input value={promoForm.specials} onChange={e => setPromoForm({...promoForm, specials: e.target.value})} placeholder="e.g. $5 pitchers, half-price wings during the game" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm" />
 </div>
 </div>
 <div className="flex gap-2">
 <button onClick={savePromotion} disabled={saving} className="px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 disabled:opacity-50">{saving ? 'Saving...' : 'Create Promotion'}</button>
 <button onClick={() => setShowNewPromo(false)} className="px-5 py-2.5 bg-[#222A36] text-[#A0A4AB] font-bold rounded-xl text-sm hover:text-white">Cancel</button>
 </div>
 </div>
 )}

 {loadingHub ? (
 <div className="text-center py-8"><div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto" /></div>
 ) : promotions.length === 0 && !showNewPromo ? (
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36] text-center">
 <div className="text-4xl mb-3">📢</div>
 <h3 className="text-lg font-bold text-white mb-2">No Active Promotions</h3>
 <p className="text-[#A0A4AB] text-sm mb-4">Create a watch party first, then come back here to promote it with specials and deals!</p>
 <button onClick={() => setCurrentScreen('games')} className="primary-btn create-btn px-5 py-2.5 text-white font-bold rounded-xl text-sm inline-flex items-center gap-2">
 <Plus className="w-4 h-4 btn-icon" /> Browse Games & Create Party
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 {promotions.map(promo => (
 <div key={promo.id} className="bg-[#151A22] p-4 rounded-2xl border border-[#222A36] hover:border-green-500/30 transition-colors">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <h3 className="text-white font-bold">{promo.title}</h3>
 {promo.sport && <span className="px-2 py-0.5 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-full">{promo.sport}</span>}
 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${promo.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>{promo.status}</span>
 </div>
 {(promo.home_team || promo.away_team) && <p className="text-sm text-white/80 mb-1">{promo.away_team} @ {promo.home_team}</p>}
 {promo.game_date && <p className="text-xs text-[#A0A4AB] mb-1">Game: {new Date(promo.game_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>}
 {promo.description && <p className="text-sm text-[#A0A4AB]">{promo.description}</p>}
 {promo.specials && <p className="text-sm text-amber-300 mt-1">🏷️ {promo.specials}</p>}
 </div>
 <button onClick={() => deletePromotion(promo.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {hubTab === 'deals' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-black text-white">Deals & Specials</h2>
 <p className="text-sm text-[#A0A4AB]">Create exclusive offers that fans see when browsing your venue</p>
 </div>
 <button onClick={() => setShowNewDeal(true)} className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-colors flex items-center gap-1.5">
 <Plus className="w-4 h-4" /> New Deal
 </button>
 </div>

 {showNewDeal && (
 <div className="bg-[#151A22] p-5 rounded-2xl border-2 border-amber-500/30 space-y-4">
 <h3 className="text-lg font-bold text-white">Create a Deal</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="sm:col-span-2">
 <label className="block text-xs text-[#A0A4AB] mb-1">Deal Title *</label>
 <input value={dealForm.title} onChange={e => setDealForm({...dealForm, title: e.target.value})} placeholder="e.g. Happy Hour: Half-Price Wings" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500" />
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Deal Type</label>
 <select value={dealForm.dealType} onChange={e => setDealForm({...dealForm, dealType: e.target.value})} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm">
 <option value="special">Game Day Special</option>
 <option value="happy_hour">Happy Hour</option>
 <option value="food">Food Deal</option>
 <option value="drink">Drink Deal</option>
 <option value="exclusive">Exclusive Offer</option>
 <option value="group">Group Discount</option>
 </select>
 </div>
 <div>
 <label className="block text-xs text-[#A0A4AB] mb-1">Valid Until (optional)</label>
 <input type="date" value={dealForm.validUntil} onChange={e => setDealForm({...dealForm, validUntil: e.target.value})} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm" />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs text-[#A0A4AB] mb-1">Description *</label>
 <textarea value={dealForm.description} onChange={e => setDealForm({...dealForm, description: e.target.value})} placeholder="Describe the deal..." rows={2} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm resize-none" />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs text-[#A0A4AB] mb-1">Terms & Conditions (optional)</label>
 <input value={dealForm.terms} onChange={e => setDealForm({...dealForm, terms: e.target.value})} placeholder="e.g. Valid for dine-in only, min 2 people" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#222A36] rounded-xl text-white text-sm" />
 </div>
 <div className="sm:col-span-2 flex items-center gap-3">
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={dealForm.recurring} onChange={e => setDealForm({...dealForm, recurring: e.target.checked})} className="w-4 h-4 rounded" />
 <span className="text-white text-sm">Recurring deal (e.g. every game day)</span>
 </label>
 </div>
 </div>
 <div className="flex gap-2">
 <button onClick={saveDeal} disabled={saving} className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 disabled:opacity-50">{saving ? 'Saving...' : 'Create Deal'}</button>
 <button onClick={() => setShowNewDeal(false)} className="px-5 py-2.5 bg-[#222A36] text-[#A0A4AB] font-bold rounded-xl text-sm hover:text-white">Cancel</button>
 </div>
 </div>
 )}

 {loadingHub ? (
 <div className="text-center py-8"><div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto" /></div>
 ) : deals.length === 0 && !showNewDeal ? (
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36] text-center">
 <div className="text-4xl mb-3">🏷️</div>
 <h3 className="text-lg font-bold text-white mb-2">No Deals Yet</h3>
 <p className="text-[#A0A4AB] text-sm mb-4">Create exclusive deals and specials to attract more fans to your venue!</p>
 <button onClick={() => setShowNewDeal(true)} className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm">Create First Deal</button>
 </div>
 ) : (
 <div className="space-y-3">
 {deals.map(deal => {
 const typeLabels = { special: 'Game Day Special', happy_hour: 'Happy Hour', food: 'Food Deal', drink: 'Drink Deal', exclusive: 'Exclusive', group: 'Group Discount' };
 const typeColors = { special: 'bg-amber-500/20 text-amber-300', happy_hour: 'bg-purple-500/20 text-purple-300', food: 'bg-orange-500/20 text-orange-300', drink: 'bg-cyan-500/20 text-cyan-300', exclusive: 'bg-pink-500/20 text-pink-300', group: 'bg-green-500/20 text-green-300' };
 return (
 <div key={deal.id} className={`bg-[#151A22] p-4 rounded-2xl border transition-colors ${deal.active ? 'border-[#222A36] hover:border-amber-500/30' : 'border-red-500/20 opacity-60'}`}>
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <h3 className="text-white font-bold">{deal.title}</h3>
 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${typeColors[deal.deal_type] || typeColors.special}`}>{typeLabels[deal.deal_type] || deal.deal_type}</span>
 {!deal.active && <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-300">Paused</span>}
 {deal.recurring && <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300">Recurring</span>}
 </div>
 <p className="text-sm text-[#A0A4AB]">{deal.description}</p>
 {deal.terms && <p className="text-xs text-[#A0A4AB]/70 mt-1">Terms: {deal.terms}</p>}
 {deal.valid_until && <p className="text-xs text-[#A0A4AB]/70 mt-1">Valid until {new Date(deal.valid_until).toLocaleDateString()}</p>}
 </div>
 <div className="flex items-center gap-1 flex-shrink-0">
 <button onClick={() => toggleDealActive(deal)} className={`p-2 rounded-lg transition-colors ${deal.active ? 'text-amber-400 hover:bg-amber-500/20' : 'text-green-400 hover:bg-green-500/20'}`} title={deal.active ? 'Pause deal' : 'Activate deal'}>
 {deal.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 <button onClick={() => deleteDeal(deal.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
 </div>
 </div>
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

 const BrowsePartiesScreen = () => {
 const [bpSearch, setBpSearch] = useState('');
 const [bpSports, setBpSports] = useState([]);
 const [bpCity, setBpCity] = useState('All');
 const [bpSort, setBpSort] = useState('soonest');
 const [bpCollapsed, setBpCollapsed] = useState({});
 const [showMap, setShowMap] = useState(false);
 const [nearbyParties, setNearbyParties] = useState([]);
 const [mapCenter, setMapCenter] = useState([26.3683, -80.1289]);

 useEffect(() => {
   if (!showMap) return;
   const fetchNearby = (lat, lng) => {
     setMapCenter([lat, lng]);
     fetch(`/api/parties/nearby?lat=${lat}&lng=${lng}&radius=25`)
       .then(r => r.ok ? r.json() : [])
       .then(d => setNearbyParties(d))
       .catch(() => {});
   };
   if (userCoords) {
     fetchNearby(userCoords.lat, userCoords.lng);
   } else if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(
       pos => fetchNearby(pos.coords.latitude, pos.coords.longitude),
       () => fetchNearby(26.3683, -80.1289),
       { enableHighAccuracy: false, timeout: 5000 }
     );
   } else {
     fetchNearby(26.3683, -80.1289);
   }
 }, [showMap, userCoords?.lat, userCoords?.lng]);

 const safeParties = Array.isArray(parties) ? parties : [];
 const safeGames = Array.isArray(games) ? games : [];
 const safeFriends = Array.isArray(friendsList) ? friendsList : [];
 const friendIds = safeFriends.map(f => f?.id).filter(Boolean);

 const sportIcons = { 'NFL': '🏈', 'NBA': '🏀', 'NHL': '🏒', 'MLB': '⚾', 'MLS': '⚽', 'College Football': '🏈', 'College Basketball': '🏀', 'Premier League': '⚽', 'La Liga': '⚽', 'Liga MX': '⚽', 'Champions League': '⚽', 'UFC/MMA': '🥊', 'Boxing': '🥊', 'NASCAR': '🏁', 'F1': '🏎️', 'Tennis': '🎾', 'Golf': '⛳' };
 const getSportIcon = (s) => sportIcons[s] || '🏟️';
 const defaultSportsList = ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'College Football', 'College Basketball', 'Premier League', 'La Liga', 'Champions League', 'UFC/MMA', 'Boxing', 'NASCAR', 'F1', 'Tennis', 'Golf'];

 const allCities = (() => {
   const cityObj = {};
   safeParties.forEach(p => { if (p && p.city) { const c = String(p.city).split(',')[0].trim(); if (c && !cityObj[c.toLowerCase()]) cityObj[c.toLowerCase()] = c; } });
   if (currentCity) { const c = String(currentCity).split(',')[0].trim(); if (c && !cityObj[c.toLowerCase()]) cityObj[c.toLowerCase()] = c; }
   return ['All', ...Object.values(cityObj).sort()];
 })();

 const allSports = (() => {
   const sportSet = new Set(defaultSportsList);
   safeParties.forEach(p => { if (p && p.sport) sportSet.add(p.sport); });
   return defaultSportsList.filter(s => sportSet.has(s)).concat([...sportSet].filter(s => !defaultSportsList.includes(s)));
 })();

 const now = new Date();

 const getPartyDate = (p) => {
   if (!p || !p.gameTime) return null;
   const d = new Date(p.gameTime);
   return isNaN(d.getTime()) ? null : d;
 };

 const filteredParties = (() => {
   const fourteenDaysOut = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
   const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
   let filtered = safeParties.filter(p => {
     if (!p) return false;
     const gt = getPartyDate(p);
     if (!gt) return true;
     return gt >= threeHoursAgo && gt <= fourteenDaysOut;
   });
   if (bpSports.length > 0) filtered = filtered.filter(p => p && bpSports.includes(p.sport));
   if (bpCity !== 'All') {
     const normFilter = bpCity.toLowerCase().split(',')[0].trim();
     filtered = filtered.filter(p => {
       const pc = (p && p.city ? String(p.city) : '').toLowerCase().split(',')[0].trim();
       return pc === normFilter || pc.includes(normFilter) || normFilter.includes(pc);
     });
   }
   if (bpSearch.trim()) {
     const q = bpSearch.toLowerCase().trim();
     filtered = filtered.filter(p => {
       if (!p) return false;
       const ht = String(p.homeTeam || '').toLowerCase();
       const at = String(p.awayTeam || '').toLowerCase();
       return ht.includes(q) || at.includes(q) ||
         String(p.venueName || '').toLowerCase().includes(q) ||
         String(p.hostName || '').toLowerCase().includes(q) ||
         String(p.title || '').toLowerCase().includes(q) ||
         `${ht} vs ${at}`.includes(q);
     });
   }
   if (bpSort === 'soonest' || bpSort === 'closest') {
     filtered.sort((a, b) => new Date(a && a.gameTime || 0) - new Date(b && b.gameTime || 0));
   } else if (bpSort === 'popular') {
     filtered.sort((a, b) => (Array.isArray(b?.attendees) ? b.attendees.length : 0) - (Array.isArray(a?.attendees) ? a.attendees.length : 0));
   } else if (bpSort === 'newest') {
     filtered.sort((a, b) => new Date(b && b.createdAt || 0) - new Date(a && a.createdAt || 0));
   }
   if (bpSort === 'closest' && userCoords && currentCity) {
     const cc = String(currentCity).toLowerCase();
     filtered.sort((a, b) => {
       const da = String(a?.city || '').toLowerCase() === cc ? 0 : 1;
       const db = String(b?.city || '').toLowerCase() === cc ? 0 : 1;
       if (da !== db) return da - db;
       return new Date(a && a.gameTime || 0) - new Date(b && b.gameTime || 0);
     });
   }
   return filtered;
 })();

 const groupedParties = (() => {
   if (bpSort !== 'soonest') return [];
   const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
   const tomorrowStart = new Date(todayStart.getTime() + 86400000);
   const tomorrowEnd = new Date(todayStart.getTime() + 2 * 86400000);
   const dayOfWeek = now.getDay();
   const weekendStart = new Date(todayStart.getTime() + ((5 - dayOfWeek + 7) % 7) * 86400000);
   const weekendEnd = new Date(weekendStart.getTime() + (dayOfWeek >= 5 ? (8 - dayOfWeek) : 3) * 86400000);
   const thisWeekEnd = new Date(todayStart.getTime() + (7 - dayOfWeek) * 86400000);
   const nextWeekEnd = new Date(thisWeekEnd.getTime() + 7 * 86400000);

   const buckets = { now: [], today: [], tomorrow: [], weekend: [], week: [], next: [], later: [] };
   filteredParties.forEach(p => {
     if (!p) return;
     const gt = getPartyDate(p);
     if (!gt) { buckets.later.push(p); return; }
     const gameEnd = new Date(gt.getTime() + 3 * 3600000);
     if (gt <= now && gameEnd >= now) buckets.now.push(p);
     else if (gt >= now && gt < tomorrowStart) buckets.today.push(p);
     else if (gt >= tomorrowStart && gt < tomorrowEnd) buckets.tomorrow.push(p);
     else if (dayOfWeek < 5 && gt >= weekendStart && gt < weekendEnd) buckets.weekend.push(p);
     else if (gt >= now && gt < thisWeekEnd) buckets.week.push(p);
     else if (gt >= thisWeekEnd && gt < nextWeekEnd) buckets.next.push(p);
     else buckets.later.push(p);
   });

   const groups = [];
   if (buckets.now.length) groups.push({ label: 'HAPPENING NOW', icon: '🔴', parties: buckets.now, isLive: true });
   if (buckets.today.length) groups.push({ label: 'TODAY', icon: '📅', parties: buckets.today });
   if (buckets.tomorrow.length) groups.push({ label: 'TOMORROW', icon: '📆', parties: buckets.tomorrow });
   if (buckets.weekend.length && dayOfWeek < 5) groups.push({ label: 'THIS WEEKEND', icon: '🎉', parties: buckets.weekend });
   if (buckets.week.length) groups.push({ label: 'THIS WEEK', icon: '📋', parties: buckets.week });
   if (buckets.next.length) groups.push({ label: 'NEXT WEEK', icon: '🗓️', parties: buckets.next });
   if (buckets.later.length) groups.push({ label: 'COMING UP', icon: '🔜', parties: buckets.later });
   return groups;
 })();

 const hasFilters = bpSports.length > 0 || bpCity !== 'All' || bpSearch.trim() || bpSort !== 'soonest';

 const getCountdown = (gameTime) => {
   const gt = getPartyDate({ gameTime });
   if (!gt) return String(gameTime || '');
   const diff = gt - now;
   if (diff < 0) return 'Started';
   const hours = Math.floor(diff / 3600000);
   const mins = Math.floor((diff % 3600000) / 60000);
   if (hours >= 24) return `in ${Math.floor(hours / 24)}d`;
   if (hours > 0) return `in ${hours}h ${mins}m`;
   return `in ${mins}m`;
 };

 const renderPartyCard = (party) => {
   if (!party) return null;
   const gt = getPartyDate(party);
   const isLive = gt ? (gt <= now && new Date(gt.getTime() + 10800000) >= now) : false;
   const atCount = Array.isArray(party.attendees) ? party.attendees.length : 0;
   const isPopular = atCount >= 25;
   const fGoing = Array.isArray(party.attendeeDetails) ? party.attendeeDetails.filter(a => a && a.userId && friendIds.includes(a.userId)) : [];
   return (
     <div
       key={party.id}
       onClick={() => { let g = safeGames.find(g => g.id === party.gameId); if (!g) { g = { id: party.gameId || party.id, sport: party.sport, homeTeam: party.homeTeam || '?', awayTeam: party.awayTeam || '?', startTime: party.gameTime, venue: party.venueName || '' }; } setSelectedGame(g); setCurrentScreen('gameDetail'); }}
       className={`bg-[#151A22] p-4 rounded-xl border transition-all cursor-pointer active:scale-[0.99] ${isLive ? 'border-red-500/40 bg-gradient-to-r from-red-900/20 via-[#151A22] to-[#151A22]' : 'border-[#222A36] hover:border-[#1E90FF]/30'}`}
     >
       <div className="flex items-start justify-between mb-2">
         <div className="flex items-center gap-2 flex-1 min-w-0">
           {(() => { const hLogo = getTeamLogoUrl(party.sport, party.homeTeam); const aLogo = getTeamLogoUrl(party.sport, party.awayTeam); return (hLogo || aLogo) ? (
           <div className="flex items-center gap-1.5 flex-shrink-0">
             {hLogo && <img src={hLogo} alt="" className="w-10 h-10 object-contain drop-shadow-md" onError={(e) => { e.target.onerror=null; e.target.style.display='none'; }} />}
             {aLogo && <img src={aLogo} alt="" className="w-10 h-10 object-contain drop-shadow-md" onError={(e) => { e.target.onerror=null; e.target.style.display='none'; }} />}
           </div>
           ) : <span className="text-2xl flex-shrink-0">{getSportIcon(party.sport)}</span>; })()}
           <div className="min-w-0">
             <span className="text-white font-bold text-base">{String(party.homeTeam || '?')} vs {String(party.awayTeam || '?')}</span>
             {isLive && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full live-badge-pulse">LIVE</span>}
             {isPopular && !isLive && <span className="ml-2 text-orange-400 text-[10px] font-bold">POPULAR</span>}
           </div>
         </div>
       </div>
       <div className="text-sm text-[#A0A4AB] space-y-1">
         <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span className="truncate text-white font-black text-base">{String(party.venueName || 'TBD')}</span></div>
         <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" /><span>{gt ? gt.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : String(party.gameTime || 'TBD')}</span><span className="text-[#1E90FF] text-xs font-semibold ml-1">{getCountdown(party.gameTime)}</span></div>
         <div className="flex items-center gap-4">
           <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-[#1E90FF] flex-shrink-0" /><span>{atCount} going</span></div>
           <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" /><span>{String(party.hostName || '')}</span></div>
         </div>
         {fGoing.length > 0 && (
           <div className="flex items-center gap-2"><Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" /><span className="text-pink-300 font-semibold">{fGoing.length} friend{fGoing.length !== 1 ? 's' : ''} going</span></div>
         )}
       </div>
       {party.notes && <p className="text-white/40 text-xs mt-2 line-clamp-2">"{String(party.notes)}"</p>}
       <div className="flex items-center justify-between mt-3">
         <div className="flex items-center gap-2">
           <button onClick={(e) => { e.stopPropagation(); openCalendarMenu(party); }} className="flex items-center gap-1 text-xs text-[#1E90FF] hover:text-[#1E90FF]/80"><Calendar className="w-3 h-3" /> Calendar</button>
           <button onClick={(e) => { e.stopPropagation(); openShareMenu(party); }} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"><Share2 className="w-3 h-3" /> Share</button>
         </div>
         {user && Array.isArray(party.attendees) && !party.attendees.includes(user.email) && party.hostEmail !== user.email ? (
           justJoinedPartyId === party.id ? (
           <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-base join-btn-wow joined-success">
             <span className="checkmark-pop">✓</span> Going!
           </button>
           ) : (
           <button onClick={(e) => { e.stopPropagation(); handleJoinParty(party.id); }} disabled={joiningPartyId === party.id} className={`flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white font-bold text-base rounded-xl shadow-lg shadow-[#1E90FF]/20 hover:shadow-[#1E90FF]/40 hover:translate-y-[-1px] transition-all join-btn-wow ${joiningPartyId === party.id ? 'joining' : ''}`}>
             {joiningPartyId === party.id ? 'Joining...' : 'Join Party'}
           </button>
           )
         ) : user && Array.isArray(party.attendees) && party.attendees.includes(user.email) ? (
           <span className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
             <Check className="w-3 h-3" /> Joined
           </span>
         ) : null}
       </div>
     </div>
   );
 };

 return (
   <div className="min-h-screen bg-[#0F1115]">
     <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
       <div className="max-w-4xl mx-auto px-4 py-3">
         <div className="flex items-center justify-between mb-3">
           <button onClick={() => setCurrentScreen('games')} className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors">
             <ArrowLeft className="w-5 h-5" /> Back
           </button>
           <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>BROWSE PARTIES</h2>
           <div className="w-16" />
         </div>
         <div className="relative mb-3">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A4AB]" />
           <input type="text" placeholder="Search teams, venues, hosts..." value={bpSearch} onChange={(e) => setBpSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white text-sm placeholder-[#A0A4AB]/50 focus:outline-none focus:border-[#1E90FF]/50" />
           {bpSearch && (<button onClick={() => setBpSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A4AB] hover:text-white"><X className="w-4 h-4" /></button>)}
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {['All', ...allSports].map(sport => (
             <button key={sport} onClick={() => { if (sport === 'All') setBpSports([]); else setBpSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${(sport === 'All' && bpSports.length === 0) || (sport !== 'All' && bpSports.includes(sport)) ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB] border border-[#222A36] hover:border-[#1E90FF]/40'}`}>
               {sport !== 'All' && <span>{getSportIcon(sport)}</span>}{sport}
             </button>
           ))}
         </div>
         <div className="flex items-center gap-2 mt-2">
           <button onClick={() => { if (currentCity) { setBpCity(String(currentCity).split(',')[0].trim()); setBpSort('closest'); } else { detectUserLocation(); } }} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${bpSort === 'closest' && bpCity !== 'All' ? 'bg-emerald-500 text-white' : 'bg-[#151A22] text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50'}`}>
             <Navigation className="w-3.5 h-3.5" /> Near Me
           </button>
           <div className="relative flex-1">
             <select value={bpCity} onChange={(e) => setBpCity(e.target.value)} className="w-full px-3 py-2 bg-[#151A22] border border-[#222A36] rounded-xl text-white text-xs appearance-none cursor-pointer focus:outline-none focus:border-[#1E90FF]/50">
               {allCities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Areas' : c}</option>)}
             </select>
             <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A4AB] pointer-events-none" />
           </div>
           <div className="relative flex-1">
             <select value={bpSort} onChange={(e) => setBpSort(e.target.value)} className="w-full px-3 py-2 bg-[#151A22] border border-[#222A36] rounded-xl text-white text-xs appearance-none cursor-pointer focus:outline-none focus:border-[#1E90FF]/50">
               <option value="soonest">Soonest First</option>
               <option value="popular">Most Popular</option>
               <option value="newest">Newest Posted</option>
               <option value="closest">Closest to Me</option>
             </select>
             <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A4AB] pointer-events-none" />
           </div>
         </div>
         {hasFilters && (
           <div className="flex items-center gap-2 mt-2 flex-wrap">
             {bpSports.map(sp => (<span key={sp} className="flex items-center gap-1 px-2 py-1 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-full border border-[#1E90FF]/30">{getSportIcon(sp)} {sp} <button onClick={() => setBpSports(prev => prev.filter(s => s !== sp))}><X className="w-3 h-3" /></button></span>))}
             {bpCity !== 'All' && (<span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30"><MapPin className="w-3 h-3" /> {bpCity} <button onClick={() => setBpCity('All')}><X className="w-3 h-3" /></button></span>)}
             {bpSearch.trim() && (<span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-full border border-orange-500/30"><Search className="w-3 h-3" /> "{bpSearch}" <button onClick={() => setBpSearch('')}><X className="w-3 h-3" /></button></span>)}
             {bpSort !== 'soonest' && (<span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">{bpSort === 'popular' ? 'Most Popular' : bpSort === 'closest' ? 'Closest' : 'Newest'} <button onClick={() => setBpSort('soonest')}><X className="w-3 h-3" /></button></span>)}
             <button onClick={() => { setBpSports([]); setBpCity('All'); setBpSearch(''); setBpSort('soonest'); }} className="text-xs text-red-400 hover:text-red-300 ml-1">Clear All</button>
           </div>
         )}
       </div>
     </div>
     <div className="max-w-4xl mx-auto px-4 py-4">
       <div className="flex items-center justify-between mb-3">
         <p className="text-[#A0A4AB] text-xs">{filteredParties.length} {filteredParties.length === 1 ? 'party' : 'parties'} found</p>
         <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showMap ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB] border border-[#222A36] hover:border-[#1E90FF]/40'}`}>
           <Map className="w-3.5 h-3.5" /> {showMap ? 'Hide Map' : 'Show Map'}
         </button>
       </div>
       {showMap && (
         <div className="mb-4 rounded-2xl overflow-hidden border border-[#222A36] bg-[#151A22]">
           <MapContainer center={mapCenter} zoom={12} style={{ height: '350px', width: '100%' }} scrollWheelZoom={true}>
             <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
             {nearbyParties.map(np => {
               const gt = new Date(np.gameTime);
               const isLive = gt <= new Date() && new Date(gt.getTime() + 10800000) >= new Date();
               const icon = L.divIcon({
                 className: 'leaflet-custom-marker',
                 html: `<div class="leaflet-marker-pin ${isLive ? 'live' : 'upcoming'}">${isLive ? '\u{1F534}' : '\u{1F3DF}'}</div>`,
                 iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
               });
               return (
                 <Marker key={np.id} position={[np.venueLatitude, np.venueLongitude]} icon={icon}>
                   <Popup>
                     <div style={{ minWidth: 180 }}>
                       <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>{np.awayTeam} @ {np.homeTeam}</p>
                       <p style={{ margin: '0 0 2px', fontSize: 13 }}>{np.venueName}</p>
                       <p style={{ margin: '0 0 2px', fontSize: 12, color: '#3498db' }}>{np.distance} mi away</p>
                       <p style={{ margin: '0 0 6px', fontSize: 12, color: '#27ae60', fontWeight: 'bold' }}>{np.attendeeCount} fans going</p>
                       {isLive && <span style={{ display: 'inline-block', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 'bold', marginBottom: 6 }}>LIVE NOW</span>}
                       <button onClick={() => { const g = safeGames.find(g => g.id === np.gameId) || { id: np.gameId, sport: np.sport, homeTeam: np.homeTeam, awayTeam: np.awayTeam, startTime: np.gameTime }; setSelectedGame(g); setCurrentScreen('gameDetail'); }}
                         style={{ display: 'block', width: '100%', padding: '6px 12px', background: '#1E90FF', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 12 }}>View Party</button>
                     </div>
                   </Popup>
                 </Marker>
               );
             })}
           </MapContainer>
           {nearbyParties.length === 0 && <p className="text-center text-[#A0A4AB] text-xs py-3">No nearby parties with mapped venues yet</p>}
         </div>
       )}
       {filteredParties.length === 0 ? (
         <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-10 text-center">
           <div className="text-6xl mb-4">🔍</div>
           <h3 className="text-white font-bold text-2xl mb-2">No Parties Found</h3>
           <p className="text-white/70 text-base mb-6">There are no watch parties in {bpCity !== 'All' ? bpCity : (currentCity || 'your area')} right now.</p>
           <div className="flex flex-col items-center gap-3">
             <button onClick={() => setCurrentScreen('games')} className="primary-btn create-btn w-full max-w-xs py-3 text-white font-bold rounded-xl text-base shadow-lg shadow-emerald-500/20">Create the First Party</button>
             {hasFilters && (<button onClick={() => { setBpSports([]); setBpCity('All'); setBpSearch(''); setBpSort('soonest'); }} className="w-full max-w-xs py-3 bg-[#222A36] hover:bg-[#2A3340] text-white font-bold rounded-xl text-sm transition-all">Clear All Filters</button>)}
             <button onClick={() => setBpCity('All')} className="text-[#1E90FF] text-sm font-semibold hover:text-[#1E90FF]/80">Search Nearby Cities</button>
           </div>
         </div>
       ) : bpSort !== 'soonest' ? (
         <div className="space-y-3">{filteredParties.map(p => renderPartyCard(p))}</div>
       ) : (
         <div className="space-y-6">
           {groupedParties.map((group, gi) => {
             const isCollapsed = bpCollapsed[group.label];
             return (
               <div key={gi}>
                 <button onClick={() => setBpCollapsed(prev => ({ ...prev, [group.label]: !prev[group.label] }))} className="flex items-center gap-2 mb-3 w-full text-left group">
                   <span className="text-lg">{group.icon}</span>
                   <h3 className="text-white font-black text-sm tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{group.label}</h3>
                   <span className="text-[#A0A4AB] text-xs ml-1">({Array.isArray(group.parties) ? group.parties.length : 0})</span>
                   <div className="flex-1 border-t border-[#222A36] ml-2" />
                   <ChevronDown className={`w-4 h-4 text-[#A0A4AB] transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                 </button>
                 {!isCollapsed && (<div className="space-y-3">{(group.parties || []).map(p => renderPartyCard(p))}</div>)}
               </div>
             );
           })}
         </div>
       )}
     </div>
   </div>
 );
 };

 const NearbyPartiesScreen = () => {
 const [requestingLocation, setRequestingLocation] = useState(false);

 const nearbyPartiesList = React.useMemo(() => {
   if (!currentCity) return [];
   const normalize = (s) => s?.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim() || '';
   const userCityName = normalize(currentCity.split(',')[0]);

   return parties.filter(party => {
     const partyCity = normalize((party.city || '').split(',')[0]);
     if (!partyCity) return false;
     if (userCityName === partyCity) return true;
     if (userCityName.length >= 4 && partyCity.length >= 4) {
       if (partyCity.startsWith(userCityName) || userCityName.startsWith(partyCity)) return true;
     }
     return false;
   }).sort((a, b) => {
     const dateA = new Date(a.gameTime || a.date || 0);
     const dateB = new Date(b.gameTime || b.date || 0);
     return dateA - dateB;
   });
 }, [parties, currentCity]);

 const requestLocation = async () => {
   setRequestingLocation(true);
   detectUserLocation();
   setTimeout(() => setRequestingLocation(false), 3000);
 };

 const getSportIcon = (sport) => {
   const icons = { 'NFL': '🏈', 'NBA': '🏀', 'NHL': '🏒', 'MLB': '⚾', 'MLS': '⚽', 'College Football': '🏈', 'College Basketball': '🏀', 'Premier League': '⚽', 'La Liga': '⚽', 'Liga MX': '⚽', 'Champions League': '⚽', 'UFC': '🥊', 'Boxing': '🥊' };
   return icons[sport] || '🏟️';
 };

 return (
   <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
     <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
       <div className="max-w-4xl mx-auto px-4 py-4">
         <button onClick={() => setCurrentScreen('games')} className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors">
           <ArrowLeft className="w-5 h-5" /> Back
         </button>
       </div>
     </div>
     <div className="max-w-4xl mx-auto px-4 py-6">
       <div className="text-center mb-6">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1E90FF] to-[#0066CC] mb-4">
           <MapPin className="w-8 h-8 text-white" />
         </div>
         <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
           WATCH PARTIES NEAR ME
         </h2>
         {currentCity ? (
           <p className="text-[#1E90FF] font-semibold mt-1">{currentCity}</p>
         ) : (
           <p className="text-[#A0A4AB] mt-1">Enable location to find parties near you</p>
         )}
       </div>

       {!currentCity ? (
         <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-8 text-center">
           <MapPin className="w-12 h-12 text-[#1E90FF] mx-auto mb-4" />
           <h3 className="text-white font-bold text-lg mb-2">Enable Location Access</h3>
           <p className="text-[#A0A4AB] text-sm mb-6">
             We need your location to show watch parties happening near you. Your location is never stored.
           </p>
           <button
             onClick={requestLocation}
             disabled={requestingLocation}
             className="px-8 py-3 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
           >
             {requestingLocation ? (
               <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</span>
             ) : (
               <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Share My Location</span>
             )}
           </button>
         </div>
       ) : nearbyPartiesList.length === 0 ? (
         <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-8 text-center">
           <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
           <h3 className="text-white font-bold text-lg mb-2">No Parties Nearby — Yet!</h3>
           <p className="text-[#A0A4AB] text-sm mb-4 leading-relaxed">
             We're just launching in Boca Raton, so some days might be quiet. Create a party and we'll help promote it to local fans.
           </p>
           <button
             onClick={() => setCurrentScreen('games')}
             className="primary-btn find-btn px-6 py-3 text-white font-bold rounded-xl"
           >
             <span className="btn-icon">🔍</span> Browse Games & Create Party
           </button>
         </div>
       ) : (
         <div className="space-y-3">
           <div className="flex items-center justify-between mb-2">
             <p className="text-[#A0A4AB] text-sm">{nearbyPartiesList.length} {nearbyPartiesList.length === 1 ? 'party' : 'parties'} near you</p>
             <button onClick={requestLocation} className="text-xs text-[#1E90FF] hover:text-[#1E90FF]/80 flex items-center gap-1">
               <MapPin className="w-3 h-3" /> Update Location
             </button>
           </div>
           {nearbyPartiesList.map(party => (
             <div
               key={party.id}
               onClick={() => {
                 const game = games.find(g => g.id === party.gameId);
                 if (game) { setSelectedGame(game); setCurrentScreen('gameDetail'); }
               }}
               className="bg-[#151A22] p-5 rounded-xl border border-[#222A36] hover:border-[#1E90FF]/30 transition-all cursor-pointer active:scale-[0.99]"
             >
               <div className="flex items-start justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <span className="text-xl">{getSportIcon(party.sport)}</span>
                   <div>
                     <span className="text-white font-bold">{party.homeTeam} vs {party.awayTeam}</span>
                     <span className="ml-2 px-2 py-0.5 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-full border border-[#1E90FF]/30">{party.sport}</span>
                   </div>
                 </div>
               </div>
               <div className="text-sm text-[#A0A4AB] space-y-1.5">
                 <div className="flex items-center gap-2">
                   <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                   <span className="text-white font-bold text-[14px]">{party.venueName || party.location || 'TBD'}</span>
                 </div>
                 {party.venueAddress && (
                   <div className="flex items-center gap-2 ml-5">
                     <span className="text-xs text-[#A0A4AB]/70">{party.venueAddress}</span>
                   </div>
                 )}
                 <div className="flex items-center gap-2">
                   <Calendar className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                   <span>{party.gameTime ? new Date(party.gameTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD'}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Users className="w-3.5 h-3.5 text-[#1E90FF] flex-shrink-0" />
                   <span>{party.attendees?.length || 0} people going</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <User className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                   <span>Hosted by {party.hostName}</span>
                 </div>
               </div>
               <div className="flex items-center gap-2 mt-3">
                 <button
                   onClick={(e) => { e.stopPropagation(); openShareMenu(party); }}
                   className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                 >
                   <Share2 className="w-3 h-3" /> Share
                 </button>
                 <button
                   onClick={(e) => { e.stopPropagation(); openCalendarMenu(party); }}
                   className="flex items-center gap-1 text-xs text-[#1E90FF] hover:text-[#1E90FF]/80 transition-colors"
                 >
                   <Calendar className="w-3 h-3" /> Add to Calendar
                 </button>
               </div>
             </div>
           ))}
         </div>
       )}
     </div>
   </div>
 );
 };

 const NotificationSettingsScreen = () => {
 const [prefs, setPrefs] = useState(notifPrefs || {
   pushEnabled: true, teamAlerts: true, rivalryAlerts: true, suggestedParties: true,
   gameReminders: true, partyReminders: true, predictionReminders: true,
   predictionResults: true, raffleWinners: true, nearbyParties: true,
   friendActivity: true, achievementUnlocks: true
 });
 const [saving, setSaving] = useState(false);

 const togglePref = async (key) => {
   const updated = { ...prefs, [key]: !prefs[key] };
   setPrefs(updated);
   setSaving(true);
   try {
     await api.push.updatePreferences(updated);
     setNotifPrefs(updated);
   } catch (e) { console.error(e); }
   setSaving(false);
 };

 const PrefToggle = ({ label, prefKey, description }) => (
   <div className="flex items-center justify-between py-3 border-b border-[#222A36]">
     <div>
       <div className="text-white text-sm font-semibold">{label}</div>
       {description && <div className="text-[#A0A4AB] text-xs mt-0.5">{description}</div>}
     </div>
     <button
       onClick={() => togglePref(prefKey)}
       className={`w-11 h-6 rounded-full transition-colors relative ${prefs[prefKey] ? 'bg-emerald-500' : 'bg-[#333]'}`}
     >
       <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${prefs[prefKey] ? 'translate-x-5.5 left-[1px]' : 'left-[2px]'}`} style={{ transform: prefs[prefKey] ? 'translateX(22px)' : 'translateX(0)' }} />
     </button>
   </div>
 );

 return (
   <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
     <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
       <div className="max-w-4xl mx-auto px-4 py-4">
         <button onClick={() => setCurrentScreen('games')} className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors">
           <ArrowLeft className="w-5 h-5" /> Back
         </button>
       </div>
     </div>
     <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
       <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>NOTIFICATION SETTINGS</h2>

       <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-5">
         <h3 className="text-orange-300 font-bold text-sm mb-2 uppercase">Push Notifications</h3>
         <PrefToggle label="Enable Push Notifications" prefKey="pushEnabled" description="Master toggle for all push notifications" />
         {!pushEnabled && typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
           <button onClick={async () => { await enablePush(); }} className="mt-3 w-full py-2.5 bg-[#1E90FF] text-white font-bold rounded-xl text-sm">
             Grant Browser Permission
           </button>
         )}
       </div>

       <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-5">
         <h3 className="text-orange-300 font-bold text-sm mb-2 uppercase">Score Celebrations</h3>
         <div className="flex items-center justify-between py-3 border-b border-[#222A36]">
           <div>
             <div className="text-white text-sm font-semibold">Celebrate When My Teams Score</div>
             <div className="text-[#A0A4AB] text-xs mt-0.5">Confetti + popup when your favorite teams score live</div>
           </div>
           <button
             onClick={() => { const next = !scoreCelebrationsEnabled; setScoreCelebrationsEnabled(next); localStorage.setItem('score_celebrations', next ? 'true' : 'false'); }}
             className={`w-11 h-6 rounded-full transition-colors relative ${scoreCelebrationsEnabled ? 'bg-emerald-500' : 'bg-[#333]'}`}
           >
             <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform" style={{ transform: scoreCelebrationsEnabled ? 'translateX(22px)' : 'translateX(0)', left: scoreCelebrationsEnabled ? '1px' : '2px' }} />
           </button>
         </div>
         <button
           onClick={() => { const teamName = user?.favoriteTeams ? Object.values(user.favoriteTeams)[0] : 'Miami Heat'; fireScoreCelebration(teamName || 'Miami Heat', 3, 'NBA'); }}
           className="mt-3 w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-sm active:scale-[0.97] transition-all"
         >
           Test Celebration
         </button>
       </div>

       <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-5">
         <h3 className="text-orange-300 font-bold text-sm mb-2 uppercase">Party & Events</h3>
         <PrefToggle label="Party Reminders" prefKey="partyReminders" description="1 hour before party starts" />
         <PrefToggle label="Suggested Parties" prefKey="suggestedParties" description="Parties you might like" />
       </div>

       <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-5">
         <h3 className="text-orange-300 font-bold text-sm mb-2 uppercase">Predictions & Games</h3>
         <PrefToggle label="Prediction Reminders" prefKey="predictionReminders" description="30 min before game starts" />
         <PrefToggle label="Prediction Results" prefKey="predictionResults" description="When your predictions are resolved" />
         <PrefToggle label="Game Reminders" prefKey="gameReminders" description="Reminders for watched games" />
       </div>

       <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-5">
         <h3 className="text-orange-300 font-bold text-sm mb-2 uppercase">Social</h3>
         <PrefToggle label="Friend Activity" prefKey="friendActivity" description="When friends join parties" />
         <PrefToggle label="Nearby Parties" prefKey="nearbyParties" description="New parties near your location" />
         <PrefToggle label="Team Alerts" prefKey="teamAlerts" description="Alerts for your favorite teams" />
         <PrefToggle label="Rivalry Alerts" prefKey="rivalryAlerts" description="Classic rivalry game alerts" />
       </div>

       <div className="bg-[#151A22] rounded-2xl border border-[#222A36] p-5">
         <h3 className="text-orange-300 font-bold text-sm mb-2 uppercase">Rewards</h3>
         <PrefToggle label="Raffle Winners" prefKey="raffleWinners" description="When you win a raffle" />
         <PrefToggle label="Achievement Unlocks" prefKey="achievementUnlocks" description="Badges, streaks, milestones" />
       </div>

       <p className="text-[#A0A4AB] text-xs text-center">Quiet hours: 10 PM - 8 AM (no notifications sent)</p>
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
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <button
 onClick={() => setCurrentScreen('games')}
 className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors"
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
 <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-10 text-center">
 <div className="text-6xl mb-4">📅</div>
 <h3 className="text-white font-bold text-2xl mb-2">No Upcoming Parties</h3>
 <p className="text-white/70 text-base mb-6">You haven't joined any parties yet. Find a game and join the fun!</p>
 <button
 onClick={() => { setCurrentScreen('browseParties'); window.scrollTo(0,0); }}
 className="primary-btn find-btn w-full max-w-xs py-3 text-white font-bold rounded-xl text-base shadow-lg"
 >
 <span className="btn-icon">🔍</span> Browse Parties
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
 className="bg-[#151A22] p-5 rounded-xl border border-[#222A36]"
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
 className="px-3 py-1.5 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-lg border border-[#1E90FF]/30 hover:bg-[#1E90FF]/30 transition-all"
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
 className="px-2 py-1.5 bg-[#151A22] text-[#A0A4AB] text-xs rounded-lg hover:bg-[#222A36] transition-all"
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
 <div className="text-sm text-[#A0A4AB] space-y-1">
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
 <p className="text-[#A0A4AB]/70 text-xs mt-1">{party.notes}</p>
 )}
 <button onClick={() => openShareMenu(party)} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-1">
 <Share2 className="w-3 h-3" /> Share Party
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {joinedParties.length > 0 && (
 <div>
 <h3 className="text-lg font-bold text-[#1E90FF] mb-3">Joined ({joinedParties.length})</h3>
 <div className="space-y-3">
 {joinedParties.map(party => (
 <div
 key={party.id}
 className="bg-[#151A22] p-5 rounded-xl border border-[#222A36]"
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
 <div className="text-sm text-[#A0A4AB] space-y-1">
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
 <button onClick={() => openShareMenu(party)} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-1">
 <Share2 className="w-3 h-3" /> Share Party
 </button>
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
 <div className="min-h-screen pt-[60px] bg-[#0F1115] flex items-center justify-center">
 <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
 </div>
 );

 return (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <button onClick={() => setCurrentScreen('profile')} className="flex items-center gap-2 text-[#A0A4AB] hover:text-white transition-colors">
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
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36] text-center">
 <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
 <p className="text-[#A0A4AB] mb-2">No sponsor profile found.</p>
 <p className="text-[#A0A4AB]/70 text-sm">Subscribe to the Sponsor plan to manage your banner ad.</p>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-6 rounded-2xl border border-orange-500/30">
 <h3 className="text-lg font-bold text-orange-300 mb-4">Your Banner Ad</h3>
 <div className="space-y-4">
 <div>
 <label className="block text-sm text-[#A0A4AB] mb-1">Business / Brand Name</label>
 <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
 placeholder="Your Business Name" />
 </div>
 <div>
 <label className="block text-sm text-[#A0A4AB] mb-1">Tagline / Message</label>
 <input type="text" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
 placeholder="Reach sports fans nationwide!" maxLength={80} />
 <p className="text-xs text-[#A0A4AB]/70 mt-1">{form.tagline.length}/80 characters</p>
 </div>
 <div>
 <label className="block text-sm text-[#A0A4AB] mb-1">Website URL</label>
 <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
 placeholder="https://yourbusiness.com" />
 </div>
 <div>
 <label className="block text-sm text-[#A0A4AB] mb-1">Logo</label>
 <div className="flex items-center gap-3">
 {form.logo ? (
 <img src={`/api/uploads/serve/${form.logo}`} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-[#222A36]" />
 ) : (
 <div className="w-16 h-16 rounded-xl bg-[#151A22] border border-[#222A36] flex items-center justify-center">
 <Camera className="w-6 h-6 text-[#A0A4AB]/70" />
 </div>
 )}
 <button onClick={handleLogoUpload} className="px-4 py-2 bg-[#151A22] text-white text-sm rounded-xl hover:bg-[#222A36] transition-colors">
 {form.logo ? 'Change Logo' : 'Upload Logo'}
 </button>
 </div>
 </div>
 <div>
 <label className="block text-sm text-[#A0A4AB] mb-2">Target Sports (your ad shows on these sport pages)</label>
 <div className="flex flex-wrap gap-2">
 {SPORTS.filter(s => s !== 'All').map(sport => (
 <button key={sport} onClick={() => toggleSport(sport)}
 className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
 form.targetSports.includes(sport)
 ? 'bg-orange-500 text-white'
 : 'bg-[#151A22] text-[#A0A4AB] hover:bg-[#222A36]'
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

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36]">
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
 className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">
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
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-3">
 <div className="flex items-center justify-center">
 <h1 className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>MY PROFILE</h1>
 </div>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
 <div className="bg-[#151A22] p-8 rounded-2xl border border-[#222A36] shadow-xl text-center">
 <div className="flex flex-col items-center gap-4">
 <div className="relative group">
 <ProfileAvatar src={user.profilePicture} name={user.name} size="xl" className="border-4 border-[#1E90FF]/30" />
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
 <div className="absolute -bottom-1 -right-1 bg-[#1E90FF] rounded-full p-1.5 border-2 border-slate-800">
 <Camera className="w-3 h-3 text-white" />
 </div>
 )}
 </div>
 <div>
 <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 {user.name}
 </h1>
 <p className="text-[#A0A4AB] text-sm">{user.email}</p>
 {user.subscriptionTier === 'pro' && (
 <span className="inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs font-bold border bg-amber-500/20 text-amber-300 border-amber-500/30">
 ⭐ Pro Member
 </span>
 )}
 {user.isFounder && (
 <span className="inline-flex items-center gap-1 px-2 py-1 mt-1 rounded-xl font-bold border" style={{ fontSize: '11px', backgroundColor: '#F5B400', color: '#0F1115', borderColor: '#F5B400' }} title="One of the first 100 members to join Huddle Up">
 ⭐ Founder{user.founderNumber ? ` #${user.founderNumber}` : ''}
 </span>
 )}
 {user.subscriptionTier && !['free', 'pro'].includes(user.subscriptionTier) && (
 <span className={`inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs font-bold border ${
 user.subscriptionTier === 'sponsor' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
 'bg-green-500/20 text-green-300 border-green-500/30'
 }`}>
 {user.subscriptionTier === 'sponsor' ? '📢 Sponsor' : '🏪 Venue Owner'}
 </span>
 )}
 {user.dateOfBirth && (
 <p className="text-sm text-[#A0A4AB] mt-1">
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
 <span className="text-[#1E90FF] font-semibold">{user.country}</span>
 </p>
 )}
 {user.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 && (
 <div className="mt-3 w-full">
 <p className="text-[#A0A4AB] text-xs uppercase tracking-wider mb-2 font-semibold">My Teams</p>
 <div className="flex flex-wrap justify-center gap-2">
 {Object.entries(user.favoriteTeams).map(([sport, team]) => {
 const logoUrl = getTeamLogoUrl(sport, team);
 return (
 <div key={sport} className="flex flex-col items-center gap-1 px-2 py-1.5 bg-[#0F1115] rounded-xl border border-[#222A36]">
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E90FF]/20 to-[#1E90FF]/5 flex items-center justify-center overflow-hidden border border-[#1E90FF]/15">
 {logoUrl ? (
 <img src={logoUrl} alt={team} className="w-8 h-8 object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-[#1E90FF] font-bold" style="font-size:10px">${(team || '').substring(0,2).toUpperCase()}</span>`; }} />
 ) : (
 <span className="text-[#1E90FF] font-bold" style={{fontSize: '10px'}}>{(team || '').substring(0,2).toUpperCase()}</span>
 )}
 </div>
 <span className="text-[#A0A4AB] text-[10px] leading-tight max-w-[60px] truncate">{team}</span>
 <span className="text-[#555] text-[8px]">{sport}</span>
 </div>
 );
 })}
 </div>
 </div>
 )}
 <button
 onClick={() => setEditProfileOpen(true)}
 className="mt-3 px-4 py-2 bg-[#151A22] hover:bg-[#222A36] text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto"
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
 <div className="text-[#A0A4AB] text-xs">Attended</div>
 </div>
 <div className="w-px bg-[#222A36]" />
 <div className="text-center">
 <div className="text-2xl font-black text-white">{badgeStats.partiesHosted}</div>
 <div className="text-[#A0A4AB] text-xs">Hosted</div>
 </div>
 <div className="w-px bg-[#222A36]" />
 <div className="text-center">
 <div className="text-2xl font-black text-white">{badgeStats.partiesAttended + badgeStats.partiesHosted}</div>
 <div className="text-[#A0A4AB] text-xs">Total</div>
 </div>
 <div className="w-px bg-[#222A36]" />
 <div className="text-center">
 <div className="text-2xl font-black text-white">{friendsList.length}</div>
 <div className="text-[#A0A4AB] text-xs">Friends</div>
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
 <div className="flex justify-between text-xs text-[#A0A4AB] mb-1">
 <span>{badge.tier}</span>
 <span>{total}/{nextTier} to next rank</span>
 </div>
 <div className="w-full h-2 bg-[#151A22] rounded-full overflow-hidden">
 <div className={`h-full bg-gradient-to-r ${badge.color} rounded-full transition-all`} style={{ width: `${progress}%` }} />
 </div>
 </div>
 );
 })()}
 </div>
 </div>

 <div className="bg-[#151A22] rounded-2xl border border-[#222A36] shadow-xl overflow-hidden">
 <button onClick={() => { setCurrentScreen('invitations'); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-[#222A36]">
 <Bell className="w-5 h-5 text-yellow-400" />
 <span className="text-white text-sm font-semibold flex-1">Notifications</span>
 {totalAlerts > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{totalAlerts}</span>}
 <ChevronRight className="w-4 h-4 text-white/30" />
 </button>
 <button onClick={() => { setCurrentScreen('profile'); setTimeout(() => { const el = document.querySelector('[data-section="favorite-teams"]'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-[#222A36]">
 <Star className="w-5 h-5 text-amber-400" />
 <span className="text-white text-sm font-semibold flex-1">My Favorite Teams</span>
 {user?.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 && <span className="text-amber-400 text-xs font-bold">{Object.keys(user.favoriteTeams).length}</span>}
 <ChevronRight className="w-4 h-4 text-white/30" />
 </button>
 <button onClick={() => { setCurrentScreen('notificationSettings'); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-[#222A36]">
 <Settings className="w-5 h-5 text-white/60" />
 <span className="text-white text-sm font-semibold flex-1">Settings</span>
 <ChevronRight className="w-4 h-4 text-white/30" />
 </button>
 <button onClick={() => { setShowQA(true); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-[#222A36]">
 <HelpCircle className="w-5 h-5 text-indigo-400" />
 <span className="text-white text-sm font-semibold flex-1">Help & FAQ</span>
 <ChevronRight className="w-4 h-4 text-white/30" />
 </button>
 {!isAppInstalled && (
 <button onClick={() => { handlePwaInstall(); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left">
 <Download className="w-5 h-5 text-[#1E90FF]" />
 <span className="text-white text-sm font-semibold flex-1">Install App</span>
 <ChevronRight className="w-4 h-4 text-white/30" />
 </button>
 )}
 </div>

 {(() => {
 const allSports = ['NFL', 'NBA', 'MLB', 'NHL', 'College Football', 'College Basketball', 'Premier League', 'La Liga', 'Liga MX', 'MLS', 'Champions League', 'Formula 1', 'Tennis', 'Rugby', 'Cricket', 'FIFA World Cup'];
 const selectedTeams = Object.entries(user.favoriteTeams || {});
 const unselectedSports = allSports.filter(s => !user.favoriteTeams?.[s]);
 return (
 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36] shadow-xl">
 <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 MY FAVORITE TEAMS
 </h2>
 {selectedTeams.length > 0 ? (
 <div className="space-y-2 mb-4">
 {selectedTeams.map(([sport, team]) => {
 const logoUrl = getTeamLogoUrl(sport, team);
 return (
 <div key={sport} className="flex items-center gap-3 bg-[#0F1115] p-3 rounded-xl border border-[#222A36]">
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E90FF]/20 to-[#1E90FF]/5 flex items-center justify-center flex-shrink-0 border border-[#1E90FF]/15 overflow-hidden">
 {logoUrl ? (
 <img src={logoUrl} alt={team} className="w-8 h-8 object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-[#1E90FF] font-bold" style="font-size:11px">${team.substring(0,2).toUpperCase()}</span>`; }} />
 ) : (
 <span className="text-[#1E90FF] font-bold" style={{fontSize: '11px'}}>{team.substring(0,2).toUpperCase()}</span>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-white font-bold text-sm truncate">{team}</div>
 <div className="text-[#A0A4AB] text-xs">{sport}</div>
 </div>
 <select
 value={team}
 onChange={(e) => e.target.value ? updateFavoriteTeams(sport, e.target.value) : removeFavoriteTeam(sport)}
 className="bg-[#151A22] border border-[#222A36] rounded-lg text-[#A0A4AB] text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E90FF] max-w-[100px]"
 >
 {TEAMS_BY_SPORT[sport]?.map(t => (
 <option key={t} value={t}>{t}</option>
 ))}
 <option value="">Remove</option>
 </select>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.03]">
 <div className="text-6xl mb-4">⭐</div>
 <h3 className="text-white font-bold text-2xl mb-2">No Favorite Teams Yet</h3>
 <p className="text-white/60 text-sm mb-5 px-4">Add your favorite teams to get personalized recommendations and game alerts!</p>
 </div>
 )}
 {unselectedSports.length > 0 && (
 <details className="group">
 <summary className="flex items-center gap-2 cursor-pointer text-[#1E90FF] font-bold text-sm py-2 hover:text-[#1E90FF]/80 transition-colors list-none">
 <Plus className="w-4 h-4 group-open:rotate-45 transition-transform" />
 Add a Team ({unselectedSports.length} sports available)
 </summary>
 <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
 {unselectedSports.map(sport => (
 <div key={sport} className="flex items-center gap-3 bg-[#0F1115] p-3 rounded-xl border border-[#222A36]">
 {(() => { const firstTeam = TEAMS_BY_SPORT[sport]?.[0]; const sampleLogo = firstTeam ? getTeamLogoUrl(sport, firstTeam) : null; return sampleLogo ? (
 <img src={sampleLogo} alt={sport} className="w-7 h-7 object-contain flex-shrink-0 opacity-50" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
 ) : (
 <div className="w-7 h-7 rounded-full bg-[#222A36] flex items-center justify-center flex-shrink-0"><span className="text-[#A0A4AB] font-bold" style={{fontSize: '10px'}}>{sport.substring(0,2).toUpperCase()}</span></div>
 ); })()}
 <span className="text-white font-semibold text-sm flex-1">{sport}</span>
 <select
 value=""
 onChange={(e) => { if (e.target.value) updateFavoriteTeams(sport, e.target.value); }}
 className="bg-[#151A22] border border-[#222A36] rounded-lg text-[#A0A4AB] text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E90FF] max-w-[140px]"
 >
 <option value="">Select team...</option>
 {TEAMS_BY_SPORT[sport]?.map(team => (
 <option key={team} value={team}>{team}</option>
 ))}
 </select>
 </div>
 ))}
 </div>
 </details>
 )}
 </div>
 );
 })()}

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36] shadow-xl">
 {isPro ? (
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center"><Crown className="w-5 h-5 text-amber-400" /></div>
 <div>
 <p className="text-amber-300 font-bold text-sm">Pro Member</p>
 <p className="text-[#A0A4AB] text-xs">$2.99/month - All premium perks active</p>
 </div>
 </div>
 <button onClick={() => setCurrentScreen('proUpgrade')} className="px-3 py-1.5 bg-amber-500/20 text-amber-300 font-bold rounded-lg text-xs border border-amber-500/30">Manage</button>
 </div>
 ) : (
 <div>
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-bold text-white">Upgrade to Pro</h3>
 <span className="text-amber-300 text-xs font-bold">$2.99/mo</span>
 </div>
 <p className="text-[#A0A4AB] text-xs mb-3">Get VIP badge, 3x points, priority placement, custom themes, and more.</p>
 <button onClick={() => setCurrentScreen('proUpgrade')} className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl text-sm hover:opacity-90 transition-all">
 See Pro Features
 </button>
 </div>
 )}
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36] shadow-xl space-y-3">
 <h3 className="text-lg font-bold text-white mb-1">Help & Info</h3>
 <button onClick={() => { setCurrentScreen('games'); window.scrollTo({ top: 0 }); setTimeout(() => startSpotlightTour(), 1200); }} className="w-full flex items-center gap-3 p-3 bg-[#1E90FF]/10 hover:bg-[#1E90FF]/20 border border-[#1E90FF]/20 rounded-xl transition-colors text-left">
 <Map className="w-5 h-5 text-[#1E90FF]" />
 <span className="text-white font-medium text-sm">Learn How To Use The App</span>
 <span className="text-[#A0A4AB]/70 text-xs ml-1">Interactive app walkthrough</span>
 <ChevronRight className="w-4 h-4 text-[#A0A4AB]/70 ml-auto" />
 </button>
 <button onClick={() => setShowInviteReminder(true)} className="w-full flex items-center gap-3 p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-colors text-left">
 <Share2 className="w-5 h-5 text-purple-400" />
 <span className="text-white font-medium text-sm">Invite Friends</span>
 <span className="text-[#A0A4AB]/70 text-xs ml-1">Share the app & earn points</span>
 <ChevronRight className="w-4 h-4 text-[#A0A4AB]/70 ml-auto" />
 </button>
 <button onClick={() => setShowQA(true)} className="w-full flex items-center gap-3 p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-colors text-left">
 <Shield className="w-5 h-5 text-indigo-400" />
 <span className="text-white font-medium text-sm">Q & A</span>
 <ChevronRight className="w-4 h-4 text-[#A0A4AB]/70 ml-auto" />
 </button>
 <button onClick={() => setCurrentScreen('contactUs')} className="w-full flex items-center gap-3 p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl transition-colors text-left">
 <Send className="w-5 h-5 text-orange-400" />
 <span className="text-white font-medium text-sm">Contact Us</span>
 <span className="text-[#A0A4AB]/70 text-xs ml-1">Partnerships, Sponsorships, Events</span>
 <ChevronRight className="w-4 h-4 text-[#A0A4AB]/70 ml-auto" />
 </button>
 <button onClick={() => setCurrentScreen('termsOfService')} className="w-full flex items-center gap-3 p-3 bg-[#151A22] hover:bg-[#222A36] border border-[#222A36] rounded-xl transition-colors text-left">
 <Shield className="w-5 h-5 text-[#A0A4AB]" />
 <span className="text-white font-medium text-sm">Terms of Service</span>
 <ChevronRight className="w-4 h-4 text-[#A0A4AB]/70 ml-auto" />
 </button>
 <button onClick={() => setCurrentScreen('privacyPolicy')} className="w-full flex items-center gap-3 p-3 bg-[#151A22] hover:bg-[#222A36] border border-[#222A36] rounded-xl transition-colors text-left">
 <Lock className="w-5 h-5 text-[#A0A4AB]" />
 <span className="text-white font-medium text-sm">Privacy Policy</span>
 <ChevronRight className="w-4 h-4 text-[#A0A4AB]/70 ml-auto" />
 </button>
 </div>

 <div>
 <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 My Watch Parties
 </h2>

 {myParties.length === 0 ? (
 <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-10 text-center">
 <div className="text-6xl mb-4">📅</div>
 <h3 className="text-white font-bold text-2xl mb-2">No Upcoming Parties</h3>
 <p className="text-white/70 text-base mb-6">You haven't joined any parties yet. Find a game and join the fun!</p>
 <button
 onClick={() => { setCurrentScreen('browseParties'); window.scrollTo(0,0); }}
 className="primary-btn find-btn w-full max-w-xs py-3 text-white font-bold rounded-xl text-base shadow-lg"
 >
 <span className="btn-icon">🔍</span> Browse Parties
 </button>
 </div>
 ) : (
 <div className="space-y-6">
 {hostedParties.length > 0 && (
 <div>
 <h3 className="text-lg font-bold text-[#A0A4AB] mb-3">Hosting ({hostedParties.length})</h3>
 <div className="space-y-3">
 {hostedParties.map(party => {
 const game = SAMPLE_GAMES.find(g => g.id === party.gameId);
 return (
 <div
 key={party.id}
 className="bg-[#151A22] p-5 rounded-xl border border-[#222A36]"
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
 <div className="text-sm text-[#A0A4AB] space-y-1">
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
 <h3 className="text-lg font-bold text-[#A0A4AB] mb-3">Joined ({joinedParties.length})</h3>
 <div className="space-y-3">
 {joinedParties.map(party => (
 <div
 key={party.id}
 className="bg-[#151A22] p-5 rounded-xl border border-[#222A36]"
 >
 <div className="text-white font-bold mb-1">
 {party.homeTeam || SAMPLE_GAMES.find(g => g.id === party.gameId)?.homeTeam} vs{' '}
 {party.awayTeam || SAMPLE_GAMES.find(g => g.id === party.gameId)?.awayTeam}
 </div>
 <div className="text-sm text-[#A0A4AB] space-y-1">
 <div>Hosted by {party.hostName}</div>
 <div className="flex items-center gap-2">
 <MapPin className="w-3 h-3" />
 <AddressLink address={party.venueName || party.location} />
 </div>
 <button onClick={() => openShareMenu(party)} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-1">
 <Share2 className="w-3 h-3" /> Share Party
 </button>
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
 <p className="text-[#A0A4AB] text-sm mb-4">Manage your banner ad, logo, and target sports.</p>
 <button
 onClick={() => setCurrentScreen('sponsorDashboard')}
 className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl transition-all"
 >
 Open Sponsor Dashboard
 </button>
 </div>
 )}

 <SubscriptionSection userType={user?.userType} />

 <ReferralSection user={user} />

 <div className="bg-gradient-to-br from-emerald-900/40 to-[#151A22] p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
 <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Share2 className="inline w-6 h-6 mr-2 text-emerald-400" />
 INVITE FRIENDS
 </h2>
 <p className="text-[#A0A4AB] text-sm mb-4">Share Huddle Up with your friends so they can join your watch parties!</p>
 <button
 onClick={shareApp}
 className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
 >
 <Share2 className="w-5 h-5" /> Share Huddle Up
 </button>
 </div>

 <div className="bg-[#151A22] p-6 rounded-2xl border border-[#222A36] shadow-xl">
 <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 NOTIFICATIONS
 </h2>
 <div className="flex items-center justify-between bg-[#151A22] p-4 rounded-xl">
 <div>
 <div className="text-white font-semibold">Fan Party Alerts</div>
 <div className="text-[#A0A4AB] text-sm mt-1">
 Get notified when a fellow fan of your favorite team creates a new watch party
 </div>
 </div>
 <button
 onClick={toggleNotifications}
 className={`relative w-14 h-7 rounded-full transition-colors ${
 user.notificationsEnabled ? 'bg-[#1E90FF]' : 'bg-gray-600'
 }`}
 >
 <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
 user.notificationsEnabled ? 'translate-x-7' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div className="mt-4 space-y-3">
 <div className="flex items-center justify-between bg-[#151A22] p-4 rounded-xl">
 <div>
 <div className="text-white font-semibold flex items-center gap-2">
 <span>📱</span> Text Message Alerts
 </div>
 <div className="text-[#A0A4AB] text-sm mt-1">
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
 <p className="text-xs text-[#A0A4AB]/70 italic">Add your phone number and city, then enable the toggle to receive text alerts when parties match your teams.</p>
 )}
 </div>
 </div>

 {/* MY COUNTRY SECTION */}
 <div className="bg-gradient-to-br from-amber-900/30 to-[#151A22] p-6 rounded-2xl border border-amber-500/20 shadow-xl">
 <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 🌍 MY COUNTRY
 </h2>
 <p className="text-[#A0A4AB] text-sm mb-4">
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
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
 >
 <option value="">Select your country...</option>
 {COUNTRIES_LIST.map(c => (
 <option key={c} value={c}>{COUNTRY_FLAGS[c]} {c}</option>
 ))}
 </select>
 {user.country && (
 <div className="mt-4 flex items-center gap-3 bg-[#151A22] p-4 rounded-xl">
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

 <button
 onClick={handleLogout}
 className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-400 font-bold rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
 >
 <LogOut className="w-5 h-5" />
 Log Out
 </button>

 </div>
 </div>
 );
 };

 const fanFinderMyParties = parties.filter(p =>
 userParties.includes(p.id) || p.hostId === user?.id
 );

 const renderFanFinderScreen = () => (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <div className="flex items-center gap-3">
 <button type="button" onClick={() => setCurrentScreen('games')} className="p-2 bg-[#151A22] rounded-xl hover:bg-[#222A36] active:bg-[#222A36] cursor-pointer">
 <ArrowLeft className="w-5 h-5 text-white" />
 </button>
 <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <UserPlus className="inline w-6 h-6 mr-2 text-[#1E90FF]" />
 FIND FANS
 </h1>
 </div>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
 <div className="flex gap-2 mb-2">
 <button onClick={() => { setFanSearchTab('nearby'); if (currentCity && nearbyFans.length === 0) searchNearbyFans(currentCity); }} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${fanSearchTab === 'nearby' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' : 'bg-[#151A22] text-[#A0A4AB] border border-[#222A36]'}`}>
 <MapPin className="w-4 h-4 inline mr-1" />Near Me
 </button>
 <button onClick={() => setFanSearchTab('team')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${fanSearchTab === 'team' ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB] border border-[#222A36]'}`}>
 By Team
 </button>
 <button onClick={() => setFanSearchTab('name')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${fanSearchTab === 'name' ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB] border border-[#222A36]'}`}>
 By Name
 </button>
 </div>

 {fanSearchTab === 'nearby' && (
 <div className="space-y-4">
 <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-6">
 <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
 <MapPin className="w-5 h-5 text-emerald-400" />
 Fans Near Me
 </h2>
 <p className="text-[#A0A4AB] text-sm mb-4">Find other sports fans in your area and connect at watch parties.</p>
 <div className="flex gap-2">
 <div className="relative flex-1">
 <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
 <input
 type="text"
 value={nearbyCity || currentCity || ''}
 onChange={(e) => setNearbyCity(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && searchNearbyFans()}
 placeholder="Enter your city..."
 className="w-full pl-10 pr-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 <button
 onClick={() => searchNearbyFans()}
 disabled={nearbyLoading || (!nearbyCity && !currentCity)}
 className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {nearbyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
 Find
 </button>
 </div>
 </div>

 {nearbyParties.length > 0 && (
 <div className="bg-[#151A22] border border-[#222A36] rounded-2xl p-4">
 <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
 <Flame className="w-4 h-4 text-orange-400" />
 Watch Parties in {nearbyCity || currentCity}
 <span className="text-[#A0A4AB] text-xs font-normal">({nearbyParties.length})</span>
 </h3>
 <div className="space-y-2">
 {nearbyParties.map(p => (
 <div
 key={p.id}
 onClick={() => { const matchingGame = games.find(g => g.id === p.gameId); if (matchingGame) { setSelectedGame(matchingGame); setCurrentScreen('gameDetail'); } else { setSelectedGame({ id: p.gameId || p.id, sport: p.sport, homeTeam: p.homeTeam, awayTeam: p.awayTeam, startTime: p.gameTime, gameStatus: 'scheduled' }); setCurrentScreen('gameDetail'); } window.scrollTo(0, 0); }}
 className="flex items-center gap-3 p-3 bg-[#0F1115] rounded-xl cursor-pointer hover:bg-[#1a1f2a] transition-colors"
 >
 <div className="text-2xl">{SPORT_ICONS[p.sport] || '🏅'}</div>
 <div className="flex-1 min-w-0">
 <p className="text-white font-semibold text-sm truncate">{p.title || `${p.homeTeam} vs ${p.awayTeam}`}</p>
 <p className="text-[#A0A4AB] text-xs">{p.venueName} {p.gameTime ? `• ${new Date(p.gameTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}` : ''}</p>
 </div>
 <div className="text-right flex-shrink-0">
 <span className="text-emerald-400 text-xs font-bold">{p.attendeeCount}/{p.maxSize}</span>
 <p className="text-[#A0A4AB] text-[10px]">attending</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {nearbyFans.length > 0 && (
 <div>
 <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
 <Users className="w-4 h-4 text-cyan-400" />
 {nearbyFans.length} Fan{nearbyFans.length !== 1 ? 's' : ''} in {nearbyCity || currentCity}
 </h3>

 {fanFinderMyParties.length > 0 && (
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4 mb-3">
 <label className="text-sm text-[#A0A4AB] mb-2 block">Invite them to your party:</label>
 <select
 value={invitePartyId || ''}
 onChange={(e) => setInvitePartyId(e.target.value || null)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="" className="bg-[#151A22]">Choose a party...</option>
 {fanFinderMyParties.map(p => (
 <option key={p.id} value={p.id} className="bg-[#151A22]">
 {p.title || `${p.homeTeam} vs ${p.awayTeam}`} - {p.venueName}
 </option>
 ))}
 </select>
 </div>
 )}

 <div className="space-y-3">
 {nearbyFans.map(fan => {
 const isFriend = friendsList.some(f => f.id === fan.id);
 const requestSent = friendStatuses[fan.id] === 'sent';
 return (
 <div key={fan.id} className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <div className="flex items-center gap-3">
 <ProfileAvatar src={fan.profilePicture} name={fan.name} size="md" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-white font-semibold cursor-pointer hover:text-[#1E90FF]" onClick={() => { setViewingUserId(fan.id); setCurrentScreen('userProfile'); }}>{fan.name}</span>
 <BadgeDisplay attended={fan.partiesAttended || 0} hosted={fan.partiesHosted || 0} size="sm" />
 {fan.subscriptionTier === 'pro' && (
 <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30">⭐ PRO</span>
 )}
 {isFriend && (
 <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
 <Users className="w-3 h-3 inline mr-1" />Crew
 </span>
 )}
 </div>
 {fan.city && <p className="text-[#A0A4AB] text-xs mt-0.5"><MapPin className="w-3 h-3 inline mr-1" />{fan.city}</p>}
 <div className="flex flex-wrap gap-1 mt-1">
 {fan.favoriteTeams && fan.favoriteTeams.map((ft, i) => (
 <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">{ft.team}</span>
 ))}
 </div>
 </div>
 <div className="flex flex-col gap-1.5 flex-shrink-0">
 {!isFriend && !requestSent && (
 <button onClick={() => sendFriendRequest(fan.id)} className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1">
 <Heart className="w-3 h-3" /> Add
 </button>
 )}
 {requestSent && <span className="px-3 py-1.5 bg-[#222A36] text-[#A0A4AB] text-xs rounded-lg">Sent</span>}
 <button onClick={() => { setDmRecipient(fan); setCurrentScreen('dmChat'); }} className="px-3 py-1.5 bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold rounded-lg transition-all flex items-center gap-1">
 <Send className="w-3 h-3" /> Chat
 </button>
 </div>
 </div>
 {invitePartyId && (
 <div className="mt-3 pl-12">
 <button
 onClick={() => handleInviteFan(fan.id, invitePartyId)}
 disabled={inviteSending[`${fan.id}-${invitePartyId}`] === true || inviteSending[`${fan.id}-${invitePartyId}`] === 'sent'}
 className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${inviteSending[`${fan.id}-${invitePartyId}`] === 'sent' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-[#1E90FF] text-white hover:opacity-90'} disabled:opacity-60`}
 >
 {inviteSending[`${fan.id}-${invitePartyId}`] === 'sent' ? <><CheckCircle className="w-4 h-4" /> Invited</> : inviteSending[`${fan.id}-${invitePartyId}`] === true ? 'Sending...' : <><Send className="w-4 h-4" /> Invite to Party</>}
 </button>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}

 {!nearbyLoading && nearbyFans.length === 0 && (nearbyCity || currentCity) && nearbyCity !== '' && (
 <div className="text-center py-8">
 <div className="text-4xl mb-3">📍</div>
 <p className="text-[#A0A4AB]">No fans found near {nearbyCity || currentCity} yet. Share the app to grow the community!</p>
 </div>
 )}

 {!nearbyCity && !currentCity && (
 <div className="text-center py-8">
 <div className="text-4xl mb-3">🗺️</div>
 <p className="text-[#A0A4AB]">Enter your city above or enable location on the home screen to find fans near you.</p>
 </div>
 )}
 </div>
 )}

 {fanSearchTab === 'name' && (
 <div className="bg-gradient-to-br from-purple-500/10 to-[#1E90FF]/10 border border-purple-500/30 rounded-2xl p-6">
 <h2 className="text-lg font-bold text-white mb-2">Find by Name or Phone</h2>
 <p className="text-[#A0A4AB] text-sm mb-4">Search by first name, last name, full name, or phone number.</p>
 <div className="space-y-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A4AB]" />
 <input
 type="text"
 value={fanNameQuery}
 onChange={(e) => setFanNameQuery(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && searchFansByName()}
 placeholder='e.g. "John Smith" or "555-1234"'
 className="w-full pl-10 pr-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-purple-500"
 />
 </div>
 <button
 onClick={searchFansByName}
 disabled={!fanNameQuery || fanNameQuery.trim().length < 2 || fanNameSearchLoading}
 className="w-full py-3 bg-gradient-to-r from-purple-500 to-[#1E90FF] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
 >
 {fanNameSearchLoading ? 'Searching...' : 'Search'}
 </button>
 </div>
 </div>
 )}

 {fanSearchTab === 'team' && (
 <div className="bg-gradient-to-br from-cyan-500/10 to-[#1E90FF]/10 border border-[#1E90FF]/30 rounded-2xl p-6">
 <h2 className="text-lg font-bold text-white mb-4">Search by Team</h2>
 <div className="space-y-3">
 <select
 value={fanSearchSport}
 onChange={(e) => { setFanSearchSport(e.target.value); setFanSearchTeam(''); setFanResults([]); }}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="" className="bg-[#151A22]">Select a sport...</option>
 {Object.keys(TEAMS_BY_SPORT).sort().map(sport => (
 <option key={sport} value={sport} className="bg-[#151A22]">{sport}</option>
 ))}
 </select>

 {fanSearchSport && TEAMS_BY_SPORT[fanSearchSport] && (
 <select
 value={fanSearchTeam}
 onChange={(e) => { setFanSearchTeam(e.target.value); setFanResults([]); }}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="" className="bg-[#151A22]">Select a team...</option>
 {TEAMS_BY_SPORT[fanSearchSport].map(team => (
 <option key={team} value={team} className="bg-[#151A22]">{team}</option>
 ))}
 </select>
 )}

 <button
 onClick={searchFans}
 disabled={!fanSearchSport || !fanSearchTeam || fanSearchLoading}
 className="w-full py-3 bg-[#1E90FF] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
 >
 {fanSearchLoading ? 'Searching...' : 'Find Fans'}
 </button>
 </div>
 </div>
 )}

 {fanSearchTab === 'team' && fanResults.length > 0 && (
 <div className="space-y-3">
 <h2 className="text-lg font-bold text-white">
 {fanResults.length} fan{fanResults.length !== 1 ? 's' : ''} found for {fanSearchTeam}
 </h2>

 {fanFinderMyParties.length > 0 && (
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <label className="text-sm text-[#A0A4AB] mb-2 block">Select a party to invite fans to:</label>
 <select
 value={invitePartyId || ''}
 onChange={(e) => setInvitePartyId(e.target.value || null)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="" className="bg-[#151A22]">Choose a party...</option>
 {fanFinderMyParties.map(p => (
 <option key={p.id} value={p.id} className="bg-[#151A22]">
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
 <div key={fan.id} className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <div className="flex items-center gap-3">
 <ProfileAvatar src={fan.profilePicture} name={fan.name} size="md" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-white font-semibold">{fan.name}</span>
 <BadgeDisplay attended={fan.partiesAttended || 0} hosted={fan.partiesHosted || 0} size="sm" />
 {fan.subscriptionTier === 'pro' && (
 <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30">⭐ PRO</span>
 )}
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
 <div className="text-[#A0A4AB] text-sm flex flex-wrap gap-1 mt-1">
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
 className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
 >
 <Heart className="w-3 h-3" /> Add
 </button>
 )}
 {requestSent && (
 <span className="px-3 py-2 bg-[#151A22] text-[#A0A4AB] text-xs font-bold rounded-xl">Sent</span>
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
 : 'bg-[#1E90FF] text-white hover:opacity-90'
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

 {fanSearchTab === 'team' && fanResults.length === 0 && fanSearchTeam && !fanSearchLoading && (
 <div className="text-center py-8">
 <div className="text-4xl mb-3">🔍</div>
 <p className="text-[#A0A4AB]">No fans found for {fanSearchTeam} yet. Be the first to set them as your favorite!</p>
 </div>
 )}

 {fanSearchTab === 'team' && !fanSearchTeam && (
 <div className="text-center py-8">
 <div className="text-4xl mb-3">👥</div>
 <p className="text-[#A0A4AB]">Select a sport and team above to find other fans and invite them to your watch parties.</p>
 </div>
 )}

 {fanSearchTab === 'name' && fanNameResults.length > 0 && (
 <div className="space-y-3">
 <h2 className="text-lg font-bold text-white">
 {fanNameResults.length} result{fanNameResults.length !== 1 ? 's' : ''} found
 </h2>

 {fanFinderMyParties.length > 0 && (
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <label className="text-sm text-[#A0A4AB] mb-2 block">Select a party to invite fans to:</label>
 <select
 value={invitePartyId || ''}
 onChange={(e) => setInvitePartyId(e.target.value || null)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="" className="bg-[#151A22]">Choose a party...</option>
 {fanFinderMyParties.map(p => (
 <option key={p.id} value={p.id} className="bg-[#151A22]">
 {p.title || `${p.homeTeam} vs ${p.awayTeam}`} - {p.venueName}
 </option>
 ))}
 </select>
 </div>
 )}

 {fanNameResults.map(fan => {
 const isFriend = friendsList.some(f => f.id === fan.id);
 const requestSent = friendStatuses[fan.id] === 'sent';
 return (
 <div key={fan.id} className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <div className="flex items-center gap-3">
 <ProfileAvatar src={fan.profilePicture} name={fan.name} size="md" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-white font-semibold">{fan.name}</span>
 <BadgeDisplay attended={fan.partiesAttended || 0} hosted={fan.partiesHosted || 0} size="sm" />
 {isFriend && (
 <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
 <Users className="w-3 h-3 inline mr-1" />In Your Crew
 </span>
 )}
 </div>
 <div className="text-[#A0A4AB] text-sm flex flex-wrap gap-1 mt-1">
 {fan.favoriteTeams && fan.favoriteTeams.map((ft, i) => (
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
 className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
 >
 <Heart className="w-3 h-3" /> Add
 </button>
 )}
 {requestSent && (
 <span className="px-3 py-2 bg-[#151A22] text-[#A0A4AB] text-xs font-bold rounded-xl">Sent</span>
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
 : 'bg-[#1E90FF] text-white hover:opacity-90'
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
 </div>
 )}

 {fanSearchTab === 'name' && fanNameResults.length === 0 && fanNameQuery.trim().length >= 2 && !fanNameSearchLoading && (
 <div className="text-center py-8">
 <div className="text-4xl mb-3">🔍</div>
 <p className="text-[#A0A4AB]">No users found matching "{fanNameQuery}". Try a different name or phone number.</p>
 </div>
 )}

 {fanSearchTab === 'name' && fanNameQuery.trim().length < 2 && (
 <div className="text-center py-8">
 <div className="text-4xl mb-3">🔎</div>
 <p className="text-[#A0A4AB]">Enter a name or phone number above to find fans you know.</p>
 </div>
 )}
 </div>
 </div>
 );

 const PredictionsScreen = () => {
 const upcomingPreds = myPredictions.filter(p => p.status === 'pending');
 const pastPreds = myPredictions.filter(p => p.status !== 'pending');
 const scheduledGames = games.filter(g => g.gameStatus !== 'final');

 return (
 <div className="min-h-screen bg-[#0F1115]" style={{ paddingTop: `${MAIN_BANNER_HEIGHT}px`, paddingBottom: '72px' }}>
 <div className="sticky bg-[#0F1115] border-b border-[#222A36] z-[61]" style={{ top: `${MAIN_BANNER_HEIGHT}px` }}>
 <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="flex items-center gap-1.5 text-[#A0A4AB] hover:text-white transition-colors">
 <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">Back</span>
 </button>
 <h1 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>GAME PREDICTIONS</h1>
 <Target className="w-5 h-5 text-emerald-400 ml-auto" />
 </div>
 <div className="max-w-4xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
   {['upcoming', 'past', 'predict', 'leaderboard'].map(tab => (
     <button key={tab} onClick={() => { setPredictionsTab(tab); if (tab === 'leaderboard') loadPredictionLeaderboard(); }}
       className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex-shrink-0 cursor-pointer ${
         predictionsTab === tab ? 'bg-emerald-500 text-white' : 'bg-[#151A22] text-[#A0A4AB] hover:text-white border border-[#222A36]'
       }`}>
       {tab === 'upcoming' ? 'Active' : tab === 'past' ? 'History' : tab === 'predict' ? 'Games' : 'Leaders'}
     </button>
   ))}
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">

 {predictionStats && (
 <div className="grid grid-cols-4 gap-2">
   <div className="bg-[#151A22] rounded-xl p-3 text-center border border-[#222A36]">
     <div className="text-xl font-black text-white">{predictionStats.total}</div>
     <div className="text-[10px] text-[#A0A4AB]">Total</div>
   </div>
   <div className="bg-[#151A22] rounded-xl p-3 text-center border border-emerald-500/30">
     <div className="text-xl font-black text-emerald-400">{predictionStats.correct}</div>
     <div className="text-[10px] text-[#A0A4AB]">Correct</div>
   </div>
   <div className="bg-[#151A22] rounded-xl p-3 text-center border border-[#222A36]">
     <div className="text-xl font-black text-[#1E90FF]">{predictionStats.winRate}%</div>
     <div className="text-[10px] text-[#A0A4AB]">Win Rate</div>
   </div>
   <div className="bg-[#151A22] rounded-xl p-3 text-center border border-orange-500/30">
     <div className="text-xl font-black text-orange-400">{predictionStats.currentStreak}</div>
     <div className="text-[10px] text-[#A0A4AB]">Streak</div>
   </div>
 </div>
 )}

 {predictionStats && (
 <div className="bg-gradient-to-r from-emerald-500/10 to-[#1E90FF]/10 rounded-xl p-4 border border-emerald-500/20">
   <div className="flex items-center justify-between">
     <div>
       <div className="text-sm text-[#A0A4AB]">Points Earned from Predictions</div>
       <div className="text-2xl font-black text-emerald-400">{predictionStats.totalPointsEarned.toLocaleString()}</div>
     </div>
     <div className="text-right">
       <div className="text-sm text-[#A0A4AB]">Best Streak</div>
       <div className="text-2xl font-black text-orange-400">{predictionStats.bestStreak}</div>
     </div>
   </div>
 </div>
 )}

 {predictionsTab === 'predict' && (
 <div className="space-y-3">
   <p className="text-[#A0A4AB] text-xs">Pick the winner for upcoming games to earn points!</p>
   {scheduledGames.length === 0 ? (
     <p className="text-center text-[#A0A4AB] py-8">No upcoming games to predict right now. Check back later!</p>
   ) : scheduledGames.slice(0, 20).map(game => {
     const existing = gamePredictionCache[game.id] || myPredictions.find(p => p.game_id === game.id);
     const timeLeft = new Date(game.startTime) - new Date();
     const hoursLeft = Math.floor(timeLeft / 3600000);
     const minsLeft = Math.floor((timeLeft % 3600000) / 60000);
     const isStarted = timeLeft <= 0;
     return (
     <div key={game.id} className="bg-[#151A22] rounded-2xl border border-[#222A36] p-4">
       <div className="flex items-center justify-between mb-2">
         <span className="text-xs text-[#1E90FF] bg-[#1E90FF]/10 px-2 py-0.5 rounded-full font-bold">{game.sport}</span>
         {game.gameStatus === 'live' ? (
           <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold live-badge-pulse">LIVE</span>
         ) : isStarted ? (
           <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">Started</span>
         ) : (
           <span className="text-xs text-[#A0A4AB]">{hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`} until lock</span>
         )}
       </div>
       <div className="flex items-center justify-center gap-4 mb-3">
         <div className="flex-1 text-center">
           {game.homeLogo && <img src={game.homeLogo} alt="" className="w-10 h-10 object-contain mx-auto mb-1" />}
           <div className="text-sm font-bold text-white">{game.homeTeam}</div>
         </div>
         <span className="text-lg font-black text-[#A0A4AB]">VS</span>
         <div className="flex-1 text-center">
           {game.awayLogo && <img src={game.awayLogo} alt="" className="w-10 h-10 object-contain mx-auto mb-1" />}
           <div className="text-sm font-bold text-white">{game.awayTeam}</div>
         </div>
       </div>
       {existing ? (
         <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-3">
           <div className="flex items-center justify-center gap-2 mb-2">
             <CheckCircle className="w-4 h-4 text-emerald-400" />
             <span className="text-emerald-400 font-bold text-sm">Prediction Locked In!</span>
           </div>
           <div className="flex items-center gap-3 justify-center mb-2">
             <div className={`px-3 py-1.5 rounded-lg text-center ${existing.picked_team === game.homeTeam ? 'bg-emerald-500/20 border border-emerald-500/40' : 'opacity-40'}`}>
               {game.homeLogo && <img src={game.homeLogo} alt="" className="w-6 h-6 object-contain mx-auto mb-0.5" />}
               <span className="text-white text-xs font-bold">{game.homeTeam}</span>
             </div>
             <span className="text-[#A0A4AB] text-xs">vs</span>
             <div className={`px-3 py-1.5 rounded-lg text-center ${existing.picked_team === game.awayTeam ? 'bg-emerald-500/20 border border-emerald-500/40' : 'opacity-40'}`}>
               {game.awayLogo && <img src={game.awayLogo} alt="" className="w-6 h-6 object-contain mx-auto mb-0.5" />}
               <span className="text-white text-xs font-bold">{game.awayTeam}</span>
             </div>
           </div>
           <p className="text-[#A0A4AB] text-xs text-center">Confidence: {existing.confidence}/10 | Potential: <span className="text-emerald-400 font-bold">+{existing.confidence * 50} pts</span></p>
         </div>
       ) : isStarted ? (
         <div className="text-center py-2 bg-[#222A36]/50 rounded-xl">
           <p className="text-[#A0A4AB] text-sm">Predictions locked - game in progress</p>
         </div>
       ) : (
         <>
         <div className="flex gap-2 mb-2">
           <button onClick={() => { setExpandedPrediction(expandedPrediction === game.id ? null : game.id); setPredictionConfidence(5); }}
             className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
             Make Prediction
           </button>
         </div>
         {expandedPrediction === game.id && (
           <div className="mt-3 pt-3 border-t border-[#222A36]">
             <p className="text-xs text-[#A0A4AB] mb-2 text-center">Who will win?</p>
             <div className="flex gap-3 mb-3">
               <button onClick={() => submitPrediction(game, game.homeTeam, predictionConfidence)}
                 disabled={predictionLoading}
                 className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#0D1117] border border-[#222A36] text-white hover:border-emerald-500/50 active:scale-95">
                 {game.homeTeam}
               </button>
               <button onClick={() => submitPrediction(game, game.awayTeam, predictionConfidence)}
                 disabled={predictionLoading}
                 className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#0D1117] border border-[#222A36] text-white hover:border-emerald-500/50 active:scale-95">
                 {game.awayTeam}
               </button>
             </div>
             <div className="mb-2">
               <div className="flex justify-between text-xs text-[#A0A4AB] mb-1"><span>Confidence</span><span>{predictionConfidence}/10</span></div>
               <input type="range" min="1" max="10" value={predictionConfidence} onChange={e => setPredictionConfidence(parseInt(e.target.value))}
                 className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #10B981 0%, #F59E0B ${predictionConfidence * 10}%, #333 ${predictionConfidence * 10}%)` }} />
             </div>
             <p className="text-xs text-[#A0A4AB] text-center">Win: <span className="text-emerald-400 font-bold">+{predictionConfidence * 50} pts</span></p>
           </div>
         )}
         </>
       )}
     </div>
     );
   })}
 </div>
 )}

 {predictionsTab === 'upcoming' && (
 <div className="space-y-3">
   {upcomingPreds.length === 0 ? (
     <div className="text-center py-8">
       <Target className="w-12 h-12 text-[#A0A4AB]/30 mx-auto mb-3" />
       <p className="text-[#A0A4AB]">No active predictions</p>
       <button onClick={() => setPredictionsTab('predict')} className="text-emerald-400 text-sm font-bold mt-2">Browse Games</button>
     </div>
   ) : upcomingPreds.map(pred => {
     const timeLeft = new Date(pred.game_time) - new Date();
     const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600000));
     const minsLeft = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));
     const isLocked = timeLeft <= 0;
     return (
     <div key={pred.id} className="bg-[#151A22] rounded-2xl border border-emerald-500/20 p-4">
       <div className="flex items-center justify-between mb-2">
         <span className="text-xs text-[#1E90FF] bg-[#1E90FF]/10 px-2 py-0.5 rounded-full font-bold">{pred.sport}</span>
         {isLocked ? (
           <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">Locked - In Progress</span>
         ) : (
           <span className="text-xs text-[#A0A4AB]">Locks in {hoursLeft}h {minsLeft}m</span>
         )}
       </div>
       <div className="text-center">
         <p className="text-white font-bold">{pred.home_team} vs {pred.away_team}</p>
         <p className="text-emerald-400 text-sm mt-1">Your pick: <span className="font-bold">{pred.picked_team}</span></p>
         <p className="text-[#A0A4AB] text-xs">Confidence: {pred.confidence}/10 | Potential: +{pred.confidence * 50} pts</p>
       </div>
     </div>
     );
   })}
 </div>
 )}

 {predictionsTab === 'past' && (
 <div className="space-y-3">
   {pastPreds.length === 0 ? (
     <p className="text-center text-[#A0A4AB] py-8">No resolved predictions yet</p>
   ) : pastPreds.map(pred => (
     <div key={pred.id} className={`bg-[#151A22] rounded-2xl border p-4 ${pred.status === 'correct' ? 'border-emerald-500/30' : 'border-red-500/20'}`}>
       <div className="flex items-center justify-between mb-2">
         <span className="text-xs text-[#1E90FF] bg-[#1E90FF]/10 px-2 py-0.5 rounded-full font-bold">{pred.sport}</span>
         {pred.status === 'correct' ? (
           <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> +{pred.points_earned} pts</span>
         ) : (
           <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full font-bold">Incorrect</span>
         )}
       </div>
       <div className="text-center">
         <p className="text-white font-bold">{pred.home_team} vs {pred.away_team}</p>
         <p className={`text-sm mt-1 ${pred.status === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
           Your pick: {pred.picked_team} ({pred.confidence}/10)
         </p>
         {pred.winner && <p className="text-[#A0A4AB] text-xs mt-1">Winner: {pred.winner}</p>}
       </div>
     </div>
   ))}
 </div>
 )}

 {predictionsTab === 'leaderboard' && (
 <div className="space-y-3">
   <div className="flex gap-2 relative z-[5]">
     {['weekly', 'monthly', 'alltime'].map(p => (
       <button key={p} onClick={() => { setPredictionLeaderPeriod(p); loadPredictionLeaderboard(p); }}
         className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer active:scale-[0.95] ${predictionLeaderPeriod === p ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB] hover:text-white border border-[#222A36]'}`}>
         {p === 'weekly' ? 'This Week' : p === 'monthly' ? 'This Month' : 'All Time'}
       </button>
     ))}
   </div>
   {predictionLeaderboard.length === 0 ? (
     <p className="text-center text-[#A0A4AB] py-8">No predictions yet for this period</p>
   ) : predictionLeaderboard.map((leader, idx) => (
     <div key={leader.id} className="bg-[#151A22] rounded-xl border border-[#222A36] p-3 flex items-center gap-3">
       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
         idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-[#222A36] text-[#A0A4AB]'
       }`}>{idx + 1}</div>
       {leader.profile_picture ? (
         <img src={leader.profile_picture.startsWith('http') ? leader.profile_picture : `/api/uploads/serve/${leader.profile_picture.replace('/objects/', '')}`} alt="" className="w-8 h-8 rounded-full object-cover" />
       ) : (
         <div className="w-8 h-8 rounded-full bg-[#222A36] flex items-center justify-center"><User className="w-4 h-4 text-[#A0A4AB]" /></div>
       )}
       <div className="flex-1 min-w-0">
         <p className="text-white font-bold text-sm truncate flex items-center gap-1.5">{leader.name} {leader.is_founder && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg font-bold flex-shrink-0" style={{ fontSize: '9px', backgroundColor: '#F5B400', color: '#0F1115' }}>⭐</span>}</p>
         <p className="text-[#A0A4AB] text-xs">{leader.correct_picks}/{leader.total_picks} correct</p>
       </div>
       <div className="text-right">
         <p className="text-emerald-400 font-bold text-sm">{parseInt(leader.points_earned).toLocaleString()}</p>
         <p className="text-[#A0A4AB] text-[10px]">pts earned</p>
       </div>
     </div>
   ))}
 </div>
 )}

 <div className="bg-[#151A22] rounded-xl p-3 border border-[#222A36]">
   <p className="text-[#A0A4AB] text-xs text-center">For entertainment only - points have no cash value. This is not gambling.</p>
 </div>
 </div>
 </div>
 );
 };

 const RewardsScreen = () => {
 const pointActions = [
 { action: 'Create a Party', points: 50, icon: <Plus className="w-5 h-5" />, color: 'from-[#1E90FF] to-[#1E90FF]' },
 { action: 'Attend a Party', points: 25, icon: <Users className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
 { action: 'Invite a Friend', points: 100, icon: <Send className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
 { action: 'Check In at Venue', points: 75, icon: <MapPin className="w-5 h-5" />, color: 'from-orange-500 to-amber-500' },
 { action: 'Referral Bonus', points: 50, icon: <Gift className="w-5 h-5" />, color: 'from-yellow-500 to-amber-500' },
 ];

 return (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="p-2 bg-[#151A22] rounded-xl hover:bg-[#222A36]">
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
 <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm shadow-orange-500/30">
 <Trophy className="w-10 h-10 text-white" />
 </div>
 <div className="text-5xl font-black text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 {rewardsBalance.totalPoints.toLocaleString()}
 </div>
 <div className="text-yellow-300 text-sm font-bold">AVAILABLE POINTS</div>
 <div className="text-[#A0A4AB] text-xs mt-1">Lifetime earned: {rewardsBalance.lifetimePoints.toLocaleString()} pts</div>
 </div>

 <div className="flex gap-2 bg-[#151A22]/50 rounded-2xl p-1 border border-[#222A36]">
 {[
 { key: 'raffles', label: 'Raffles', icon: <Star className="w-4 h-4" /> },
 { key: 'earn', label: 'Earn', icon: <Zap className="w-4 h-4" /> },
 { key: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
 ].map(tab => (
 <button
 key={tab.key}
 onClick={() => setRewardsTab(tab.key)}
 className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
 rewardsTab === tab.key
 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-sm'
 : 'text-[#A0A4AB] hover:text-white hover:bg-[#151A22]'
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
 <div key={i} className="bg-[#151A22]/80 rounded-2xl border border-[#222A36] p-4 text-center">
 <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-2 text-white shadow-sm`}>
 {item.icon}
 </div>
 <div className="text-white font-bold text-sm">{item.action}</div>
 <div className="text-yellow-400 font-black text-lg mt-1">+{item.points}</div>
 <div className="text-[#A0A4AB]/70 text-xs">points</div>
 </div>
 ))}
 </div>

 <div className="bg-[#151A22]/80 rounded-2xl border border-[#222A36] p-4 mt-4">
 <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
 <Award className="w-4 h-4 text-[#1E90FF]" /> Quick Tips
 </h4>
 <ul className="space-y-2 text-sm text-[#A0A4AB]">
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

 {rewardsTab === 'raffles' && (
 <div className="space-y-4">
 <h3 className="text-lg font-bold text-white flex items-center gap-2">
 <Star className="w-5 h-5 text-yellow-400" /> Grand Prize Raffles
 </h3>
 <p className="text-[#A0A4AB] text-sm">Spend your points to enter raffles for incredible prizes. More entries = better odds!</p>
 {raffles.filter(r => r.status === 'active').length === 0 ? (
 <div className="text-center py-8 text-[#A0A4AB]">
 <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
 <p>No active raffles right now</p>
 <p className="text-xs mt-1">Check back soon for new prizes!</p>
 </div>
 ) : (
 <div className="space-y-4">
 {raffles.filter(r => r.status === 'active').map(raffle => {
 const daysLeft = Math.max(0, Math.ceil((new Date(raffle.end_date) - new Date()) / (1000 * 60 * 60 * 24)));
 const myEntries = parseInt(raffle.my_entries) || 0;
 const totalEntries = parseInt(raffle.total_entries) || 0;
 const maxEntries = raffle.max_entries_per_user;
 const canEnterMore = myEntries < maxEntries;
 const entryCount = raffleEntryCount[raffle.id] || 1;
 const entryCost = raffle.points_per_entry * entryCount;
 const canAfford = rewardsBalance.totalPoints >= entryCost;
 return (
 <div key={raffle.id} className="bg-gradient-to-br from-[#151A22] to-[#1a1f2e] rounded-2xl border border-[#222A36] overflow-hidden">
 {raffle.image_url && (
 <div className="w-full h-40 overflow-hidden">
 <img src={raffle.image_url.startsWith('/objects/') ? `/api/uploads/serve/${raffle.image_url.replace('/objects/', '')}` : raffle.image_url} alt={raffle.title} className="w-full h-full object-cover" />
 </div>
 )}
 <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-orange-500/20 p-4 border-b border-[#222A36]">
 <div className="flex items-start gap-3">
 <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-orange-500/20">
 {raffle.prize_icon}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-white font-black text-lg">{raffle.title}</div>
 <div className="text-yellow-300/80 text-xs font-medium mt-0.5">{raffle.prize_description}</div>
 </div>
 </div>
 </div>
 <div className="p-4 space-y-3">
 <div className="flex items-center justify-between text-sm">
 <div className="flex items-center gap-4">
 <span className="text-[#A0A4AB]"><Clock className="w-3.5 h-3.5 inline mr-1" />{daysLeft} days left</span>
 <span className="text-[#A0A4AB]"><Users className="w-3.5 h-3.5 inline mr-1" />{totalEntries} entries</span>
 </div>
 <span className="text-yellow-400 font-bold">{raffle.points_per_entry} pts/entry</span>
 </div>
 {myEntries > 0 && (
 <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 flex items-center justify-between">
 <span className="text-green-400 text-sm font-medium flex items-center gap-1.5">
 <CheckCircle className="w-4 h-4" /> You have {myEntries} {myEntries === 1 ? 'entry' : 'entries'}
 </span>
 <span className="text-[#A0A4AB] text-xs">{myEntries}/{maxEntries} max</span>
 </div>
 )}
 {canEnterMore && (
 <div className="flex items-center gap-2">
 <div className="flex items-center bg-[#0F1115] rounded-xl border border-[#222A36] overflow-hidden">
 <button
 onClick={() => setRaffleEntryCount(prev => ({ ...prev, [raffle.id]: Math.max(1, (prev[raffle.id] || 1) - 1) }))}
 className="px-3 py-2 text-white hover:bg-[#222A36] transition-colors"
 >-</button>
 <span className="px-3 py-2 text-white font-bold min-w-[40px] text-center">{entryCount}</span>
 <button
 onClick={() => setRaffleEntryCount(prev => ({ ...prev, [raffle.id]: Math.min(maxEntries - myEntries, (prev[raffle.id] || 1) + 1) }))}
 className="px-3 py-2 text-white hover:bg-[#222A36] transition-colors"
 >+</button>
 </div>
 <button
 onClick={() => handleEnterRaffle(raffle.id)}
 disabled={!canAfford || enteringRaffle === raffle.id}
 className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
 canAfford
 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:shadow-lg hover:shadow-yellow-500/20'
 : 'bg-gray-700 text-[#A0A4AB]/70 cursor-not-allowed'
 }`}
 >
 {enteringRaffle === raffle.id ? (
 <Loader2 className="w-4 h-4 animate-spin inline" />
 ) : canAfford ? (
 `Enter (${entryCost} pts)`
 ) : (
 `Need ${(entryCost - rewardsBalance.totalPoints).toLocaleString()} more pts`
 )}
 </button>
 </div>
 )}
 {!canEnterMore && myEntries > 0 && (
 <div className="text-center text-[#A0A4AB] text-sm py-1">Maximum entries reached</div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}

 {raffles.filter(r => r.status === 'ended').length > 0 && (
 <div className="mt-6">
 <h4 className="text-sm font-bold text-[#A0A4AB] mb-3">PAST RAFFLES</h4>
 <div className="space-y-2">
 {raffles.filter(r => r.status === 'ended').map(raffle => (
 <div key={raffle.id} className="bg-[#151A22]/60 rounded-xl border border-white/5 p-3 flex items-center gap-3">
 <span className="text-xl">{raffle.prize_icon}</span>
 <div className="flex-1 min-w-0">
 <div className="text-white text-sm font-medium">{raffle.title}</div>
 <div className="text-[#A0A4AB]/70 text-xs">
 {raffle.winner_name ? `Winner: ${raffle.winner_name}` : 'Drawing pending'}
 </div>
 </div>
 {parseInt(raffle.my_entries) > 0 && (
 <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-yellow-500/20 text-yellow-400">
 {raffle.my_entries} entries
 </span>
 )}
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
 <div className="text-center py-8 text-[#A0A4AB]">
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
 welcome_bonus: <Gift className="w-4 h-4" />,
 raffle_entry: <Star className="w-4 h-4" />,
 };
 return (
 <div key={entry.id} className="bg-[#151A22]/60 rounded-xl border border-white/5 p-3 flex items-center gap-3">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
 isEarn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
 }`}>
 {actionIcons[entry.action] || <Zap className="w-4 h-4" />}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-white text-sm font-medium">{entry.description || entry.action.replace(/_/g, ' ')}</div>
 <div className="text-[#A0A4AB]/70 text-xs">{new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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

 <div className="bg-[#151A22]/80 rounded-2xl border border-[#222A36] p-4">
 <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
 <Info className="w-4 h-4 text-[#1E90FF]" /> How the Points System Works
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
 <div className="flex items-center gap-2 text-[#A0A4AB]">
 <div className="w-2 h-2 rounded-full bg-[#1E90FF] flex-shrink-0" />
 Earn points by creating parties, attending events, inviting friends, and checking in at venues
 </div>
 <div className="flex items-center gap-2 text-[#A0A4AB]">
 <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
 Spend points to enter raffles for grand prizes like game tickets and signed memorabilia
 </div>
 <div className="flex items-center gap-2 text-[#A0A4AB]">
 <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
 More entries in a raffle = better odds of winning
 </div>
 <div className="flex items-center gap-2 text-[#A0A4AB]">
 <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
 New users get 50 bonus points when applying a referral code
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 };

 const InvitationsScreen = () => {
 const unreadNotifications = notifications.filter(n => !n.isRead);
 return (
 <div className="min-h-screen pt-[60px] pb-[72px] bg-[#0F1115]">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="p-2 bg-[#151A22] rounded-xl hover:bg-[#222A36]">
 <ArrowLeft className="w-5 h-5 text-white" />
 </button>
 <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Bell className="inline w-6 h-6 mr-2 text-[#1E90FF]" />
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
 className="text-xs text-[#1E90FF] hover:text-[#1E90FF]/80 transition-colors"
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
 <p className="text-[#A0A4AB]/70 text-xs mt-1">
 {new Date(notif.createdAt).toLocaleDateString()}
 </p>
 </div>
 <button
 onClick={() => markNotificationRead(notif.id)}
 className="text-xs text-[#A0A4AB] hover:text-white transition-colors"
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
 <p className="text-[#A0A4AB]">No invitations yet.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {invitations.map(inv => (
 <div key={inv.id} className={`border rounded-2xl p-5 ${
 inv.status === 'pending'
 ? 'bg-gradient-to-br from-cyan-500/10 to-[#1E90FF]/10 border-[#1E90FF]/30'
 : inv.status === 'accepted'
 ? 'bg-green-500/5 border-green-500/20'
 : 'bg-[#151A22] border-[#222A36] opacity-60'
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
 <p className="text-[#A0A4AB] text-sm mt-1">
 <span className="text-[#1E90FF]">{inv.fromName}</span> invited you
 </p>
 {inv.venueName && (
 <p className="text-[#A0A4AB] text-sm mt-1">
 <MapPin className="inline w-3 h-3 mr-1" />{inv.venueName}{inv.city ? `, ${inv.city}` : ''}
 </p>
 )}
 {inv.gameTime && (
 <p className="text-[#A0A4AB] text-sm mt-1">
 <Calendar className="inline w-3 h-3 mr-1" />{formatDateTime(inv.gameTime)}
 </p>
 )}
 </div>
 </div>

 {inv.status === 'pending' && (
 <div className="flex gap-3 mt-4">
 <button
 onClick={() => handleAcceptInvitation(inv.id)}
 className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
 >
 <CheckCircle className="w-4 h-4" /> Accept
 </button>
 <button
 onClick={() => handleDeclineInvitation(inv.id)}
 className="flex-1 py-3 bg-[#151A22] text-[#A0A4AB] font-bold rounded-xl hover:bg-[#222A36] transition-all flex items-center justify-center gap-2"
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
 <p className="text-[#A0A4AB]">No notifications yet. When someone invites you or a fellow fan creates a party, it will show up here.</p>
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
 <div className="min-h-screen pt-[60px] bg-[#0F1115] flex items-center justify-center p-4">
 <div className="max-w-md w-full">
 {checkinStatus === 'loading' && (
 <div className="bg-[#151A22] rounded-3xl border border-[#222A36] p-8 text-center">
 <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
 <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 CHECKING IN...
 </h2>
 <p className="text-[#A0A4AB]">Verifying your QR code</p>
 </div>
 )}

 {checkinStatus === 'success' && (
 <div className="bg-[#151A22] rounded-3xl border border-green-500/30 p-8 text-center space-y-4">
 <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
 <CheckCircle className="w-12 h-12 text-green-400" />
 </div>
 <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 {checkinResult?.alreadyCheckedIn ? 'ALREADY VERIFIED!' : 'CHECKED IN!'}
 </h2>
 <p className="text-[#A0A4AB] text-lg">{checkinResult?.message}</p>
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
 className="w-full py-3 bg-[#1E90FF] text-white font-bold rounded-xl transition-all"
 >
 Continue to Huddle Up
 </button>
 </div>
 )}

 {checkinStatus === 'needsLogin' && (
 <div className="bg-[#151A22] rounded-3xl border border-amber-500/30 p-8 text-center space-y-4">
 <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
 <MapPin className="w-12 h-12 text-amber-400" />
 </div>
 <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 CHECK IN AT {venueInfo?.venueName?.toUpperCase()}
 </h2>
 <p className="text-[#A0A4AB]">Log in or sign up to check in and earn points!</p>
 <button
 onClick={handleLoginAndCheckin}
 className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl transition-all"
 >
 Log In to Check In
 </button>
 <button
 onClick={() => { setQrCheckinToken(null); setCurrentScreen('signup'); }}
 className="w-full py-3 bg-[#151A22] text-white font-bold rounded-xl hover:bg-[#222A36] transition-all border border-[#222A36]"
 >
 Sign Up for Huddle Up
 </button>
 </div>
 )}

 {(checkinStatus === 'invalid' || checkinStatus === 'error') && (
 <div className="bg-[#151A22] rounded-3xl border border-red-500/30 p-8 text-center space-y-4">
 <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
 <X className="w-12 h-12 text-red-400" />
 </div>
 <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 CHECK-IN FAILED
 </h2>
 <p className="text-[#A0A4AB]">{error}</p>
 {user && (
 <button
 onClick={retryCheckin}
 className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl transition-all"
 >
 Try Again
 </button>
 )}
 <button
 onClick={() => { setQrCheckinToken(null); setCurrentScreen(user ? 'games' : 'welcome'); }}
 className="w-full py-3 bg-[#151A22] text-white font-bold rounded-xl hover:bg-[#222A36] transition-all border border-[#222A36]"
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

 const [teamChatRooms, setTeamChatRooms] = useState([]);
 const [teamChatSelectedRoom, setTeamChatSelectedRoom] = useState(null);
 const [teamChatMessages, setTeamChatMessages] = useState([]);
 const [teamChatInput, setTeamChatInput] = useState('');
 const [teamChatLoading, setTeamChatLoading] = useState(false);
 const [teamChatShowCreate, setTeamChatShowCreate] = useState(false);
 const [teamChatNewSport, setTeamChatNewSport] = useState('NFL');
 const [teamChatNewTeam, setTeamChatNewTeam] = useState('');
 const [trendingData, setTrendingData] = useState(null);
 const [trendingLoading, setTrendingLoading] = useState(false);
 const [trendingError, setTrendingError] = useState(false);
 const [teamChatError, setTeamChatError] = useState(false);
 const [viewingUserId, setViewingUserId] = useState(null);
 const [viewingUserProfile, setViewingUserProfile] = useState(null);
 const [viewingUserActivity, setViewingUserActivity] = useState([]);
 const [alertPrefs, setAlertPrefs] = useState({ teamAlerts: true, rivalryAlerts: true, suggestedParties: true, gameReminders: true });
 const [teamAlertsList, setTeamAlertsList] = useState([]);
 const [rivalryAlertsList, setRivalryAlertsList] = useState([]);
 const [myTicketsList, setMyTicketsList] = useState([]);

 const loadTeamChatRooms = async () => {
 try {
 setTeamChatLoading(true);
 const data = await api.teamChats.getRooms();
 setTeamChatRooms(data.rooms || []);
 } catch (e) { console.error('Load team chat rooms error:', e); setTeamChatError(true); }
 finally { setTeamChatLoading(false); }
 };

 const loadTeamChatMessages = async (roomId) => {
 try {
 const data = await api.teamChats.getMessages(roomId);
 setTeamChatMessages(data.messages || []);
 } catch (e) { console.error('Load team chat messages error:', e); }
 };

 const createTeamChatRoom = async () => {
 if (!teamChatNewTeam.trim()) return;
 try {
 await api.teamChats.createRoom({ sport: teamChatNewSport, teamName: teamChatNewTeam.trim() });
 setTeamChatNewTeam('');
 setTeamChatShowCreate(false);
 setTeamChatError(false);
 loadTeamChatRooms();
 } catch (e) { console.error('Create room error:', e); }
 };

 const sendTeamChatMessage = async () => {
 if (!teamChatInput.trim() || !teamChatSelectedRoom) return;
 try {
 await api.teamChats.sendMessage(teamChatSelectedRoom.id, teamChatInput.trim());
 setTeamChatInput('');
 loadTeamChatMessages(teamChatSelectedRoom.id);
 } catch (e) { console.error('Send team chat message error:', e); }
 };

 const loadTrendingData = async () => {
 try {
 setTrendingLoading(true);
 const data = await api.trending.feed();
 setTrendingData(data);
 } catch (e) { console.error('Load trending error:', e); setTrendingError(true); }
 finally { setTrendingLoading(false); }
 };

 const loadUserProfile = async (userId) => {
 try {
 const [profileData, activityData] = await Promise.all([
 api.profile.getUser(userId),
 api.profile.getActivity(userId)
 ]);
 setViewingUserProfile(profileData);
 setViewingUserActivity(activityData.activity || []);
 } catch (e) { console.error('Load user profile error:', e); }
 };

 const loadAlerts = async () => {
 try {
 const [prefs, teamA, rivalryA] = await Promise.all([
 api.alerts.getPreferences(),
 api.alerts.teamAlerts().catch(() => ({ alerts: [] })),
 api.alerts.rivalryAlerts().catch(() => ({ alerts: [] }))
 ]);
 setAlertPrefs(prefs);
 setTeamAlertsList(teamA.alerts || []);
 setRivalryAlertsList(rivalryA.alerts || []);
 } catch (e) { console.error('Load alerts error:', e); }
 };

 const loadMyTickets = async () => {
 try {
 const data = await api.tickets.myTickets();
 setMyTicketsList(data.tickets || []);
 } catch (e) { console.error('Load my tickets error:', e); }
 };

 const renderTeamChatsScreen = () => {
 if (!teamChatRooms.length && !teamChatLoading && !teamChatSelectedRoom && !teamChatError) {
 loadTeamChatRooms();
 }

 if (teamChatSelectedRoom) {
 return (
 <div className="min-h-screen bg-[#0F1115] pt-[60px]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => { setTeamChatSelectedRoom(null); setTeamChatMessages([]); }} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 {teamChatSelectedRoom.logoUrl && <img src={teamChatSelectedRoom.logoUrl} className="w-8 h-8 rounded-full" alt="" />}
 <div>
 <h3 className="text-white font-bold">{teamChatSelectedRoom.teamName}</h3>
 <span className="text-xs text-[#A0A4AB]">{teamChatSelectedRoom.sport}</span>
 </div>
 </div>
 </div>
 <div className="p-4 pb-24 space-y-3 max-w-2xl mx-auto">
 {teamChatMessages.length === 0 && (
 <div className="text-center py-12">
 <MessageCircle className="w-12 h-12 mx-auto mb-3 text-[#A0A4AB]/30" />
 <p className="text-white font-bold text-sm mb-1">Start the conversation!</p>
 <p className="text-[#A0A4AB] text-xs leading-relaxed max-w-xs mx-auto">Say hi, share your predictions, or talk game day strategy. Every great fan community starts with someone breaking the ice.</p>
 <p className="text-[#A0A4AB]/50 text-xs mt-2">💡 Tip: Ask "Anyone tailgating before?"</p>
 </div>
 )}
 {teamChatMessages.map(msg => (
 <div key={msg.id} className={`flex gap-3 ${msg.userId === user?.id ? 'flex-row-reverse' : ''}`}>
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
 {msg.userName?.[0] || '?'}
 </div>
 <div className={`max-w-[70%] ${msg.userId === user?.id ? 'bg-teal-600/30 border-teal-500/30' : 'bg-[#151A22] border-[#222A36]'} border rounded-2xl px-4 py-2`}>
 <p className="text-xs text-teal-300 font-medium mb-1">{msg.userName} {msg.isFounder && <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md font-bold" style={{ fontSize: '8px', backgroundColor: '#F5B400', color: '#0F1115' }}>⭐</span>}</p>
 <p className="text-white text-sm">{msg.message}</p>
 <p className="text-xs text-[#A0A4AB]/70 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
 </div>
 </div>
 ))}
 </div>
 <div className="fixed bottom-0 left-0 right-0 bg-[#0F1115]/95 border-t border-[#222A36] p-4">
 <div className="flex gap-2 max-w-2xl mx-auto">
 <input value={teamChatInput} onChange={e => setTeamChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendTeamChatMessage()} placeholder="Type a message..." className="flex-1 px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
 <button onClick={sendTeamChatMessage} className="px-4 py-3 bg-teal-500 hover:bg-teal-600 rounded-xl text-white"><Send className="w-5 h-5" /></button>
 </div>
 </div>
 </div>
 );
 }

 const groupedRooms = teamChatRooms.reduce((acc, room) => {
 const sport = room.sport || 'Other';
 if (!acc[sport]) acc[sport] = [];
 acc[sport].push(room);
 return acc;
 }, {});

 return (
 <div className="min-h-screen bg-[#0F1115] pt-[60px]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <MessageCircle className="w-6 h-6 text-teal-400" />
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>TEAM CHAT ROOMS</h2>
 <button onClick={() => setTeamChatShowCreate(!teamChatShowCreate)} className="ml-auto px-3 py-1.5 bg-teal-500 hover:bg-teal-600 rounded-lg text-white text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> New</button>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-6">
 {teamChatShowCreate && (
 <div className="bg-[#151A22] border border-teal-500/30 rounded-xl p-4 space-y-3">
 <h3 className="text-white font-bold text-sm">Create a Team Chat Room</h3>
 <select value={teamChatNewSport} onChange={e => setTeamChatNewSport(e.target.value)} className="w-full px-3 py-2 bg-[#151A22] border border-[#222A36] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
 {['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'NWSL', 'Champions League', 'Premier League', 'La Liga', 'Serie A', 'College Football', 'College Basketball', 'WNBA', 'UFC', 'Boxing'].map(s => (
 <option key={s} value={s} className="bg-[#151A22]">{s}</option>
 ))}
 </select>
 <input value={teamChatNewTeam} onChange={e => setTeamChatNewTeam(e.target.value)} onKeyDown={e => e.key === 'Enter' && createTeamChatRoom()} placeholder="Team name (e.g. Dallas Cowboys)" className="w-full px-3 py-2 bg-[#151A22] border border-[#222A36] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
 <div className="flex gap-2">
 <button onClick={createTeamChatRoom} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white text-sm font-medium">Create Room</button>
 <button onClick={() => setTeamChatShowCreate(false)} className="px-4 py-2 bg-[#151A22] hover:bg-[#222A36] rounded-lg text-[#A0A4AB] text-sm">Cancel</button>
 </div>
 </div>
 )}
 {teamChatLoading && (
 <div className="text-center py-12"><Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" /></div>
 )}
 {!teamChatLoading && !teamChatShowCreate && Object.keys(groupedRooms).length === 0 && (
 <div className="text-center py-12 text-[#A0A4AB]">
 <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
 <p className="text-lg font-bold mb-2">No Chat Rooms Yet</p>
 <p className="text-sm mb-4">Be the first to start a conversation about your favorite team!</p>
 <button onClick={() => setTeamChatShowCreate(true)} className="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white font-medium">Create First Room</button>
 </div>
 )}
 {Object.entries(groupedRooms).map(([sport, rooms]) => (
 <div key={sport}>
 <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3">{sport}</h3>
 <div className="space-y-2">
 {rooms.map(room => (
 <button key={room.id} onClick={() => { setTeamChatSelectedRoom(room); loadTeamChatMessages(room.id); }} className="w-full flex items-center gap-3 p-3 bg-[#151A22] hover:bg-[#151A22] rounded-xl border border-[#222A36] transition-colors text-left">
 {room.logoUrl ? <img src={room.logoUrl} className="w-10 h-10 rounded-full" alt="" /> : <div className="w-10 h-10 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300 text-sm font-bold">{room.teamAbbrev || room.teamName?.[0]}</div>}
 <div className="flex-1 min-w-0">
 <p className="text-white font-medium truncate">{room.teamName}</p>
 <p className="text-xs text-[#A0A4AB]">{room.messageCount || 0} messages</p>
 </div>
 <ChevronRight className="w-4 h-4 text-[#A0A4AB]/70" />
 </button>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 };

 const renderTrendingScreen = () => {
 if (!trendingData && !trendingLoading && !trendingError) {
 loadTrendingData();
 }

 const featuredSportIcons = { 'NFL': '\u{1F3C8}', 'NBA': '\u{1F3C0}', 'NHL': '\u{1F3D2}', 'MLB': '\u26BE', 'MLS': '\u26BD', 'College Football': '\u{1F3C8}', 'College Basketball': '\u{1F3C0}', 'Premier League': '\u26BD', 'La Liga': '\u26BD', 'Champions League': '\u26BD', 'UFC/MMA': '\u{1F94A}', 'Boxing': '\u{1F94A}', 'NASCAR': '\u{1F3C1}', 'F1': '\u{1F3CE}', 'Tennis': '\u{1F3BE}', 'Golf': '\u26F3' };

 return (
 <div className="min-h-screen bg-[#0F1115] pt-[60px]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <Crown className="w-6 h-6 text-amber-400" />
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>FEATURED</h2>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-4">
 <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
 <p className="text-amber-400 font-bold text-sm flex items-center gap-2"><Crown className="w-4 h-4" /> Pro & Featured Spotlight</p>
 <p className="text-white/60 text-xs mt-1">Parties from Pro members and Featured venues get priority placement here.</p>
 </div>
 <div className="flex gap-2">
 <button onClick={() => setFeaturedTab('parties')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${featuredTab === 'parties' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-[#151A22] text-white/50 border border-[#222A36] hover:border-white/20'}`}>
 <Crown className="w-4 h-4" /> Parties {trendingData?.featuredParties?.length > 0 && <span className="bg-amber-500/30 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">{trendingData.featuredParties.length}</span>}
 </button>
 <button onClick={() => setFeaturedTab('venues')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${featuredTab === 'venues' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-[#151A22] text-white/50 border border-[#222A36] hover:border-white/20'}`}>
 <Building2 className="w-4 h-4" /> Venues {trendingData?.featuredVenues?.length > 0 && <span className="bg-orange-500/30 text-orange-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">{trendingData.featuredVenues.length}</span>}
 </button>
 </div>
 {trendingLoading && (
 <div className="text-center py-12"><Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" /></div>
 )}
 {trendingData && (
 <>
 {featuredTab === 'parties' && (
 <div>
 <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
 <Crown className="w-4 h-4" /> Featured Parties
 </h3>
 {trendingData.featuredParties?.length > 0 ? (
 <div className="space-y-3">
 {trendingData.featuredParties.map(party => {
 const gt = new Date(party.gameTime);
 const validDate = !isNaN(gt.getTime());
 return (
 <div key={party.id} onClick={() => { let g = safeGames.find(g => g.id === party.gameId); if (!g) { g = { id: party.gameId || party.id, sport: party.sport, homeTeam: party.homeTeam || '?', awayTeam: party.awayTeam || '?', startTime: party.gameTime, venue: party.venueName || '' }; } setSelectedGame(g); setCurrentScreen('gameDetail'); }} className="p-4 bg-[#151A22] rounded-xl border border-amber-500/30 hover:border-amber-500/50 transition-colors cursor-pointer">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-lg">{featuredSportIcons[party.sport] || '\u{1F3DF}'}</span>
 <p className="text-white font-bold">{party.homeTeam || party.sport} {party.awayTeam ? `vs ${party.awayTeam}` : ''}</p>
 </div>
 {party.isProHost && (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full mb-2">
 <Crown className="w-2.5 h-2.5" /> PRO HOST
 </span>
 )}
 <p className="text-sm text-white font-bold flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> {party.venueName}</p>
 <p className="text-sm text-[#A0A4AB] flex items-center gap-1"><Calendar className="w-3 h-3" /> {validDate ? gt.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : (party.gameTime || 'TBD')}</p>
 {party.city && <p className="text-sm text-[#A0A4AB] flex items-center gap-1"><Navigation className="w-3 h-3" /> {party.city}</p>}
 </div>
 <div className="flex flex-col items-end gap-2">
 <div className="flex items-center gap-1 text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full text-sm">
 <Users className="w-3 h-3" /> {party.attendeeCount || 0}
 </div>
 </div>
 </div>
 {party.hostName && (
 <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#222A36]">
 {party.hostPicture ? <img src={party.hostPicture} className="w-5 h-5 rounded-full" alt="" /> : <User className="w-4 h-4 text-[#A0A4AB]" />}
 <span className="text-xs text-[#A0A4AB]">Hosted by <span className="text-white font-medium">{party.hostName}</span></span>
 {party.isFounder && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">FOUNDER</span>}
 </div>
 )}
 <div className="flex items-center gap-3 mt-2">
 <button onClick={(e) => { e.stopPropagation(); openShareMenu(party); }} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
 <Share2 className="w-3 h-3" /> Share
 </button>
 <div className="ml-auto">
 {userParties.includes(party.id) || justJoinedPartyId === party.id ? (
 <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold"><CheckCircle className="w-3.5 h-3.5" /> Joined</span>
 ) : (
 <button onClick={(e) => { e.stopPropagation(); handleJoinParty(party.id); }} disabled={joiningPartyId === party.id} className="px-4 py-1.5 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white font-bold text-sm rounded-lg shadow-lg shadow-[#1E90FF]/20 hover:shadow-[#1E90FF]/40 transition-all active:scale-[0.97]">
 {joiningPartyId === party.id ? 'Joining...' : 'Join Party'}
 </button>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="text-center py-12 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
 <div className="text-5xl mb-3">🎉</div>
 <p className="text-lg font-bold text-white mb-2">No Featured Parties Yet</p>
 <p className="text-sm text-[#A0A4AB] mb-4">Pro members and Featured venue parties will appear here.</p>
 <button onClick={() => setCurrentScreen('browseParties')} className="px-6 py-2.5 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity">Browse All Parties</button>
 </div>
 )}
 </div>
 )}
 {featuredTab === 'venues' && (
 <div>
 <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
 <Building2 className="w-4 h-4" /> Featured Venues
 </h3>
 {trendingData.featuredVenues?.length > 0 ? (
 <div className="space-y-2">
 {trendingData.featuredVenues.map(venue => (
 <div key={venue.id} onClick={() => { setSelectedVenueId(venue.id); setCurrentScreen('venueDetail'); }} className={`p-4 bg-[#151A22] rounded-xl border ${venue.featuredTier === 'featured' ? 'border-amber-500/40' : 'border-[#222A36]'} hover:border-amber-500/50 transition-colors cursor-pointer`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 {venue.logo ? <img src={venue.logo} className="w-10 h-10 rounded-lg object-cover" alt="" /> : <Building2 className="w-10 h-10 text-[#A0A4AB] p-2 bg-[#222A36] rounded-lg" />}
 <div>
 <div className="flex items-center gap-2">
 <p className="text-white font-bold">{venue.name}</p>
 {venue.verified && <CheckCircle className="w-3.5 h-3.5 text-[#1E90FF]" />}
 {venue.featuredTier === 'featured' && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-400" /> FEATURED</span>}
 </div>
 <p className="text-xs text-[#A0A4AB]">{venue.city}</p>
 </div>
 </div>
 <span className="text-orange-400 text-sm font-bold">{venue.partyCount} {venue.partyCount === 1 ? 'party' : 'parties'}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
 <div className="text-5xl mb-3">🏟️</div>
 <p className="text-lg font-bold text-white mb-2">No Featured Venues Yet</p>
 <p className="text-sm text-[#A0A4AB] mb-4">Featured venues with enhanced visibility will appear here.</p>
 <button onClick={() => setCurrentScreen('findVenues')} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity">Find Venues Near Me</button>
 </div>
 )}
 </div>
 )}
 </>
 )}
 </div>
 </div>
 );
 };


 const renderUserProfileScreen = () => {
 const profileUserId = viewingUserId;
 if (profileUserId && !viewingUserProfile) {
 loadUserProfile(profileUserId);
 }
 if (!viewingUserProfile) {
 return (
 <div className="min-h-screen bg-[#0F1115] pt-[60px]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => { setCurrentScreen('games'); setViewingUserId(null); setViewingUserProfile(null); }} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>FAN PROFILE</h2>
 </div>
 </div>
 <div className="text-center py-12"><Loader2 className="w-8 h-8 text-[#1E90FF] animate-spin mx-auto" /></div>
 </div>
 );
 }
 const p = viewingUserProfile;
 return (
 <div className="min-h-screen bg-[#0F1115] pt-[60px]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => { setCurrentScreen('games'); setViewingUserId(null); setViewingUserProfile(null); }} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>FAN PROFILE</h2>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-6">
 <div className="text-center">
 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E90FF] to-[#1E90FF] mx-auto flex items-center justify-center text-white text-3xl font-bold mb-3">
 {p.profilePicture ? <img src={p.profilePicture} className="w-20 h-20 rounded-full object-cover" alt="" /> : (p.name?.[0] || '?')}
 </div>
 <h3 className="text-2xl font-black text-white">{p.name}</h3>
 {p.isFounder && (
 <span className="inline-flex items-center gap-1 px-2 py-1 mt-1 rounded-xl font-bold border" style={{ fontSize: '11px', backgroundColor: '#F5B400', color: '#0F1115', borderColor: '#F5B400' }} title="One of the first 100 members to join Huddle Up">
 ⭐ Founder{p.founderNumber ? ` #${p.founderNumber}` : ''}
 </span>
 )}
 {p.bio && <p className="text-[#A0A4AB] text-sm mt-1">{p.bio}</p>}
 <p className="text-xs text-[#A0A4AB]/70 mt-1">Joined {new Date(p.createdAt || p.created_at).toLocaleDateString()}</p>
 </div>
 <div className="bg-gradient-to-r from-[#1E90FF]/20 to-[#1E90FF]/20 rounded-xl p-4 border border-[#1E90FF]/30 text-center">
 <p className="text-4xl font-black text-[#1E90FF]">{p.fanScore || 0}</p>
 <p className="text-sm text-[#A0A4AB]">Fan Score</p>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <div className="bg-[#151A22] rounded-xl p-3 text-center border border-[#222A36]">
 <p className="text-xl font-bold text-white">{p.partiesHosted || 0}</p>
 <p className="text-xs text-[#A0A4AB]">Hosted</p>
 </div>
 <div className="bg-[#151A22] rounded-xl p-3 text-center border border-[#222A36]">
 <p className="text-xl font-bold text-white">{p.partiesAttended || 0}</p>
 <p className="text-xs text-[#A0A4AB]">Attended</p>
 </div>
 <div className="bg-[#151A22] rounded-xl p-3 text-center border border-[#222A36]">
 <p className="text-xl font-bold text-white">{p.reviewsGiven || 0}</p>
 <p className="text-xs text-[#A0A4AB]">Reviews</p>
 </div>
 <div className="bg-[#151A22] rounded-xl p-3 text-center border border-[#222A36]">
 <p className="text-xl font-bold text-white">{p.friendsCount || 0}</p>
 <p className="text-xs text-[#A0A4AB]">Friends</p>
 </div>
 </div>
 {p.badges?.length > 0 && (
 <div>
 <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Badges</h4>
 <div className="flex flex-wrap gap-2">
 {p.badges.filter(b => b.earned).map(badge => (
 <span key={badge.name} className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-sm text-yellow-300 flex items-center gap-1">
 <span>{badge.icon}</span> {badge.name}
 </span>
 ))}
 </div>
 </div>
 )}
 {viewingUserActivity.length > 0 && (
 <div>
 <h4 className="text-sm font-bold text-[#A0A4AB] uppercase tracking-wider mb-3">Recent Activity</h4>
 <div className="space-y-2">
 {viewingUserActivity.slice(0, 10).map((item, i) => (
 <div key={i} className="p-3 bg-[#151A22] rounded-xl border border-[#222A36]">
 <p className="text-white text-sm">{item.description}</p>
 <p className="text-xs text-[#A0A4AB]/70 mt-1">{new Date(item.date).toLocaleDateString()}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 );
 };

 const renderAlertsScreen = () => {
 if (!teamAlertsList.length && !rivalryAlertsList.length) {
 loadAlerts();
 }

 return (
 <div className="min-h-screen bg-[#0F1115] pt-[60px]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <Bell className="w-6 h-6 text-amber-400" />
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>GAME ALERTS</h2>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-6">
 <div className="bg-[#151A22] rounded-xl p-4 border border-[#222A36] space-y-3">
 <h3 className="text-white font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-[#A0A4AB]" /> Alert Preferences</h3>
 {[
 { key: 'teamAlerts', label: 'Team Playing Alerts', desc: 'Get notified when your favorite teams play' },
 { key: 'rivalryAlerts', label: 'Rivalry Game Alerts', desc: 'Big rivalry matchups happening soon' },
 { key: 'suggestedParties', label: 'Suggested Parties', desc: 'Parties you might be interested in' },
 { key: 'gameReminders', label: 'Game Reminders', desc: 'Reminders before games start' },
 ].map(pref => (
 <div key={pref.key} className="flex items-center justify-between py-2">
 <div>
 <p className="text-white text-sm font-medium">{pref.label}</p>
 <p className="text-xs text-[#A0A4AB]">{pref.desc}</p>
 </div>
 <button onClick={async () => {
 const updated = { ...alertPrefs, [pref.key]: !alertPrefs[pref.key] };
 setAlertPrefs(updated);
 try { await api.alerts.updatePreferences(updated); } catch (e) { console.error(e); }
 }} className={`w-10 h-6 rounded-full transition-colors ${alertPrefs[pref.key] ? 'bg-amber-500' : 'bg-gray-600'} relative`}>
 <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${alertPrefs[pref.key] ? 'translate-x-5' : 'translate-x-1'}`} />
 </button>
 </div>
 ))}
 </div>
 {teamAlertsList.length > 0 && (
 <div>
 <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
 <Zap className="w-4 h-4" /> Your Teams Playing Soon
 </h3>
 <div className="space-y-2">
 {teamAlertsList.map((alert, i) => (
 <div key={i} className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
 <p className="text-white font-medium">{alert.team} vs {alert.opponent}</p>
 <p className="text-xs text-[#A0A4AB]">{alert.sport} - {new Date(alert.gameDate || alert.game_date).toLocaleDateString()}</p>
 {alert.partiesNearby > 0 && <p className="text-xs text-green-400 mt-1">{alert.partiesNearby} parties nearby!</p>}
 </div>
 ))}
 </div>
 </div>
 )}
 {rivalryAlertsList.length > 0 && (
 <div>
 <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
 <Crown className="w-4 h-4" /> Rivalry Games
 </h3>
 <div className="space-y-2">
 {rivalryAlertsList.map((alert, i) => (
 <div key={i} className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
 <p className="text-white font-medium">{alert.teamA || alert.team_a} vs {alert.teamB || alert.team_b}</p>
 <p className="text-xs text-[#A0A4AB]">{alert.sport} - Intensity: {'🔥'.repeat(alert.intensity || 1)}</p>
 {alert.partiesCount > 0 && <p className="text-xs text-red-400 mt-1">{alert.partiesCount} watch parties!</p>}
 </div>
 ))}
 </div>
 </div>
 )}
 {!teamAlertsList.length && !rivalryAlertsList.length && (
 <div className="text-center py-8 text-[#A0A4AB]">
 <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
 <p className="font-bold">No Alerts Right Now</p>
 <p className="text-sm mt-1">Add favorite teams to get notified when they play!</p>
 </div>
 )}
 </div>
 </div>
 );
 };

 const renderMyTicketsScreen = () => {
 if (!myTicketsList.length) {
 loadMyTickets();
 }

 return (
 <div className="min-h-screen bg-[#0F1115] pt-[60px]">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36] px-4 py-3">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="text-[#A0A4AB] hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
 <Award className="w-6 h-6 text-purple-400" />
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>MY TICKETS</h2>
 </div>
 </div>
 <div className="p-4 max-w-2xl mx-auto space-y-4">
 {myTicketsList.length === 0 && (
 <div className="text-center py-12 text-[#A0A4AB]">
 <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
 <p className="text-lg font-bold mb-2">No Tickets Yet</p>
 <p className="text-sm">Purchase tickets to watch parties to see them here.</p>
 </div>
 )}
 {myTicketsList.map(ticket => (
 <div key={ticket.id} className="p-4 bg-[#151A22] rounded-xl border border-[#222A36]">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-white font-bold">{ticket.partyName || ticket.party_name || 'Watch Party'}</p>
 <p className="text-sm text-[#A0A4AB]">{ticket.venueName || ticket.venue_name}</p>
 <p className="text-sm text-[#A0A4AB]">{new Date(ticket.gameDate || ticket.game_date || ticket.purchasedAt || ticket.purchased_at).toLocaleDateString()}</p>
 </div>
 <div className="text-right">
 <p className="text-lg font-bold text-purple-400">${((ticket.amountCents || ticket.amount_cents || 0) / 100).toFixed(2)}</p>
 <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-[#A0A4AB]'}`}>{ticket.status}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 };

 const renderFantasyScreen = () => {
 const platformColors = { espn: 'bg-red-500', yahoo: 'bg-purple-500', sleeper: 'bg-green-500', other: 'bg-gray-500' };
 const platformLabels = { espn: 'ESPN', yahoo: 'Yahoo', sleeper: 'Sleeper', other: 'Other' };

 const myTeam = fantasySelectedLeague?.teams?.find(t => t.user_id === user?.id);

 if (fantasySelectedLeague) {
 return (
 <div className="min-h-screen pt-[60px] bg-[#0F1115] relative z-0">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <div className="flex items-center gap-3">
 <button onClick={() => setFantasySelectedLeague(null)} className="p-2 bg-[#151A22] rounded-xl hover:bg-[#222A36] active:bg-[#222A36] cursor-pointer" type="button">
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
 <img src="/huddle-up-shield.png" alt="Huddle Up" className="w-10 h-10 object-contain" />
 </div>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
 <div className="bg-[#151A22] border border-[#222A36] rounded-2xl p-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Shield className="w-4 h-4 text-[#1E90FF]" />
 <span className="text-sm text-slate-300">Invite Code:</span>
 <span className="font-mono text-[#1E90FF] font-bold">{fantasySelectedLeague.invite_code}</span>
 </div>
 <button
 onClick={() => { navigator.clipboard.writeText(fantasySelectedLeague.invite_code); alert('Invite code copied!'); }}
 className="p-2 bg-[#151A22] rounded-lg hover:bg-[#222A36] cursor-pointer"
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

 <div className="bg-[#151A22] border border-[#222A36] rounded-2xl p-4">
 <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
 <Trophy className="w-5 h-5 text-amber-400" />
 Standings
 </h3>
 {fantasySelectedLeague.teams?.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-slate-400 border-b border-[#222A36]">
 <th className="text-left py-2 px-2">#</th>
 <th className="text-left py-2 px-2">Team</th>
 <th className="text-left py-2 px-2">Owner</th>
 <th className="text-center py-2 px-2">W-L</th>
 <th className="text-right py-2 px-2">Pts</th>
 </tr>
 </thead>
 <tbody>
 {fantasySelectedLeague.teams.map((team, idx) => (
 <tr key={team.id} className={`border-b border-white/5 ${team.user_id === user?.id ? 'bg-[#1E90FF]/10' : ''}`}>
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
 <div className="bg-[#151A22] border border-[#222A36] rounded-2xl p-4">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-lg font-bold text-white flex items-center gap-2">
 <Star className="w-5 h-5 text-[#1E90FF]" />
 Your Roster - {myTeam.team_name}
 </h3>
 <button
 onClick={() => setShowAddPlayer(true)}
 className="px-3 py-1.5 bg-[#1E90FF] text-white text-xs font-bold rounded-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
 type="button"
 >
 <Plus className="w-3 h-3" /> Add Player
 </button>
 </div>

 {showAddPlayer && (
 <div className="bg-[#151A22]/80 border border-[#222A36] rounded-xl p-4 mb-4 space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="text-sm font-bold text-white">Add Player</h4>
 <button onClick={() => setShowAddPlayer(false)} className="p-1 hover:bg-[#151A22] rounded-lg cursor-pointer" type="button">
 <X className="w-4 h-4 text-slate-400" />
 </button>
 </div>
 <input
 type="text"
 placeholder="Player Name"
 value={fantasyAddPlayerForm.playerName}
 onChange={e => setFantasyAddPlayerForm(p => ({ ...p, playerName: e.target.value }))}
 className="w-full px-3 py-2 bg-[#151A22] border border-[#222A36] rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#1E90FF]"
 />
 <div className="grid grid-cols-2 gap-2">
 <select
 value={fantasyAddPlayerForm.position}
 onChange={e => setFantasyAddPlayerForm(p => ({ ...p, position: e.target.value }))}
 className="px-3 py-2 bg-[#151A22] border border-[#222A36] rounded-lg text-white text-sm focus:outline-none focus:border-[#1E90FF]"
 >
 {['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'FLEX', 'PG', 'SG', 'SF', 'PF', 'C', 'UTIL'].map(pos => (
 <option key={pos} value={pos} className="bg-[#151A22]">{pos}</option>
 ))}
 </select>
 <input
 type="text"
 placeholder="NFL Team"
 value={fantasyAddPlayerForm.nflTeam}
 onChange={e => setFantasyAddPlayerForm(p => ({ ...p, nflTeam: e.target.value }))}
 className="px-3 py-2 bg-[#151A22] border border-[#222A36] rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#1E90FF]"
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
 className="w-full py-2 bg-[#1E90FF] text-white font-bold rounded-lg active:scale-95 transition-all cursor-pointer"
 type="button"
 >
 Add Player
 </button>
 </div>
 )}

 {myTeam.players?.length > 0 ? (
 <div className="space-y-2">
 {myTeam.players.map(player => (
 <div key={player.id} className="flex items-center justify-between bg-[#151A22] rounded-xl p-3">
 <div className="flex items-center gap-3">
 <span className={`px-2 py-0.5 rounded text-xs font-bold ${player.is_starter ? 'bg-[#1E90FF]/20 text-[#1E90FF]' : 'bg-slate-600/30 text-slate-400'}`}>
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
 <Loader2 className="w-8 h-8 text-[#1E90FF] animate-spin" />
 </div>
 )}
 </div>
 );
 }

 return (
 <div className="min-h-screen pt-[60px] bg-[#0F1115] relative z-0">
 <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="p-2 bg-[#151A22] rounded-xl hover:bg-[#222A36] active:bg-[#222A36] cursor-pointer" type="button">
 <ArrowLeft className="w-5 h-5 text-white" />
 </button>
 <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Trophy className="inline w-6 h-6 mr-2 text-amber-400" />
 FANTASY LEAGUES
 </h1>
 <div className="ml-auto">
 <img src="/huddle-up-shield.png" alt="Huddle Up" className="w-10 h-10 object-contain" />
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={() => setShowCreateLeague(true)}
 className="py-3 bg-[#1E90FF] text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
 type="button"
 >
 <Plus className="w-5 h-5" /> Create League
 </button>
 <button
 onClick={() => setShowJoinLeague(true)}
 className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
 type="button"
 >
 <Users className="w-5 h-5" /> Join League
 </button>
 </div>

 {showCreateLeague && (
 <div className="bg-[#151A22] border border-[#222A36] rounded-2xl p-4 space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-bold text-white">Create League</h3>
 <button onClick={() => setShowCreateLeague(false)} className="p-1 hover:bg-[#151A22] rounded-lg cursor-pointer" type="button">
 <X className="w-5 h-5 text-slate-400" />
 </button>
 </div>
 <input
 type="text"
 placeholder="League Name"
 value={fantasyNewLeague.name}
 onChange={e => setFantasyNewLeague(p => ({ ...p, name: e.target.value }))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#1E90FF]"
 />
 <select
 value={fantasyNewLeague.platform}
 onChange={e => setFantasyNewLeague(p => ({ ...p, platform: e.target.value }))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:border-[#1E90FF]"
 >
 <option value="espn" className="bg-[#151A22]">ESPN</option>
 <option value="yahoo" className="bg-[#151A22]">Yahoo</option>
 <option value="sleeper" className="bg-[#151A22]">Sleeper</option>
 <option value="other" className="bg-[#151A22]">Other</option>
 </select>
 <select
 value={fantasyNewLeague.sport}
 onChange={e => setFantasyNewLeague(p => ({ ...p, sport: e.target.value }))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:border-[#1E90FF]"
 >
 <option value="NFL" className="bg-[#151A22]">NFL</option>
 <option value="NBA" className="bg-[#151A22]">NBA</option>
 <option value="MLB" className="bg-[#151A22]">MLB</option>
 <option value="NHL" className="bg-[#151A22]">NHL</option>
 <option value="Soccer" className="bg-[#151A22]">Soccer</option>
 </select>
 <input
 type="text"
 placeholder="Season (e.g. 2025-26)"
 value={fantasyNewLeague.season}
 onChange={e => setFantasyNewLeague(p => ({ ...p, season: e.target.value }))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#1E90FF]"
 />
 <input
 type="text"
 placeholder="Your Team Name"
 value={fantasyNewLeague.teamName}
 onChange={e => setFantasyNewLeague(p => ({ ...p, teamName: e.target.value }))}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#1E90FF]"
 />
 <button
 onClick={handleCreateFantasyLeague}
 disabled={fantasyLoading}
 className="w-full py-3 bg-[#1E90FF] text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
 type="button"
 >
 {fantasyLoading ? 'Creating...' : 'Create League'}
 </button>
 </div>
 )}

 {showJoinLeague && (
 <div className="bg-[#151A22] border border-[#222A36] rounded-2xl p-4 space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-bold text-white">Join League</h3>
 <button onClick={() => setShowJoinLeague(false)} className="p-1 hover:bg-[#151A22] rounded-lg cursor-pointer" type="button">
 <X className="w-5 h-5 text-slate-400" />
 </button>
 </div>
 <input
 type="text"
 placeholder="Invite Code"
 value={fantasyJoinCode}
 onChange={e => setFantasyJoinCode(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#1E90FF] font-mono"
 />
 <input
 type="text"
 placeholder="Your Team Name"
 value={fantasyJoinTeamName}
 onChange={e => setFantasyJoinTeamName(e.target.value)}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#1E90FF]"
 />
 <button
 onClick={handleJoinFantasyByCode}
 disabled={fantasyLoading}
 className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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
 className="w-full bg-[#151A22] border border-[#222A36] rounded-2xl p-4 hover:bg-[#151A22] active:scale-[0.98] transition-all text-left cursor-pointer"
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
 <span className="font-mono text-xs text-[#1E90FF]">{league.invite_code}</span>
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
 <div className="bg-[#151A22] border border-[#222A36] rounded-2xl p-5">
 <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Star className="w-5 h-5 text-yellow-400" /> NEW TO FANTASY SPORTS?
 </h3>
 <p className="text-slate-300 text-sm mb-4">Fantasy sports let you build your own dream team of real players and compete against friends based on how those players perform in real games.</p>
 <div className="space-y-3">
 <div className="flex gap-3">
 <div className="w-7 h-7 rounded-full bg-[#1E90FF]/20 border border-[#1E90FF]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
 <span className="text-[#1E90FF] text-xs font-bold">1</span>
 </div>
 <div>
 <h4 className="text-white font-bold text-sm">Join or Create a League</h4>
 <p className="text-slate-400 text-xs">Create a league and invite your friends with the invite code, or join an existing one. Pick which platform you play on (ESPN, Yahoo, Sleeper, etc.).</p>
 </div>
 </div>
 <div className="flex gap-3">
 <div className="w-7 h-7 rounded-full bg-[#1E90FF]/20 border border-[#1E90FF]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
 <span className="text-[#1E90FF] text-xs font-bold">2</span>
 </div>
 <div>
 <h4 className="text-white font-bold text-sm">Draft Your Team</h4>
 <p className="text-slate-400 text-xs">Each person in the league picks real players for their roster. You take turns choosing so everyone gets a fair shot at the best players.</p>
 </div>
 </div>
 <div className="flex gap-3">
 <div className="w-7 h-7 rounded-full bg-[#1E90FF]/20 border border-[#1E90FF]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
 <span className="text-[#1E90FF] text-xs font-bold">3</span>
 </div>
 <div>
 <h4 className="text-white font-bold text-sm">Set Your Lineup</h4>
 <p className="text-slate-400 text-xs">Each week, choose which players on your roster are starters vs. on the bench. Starters earn you points based on their real-game stats (touchdowns, yards, goals, etc.).</p>
 </div>
 </div>
 <div className="flex gap-3">
 <div className="w-7 h-7 rounded-full bg-[#1E90FF]/20 border border-[#1E90FF]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
 <span className="text-[#1E90FF] text-xs font-bold">4</span>
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
 <div className="mt-4 p-3 bg-[#1E90FF]/10 border border-[#1E90FF]/20 rounded-xl">
 <p className="text-[#1E90FF] text-xs"><span className="font-bold">Tip:</span> Track your leagues here on Huddle Up, but set your actual lineups on your fantasy platform (ESPN, Yahoo, Sleeper). This is your hub to see standings, manage rosters, and trash talk with your crew!</p>
 </div>
 </div>
 </div>

 {fantasyLoading && (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
 <Loader2 className="w-8 h-8 text-[#1E90FF] animate-spin" />
 </div>
 )}
 </div>
 );
 };

 const renderDmChatScreen = () => {
   if (!dmChatUser) return null;
   const formatTime = (ts) => {
     const d = new Date(ts);
     const now = new Date();
     const isToday = d.toDateString() === now.toDateString();
     const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
     const isYesterday = d.toDateString() === yesterday.toDateString();
     const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
     if (isToday) return time;
     if (isYesterday) return `Yesterday ${time}`;
     return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
   };
   return (
     <div className="min-h-screen pt-[60px] bg-[#0F1115] flex flex-col">
       <div className="sticky top-[60px] z-10 bg-[#0F1115] border-b border-[#222A36]">
         <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
           <button onClick={() => setCurrentScreen('myCrew')} className="p-2 bg-[#151A22] rounded-xl hover:bg-[#222A36]">
             <ArrowLeft className="w-5 h-5 text-white" />
           </button>
           <ProfileAvatar src={dmChatUser.profilePicture} name={dmChatUser.name} size="sm" />
           <div className="flex-1 min-w-0">
             <h2 className="text-white font-bold text-lg truncate">{dmChatUser.name}</h2>
             <span className="text-[#A0A4AB] text-xs">Crew Member</span>
           </div>
         </div>
       </div>

       <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto" style={{ paddingBottom: '100px' }}>
         {dmMessages.length === 0 && (
           <div className="text-center py-12">
             <MessageCircle className="w-12 h-12 text-[#1E90FF]/30 mx-auto mb-3" />
             <p className="text-white font-bold text-sm mb-1">Start the conversation!</p>
             <p className="text-[#A0A4AB] text-xs">Say hi to {dmChatUser.name} — talk game day plans, share predictions, or just say what's up.</p>
           </div>
         )}
         {dmMessages.map((msg, i) => {
           const isMe = msg.senderId === user?.id;
           const showDate = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(dmMessages[i-1].createdAt).toDateString();
           return (
             <div key={msg.id}>
               {showDate && (
                 <div className="text-center my-4">
                   <span className="px-3 py-1 bg-[#222A36] text-[#A0A4AB] text-xs rounded-full">
                     {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                   </span>
                 </div>
               )}
               <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                   isMe
                     ? 'bg-[#1E90FF] text-white rounded-br-md'
                     : 'bg-[#222A36] text-white rounded-bl-md'
                 }`}>
                   <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                   <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[#A0A4AB]/60'}`}>
                     {formatTime(msg.createdAt)}
                   </p>
                 </div>
               </div>
             </div>
           );
         })}
         <div ref={dmEndRef} />
       </div>

       <div className="fixed bottom-0 left-0 right-0 bg-[#0F1115] border-t border-[#222A36] p-3 z-[60]" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
         <div className="max-w-4xl mx-auto flex gap-2">
           <input
             type="text"
             value={dmNewMsg}
             onChange={(e) => setDmNewMsg(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendDm()}
             placeholder={`Message ${dmChatUser.name}...`}
             className="flex-1 px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-2xl text-white placeholder-[#A0A4AB]/50 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] text-sm"
           />
           <button
             onClick={sendDm}
             disabled={!dmNewMsg.trim() || dmSending}
             className="px-4 py-3 bg-[#1E90FF] text-white rounded-2xl font-bold disabled:opacity-50 active:scale-95 transition-all"
           >
             {dmSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
           </button>
         </div>
       </div>
     </div>
   );
 };

 const renderMyCrewScreen = () => (
 <div className="min-h-screen pt-[60px] bg-[#0F1115] relative z-0">
 <div className="sticky top-[60px] z-30 bg-[#0F1115] border-b border-[#222A36]">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <div className="flex items-center gap-3">
 <button onClick={() => setCurrentScreen('games')} className="p-2 bg-[#151A22] rounded-xl hover:bg-[#222A36] active:bg-[#222A36] cursor-pointer" type="button">
 <ArrowLeft className="w-5 h-5 text-white" />
 </button>
 <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <Users className="inline w-6 h-6 mr-2 text-[#1E90FF]" />
 MY CREW
 </h1>
 <div className="ml-auto">
 <button
 onClick={() => { setCurrentScreen('fanFinder'); if (currentCity && nearbyFans.length === 0) searchNearbyFans(currentCity); }}
 className="px-4 py-2 bg-[#1E90FF] text-white text-sm font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
 className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer ${crewTab === 'friends' ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB]'}`}
 >
 My Crew ({friendsList.length})
 </button>
 <button
 onClick={() => { setCrewTab('messages'); api.dm.conversations().then(c => setDmConversations(c)).catch(() => {}); }}
 type="button"
 className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer relative ${crewTab === 'messages' ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB]'}`}
 >
 Messages
 {dmUnreadCount > 0 && (
 <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{dmUnreadCount}</span>
 )}
 </button>
 <button
 onClick={() => setCrewTab('requests')}
 type="button"
 className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer relative ${crewTab === 'requests' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-[#151A22] text-[#A0A4AB]'}`}
 >
 Requests
 {friendRequests.length > 0 && (
 <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{friendRequests.length}</span>
 )}
 </button>
 <button
 onClick={() => { setCrewTab('activity'); loadFriendActivity(); }}
 type="button"
 className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer ${crewTab === 'activity' ? 'bg-emerald-500 text-white' : 'bg-[#151A22] text-[#A0A4AB]'}`}
 >
 Activity
 </button>
 </div>

 <div className="mt-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A4AB]" />
 <input
 type="text"
 placeholder="Search users by name..."
 value={crewSearchQuery}
 onChange={(e) => { setCrewSearchQuery(e.target.value); searchUsers(e.target.value); }}
 className="w-full pl-10 pr-4 py-2.5 bg-[#151A22] border border-[#222A36] rounded-xl text-white text-sm placeholder-[#A0A4AB] focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 />
 {crewSearchQuery && (
 <button onClick={() => { setCrewSearchQuery(''); setCrewSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
 <X className="w-4 h-4 text-[#A0A4AB]" />
 </button>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
 {crewSearchQuery.length >= 2 && (
 <div className="space-y-3">
 <h3 className="text-sm font-bold text-[#A0A4AB] uppercase tracking-wider">Search Results</h3>
 {crewSearchLoading ? (
 <div className="text-center py-8"><Loader2 className="w-6 h-6 text-[#1E90FF] animate-spin mx-auto" /></div>
 ) : crewSearchResults.length === 0 ? (
 <p className="text-[#A0A4AB] text-sm text-center py-4">No users found</p>
 ) : (
 crewSearchResults.map(u => {
 const isFriend = friendsList.some(f => f.id === u.id);
 const isPending = friendStatuses[u.id] === 'sent';
 return (
 <div key={u.id} className="bg-[#151A22] rounded-xl border border-[#222A36] p-4 flex items-center gap-3">
 <ProfileAvatar src={u.profilePicture} name={u.name} size="md" />
 <div className="flex-1 min-w-0">
 <span className="text-white font-bold">{u.name}</span>
 {u.favoriteTeams && Object.values(u.favoriteTeams).length > 0 && (
 <p className="text-[#A0A4AB] text-xs truncate">{Object.values(u.favoriteTeams).join(', ')}</p>
 )}
 <p className="text-[#A0A4AB]/60 text-xs">{u.partiesAttended} parties attended</p>
 </div>
 {isFriend ? (
 <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl">Friends</span>
 ) : isPending ? (
 <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-xl">Pending</span>
 ) : (
 <button onClick={() => sendFriendRequest(u.id)} className="px-3 py-1.5 bg-[#1E90FF] text-white text-xs font-bold rounded-xl active:scale-95 transition-all">
 <UserPlus className="w-3 h-3 inline mr-1" /> Add
 </button>
 )}
 </div>
 );
 })
 )}
 </div>
 )}

 {crewTab === 'friends' && !crewSearchQuery && (
 <>
 {friendsList.length === 0 ? (
 <div className="text-center py-16">
 <div className="w-20 h-20 bg-gradient-to-br from-[#1E90FF]/20 to-[#1E90FF]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1E90FF]/30">
 <Users className="w-10 h-10 text-[#1E90FF]" />
 </div>
 <h3 className="text-xl font-bold text-white mb-2">Build Your Crew</h3>
 <p className="text-[#A0A4AB] mb-6 max-w-sm mx-auto">Find fans who love the same teams and add them to your crew. Then invite them to watch parties!</p>
 <button
 type="button"
 onClick={() => { setCurrentScreen('fanFinder'); if (currentCity && nearbyFans.length === 0) searchNearbyFans(currentCity); }}
 className="px-6 py-3 bg-[#1E90FF] text-white font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer active:scale-95"
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
 <button onClick={() => setCrewInvitePartyId(null)} className="text-[#A0A4AB] hover:text-white">
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}

 {!crewInvitePartyId && crewMyParties.length > 0 && (
 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4">
 <label className="block text-sm font-bold text-[#A0A4AB] mb-2">Invite crew to a party:</label>
 <select
 value={crewInvitePartyId || ''}
 onChange={(e) => setCrewInvitePartyId(e.target.value || null)}
 className="w-full px-4 py-2 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
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
 <div key={friend.id} className="bg-[#151A22] rounded-2xl border border-[#222A36] p-5 hover:border-[#1E90FF]/30 transition-all">
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
 <span className="text-[#A0A4AB] text-xs">
 {Object.values(friend.favoriteTeams).join(', ')}
 </span>
 )}
 </div>
 <div className="text-[#A0A4AB]/70 text-xs mt-1">
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
 className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
 >
 <Send className="w-3 h-3 inline mr-1" /> Invite
 </button>
 )}
 <button
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDmChat(friend); }}
 className="p-2 bg-[#1E90FF]/20 hover:bg-[#1E90FF]/30 text-[#1E90FF] rounded-xl transition-all active:scale-95"
 title={`Message ${friend.name}`}
 >
 <MessageCircle className="w-4 h-4" />
 </button>
 <button
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFriend(friend.id); }}
 className="p-2 bg-[#151A22] hover:bg-red-500/20 active:bg-red-500/30 text-[#A0A4AB]/70 hover:text-red-400 rounded-xl transition-all"
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

 {crewTab === 'messages' && !crewSearchQuery && (
 <>
 {dmConversations.length === 0 ? (
 <div className="text-center py-16">
 <MessageCircle className="w-16 h-16 text-[#1E90FF]/20 mx-auto mb-4" />
 <h3 className="text-xl font-bold text-white mb-2">No Messages Yet</h3>
 <p className="text-[#A0A4AB] text-sm mb-4 max-w-sm mx-auto">We're in soft launch — your crew is just getting started. Tap the message icon on any crew member to start a conversation!</p>
 <button type="button" onClick={() => setCrewTab('friends')} className="px-6 py-3 bg-[#1E90FF] text-white font-bold rounded-xl active:scale-95 transition-all">
 View My Crew
 </button>
 </div>
 ) : (
 dmConversations.map(convo => (
 <button
 key={convo.userId}
 onClick={() => openDmChat({ id: convo.userId, name: convo.name, profilePicture: convo.profilePicture })}
 className="w-full bg-[#151A22] rounded-2xl border border-[#222A36] p-4 hover:border-[#1E90FF]/30 transition-all text-left flex items-center gap-3"
 >
 <div className="relative flex-shrink-0">
 <ProfileAvatar src={convo.profilePicture} name={convo.name} size="lg" />
 {convo.unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{convo.unreadCount}</span>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-0.5">
 <span className={`font-bold truncate ${convo.unreadCount > 0 ? 'text-white' : 'text-[#A0A4AB]'}`}>{convo.name}</span>
 <span className="text-[#A0A4AB]/60 text-xs flex-shrink-0 ml-2">
 {convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
 </span>
 </div>
 <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'text-white/80 font-medium' : 'text-[#A0A4AB]/70'}`}>
 {convo.lastSenderId === user?.id ? 'You: ' : ''}{convo.lastMessage || 'No messages'}
 </p>
 </div>
 <ChevronRight className="w-4 h-4 text-[#A0A4AB]/40 flex-shrink-0" />
 </button>
 ))
 )}
 </>
 )}

 {crewTab === 'requests' && !crewSearchQuery && (
 <>
 {friendRequests.length === 0 ? (
 <div className="text-center py-16">
 <div className="text-4xl mb-3">📬</div>
 <p className="text-[#A0A4AB]">No pending friend requests right now.</p>
 </div>
 ) : (
 friendRequests.map(req => {
 const reqTeams = req.favoriteTeams ? Object.entries(req.favoriteTeams).map(([s, t]) => getTeamLogoUrl(s, t)).filter(Boolean) : [];
 return (
 <div key={req.id} className="bg-[#151A22] rounded-2xl border border-purple-500/20 p-5">
 <div className="flex items-center gap-4 mb-4">
 <ProfileAvatar src={req.profilePicture} name={req.name} size="lg" />
 <div className="flex-1">
 <span className="text-white font-bold text-lg">{req.name}</span>
 <div className="flex items-center gap-1 mt-1">
 {reqTeams.slice(0, 4).map((logo, i) => (
 <img key={i} src={logo} alt="" className="w-5 h-5 object-contain" />
 ))}
 {req.favoriteTeams && Object.values(req.favoriteTeams).length > 0 && (
 <span className="text-[#A0A4AB] text-xs ml-1">{Object.values(req.favoriteTeams).join(', ')}</span>
 )}
 </div>
 <p className="text-[#A0A4AB]/70 text-xs mt-1">Sent {new Date(req.createdAt).toLocaleDateString()}</p>
 </div>
 </div>
 <div className="flex gap-3">
 <button
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); acceptFriendRequest(req.id); }}
 className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-green-500/50 active:scale-95 transition-all flex items-center justify-center gap-2"
 >
 <CheckCircle className="w-4 h-4" /> Accept
 </button>
 <button
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); declineFriendRequest(req.id); }}
 className="flex-1 py-3 bg-[#151A22] text-[#A0A4AB] font-bold rounded-xl hover:bg-[#222A36] active:scale-95 transition-all flex items-center justify-center gap-2"
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

 {crewTab === 'activity' && !crewSearchQuery && (
 <>
 {friendActivityLoading ? (
 <div className="text-center py-16"><Loader2 className="w-8 h-8 text-[#1E90FF] animate-spin mx-auto" /></div>
 ) : friendActivity.length === 0 ? (
 <div className="text-center py-16">
 <div className="text-4xl mb-3">📋</div>
 <h3 className="text-xl font-bold text-white mb-2">No Activity Yet</h3>
 <p className="text-[#A0A4AB] max-w-sm mx-auto">When your friends join watch parties, their activity will show up here.</p>
 </div>
 ) : (
 friendActivity.map((act, idx) => (
 <div key={idx} className="bg-[#151A22] rounded-xl border border-[#222A36] p-4 flex items-center gap-3">
 <ProfileAvatar src={act.profilePicture} name={act.name} size="md" />
 <div className="flex-1 min-w-0">
 <p className="text-white text-sm">
 <span className="font-bold">{act.name}</span>
 {' joined a party for '}
 <span className="text-[#1E90FF] font-semibold">{act.homeTeam} vs {act.awayTeam}</span>
 </p>
 <div className="flex items-center gap-2 mt-1">
 {act.sport && <span className="text-xs text-[#A0A4AB]">{SPORT_ICONS[act.sport] || ''} {act.sport}</span>}
 {act.venueName && <span className="text-xs text-[#A0A4AB]">at {act.venueName}</span>}
 </div>
 {act.activityTime && (
 <p className="text-[#A0A4AB]/60 text-xs mt-1">{new Date(act.activityTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
 )}
 </div>
 </div>
 ))
 )}
 </>
 )}
 </div>
 </div>
 );

 const renderInviteFriendsScreen = () => (
 <div className="min-h-screen pt-[60px] bg-[#0F1115] relative z-0">
 <div className="max-w-4xl mx-auto px-4 py-6">
 <div className="flex items-center gap-3 mb-6">
 <button onClick={() => setCurrentScreen('games')} className="p-2 bg-[#151A22] rounded-xl hover:bg-[#222A36] active:bg-[#222A36] cursor-pointer" type="button">
 <ArrowLeft className="w-5 h-5 text-white" />
 </button>
 <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <UserPlus className="inline w-6 h-6 mr-2 text-emerald-400" />
 INVITE FRIENDS
 </h1>
 </div>

 <div className="space-y-4">
 <div className="bg-gradient-to-br from-emerald-900/40 to-[#151A22] p-6 rounded-2xl border border-emerald-500/20 shadow-xl text-center">
 <div className="text-5xl mb-3">🎉</div>
 <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 SHARE YOUR REFERRAL LINK
 </h2>
 <p className="text-[#A0A4AB] text-sm mb-4">
 Invite friends to join Huddle Up and earn 100 bonus points for each friend who signs up!
 </p>
 <div className="bg-[#0F1115] rounded-xl p-4 mb-4 border border-[#222A36]">
 <p className="text-[#A0A4AB] text-xs mb-1">Your referral link</p>
 <p className="text-[#1E90FF] font-mono text-sm break-all">{window.location.origin}?ref={user?.referralCode || '...'}</p>
 </div>
 <div className="flex gap-3">
 <button
 onClick={copyReferralLink}
 className="flex-1 py-3 bg-[#151A22] text-white font-bold rounded-xl border border-[#222A36] hover:border-[#1E90FF]/30 transition-all flex items-center justify-center gap-2 active:scale-95"
 >
 <Copy className="w-4 h-4" /> Copy Link
 </button>
 <button
 onClick={shareReferralLink}
 className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
 >
 <Share2 className="w-4 h-4" /> Share
 </button>
 </div>
 </div>

 <div className="bg-[#151A22] p-5 rounded-2xl border border-[#222A36]">
 <h3 className="text-lg font-bold text-white mb-3">How It Works</h3>
 <div className="space-y-3">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-[#1E90FF]/20 flex items-center justify-center flex-shrink-0">
 <span className="text-[#1E90FF] font-bold text-sm">1</span>
 </div>
 <p className="text-[#A0A4AB] text-sm">Share your referral link with friends</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-[#1E90FF]/20 flex items-center justify-center flex-shrink-0">
 <span className="text-[#1E90FF] font-bold text-sm">2</span>
 </div>
 <p className="text-[#A0A4AB] text-sm">They sign up using your link</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
 <span className="text-emerald-400 font-bold text-sm">3</span>
 </div>
 <p className="text-[#A0A4AB] text-sm">You both earn bonus points!</p>
 </div>
 </div>
 </div>

 <button
 onClick={() => { setCurrentScreen('myCrew'); loadFriends(); }}
 className="w-full py-3 bg-[#1E90FF] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
 >
 <Users className="w-5 h-5" /> Go to My Crew
 </button>
 </div>
 </div>
 </div>
 );

 const swipeRef = useRef({ startX: 0, startY: 0, valid: false });
 const handleTouchStart = useCallback((e) => {
   const authScreens = ['welcome', 'login', 'signup', 'signupType', 'forgotPassword'];
   const startX = e.touches[0].clientX;
   let el = e.target;
   let inScrollable = false;
   while (el && el !== e.currentTarget) {
     if (el.scrollWidth > el.clientWidth + 5) { inScrollable = true; break; }
     el = el.parentElement;
   }
   const screenW = window.innerWidth || 400;
   swipeRef.current = {
     startX,
     startY: e.touches[0].clientY,
     valid: startX < Math.max(60, screenW * 0.25) && !inScrollable && !authScreens.includes(currentScreen)
   };
 }, [currentScreen]);
 const handleTouchEnd = useCallback((e) => {
   if (!swipeRef.current.valid) return;
   const dx = e.changedTouches[0].clientX - swipeRef.current.startX;
   const dy = e.changedTouches[0].clientY - swipeRef.current.startY;
   if (dx > 60 && Math.abs(dy) < Math.abs(dx)) {
     goBack();
   }
 }, [goBack]);

 return (
 <div
   className="font-sans fixed inset-0 overflow-y-auto overflow-x-hidden dramatic-bg"
   style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' }}
   onTouchStart={handleTouchStart}
   onTouchEnd={handleTouchEnd}
 >
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
 @keyframes fadeInSlideDown {
 from { opacity: 0; transform: translate(-50%, -20px); }
 to { opacity: 1; transform: translate(-50%, 0); }
 }
 .animate-fade-in {
 animation: fade-in 0.6s ease-out;
 }
 .animate-fadeIn {
 animation: fadeIn 0.4s ease-out;
 }
 @keyframes fadeIn {
 from { opacity: 0; transform: translateY(8px); }
 to { opacity: 1; transform: translateY(0); }
 }
 @keyframes spin {
 to { transform: rotate(360deg); }
 }
 .animate-spin {
 animation: spin 1s linear infinite;
 }
 `}</style>


 {/* FEATURE 1: Onboarding Tutorial Overlay */}
 {showOnboarding && <OnboardingOverlay />}
 {showTourGuide && <TourGuidePopup />}

 {scoreCelebration && (
   <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-4" style={{ animation: 'scorePopIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
     <div className="bg-gradient-to-br from-[#1E90FF]/95 to-[#10B981]/95 px-10 py-8 rounded-3xl text-center shadow-2xl border-2 border-white/30 backdrop-blur-md" style={{ animation: 'scorePulse 0.6s ease' }}>
       <div className="text-7xl mb-3" style={{ animation: 'iconBounce 0.6s ease' }}>🎉</div>
       <div className="text-2xl font-black text-white uppercase tracking-wider mb-2" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>{scoreCelebration.team}</div>
       <div className="text-4xl font-black text-[#FFD700] mb-1" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)', animation: 'scorePulse 0.6s ease' }}>+{scoreCelebration.points} {scoreCelebration.sport === 'NFL' && scoreCelebration.points >= 6 ? 'TOUCHDOWN!' : scoreCelebration.sport === 'NBA' && scoreCelebration.points === 3 ? 'THREE!' : 'SCORED!'}</div>
       <div className="text-white/60 text-xs mt-2 font-bold uppercase tracking-widest">{scoreCelebration.sport} • Live</div>
     </div>
   </div>
 )}

 {showIntroSplash && (
   <div className="cinematic-intro" onClick={skipIntroSplash}>
     <div className="cinematic-bg" />
     <div className={`cinematic-particles ${introStage >= 1 ? 'visible' : ''}`} />
     <div className="relative z-[2] flex flex-col items-center justify-center">
       <div className={`cinematic-logo ${introStage >= 1 ? 'visible' : ''}`}>
         <div className="cinematic-logo-glow" />
         <div className="cinematic-logo-trail" />
         <img src="/huddle-up-shield.png" alt="Huddle Up" />
       </div>
       <div className={`cinematic-line cine-blue ${introStage >= 2 ? 'visible' : ''}`}>
         {'FIND'.split('').map((c, i) => <span key={`f${i}`} className="cine-letter" style={{ transitionDelay: `${i * 50}ms` }}>{c}</span>)}
         <span className="cine-space" />
         {'YOUR'.split('').map((c, i) => <span key={`y${i}`} className="cine-letter" style={{ transitionDelay: `${(i + 5) * 50}ms` }}>{c}</span>)}
         <span className="cine-space" />
         {'CREW.'.split('').map((c, i) => <span key={`c${i}`} className="cine-letter" style={{ transitionDelay: `${(i + 10) * 50}ms` }}>{c}</span>)}
       </div>
       <div className={`cinematic-line cine-gold ${introStage >= 3 ? 'visible' : ''}`}>
         {'WATCH'.split('').map((c, i) => <span key={`w${i}`} className="cine-letter" style={{ transitionDelay: `${i * 50}ms` }}>{c}</span>)}
         <span className="cine-space" />
         {'THE'.split('').map((c, i) => <span key={`t${i}`} className="cine-letter" style={{ transitionDelay: `${(i + 6) * 50}ms` }}>{c}</span>)}
         <span className="cine-space" />
         {'GAME.'.split('').map((c, i) => <span key={`g${i}`} className="cine-letter" style={{ transitionDelay: `${(i + 10) * 50}ms` }}>{c}</span>)}
       </div>
     </div>
     <div className={`cinematic-glow ${introStage >= 4 ? 'active' : ''}`} />
     <div className={`cinematic-fadeout ${introStage >= 5 ? 'active' : ''}`} />
     {introStage >= 2 && (
       <div className="absolute bottom-10 right-8 z-[101] flex flex-col gap-2 items-end">
         <button onClick={(e) => { e.stopPropagation(); skipIntroSplash(); }} className="px-6 py-3 rounded-lg text-sm font-semibold" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}>Skip</button>
         <button onClick={(e) => { e.stopPropagation(); neverShowIntro(); }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: '4px' }}>Don't show again</button>
       </div>
     )}
   </div>
 )}

 {showTutorial && !showPrelaunchModal && !showOnboarding && (
   <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
     <div className="bg-[#151A22] rounded-3xl max-w-sm w-full border border-[#222A36] overflow-hidden shadow-2xl">
       {tutorialStep === 0 && (
         <div>
           <div className="bg-gradient-to-br from-[#1E90FF] to-[#0066CC] p-8 text-center">
             <div className="text-6xl mb-4">🏟️</div>
             <h2 className="text-2xl font-black text-white mb-2">Welcome to Huddle Up!</h2>
             <p className="text-white/80 text-sm">Find sports watch parties at local bars</p>
           </div>
           <div className="p-6 text-center">
             <p className="text-white/70 text-sm mb-6">Never watch the game alone again. Join watch parties with other passionate fans.</p>
             <button onClick={() => setTutorialStep(1)} className="w-full py-3 bg-[#1E90FF] text-white font-bold rounded-xl mb-3">Next →</button>
             <button onClick={closeTutorial} className="text-white/50 text-sm">Skip Tutorial</button>
           </div>
         </div>
       )}
       {tutorialStep === 1 && (
         <div className="p-6">
           <h2 className="text-xl font-black text-white text-center mb-6">How It Works</h2>
           <div className="space-y-4 mb-6">
             <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
               <span className="text-3xl">🔍</span>
               <div><div className="text-white font-bold text-sm">Find Your Game</div><div className="text-white/60 text-xs">Search for your favorite team's game</div></div>
             </div>
             <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
               <span className="text-3xl">🏟️</span>
               <div><div className="text-white font-bold text-sm">Pick a Venue</div><div className="text-white/60 text-xs">See which bars are hosting watch parties</div></div>
             </div>
             <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
               <span className="text-3xl">🎉</span>
               <div><div className="text-white font-bold text-sm">Show Up & Party</div><div className="text-white/60 text-xs">Join other fans and watch together!</div></div>
             </div>
           </div>
           <div className="flex gap-3">
             <button onClick={() => setTutorialStep(0)} className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl">← Back</button>
             <button onClick={() => setTutorialStep(2)} className="flex-1 py-3 bg-[#1E90FF] text-white font-bold rounded-xl">Next →</button>
           </div>
         </div>
       )}
       {tutorialStep === 2 && (
         <div>
           <div className="bg-gradient-to-br from-orange-500 to-red-500 p-8 text-center">
             <div className="text-6xl mb-4">🎉</div>
             <h2 className="text-2xl font-black text-white mb-2">Ready to Find Your Crew?</h2>
           </div>
           <div className="p-6 text-center">
             <p className="text-white/70 text-sm mb-6">Discover watch parties near you and join the fun!</p>
             <button onClick={() => { closeTutorial(); setCurrentScreen('browseParties'); }} className="primary-btn find-btn w-full py-3 text-white font-bold rounded-xl mb-3 text-lg"><span className="btn-icon">🎉</span> Find Parties Near Me!</button>
             <button onClick={closeTutorial} className="text-white/50 text-sm">I'll do this later</button>
           </div>
         </div>
       )}
       <div className="flex justify-center gap-2 pb-4">
         {[0,1,2].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i === tutorialStep ? 'bg-[#1E90FF]' : 'bg-white/20'}`} />)}
       </div>
     </div>
   </div>
 )}
 
 

 {user && !['welcome', 'login', 'signup', 'forgotPassword'].includes(currentScreen) && (
 <>
 <div className="fixed top-0 left-0 right-0 z-[60]" style={{ height: `${MAIN_BANNER_HEIGHT}px` }}>
 <MainBrandBanner user={user} onProfileClick={() => setCurrentScreen('profile')} onMenuClick={() => setHamburgerOpen(true)} totalAlerts={totalAlerts} />
 </div>
 <div style={{ height: `${MAIN_BANNER_HEIGHT}px` }} />
 {currentScreen === 'games' && (
 <>
 <div className="fixed left-0 right-0 z-[59] bg-[#151A22] border-b border-[#222A36]" style={{ top: `${MAIN_BANNER_HEIGHT}px` }}>
 <div className="grid grid-cols-4 max-w-lg mx-auto">
 <button onClick={() => { setCurrentScreen('trending'); window.scrollTo(0,0); }} className="flex flex-col items-center gap-1 py-2 transition-colors text-white/50 hover:text-amber-400 active:scale-95">
 <Crown className="w-5 h-5 text-amber-400" /><span className="text-[11px] font-bold">Featured</span>
 </button>
 <button onClick={() => { setCurrentScreen('profile'); window.scrollTo(0,0); setTimeout(() => { const el = document.querySelector('[data-section="favorite-teams"]'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 400); }} className="flex flex-col items-center gap-1 py-2 transition-colors text-white/50 hover:text-amber-400 active:scale-95 relative">
 <Star className="w-5 h-5 text-amber-400" /><span className="text-[11px] font-bold">My Teams</span>
 {user?.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 && <span className="absolute top-1 right-[15%] bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">{Object.keys(user.favoriteTeams).length}</span>}
 </button>
 <button onClick={() => { setCurrentScreen('myParties'); window.scrollTo(0,0); }} className="flex flex-col items-center gap-1 py-2 transition-colors text-white/50 hover:text-[#1E90FF] active:scale-95 relative">
 <Calendar className="w-5 h-5 text-[#1E90FF]" /><span className="text-[11px] font-bold">My Parties</span>
 {(() => { const joined = parties.filter(p => userParties.includes(p.id) && new Date(p.gameTime) >= new Date()).length; return joined > 0 ? <span className="absolute top-1 right-[15%] bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">{joined}</span> : null; })()}
 </button>
 <button onClick={() => { setCurrentScreen('findVenues'); window.scrollTo(0,0); }} className="flex flex-col items-center gap-1 py-2 transition-colors text-white/50 hover:text-emerald-400 active:scale-95 relative">
 <MapPin className="w-5 h-5 text-emerald-400" /><span className="text-[11px] font-bold">Venues</span>
 {(() => { const vc = venues.filter(v => v.verified).length; return vc > 0 ? <span className="absolute top-1 right-[15%] bg-[#1E90FF] text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">{vc}</span> : null; })()}
 </button>
 </div>
 </div>
 <div style={{ height: '48px' }} />
 </>
 )}
 </>
 )}

 {hamburgerOpen && user && (
 <>
 <div className="fixed inset-0 bg-black/50 z-[70] transition-opacity" onClick={() => { setHamburgerOpen(false); setMoreOptionsOpen(false); }} />
 <div className="fixed top-0 left-0 bottom-0 w-72 bg-[#151A22] z-[80] shadow-2xl overflow-y-auto hamburger-menu" style={{ animation: 'slideInLeft 300ms ease-in-out' }}>
 <div className="flex items-center justify-between p-4 border-b border-[#222A36]">
 <span className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>MENU</span>
 <button onClick={() => setHamburgerOpen(false)} className="p-2 rounded-xl hover:bg-[#222A36] transition-colors active:scale-95">
 <X className="w-6 h-6 text-white" />
 </button>
 </div>
 <div className="p-3 space-y-1">
<div className="flex items-center gap-3 p-4 mb-2 bg-[#0F1115] rounded-xl border border-[#222A36]">
<ProfileAvatar src={user?.profilePicture} name={user?.name} size="sm" className="border-0" />
<div>
<div className="text-white font-bold text-sm">{user?.name}</div>
<div className="text-white/50 text-xs">{user?.points || 0} pts</div>
</div>
</div>
<button onClick={() => { setCurrentScreen('browseParties'); setHamburgerOpen(false); window.scrollTo(0, 0); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-left active:scale-[0.98] border border-orange-500/30">
<Search className="w-5 h-5 text-orange-400" /><span className="text-orange-400 text-base font-bold">Browse All Parties</span>
</button>
<button onClick={() => { setCurrentScreen('findVenues'); setHamburgerOpen(false); window.scrollTo(0, 0); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1E90FF]/10 hover:bg-[#1E90FF]/20 transition-colors text-left active:scale-[0.98] border border-[#1E90FF]/30">
<Map className="w-5 h-5 text-[#1E90FF]" /><span className="text-[#1E90FF] text-base font-bold">Find Venues Near Me</span>
</button>
<button onClick={() => { setCurrentScreen('myParties'); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-500/10 transition-colors text-left active:scale-[0.98]">
<Calendar className="w-5 h-5 text-orange-400" /><span className="text-white text-base font-semibold">My Parties</span>
</button>
<button onClick={() => { setCurrentScreen('profile'); setHamburgerOpen(false); setTimeout(() => { const el = document.querySelector('[data-section="favorite-teams"]'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 400); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-500/10 transition-colors text-left active:scale-[0.98]">
<Star className="w-5 h-5 text-amber-400" /><span className="text-white text-base font-semibold">My Favorite Teams</span>
{user?.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 && (
<span className="ml-auto text-xs text-amber-400 font-bold">{Object.keys(user.favoriteTeams).length}</span>
)}
</button>
<button onClick={() => { setCurrentScreen('invitations'); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-yellow-500/10 transition-colors text-left active:scale-[0.98]">
<Bell className="w-5 h-5 text-yellow-400" /><span className="text-white text-base font-semibold">Notifications</span>
{totalAlerts > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalAlerts}</span>}
</button>
<div className="border-t border-[#222A36] my-2" />
<button onClick={() => { setCurrentScreen('notificationSettings'); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left active:scale-[0.98]">
<Settings className="w-5 h-5 text-white/60" /><span className="text-white text-base font-semibold">Settings</span>
</button>
<button onClick={() => { setShowQA(true); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-500/10 transition-colors text-left active:scale-[0.98]">
<Shield className="w-5 h-5 text-indigo-400" /><span className="text-white text-base font-semibold">Help & FAQ</span>
</button>
<button onClick={() => setMoreOptionsOpen(!moreOptionsOpen)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left active:scale-[0.98]">
<ChevronRight className={`w-5 h-5 text-white/60 transition-transform ${moreOptionsOpen ? 'rotate-90' : ''}`} /><span className="text-white text-base font-semibold">More Options</span>
<ChevronDown className={`w-4 h-4 text-white/40 ml-auto transition-transform ${moreOptionsOpen ? 'rotate-180' : ''}`} />
</button>
{moreOptionsOpen && (
<div className="space-y-1 pl-2">
{!isAppInstalled && (
<button onClick={() => { handlePwaInstall(); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1E90FF]/10 transition-colors text-left active:scale-[0.98]">
<Download className="w-5 h-5 text-[#1E90FF]" /><span className="text-white text-base font-semibold">Install App</span>
</button>
)}
<button onClick={() => { setCurrentScreen('teamChats'); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-500/10 transition-colors text-left active:scale-[0.98]">
<MessageCircle className="w-5 h-5 text-teal-400" /><span className="text-white text-base font-semibold">Team Chat</span>
</button>
<button onClick={() => { setCurrentScreen('fanFinder'); if (currentCity && nearbyFans.length === 0) searchNearbyFans(currentCity); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1E90FF]/10 transition-colors text-left active:scale-[0.98]">
<UserPlus className="w-5 h-5 text-[#1E90FF]" /><span className="text-white text-base font-semibold">Find Fans</span>
</button>
<button onClick={() => { setCurrentScreen('predictions'); loadPredictions(); loadPredictionLeaderboard(); window.scrollTo({ top: 0, behavior: 'instant' }); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 transition-colors text-left active:scale-[0.98]">
<Target className="w-5 h-5 text-emerald-400" /><span className="text-white text-base font-semibold">Predictions</span>
</button>
<button onClick={() => { setCurrentScreen('fantasy'); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-500/10 transition-colors text-left active:scale-[0.98]">
<Trophy className="w-5 h-5 text-orange-400" /><span className="text-white text-base font-semibold">Fantasy</span>
</button>
<button onClick={() => { setCurrentScreen('inviteFriends'); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 transition-colors text-left active:scale-[0.98]">
<UserPlus className="w-5 h-5 text-emerald-400" /><span className="text-white text-base font-semibold">Invite Friends</span>
</button>
<button onClick={() => { setHamburgerOpen(false); if (currentScreen !== 'games') { setCurrentScreen('games'); setTimeout(() => startSpotlightTour(), 600); } else { startSpotlightTour(); } }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1E90FF]/10 transition-colors text-left active:scale-[0.98]">
<Map className="w-5 h-5 text-[#1E90FF]" /><span className="text-white text-base font-semibold">Learn The App</span>
</button>
</div>
)}
<div className="border-t border-[#222A36] my-2" />
{userVenue && (
<button onClick={() => { setCurrentScreen('venueDashboard'); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-500/10 transition-colors text-left active:scale-[0.98]">
<Building2 className="w-5 h-5 text-green-400" /><span className="text-white text-base font-semibold">Venue Hub</span>
</button>
)}
{isAdmin && (
<button onClick={() => { setCurrentScreen('admin'); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/10 transition-colors text-left active:scale-[0.98]">
<Settings className="w-5 h-5 text-purple-400" /><span className="text-white text-base font-semibold">Admin Panel</span>
</button>
)}
<div className="border-t border-[#222A36] my-2" />
<button onClick={() => { handleLogout(); setHamburgerOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-left active:scale-[0.98]">
<LogOut className="w-5 h-5 text-red-400" /><span className="text-red-400 text-base font-semibold">Logout</span>
</button>
</div>
 </div>
 </>
 )}

 {showPushBanner && user && (
 <div className="fixed bottom-20 left-4 right-4 z-[55] bg-gradient-to-r from-[#1E90FF] to-[#0066CC] rounded-2xl p-4 shadow-2xl border border-[#1E90FF]/50 animate-fadeIn max-w-md mx-auto">
   <div className="flex items-start gap-3">
     <Bell className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
     <div className="flex-1">
       <p className="text-white font-bold text-sm">Get notified about your parties and predictions?</p>
       <p className="text-white/70 text-xs mt-1">We'll send reminders before games, prediction results, and raffle winners.</p>
       <div className="flex gap-2 mt-3">
         <button onClick={async () => { await enablePush(); setShowPushBanner(false); }} className="px-4 py-1.5 bg-white text-[#1E90FF] font-bold text-xs rounded-lg">
           Allow
         </button>
         <button onClick={() => setShowPushBanner(false)} className="px-4 py-1.5 bg-white/20 text-white font-bold text-xs rounded-lg">
           Not Now
         </button>
       </div>
     </div>
     <button onClick={() => setShowPushBanner(false)} className="text-white/60 hover:text-white">
       <X className="w-4 h-4" />
     </button>
   </div>
 </div>
 )}

 {currentScreen === 'welcome' && <WelcomeScreen />}
 {currentScreen === 'login' && loginScreenJSX}
 {currentScreen === 'signupType' && signupTypeScreenJSX}
 {currentScreen === 'signup' && signUpScreenJSX}
 {currentScreen === 'forgotPassword' && forgotPasswordScreenJSX}
 {currentScreen === 'games' && gamesScreenJSX()}
 {currentScreen === 'gameDetail' && <GameDetailScreen />}
 {currentScreen === 'createParty' && createPartyScreenJSX()}
 {currentScreen === 'claimVenue' && claimVenueScreenJSX()}
 {currentScreen === 'admin' && AdminPanelScreen()}
 {currentScreen === 'venueDashboard' && <VenueHubScreen />}
 {currentScreen === 'sponsorDashboard' && <SponsorDashboard />}
 {currentScreen === 'myParties' && <MyPartiesScreen />}
 {currentScreen === 'notificationSettings' && <NotificationSettingsScreen />}
 {currentScreen === 'browseParties' && <ScreenErrorBoundary onReset={() => setCurrentScreen('games')}><BrowsePartiesScreen /></ScreenErrorBoundary>}
 {currentScreen === 'nearbyParties' && (() => { setCurrentScreen('browseParties'); return null; })()}
 {currentScreen === 'profile' && <ProfileScreen />}
 {currentScreen === 'proUpgrade' && <ProUpgradeScreen />}
 {currentScreen === 'influencerDashboard' && <InfluencerDashboard />}
 {currentScreen === 'fanFinder' && renderFanFinderScreen()}
 {currentScreen === 'myCrew' && renderMyCrewScreen()}
 {currentScreen === 'dmChat' && renderDmChatScreen()}
 {currentScreen === 'partyChat' && openChatPartyId && (
 <div className="fixed inset-0 bg-[#0F1115] z-[40] flex flex-col" style={{ top: '60px' }}>
 <div className="flex items-center gap-3 px-4 py-3 bg-[#151A22] border-b border-[#222A36]">
 <button onClick={() => { if (chatPollRef.current) clearInterval(chatPollRef.current); setOpenChatPartyId(null); setCurrentScreen(chatPrevScreen || 'gameDetail'); }} className="p-2 rounded-xl hover:bg-white/10 transition-colors active:scale-95">
 <ArrowLeft className="w-5 h-5 text-white" />
 </button>
 <div className="flex-1 min-w-0">
 <h2 className="text-white font-black text-base truncate flex items-center gap-2">
 <MessageCircle className="w-5 h-5 text-purple-400" />
 {chatPartyName}
 </h2>
 <p className="text-purple-300/60 text-xs">Party Chat</p>
 </div>
 <div className="flex items-center gap-1 text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full text-xs font-bold">
 <Users className="w-3 h-3" /> {chatMessages.length > 0 ? [...new Set(chatMessages.map(m => m.user_id))].length : 0}
 </div>
 </div>
 <div className="flex-1 overflow-y-auto p-4 space-y-3">
 {chatLoading ? (
 <div className="flex items-center justify-center h-full">
 <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
 </div>
 ) : chatMessages.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full gap-4">
 <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
 <MessageCircle className="w-10 h-10 text-purple-400/40" />
 </div>
 <p className="text-white font-bold text-lg">Start the conversation!</p>
 <p className="text-[#A0A4AB]/70 text-sm text-center leading-relaxed max-w-xs">Say hi, share your predictions, or ask who's sitting where. Every great party starts with someone breaking the ice.</p>
 <div className="flex flex-wrap justify-center gap-2">
 {['Say hi! 👋', "Who's coming?", 'Lets go! 🔥', 'Great game! 🏆'].map((starter) => (
 <button
 key={starter}
 onClick={() => { if (chatInputRef.current) { chatInputRef.current.value = starter; chatInputRef.current.focus(); } }}
 className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/20 transition-colors"
 >
 {starter}
 </button>
 ))}
 </div>
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
 <span className="text-xs text-[#A0A4AB] font-medium">{msg.user_name}</span>
 {msg.is_founder && <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md font-bold" style={{ fontSize: '8px', backgroundColor: '#F5B400', color: '#0F1115' }}>⭐</span>}
 </div>
 )}
 {isFantasy && (
 <div className="flex items-center gap-1 mb-0.5">
 <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">🏈 Trash Talk</span>
 </div>
 )}
 <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
 isFantasy
 ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-100 border border-orange-500/40 rounded-br-md'
 : isMe
 ? 'bg-[#1E90FF] text-white rounded-br-md'
 : 'bg-[#151A22] text-gray-200 border border-[#222A36] rounded-bl-md'
 }`}>
 {msg.message}
 </div>
 <div className={`text-[10px] text-[#A0A4AB]/70 mt-0.5 ${isMe ? 'text-right' : ''}`}>
 {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>
 </div>
 );
 })
 )}
 <div ref={chatEndRef} />
 </div>
 <div className="p-3 bg-[#151A22] border-t border-[#222A36]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
 {chatTrashTalk && (
 <div className="mb-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center gap-1">
 <span className="text-xs text-orange-400 font-bold">🏈 TRASH TALK MODE</span>
 <button onClick={() => setChatTrashTalk(false)} className="ml-auto text-orange-400 hover:text-orange-300">
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 <div className="flex gap-2">
 <button
 onClick={() => setChatTrashTalk(!chatTrashTalk)}
 className={`p-2.5 rounded-full transition-all ${chatTrashTalk ? 'bg-orange-500 text-white' : 'bg-[#0F1115] text-[#A0A4AB] hover:text-orange-400 border border-[#222A36]'}`}
 title="Fantasy Trash Talk"
 >
 <Trophy className="w-5 h-5" />
 </button>
 <input
 ref={chatInputRef}
 type="text"
 defaultValue=""
 onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(openChatPartyId)}
 placeholder={chatTrashTalk ? "Talk trash about their fantasy team..." : "Type a message..."}
 maxLength={500}
 className={`flex-1 bg-[#0F1115] border rounded-full px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none ${chatTrashTalk ? 'border-orange-500/50 focus:border-orange-500' : 'border-[#222A36] focus:border-purple-500/50'}`}
 />
 <button
 onClick={() => sendChatMessage(openChatPartyId)}
 disabled={chatSending}
 className={`text-white p-2.5 rounded-full hover:opacity-90 transition-all disabled:opacity-50 ${chatTrashTalk ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
 >
 <Send className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 )}
 {currentScreen === 'rewards' && <RewardsScreen />}
 {currentScreen === 'invitations' && <InvitationsScreen />}
 {currentScreen === 'qrCheckin' && <QrCheckinScreen />}
 {currentScreen === 'fantasy' && renderFantasyScreen()}
 {currentScreen === 'teamChats' && renderTeamChatsScreen()}
 {currentScreen === 'trending' && renderTrendingScreen()}
 {currentScreen === 'userProfile' && renderUserProfileScreen()}
 {currentScreen === 'alerts' && renderAlertsScreen()}
 {currentScreen === 'myTickets' && renderMyTicketsScreen()}
 {currentScreen === 'predictions' && PredictionsScreen()}
 {currentScreen === 'contactUs' && <ContactUsScreen />}
 {currentScreen === 'termsOfService' && <TermsOfServiceScreen />}
 {currentScreen === 'privacyPolicy' && <PrivacyPolicyScreen />}
 {currentScreen === 'venueDetail' && <VenueDetailScreen />}
 {currentScreen === 'findParties' && (() => {
   const fpSportIcons = { 'NFL': '🏈', 'NBA': '🏀', 'NHL': '🏒', 'MLB': '⚾', 'MLS': '⚽', 'College Football': '🏈', 'College Basketball': '🏀', 'Premier League': '⚽', 'La Liga': '⚽', 'Liga MX': '⚽', 'Champions League': '⚽', 'UFC/MMA': '🥊', 'Boxing': '🥊', 'NASCAR': '🏁', 'F1': '🏎️', 'Tennis': '🎾', 'Golf': '⛳' };
   const fpSportList = ['All', 'NFL', 'NBA', 'NHL', 'MLB', 'MLS', 'College Football', 'College Basketball', 'Premier League', 'UFC/MMA', 'Boxing'];
   const now = new Date();
   const fourHoursAgo = new Date(now.getTime() - 4*60*60*1000);
   const parseGT = (gt) => { const d = new Date(gt); return isNaN(d.getTime()) ? null : d; };
   const allParties = parties.filter(p => { const d = parseGT(p.gameTime); return !d || d >= fourHoursAgo; }).sort((a, b) => { const da = parseGT(a.gameTime); const db = parseGT(b.gameTime); if (!da && !db) return 0; if (!da) return 1; if (!db) return -1; return da - db; });
   const allGames = games.filter(g => new Date(g.startTime || g.date) >= fourHoursAgo).sort((a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date));
   const fpSearch = findPartiesSearch || '';
   const fpSearchLower = fpSearch.toLowerCase();
   const fpSport = findPartiesSport || 'All';
   const sportFiltered = fpSport === 'All' ? allParties : allParties.filter(p => p.sport === fpSport);
   const sportFilteredGames = fpSport === 'All' ? allGames : allGames.filter(g => g.sport === fpSport);
   const searchFiltered = fpSearch ? sportFiltered.filter(p => {
     const title = (p.homeTeam && p.awayTeam ? `${p.awayTeam} vs ${p.homeTeam}` : p.title || '').toLowerCase();
     return title.includes(fpSearchLower) || (p.venueName || '').toLowerCase().includes(fpSearchLower) || (p.hostName || '').toLowerCase().includes(fpSearchLower) || (p.sport || '').toLowerCase().includes(fpSearchLower);
   }) : sportFiltered;
   const searchFilteredGames = fpSearch ? sportFilteredGames.filter(g => {
     return `${g.awayTeam || ''} vs ${g.homeTeam || ''}`.toLowerCase().includes(fpSearchLower) || (g.sport || '').toLowerCase().includes(fpSearchLower);
   }) : sportFilteredGames;
   const liveParties = searchFiltered.filter(p => { const d = parseGT(p.gameTime); return d && d <= now && d >= fourHoursAgo; });
   const upcomingParties = searchFiltered.filter(p => { const d = parseGT(p.gameTime); return !d || d > now; });
   const partyVenues = {};
   const venuePartyMap = {};
   allParties.forEach(p => {
     if (p.venueName) {
       const vn = p.venueName.toLowerCase();
       const v = venues.find(x => x.name?.toLowerCase() === vn);
       if (v && v.latitude && v.longitude) {
         partyVenues[p.id] = v;
         if (!venuePartyMap[v.id]) venuePartyMap[v.id] = { venue: v, parties: [] };
         venuePartyMap[v.id].parties.push(p);
       }
     }
   });
   const venueMarkers = Object.values(venuePartyMap);
   const userCenter = userCoords ? [userCoords.lat, userCoords.lng] : null;
   const firstVenueCoords = venueMarkers.length > 0 ? [parseFloat(venueMarkers[0].venue.latitude), parseFloat(venueMarkers[0].venue.longitude)] : null;
   const defaultCenter = userCenter || firstVenueCoords || [26.1224, -80.1373];
   const FpMapRecenter = () => { const map = useMap(); React.useEffect(() => { if (userCenter) map.setView(userCenter, 13); }, []); return null; };
   const fpCityInput = findPartiesCityInput || '';
   const fpShowCityInput = findPartiesShowCity || false;
   const totalResults = searchFiltered.length + searchFilteredGames.length;
   return (
     <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: '72px', display: 'flex', flexDirection: 'column', zIndex: 0 }}>
       <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
         <MapContainer center={defaultCenter} zoom={userCenter ? 13 : 12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true} dragging={true} zoomControl={false} doubleClickZoom={true} touchZoom={true} keyboard={true} attributionControl={false}>
           <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
           <FpMapRecenter />
           {venueMarkers.map(({ venue: vm, parties: vps }) => {
             const hasLive = vps.some(p => { const gt = new Date(p.gameTime); return gt <= now && gt >= fourHoursAgo; });
             const nextP = vps[0];
             return (
               <Marker key={vm.id} position={[parseFloat(vm.latitude), parseFloat(vm.longitude)]}
                 icon={L.divIcon({ className: 'leaflet-custom-marker', html: `<div style="background:${hasLive ? '#E53935' : '#1565C0'};width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.35);cursor:pointer;position:relative">${hasLive ? '🔴' : '🍺'}<span style="position:absolute;top:-7px;right:-7px;background:#FF6D00;color:white;font-size:10px;font-weight:bold;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)">${vps.length}</span></div>`, iconSize: [38, 38], iconAnchor: [19, 19] })}>
                 <Popup><div className="text-center" style={{ minWidth: '150px' }}><strong style={{ fontSize: '13px' }}>{vm.name}</strong><br/><span style={{ fontSize: '11px', color: '#aaa' }}>{vm.type || 'Sports Bar'}</span><br/><span style={{ fontSize: '12px', color: '#10B981', fontWeight: 'bold' }}>{vps.length} {vps.length === 1 ? 'party' : 'parties'}</span>{hasLive && <><br/><span style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '11px' }}>LIVE NOW</span></>}<br/>{nextP && <span style={{ fontSize: '11px', color: '#ccc' }}>{nextP.homeTeam && nextP.awayTeam ? `${nextP.awayTeam} vs ${nextP.homeTeam}` : nextP.title || ''}</span>}<br/><button onClick={() => { setSelectedGame({ id: nextP.gameId || nextP.id, sport: nextP.sport, homeTeam: nextP.homeTeam, awayTeam: nextP.awayTeam, startTime: nextP.gameTime }); setCurrentScreen('gameDetail'); }} style={{ background: '#1E90FF', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', marginTop: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>View Party</button></div></Popup>
               </Marker>
             );
           })}
         </MapContainer>
       </div>
       <div style={{ position: 'absolute', top: '8px', left: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
         <button onClick={() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(pos => { const lat = pos.coords.latitude; const lng = pos.coords.longitude; fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`).then(r => r.json()).then(d => { const city = d.address?.city || d.address?.town || d.address?.village || 'Your Location'; setCurrentCity(`${city}, ${d.address?.state || ''}`); setFindPartiesShowCity(false); }).catch(() => setCurrentCity('Your Location')); }, () => { alert('Please enable location access to use Near Me'); }); } else { alert('Location is not supported by your browser'); } }} className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-white text-xs shadow-lg" style={{ background: 'linear-gradient(135deg, #1E90FF, #1873cc)', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
           <Navigation className="w-3.5 h-3.5" /> Near Me
         </button>
         <button onClick={() => setFindPartiesShowCity(!fpShowCityInput)} className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-white text-xs shadow-lg" style={{ background: '#1a1d28', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
           <MapPin className="w-3.5 h-3.5" /> {currentCity || 'Enter City'}
         </button>
       </div>
       {fpShowCityInput && (
         <div style={{ position: 'absolute', top: '48px', left: '12px', right: '12px', zIndex: 10 }}>
           <div className="flex gap-2 p-2 rounded-xl shadow-xl" style={{ background: '#151A22', border: '1px solid #222A36' }}>
             <input type="text" value={fpCityInput} onChange={(e) => setFindPartiesCityInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && fpCityInput.trim()) { setCurrentCity(fpCityInput.trim()); setFindPartiesShowCity(false); setFindPartiesCityInput(''); } }} placeholder="Type a city name..." className="flex-1 px-3 py-2 bg-[#0F1115] border border-[#222A36] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" autoFocus />
             <button onClick={() => { if (fpCityInput.trim()) { setCurrentCity(fpCityInput.trim()); setFindPartiesShowCity(false); setFindPartiesCityInput(''); } }} className="px-4 py-2 bg-[#1E90FF] text-white font-bold text-sm rounded-lg">Go</button>
           </div>
         </div>
       )}
       <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '55%', zIndex: 5, display: 'flex', flexDirection: 'column', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', background: '#0F1115', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}>
         <div style={{ padding: '8px 0 2px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
           <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
         </div>
         <div className="px-3 pb-2 pt-1" style={{ flexShrink: 0 }}>
           <div className="text-center mb-1.5">
             <span className="text-xs font-black" style={{ color: '#FFD700', letterSpacing: '1px' }}>FIND YOUR CREW. WATCH THE GAME!</span>
           </div>
           <div className="relative mb-1.5">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A4AB]" />
             <input type="text" value={fpSearch} onChange={(e) => setFindPartiesSearch(e.target.value)} placeholder="Search teams, venues, hosts..." className="w-full pl-10 pr-10 py-2 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]" />
             {fpSearch && <button onClick={() => setFindPartiesSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A4AB] hover:text-white"><X className="w-4 h-4" /></button>}
           </div>
           <div className="overflow-x-auto hide-scrollbar mb-2">
             <div className="flex gap-1.5" style={{ minWidth: 'max-content' }}>
               {fpSportList.map(sp => (
                 <button key={sp} onClick={() => setFindPartiesSport(sp)} className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${fpSport === sp ? 'bg-[#1E90FF] text-white' : 'bg-[#151A22] text-[#A0A4AB] border border-[#222A36]'}`}>
                   {sp !== 'All' && <span className="mr-0.5">{fpSportIcons[sp]}</span>}{sp}
                 </button>
               ))}
             </div>
           </div>
           <div className="flex items-center justify-between">
             <span className="text-white font-black text-sm">{searchFiltered.length} {searchFiltered.length === 1 ? 'Party' : 'Parties'} • {searchFilteredGames.length} Games</span>
             <span className="text-[#A0A4AB] text-[11px]">{currentCity || 'All Locations'}</span>
           </div>
         </div>
         <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
           {liveParties.length > 0 && (
             <div className="px-3 pb-2">
               <div className="flex items-center gap-2 mb-1.5 px-1">
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                 <span className="text-red-400 text-[11px] font-black uppercase tracking-wider">Live Now</span>
               </div>
               <div className="space-y-1.5">
                 {liveParties.map(p => (
                   <div key={p.id} onClick={() => { setSelectedGame({ id: p.gameId || p.id, sport: p.sport, homeTeam: p.homeTeam, awayTeam: p.awayTeam, startTime: p.gameTime }); setCurrentScreen('gameDetail'); }} className="bg-[#151A22] rounded-xl border border-red-500/30 overflow-hidden cursor-pointer active:scale-[0.99]">
                     <div className="flex items-center p-2.5 gap-2.5">
                       <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl flex-shrink-0">{fpSportIcons[p.sport] || '🏟️'}</div>
                       <div className="flex-1 min-w-0">
                         <div className="text-white font-bold text-[13px] truncate">{p.homeTeam && p.awayTeam ? `${p.awayTeam} vs ${p.homeTeam}` : p.title || 'Watch Party'}</div>
                         <div className="text-[#A0A4AB] text-[11px] truncate flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />{p.venueName || 'TBD'}</div>
                       </div>
                       <div className="flex flex-col items-end gap-1 flex-shrink-0">
                         <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">LIVE</span>
                         <button onClick={(e) => { e.stopPropagation(); setSelectedGame({ id: p.gameId || p.id, sport: p.sport, homeTeam: p.homeTeam, awayTeam: p.awayTeam, startTime: p.gameTime }); setCurrentScreen('gameDetail'); }} className="px-2.5 py-1 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white text-[11px] font-bold rounded-lg">Join</button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
           {upcomingParties.length > 0 && (
           <div className="px-3 pb-2">
             {liveParties.length > 0 && (
               <div className="flex items-center gap-2 mb-1.5 px-1 mt-1">
                 <Calendar className="w-3 h-3 text-[#1E90FF]" />
                 <span className="text-[#1E90FF] text-[11px] font-black uppercase tracking-wider">Upcoming</span>
               </div>
             )}
             <div className="space-y-1.5">
               {upcomingParties.map(p => (
                 <div key={p.id} onClick={() => { setSelectedGame({ id: p.gameId || p.id, sport: p.sport, homeTeam: p.homeTeam, awayTeam: p.awayTeam, startTime: p.gameTime }); setCurrentScreen('gameDetail'); }} className="bg-[#151A22] rounded-xl border border-[#222A36] overflow-hidden cursor-pointer active:scale-[0.99]">
                   <div className="flex items-center p-2.5 gap-2.5">
                     <div className="w-10 h-10 rounded-lg bg-[#1E90FF]/10 flex items-center justify-center text-xl flex-shrink-0">{fpSportIcons[p.sport] || '🏟️'}</div>
                     <div className="flex-1 min-w-0">
                       <div className="text-white font-bold text-[13px] truncate">{p.homeTeam && p.awayTeam ? `${p.awayTeam} vs ${p.homeTeam}` : p.title || 'Watch Party'}</div>
                       <div className="text-[#A0A4AB] text-[11px] truncate flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />{p.venueName || 'TBD'}</div>
                       <div className="text-[#A0A4AB] text-[11px]">{new Date(p.gameTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(p.gameTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                     </div>
                     <button onClick={(e) => { e.stopPropagation(); setSelectedGame({ id: p.gameId || p.id, sport: p.sport, homeTeam: p.homeTeam, awayTeam: p.awayTeam, startTime: p.gameTime }); setCurrentScreen('gameDetail'); }} className="px-2.5 py-1 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white text-[11px] font-bold rounded-lg flex-shrink-0">Join</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           )}
           {searchFilteredGames.length > 0 && (
           <div className="px-3 pb-3">
             <div className="flex items-center gap-2 mb-1.5 px-1 mt-1">
               <span className="text-sm">🏟️</span>
               <span className="text-white/70 text-[11px] font-black uppercase tracking-wider">Games {fpSearch ? 'Matching' : 'Today & Upcoming'}</span>
             </div>
             <div className="space-y-1.5">
               {searchFilteredGames.slice(0, 15).map(g => {
                 const gt = new Date(g.startTime || g.date);
                 const gIsLive = gt <= now && gt >= fourHoursAgo;
                 const gameParties = allParties.filter(p => p.gameId === g.id);
                 return (
                 <div key={g.id} onClick={() => { setSelectedGame(g); setCurrentScreen('gameDetail'); }} className={`bg-[#151A22] rounded-xl border ${gIsLive ? 'border-red-500/30' : 'border-[#222A36]'} overflow-hidden cursor-pointer active:scale-[0.99]`}>
                   <div className="flex items-center p-2.5 gap-2.5">
                     <div className={`w-10 h-10 rounded-lg ${gIsLive ? 'bg-red-500/20' : 'bg-white/5'} flex items-center justify-center text-xl flex-shrink-0`}>{fpSportIcons[g.sport] || '🏟️'}</div>
                     <div className="flex-1 min-w-0">
                       <div className="text-white font-bold text-[13px] truncate">{g.awayTeam} vs {g.homeTeam}</div>
                       <div className="text-[#A0A4AB] text-[11px]">{g.sport} • {gt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {gt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                     </div>
                     <div className="flex flex-col items-end gap-1 flex-shrink-0">
                       {gIsLive && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">LIVE</span>}
                       {gameParties.length > 0 && <span className="text-emerald-400 text-[10px] font-bold">{gameParties.length} party</span>}
                       <button onClick={(e) => { e.stopPropagation(); setSelectedGame(g); setCurrentScreen('gameDetail'); }} className="px-2.5 py-1 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white text-[11px] font-bold rounded-lg">View</button>
                     </div>
                   </div>
                 </div>
               );})}
             </div>
           </div>
           )}
           {searchFiltered.length === 0 && searchFilteredGames.length === 0 && (
             <div className="text-center py-10 px-6">
               <div className="text-5xl mb-3">{fpSearch || fpSport !== 'All' ? '🔍' : '🏟️'}</div>
               <h3 className="text-white font-bold text-lg mb-2">{fpSearch ? 'No Results Found' : fpSport !== 'All' ? `No ${fpSport} Events` : 'No Parties Yet'}</h3>
               <p className="text-[#A0A4AB] text-sm mb-4">{fpSearch ? `No matches for "${fpSearch}"` : fpSport !== 'All' ? `No ${fpSport} parties or games right now.` : 'No watch parties scheduled. Be the first to create one!'}</p>
               {fpSearch ? <button onClick={() => setFindPartiesSearch('')} className="px-5 py-2.5 bg-[#1E90FF] text-white font-bold rounded-xl text-sm">Clear Search</button> : fpSport !== 'All' ? <button onClick={() => setFindPartiesSport('All')} className="px-5 py-2.5 bg-[#1E90FF] text-white font-bold rounded-xl text-sm">Show All Sports</button> : <button onClick={() => setCurrentScreen('games')} className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-sm">Create a Party</button>}
             </div>
           )}
         </div>
       </div>
     </div>
   );
 })()}
 {currentScreen === 'findVenues' && (() => {
   const getCatIcon = (type) => {
     const cats = { 'Sports Bar': { icon: '🍺', color: '#FF6B35' }, 'Restaurant': { icon: '🍴', color: '#E63946' }, 'Restaurant & Bar': { icon: '🍴', color: '#E63946' }, 'Pub': { icon: '🍻', color: '#10B981' }, 'Lounge': { icon: '🎵', color: '#8B5CF6' }, 'Bar & Grill': { icon: '🍺', color: '#FF6B35' } };
     const c = cats[type] || cats['Sports Bar'];
     return <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: c.color }}>{c.icon}</div>;
   };
   const fvSportIcons = { 'NFL': '🏈', 'NBA': '🏀', 'NHL': '🏒', 'MLB': '⚾', 'MLS': '⚽', 'College Football': '🏈', 'College Basketball': '🏀', 'Premier League': '⚽', 'La Liga': '⚽', 'Liga MX': '⚽', 'Champions League': '⚽', 'UFC/MMA': '🥊', 'Boxing': '🥊', 'NASCAR': '🏁', 'F1': '🏎️', 'Tennis': '🎾', 'Golf': '⛳' };
   const renderStars = (r) => Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < Math.round(r || 0) ? '#FFD700' : '#444', fontSize: '14px' }}>★</span>);
   const vList = venues.filter(v => v.verified);
   const now = new Date();
   const upcomingParties = parties.filter(p => new Date(p.gameTime) >= now);
   const venuePartyLookup = {};
   upcomingParties.forEach(p => { if (p.venueName) { const k = p.venueName.toLowerCase(); if (!venuePartyLookup[k]) venuePartyLookup[k] = []; venuePartyLookup[k].push(p); } });
   const mapVenues = vList.filter(v => v.latitude && v.longitude);
   const fvUserCenter = userCoords ? [userCoords.lat, userCoords.lng] : null;
   const defaultCenter = fvUserCenter || (mapVenues.length > 0 ? [parseFloat(mapVenues[0].latitude), parseFloat(mapVenues[0].longitude)] : [26.1224, -80.1373]);
   const FvMapRecenter = () => { const map = useMap(); React.useEffect(() => { if (fvUserCenter) map.setView(fvUserCenter, 13); }, []); return null; };
   return (
     <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: '72px', display: 'flex', flexDirection: 'column', zIndex: 0 }}>
       <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
         <MapContainer center={defaultCenter} zoom={fvUserCenter ? 13 : 12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true} dragging={true} zoomControl={false} doubleClickZoom={true} touchZoom={true} keyboard={true} attributionControl={false}>
           <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
           <FvMapRecenter />
           {mapVenues.map(v => {
             const vParties = venuePartyLookup[v.name?.toLowerCase()] || [];
             const hasLive = vParties.some(p => { const gt = new Date(p.gameTime); return gt <= now && gt >= new Date(now.getTime() - 4*60*60*1000); });
             return (
             <Marker key={v.id} position={[parseFloat(v.latitude), parseFloat(v.longitude)]}
               icon={L.divIcon({ className: 'leaflet-custom-marker', html: `<div style="background:${hasLive ? '#E53935' : vParties.length > 0 ? '#1565C0' : '#455A64'};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);cursor:pointer">${hasLive ? '🔴' : vParties.length > 0 ? '🍺' : '📍'}</div>`, iconSize: [36, 36], iconAnchor: [18, 18] })}>
               <Popup><div className="text-center"><strong>{v.name}</strong><br/><span style={{ fontSize: '11px', color: '#aaa' }}>{v.type || 'Sports Bar'}</span><br/>{vParties.length > 0 && <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 'bold' }}>{vParties.length} {vParties.length === 1 ? 'party' : 'parties'}</span>}<br/><button onClick={() => { setSelectedVenueId(v.id); setCurrentScreen('venueDetail'); }} style={{ background: '#1E90FF', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', marginTop: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>View Venue</button></div></Popup>
             </Marker>
           );})}
         </MapContainer>
       </div>
       <div style={{ position: 'absolute', top: '8px', left: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
         <button onClick={() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(pos => { const lat = pos.coords.latitude; const lng = pos.coords.longitude; fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`).then(r => r.json()).then(d => { const city = d.address?.city || d.address?.town || d.address?.village || 'Your Location'; setCurrentCity(`${city}, ${d.address?.state || ''}`); }).catch(() => setCurrentCity('Your Location')); }, () => { alert('Please enable location access to use Near Me'); }); } else { alert('Location is not supported by your browser'); } }} className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-white text-xs shadow-lg" style={{ background: 'linear-gradient(135deg, #1E90FF, #1873cc)', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
           <Navigation className="w-3.5 h-3.5" /> Near Me
         </button>
         <button onClick={() => setLocationDropdownOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-white text-xs shadow-lg" style={{ background: '#1a1d28', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
           <MapPin className="w-3.5 h-3.5" /> {currentCity || 'Enter City'}
         </button>
       </div>
       <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '55%', zIndex: 5, display: 'flex', flexDirection: 'column', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', background: '#0F1115', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}>
         <div style={{ padding: '8px 0 2px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
           <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
         </div>
         <div className="px-3 pb-2 pt-1" style={{ flexShrink: 0 }}>
           <div className="text-center mb-1.5">
             <span className="text-xs font-black" style={{ color: '#FFD700', letterSpacing: '1px' }}>THE BEST PLACE TO WATCH THE GAME!</span>
           </div>
           <div className="flex items-center justify-between">
             <span className="text-white font-black text-sm">{vList.length} Venues</span>
             <span className="text-[#A0A4AB] text-[11px]">{currentCity || 'All Locations'}</span>
           </div>
         </div>
         <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
           {vList.length === 0 ? (
             <div className="text-center py-10 px-6">
               <div className="text-5xl mb-3">🏟️</div>
               <h3 className="text-white font-bold text-lg mb-2">No Venues Yet</h3>
               <p className="text-[#A0A4AB] text-sm mb-4">Be the first venue to join Huddle Up in your area!</p>
               <button onClick={() => setCurrentScreen('signup')} className="px-5 py-2.5 bg-[#1E90FF] text-white font-bold rounded-xl text-sm">Register Your Venue</button>
             </div>
           ) : (
           <div className="space-y-1.5 px-3">
             {vList.map(v => {
               const vParties = venuePartyLookup[v.name?.toLowerCase()] || [];
               const nextParty = vParties.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime))[0];
               return (
               <div key={v.id} onClick={() => { setSelectedVenueId(v.id); setCurrentScreen('venueDetail'); }} className="bg-[#151A22] rounded-xl border border-[#222A36] overflow-hidden cursor-pointer active:scale-[0.99]">
                 <div className="flex items-center p-2.5">
                   <div className="w-14 h-14 rounded-lg overflow-hidden mr-2.5 flex-shrink-0 bg-[#0F1115] flex items-center justify-center">
                     {v.imageUrl ? <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6 text-[#A0A4AB]" />}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-1">
                       <h3 className="text-white font-bold text-[13px] truncate">{v.name}</h3>
                       {v.featured && <span className="text-amber-400 text-[11px]">⭐</span>}
                     </div>
                     <p className="text-[#A0A4AB] text-[11px] truncate">{v.type || 'Sports Bar'} • {v.address}</p>
                     <div className="mt-0.5">{renderStars(v.avg_rating || v.rating || 0)}</div>
                   </div>
                   <div className="ml-2 flex-shrink-0">{getCatIcon(v.type)}</div>
                 </div>
                 {nextParty && (
                   <div className="border-t border-[#222A36] px-2.5 py-2 flex items-center gap-2" style={{ background: 'rgba(30,144,255,0.05)' }}>
                     <span className="text-lg flex-shrink-0">{fvSportIcons[nextParty.sport] || '🏟️'}</span>
                     <div className="flex-1 min-w-0">
                       <div className="text-white text-[12px] font-bold truncate">{nextParty.homeTeam && nextParty.awayTeam ? `${nextParty.awayTeam} vs ${nextParty.homeTeam}` : nextParty.title || 'Watch Party'}</div>
                       <div className="text-[#A0A4AB] text-[11px]">{new Date(nextParty.gameTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(nextParty.gameTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                     </div>
                     <div className="flex items-center gap-1 flex-shrink-0">
                       {(() => { const gt = new Date(nextParty.gameTime); const isLive = gt <= now && gt >= new Date(now.getTime() - 4*60*60*1000); return isLive ? <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">LIVE</span> : null; })()}
                     </div>
                   </div>
                 )}
                 {vParties.length > 1 && (
                   <div className="px-2.5 py-1 border-t border-[#222A36]">
                     <span className="text-[#1E90FF] text-[11px] font-bold">+{vParties.length - 1} more {vParties.length - 1 === 1 ? 'party' : 'parties'}</span>
                   </div>
                 )}
               </div>
             );})
             }
           </div>
           )}
         </div>
       </div>
     </div>
   );
 })()}
 {currentScreen === 'inviteFriends' && renderInviteFriendsScreen()}

{user && !['welcome', 'login', 'signup', 'signupType', 'forgotPassword', 'dmChat', 'partyChat', 'gameDetail'].includes(currentScreen) && !(currentScreen === 'teamChats' && teamChatSelectedRoom) && (
<div className="fixed bottom-0 left-0 right-0 z-[50] bg-[#151A22] border-t border-[#222A36]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
<div className="grid grid-cols-5 py-1.5 max-w-lg mx-auto">
<button onClick={() => { setCurrentScreen('games'); window.scrollTo(0,0); }} className={`flex flex-col items-center gap-1 py-1 transition-colors ${currentScreen === 'games' ? 'text-[#1E90FF]' : 'text-white/50'}`}>
<Home className="w-6 h-6" /><span className="text-[11px] font-bold">Home</span>
</button>
<button onClick={() => { setCurrentScreen('browseParties'); window.scrollTo(0,0); }} className={`flex flex-col items-center gap-1 py-1 transition-colors ${currentScreen === 'browseParties' ? 'text-[#1E90FF]' : 'text-white/50'}`}>
<Search className="w-6 h-6" /><span className="text-[11px] font-bold">Browse</span>
</button>
<button onClick={() => { setCurrentScreen('myCrew'); window.scrollTo(0,0); }} className={`flex flex-col items-center gap-1 py-1 transition-colors relative ${currentScreen === 'myCrew' ? 'text-[#1E90FF]' : 'text-white/50'}`}>
<Users className="w-6 h-6" /><span className="text-[11px] font-bold">Crew</span>
{(friendRequests.length + dmUnreadCount) > 0 && <span className="absolute top-0 right-[20%] bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{friendRequests.length + dmUnreadCount}</span>}
</button>
<button onClick={() => { setCurrentScreen('rewards'); window.scrollTo(0,0); }} className={`flex flex-col items-center gap-1 py-1 transition-colors ${currentScreen === 'rewards' ? 'text-[#1E90FF]' : 'text-white/50'}`}>
<Gift className="w-6 h-6" /><span className="text-[11px] font-bold">Rewards</span>
</button>
<button onClick={() => { setCurrentScreen('profile'); window.scrollTo(0,0); }} className={`flex flex-col items-center gap-1 py-1 transition-colors relative ${currentScreen === 'profile' ? 'text-[#1E90FF]' : 'text-white/50'}`}>
<User className="w-6 h-6" /><span className="text-[11px] font-bold">Me</span>
{totalAlerts > 0 && <span className="absolute top-0 right-[20%] bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{totalAlerts}</span>}
</button>
</div>
</div>
)}

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

 {showPrelaunchModal && (
 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowPrelaunchModal(false); }}>
 <div className="bg-[#0F1115] rounded-3xl max-w-md w-full border-2 border-amber-500/40 overflow-hidden shadow-2xl shadow-amber-500/10" onMouseDown={e => e.stopPropagation()}>
 <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-6 text-center relative overflow-hidden">
 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 80%, white 1px, transparent 1px)', backgroundSize: '60px 60px, 80px 80px, 40px 40px' }} />
 <div className="relative">
 <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
 <img src="/huddle-up-shield.png" alt="Huddle Up" className="h-12 drop-shadow-lg" />
 </div>
 <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">
 Early Access
 </div>
 <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
 WELCOME TO HUDDLE UP!
 </h2>
 <p className="text-white/80 text-sm">The ultimate watch party platform</p>
 </div>
 </div>
 <div className="p-6 space-y-4">
 <div className="bg-[#1E90FF]/10 border border-[#1E90FF]/30 rounded-xl p-4 text-center">
 <p className="text-[#1E90FF] font-black text-sm mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>SHARE THE APP</p>
 <p className="text-white/70 text-xs leading-relaxed">Share with your friends, create a watch party, and <span className="text-[#1E90FF] font-bold">earn points</span> for every friend that joins!</p>
 </div>
 <div className="space-y-2">
 <button
 onClick={() => { setShowPrelaunchModal(false); setCurrentScreen(user?.user_type === 'venue' ? 'venueDashboard' : 'profile'); }}
 className="w-full flex items-start gap-3 p-3 bg-[#151A22] rounded-xl border border-[#222A36] hover:border-[#1E90FF]/40 transition-colors text-left"
 >
 <div className="w-8 h-8 bg-[#1E90FF]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
 <User className="w-4 h-4 text-[#1E90FF]" />
 </div>
 <div>
 <p className="text-white font-bold text-sm">{user?.user_type === 'venue' ? 'Set Up Your Venue' : 'Complete Your Profile'}</p>
 <p className="text-white/50 text-xs">{user?.user_type === 'venue' ? 'Add your logo, photos, and details so fans can find you' : 'Add your photo, favorite teams, and bio to connect with fans'}</p>
 </div>
 </button>
 <button
 onClick={() => { setShowPrelaunchModal(false); setCurrentScreen('inviteFriends'); }}
 className="w-full flex items-start gap-3 p-3 bg-[#151A22] rounded-xl border border-[#222A36] hover:border-emerald-500/40 transition-colors text-left"
 >
 <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
 <Users className="w-4 h-4 text-emerald-400" />
 </div>
 <div>
 <p className="text-white font-bold text-sm">Invite Your Crew</p>
 <p className="text-white/50 text-xs">Share with friends & earn 100 points per referral</p>
 </div>
 </button>
 <button
 onClick={() => { setShowPrelaunchModal(false); setCurrentScreen('createParty'); }}
 className="w-full flex items-start gap-3 p-3 bg-[#151A22] rounded-xl border border-[#222A36] hover:border-purple-500/40 transition-colors text-left"
 >
 <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
 <Plus className="w-4 h-4 text-purple-400" />
 </div>
 <div>
 <p className="text-white font-bold text-sm">Create a Watch Party</p>
 <p className="text-white/50 text-xs">Host a party, invite fans, and earn points</p>
 </div>
 </button>
 </div>
 <button
 onClick={() => { setShowPrelaunchModal(false); setCurrentScreen('profile'); }}
 className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}
 >
 {user?.user_type === 'venue' ? 'SET UP MY VENUE' : 'SET UP MY PROFILE'}
 </button>
 <button
 onClick={() => setShowPrelaunchModal(false)}
 className="w-full py-2 text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
 >
 I'll do this later
 </button>
 </div>
 </div>
 </div>
 )}

 {qrScannerOpen && (
 <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col">
 <div className="flex items-center justify-between p-4 bg-[#0F1115] border-b border-[#222A36]">
 <h3 className="text-white font-bold text-lg flex items-center gap-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 <ScanLine className="w-5 h-5 text-yellow-400" /> SCAN QR CODE
 </h3>
 <button onClick={closeQrScanner} className="p-2 rounded-xl hover:bg-[#222A36] transition-colors">
 <X className="w-6 h-6 text-white" />
 </button>
 </div>
 <div className="flex-1 flex flex-col items-center justify-center px-4">
 {qrScanStatus?.type === 'success' ? (
 <div className="text-center">
 <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
 <CheckCircle className="w-10 h-10 text-green-400" />
 </div>
 <p className="text-green-300 text-lg font-bold">{qrScanStatus.message}</p>
 </div>
 ) : qrScanStatus?.type === 'error' ? (
 <div className="text-center mb-4">
 <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
 <X className="w-8 h-8 text-red-400" />
 </div>
 <p className="text-red-300 text-sm font-semibold">{qrScanStatus.message}</p>
 <p className="text-white/50 text-xs mt-2">Retrying...</p>
 </div>
 ) : qrScanStatus?.type === 'loading' ? (
 <div className="text-center">
 <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mx-auto mb-3" />
 <p className="text-white text-sm font-semibold">Verifying check-in...</p>
 </div>
 ) : (
 <>
 <div id="qr-reader" className="w-full max-w-sm rounded-xl overflow-hidden" />
 <p className="text-white/60 text-sm text-center mt-4 px-4">Point your camera at the QR code displayed at the venue entrance or bar</p>
 <p className="text-yellow-400/80 text-xs text-center mt-2 font-semibold">Ask the bartender or host for the check-in QR code</p>
 </>
 )}
 </div>
 <QrScannerInit
 isOpen={qrScannerOpen && !qrScanStatus}
 onResult={handleQrScanResult}
 scannerRef={qrScannerRef}
 onError={(msg) => setQrScanStatus({ type: 'error', message: msg })}
 />
 </div>
 )}

 <InviteReminderPopup />

 {showQA && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowQA(false); }}>
 <div className="bg-[#0F1115] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#222A36] overscroll-contain" onMouseDown={e => e.stopPropagation()}>
 <div className="sticky top-0 bg-[#0F1115] p-4 border-b border-[#222A36] flex items-center justify-between z-10">
 <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Q & A</h2>
 <button onClick={() => setShowQA(false)} className="text-[#A0A4AB] hover:text-white"><X className="w-5 h-5" /></button>
 </div>
 <div className="p-4">
 <QAScreen />
 </div>
 </div>
 </div>
 )}

 {editPartyModal && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditPartyModal(null); }}>
 <div className="bg-[#151A22] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#222A36] overscroll-contain" onMouseDown={e => e.stopPropagation()}>
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EDIT PARTY</h3>
 <button onClick={() => setEditPartyModal(null)} className="text-[#A0A4AB] hover:text-white"><X className="w-5 h-5" /></button>
 </div>
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Location Name</label>
 <input
 type="text"
 value={editPartyForm.venueName}
 onChange={e => setEditPartyForm({...editPartyForm, venueName: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., Buffalo Wild Wings, My house"
 />
 </div>

 <div className="bg-[#151A22] border border-[#222A36] rounded-xl p-4 space-y-3">
 <div className="text-sm font-bold text-[#1E90FF] mb-1 flex items-center gap-2">
 <MapPin className="w-4 h-4" /> Address Details
 </div>
 <div>
 <label className="block text-xs font-medium text-[#A0A4AB] mb-1">Street Address</label>
 <input
 type="text"
 value={editPartyForm.streetAddress}
 onChange={e => setEditPartyForm({...editPartyForm, streetAddress: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., 123 Main St"
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-[#A0A4AB] mb-1">City</label>
 <input
 type="text"
 value={editPartyForm.city}
 onChange={e => setEditPartyForm({...editPartyForm, city: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., Austin"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-[#A0A4AB] mb-1">State</label>
 <select
 value={editPartyForm.state}
 onChange={e => setEditPartyForm({...editPartyForm, state: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 >
 <option value="">Select state</option>
 {US_STATES.map(st => (
 <option key={st} value={st}>{st} - {US_STATE_NAMES[st]}</option>
 ))}
 </select>
 </div>
 </div>
 {editPartyForm.streetAddress && editPartyForm.city && (
 <div className="text-xs text-[#A0A4AB]/70 bg-[#151A22] rounded-lg p-2 mt-1">
 Full address: {[editPartyForm.streetAddress, editPartyForm.city, editPartyForm.state].filter(Boolean).join(', ')}
 </div>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Time</label>
 <input
 type="text"
 value={editPartyForm.gameTime}
 onChange={e => setEditPartyForm({...editPartyForm, gameTime: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="e.g., Meet at 5:30 PM"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Capacity</label>
 <input
 type="number"
 value={editPartyForm.maxSize}
 onChange={e => setEditPartyForm({...editPartyForm, maxSize: e.target.value})}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="Max number of people"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[#A0A4AB] mb-2">Notes / Description</label>
 <textarea
 value={editPartyForm.notes}
 onChange={e => setEditPartyForm({...editPartyForm, notes: e.target.value})}
 rows={3}
 className="w-full px-4 py-3 bg-[#151A22] border border-[#222A36] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
 placeholder="Any additional details..."
 />
 </div>
 </div>
 <div className="flex gap-3 mt-6">
 <button
 onClick={() => setEditPartyModal(null)}
 className="flex-1 py-3 bg-[#151A22] text-white rounded-xl font-bold hover:bg-[#222A36] transition-all"
 >
 Cancel
 </button>
 <button
 onClick={handleSaveEditParty}
 disabled={editPartySaving}
 className={`flex-1 py-3 rounded-xl font-bold transition-all ${
 editPartySaving
 ? 'bg-gray-600 text-[#A0A4AB] cursor-not-allowed'
 : 'bg-[#1E90FF] text-white hover:shadow-[#1E90FF]/10 '
 }`}
 >
 {editPartySaving ? 'Saving...' : 'Save Changes'}
 </button>
 </div>
 </div>
 </div>
 )}

 {showCalendarMenu && calendarParty && (() => {
 const urls = getCalendarUrls(calendarParty);
 return (
<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowCalendarMenu(false)}>
<div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#222A36] p-6 space-y-4 animate-fade-in" style={{ backgroundColor: '#151A22' }} onClick={e => e.stopPropagation()}>
<div className="flex items-center justify-between mb-2">
<h3 className="text-xl font-bold text-white">Add to Calendar</h3>
<button onClick={() => setShowCalendarMenu(false)} className="p-2 rounded-full hover:bg-[#222A36] transition-colors"><X className="w-5 h-5 text-[#A0A4AB]" /></button>
</div>
<div className="bg-[#0F1115] rounded-xl p-4 border border-[#222A36]">
<p className="text-white font-bold text-sm">{calendarParty.hostName}'s Party</p>
<p className="text-[#A0A4AB] text-xs mt-1">{calendarParty.venueName || calendarParty.location}</p>
<p className="text-[#A0A4AB] text-xs mt-1">{calendarParty.homeTeam} vs {calendarParty.awayTeam}</p>
</div>
<div className="space-y-3">
<button onClick={async () => { try { const resp = await fetch(urls.ics); const blob = await resp.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `huddle-up-party.ics`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); setShowCalendarMenu(false); } catch(e) { window.open(urls.ics, '_blank'); } }} className="flex items-center gap-3 w-full py-3 px-4 rounded-xl font-bold text-white transition-all hover:opacity-90 bg-gradient-to-r from-gray-600 to-gray-700 border border-gray-500/30">
<span className="text-2xl">📅</span>
<div className="text-left">
<div className="text-sm font-bold">Apple Calendar / iCal</div>
<div className="text-xs text-gray-300">Download .ics file</div>
</div>
<Download className="w-5 h-5 ml-auto text-gray-300" />
</button>
<a href={urls.google} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full py-3 px-4 rounded-xl font-bold text-white transition-all hover:opacity-90 border border-[#222A36]" style={{ backgroundColor: '#1a73e8' }}>
<span className="text-2xl">📆</span>
<div className="text-left">
<div className="text-sm font-bold">Google Calendar</div>
<div className="text-xs text-blue-200">Opens in new tab</div>
</div>
<ChevronRight className="w-5 h-5 ml-auto text-blue-200" />
</a>
<a href={urls.outlook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full py-3 px-4 rounded-xl font-bold text-white transition-all hover:opacity-90 border border-[#222A36]" style={{ backgroundColor: '#0078d4' }}>
<span className="text-2xl">📧</span>
<div className="text-left">
<div className="text-sm font-bold">Outlook Calendar</div>
<div className="text-xs text-blue-200">Opens in new tab</div>
</div>
<ChevronRight className="w-5 h-5 ml-auto text-blue-200" />
</a>
<a href={urls.yahoo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full py-3 px-4 rounded-xl font-bold text-white transition-all hover:opacity-90 border border-[#222A36]" style={{ backgroundColor: '#720e9e' }}>
<span className="text-2xl">📅</span>
<div className="text-left">
<div className="text-sm font-bold">Yahoo Calendar</div>
<div className="text-xs text-purple-200">Opens in new tab</div>
</div>
<ChevronRight className="w-5 h-5 ml-auto text-purple-200" />
</a>
</div>
</div>
</div>
 );
 })()}

 {showShareMenu && shareParty && (
<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowShareMenu(false)}>
<div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#222A36] p-6 space-y-4 animate-fade-in" style={{ backgroundColor: '#151A22' }} onClick={e => e.stopPropagation()}>
<div className="flex items-center justify-between mb-2">
<h3 className="text-xl font-bold text-white">Share Party</h3>
<button onClick={() => setShowShareMenu(false)} className="p-2 rounded-full hover:bg-[#222A36] transition-colors"><X className="w-5 h-5 text-[#A0A4AB]" /></button>
</div>
<div className="bg-[#0F1115] rounded-xl p-4 border border-[#222A36]">
<p className="text-white font-bold text-sm">{shareParty.hostName}'s Party</p>
<p className="text-[#A0A4AB] text-xs mt-1">{shareParty.venueName || shareParty.location}</p>
</div>
<div className="grid grid-cols-2 gap-3">
{typeof navigator !== 'undefined' && navigator.share && (
<button onClick={() => shareToSocial(shareParty, 'native')} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#1E90FF' }}>
<Share2 className="w-5 h-5" /> Share
</button>
)}
<button onClick={() => shareToSocial(shareParty, 'twitter')} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#1DA1F2' }}>
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X
</button>
<button onClick={() => shareToSocial(shareParty, 'facebook')} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#1877F2' }}>
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
</button>
<button onClick={() => shareToSocial(shareParty, 'whatsapp')} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#25D366' }}>
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp
</button>
<button onClick={() => shareToSocial(shareParty, 'sms')} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#34C759' }}>
<MessageCircle className="w-5 h-5" /> Text
</button>
<button onClick={() => shareToSocial(shareParty, 'instagram')} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> Instagram
</button>
</div>
<button onClick={() => copyPartyLink(shareParty)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border border-[#222A36] hover:bg-[#222A36]" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: linkCopied ? '#10b981' : '#A0A4AB' }}>
{linkCopied ? <><Check className="w-5 h-5" /> Link Copied!</> : <><Copy className="w-5 h-5" /> Copy Link</>}
</button>
</div>
</div>
)}

{dmPopup && (
 <div
   onClick={() => {
     setDmPopup(null);
     const friend = friendsList.find(f => f.id === dmPopup.senderId);
     if (friend) openDmChat(friend);
     else openDmChat({ id: dmPopup.senderId, name: dmPopup.senderName, profilePicture: dmPopup.senderPicture });
   }}
   className="fixed top-16 left-1/2 z-[70] bg-[#1E90FF] text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-3 cursor-pointer max-w-sm w-[90%]"
   style={{ animation: 'fadeInSlideDown 0.3s ease-out forwards' }}
 >
   <div className="flex-shrink-0">
     <ProfileAvatar src={dmPopup.senderPicture} name={dmPopup.senderName} size="sm" />
   </div>
   <div className="flex-1 min-w-0">
     <div className="font-bold text-sm">{dmPopup.senderName}</div>
     <p className="text-xs text-white/80 truncate">{dmPopup.message}</p>
   </div>
   <MessageCircle className="w-5 h-5 text-white/60 flex-shrink-0" />
 </div>
)}

{showShareToast && (
 <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-sm flex items-center gap-2 animate-fade-in">
 <Check className="w-5 h-5" /> Link copied to clipboard!
 </div>
 )}

 {showSignupShare && (
 <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-[#151A22] rounded-3xl border border-[#222A36] p-8 max-w-md w-full text-center space-y-5 animate-fade-in">
 <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-sm shadow-orange-500/30">
 <Trophy className="w-10 h-10 text-white" />
 </div>
 <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
 WELCOME TO HUDDLE UP!
 </h2>
 <p className="text-[#A0A4AB] text-lg">
 Watch parties are better with friends!
 </p>
 <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl p-4 space-y-3">
 <p className="text-white font-bold text-sm">Earn badge points and level up!</p>
 <div className="flex justify-around text-center">
 <div>
 <div className="text-2xl">🎉</div>
 <div className="text-xs text-[#A0A4AB] mt-1">Join parties</div>
 </div>
 <div>
 <div className="text-2xl">📣</div>
 <div className="text-xs text-[#A0A4AB] mt-1">Host parties</div>
 </div>
 <div>
 <div className="text-2xl">👥</div>
 <div className="text-xs text-[#A0A4AB] mt-1">Invite friends</div>
 </div>
 </div>
 <p className="text-[#1E90FF] text-xs">New Fan → Rookie → Starter → All-Star → MVP → Legend</p>
 </div>
 <button
 onClick={() => { shareApp(); setShowSignupShare(false); }}
 className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-xl hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
 >
 <Share2 className="w-5 h-5" /> Share with Friends
 </button>
 <button
 onClick={() => setShowSignupShare(false)}
 className="w-full py-3 bg-[#151A22] text-[#A0A4AB] font-semibold rounded-xl hover:bg-[#222A36] transition-all"
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
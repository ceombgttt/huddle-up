# Huddle Up - Find Watch Parties

## Overview
A React-based web application for finding and organizing watch parties. Users can discover venues, join parties, and connect with other sports fans.

## Tech Stack
- **Frontend**: React 18 + Vite 4
- **Styling**: Tailwind CSS 3 + custom CSS
- **Icons**: Lucide React
- **Build**: Vite

## Project Structure
```
/
├── index.html          # HTML entry point
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles + Tailwind imports
├── vite.config.js      # Vite configuration (port 5000, all hosts allowed)
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── package.json        # Dependencies and scripts
```

## Running
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build`

## Deployment
- Static deployment from `dist/` directory after build

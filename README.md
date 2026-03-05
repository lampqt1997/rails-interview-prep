
# rails-interview-prep

A small web utility for preparing Rails interview questions and snippets. The project serves a simple UI from the `public/` folder and is backed by a minimal Node.js server for local development. Bootstrap is included for a more polished frontend.

## Features
- Simple static UI served from `public/`
- Bootstrap-enhanced frontend
- Minimal Node.js server (server.js) for local testing

## Tech stack
- Node.js (server)
- Express (or simple Node static server; see server.js)
- HTML/CSS/JS (public/)
- Bootstrap (via CDN)

## Prerequisites
- Node.js v14+ and npm installed
- Git (optional, for cloning)

## Install & run locally

1. Clone the repository (if applicable)
   - git clone <repo-url>
   - cd rails-interview-prep

2. Install dependencies (if package.json exists)
   - npm install

3. Run the server
   - If the project defines a start script:
     - npm start
   - Or run directly with Node:
     - node server.js

4. Open the app in your browser:
   - http://localhost:3000
   - To use a different port:
     - PORT=4000 node server.js
     - (Or set the PORT environment variable before starting.)

## Project layout
- server.js          — Node server that serves the app
- public/index.html  — Main frontend page (Bootstrap included)
- public/*           — Other static assets

## Notes
- The server serves files from `public/` and also contains an embedded HTML fallback in `server.js`.
- Bootstrap is loaded via CDN in the HTML, so an internet connection is required for styles.

## Contributing
- Open an issue or send a pull request with improvements.
- Keep changes small and focused; update README with any new setup steps.

## License
- Check repository root for a LICENSE file or add one (MIT recommended).

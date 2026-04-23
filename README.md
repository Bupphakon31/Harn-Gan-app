# Harn-Gan

Harn-Gan is a web app for splitting bills fairly. It supports both item-based splitting and even splitting, along with payment settlement flows for one payer or multiple payers.

## Features

- Item-based split by food/drink entry
- Even split for a total bill
- Service charge, VAT, shipping fee, and discount support
- Late joiner handling from item eater lists
- Free people redistribution
- Single payer settlement
- Multi-payer settlement

## Tech Stack

- Node.js
- Express
- Vanilla HTML, CSS, and JavaScript

## Project Structure

```text
.
|- public/
|  |- css/style.css
|  |- js/app.js
|  `- index.html
|- utilities/
|  `- calculations.js
|- server.js
|- prototype.js
`- package.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npm start
```

### 3. Open in browser

```text
http://localhost:3000
```

## Scripts

- `npm start` - start the Express server
- `npm run dev` - run the same local server entry

## Notes

- `server.js` is the active web entry point.
- `utilities/calculations.js` contains the shared bill calculation logic used by the API.
- `prototype.js` is the earlier CLI version and is kept as a reference.

## Roadmap Ideas

- Export result summary
- Edit/delete friend and item entries in a more advanced way
- Persistent history or saved sessions
- Better UTF-8 cleanup for Thai copy across older files

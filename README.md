# igdb-wrapper

A powerful and easy-to-use TypeScript wrapper for The Internet Games Database (IGDB) API.

## Installation

You can install this package using any of the following package managers:

### npm
```bash
npm install @tdanks2000/igdb-wrapper
```

### pnpm
```bash
pnpm add @tdanks2000/igdb-wrapper
```

### Yarn
```bash
yarn add @tdanks2000/igdb-wrapper
```

### Bun
```bash
bun add @tdanks2000/igdb-wrapper
```

## Development

To install development dependencies:

```bash
bun install
```

To run the development version:

```bash
bun run src/index.ts
```

## Usage

```typescript
import { IGDBWrapper } from '@tdanks2000/igdb-wrapper';

// Initialize the wrapper with your IGDB API credentials
const igdb = new IGDBWrapper({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// Example: Search for games
const games = await igdb.games.search('The Witcher 3');
```

## License

MIT

# ❤️

<p align="center">
<a target="_blank" href="https://tdanks.com/mental-health/quote">
❤️ Reminder that <strong><i>you are great, you are enough, and your presence is valued.</i></strong> If you are struggling with your mental health, please reach out to someone you love and consult a professional. You are not alone. ❤️
</a>
</p>


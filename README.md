# IGDB Wrapper

Hey there! This is the **IGDB Wrapper**, your new best friend for talking to The Internet Games Database (IGDB) API in TypeScript. We built it to be super powerful and *really* smart about types, making your life a whole lot easier.

## ✨ Why You'll Love It

*   **Type-Safe Queries, Always**: Forget about pesky runtime errors. We'll catch your field name mistakes and query structure hiccups *before* you even hit run. It's validation at compile-time, so you can build with confidence.
*   **Seriously Smart Typing**: This isn't just basic TypeScript support. We're talking full generics and conditional types that intelligently figure out the data types based on the fields you actually request.
*   **Fluent Query Builder**: Craft complex IGDB queries like you're writing a sentence. Our API lets you chain methods elegantly, making your code readable and your queries powerful.
*   **Blazing Fast Performance**: Only grab the data you truly need. Our optimization helps you keep your requests lean and your app snappy.
*   **Zero Error Worries**: Because we catch errors at compile time, you spend less time debugging and more time building awesome stuff.
*   **Auto Token Management**: OAuth tokens can be a pain, right? We handle refreshing them automatically so you don't have to lift a finger.
*   **Everything Covered**: Games, Genres, Companies, Platforms, and more. We've got comprehensive support for all the core IGDB entities.

## 📦 Get Started

Picking it up is easy:

```bash
# npm
npm install @tdanks2000/igdb-wrapper

# pnpm
pnpm add @tdanks2000/igdb-wrapper

# yarn
yarn add @tdanks2000/igdb-wrapper

# bun
bun add @tdanks2000/igdb-wrapper
```

## 🚀 Quick Launch

Here’s how you get up and running:

```typescript
import { IGDB } from '@tdanks2000/igdb-wrapper';

// Initialize with your IGDB API credentials
const igdb = new IGDB({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// Simple search
const games = await igdb.games.search('The Witcher 3');
```

## 🎯 Diving Deeper

### The Query Builder Pattern

Our query builder is where the real magic happens. It's a super fluent and type-safe way to build those tricky IGDB queries:

```typescript
import { IGDB, IGDBQueryFactory } from '@tdanks2000/igdb-wrapper';

const igdb = new IGDB({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// Build complex queries with full type safety
const popularActionGames = IGDBQueryFactory.games()
  .select('id', 'name', 'rating', 'cover.*', 'genres.*')
  .excludeDefaults()
  .byGenre(12) // Action genre
  .byRating(80)
  .sortBy('rating', 'desc')
  .limit(10);

// Execute the query
const games = await igdb.games.getGames({
  fields: popularActionGames.getOptions().fields as string[],
  where: popularActionGames.getOptions().where,
  sort: popularActionGames.getOptions().sort as string,
  limit: popularActionGames.getOptions().limit,
  includeDefaultFields: false,
});
```

### Handy Specialized Query Methods

Every entity type has special methods for the stuff you do all the time:

```typescript
// Games
const gameQuery = IGDBQueryFactory.games()
  .byGenre(12)           // Filter by genre
  .byPlatform(48)        // Filter by platform
  .byRating(80, 95)      // Rating range
  .byReleaseDate(1640995200) // After specific date
  .byCompany(123, 'developer') // Company involvement
  .popular()             // Popular games
  .recent(30)            // Recent games (last 30 days)
  .upcoming();           // Upcoming games

// Companies
const companyQuery = IGDBQueryFactory.companies()
  .byCountry(840)        // US companies
  .developers()          // Developer companies
  .publishers()          // Publisher companies
  .searchByName('Nintendo');

// Genres
const genreQuery = IGDBQueryFactory.genres()
  .byName('Action')
  .searchByName('RPG');

// Platforms
const platformQuery = IGDBQueryFactory.platforms()
  .byCategory(1)         // Console category
  .byGeneration(8)       // 8th generation
  .searchByName('PlayStation');
```

### Smart Field-Based Typing

Just ask for what you need for optimal performance:

```typescript
// Minimal fields for list views
const gameList = await igdb.games.getGames({
  fields: ['id', 'name', 'cover.image_id'],
  includeDefaultFields: false,
  limit: 20,
});

// Detailed fields for single item views
const gameDetail = await igdb.games.getGame(1942, {
  fields: [
    'id', 'name', 'summary', 'storyline', 'rating',
    'cover.*', 'screenshots.*', 'genres.*', 'platforms.*'
  ],
  includeDefaultFields: false,
});
```

### Building Really Complex Queries

You can chain tons of conditions and sorting options:

```typescript
const complexQuery = IGDBQueryFactory.games()
  .select('id', 'name', 'rating', 'cover.*')
  .excludeDefaults()
  .whereAnd(
    'rating >= 80',
    'first_release_date >= 1640995200', // After 2022-01-01
    'genres = 12' // RPG genre
  )
  .whereOr(
    'platforms = 48', // PlayStation 5
    'platforms = 49'  // Xbox Series X
  )
  .sortByMultiple(
    { field: 'rating', direction: 'desc' },
    { field: 'first_release_date', direction: 'desc' }
  )
  .limit(10)
  .offset(20);
```

## 📚 API Overview

### Core Classes

#### `IGDB`
This is your main client for talking to the IGDB API.

```typescript
const igdb = new IGDB({
  clientId: string,
  clientSecret: string
});
```

#### `IGDBQueryFactory`
Your starting point for creating type-safe query builders.

```typescript
// Here's what you can build queries for:
IGDBQueryFactory.games()      // GameQueryBuilder
IGDBQueryFactory.genres()     // GenreQueryBuilder
IGDBQueryFactory.companies()  // CompanyQueryBuilder
IGDBQueryFactory.platforms()  // PlatformQueryBuilder
```

### Route Classes

#### `IGDBGamesRoute`
```typescript
// Get all games
await igdb.games.getGames(options);

// Get single game
await igdb.games.getGame(id, options);

// Search games
await igdb.games.searchGames(query, options);

// Get games by IDs
await igdb.games.getGamesByIds(ids, options);

// Specialized methods
await igdb.games.getPopularGames(options);
await igdb.games.getRecentGames(options);
await igdb.games.getUpcomingGames(options);
await igdb.games.getGamesByGenre(genreId, options);
await igdb.games.getGamesByPlatform(platformId, options);
```

#### `IGDBGenresRoute`
```typescript
await igdb.genres.getGenres(options);
await igdb.genres.getGenre(id, options);
await igdb.genres.getGenresByIds(ids, options);
await igdb.genres.getAllGenresSorted(options);
await igdb.genres.getGenreBySlug(slug, options);
```

#### `IGDBCompaniesRoute`
```typescript
await igdb.companies.getCompanies(options);
await igdb.companies.getCompany(id, options);
await igdb.companies.searchCompanies(query, options);
await igdb.companies.getCompaniesByIds(ids, options);
await igdb.companies.getAllCompaniesSorted(options);
await igdb.companies.getCompaniesByCountry(countryCode, options);
await igdb.companies.getDeveloperCompanies(options);
await igdb.companies.getPublisherCompanies(options);
```

### Query Builder Methods

#### Common Methods (Works for All Query Builders)
```typescript
.select(...fields)           // Add fields to select
.excludeDefaults()           // Exclude default fields
.includeDefaults()           // Include default fields (default)
.where(condition)            // Add WHERE condition
.whereAnd(...conditions)     // Add multiple AND conditions
.whereOr(...conditions)     // Add multiple OR conditions
.sortBy(field, direction)    // Sort by field
.sortByMultiple(...sorts)    // Sort by multiple fields
.limit(value)                // Set limit
.offset(value)               // Set offset
.search(term)                // Add search term
.build()                     // Build query string
.getOptions()                // Get query options object
.reset()                     // Reset query builder
```

#### Game-Specific Methods
```typescript
.byGenre(genreId)            // Filter by genre
.byPlatform(platformId)      // Filter by platform
.byRating(min, max?)         // Filter by rating range
.byReleaseDate(start, end?)  // Filter by release date
.byCompany(companyId, role)  // Filter by company involvement
.popular()                   // Get popular games
.recent(days)                // Get recent games
.upcoming()                  // Get upcoming games
```

## 🔧 Getting Your Dev Environment Ready

### Setup
```bash
# Install dependencies
bun install

# Run development version
bun run src/index.ts

# Run advanced typing example
bun run example-advanced-typing.ts

# Type checking
bun run tsc --noEmit

# Linting
bun run biome check .
```

### Environment Variables
```bash
# For API access, set these:
export TWITCH_CLIENT_ID='your-client-id'
export TWITCH_CLIENT_SECRET='your-client-secret'

# Or, if you leave these unset, it'll run in demo mode (no actual API calls)
```

## 🎯 Our Awesome Type Safety Features

### Field Validation
```typescript
// ✅ This totally works (compiles like a dream!)
.select('id', 'name', 'cover.*', 'genres.*')

// ❌ This will give you a TypeScript error (caught early!)
.select('invalid_field', 'name.*') // Error: 'invalid_field' not assignable
```

### Query Building
```typescript
// ✅ Building queries is completely type-safe
const query = IGDBQueryFactory.games()
  .select('id', 'name')
  .where('rating >= 80')
  .sortBy('name', 'asc'); // Only 'asc' or 'desc' allowed here!

// ❌ Type errors will jump out at compile time
.sortBy('name', 'invalid') // Error: 'invalid' not assignable
```

### Response Typing
```typescript
// Your responses are perfectly typed based on the entity you're querying!
const games: Game[] = await igdb.games.getGames();
const genres: Genre[] = await igdb.genres.getGenres();
const companies: Company[] = await igdb.companies.getCompanies();
```

## 🚀 Pro-Tips for Performance

1.  **Be Specific**: Use `select()` to ask for *only* the fields you absolutely need.
2.  **Strip Defaults**: If you want full control over your field selection, `excludeDefaults()` is your friend.
3.  **Keep it Small**: Always use `limit()` to avoid hauling in massive amounts of data.
4.  **Smart Caching**: If you fetch the same stuff a lot, cache it! Your app will thank you.
5.  **Batch It Up**: Need multiple items? `getByIds()` is way more efficient than calling for each one individually.

## 🤝 Want to Help Out?

Contributions are super welcome! Feel free to send over a Pull Request.

## 📄 License

MIT

---

# ❤️

<p align="center">
<a target="_blank" href="https://tdanks.com/mental-health/quote">
❤️ Quick reminder: <strong><i>you are great, you are enough, and we value your presence.</i></strong> If you're going through a tough time with your mental health, please reach out to someone you trust and consider talking to a professional. You're never alone. ❤️
</a>
</p>

# IGDB Wrapper

A powerful, type-safe TypeScript wrapper for The Internet Games Database (IGDB) API with advanced query building capabilities.

## ✨ Features

- 🎯 **Type-Safe Query Building** - Compile-time validation of field names and query structure
- 🔧 **Advanced Typing** - Full TypeScript support with generics and conditional types
- 🚀 **Query Builder Pattern** - Fluent API for constructing complex IGDB queries
- 📊 **Field-Based Typing** - Intelligent type inference based on requested fields
- ⚡ **Performance Optimized** - Request only the fields you need
- 🛡️ **Error Prevention** - Catch errors at compile time, not runtime
- 🔄 **Auto Token Management** - Automatic OAuth token refresh
- 📚 **Comprehensive Coverage** - Support for Games, Genres, Companies, Platforms, and more

## 📦 Installation

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

## 🚀 Quick Start

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

## 🎯 Advanced Usage

### Query Builder Pattern

The query builder provides a fluent, type-safe way to construct complex IGDB queries:

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

### Specialized Query Methods

Each entity type has specialized methods for common use cases:

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

### Field-Based Typing

Request only the fields you need for optimal performance:

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

### Complex Query Building

Chain multiple conditions and sorting options:

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

## 📚 API Reference

### Core Classes

#### `IGDB`
Main client class for interacting with the IGDB API.

```typescript
const igdb = new IGDB({
  clientId: string,
  clientSecret: string
});
```

#### `IGDBQueryFactory`
Factory for creating type-safe query builders.

```typescript
// Available query builders
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

#### Common Methods (All Query Builders)
```typescript
.select(...fields)           // Add fields to select
.excludeDefaults()           // Exclude default fields
.includeDefaults()           // Include default fields (default)
.where(condition)            // Add WHERE condition
.whereAnd(...conditions)     // Add multiple AND conditions
.whereOr(...conditions)      // Add multiple OR conditions
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

## 🔧 Development

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
# For API access
export TWITCH_CLIENT_ID='your-client-id'
export TWITCH_CLIENT_SECRET='your-client-secret'

# Or for demo mode (no API calls)
# Leave unset to run in demo mode
```

## 🎯 Type Safety Features

### Field Validation
```typescript
// ✅ Valid fields (compiles)
.select('id', 'name', 'cover.*', 'genres.*')

// ❌ Invalid fields (TypeScript error)
.select('invalid_field', 'name.*') // Error: 'invalid_field' not assignable
```

### Query Building
```typescript
// ✅ Type-safe query building
const query = IGDBQueryFactory.games()
  .select('id', 'name')
  .where('rating >= 80')
  .sortBy('name', 'asc'); // Only 'asc' | 'desc' allowed

// ❌ Type errors caught at compile time
.sortBy('name', 'invalid') // Error: 'invalid' not assignable
```

### Response Typing
```typescript
// Responses are properly typed based on the entity
const games: Game[] = await igdb.games.getGames();
const genres: Genre[] = await igdb.genres.getGenres();
const companies: Company[] = await igdb.companies.getCompanies();
```

## 🚀 Performance Tips

1. **Request Only Needed Fields**: Use `select()` to specify exactly which fields you need
2. **Use `excludeDefaults()`**: When you want complete control over field selection
3. **Limit Results**: Always use `limit()` to prevent large data transfers
4. **Cache Results**: Implement caching for frequently accessed data
5. **Batch Requests**: Use `getByIds()` for multiple items instead of individual calls

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

# ❤️

<p align="center">
<a target="_blank" href="https://tdanks.com/mental-health/quote">
❤️ Reminder that <strong><i>you are great, you are enough, and your presence is valued.</i></strong> If you are struggling with your mental health, please reach out to someone you love and consult a professional. You are not alone. ❤️
</a>
</p>


# Urban Explorer Backend

Backend services for Urban Explorer built with Supabase.

## Tech Stack

- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)
- **GIS**: PostGIS for geospatial queries

## Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Run migrations:
   ```bash
   supabase db reset
   ```

## Environment Variables

Copy to frontend `.env`:
```
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-anon-key>
```

## Database Schema

- `profiles` - User profiles
- `categories` - Location categories
- `locations` - Places to explore
- `reviews` - User reviews
- `favorites` - User favorites
- `badges` - Achievement badges
- `user_badges` - Unlocked badges
- `user_stats` - User statistics

## Getting Started

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run Edge Functions locally
supabase functions serve
```

## Documentation

See [urban-explorer-docs](https://github.com/ismaeldosil/urban-explorer-docs) for full documentation.

## Related Repositories

- [urban-explorer-frontend](https://github.com/ismaeldosil/urban-explorer-frontend) - Ionic mobile app
- [urban-explorer-docs](https://github.com/ismaeldosil/urban-explorer-docs) - Documentation (SSOT)

# Supabase Local Development

This directory contains the Supabase local development configuration, migrations, and seed files.

## Overview

The project uses Supabase for:
- Authentication (email/password, 2FA)
- PostgreSQL database
- Row Level Security (RLS)
- Role-Based Access Control (RBAC)

## Database Migrations

Migrations are located in `migrations/` and are automatically applied when running:

```bash
supabase db reset
```

### Available Migrations

- `20260115000001_create_roles_system.sql` - Creates RBAC tables, triggers, and JWT claim sync

To apply migrations manually:

```bash
supabase db push
```

## Database Seeds

### Seed File Structure

Seeds are organized in the `seed/` directory and run in alphabetical order:
- `01_roles.sql` - Creates role definitions (Guest, Contributor, Author, Editor, Admin, SuperAdmin)
- `02_users.sql` - Creates test user and assigns roles

### Test User Credentials

A test user is automatically created during database reset:
- **Email**: test@test.com
- **Password**: password
- **Name**: John Doe
- **Role**: SuperAdmin (level 100)

⚠️ **Important**: Change or remove this test user before deploying to production!

### Automatic Seeding

The seed files run **automatically** during database reset when `[db.seed]
enabled = true` in `config.toml`.

```bash
supabase db reset
```

This command will:
1. Drop all database objects
2. Run all migrations in order
3. **Automatically execute seed files** (01_roles.sql, then 02_users.sql) to populate initial data

### What the Seed Files Do

**01_roles.sql**:
1. Clears existing role data (TRUNCATE tables for idempotent seeding)
2. Creates 6 roles:
   - Guest (level 10) - Read-only access to backend
   - Contributor (level 30) - Submit content for review
   - Author (level 50) - Create and publish own content
   - Editor (level 70) - Manage all content and media
   - Admin (level 90) - User management and settings
   - SuperAdmin (level 100) - Full system access

**02_users.sql**:
1. Creates test user (test@test.com / password)
2. Sets user metadata (full_name: "John Doe")
3. Confirms email automatically (no verification needed)
4. Assigns SuperAdmin role
5. Syncs role to JWT claims

### Manual Seed Execution

If `[db.seed] enabled = false` in config.toml, you can manually run seeds:

**Option 1: Using Supabase CLI (runs all seed files in order)**
```bash
supabase db seed
```

**Option 2: Direct SQL execution (individual files)**
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed/01_roles.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed/02_users.sql
```

**Option 3: Via Studio**
Visit http://localhost:54323 and execute the contents of each seed file in the SQL Editor.

## Database Reset

⚠️ **WARNING**: This command will **delete all data** in your local database.

```bash
supabase db reset
```

This command:
1. Drops all database objects
2. Recreates the database from scratch
3. Applies all migrations in order
4. Runs seed.sql automatically (if enabled in config.toml)

Use this when:
- Setting up a fresh local database
- Testing migrations from scratch
- Resetting to a clean state during development

## Configuration

Database settings are configured in `config.toml`:

```toml
[db]
port = 54322
major_version = 17

[db.migrations]
enabled = true

[db.seed]
enabled = true                 # Auto-run seed files on db reset
sql_paths = ["./seed/*.sql"]   # Load all .sql files in seed/ directory (in alphabetical order)
```

## Local Supabase Stack

Start the local Supabase stack:

```bash
supabase start
```

Access points:
- **API**: http://localhost:54321
- **Studio**: http://localhost:54323
- **Database**: postgresql://postgres:postgres@localhost:54322/postgres
- **Inbucket (Email testing)**: http://localhost:54324

Stop the local stack:

```bash
supabase stop
```

## RBAC System

The Role-Based Access Control system uses:

1. **JWT Custom Claims**: User roles stored in `auth.users.raw_app_metadata` and embedded in JWT tokens
2. **Automatic Triggers**: New users auto-assigned Guest role, role changes auto-sync to JWT
3. **Audit Trail**: All role changes logged in `user_roles_audit` table indefinitely
4. **Row Level Security**: RLS policies enforce role-based data access

### Test SuperAdmin User

The seed files create a test SuperAdmin user for local development:

- **Email**: test@test.com
- **Password**: password
- **Name**: John Doe
- **Role**: SuperAdmin (level 100)

⚠️ **Security Warning**: Remove or change this test user before deploying to production!

### Role Hierarchy

- **SuperAdmin (100)**: Full system access
- **Admin (90)**: User management, cannot see SuperAdmins
- **Editor (70)**: Manage all content
- **Author (50)**: Create and publish own content
- **Contributor (30)**: Submit content for review
- **Guest (10)**: Read-only access (default for new users)

## Troubleshooting

### Migrations not applying

```bash
# Check migration status
supabase migration list

# Force reapply all migrations
supabase db reset
```

### Seed file not running

1. Check `config.toml`: ensure `db.seed.enabled = true`
2. Verify `sql_paths = ["./seed/*.sql"]` is correct
3. Check that seed files exist in `supabase/seed/` directory
4. Run manually: `supabase db seed`

### Role not appearing in JWT

1. User must login/refresh token after role assignment
2. Check `auth.users.raw_app_metadata` in database
3. Verify trigger `on_user_role_changed` fired successfully

## Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)


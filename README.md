# Next.js + Supabase Starter

> A production-ready starter for building full-stack apps with Next.js, Supabase, and shadcn/ui — featuring authentication, RBAC, and modern UI components.

**Origin:** this project was bootstrapped from the Vercel Next.js + Supabase template: https://vercel.com/templates/next.js/supabase

---

## Table of Contents
- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Supabase Local Development](#supabase-local-development)
- [Contributing](#contributing)
- [References](#references)

---

## About

This repository is a comprehensive, production-ready starter template that combines Next.js 15 (App Router), Supabase for authentication and database, and shadcn/ui components styled with Tailwind CSS. It provides a complete foundation for building modern web applications with built-in authentication flows, role-based access control (RBAC), and a polished UI.

### Key Highlights
- ✅ **Complete Authentication System** - Login, signup, email verification, password reset, and 2FA
- ✅ **Role-Based Access Control** - Admin, user, and guest roles with hierarchical permissions
- ✅ **Modern UI Components** - Pre-configured shadcn/ui components with dark mode support
- ✅ **Type-Safe** - Full TypeScript support with Zod validation schemas
- ✅ **Production-Ready** - Row-level security policies, audit trails, and security best practices

---

## Features

### 🔐 Authentication
- Email/password authentication with Supabase Auth
- Email verification flow
- Password reset/forgot password
- Two-factor authentication (2FA) with QR code setup
- Protected routes with middleware
- Session management

### 👥 User Management
- User profile management (name, email)
- Password change functionality
- 2FA enable/disable
- User settings dashboard

### 🛡️ Role-Based Access Control (RBAC)
- Six-tier role system: SuperAdmin (100), Admin (90), Editor (70), Author (50), Contributor (30), Guest (10)
- Automatic role assignment for new users (Guest by default)
- Role-based route protection
- Admin dashboard for user/role management
- Complete audit trail for role changes
- JWT claim synchronization

### 🎨 UI/UX
- Responsive design with Tailwind CSS
- Dark/light mode toggle with next-themes
- shadcn/ui component library
- Lucide icons
- Toast notifications with Sonner
- Form validation with React Hook Form + Zod
- Loading states and error handling

### 📊 Admin Features
- User management dashboard
- Audit log viewer
- Role assignment interface

---

## Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- A Supabase account (or use local Supabase with Docker)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd nextjs-supabase-starter
```

2. **Install dependencies:**
```bash
yarn install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from your Supabase project dashboard at https://app.supabase.com

4. **Run database migrations:**

If using Supabase cloud:
```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

If using local Supabase (see [Supabase Local Development](#supabase-local-development) below)

5. **Start the development server:**
```bash
yarn dev
# or use the convenience script to auto-open browser
yarn so
```

The app will be available at http://localhost:3000

---

## Available Scripts
## Available Scripts

This project uses Yarn. Run these commands with `yarn <script>`:

### Development
```bash
yarn dev          # Start Next.js dev server on port 3000
yarn s            # Shortcut for yarn dev
yarn so           # Start dev server and open browser
```

### Build & Production
```bash
yarn build        # Create production build
yarn start        # Start production server
```

### Code Quality
```bash
yarn lint         # Run ESLint
```

### Browser Shortcuts
```bash
yarn open:next    # Open http://localhost:3000 in browser
```

**Note:** The original template had `yarn sos` for starting with local Supabase. To use local Supabase, see the [Supabase Local Development](#supabase-local-development) section.

---

## Project Structure

```
nextjs-supabase-starter/
├── app/
│   ├── (authenticated)/      # Protected routes
│   │   ├── admin/           # Admin-only pages
│   │   │   ├── audit/       # Audit log viewer
│   │   │   └── users/       # User management
│   │   ├── dashboard/       # User dashboard
│   │   └── settings/        # User settings
│   └── (public)/            # Public routes
│       ├── auth/            # Authentication pages
│       │   ├── login/
│       │   ├── sign-up/
│       │   ├── 2fa/
│       │   ├── forgot-password/
│       │   ├── update-password/
│       │   └── verify-email/
│       └── page.tsx         # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── rbac/                # Role-based access control components
│   ├── settings/            # Settings page components
│   └── ...                  # Shared components
├── lib/
│   ├── schemas/             # Zod validation schemas
│   ├── supabase/            # Supabase client utilities
│   └── rbac/                # RBAC utilities and types
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed/                # Database seed files
└── hooks/                   # Custom React hooks
```

---

## Authentication

This starter includes a complete authentication system built on Supabase Auth.

### Available Auth Features

- **Sign Up:** Email/password registration with email verification
- **Login:** Email/password authentication
- **Email Verification:** Automatic email sent on signup
- **Password Reset:** Forgot password flow with email link
- **Two-Factor Authentication (2FA):** 
  - QR code generation for authenticator apps
  - 6-digit code verification
  - Enable/disable in user settings
- **Session Management:** Automatic session refresh and validation
- **Protected Routes:** Middleware-based route protection

### Auth Pages

All authentication pages are located in `app/(public)/auth/`:

- `/auth/login` - Login page
- `/auth/sign-up` - Registration page
- `/auth/2fa` - Two-factor authentication verification
- `/auth/forgot-password` - Password reset request
- `/auth/update-password` - Password reset form
- `/auth/verify-email` - Email verification page
- `/auth/sign-up-success` - Post-registration confirmation

### Using Auth in Your Code

```typescript
// Client component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});

// Server component
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
const { data } = await supabase.auth.getClaims();
```

---

## Role-Based Access Control

This starter includes a comprehensive RBAC system with six default roles:

### Role Hierarchy

| Role        | Level | Description |
|-------------|-------|-------------|
| SuperAdmin  | 100   | Full system access and control |
| Admin       | 90    | User management and settings |
| Editor      | 70    | Manage all content and media |
| Author      | 50    | Create and publish own content |
| Contributor | 30    | Submit content for review |
| Guest       | 10    | Read-only access to backend (default for new users) |

### How It Works

1. **Automatic Assignment:** New users are automatically assigned the Guest role
2. **JWT Claims:** Roles are synced to JWT claims for efficient authorization
3. **Row-Level Security:** Database policies enforce role-based access
4. **Audit Trail:** All role changes are logged in `user_roles_audit` table

### Role Management

Admins can manage user roles via the admin dashboard at `/admin/users`.

### Checking Roles in Code

```typescript
// Server-side (using JWT claims)
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data } = await supabase.auth.getClaims();
const roleLevel = data?.claims?.app_metadata?.role_level;

if (roleLevel >= 90) {
  // Admin access
}

// Using the helper function
import { get_my_role_level } from '@/lib/rbac/server';
const level = await get_my_role_level();
```

### Database Schema

The RBAC system includes three tables:
- `roles` - Available roles
- `user_roles` - User-to-role assignments
- `user_roles_audit` - Complete audit trail

See `supabase/migrations/20260115000001_create_roles_system.sql` for the complete schema.

---

## Tech Stack
## Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database, authentication, and real-time
- **[@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs)** - Server-side auth for Next.js
- **[@supabase/supabase-js](https://supabase.com/docs/reference/javascript)** - Supabase JavaScript client

### Styling & UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[Lucide Icons](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark mode support

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)** - Form state management
- **[Zod](https://zod.dev/)** - Schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Validation resolver

### Additional Libraries
- **[next-safe-action](https://next-safe-action.dev/)** - Type-safe server actions
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[QRCode.react](https://github.com/zpao/qrcode.react)** - QR code generation for 2FA
- **[date-fns](https://date-fns.org/)** - Date utility library
- **[input-otp](https://input-otp.rodz.dev/)** - OTP input component

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** (via ESLint) - Code formatting
- **[open-cli](https://github.com/sindresorhus/open-cli)** - CLI tool to open URLs

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Getting Your Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **service_role** key → `NEXT_SUPABASE_SERVICE_ROLE_KEY`

### Local Development

For local Supabase development, use:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-local-publishable-key>
NEXT_SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
```

**Important:** 
- Never commit `.env.local` to version control
- Keep `NEXT_SUPABASE_SERVICE_ROLE_KEY` secret - it bypasses Row Level Security
- Use your hosting provider's environment variable management for production

---

## Supabase Local Development

This project supports local development with Supabase CLI.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

### Setup

1. **Install Supabase CLI:**
```bash
# macOS
brew install supabase/tap/supabase

# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

2. **Start Local Supabase:**
```bash
supabase start
```

This will start all Supabase services locally:
- PostgreSQL database
- Auth server
- Realtime server
- Storage server
- Studio (UI) at http://127.0.0.1:54323

3. **Run Migrations:**
```bash
supabase db reset  # Applies all migrations and seeds
```

4. **Update your `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<displayed-after-supabase-start>
NEXT_SUPABASE_SERVICE_ROLE_KEY=<displayed-after-supabase-start>
```

### Useful Commands

```bash
supabase status        # View running services
supabase stop          # Stop all services
supabase db reset      # Reset database (run migrations + seeds)
supabase db diff       # Generate migration from schema changes
supabase migration new <name>  # Create new migration
```

### Migrations & Seeding

- **Migrations:** Located in `supabase/migrations/`
- **Seed Data:** Located in `supabase/seed/`

The project includes:
- `20260115000001_create_roles_system.sql` - RBAC system setup
- `01_roles.sql` - Seed default roles
- `02_users.sql` - Seed test users (optional)

---

## Contributing
## Contributing

### Development Workflow

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Follow the existing code style
   - Add TypeScript types for all new code
   - Use Zod schemas for validation
   - Test authentication flows thoroughly

3. **Database Changes:**
   - Create new migrations for schema changes:
   ```bash
   supabase migration new your_migration_name
   ```
   - Never edit existing migrations that are in production
   - Always use forward-only migrations
   - Test migrations locally before deploying

4. **Test your changes:**
```bash
yarn lint          # Check for linting errors
yarn build         # Ensure production build works
```

5. **Submit a pull request**

### Code Style Guidelines

- Use TypeScript for all new files
- Follow the existing component structure
- Use server components by default, client components only when needed
- Validate forms with React Hook Form + Zod
- Use server actions for mutations
- Follow the established file naming conventions

### Adding New Features

**New Auth Method:**
1. Add schema to `lib/schemas/auth.ts`
2. Create server action in `app/(public)/auth/[method]/actions.ts`
3. Create form component in `app/(public)/auth/[method]/`
4. Add route protection if needed

**New Protected Page:**
1. Create page in `app/(authenticated)/`
2. Add RBAC checks if role-specific
3. Update sidebar navigation in `components/app-sidebar.tsx`

**New Database Table:**
1. Create migration in `supabase/migrations/`
2. Add RLS policies
3. Create TypeScript types
4. Add to seed data if needed

---

## References

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/get-started)

### Supabase Resources
- [Supabase CLI Local Development](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

### Starter Template
- [Original Vercel Template](https://vercel.com/templates/next.js/supabase)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Support

For issues and questions:
- Check the [Issues](../../issues) page
- Review Supabase [Discord](https://discord.supabase.com/)
- Consult the documentation links above

---

**Built with ❤️ using Next.js and Supabase**


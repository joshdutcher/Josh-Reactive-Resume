# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reactive Resume is an open-source resume builder built with React (Vite) for the frontend and NestJS for the backend. The project uses Nx as a monorepo build system with pnpm as the package manager.

**Official Documentation**: https://docs.rxresu.me/

The official documentation includes:
- Comprehensive setup guides
- Self-hosting instructions with Docker
- Configuration reference
- Feature documentation
- Troubleshooting guides

## Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite as build tool
- TailwindCSS for styling
- Radix UI components
- Zustand for state management with Zundo (undo/redo)
- React Router v7 for routing
- TanStack Query for server state
- LinguiJS for i18n
- Tiptap for rich text editing

**Backend:**
- NestJS framework
- PostgreSQL with Prisma ORM
- Passport for authentication (local, GitHub, Google, OpenID)
- Minio for object storage
- Puppeteer/Browserless for PDF generation
- Nodemailer for email
- OpenAI integration for AI features

**Infrastructure:**
- Nx monorepo with pnpm workspaces
- Docker for containerization
- Vitest for testing
- Railway for deployment and hosting
- GitHub for version control and CI/CD

**Available CLI Tools:**
- `railway` - Railway CLI for deployment management, logs, and service configuration
- `gh` - GitHub CLI for repository operations, PR management, and issue tracking

## Monorepo Structure

The project is organized into three main apps and six shared libraries:

### Apps

1. **client** (`apps/client`) - Main user-facing application
   - Built with Vite + React
   - Pages: auth, dashboard, builder, home, public
   - Services: auth, resume, storage, user, openai
   - State: Zustand stores with temporal middleware

2. **server** (`apps/server`) - NestJS backend API
   - Modules: auth, resume, user, storage, printer, mail, database
   - Authentication strategies in `auth/strategy/`
   - Guards for route protection
   - Serves at `/api` prefix with Swagger docs at `/docs`

3. **artboard** (`apps/artboard`) - Resume rendering/preview app
   - Isolated React app for PDF generation
   - Routes: builder, preview
   - Uses templates from `src/templates/`

### Shared Libraries

- **@reactive-resume/schema** - Zod schemas and types for resume data structure
- **@reactive-resume/dto** - Data Transfer Objects for API communication
- **@reactive-resume/ui** - Radix UI-based component library
- **@reactive-resume/hooks** - Shared React hooks
- **@reactive-resume/utils** - Utility functions with namespaces
- **@reactive-resume/parser** - Resume parsers (JSON Resume, LinkedIn, Reactive Resume v3)

## Development Commands

### Setup & Installation
```bash
pnpm install              # Install dependencies
pnpm prisma:generate      # Generate Prisma client
pnpm prisma:migrate:dev   # Run database migrations in dev
```

### Development
```bash
pnpm dev                  # Start all apps in development mode
nx serve client           # Run client only (http://localhost:4200)
nx serve server           # Run server only (http://localhost:3000)
nx serve artboard         # Run artboard only (http://localhost:4201)
```

### Building
```bash
pnpm build                # Build all apps (runs prisma:generate first)
nx build client           # Build client only
nx build server           # Build server only
nx build artboard         # Build artboard only
```

### Testing
```bash
pnpm test                          # Run all tests with Vitest
nx test <project>                  # Run tests for specific project
nx test utils                      # Run tests for utils library
```

### Linting & Formatting
```bash
pnpm lint                 # Lint all projects
pnpm lint:fix             # Lint and fix all projects
nx lint <project>         # Lint specific project
pnpm format               # Check formatting
pnpm format:fix           # Format all files
```

### Database
```bash
pnpm prisma:generate      # Generate Prisma client
pnpm prisma:migrate       # Run migrations (production)
pnpm prisma:migrate:dev   # Run migrations (development)
```

### Localization
```bash
pnpm messages:extract     # Extract i18n messages with Lingui
pnpm crowdin:sync         # Sync with Crowdin (push & pull)
```

## Architecture & Key Concepts

### Nx Monorepo Pattern
- Use `nx run-many -t <target>` to run tasks across multiple projects
- Dependencies defined in `nx.json` with `dependsOn: ["^build"]`
- Path aliases configured in `tsconfig.base.json` for clean imports:
  - `@/client/*` → `apps/client/src/*`
  - `@/server/*` → `apps/server/src/*`
  - `@/artboard/*` → `apps/artboard/src/*`
  - `@reactive-resume/*` → `libs/*/src/index.ts`

### Resume Data Schema
The resume data structure is defined in `@reactive-resume/schema`:
- `resumeDataSchema` contains: basics, sections, metadata
- All schemas use Zod for runtime validation
- Located at `libs/schema/src/index.ts`

### Authentication Flow
- Server uses Passport with multiple strategies (local, GitHub, Google, OpenID)
- JWT tokens for stateless authentication
- Cookie-based sessions for OAuth flows
- 2FA support with TOTP (otplib)
- Password reset via email tokens

### State Management Pattern
Client uses Zustand with:
- `immer` middleware for immutable updates
- `temporal` (zundo) for undo/redo functionality
- `devtools` for debugging
- Debounced auto-save to backend via `debouncedUpdateResume`

Example: `apps/client/src/stores/resume.ts`

### Resume Builder & Artboard Separation
- **Client** provides the editing UI and user interactions
- **Artboard** is an isolated app that renders the actual resume for PDF generation
- Artboard communicates via `postMessage` API
- Printer service (`apps/server/src/printer`) uses Puppeteer to generate PDFs

### API Communication
- Client uses TanStack Query for server state
- DTOs defined in `@reactive-resume/dto` for type-safe API contracts
- Server exposes Swagger/OpenAPI docs at `/docs`
- Base API prefix: `/api`

### Database Schema
Prisma schema at `tools/prisma/schema.prisma`:
- **User** - user accounts with provider info
- **Secrets** - password, tokens, 2FA secrets
- **Resume** - resume data (JSON), visibility, lock status
- **Statistics** - view and download tracking

### Testing Strategy
- Unit tests for utilities in `libs/utils/src/namespaces/tests/`
- Use Vitest for all testing
- Tests run with `nx test <project>` or `pnpm test`

### Import/Export Parsers
Parsers in `@reactive-resume/parser`:
- `json-resume` - JSON Resume standard
- `linkedin` - LinkedIn profile data
- `reactive-resume` - Current format
- `reactive-resume-v3` - Legacy v3 format

### Environment Configuration
Key environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection
- `PUBLIC_URL` - Public-facing URL
- `STORAGE_URL` - Minio/S3 storage endpoint
- `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` - JWT secrets
- `CHROME_URL`, `CHROME_TOKEN` - Browserless connection
- `MAIL_FROM`, `SMTP_URL` - Email configuration
- OAuth credentials for GitHub/Google

## Development Workflow

### Adding a New Feature
1. Determine which app(s) need changes (client/server/artboard)
2. Add shared types to `@reactive-resume/schema` if needed
3. Add DTOs to `@reactive-resume/dto` for API contracts
4. Implement backend logic in server modules
5. Create/update client services in `apps/client/src/services/`
6. Build UI components using `@reactive-resume/ui`
7. Add i18n messages and run `pnpm messages:extract`

### Working with Resume Data
- All resume data follows `resumeDataSchema` from `@reactive-resume/schema`
- Updates use Zustand store with lodash.set for deep paths
- Auto-save is debounced to prevent excessive API calls
- Undo/redo handled by temporal middleware

### Adding Database Changes
1. Modify `tools/prisma/schema.prisma`
2. Run `pnpm prisma:migrate:dev` to create migration
3. Run `pnpm prisma:generate` to update Prisma client
4. Update DTOs if API contracts change

### Working with i18n
- Use `@lingui/macro` for translations: `t` macro for strings
- Extract messages with `pnpm messages:extract`
- Translations managed via Crowdin
- Locale files in `apps/client/src/locales/`

### PDF Generation
- Artboard app renders resume templates
- Server's printer service uses Puppeteer to connect to Browserless
- Templates located in `apps/artboard/src/templates/`
- Each template receives resume data and renders accordingly

### UI Component Development
- Use Radix UI primitives from `@reactive-resume/ui`
- Components follow Tailwind + CVA pattern
- Shared components avoid app-specific logic
- App-specific components go in respective `apps/*/src/components/`

## Important Notes

- **Node version**: Requires Node.js >=22.13.1 (specified in package.json engines)
- **Package manager**: Must use pnpm@10.18.1 (enforced by packageManager field)
- **Prisma location**: Schema is at `tools/prisma/schema.prisma`, not default location
- **Port conflicts**: Client (4200), Server (3000), Artboard (4201) - ensure ports are available
- **Docker setup**: Includes PostgreSQL, Minio, and Chrome containers
- **API prefix**: All server endpoints are prefixed with `/api`
- **Client proxy**: Vite proxy config at `apps/client/proxy.conf.json` for API calls in development

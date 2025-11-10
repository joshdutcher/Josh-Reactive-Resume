# Josh's Reactive Resume - Project Documentation

## Project Overview

**Repository**: https://github.com/joshdutcher/Josh-Reactive-Resume
**Upstream**: https://github.com/AmruthPillai/Reactive-Resume
**Version**: 4.5.2 (forked)
**License**: MIT

## Important: Permanent Fork Status

⚠️ **This is a permanent custom fork and is NOT intended to be merged back into upstream.**

This repository contains customizations specific to Josh's deployment and use case. While we sync with upstream for bug fixes and features, our custom modifications (custom domain handling, donation banner behavior, etc.) are intentionally different from the upstream project.

**Development Strategy**:
- Periodically sync with upstream/main for bug fixes and new features
- Maintain custom modifications in separate commits
- Never create pull requests to upstream for fork-specific changes
- Keep fork-specific features clearly documented

## Custom Modifications

### 1. Custom Domain Support (2025-10-28)
**Status**: Complete | **Commits**: `1b79bdf7`, `d5765683`, `dc29cb0c`, `c456610f`

Allows users to serve public resumes via custom domains. Added `customDomain` field to Resume schema, custom domain resolution endpoint, and sharing UI with automatic hostname detection and routing.

**Files**: `schema.prisma`, `resume.controller.ts`, `resume.ts`, `sharing.tsx`, `home/page.tsx`

### 2. Donation Banner Customization (2025-10-30)
**Status**: Complete | **Commit**: `8891fb3a`

Hides donation banner on custom domain resumes for professional appearance. Conditional rendering based on hostname detection.

**Files**: `donation-banner.tsx`, `home/page.tsx`

### 3. Footer Cleanup for Custom Domains (2025-11-03)
**Status**: Complete | **Commit**: `b0d0d842`

Hides footer section when viewing via custom domains. Layout-level conditional rendering with hostname detection for clean professional presentation.

**Files**: `layout.tsx`, `footer.tsx`

### 4. MinIO Storage Implementation (2025-10-31)
**Status**: Complete | **Commit**: `c657c344`

Migrated from Cloudflare R2 to MinIO S3-compatible storage (Railway-deployed) to fix PDF generation/download authorization. Public bucket access for `/resumes/`, `/pictures/`, `/previews/`.

**Reference**: `.claude/MINIO_SETUP.md` for complete configuration guide

### 5. Hide Page Breaks on Web Toggle (2025-11-05)
**Status**: Complete | **Commits**: `6c2fbafa`, `68664961`

Added `hidePageBreaksWeb` toggle to allow single-page continuous web view while preserving multi-page PDF structure. Backward compatible, JSON-stored metadata, no migration needed.

**Files**: `metadata/index.ts`, `sample.ts`, `page.tsx` (builder & artboard), `preview.tsx`

### 6. PDF Generation Fix for Hide Page Breaks (2025-11-08)
**Status**: Complete | **Commit**: Bug fix for feature #5

Fixed PDF generation failure by overriding `hidePageBreaksWeb=false` during PDF rendering and detecting `?pdf=true` URL parameter for forced multi-page rendering.

**Files**: `printer.service.ts`, `preview.tsx`

### 7. Multiple Custom Domains Support (2025-11-08)
**Status**: Complete | **Commits**: Migration fix `fc1c62b0`

Upgraded from single to 5 custom domains per resume. Migrated schema from `customDomain String?` to `customDomains String[]` with global uniqueness validation. Multi-domain UI with add/remove, automatic format cleaning, limit enforcement.

**Migration Reference**: `.claude/MIGRATION_RECOVERY.md` for PostgreSQL migration details
**Files**: `schema.prisma`, `migration.sql`, `resume.ts` (DTO), `resume.service.ts`, `resume` store, `sharing.tsx`

### 8. Mobile Viewport Optimization (2025-11-10)
**Status**: Complete | **Commit**: `97ad6ae6`

Fixed mobile zoom/viewport for custom domain resumes. Added `maxWidth: 100%` to container/iframe and explicit viewport meta tag to enable proper mobile scaling while maintaining desktop/print layouts.

**Files**: `public/page.tsx`

## Development Standards

### i18n Policy for Fork-Specific Features

⚠️ **Important**: This fork does not use internationalization (i18n) for new fork-specific features.

**Rationale**: This is a permanent custom fork with features specific to Josh's deployment. Adding fork-specific text to the upstream i18n system would:
- Create unnecessary burden on upstream translators
- Add strings that will never be merged back to upstream
- Complicate future upstream syncing and maintenance
- Mix custom fork content with upstream translation workflows

**Implementation Guidelines**:
- ✅ Use plain text strings for all new fork-specific features
- ❌ Do not use `t` macro from `@lingui/macro` for new UI elements
- ✅ Disable i18n linting if needed: `/* eslint-disable lingui/text-restrictions */`
- ✅ Continue using i18n for upstream features to maintain compatibility and ease future syncing

**Examples**:
```tsx
// ❌ Don't use i18n for fork-specific features
<Button>{t`Add Custom Domain`}</Button>

// ✅ Use plain text instead
<Button>Add Custom Domain</Button>
```

**Affected Features**:
- Custom domain configuration UI (feature #1, #7)
- DNS configuration help modal
- Custom domain-specific error messages
- Fork-specific settings and controls

This policy ensures clean separation between upstream-compatible code and fork-specific customizations.

## Tech Stack

**Frontend**:
- React 18.3.1 + TypeScript 5.9.3
- Vite 5.4.20 (build)
- TailwindCSS 3.4.18 + Radix UI
- TanStack Query 5.90.2
- React Router 7.9.4
- Lingui 4.14.1 (i18n)

**Backend**:
- NestJS 10.4.20
- Prisma 5.22.0 (PostgreSQL ORM)
- Passport.js (auth)
- Puppeteer 23.11.1 (PDF generation)

**Infrastructure**:
- NX monorepo (9 projects: 3 apps, 6 libs)
- pnpm 10.18.1
- Node.js ≥22.13.1
- MinIO (S3-compatible object storage)
- Browserless (Chrome for PDF rendering)

## Development Workflow

### Environment Setup
```bash
# Install dependencies
pnpm install

# Database setup
pnpm prisma:generate
pnpm prisma:migrate:dev

# Development
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
pnpm lint:fix

# Format
pnpm format
pnpm format:fix
```

### Syncing with Upstream

```bash
# Fetch upstream changes
git fetch upstream

# Rebase local changes onto upstream
git rebase upstream/main

# Force push to origin (fork)
git push origin main --force-with-lease
```

**Conflict Resolution Strategy**:
- Custom changes are in specific, isolated commits
- Upstream changes typically don't overlap with custom modifications
- If conflicts occur, prioritize custom functionality while integrating upstream bug fixes

## Project Structure

```
apps/
  artboard/          - PDF rendering service
  client/            - React frontend
  server/            - NestJS backend

libs/
  dto/               - Data transfer objects
  hooks/             - React hooks
  parser/            - Resume parsing logic
  schema/            - Zod schemas
  ui/                - Shared UI components
  utils/             - Utility functions

tools/
  prisma/            - Database schema and migrations
```

## Deployment Configuration

⚠️ **This fork is specifically designed for Railway deployment.** While upstream Reactive Resume supports various platforms (Docker, Vercel, Netlify), this fork contains Railway-specific configurations that may require modification for other hosting providers.

**For complete deployment instructions, see [`.claude/RAILWAY_DEPLOYMENT.md`](.claude/RAILWAY_DEPLOYMENT.md)**

### Railway Service Architecture

This deployment uses **4 interconnected Railway services**:

1. **Reactive Resume** (main app)
   - Domain: `josh-reactive-resume-production.up.railway.app`
   - Tech: NestJS backend + React frontend
   - Port: 3000
   - Access: Public HTTPS

2. **MinIO** (storage)
   - Domain: `<generated>.railway.app`
   - Tech: MinIO S3-compatible storage
   - Ports: 9000 (API), 9001 (console)
   - Access: Public HTTPS (for downloads), Internal (for API)

3. **Browserless** (PDF rendering)
   - Internal: `browserless.railway.internal:3001`
   - Tech: Chrome headless for PDF generation
   - Access: Private (Railway internal network only)

4. **PostgreSQL** (database)
   - Internal: Railway-managed Postgres
   - Access: Private (Railway internal network only)

### Custom Domains

Resume-level custom domains are supported:
- **Configuration**: Enter custom domain in resume's "Sharing" section
- **Database**: Stored in `Resume.customDomain` field (unique per resume)
- **DNS Setup**: CNAME → Railway production domain
- **Routing**: Automatic hostname detection and routing
- **Presentation**: Professional mode (hides donation banner & footer on custom domains)

**How to Configure**:
1. Open resume in builder
2. Navigate to "Sharing" section (right sidebar)
3. Enter custom domain (e.g., `resume.yourdomain.com`)
4. Configure DNS CNAME pointing to Railway app
5. Resume accessible via custom domain with clean branding

### Storage Architecture

Dual-access pattern for MinIO storage:
- **Internal API**: Services communicate via `minio.railway.internal:9000` (no SSL)
- **Public Downloads**: Browsers access files via public HTTPS URL
- **Bucket Policy**: Public read-only access for `/resumes/`, `/pictures/`, `/previews/`

### Quick Start for Railway Deployment

```bash
# 1. Fork and clone repository
git clone https://github.com/yourusername/Josh-Reactive-Resume.git

# 2. Create Railway project with 4 services:
#    - PostgreSQL (database)
#    - MinIO (Docker: minio/minio:latest)
#    - Browserless (Docker: browserless/chrome:latest)
#    - Main App (connected to GitHub repo)

# 3. Configure environment variables (see RAILWAY_DEPLOYMENT.md)

# 4. Deploy and run migrations
railway run pnpm prisma:migrate:deploy

# 5. Configure MinIO bucket policy for public access
```

**Detailed Instructions**: See [`.claude/RAILWAY_DEPLOYMENT.md`](.claude/RAILWAY_DEPLOYMENT.md) for:
- Complete environment variable configuration
- Service setup and networking
- MinIO bucket policy configuration
- Troubleshooting guides
- Cost optimization tips
- Migration from upstream

## Known Issues

**Upstream Lint Warnings** (not our fault):
- jsonc-eslint-parser missing in 4 libs (schema, utils, dto, parser)
- Prettier warning in gengar.tsx:534
- i18n issues in sharing.tsx (pre-existing)

**React Router Informational Warning**:
- `No HydrateFallback element provided` - Harmless SSR hydration message, no functionality impact

**Build Status**: ✅ All 9 projects build successfully
**TypeScript**: ✅ No errors
**Tests**: Not currently run in CI

## Git Workflow

**Branch**: `main` (default)
**Remote Strategy**:
- `origin` - Personal fork (push here)
- `upstream` - Original repository (sync from here)

**Commit Convention**:
```
Type: Brief description

Detailed explanation of changes.

Changes:
- Specific change 1
- Specific change 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: Feat, Fix, Refactor, Docs, Style, Test, Chore

## Support & Documentation

**Fork-Specific Documentation**:
- [`.claude/CLAUDE.md`](.claude/CLAUDE.md) - Project overview and custom modifications
- [`.claude/RAILWAY_DEPLOYMENT.md`](.claude/RAILWAY_DEPLOYMENT.md) - Complete Railway deployment guide
- [`.claude/MINIO_SETUP.md`](.claude/MINIO_SETUP.md) - MinIO storage configuration
- [`.claude/SESSION.md`](.claude/SESSION.md) - Current session state

**Upstream Documentation**: https://docs.rxresu.me
**Upstream Repository**: https://github.com/AmruthPillai/Reactive-Resume
**Issues**: File in personal fork, not upstream

**Railway Resources**:
- Railway Documentation: https://docs.railway.app
- Railway CLI: `npm install -g @railway/cli`
- Railway Community: https://discord.gg/railway

## License

MIT License - Same as upstream project
Copyright maintained by original author (Amruth Pillai)
Custom modifications © Josh Dutcher

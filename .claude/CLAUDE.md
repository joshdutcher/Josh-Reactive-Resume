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
**Commits**: `1b79bdf7`, `d5765683`, `dc29cb0c`, `c456610f`

Allows users to serve public resumes via custom domains without redirects.

**Changes**:
- Database: Added `customDomain` field to Resume model (unique, optional)
- Backend: Custom domain resolution API endpoint
- Frontend: UI for custom domain configuration in Sharing section
- Routing: Custom domain detection and automatic routing

**Files Modified**:
- `tools/prisma/schema.prisma` - Database schema
- `apps/server/src/resume/resume.controller.ts` - Backend API
- `apps/client/src/services/resume/resume.ts` - Frontend service
- `apps/client/src/pages/builder/sidebars/right/sections/sharing.tsx` - UI
- `apps/client/src/pages/home/page.tsx` - Routing logic

### 2. Donation Banner Customization (2025-10-30)
**Commit**: `8891fb3a`

Hides donation banner when resumes are accessed via custom domains for a cleaner, more professional appearance.

**Changes**:
- Added custom domain detection to donation banner component
- Conditional rendering based on hostname
- Banner still displays on main site (localhost, production)

**Files Modified**:
- `apps/client/src/pages/home/components/donation-banner.tsx`
- `apps/client/src/pages/home/page.tsx` (TypeScript improvements)

### 3. Footer Cleanup for Custom Domains (2025-11-03)
**Commit**: `b0d0d842`

Hides footer section (separator, branding, DigitalOcean badge) when viewing resumes via custom domains, providing a clean professional presentation.

**Implementation**:
- Layout-level conditional rendering of Footer component
- Hostname-based detection in HomeLayout
- Footer component reverted to upstream version (simpler, closer to upstream)

**Files Modified**:
- `apps/client/src/pages/home/layout.tsx` - Added `isCustomDomain()` check, conditional Footer rendering
- `apps/client/src/pages/home/components/footer.tsx` - Reverted to upstream version

**Why This Approach**:
- More reliable than component-level conditional returns
- Avoids SSR/hydration timing issues
- Keeps Footer component simple and upstream-compatible
- Single source of truth for custom domain detection

### 4. MinIO Storage Implementation (2025-10-31)
**Commit**: `c657c344`

Fixed PDF generation and download functionality by migrating from Cloudflare R2 to MinIO storage.

**Problem**: Cloudflare R2 doesn't support S3's `setBucketPolicy()` API, causing authorization errors when downloading generated PDFs.

**Solution**: Deployed MinIO on Railway as S3-compatible storage service with public bucket access.

**Infrastructure**:
- MinIO Service: `minio/minio:latest` Docker image on Railway
- Storage Architecture: Internal API access + public file downloads
- Bucket Policy: Automatic public access for `/resumes/`, `/pictures/`, `/previews/`

**Files Added**:
- `.claude/MINIO_SETUP.md` - Complete MinIO deployment guide

**Configuration**:
```bash
# MinIO Service (Railway)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123

# Reactive Resume Service (Railway)
STORAGE_ENDPOINT=minio.railway.internal
STORAGE_PORT=9000
STORAGE_URL=https://<minio-domain>.railway.app/josh-reactive-resume
STORAGE_BUCKET=josh-reactive-resume
STORAGE_USE_SSL=false
```

### 5. Hide Page Breaks on Web Toggle (2025-11-05)
**Commits**: `6c2fbafa`, `68664961`

Adds optional single-page continuous view for web display while maintaining multi-page structure in builder and PDF generation.

**Purpose**: Allows users to create resumes with page breaks for proper printing, while displaying them as a single continuous page on the web for better online viewing experience.

**Changes**:
- Schema: Added `hidePageBreaksWeb` boolean to `page.options` (default: false)
- UI: Toggle in Page Settings → Options section
- Rendering: Conditional single-page or multi-page rendering in preview mode
- Column merge logic: Combines all pages into continuous columns while preserving order

**Behavior**:
- **Builder**: Unchanged, maintains page-based editing with break lines
- **Web View (toggle OFF)**: Default multi-page display with page boundaries
- **Web View (toggle ON)**: Single continuous page, all content flows naturally
- **PDF Generation**: Unchanged, always generates multiple pages with proper breaks

**Files Modified**:
- `libs/schema/src/metadata/index.ts` - Schema definition
- `libs/schema/src/sample.ts` - Sample data
- `apps/client/src/pages/builder/sidebars/right/sections/page.tsx` - UI toggle
- `apps/artboard/src/pages/preview.tsx` - Merge logic and conditional rendering
- `apps/artboard/src/components/page.tsx` - Dynamic height support

**Technical Details**:
- Backward compatible (existing resumes default to false)
- No database migration required (JSON-stored metadata)
- Preserves column structure during merge (left stays left, right stays right)
- Section order maintained within each column

### 6. PDF Generation Fix for Hide Page Breaks (2025-11-08)
**Status**: Bug fix for feature #5

Fixed PDF generation failure when `hidePageBreaksWeb` is enabled. The single-page web view was incompatible with PDF generation logic that expects multiple page elements.

**Problem**:
- Error: `TypeError: Cannot read properties of null (reading 'cloneNode')`
- Occurred when PDF generator tried to access page elements 2+ that didn't exist in single-page mode

**Solution**:
- Backend: Override `hidePageBreaksWeb=false` in resume data before PDF generation
- Frontend: Detect `?pdf=true` URL parameter to force multi-page rendering
- Dual-layer approach ensures PDF generation always works regardless of web preference

**Files Modified**:
- `apps/server/src/printer/printer.service.ts` - Override setting and add URL parameter
- `apps/artboard/src/pages/preview.tsx` - Detect PDF mode and force multi-page

**Result**: PDF generation works correctly while web preview respects user's hidePageBreaksWeb preference

### 7. Multiple Custom Domains Support (2025-11-08)
**Status**: Enhancement of feature #1

Upgraded single custom domain to support up to 5 custom domains per resume, solving www/non-www URL matching and allowing multiple domain configurations.

**Problem**:
- Original implementation only supported one custom domain
- Users couldn't configure both `example.com` and `www.example.com` for the same resume
- DNS URL redirects with masking didn't work (hostname mismatch)

**Solution**:
- Database: Migrated `customDomain String?` to `customDomains String[]` array
- Backend: Array-based domain lookup with global uniqueness validation
- Frontend: Multi-domain UI with add/remove functionality and inline validation
- Limit: Maximum 5 domains per resume

**Changes**:
- Schema: Changed to `customDomains String[] @default([])`
- Migration: Preserves existing single domain data during conversion
- DTO: Array validation with format stripping (removes http://, trailing slashes)
- Backend query: Uses `customDomains: { has: hostname }` for domain matching
- Uniqueness: Global validation prevents domain conflicts across resumes
- UI: Dynamic add/remove fields with duplicate detection and format validation

**Files Modified**:
- `tools/prisma/schema.prisma` - Schema change to array
- `tools/prisma/migrations/20251108000000_convert_custom_domain_to_array/migration.sql` - Data migration
- `libs/dto/src/resume/resume.ts` - Array validation
- `apps/server/src/resume/resume.service.ts` - Query logic and uniqueness validation
- `apps/client/src/stores/resume.ts` - State management update
- `apps/client/src/pages/builder/sidebars/right/sections/sharing.tsx` - Complete UI rewrite

**Features**:
- Up to 5 custom domains per resume
- Globally unique domain enforcement
- Automatic format cleaning (strips protocols, trailing slashes)
- Duplicate detection within same resume
- Empty field filtering (not saved, not displayed)
- "X of 5" counter display
- "+ Add Custom Domain" button (hidden when limit reached)
- Individual remove buttons for each domain
- Inline validation error messages

**Technical Details**:
- Backward compatible: Existing single domains migrated to array automatically
- PostgreSQL native array support
- Frontend validation + backend validation for security
- Empty strings filtered before save
- Domain format validation: hostname only, no http:// or trailing /

**Use Case Example**: Configure both `www.joshsresume.com` and `joshsresume.com` to point to the same resume, solving DNS redirect masking issues

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

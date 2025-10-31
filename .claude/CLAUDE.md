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

### 3. MinIO Storage Implementation (2025-10-31)
**Commit**: `c657c344`

Fixed PDF generation and download functionality by migrating from Cloudflare R2 to MinIO storage.

**Problem**: Cloudflare R2 doesn't support S3's `setBucketPolicy()` API, causing authorization errors when downloading generated PDFs.

**Solution**: Deployed MinIO on Railway as S3-compatible storage service with public bucket access.

**Changes**:
- Railway: Deployed MinIO service with public domain
- Railway: Updated storage environment variables to point to MinIO
- Documentation: Created comprehensive MinIO setup guide

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

**Railway Services**:
1. **Reactive Resume** (main app)
   - Domain: `josh-reactive-resume-production.up.railway.app`
   - Tech: NestJS backend + React frontend
   - Port: 3000

2. **MinIO** (storage)
   - Domain: `<generated>.railway.app`
   - Tech: MinIO S3-compatible storage
   - Ports: 9000 (API), 9001 (console)

3. **Browserless** (PDF rendering)
   - Internal: `browserless.railway.internal:3001`
   - Tech: Chrome headless for PDF generation

4. **PostgreSQL** (database)
   - Internal: Railway-managed Postgres

**Custom Domains**:
- Configured per-resume in database
- DNS CNAME pointing to production domain
- Automatic detection and routing

**Storage Architecture**:
- Internal API: Services communicate via `minio.railway.internal:9000`
- Public Downloads: Browsers access files via MinIO public domain
- Bucket Policy: Public read access for user-generated content

## Known Issues

**Upstream Lint Warnings** (not our fault):
- jsonc-eslint-parser missing in 4 libs (schema, utils, dto, parser)
- Prettier warning in gengar.tsx:534
- i18n issues in sharing.tsx (pre-existing)

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

## Maintenance Notes

### Regular Tasks
- [ ] Sync with upstream monthly for security updates
- [ ] Test custom domain functionality after upstream sync
- [ ] Verify donation banner behavior remains correct
- [ ] Check database migrations compatibility
- [ ] Monitor MinIO storage usage and performance
- [ ] Verify PDF generation works after Railway deployments

### Future Enhancements (Potential)
- Additional custom domain features
- More UI customizations for personal branding
- Enhanced analytics for custom domain traffic
- Custom themes per domain

## Support & Documentation

**Upstream Documentation**: https://docs.rxresu.me
**Upstream Repository**: https://github.com/AmruthPillai/Reactive-Resume
**Issues**: File in personal fork, not upstream

## License

MIT License - Same as upstream project
Copyright maintained by original author (Amruth Pillai)
Custom modifications © Josh Dutcher

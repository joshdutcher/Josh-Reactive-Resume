# Task Breakdown: Single-User Custom Domain Feature

### 1. Backend Setup

- [ ] **Modify Database Schema:**
  - Edit `tools/prisma/schema.prisma`.
  - Add `customDomain: String? @unique` and `customDomainResumeId: String?` to the `User` model.

- [ ] **Apply Database Migration:**
  - Run `pnpm prisma:migrate:dev --name custom-domain` to apply the schema changes to the database.

- [ ] **Create Domain Management API:**
  - In `apps/server/src/`, create a new module (e.g., `domain`) or add to an existing user-related module.
  - Create a controller with a protected endpoint `PUT /user/domain`.
  - Create a service method that updates the `customDomain` and `customDomainResumeId` for the current user.

- [ ] **Implement Custom Domain Middleware:**
  - In `apps/server/src/`, create a new NestJS middleware.
  - The middleware will read the `Host` header from incoming requests.
  - If the `Host` matches a `customDomain` in the `User` table, it will find the `customDomainResumeId` and serve the corresponding resume's data.
  - Apply this middleware globally in `app.module.ts`.

### 2. Frontend Implementation

- [ ] **Create Domain Management UI:**
  - In `apps/client/src/pages/app/settings/`, add a new section for "Custom Domain".
  - Add an input field for the domain name and a save button.
  - The save button will call the `PUT /user/domain` API endpoint.

- [ ] **Add Resume Selection UI:**
  - In `apps/client/src/components/dialogs/Share.tsx` (or equivalent),
  - Add a button or toggle labeled "Set as target for custom domain".
  - When clicked, this will call the `PUT /user/domain` endpoint, setting the `customDomainResumeId` to the current resume's ID.

### 3. Documentation

- [x] **Write User Guide:**
  - ✅ Created comprehensive guide at `docs/CUSTOM_DOMAIN_GUIDE.md`
  - ✅ Updated in-app UI with step-by-step instructions
  - ✅ Added link to full documentation from settings page
  - The guide explains DNS configuration, Railway setup, and troubleshooting

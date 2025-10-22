# Railway Deployment Setup Guide

## 🎯 Project Overview

**Railway Project**: reactive-resume-josh
**Project ID**: `8acc3f1e-74cd-4f00-aeaf-35eaae16b557`
**GitHub Repo**: `https://github.com/joshdutcher/Josh-Reactive-Resume.git`
**Dashboard**: https://railway.com/project/8acc3f1e-74cd-4f00-aeaf-35eaae16b557

---

## 📋 Setup Steps (Complete in Railway Dashboard)

Since Railway CLI has limitations in non-interactive mode, complete these steps in the Railway dashboard:

### 1. Add PostgreSQL Database Service

1. Go to your Railway dashboard: https://railway.com/project/8acc3f1e-74cd-4f00-aeaf-35eaae16b557
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL instance
4. Note: The `DATABASE_URL` variable will be automatically added to your app service

### 2. Add Main Application Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select: `joshdutcher/Josh-Reactive-Resume`
3. Select branch: `main`
4. Railway will detect the Dockerfile and build automatically

### 3. Add Minio (S3-Compatible Storage)

**Option A: Use Railway Template (Recommended for simplicity)**
1. Click **"+ New"** → **"Template"**
2. Search for "Minio" template
3. Deploy the Minio template to your project

**Option B: Use Cloudflare R2 (Free 10GB, Recommended for cost)**
1. Create Cloudflare R2 account: https://dash.cloudflare.com/
2. Create an R2 bucket
3. Get API credentials (Access Key ID & Secret Access Key)
4. Use R2 endpoint in environment variables (see below)

**Option C: AWS S3 Free Tier**
1. Use AWS S3 with 5GB free tier
2. Configure S3 credentials in environment variables

### 4. Add Browserless Chrome Service

**Option A: Railway Template (Uses Railway resources)**
1. Click **"+ New"** → **"Template"**
2. Search for "Browserless Chrome" or "Chrome Headless"
3. Deploy to your project

**Option B: External Browserless.io (Paid)**
- Sign up at https://www.browserless.io/
- Get API token
- Use their hosted service (costs ~$25-50/month)

**Recommended**: Use Option A (Railway template) for free tier

---

## 🔧 Environment Variables Configuration

### For Main App Service

Add these variables to your **main application service** in Railway:

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# URLs (Update after Railway generates your domain)
PUBLIC_URL=https://your-app.up.railway.app
STORAGE_URL=https://minio-service.railway.internal:9000/default

# Database (Auto-populated by Railway PostgreSQL)
# DATABASE_URL will be automatically set by Railway when you add PostgreSQL

# Authentication Secrets (Generate secure values)
# Use: openssl rand -base64 64
ACCESS_TOKEN_SECRET=<generate-secure-secret>
REFRESH_TOKEN_SECRET=<generate-secure-secret>

# Chrome/Browserless (Update based on your choice)
CHROME_TOKEN=<generate-secure-token>
CHROME_URL=ws://chrome-service.railway.internal:3000
# Optional: Ignore HTTPS errors for internal Railway services
CHROME_IGNORE_HTTPS_ERRORS=true

# Email Configuration (Optional - use Ethereal.email for testing)
MAIL_FROM=noreply@your-domain.com
# SMTP_URL=smtp://username:password@smtp.ethereal.email:587

# Storage Configuration
STORAGE_ENDPOINT=minio-service.railway.internal
STORAGE_PORT=9000
STORAGE_REGION=us-east-1
STORAGE_BUCKET=default
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_USE_SSL=false
STORAGE_SKIP_BUCKET_CHECK=false

# Nx Cloud (Optional - from package.json)
NX_CLOUD_ACCESS_TOKEN=MTQ1OWFiOGUtODVjZC00YzI2LTliZTgtZDBlNWJmODc4NzM0fHJlYWQ=

# Feature Flags (Optional)
# DISABLE_SIGNUPS=false
# DISABLE_EMAIL_AUTH=false

# OAuth (Optional)
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# GITHUB_CALLBACK_URL=https://your-app.up.railway.app/api/auth/github/callback

# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_CALLBACK_URL=https://your-app.up.railway.app/api/auth/google/callback
```

### Generate Secrets

Run these commands locally to generate secure secrets:

```bash
# Access Token Secret
openssl rand -base64 64

# Refresh Token Secret
openssl rand -base64 64

# Chrome Token
openssl rand -hex 32
```

---

## 🔗 Service Connections (Railway Private Networking)

Railway provides private networking between services. Update these after deploying services:

### Internal Service URLs:
- **PostgreSQL**: Railway auto-configures `DATABASE_URL`
- **Minio**: `minio-service.railway.internal:9000` (or actual service name)
- **Chrome**: `chrome-service.railway.internal:3000` (or actual service name)

### Finding Internal Service Names:
1. Go to each service in Railway dashboard
2. Click on **"Settings"** tab
3. Look for **"Service Name"** - use this in URLs

---

## 🚀 Deployment Settings

### GitHub Auto-Deploy Configuration

1. In your app service, go to **"Settings"** → **"Source"**
2. Ensure these are set:
   - **Branch**: `main`
   - **Auto-Deploy**: ✅ Enabled
   - **PR Deploy**: ✅ Enabled (optional, but useful for testing)

### Build Configuration

Railway will automatically:
- Detect `Dockerfile`
- Build using Docker
- Run `pnpm run start` (from Dockerfile CMD)
- Run database migrations via `prestart` script

### Custom Domain Setup

1. In app service, go to **"Settings"** → **"Domains"**
2. Click **"Generate Domain"** for Railway subdomain
3. Or click **"Custom Domain"** to add your own domain
4. For custom domain resume feature, configure DNS:
   - Add CNAME record pointing to Railway domain
   - Set custom domain in app settings

---

## 📊 Resource Allocation (Free Tier Limits)

Railway Free Tier provides:
- **$5/month credit**
- Shared CPU and memory
- 100GB outbound bandwidth

### Estimated Usage:
- **App Service**: ~$2-3/month
- **PostgreSQL**: ~$1-2/month
- **Minio**: ~$1/month
- **Chrome**: ~$1/month

**Total**: ~$5-7/month (slightly over free tier)

### Cost Optimization:
1. Use **Cloudflare R2** instead of Minio (free 10GB)
2. Use **external free tier** services where possible
3. Scale down services when not in use

---

## ✅ Verification Steps

After deployment:

1. **Check Build Logs**: Ensure build completes successfully
2. **Check Deployment Logs**: Look for "🚀 Server is up and running on port 3000"
3. **Test Public URL**: Visit `https://your-app.up.railway.app`
4. **Test Authentication**: Create an account
5. **Test Resume Creation**: Create a resume
6. **Test PDF Download**: Download resume as PDF
7. **Test Custom Domain**: Configure custom domain for a resume

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Verify all environment variables are set
- Check if `pnpm-lock.yaml` is committed to git

### Database Connection Issues
- Verify `DATABASE_URL` is set automatically by Railway
- Check PostgreSQL service is running
- Run migrations manually if needed: `railway run pnpm prisma:migrate`

### PDF Generation Fails
- Verify Chrome service is running
- Check `CHROME_URL` and `CHROME_TOKEN` are correct
- Check internal service networking

### Storage Upload Fails
- Verify Minio/S3 service is running
- Check storage credentials are correct
- Verify bucket exists and is accessible

---

## 🔄 Updates and Maintenance

### Automatic Deployments
- Push to `main` branch → Railway auto-deploys
- Monitor deployments in Railway dashboard

### Database Migrations
- Migrations run automatically via `prestart` script in `package.json`
- Manual migration: `railway run pnpm prisma:migrate`

### Rollback
- Go to deployment in Railway dashboard
- Click on previous successful deployment
- Click **"Redeploy"**

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **Reactive Resume Docs**: https://docs.rxresu.me/
- **Project Dashboard**: https://railway.com/project/8acc3f1e-74cd-4f00-aeaf-35eaae16b557

---

## 🎯 Next Steps

1. ✅ Complete service setup in Railway dashboard
2. ✅ Configure environment variables
3. ✅ Deploy application
4. ✅ Test all functionality
5. ✅ Configure custom domain
6. ✅ Set up custom domain for resume feature

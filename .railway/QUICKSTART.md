# 🚀 Railway Quick Start Checklist

## ✅ What's Already Done

- [x] Railway project created: `reactive-resume-josh`
- [x] Project linked to GitHub: `joshdutcher/Josh-Reactive-Resume`
- [x] Railway configuration files created
- [x] Secrets generated (see below)
- [x] Documentation prepared

## 🎯 Your Generated Secrets

**IMPORTANT**: Save these secrets - they won't be shown again!

```
ACCESS_TOKEN_SECRET=ZFHI+l+ebZGbb3dyXfa6z6BdVSrmrOU0AmekiCux9ATHxVlbtiGrmsw2JesALaV2meEEO6/MifWvg1vUAYnggg==

REFRESH_TOKEN_SECRET=ol5rcsNlW/ZABsEwd45toBZUO6Zlh1qVt28FFNmxrglX4aAOIU+OdwbsYPpVkFgYFXNcXuk7aMr4yiaW+FoC7g==

CHROME_TOKEN=b9d7e3cf8d19b87cc9dc2bdd2907c7e276363318581d9c375cdd6233a328a4cf
```

## 📋 Complete These Steps in Railway Dashboard

### Step 1: Open Your Project
🔗 https://railway.com/project/8acc3f1e-74cd-4f00-aeaf-35eaae16b557

### Step 2: Add PostgreSQL Database
1. Click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Wait for deployment ✅

### Step 3: Add Main Application
1. Click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose: `joshdutcher/Josh-Reactive-Resume`
4. Branch: `main`
5. Wait for initial build (5-10 minutes)

### Step 4: Configure App Environment Variables

Click on your app service → **"Variables"** tab → Add these:

**Essential Variables** (required):
```
NODE_ENV=production
PORT=3000
ACCESS_TOKEN_SECRET=ZFHI+l+ebZGbb3dyXfa6z6BdVSrmrOU0AmekiCux9ATHxVlbtiGrmsw2JesALaV2meEEO6/MifWvg1vUAYnggg==
REFRESH_TOKEN_SECRET=ol5rcsNlW/ZABsEwd45toBZUO6Zlh1qVt28FFNmxrglX4aAOIU+OdwbsYPpVkFgYFXNcXuk7aMr4yiaW+FoC7g==
MAIL_FROM=noreply@railway.app
```

**After app deploys and Railway generates a domain**:
```
PUBLIC_URL=https://[your-app].up.railway.app
```

### Step 5: Add Storage (Choose One)

**Option A: Cloudflare R2 (Recommended - Free 10GB)**
1. Go to https://dash.cloudflare.com/
2. Create R2 bucket
3. Get credentials and add to Railway:
   ```
   STORAGE_ENDPOINT=[your-r2-endpoint]
   STORAGE_ACCESS_KEY=[your-access-key]
   STORAGE_SECRET_KEY=[your-secret-key]
   STORAGE_BUCKET=[your-bucket-name]
   STORAGE_USE_SSL=true
   STORAGE_REGION=auto
   ```

**Option B: Railway Minio Template**
1. Click **"+ New"** → **"Template"**
2. Search "Minio"
3. Deploy Minio template
4. Add variables:
   ```
   STORAGE_ENDPOINT=minio-service.railway.internal
   STORAGE_PORT=9000
   STORAGE_ACCESS_KEY=minioadmin
   STORAGE_SECRET_KEY=minioadmin
   STORAGE_BUCKET=default
   STORAGE_USE_SSL=false
   ```

### Step 6: Add Chrome Service (For PDF Generation)

**Option A: Browserless Chrome Template**
1. Click **"+ New"** → **"Template"**
2. Search "Browserless" or "Chrome"
3. Deploy template
4. Note the service name and add to app:
   ```
   CHROME_TOKEN=b9d7e3cf8d19b87cc9dc2bdd2907c7e276363318581d9c375cdd6233a328a4cf
   CHROME_URL=ws://[chrome-service-name].railway.internal:3000
   CHROME_IGNORE_HTTPS_ERRORS=true
   ```

**Option B: Use External Browserless.io (Paid)**
1. Sign up at https://www.browserless.io/
2. Get API endpoint and token
3. Add to Railway variables

### Step 7: Enable Auto-Deploy
1. In app service → **"Settings"** → **"Source"**
2. Verify:
   - ✅ Branch: `main`
   - ✅ Auto-Deploy: ON
3. Save changes

### Step 8: Generate Railway Domain
1. App service → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the generated URL (e.g., `your-app.up.railway.app`)
4. Update `PUBLIC_URL` variable with this URL

### Step 9: Test Your Deployment
1. Visit your Railway domain
2. Create an account
3. Create a test resume
4. Try downloading PDF
5. Test custom domain feature

## 🎉 You're Done!

Your Reactive Resume is now deployed on Railway with:
- ✅ Automatic deployments from `main` branch
- ✅ PostgreSQL database
- ✅ File storage (Minio or R2)
- ✅ PDF generation (Chrome/Browserless)
- ✅ Custom domain support

## 📊 Monitoring

**View Logs**:
```bash
railway logs
```

**Check Status**:
```bash
railway status
```

**Open Dashboard**:
```bash
railway open
```

## 🔄 Making Updates

1. Make changes locally
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. Railway automatically deploys! 🚀

## 💰 Cost Estimate

**Free Tier** ($5/month credit):
- App Service: ~$2-3/month
- PostgreSQL: ~$1-2/month
- Chrome: ~$1/month
- **With Cloudflare R2**: Stays within free tier! ✅
- **With Railway Minio**: ~$1/month extra

## 📞 Need Help?

- **Full Setup Guide**: See `.railway/SETUP.md`
- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **Project Dashboard**: https://railway.com/project/8acc3f1e-74cd-4f00-aeaf-35eaae16b557

# MinIO Setup Guide for Railway

## Overview

This guide explains how to replace Cloudflare R2 with MinIO for PDF storage in Railway.

## Why MinIO?

- ✅ S3-compatible API (drop-in replacement)
- ✅ Supports `setBucketPolicy()` API (R2 doesn't)
- ✅ Simpler configuration
- ✅ Matches local development setup
- ✅ Public file URLs work automatically

## Problem with Cloudflare R2

Cloudflare R2 doesn't support the S3 `setBucketPolicy()` API, which causes this error:
```
<Error>
<Code>InvalidArgument</Code>
<Message>Authorization</Message>
</Error>
```

The application tries to set a public access policy on the bucket (see `storage.service.ts:86-90`), but R2 rejects this call.

## Railway Deployment Steps

### 1. Add MinIO Service

1. In Railway project: **"+ New"** → **"Empty Service"**
2. Service name: `minio`
3. Deploy from: **Docker Image**
4. Image: `minio/minio:latest`
5. Custom Start Command:
   ```bash
   minio server /data --console-address ":9001"
   ```

### 2. Configure MinIO Environment Variables

Add to MinIO service (only 2 variables needed):

```bash
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
```

**Note**: `MINIO_DOMAIN` is NOT needed for path-style requests (which we're using).

### 3. Generate Public Domain

Railway automatically detects and exposes ports that your application listens on.

1. Go to MinIO service → **Settings** tab
2. Scroll to **Networking** section
3. Click **Generate Domain** button
4. Copy the generated domain (e.g., `minio-production.up.railway.app`)

**Port Details**:
- **Port 9000** (API): Automatically exposed by Railway
- **Port 9001** (Console): Also auto-exposed, accessible via same domain
- **No manual port mapping needed** - Railway handles this automatically

### 4. Update Reactive Resume Variables

**Remove these Cloudflare R2 variables:**
```bash
STORAGE_ENDPOINT=4181570d3dfddb71ef16eda7fc5fed77.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY=78fdc3a45306aa1bf7cb104a8bfedd5c
STORAGE_SECRET_KEY=0eab7e3b2d0635403930548439e3781121a672ed007f528f89f415a8f8c8e649
STORAGE_URL=https://4181570d3dfddb71ef16eda7fc5fed77.r2.cloudflarestorage.com/josh-reactive-resume
```

**Add these MinIO variables:**

#### Option A: Internal Communication + Public Access (Recommended)

```bash
# Internal API access (service-to-service)
STORAGE_ENDPOINT=minio.railway.internal
STORAGE_PORT=9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin123
STORAGE_BUCKET=josh-reactive-resume
STORAGE_REGION=us-east-1
STORAGE_USE_SSL=false
STORAGE_SKIP_BUCKET_CHECK=false

# Public URL for browser downloads (replace with your MinIO public domain)
STORAGE_URL=https://<your-minio-railway-domain.up.railway.app>/josh-reactive-resume
```

#### Option B: All Public Access

```bash
# Public MinIO endpoint for both API and downloads
STORAGE_ENDPOINT=<your-minio-railway-domain.up.railway.app>
STORAGE_PORT=443
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin123
STORAGE_BUCKET=josh-reactive-resume
STORAGE_REGION=us-east-1
STORAGE_USE_SSL=true
STORAGE_SKIP_BUCKET_CHECK=false

# Same public URL
STORAGE_URL=https://<your-minio-railway-domain.up.railway.app>/josh-reactive-resume
```

### 5. Verify Deployment

1. **Check MinIO service logs** - Should see "MinIO Object Storage Server"
2. **Check Reactive Resume logs** - Should see "Successfully connected to the storage service"
3. **Test PDF generation** - Click PDF icon, verify download works

## Important Notes

### Public Access Requirement

⚠️ **`STORAGE_URL` must be publicly accessible** because:
- Users' browsers download PDF files from this URL
- Internal Railway URLs (`minio.railway.internal`) are NOT accessible from browsers
- The URL format is: `${STORAGE_URL}/${userId}/resumes/${filename}.pdf`

### Security Considerations

- MinIO credentials are basic (`minioadmin`/`minioadmin123`)
- Consider stronger credentials for production
- Bucket policy automatically makes `/resumes/`, `/pictures/`, `/previews/` public
- Files in bucket are publicly readable but not listable

### Local Development

Local development already uses MinIO via Docker Compose:
```yaml
# tools/compose/development.yml
minio:
  image: minio/minio:latest
  command: minio server /data --console-address ":9001"
  ports:
    - 9000:9000
    - 9001:9001
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
```

Railway setup mirrors this configuration.

## Troubleshooting

### "There was an error while applying the policy to the storage bucket"

- **Cause**: R2 doesn't support `setBucketPolicy()`
- **Solution**: Switch to MinIO (this guide)

### "Authorization" error in XML response

- **Cause**: Trying to access R2 bucket without authentication
- **Solution**: Switch to MinIO (this guide)

### PDF opens blank or doesn't download

- **Check**: `STORAGE_URL` is publicly accessible
- **Check**: MinIO service has a public domain in Railway
- **Check**: `STORAGE_USE_SSL` matches your endpoint (true for https, false for http)

### "Successfully connected to storage service" but downloads fail

- **Check**: `STORAGE_URL` environment variable
- **Check**: MinIO public domain is correct
- **Test**: Visit `${STORAGE_URL}` in browser - should show MinIO or XML response

## Architecture

```
User Browser
    ↓
    ↓ [1] Click "Download PDF"
    ↓
Reactive Resume App (Railway)
    ↓
    ↓ [2] Generate PDF via Browserless
    ↓
    ↓ [3] Upload to MinIO (internal: minio.railway.internal:9000)
    ↓
    ↓ [4] Return public URL to browser
    ↓
User Browser
    ↓
    ↓ [5] Download PDF (public: https://minio-domain.railway.app/bucket/file.pdf)
    ↓
MinIO Service (Railway)
```

## Next Steps

After MinIO is working:
1. Test PDF generation thoroughly
2. Test custom domain PDF downloads
3. Consider backup/persistence strategy for MinIO data
4. Update `.claude/CLAUDE.md` with storage architecture
5. Remove R2 credentials from Railway (security cleanup)

## References

- MinIO Docs: https://min.io/docs/minio/kubernetes/upstream/
- Railway Docs: https://docs.railway.app/
- Project Storage Service: `apps/server/src/storage/storage.service.ts`

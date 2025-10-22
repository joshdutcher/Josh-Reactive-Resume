# Custom Domain Setup Guide

This guide explains how to point your own custom domain to one of your resumes on this Reactive Resume instance.

## Overview

The custom domain feature allows you to map your own domain (e.g., `www.johndoe.com`) to display one of your resumes. When visitors access your custom domain, they'll see your selected resume instead of the default application.

## Prerequisites

- A custom domain that you own
- Access to your domain's DNS settings (through your domain registrar or DNS provider)
- A resume created in Reactive Resume

## Setup Steps

### Step 1: Configure Your Domain in Railway

1. **Log in to Railway Dashboard**
   - Go to https://railway.com/project/8acc3f1e-74cd-4f00-aeaf-35eaae16b557
   - Navigate to your **Josh-Reactive-Resume** service

2. **Add Custom Domain**
   - Click on the service → **Settings** → **Networking**
   - Under **Custom Domains**, click **"Add Domain"**
   - Enter your custom domain (e.g., `www.johndoe.com`)
   - Railway will show you the DNS records you need to configure

3. **Note the DNS Configuration**
   Railway will provide instructions like:
   ```
   Type: CNAME
   Name: www (or your subdomain)
   Value: josh-reactive-resume-production.up.railway.app
   ```

### Step 2: Configure DNS Records

1. **Access Your DNS Provider**
   - Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
   - Navigate to DNS settings for your domain

2. **Add CNAME Record**
   - **Type**: CNAME
   - **Name**: `www` (or your desired subdomain)
   - **Value**: `josh-reactive-resume-production.up.railway.app`
   - **TTL**: 3600 (or Auto)

3. **For Root Domain** (optional)
   If you want to use `johndoe.com` instead of `www.johndoe.com`:
   - Some providers support CNAME flattening/ALIAS records for root domains
   - Otherwise, use a subdomain like `www` or `resume`

4. **Save Changes**
   - DNS propagation can take 5 minutes to 48 hours (usually under 1 hour)

### Step 3: Configure Custom Domain in Reactive Resume

1. **Log in to Reactive Resume**
   - Go to https://josh-reactive-resume-production.up.railway.app

2. **Navigate to Settings**
   - Click your profile → **Settings**
   - Scroll to **Custom Domain** section

3. **Configure Domain Mapping**
   - **Domain**: Enter your custom domain (e.g., `www.johndoe.com`)
   - **Target Resume**: Select which resume should be displayed
   - Click **"Save Changes"**

### Step 4: Test Your Custom Domain

1. **Wait for DNS Propagation**
   - Check DNS propagation: https://dnschecker.org/
   - Enter your domain and verify CNAME record points to Railway

2. **Visit Your Custom Domain**
   - Open your browser and go to your custom domain
   - You should see your selected resume

3. **Verify SSL Certificate**
   - Railway automatically provisions SSL certificates
   - Your site should show `https://` with a valid certificate

## Examples

### Example 1: Portfolio Domain
```
Domain: www.johndoe.com
Target Resume: John Doe - Software Engineer
Result: Visitors to www.johndoe.com see your Software Engineer resume
```

### Example 2: Multiple Resumes
```
Domain 1: developer.johndoe.com → Developer Resume
Domain 2: designer.johndoe.com → Designer Resume
```
Note: You can only map **one domain per user** in this single-user setup. For multiple domains, you would need multiple Railway deployments.

## Troubleshooting

### Domain Not Working

**Problem**: Custom domain shows "Site cannot be reached"

**Solutions**:
- Check DNS propagation: https://dnschecker.org/
- Verify CNAME record points to correct Railway domain
- Wait longer (DNS can take up to 48 hours)
- Clear your browser cache and DNS cache

### Certificate Error

**Problem**: Browser shows SSL/TLS certificate warning

**Solutions**:
- Wait for Railway to provision certificate (can take 10-15 minutes)
- Verify domain is added in Railway dashboard
- Ensure DNS record is correct

### Wrong Resume Displayed

**Problem**: Domain shows a different resume or error page

**Solutions**:
- Check Custom Domain settings in Reactive Resume
- Verify the correct resume is selected
- Clear browser cache
- Check Railway deployment logs for errors

### Resume Showing Main App Instead

**Problem**: Domain shows login page instead of resume

**Solutions**:
- Ensure custom domain is saved in Reactive Resume settings
- Check that the custom domain middleware is working
- Verify the domain exactly matches what you entered in settings (no `http://` or `https://`)

## Technical Details

### How It Works

1. **DNS Resolution**: Your domain's CNAME record points to Railway's domain
2. **Railway Routing**: Railway routes the request to the application
3. **Host Header Detection**: The app middleware checks the `Host` header
4. **Database Lookup**: Finds the user with matching custom domain
5. **Resume Serving**: Retrieves and displays the configured resume

### Security

- SSL/TLS certificates are automatically managed by Railway
- Only the resume owner can configure custom domains
- Domain ownership is validated through DNS configuration

## Support

If you encounter issues:

1. Check Railway deployment logs: `railway logs`
2. Verify DNS configuration: https://dnschecker.org/
3. Check application settings are correct
4. Contact the instance administrator if problems persist

## Additional Resources

- [Railway Custom Domain Documentation](https://docs.railway.app/deploy/exposing-your-app#custom-domains)
- [DNS Propagation Checker](https://dnschecker.org/)
- [Reactive Resume Documentation](https://docs.rxresu.me/)

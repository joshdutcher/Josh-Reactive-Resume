#!/bin/bash

# Railway Secrets Generator
# Run this script to generate secure secrets for your Railway deployment

echo "🔐 Generating Railway Secrets..."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📋 Copy these values to your Railway environment variables"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "ACCESS_TOKEN_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
echo ""

echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
echo ""

echo "CHROME_TOKEN=$(openssl rand -hex 32)"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ Secrets generated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Copy the values above"
echo "   2. Go to Railway dashboard: https://railway.com/project/8acc3f1e-74cd-4f00-aeaf-35eaae16b557"
echo "   3. Select your app service"
echo "   4. Go to 'Variables' tab"
echo "   5. Add each variable with its corresponding value"
echo ""

# Deployment Guide

Complete guide for deploying RealityRadar to production environments.

---

## 📋 Table of Contents

- [Deployment Options](#deployment-options)
- [Lovable Cloud Deployment](#lovable-cloud-deployment)
- [Chrome Extension Publishing](#chrome-extension-publishing)
- [Self-Hosting](#self-hosting)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

---

## 🚀 Deployment Options

RealityRadar can be deployed in multiple ways:

| Option | Best For | Difficulty | Cost |
|--------|----------|------------|------|
| **Lovable Cloud** | Quick deployment, managed backend | ⭐ Easy | Free tier available |
| **Chrome Web Store** | Browser extension distribution | ⭐⭐ Moderate | $5 one-time fee |
| **Vercel/Netlify** | Static web app | ⭐ Easy | Free tier available |
| **Self-Hosted** | Full control, custom infrastructure | ⭐⭐⭐ Advanced | Variable |

---

## ☁️ Lovable Cloud Deployment

### Prerequisites

- Lovable account: [lovable.dev](https://lovable.dev)
- Project created in Lovable
- GitHub integration (optional but recommended)

### Deployment Steps

#### 1. Via Lovable Interface

**Easiest method** - Deploy directly from Lovable:

1. Open your project in Lovable
2. Click **"Publish"** button (top right on desktop, bottom-right in preview on mobile)
3. Review deployment settings
4. Click **"Update"** to deploy

**Deployment time**: ~30-60 seconds

**Your app will be live at**: `https://your-project-name.lovable.app`

#### 2. Via GitHub Integration

**Recommended for team projects**:

1. **Connect GitHub**:
   - In Lovable, click GitHub → Connect to GitHub
   - Authorize Lovable GitHub App
   - Select repository location

2. **Create Repository**:
   - Click "Create Repository" in Lovable
   - Repository is created and synced

3. **Automatic Deployment**:
   - Changes in Lovable automatically push to GitHub
   - Changes pushed to GitHub automatically deploy to Lovable

**Benefits**:
- Version control
- Team collaboration
- Code review via pull requests
- Backup of all changes

### Custom Domain Setup

1. **Navigate to Settings**:
   - Project > Settings > Domains

2. **Add Domain**:
   - Click "Connect Domain"
   - Enter your domain (e.g., `realityradar.com`)

3. **Configure DNS**:
   - Add CNAME record in your domain provider:
     ```
     CNAME   @   your-project.lovable.app
     ```

4. **Verify**:
   - Wait for DNS propagation (5-60 minutes)
   - Lovable will auto-verify and issue SSL certificate

**Requirements**:
- Paid Lovable plan for custom domains
- Access to domain DNS settings

---

## 🧩 Chrome Extension Publishing

### Prerequisites

- Google Developer account ($5 one-time fee)
- Chrome Web Store Developer Dashboard access
- Privacy policy URL
- Promotional images

### Preparation

#### 1. Build Extension

```bash
# Ensure you're on main/production branch
git checkout main

# Install dependencies
npm install

# Build optimized production bundle
npm run build

# Verify build
ls -la dist/
# Should contain: index.html, assets/, manifest.json, etc.
```

#### 2. Create Distribution Package

```bash
# Create zip file
cd dist
zip -r ../realityradar-extension-v1.0.0.zip .
cd ..

# Verify zip contents
unzip -l realityradar-extension-v1.0.0.zip
```

#### 3. Prepare Assets

**Required Images**:

1. **Icon**:
   - 128x128px PNG
   - Transparent background
   - Simple, recognizable design
   - Already in: `public/icon-128.png` (create if missing)

2. **Screenshots** (at least 1, max 5):
   - 1280x800px or 640x400px
   - Show key features:
     - Upload interface
     - Analysis results
     - Quiz feature

3. **Promotional Images** (optional):
   - Small tile: 440x280px
   - Large tile: 920x680px
   - Marquee: 1400x560px

#### 4. Write Store Listing Content

**Extension Name**:
```
RealityRadar - Deepfake Detector
```

**Description** (max 132 characters):
```
AI-powered deepfake detection for images, videos, and text. Protect yourself from digital deception.
```

**Detailed Description**:
```markdown
RealityRadar is a powerful deepfake detection tool that helps you verify the authenticity of digital content.

🔍 FEATURES:
• Multi-modal Analysis - Detects deepfakes in images, videos, and text
• Advanced Algorithms - EXIF, ELA, FFT, and AI pattern recognition
• Reverse Image Search - Cross-references content across the web
• Instant Results - Real-time analysis with detailed reports
• Privacy-First - No data retention, secure processing

🛡️ PROTECT YOURSELF FROM:
• Manipulated news images
• Fake celebrity videos
• AI-generated profile pictures
• Fraudulent documents
• Misleading social media content

🎓 EDUCATIONAL RESOURCES:
• Interactive deepfake detection quiz
• Comprehensive learning materials
• Stay informed about latest threats

📱 HOW TO USE:
1. Click the RealityRadar icon in your toolbar
2. Upload an image, video, or paste text
3. Get instant authenticity analysis
4. View detailed breakdown and reasoning

🔒 PRIVACY & SECURITY:
• No data collection or storage
• All processing happens securely
• GDPR compliant
• Open source

Perfect for journalists, researchers, educators, and anyone who wants to stay safe online.

Support: support@realityradar.app
Website: https://realityradar.app
GitHub: https://github.com/yourusername/realityradar
```

**Privacy Policy**:
Create and host at: `https://realityradar.app/privacy-policy`

Example content:
```markdown
# Privacy Policy for RealityRadar

Last updated: January 9, 2025

## Data Collection
RealityRadar does NOT collect, store, or transmit any personal data.

## Content Processing
- Uploaded content is processed locally in your browser
- Images sent to our servers for analysis are immediately discarded after processing
- No files are stored or retained

## Permissions
- activeTab: To analyze images on the current page
- storage: To save user preferences locally

## Third-Party Services
- Google Vision API: Used for reverse image search (images sent securely via HTTPS)

## Contact
For questions: support@realityradar.app
```

### Publishing Steps

#### 1. Access Developer Dashboard

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 one-time developer fee (if first time)
3. Click **"New Item"**

#### 2. Upload Extension

1. Click **"Choose File"** and select your `.zip` file
2. Upload completes → redirects to item details page

#### 3. Fill Store Listing

1. **Store Listing Tab**:
   - Product icon: Upload 128x128 PNG
   - Detailed description: Paste prepared description
   - Primary category: "Productivity"
   - Language: Select all supported languages

2. **Screenshots**: Upload prepared screenshots

3. **Promotional Images** (optional): Upload tiles

4. **Additional Fields**:
   - Official URL: `https://realityradar.app`
   - Support URL: `https://realityradar.app/support`

#### 4. Privacy Practices

1. **Privacy Tab**:
   - Single Purpose: "Deepfake detection and content verification"
   - Permission Justification:
     - activeTab: "To analyze content on the current webpage"
     - storage: "To save user preferences locally"
   - Data Usage: Check "Does NOT collect user data"
   - Certification: Check and submit

#### 5. Submit for Review

1. **Review all fields** for accuracy
2. Click **"Submit for Review"**
3. **Wait for approval** (typically 1-3 business days)

### Review Process

**Timeline**: 1-7 business days (average 2-3 days)

**What Google Reviews**:
- Functionality matches description
- No malware or security issues
- Privacy policy compliance
- Manifest V3 compliance
- Permissions justified

**Possible Outcomes**:
- ✅ **Approved**: Extension published
- ⚠️ **Rejected**: Reasons provided, fix and resubmit
- 🔄 **Additional Review**: Might take longer

### After Publication

1. **Extension is live** at:
   ```
   https://chrome.google.com/webstore/detail/[your-extension-id]
   ```

2. **Share your extension**:
   - Add "Available in Chrome Web Store" badge to website
   - Share on social media
   - Submit to extension directories

3. **Monitor analytics** (in Developer Dashboard):
   - Installs
   - Ratings
   - Reviews
   - Crashes

### Updating Extension

```bash
# 1. Update version in manifest.json
{
  "version": "1.1.0"  // Increment version
}

# 2. Build new version
npm run build

# 3. Create new zip
cd dist
zip -r ../realityradar-extension-v1.1.0.zip .

# 4. Upload to Developer Dashboard
# - Go to your extension page
# - Click "Upload Updated Package"
# - Select new zip
# - Describe changes
# - Submit for review
```

**Update Review**: Typically faster than initial review (1-2 days)

---

## 🌐 Self-Hosting

### Option 1: Vercel (Recommended for Web App)

#### Prerequisites
- GitHub account
- Vercel account (free tier available)

#### Steps

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework Preset: Vite
   - Click "Deploy"

3. **Configure Environment Variables**:
   - In Vercel dashboard: Settings > Environment Variables
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     VITE_SUPABASE_PROJECT_ID=your_project_id
     ```

4. **Deploy**:
   - Automatic on every push to main
   - Manual: Click "Redeploy" in Vercel dashboard

**Your app will be live at**: `https://your-project.vercel.app`

#### Custom Domain on Vercel

1. Go to Settings > Domains
2. Add your domain
3. Configure DNS (Vercel provides instructions)
4. SSL auto-configured

### Option 2: Netlify

Similar to Vercel:

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Authorize and select repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**:
   - Site settings > Build & deploy > Environment
   - Add Supabase variables

4. **Deploy**: Auto-deployed on push

### Option 3: Docker (Self-Hosted)

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
  listen 80;
  server_name localhost;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

#### Build and Run

```bash
# Build image
docker build -t realityradar:latest .

# Run container
docker run -d \
  -p 80:80 \
  --name realityradar \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  realityradar:latest

# Check logs
docker logs realityradar

# Access at http://localhost
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
    restart: unless-stopped
```

```bash
# Run with compose
docker-compose up -d
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | `ixsvjm...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_VISION_API_KEY` | Google Vision API key (server-side only) | - |
| `VITE_APP_VERSION` | App version display | package.json version |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` |

### Setting Environment Variables

**Local Development** (`.env`):
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

**Vercel**:
1. Project Settings > Environment Variables
2. Add each variable
3. Select environment (Production, Preview, Development)
4. Save

**Netlify**:
1. Site settings > Build & deploy > Environment
2. Add variables
3. Clear cache and redeploy

**Docker**:
```bash
docker run -e VITE_SUPABASE_URL=... -e VITE_SUPABASE_ANON_KEY=... ...
```

---

## ✅ Post-Deployment

### 1. Verify Deployment

**Checklist**:
- [ ] App loads without errors
- [ ] File upload works
- [ ] Image analysis completes
- [ ] Results display correctly
- [ ] Quiz functions properly
- [ ] No console errors

**Test URLs**:
- Production: Your deployed URL
- Test images: Use known deepfake samples

### 2. Monitor Performance

**Tools**:
- **Lighthouse** (Chrome DevTools):
  ```bash
  # Run audit
  # Chrome DevTools > Lighthouse > Generate Report
  ```
  Target scores:
  - Performance: >90
  - Accessibility: >90
  - Best Practices: >90
  - SEO: >90

- **Web Vitals**:
  - Largest Contentful Paint (LCP): <2.5s
  - First Input Delay (FID): <100ms
  - Cumulative Layout Shift (CLS): <0.1

### 3. Set Up Monitoring

**Error Tracking** (recommended):
- [Sentry](https://sentry.io): Free tier available
- [LogRocket](https://logrocket.com): Session replay
- [Rollbar](https://rollbar.com): Error tracking

**Analytics** (optional):
- Google Analytics
- Plausible (privacy-focused)
- Fathom (privacy-focused)

### 4. SEO Optimization

**Checklist**:
- [ ] Sitemap.xml created
- [ ] robots.txt configured
- [ ] Meta tags optimized
- [ ] Open Graph images set
- [ ] Schema.org markup added

**Example sitemap.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://realityradar.app/</loc>
    <lastmod>2025-01-09</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 5. Security Headers

**Recommended headers** (configure in hosting platform):
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://ixsvjmofdzohiltskejt.supabase.co
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

<div align="center">

**Deployment Complete! 🎉**

[Back to Main README](../README.md) | [Technical Docs](./TECHNICAL.md) | [Development Guide](./DEVELOPMENT.md)

</div>

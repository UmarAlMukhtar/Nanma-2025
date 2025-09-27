# NANMA Family Event Registration - Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- MongoDB Atlas cluster (your current connection string is ready)

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `UmarAlMukhtar/Nanma-2025`
4. Set the root directory to `frontend`
5. Vercel will auto-detect Next.js and configure build settings

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel --prod
```

### 3. Environment Variables Setup

Add these environment variables in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://umar:jUUcWPr4NpmhxJON@cluster0.alovtei.mongodb.net/nanma?retryWrites=true&w=majority&appName=Cluster0` | Your MongoDB Atlas connection |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Replace with your actual Vercel domain |
| `NEXTAUTH_SECRET` | `your-secret-key-here-change-in-production` | Generate a strong secret (32+ chars) |
| `JWT_SECRET` | `your_jwt_secret` | Use a strong JWT secret |
| `ADMIN_EMAIL` | `umar@lbscek.ac.in` | Admin login email |
| `ADMIN_PASSWORD_HASH` | `$2a$12$wIgtHrCoQEXVvTAohFXsauTWSG6tCzV125LCuXkK96xwUrRKkwMBq` | Pre-hashed admin password |

### 4. Security Recommendations

#### Generate Strong Secrets:
```bash
# Generate NEXTAUTH_SECRET (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Update Environment Variables:
- Replace `NEXTAUTH_SECRET` with a generated 32+ character string
- Replace `JWT_SECRET` with a generated 64+ character string
- Update `NEXTAUTH_URL` to your actual Vercel domain after deployment

### 5. Domain Configuration

After deployment:
1. Note your Vercel domain (e.g., `nanma-family-fest.vercel.app`)
2. Update `NEXTAUTH_URL` environment variable with the actual domain
3. Redeploy if necessary

### 6. Custom Domain (Optional)

To use a custom domain:
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

### 7. Monitoring & Logs

- View deployment logs in Vercel Dashboard
- Monitor function performance and errors
- Set up alerts for downtime

## 📋 Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Registration form works
- [ ] Admin login functions (`/admin`)
- [ ] Database connections are stable
- [ ] CSV export works
- [ ] Check-in functionality works
- [ ] All environment variables are secure

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `next.config.ts` - Next.js production optimizations
- `.env.example` - Environment variables template

## 🌐 Live URL

After deployment, your application will be available at:
- Vercel domain: `https://your-project-name.vercel.app`
- Custom domain: `https://your-domain.com` (if configured)

## 🆘 Troubleshooting

### Common Issues:
1. **Environment Variables**: Ensure all variables are set in Vercel Dashboard
2. **MongoDB Connection**: Verify connection string and whitelist Vercel IPs (0.0.0.0/0)
3. **Build Errors**: Check build logs in Vercel Dashboard
4. **Function Timeout**: API routes have 30-second timeout (configured in vercel.json)

### Support:
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Deployment: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
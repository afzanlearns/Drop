# 🚀 Complete Deployment Commands

## ✅ Prerequisites

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

---

## 📦 Option 1: Deploy to Vercel (Requires Code Refactoring)

### Step 1: Deploy Backend

```bash
# Navigate to server directory
cd instant-rooms/server

# Deploy to Vercel (preview)
vercel

# Deploy to production
vercel --prod

# Note your backend URL (e.g., https://instant-rooms-server.vercel.app)
```

### Step 2: Deploy Frontend

```bash
# Navigate to client directory
cd ../client

# Create production environment file
# Replace YOUR_BACKEND_URL with your actual backend URL from Step 1
echo "VITE_API_URL=https://YOUR_BACKEND_URL.vercel.app/api" > .env.production

# Deploy to Vercel (preview)
vercel

# Deploy to production
vercel --prod

# Note your frontend URL (e.g., https://instant-rooms.vercel.app)
```

### Step 3: Update Backend CORS

```bash
# Update environment variable via CLI
cd ../server
vercel env add CLIENT_URL production

# When prompted, enter your frontend URL from Step 2
# Example: https://instant-rooms.vercel.app

# Redeploy backend with new env var
vercel --prod
```

### ⚠️ Important: Vercel Limitations

The app will NOT work fully on Vercel without these changes:
- Replace in-memory storage with Vercel KV
- Replace file system with Vercel Blob Storage
- See DEPLOYMENT.md for details

---

## 🚂 Option 2: Deploy to Railway (Works Immediately - RECOMMENDED)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize Railway project in root
cd c:\Users\khana\Documents\drop
railway init

# Deploy backend
cd instant-rooms/server
railway up

# Get backend URL from Railway dashboard
# Example: https://instant-rooms-server-production.up.railway.app

# Deploy frontend
cd ../client

# Create production environment file with Railway backend URL
echo "VITE_API_URL=https://YOUR_RAILWAY_BACKEND_URL.up.railway.app/api" > .env.production

# Deploy frontend
railway up

# Get frontend URL from Railway dashboard
```

### Update Railway Backend CORS:
1. Go to Railway dashboard
2. Select your server project
3. Add environment variable:
   - Key: `CLIENT_URL`
   - Value: Your frontend Railway URL
4. Redeploy the backend

---

## 🎯 Option 3: Deploy to Render

### Backend:

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your Git repository
4. Settings:
   - **Name**: instant-rooms-server
   - **Root Directory**: instant-rooms/server
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variable:
   - `CLIENT_URL` = (add after frontend deployment)
6. Click "Create Web Service"

### Frontend:

1. New → Static Site
2. Connect your Git repository
3. Settings:
   - **Name**: instant-rooms-client
   - **Root Directory**: instant-rooms/client
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
4. Add environment variable:
   - `VITE_API_URL` = Your backend URL + `/api`
5. Click "Create Static Site"

### Update Backend CORS:
- Go back to backend service settings
- Update `CLIENT_URL` environment variable with frontend URL
- Manually deploy → "Deploy latest commit"

---

## 🔍 Verify Deployment

```bash
# Test backend health endpoint
curl https://YOUR_BACKEND_URL/health

# Expected response:
# {"status":"ok","timestamp":"..."}

# Open frontend in browser
start https://YOUR_FRONTEND_URL
```

---

## 🔄 Redeploy After Changes

### Vercel:
```bash
# Backend
cd instant-rooms/server
vercel --prod

# Frontend
cd instant-rooms/client
vercel --prod
```

### Railway:
```bash
# Backend
cd instant-rooms/server
railway up

# Frontend
cd instant-rooms/client
railway up
```

### Render:
- Push to Git
- Render auto-deploys on push (if enabled)
- Or manually trigger from dashboard

---

## 📝 Environment Variables Summary

### Backend (.env or platform dashboard):
```
PORT=4000                                  # Optional, auto-set on most platforms
CLIENT_URL=https://your-frontend-url.com   # Required for CORS
```

### Frontend (.env.production):
```
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🐛 Troubleshooting

### CORS Errors:
```bash
# Check if CLIENT_URL is set correctly on backend
vercel env ls

# Update if needed
vercel env rm CLIENT_URL production
vercel env add CLIENT_URL production
```

### 404 Errors on API Calls:
- Verify `VITE_API_URL` in frontend .env.production
- Must end with `/api`
- No trailing slash

### Build Failures:
```bash
# Clear cache and rebuild locally first
cd instant-rooms/client
rm -rf node_modules dist
npm install
npm run build

cd ../server
rm -rf node_modules dist
npm install
npm run build
```

### Check Logs:
```bash
# Vercel
vercel logs

# Railway
railway logs

# Render
# View logs in dashboard
```

---

## 🎉 Quick Deploy Checklist

- [ ] Install deployment CLI
- [ ] Login to platform
- [ ] Deploy backend
- [ ] Copy backend URL
- [ ] Create frontend .env.production with backend URL
- [ ] Deploy frontend
- [ ] Copy frontend URL
- [ ] Update backend CLIENT_URL env var
- [ ] Redeploy backend
- [ ] Test the app

---

## 💡 Recommendation

For **fastest deployment without code changes**: Use **Railway**

For **Vercel deployment**: Read [DEPLOYMENT.md](DEPLOYMENT.md) for required storage migrations

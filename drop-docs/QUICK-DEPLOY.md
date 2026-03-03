# Quick Deploy to Vercel

## 1️⃣ Deploy Backend
```bash
cd instant-rooms/server
vercel --prod
# Copy the URL (e.g., https://instant-rooms-api.vercel.app)
```

## 2️⃣ Deploy Frontend
```bash
cd ../client

# Create .env.production with your backend URL
echo "VITE_API_URL=https://YOUR-BACKEND-URL.vercel.app/api" > .env.production

vercel --prod
# Copy the URL (e.g., https://instant-rooms.vercel.app)
```

## 3️⃣ Update Backend CORS
- Go to Vercel Dashboard → Your Server Project
- Settings → Environment Variables
- Set `CLIENT_URL` = your frontend URL
- Redeploy

---

## ⚠️ Critical: Storage Issues

**This app won't fully work on Vercel without changes!**

### Why?
- Uses in-memory storage (lost between requests)
- Uses local file system (read-only on Vercel)

### Solutions:
1. **Migrate to Vercel KV + Blob** (requires code changes)
2. **Use Railway/Render instead** (works as-is)

---

## Quick Deploy to Railway (Alternative)
```bash
npm install -g @railway/cli
railway login

# Deploy server
cd instant-rooms/server
railway up

# Deploy client  
cd ../client
railway up
```

**Railway works immediately - no code changes needed!**

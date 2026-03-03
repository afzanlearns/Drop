# Vercel Deployment Guide

This guide walks you through deploying **Instant Rooms** to Vercel.

## 📋 Prerequisites

Before you begin:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Have your project ready** - Ensure the project is working locally

---

## 🚀 Deployment Steps

### Step 1: Deploy the Backend Server

1. **Navigate to server directory**:
   ```bash
   cd instant-rooms/server
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   - Select or create a new project
   - Choose "No" for "Want to override the settings?"
   - Wait for deployment to complete

3. **Deploy to production**:
   ```bash
   vercel --prod
   ```

4. **Copy your backend URL** (e.g., `https://instant-rooms-api.vercel.app`)

5. **Set environment variable**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your server project
   - Go to Settings → Environment Variables
   - Add: `CLIENT_URL` = (leave blank for now, update after frontend deployment)

---

### Step 2: Deploy the Frontend Client

1. **Navigate to client directory**:
   ```bash
   cd ../client
   ```

2. **Create production environment file**:
   ```bash
   # Create .env.production
   echo "VITE_API_URL=https://your-backend-url.vercel.app/api" > .env.production
   ```
   
   Replace `your-backend-url` with your actual backend URL from Step 1.4

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   - Select or create a new project
   - Accept default settings
   - Wait for deployment

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

5. **Copy your frontend URL** (e.g., `https://instant-rooms.vercel.app`)

---

### Step 3: Update Backend CORS Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **server** project
3. Go to Settings → Environment Variables
4. Update `CLIENT_URL` with your frontend URL from Step 2.5
5. Go to Deployments tab
6. Click "..." on the latest deployment → "Redeploy"

---

## ⚠️ Important Limitations

### Current Implementation Issues for Vercel

This project was designed for traditional servers and has limitations on Vercel:

#### 1. **In-Memory Storage**
- Currently uses JavaScript `Map` for storing rooms
- **Problem**: Vercel serverless functions are stateless
- **Solution**: Migrate to **Vercel KV** (Redis) or **Upstash Redis**

#### 2. **File System Storage**
- Currently stores uploads in `uploads/` folder
- **Problem**: Vercel has a read-only file system
- **Solution**: Migrate to **Vercel Blob**, **AWS S3**, or **Cloudflare R2**

#### 3. **Background Jobs**
- Currently uses `setInterval` for cleanup
- **Problem**: Serverless functions don't support long-running processes
- **Solution**: Use **Vercel Cron Jobs**

#### 4. **Function Timeouts**
- Large file exports may timeout
- **Hobby Plan**: 10-second limit
- **Pro Plan**: 60-second limit

---

## 🔄 Alternative Deployment Options

If you want to deploy without major refactoring:

### Option 1: Railway (Recommended for Quick Deploy)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy server
cd server
railway up

# Deploy client
cd ../client
railway up
```

**Benefits**:
- Persistent file system
- Long-running processes
- Simpler than Vercel for full-stack apps
- Free tier available

### Option 2: Render

1. Create two services:
   - **Web Service** for backend (select "server" folder)
   - **Static Site** for frontend (select "client" folder)

2. Set build commands:
   - Backend: `npm install && npm run build`
   - Frontend: `npm install && npm run build`

3. Set start command for backend: `npm start`

**Benefits**:
- Zero-config deploys
- Free tier (with limitations)
- Persistent disk storage

### Option 3: Traditional VPS

Deploy on DigitalOcean, Linode, AWS EC2, etc.:

```bash
# On your server
git clone <your-repo>

# Install dependencies
cd instant-rooms/server && npm install && npm run build
cd ../client && npm install && npm run build

# Use PM2 to run the backend
npm install -g pm2
pm2 start server/dist/index.js --name instant-rooms

# Serve the client with nginx
sudo cp -r client/dist/* /var/www/html/
```

---

## 🔧 Migrating to Vercel-Compatible Storage

### Replace In-Memory Storage with Vercel KV

1. **Install Vercel KV**:
   ```bash
   cd server
   npm install @vercel/kv
   ```

2. **Create KV store** in Vercel Dashboard

3. **Update roomService.ts** to use KV instead of Map

4. **Example**:
   ```typescript
   import { kv } from '@vercel/kv';
   
   // Instead of: rooms.set(code, room)
   await kv.set(`room:${code}`, room);
   
   // Instead of: rooms.get(code)
   await kv.get(`room:${code}`);
   ```

### Replace File Storage with Vercel Blob

1. **Install Vercel Blob**:
   ```bash
   npm install @vercel/blob
   ```

2. **Update contentService.ts** to use Blob storage

3. **Example**:
   ```typescript
   import { put } from '@vercel/blob';
   
   const blob = await put(filename, file, {
     access: 'public',
   });
   // Use blob.url instead of local path
   ```

---

## 📊 Environment Variables Summary

### Backend (.env)
```bash
PORT=4000                          # Not needed on Vercel
CLIENT_URL=https://your-app.vercel.app
```

### Frontend (.env.production)
```bash
VITE_API_URL=https://your-api.vercel.app/api
```

---

## ✅ Testing Your Deployment

1. Visit your frontend URL
2. Create a new room
3. Try uploading files
4. Test text/code blocks
5. Verify exports work
6. Check if expiry works

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `CLIENT_URL` is set correctly on backend
- Redeploy backend after changing env vars

### 404 on API Calls
- Check `VITE_API_URL` in frontend `.env.production`
- Ensure it ends with `/api`

### Files Not Uploading
- Check Vercel function logs
- Verify file size is under 10MB
- Remember: File storage won't work without migration to Blob storage

### Functions Timing Out
- Check function execution time in Vercel logs
- Consider upgrading to Pro plan for 60s timeout
- Or use alternative platform (Railway, Render)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

---

**Note**: For a production-ready deployment on Vercel, you'll need to refactor the storage layer. Consider Railway or Render for a simpler deployment without code changes.

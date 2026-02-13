# Drop - Development Guide

This guide will help you set up and run Drop locally for development.

## Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Git** (optional, for version control)

## Initial Setup

### 1. Install Dependencies

From the project root:

```bash
npm run install:all
```

This will install dependencies for the root, client, and server.

### 2. Database Setup

Start your PostgreSQL server and create a database:

```sql
CREATE DATABASE drop;
```

### 3. Environment Configuration

#### Server Environment

Copy the server environment example:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/drop

# Storage (use 'local' for development)
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./storage/uploads

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Room settings
ROOM_TTL_DAYS=7
MAX_FILE_SIZE=52428800

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Client Environment

Copy the client environment example:

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Database Migration

Run Prisma migrations to set up the database schema:

```bash
cd server
npx prisma migrate dev
```

This will:
- Apply migrations to your database
- Generate the Prisma Client
- Create the necessary tables

### 5. (Optional) Seed Database

You can manually create a room via the API or interface once running.

## Running the Application

### Development Mode

From the project root, run both client and server simultaneously:

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

Or run them separately:

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### Production Build

Build both projects:

```bash
npm run build
```

Start production server:

```bash
npm run start:prod
```

The server will serve the built client files.

## Project Structure

```
drop/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── api/        # API client
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── stores/     # Zustand stores
│   │   └── App.tsx     # Root component
│   └── package.json
│
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Express middleware
│   │   ├── jobs/       # Background jobs
│   │   └── index.ts    # Entry point
│   ├── prisma/         # Database schema
│   └── package.json
│
├── shared/              # Shared TypeScript types
│   └── types.ts
│
├── docs/                # Documentation
│   ├── architecture.md
│   ├── storage.md
│   └── lifecycle.md
│
└── README.md
```

## Common Development Tasks

### View Database

Use Prisma Studio to view and edit data:

```bash
cd server
npm run studio
```

Opens at http://localhost:5555

### Run Migrations

Create a new migration:

```bash
cd server
npx prisma migrate dev --name migration_name
```

Apply migrations in production:

```bash
npx prisma migrate deploy
```

### Reset Database

⚠️ This will delete all data:

```bash
cd server
npx prisma migrate reset
```

### Lint Code

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Testing the Application

### Create a Room

1. Open http://localhost:5173
2. Click "Create Room"
3. You'll be redirected to `/room/{id}`

### Add Content

**Text:**
- Type in the bottom textarea
- Press Ctrl/Cmd + Enter or click "Drop"

**Code:**
- Switch to "Code" mode
- Paste code
- Press Ctrl/Cmd + Enter or click "Drop"

**Files:**
- Drag images or PDFs anywhere on the page
- Or click the file input (if implemented)

### Export Room

- Click "Export" button in the header
- Downloads a ZIP file with all room content

## Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `server/.env`
- Verify database exists: `psql -U postgres -c "\l"`

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
- Kill the process using the port: `lsof -ti:3000 | xargs kill`
- Or change the port in `server/.env`

### Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
cd server
npx prisma generate
```

### Storage Directory Missing

**Error:** `ENOENT: no such file or directory`

**Solution:**
The directory will be created automatically. If not:
```bash
mkdir -p server/storage/uploads
```

## Environment-Specific Notes

### Using S3 Storage (Production)

Update `server/.env`:

```env
STORAGE_TYPE=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

Ensure your S3 bucket is created and has proper permissions.

### Running Behind a Proxy

If deploying behind Nginx or similar:

```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Debugging

### Server Logs

Server logs are output to console with timestamps. In production, consider using a logging service.

### Client Errors

Open browser DevTools (F12) to view:
- Console errors
- Network requests
- React component tree

### Database Queries

Enable Prisma query logging in `server/src/services/database.ts`:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Next Steps

- Read `/docs/architecture.md` for system design
- Read `/docs/storage.md` for storage strategy
- Read `/docs/lifecycle.md` for room lifecycle
- Customize styling in `client/tailwind.config.js`
- Add new features or modify existing ones

## Getting Help

- Review documentation in `/docs`
- Check GitHub issues (if applicable)
- Review code comments for implementation details

---

**Happy coding!** 🚀

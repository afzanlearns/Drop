# Instant Rooms

> Drop anything. Share instantly. No accounts required.

A lightweight, room-based content sharing platform for frictionless collaboration. Create a room, share the code, and drop files, text, images, or PDFs in seconds.

---

## Features

- **Instant room creation** — 8-character secure alphanumeric codes, collision-safe
- **Multi-format content** — Text blocks, code with syntax highlighting, images with preview, inline PDF viewer, file blobs
- **Smart detection** — Auto-detects code vs text on paste
- **Timeline** — Chronological content feed with lazy-loaded heavy assets
- **Access modes** — Full access, read-only, or drop-only (anonymous posting)
- **Version history** — Snapshot-based time travel and state restoration
- **Export** — ZIP, Markdown, or PDF export of all room content
- **Expiry management** — 1h / 24h / 7 days, or pin for permanent rooms
- **Rate limiting** — Per-IP protection against abuse
- **File validation** — 10MB max, MIME type validation

---

## Tech Stack

| Layer     | Technology                                               |
|-----------|----------------------------------------------------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS v3              |
| State     | Zustand                                                  |
| UI Motion | Framer Motion                                            |
| Icons     | @phosphor-icons/react                                    |
| Uploads   | react-dropzone                                           |
| PDF View  | react-pdf (PDF.js)                                       |
| Syntax    | Prism.js                                                 |
| Backend   | Node.js, Express, TypeScript                             |
| Validation| Zod                                                      |
| Storage   | In-memory (Map) + local disk for files                   |
| Uploads   | Multer                                                   |
| Export    | archiver (ZIP), pdfkit (PDF)                             |

---

## Project Structure

```
instant-rooms/
├── shared/
│   └── types.ts              # Shared TypeScript interfaces
├── server/
│   ├── src/
│   │   ├── index.ts          # Express entry point
│   │   ├── routes/
│   │   │   ├── rooms.ts
│   │   │   ├── content.ts
│   │   │   └── export.ts
│   │   ├── services/
│   │   │   ├── roomService.ts
│   │   │   ├── contentService.ts
│   │   │   └── exportService.ts
│   │   ├── middleware/
│   │   │   ├── rateLimit.ts
│   │   │   └── errorHandler.ts
│   │   └── utils/
│   │       └── roomCode.ts
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   └── RoomPage.tsx
│   │   ├── components/
│   │   │   ├── room/
│   │   │   │   ├── RoomHeader.tsx
│   │   │   │   ├── DropZone.tsx
│   │   │   │   ├── Timeline.tsx
│   │   │   │   └── HistoryPanel.tsx
│   │   │   ├── content/
│   │   │   │   ├── ContentItem.tsx
│   │   │   │   ├── TextBlock.tsx
│   │   │   │   ├── CodeBlock.tsx
│   │   │   │   ├── ImageBlock.tsx
│   │   │   │   ├── PDFBlock.tsx
│   │   │   │   └── FileBlob.tsx
│   │   │   └── ui/
│   │   │       └── Toast.tsx
│   │   ├── store/
│   │   │   └── roomStore.ts
│   │   ├── utils/
│   │   │   └── api.ts
│   │   └── tests/
│   │       └── properties.test.ts
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── uploads/                  # Server-side file storage (auto-created)
└── README.md
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Start the server

```bash
cd server
npm install
npm run dev
```

Server runs on **http://localhost:4000**

### 2. Start the client (new terminal)

```bash
cd client
npm install
npm run dev
```

Client runs on **http://localhost:5173**

### 3. Build for production

```bash
# Server
cd server && npm run build && npm start

# Client
cd client && npm run build
```

---

## API Reference

### Rooms

| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| POST   | `/api/rooms`                 | Create a new room        |
| GET    | `/api/rooms/:code`           | Get room details         |
| PATCH  | `/api/rooms/:code/access`    | Update access mode       |
| PATCH  | `/api/rooms/:code/expiry`    | Update expiry duration   |
| PATCH  | `/api/rooms/:code/pin`       | Pin/unpin room           |
| GET    | `/api/rooms/:code/history`   | Get version snapshots    |
| POST   | `/api/rooms/:code/restore`   | Restore to snapshot      |

### Content

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | `/api/content/text`         | Add text or code block   |
| POST   | `/api/content/upload`       | Upload a file            |
| GET    | `/api/content/:roomCode`    | List room content        |
| DELETE | `/api/content/:contentId`   | Delete a content item    |

### Export

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | `/api/export/:roomCode/zip` | Export as ZIP            |
| POST   | `/api/export/:roomCode/md`  | Export as Markdown       |
| POST   | `/api/export/:roomCode/pdf` | Export as PDF            |

---

## Running Tests

```bash
cd client
npm test
```

Tests cover:
- **Property 1**: Room code uniqueness and security (100 iterations)
- **Property 3**: Content storage round-trip integrity
- **Property 5**: Timeline chronological ordering (100 iterations)

---

## Deploying to Vercel

This application consists of a separate frontend and backend that need to be deployed independently.

### Prerequisites
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- Vercel account

### Step 1: Deploy the Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. Note your backend URL (e.g., `https://instant-rooms-server.vercel.app`)

4. Set environment variables in Vercel dashboard:
   - `CLIENT_URL` - Your frontend URL (set after deploying frontend)

### Step 2: Deploy the Frontend

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Create a `.env.production` file:
   ```bash
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

4. Note your frontend URL (e.g., `https://instant-rooms.vercel.app`)

### Step 3: Update Backend CORS

1. Go to your backend project on Vercel dashboard
2. Update the `CLIENT_URL` environment variable with your frontend URL
3. Redeploy the backend for changes to take effect

### Important: Production Considerations

⚠️ **This project uses in-memory storage and local file system, which are NOT suitable for Vercel production deployments.**

For production, you need to:

1. **Replace in-memory storage** (currently using JavaScript `Map`):
   - Use **Vercel KV** (Redis)
   - Or **Upstash Redis**
   - Or a PostgreSQL database (Vercel Postgres)

2. **Replace local file storage** (currently using `uploads/` folder):
   - Use **Vercel Blob Storage**
   - Or **AWS S3**
   - Or **Cloudflare R2**
   - Update the file upload/serving logic accordingly

3. **Serverless function limitations**:
   - Vercel functions have a 10-second execution timeout (Hobby) or 60-second (Pro)
   - Consider breaking up long-running export operations
   - Background cleanup jobs won't work; use Vercel Cron Jobs instead

### Alternative: Use a Traditional VPS

For a simpler deployment without refactoring, consider:
- **Railway**, **Render**, or **Fly.io** - These support persistent file systems and long-running processes
- Traditional VPS (DigitalOcean, Linode, AWS EC2)

---

## Environment Variables

### Server
| Variable    | Default                   | Description            |
|-------------|---------------------------|------------------------|
| PORT        | 4000                      | Server port            |
| CLIENT_URL  | http://localhost:5173      | CORS origin            |

---

## Design Decisions

- **In-memory storage**: Rooms and content are stored in JavaScript `Map` objects. Data is lost on server restart — suitable for development and demo purposes.
- **File storage**: Uploaded files are stored in the `../uploads/` directory relative to the server.
- **Room code entropy**: ~41 bits using a 56-character charset excluding ambiguous characters (0, O, I, l, 1).
- **Background cleanup**: Expired rooms are cleaned up every 5 minutes via `setInterval`.
- **Rate limiting**: 200 requests per IP per 15 minutes; stricter 30 uploads per 15 minutes.

---

## Correctness Properties (from Design Doc)

All properties reference the design document specification:

| Property | Description | Validated By |
|----------|-------------|--------------|
| P1 | Room code uniqueness and security | Unit tests |
| P2 | Room access control enforcement | Integration |
| P3 | Content storage round-trip integrity | Unit tests |
| P4 | Content type detection and processing | Service logic |
| P5 | Timeline chronological ordering | Unit tests |
| P6 | Version history preservation | Service logic |
| P7 | Export completeness | Manual testing |
| P8 | Room expiry management | Service logic |
| P9 | Security validation and rate limiting | Middleware |
| P10 | Performance requirements | Architecture |

---

*Built with TypeScript throughout. No `any` types.*

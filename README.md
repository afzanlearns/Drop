# Drop

> **Drop anything. Share instantly. No accounts required.**

A real-time, ephemeral content sharing platform. Create a room in one click, share the code, and collaborate — no signups, no friction.

---

## Features

### Instant Rooms
- Generate a unique room in one click
- Optional custom room codes (upper + digits)
- Share the code, anyone joins immediately

### Content Types
- **Text** — paste or type, auto-expand for long content
- **Code** — auto-detected with Prism.js syntax highlighting (JS, TS, Python, Rust, Go, Java, PHP, CSS, SQL, Bash, JSON, HTML)
- **Images** — drag-and-drop with inline preview and lightbox zoom
- **PDFs** — inline page-by-page viewer with zoom
- **Files** — any file up to 10MB, rendered as a downloadable blob

### Access Controls
- **Full Access** — view, upload, delete
- **Read Only** — view only
- **Drop Only** — upload only, cannot view room content

### Lifecycle Management
- Auto-delete per item: 1 hour / 6 hours / 24 hours
- Room expiry: 1 hour / 24 hours / 7 days
- Pin items or rooms to keep them indefinitely

### Collaboration
- Optional display name per upload
- Uploader attribution on each item
- Tag items with custom labels for filtering

### Note on Uploads
- Attach a text note to any upload (file, text, or code)
- Notes are displayed inline below the content

### Upload Confirmation
- Before any upload or text submission, a confirmation modal shows a summary (file names/sizes, content preview, title, note, tags, expiry)
- Confirm or cancel before the upload goes through

### Version History
- Automatic snapshot-based version history
- Restore entire room to any previous state

### Export
- Export room as ZIP archive
- Export as Markdown document
- Export as PDF report

---

## Design Philosophy

**AFZAN brutalist-minimal** — utility-first, unapologetically raw.

| Property | Value |
|----------|-------|
| Font | Geist Mono (monospace only) |
| Accent | `#D42B2B` (red) |
| Border radius | `0` (none) |
| Shadows | `none` |
| Icons | Inline `<svg>` elements using `currentColor` |
| Transitions | Only interactive hovers (border/color changes) |
| Theme | Dark first, with light mode via `[data-theme="light"]` |

### Color Tokens

| Token | Dark | Light |
|-------|------|-------|
| `--bg-base` | `#0C0C0C` | `#FAFAFA` |
| `--bg-surface` | `#141414` | `#F2F2F2` |
| `--bg-elevated` | `#1C1C1C` | `#E8E8E8` |
| `--border-subtle` | `#222222` | `#E0E0E0` |
| `--border-default` | `#2E2E2E` | `#D0D0D0` |
| `--text-primary` | `#F0EDE6` | `#0C0C0C` |
| `--text-secondary` | `#8A8A8A` | `#5A5A5A` |
| `--accent` | `#D42B2B` | `#D42B2B` |
| `--accent-dim` | `#1F0A0A` | `#F5E0E0` |

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v3** with custom CSS custom properties
- **Zustand** (state management)
- **react-dropzone** (file drag-and-drop)
- **react-pdf** (PDF viewer)
- **Prism.js** (syntax highlighting)
- **date-fns** (relative time formatting)
- **axios** (HTTP client)
- **Geist Mono** (Google Fonts)

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **Multer** (file uploads)
- **Zod** (request validation)
- **archiver** (ZIP export)
- **pdfkit** (PDF export)

### Storage
- **In-memory** (content items, rooms, history snapshots)
- **Local filesystem** (uploaded files in `../uploads/`)

---

## Project Structure

```
instant-rooms/
  shared/
    types.ts               # Shared TypeScript types (client + server)

  server/
    src/
      index.ts             # Express entry point
      routes/
        rooms.ts           # Room CRUD
        content.ts         # Content management (text, code, file upload)
        export.ts          # ZIP / Markdown / PDF export
      services/
        roomService.ts     # Room business logic
        contentService.ts  # Content business logic
        exportService.ts   # Export logic
      middleware/
        rateLimit.ts       # Per-IP rate limiting

  client/
    src/
      pages/
        LandingPage.tsx    # Hero, About, Features, FAQ, Footer
        RoomPage.tsx       # Room layout (header + sidebar + timeline)
      components/
        layout/
          Navbar.tsx       # Site navigation with SVG icons
          ThemeToggle.tsx  # Dark/light toggle with sun/moon SVGs
        room/
          RoomHeader.tsx   # Room controls, view modes, access/expiry/export
          DropZone.tsx     # File drop zone, text/code input, tags, note, auto-delete, confirmation modal
          Timeline.tsx     # Content feed with tag filters
          BoardView.tsx    # Kanban-style board layout
          BoardColumn.tsx  # Single board column
          HistoryPanel.tsx # Version history sidebar
          QRModal.tsx      # Share QR code modal
        content/
          ContentItem.tsx  # Card wrapper with type badge, pin/delete, tags, note display
          TextBlock.tsx    # Text content with copy + download (if fileUrl present)
          CodeBlock.tsx    # Code content with syntax highlight, copy + download
          ImageBlock.tsx   # Image preview with lightbox + download
          PDFBlock.tsx     # PDF viewer with page nav, zoom, download
          FileBlob.tsx     # Generic file download button
          ExpiryBadge.tsx  # Countdown badge
        ui/
          Toast.tsx        # Notification toasts
      hooks/
        useTheme.ts        # Theme management (localStorage + prefers-color-scheme)
        useCreator.ts      # Creator token verification
        useGuestName.ts    # Guest display name
      store/
        roomStore.ts       # Zustand store for all room state
      utils/
        api.ts             # Axios API client
        downloadFile.ts    # Cross-origin safe file download utility
      styles.css           # All CSS custom properties, base styles, component styles
    tailwind.config.ts     # Tailwind theme tokens
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/afzanlearns/Drop.git
cd Drop/instant-rooms

# Install server
cd server && npm install

# Install client
cd ../client && npm install
```

### 2. Start Backend
```bash
cd server
npm run dev
```
Backend runs on `http://localhost:4000`

### 3. Start Frontend (new terminal)
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

### 4. Open in Browser
Navigate to `http://localhost:5173` and create a room.

---

## API Overview

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rooms` | Create a room |
| GET | `/api/rooms/:code` | Get room details |
| PATCH | `/api/rooms/:code/access` | Change access mode |
| PATCH | `/api/rooms/:code/expiry` | Update expiry duration |
| PATCH | `/api/rooms/:code/pin` | Pin/unpin room |
| GET | `/api/rooms/:code/history` | Get version snapshots |
| POST | `/api/rooms/:code/restore` | Restore to snapshot |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/content/text` | Add text or code block (supports `note`) |
| POST | `/api/content/upload` | Upload file (supports `note`) |
| GET | `/api/content/:roomCode` | List room content |
| PATCH | `/api/content/:id/pin` | Pin/unpin item |
| PATCH | `/api/content/:id/tags` | Update tags |
| DELETE | `/api/content/:id` | Delete item |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/export/:roomCode/zip` | Download ZIP |
| POST | `/api/export/:roomCode/md` | Download Markdown |
| POST | `/api/export/:roomCode/pdf` | Download PDF |

---

## Deployment Notes

Current storage is **in-memory + local filesystem**. Suitable for VPS/VM deployment.

To make it serverless-ready, swap:
- In-memory storage → Upstash Redis / Vercel KV
- Local file storage → AWS S3 / Vercel Blob Storage

---

## License

MIT

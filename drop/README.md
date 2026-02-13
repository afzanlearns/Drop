# Drop

**A lightweight, room-based content sharing platform**

Drop allows users to instantly create shared rooms for storing and sharing text, code snippets, images, and PDFs. No accounts, no login, no friction—just paste a link and start dropping content.

## 🎯 Philosophy

Drop sits between Pastebin and Google Drive:
- Lighter than Drive
- Richer than Pastebin
- Calmer than Notion
- Zero friction

Built for teams, collaborators, and individuals who need to share content quickly without the overhead of traditional file-sharing platforms.

## ✨ Features

- **Instant Rooms**: Create shareable rooms with one click
- **Multi-Format Support**: Text, code, images, and PDFs
- **Smart Paste**: Auto-detects content type
- **Drag & Drop**: Drag files anywhere in a room
- **Temporary by Default**: Rooms expire automatically
- **One-Click Export**: Download room content as ZIP or Markdown
- **Dark Mode**: Easy on the eyes
- **No Accounts**: Zero friction, zero onboarding

## 🏗️ Architecture

### Frontend
- **React + Vite** for fast development and optimized builds
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **pdf.js** for PDF previews
- **react-dropzone** for drag & drop
- **Zustand** for state management

### Backend
- **Node.js + Express** REST API
- **TypeScript** for consistency
- **PostgreSQL** for metadata storage
- **Prisma ORM** for database access
- **S3-compatible storage** for file uploads
- **node-cron** for expiry cleanup

### Database
- Rooms with TTL support
- Room items with versioning
- Access tokens for security
- Metadata-only in PostgreSQL

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- S3-compatible object storage (or local filesystem)

### Installation

```bash
# Clone or extract the project
cd drop

# Install dependencies
npm run install:all

# Setup environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Configure your database and storage in server/.env

# Run database migrations
cd server && npx prisma migrate dev

# Start development servers
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:3000

### Production Build

```bash
# Build all projects
npm run build

# Start production server
npm run start:prod
```

## 📁 Project Structure

```
drop/
├── client/          # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   ├── prisma/
│   └── package.json
├── shared/          # Shared TypeScript types
│   └── types.ts
├── docs/            # Architecture documentation
│   ├── architecture.md
│   ├── storage.md
│   └── lifecycle.md
└── README.md
```

## 🔧 Configuration

### Server Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/drop
PORT=3000
NODE_ENV=development

# Storage
STORAGE_TYPE=s3  # or 'local'
S3_BUCKET=drop-content
S3_REGION=us-east-1
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret

# Security
MAX_FILE_SIZE=52428800  # 50MB in bytes
ROOM_TTL_DAYS=7
```

### Client Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

## 🎨 Features in Detail

### Room Creation
Users can create a new room instantly. Each room gets a unique, unguessable ID.

### Content Types
- **Text**: Plain text snippets with optional markdown support
- **Code**: Syntax-highlighted code blocks
- **Images**: Inline previews (JPG, PNG, GIF, WebP)
- **PDFs**: Scrollable inline previews

### Smart Detection
Drop automatically detects what you're pasting:
- URLs to images become embedded images
- Code-like text becomes syntax highlighted
- Everything else is formatted text

### Export Options
Download entire room contents as:
- **ZIP archive**: All files with original names
- **Markdown bundle**: Consolidated markdown document

## 🔒 Security

- **Unguessable IDs**: Rooms use cryptographically random IDs
- **No authentication**: Intentionally stateless
- **File validation**: MIME type and size checks
- **Rate limiting**: Prevents abuse
- **Temporary storage**: Auto-expiry reduces long-term exposure

## 📊 Database Schema

```prisma
model Room {
  id          String   @id
  createdAt   DateTime
  expiresAt   DateTime
  items       RoomItem[]
}

model RoomItem {
  id          String   @id
  roomId      String
  type        String
  content     String?
  fileKey     String?
  fileName    String?
  fileSize    Int?
  mimeType    String?
  createdAt   DateTime
  room        Room     @relation(fields: [roomId])
}
```

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test
```

### Code Quality

```bash
# Lint all projects
npm run lint

# Format code
npm run format
```

## 📚 Documentation

See the `/docs` folder for detailed documentation:
- **architecture.md**: System design and component overview
- **storage.md**: File storage strategy and lifecycle
- **lifecycle.md**: Room expiry and cleanup processes

## 🤝 Contributing

This is a reference implementation. Feel free to fork, modify, and adapt to your needs.

## 📄 License

MIT

## 🙏 Acknowledgments

Built with modern web technologies and a focus on simplicity and user experience.

---

**Drop**: Share content, not complexity.

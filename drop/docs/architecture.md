# Drop Architecture

## Overview

Drop is built as a modern, stateless web application with clear separation between frontend and backend concerns. The architecture prioritizes simplicity, performance, and maintainability.

## System Components

### Frontend (React + Vite)
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components (Landing, Room)
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # Zustand state management
│   ├── utils/          # Helper functions
│   ├── api/            # API client
│   └── styles/         # Global styles
```

**Responsibilities:**
- User interface rendering
- Client-side validation
- Optimistic UI updates
- Theme management
- API communication

**Key Libraries:**
- **React**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **react-dropzone**: Drag-and-drop file handling
- **pdf.js**: PDF rendering

### Backend (Node.js + Express)
```
server/
├── src/
│   ├── routes/         # API route handlers
│   ├── controllers/    # Business logic
│   ├── services/       # Core services (storage, database)
│   ├── middleware/     # Express middleware
│   ├── utils/          # Helper functions
│   └── jobs/           # Background jobs (expiry cleanup)
```

**Responsibilities:**
- REST API endpoints
- Database operations
- File storage orchestration
- Validation and security
- Background job processing

**Key Libraries:**
- **Express**: Web framework
- **Prisma**: ORM for PostgreSQL
- **multer**: Multipart form handling
- **node-cron**: Scheduled jobs
- **AWS SDK**: S3 integration (optional)

### Database (PostgreSQL)
```sql
- rooms         # Room metadata
- room_items    # Content items in rooms
```

**Design Principles:**
- Store metadata only
- No binary data in database
- Indexed queries for performance
- Foreign key constraints for integrity

### Storage Layer
Two supported backends:
1. **Local Filesystem**: Development and small deployments
2. **S3-Compatible**: Production and scale

**Strategy:**
- Files stored by unique key
- Metadata in database
- Lazy loading for large files
- Streaming downloads

## Data Flow

### Creating a Room
```
User → Frontend → POST /api/rooms → Backend
                                   ↓
                              Generate ID
                                   ↓
                           Create DB record
                                   ↓
                          Return room data
```

### Adding Content to Room

#### Text/Code
```
User paste → Frontend → POST /api/rooms/:id/items
                                   ↓
                            Validate content
                                   ↓
                         Store in database
                                   ↓
                          Return item data
```

#### File Upload (Image/PDF)
```
User drop → Frontend → POST /api/rooms/:id/items/upload-url
                                   ↓
                          Generate upload URL
                                   ↓
         Frontend ← Return signed URL
                                   
         Upload to storage directly
                                   ↓
         POST /api/rooms/:id/items/complete
                                   ↓
                         Create DB record
                                   ↓
                          Return item data
```

### Retrieving Room Content
```
User → Frontend → GET /api/rooms/:id → Backend
                                         ↓
                                  Query database
                                         ↓
                                  Return metadata
                                         ↓
                     Frontend renders content
                                         ↓
                  For files: generate signed URLs
                                         ↓
                     Browser fetches files directly
```

## Security Model

### Room Access
- **No authentication**: Intentionally stateless
- **Unguessable IDs**: Cryptographically random (12 chars = 62^12 combinations)
- **URL as credential**: Anyone with the link has access

### File Upload Security
1. **Size validation**: Client and server enforce 50MB limit
2. **MIME type checking**: Whitelist of allowed types
3. **Rate limiting**: Prevent abuse
4. **Signed URLs**: Temporary access to storage
5. **Virus scanning**: Optional integration point

### Attack Surface
**Prevented:**
- SQL injection (parameterized queries via Prisma)
- XSS (React escapes by default)
- CSRF (stateless API)
- Path traversal (validated file keys)

**Limitations:**
- No user authentication means no access control
- Anyone with room ID can modify content
- Rate limiting is IP-based (can be circumvented)

## Scalability Considerations

### Horizontal Scaling
- **Stateless backend**: Can run multiple instances
- **Shared database**: PostgreSQL with connection pooling
- **Distributed storage**: S3 handles file distribution
- **Load balancer**: Standard HTTP load balancing

### Vertical Scaling
- **Database**: Increase PostgreSQL resources
- **Storage**: S3 scales automatically
- **Caching**: Add Redis for hot rooms (future)

### Performance Optimizations
1. **Lazy loading**: PDFs load pages on demand
2. **Streaming**: Large file downloads stream from storage
3. **Optimistic UI**: Instant feedback before server confirmation
4. **Pagination**: Rooms with many items load incrementally
5. **CDN**: Static assets served from CDN

## Lifecycle Management

### Room Expiry
```
Background job (cron) runs every hour:
  ↓
Query expired rooms
  ↓
For each room:
  - Delete all items from storage
  - Delete database records
  - Log cleanup event
```

### Storage Cleanup
- Orphaned files cleaned up weekly
- Compare database records with storage keys
- Delete files without database entries

## Error Handling

### Client-Side
- Form validation before submission
- User-friendly error messages
- Retry logic for failed uploads
- Graceful degradation for missing features

### Server-Side
- Structured error responses
- Logging with context
- Transaction rollbacks on failure
- Circuit breakers for external services

## Monitoring and Observability

### Metrics to Track
- Room creation rate
- Upload success/failure rate
- Storage utilization
- API response times
- Database query performance

### Logging Strategy
- Structured JSON logs
- Request/response logging
- Error tracking with stack traces
- Audit trail for deletions

## Future Enhancements

### Phase 2
- Room passwords (optional)
- Expiry extension
- View-only links
- Collaborative editing

### Phase 3
- Real-time updates (WebSockets)
- Room templates
- API keys for programmatic access
- Analytics dashboard

### Phase 4
- Encryption at rest
- Compliance features (GDPR)
- Advanced search
- Mobile apps

## Technology Choices

### Why React?
- Component reusability
- Rich ecosystem
- Virtual DOM performance
- Wide community support

### Why Vite over Create React App?
- Faster dev server (ESBuild)
- Faster builds
- Modern defaults
- Better tree-shaking

### Why Express?
- Minimal and flexible
- Large middleware ecosystem
- Well-understood patterns
- Easy to reason about

### Why PostgreSQL?
- ACID compliance
- JSON support for metadata
- Robust querying
- Reliable and proven

### Why Prisma?
- Type-safe database access
- Auto-generated types
- Migration management
- Great developer experience

### Why Zustand over Redux?
- Simpler API
- Less boilerplate
- Better TypeScript support
- Smaller bundle size

## Deployment

### Recommended Stack
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or Fly.io
- **Database**: Supabase, Railway, or managed PostgreSQL
- **Storage**: AWS S3, Cloudflare R2, or DigitalOcean Spaces

### Environment Separation
- **Development**: Local PostgreSQL, local filesystem
- **Staging**: Managed PostgreSQL, S3
- **Production**: Managed PostgreSQL with replicas, S3 with CDN

### CI/CD Pipeline
1. Run tests
2. Build artifacts
3. Run migrations
4. Deploy backend
5. Deploy frontend
6. Run smoke tests
7. Notify team

---

This architecture balances simplicity with production-readiness, making Drop easy to understand, deploy, and maintain.

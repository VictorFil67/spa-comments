# SPA Comments

A single-page application for nested comments with real-time updates, file attachments, and CAPTCHA protection.

## Tech Stack

**Backend:** NestJS, TypeORM, PostgreSQL, Redis (cache), Bull (queue), Socket.IO, JWT, sharp
**Frontend:** React, TypeScript, Vite, Axios, Socket.IO client
**Infrastructure:** Docker, Nginx

## Features

- Nested (cascading) comments with unlimited reply depth
- Sorting by User Name, E-mail, or Date (ASC/DESC)
- Pagination (25 comments per page)
- Real-time updates via WebSocket — new comments appear instantly in all tabs
- CAPTCHA verification (server-side SVG generation)
- File attachments: images (JPG, GIF, PNG) and text files (TXT, max 100KB)
- Automatic image resizing to 320x240px (proportional, via Bull queue)
- Lightbox for image preview with visual effects
- Allowed HTML tags: `<a>`, `<code>`, `<i>`, `<strong>` with XHTML validation
- HTML toolbar buttons ([i], [strong], [code], [a])
- Message preview without page reload
- XSS and SQL injection protection (sanitize-html, parameterized queries via TypeORM)
- JWT authentication
- Redis caching for comments list (60s TTL)
- Client-side and server-side validation

## Project Structure

```
spa-comments/
├── backend/             # NestJS API server
│   └── src/
│       ├── auth/        # JWT authentication (login, guard, strategy)
│       ├── captcha/     # SVG CAPTCHA generation and validation
│       ├── comments/    # Comments CRUD, WebSocket gateway, HTML sanitizer
│       ├── config/      # Redis cache configuration
│       ├── entities/    # TypeORM entities (User, Comment, Attachment)
│       └── uploads/     # File processing service + Bull queue processor
├── frontend/            # React SPA
│   └── src/
│       ├── api/         # Axios HTTP client
│       ├── components/  # CommentTree, CommentForm, Lightbox, HtmlToolbar
│       ├── hooks/       # useSocket (WebSocket hook)
│       └── types/       # TypeScript interfaces
├── db-schema/           # Database schema (SQL)
└── docker-compose.yml   # Docker orchestration (4 services)
```

## Database Schema

Three tables: `users`, `comments`, `attachments`.

- **users** — id, username, email, homePage, createdAt
- **comments** — id, text, createdAt, userId (FK), parentId (FK self-reference, nullable)
- **attachments** — id, originalName, fileName, filePath, mimeType, size, type (image/text), commentId (FK)

See `db-schema/schema.sql` for the full CREATE TABLE statements.

## API Endpoints

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | /api/comments     | List comments (paginated, sortable)  |
| GET    | /api/comments/:id | Get single comment with children     |
| POST   | /api/comments     | Create comment (multipart/form-data) |
| GET    | /api/captcha      | Generate CAPTCHA (returns SVG + id)  |
| POST   | /api/auth/login   | Get JWT token (username + email)     |
| GET    | /api/auth/profile | Get user profile (JWT required)      |

**WebSocket event:** `newComment` — broadcasts new comments to all connected clients.

## Quick Start (Docker)

```bash
git clone https://github.com/VictorFil67/spa-comments.git
cd spa-comments
docker-compose up --build
```

The application will be available at **http://localhost** (port 80).

Services:
- Frontend (Nginx): port 80
- Backend API: port 3010
- PostgreSQL: port 5434
- Redis: port 6380

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Redis 7
- Yarn

### Backend

```bash
cd backend
cp .env.example .env    # adjust ports/credentials if needed
yarn install
yarn start:dev          # http://localhost:3010
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

### Environment Variables

| Variable           | Default                    | Description              |
|--------------------|----------------------------|--------------------------|
| DB_HOST            | localhost                  | PostgreSQL host          |
| DB_PORT            | 5434                       | PostgreSQL port          |
| DB_USERNAME        | postgres                   | Database user            |
| DB_PASSWORD        | postgres                   | Database password        |
| DB_NAME            | spa_comments               | Database name            |
| REDIS_HOST         | localhost                  | Redis host               |
| REDIS_PORT         | 6380                       | Redis port               |
| PORT               | 3010                       | Backend port             |
| CORS_ORIGIN        | http://localhost:5173      | Allowed CORS origin      |
| JWT_SECRET         | (change in production)     | JWT signing secret       |
| CAPTCHA_SECRET     | (change in production)     | CAPTCHA secret key       |
| MAX_IMAGE_WIDTH    | 320                        | Max image width (px)     |
| MAX_IMAGE_HEIGHT   | 240                        | Max image height (px)    |

## Form Fields

1. **User Name** (required) — alphanumeric characters only
2. **E-mail** (required) — valid email format
3. **Home page** (optional) — valid URL
4. **CAPTCHA** (required) — enter text from the generated image
5. **Text** (required) — comment body, allowed HTML: `<a>`, `<code>`, `<i>`, `<strong>`
6. **File** (optional) — image (JPG/GIF/PNG, auto-resized) or text file (TXT, max 100KB)

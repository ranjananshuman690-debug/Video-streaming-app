# VideoStream — Full Project Summary

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth.js (JWT strategy) |
| Database | MongoDB via Mongoose |
| Media Storage | Cloudinary |
| Video Playback | ReactPlayer |
| Styling | Tailwind CSS + custom CSS variables |

---

## 1. Project Structure Overview

```
app/
  (auth)/        → Login & Register pages (separate layout, no sidebar/navbar)
  (main)/        → All main pages (home, watch, upload, channel, search)
  api/           → All backend API routes (REST)
components/      → Reusable UI pieces
lib/             → Shared utilities (DB connection, auth config, Cloudinary, constants)
models/          → Mongoose schemas (User, Video, Comment, WatchHistory)
```

Next.js **route groups** (folders wrapped in parentheses like `(main)` and `(auth)`) are used to apply different layouts — auth pages get a centered card layout while main pages get the full navbar + sidebar shell.

---

## 2. Database Layer — MongoDB + Mongoose (`lib/mongodb.js`)

`connectDB()` creates a **singleton** Mongoose connection cached on `global.mongoose`.  
This is critical in Next.js because API routes are serverless functions — without caching, every request would open a new DB connection and exhaust the pool.

```
Request → connectDB() → checks global.mongoose.conn
  → if exists: reuse it
  → if not: create mongoose.connect(), cache the promise, await it
```

---

## 3. Data Models

### User (`models/User.js`)
- Stores name, email, hashed password, avatar, channelName, role (`viewer` | `uploader`)
- `subscribers` and `subscribedTo` are arrays of `ObjectId` refs back to User — this creates a **self-referential many-to-many relationship**
- Password is hashed with bcrypt in a `pre('save')` Mongoose hook before it ever touches the DB
- `password` field has `select: false` — it's excluded from all queries by default unless explicitly `.select('+password')`
- `subscriberCount` is a **virtual field** — computed from `subscribers.length` at read time, never stored

### Video (`models/Video.js`)
- Stores Cloudinary `videoUrl`, `publicId`, auto-generated `thumbnail`, `duration`, `views`, `likes[]`, `category`, `tags[]`
- `uploadedBy` is an ObjectId ref to User — a **foreign key** relationship
- `likes` is an array of User ObjectIds — toggling a like means checking if your ID is in this array, then `$push` or `$pull`
- Text search index on `title + description + tags` powers the search page (`$text: { $search: query }`)
- `likeCount` is a virtual computed from `likes.length`

### Comment (`models/Comment.js`)
- Threaded replies are handled with a single model via `parentId` — top-level comments have `parentId: null`, replies point to the parent comment's `_id`
- The API fetches all top-level comments, then for each one runs a second query for `{ parentId: comment._id }` to get replies — this is the **nested comment pattern**

### WatchHistory (`models/WatchHistory.js`)
- One record per user-video pair (enforced by a `unique` compound index on `{ userId, videoId }`)
- Stores `progressSeconds` and `completed` flag
- Uses MongoDB `upsert` — if the record doesn't exist it creates it, otherwise it updates it (no duplicate history entries)

---

## 4. Authentication (`lib/auth.js` + NextAuth)

Flow:
```
Login form → signIn("credentials") → NextAuth authorize()
  → connectDB() → User.findOne({ email }).select('+password')
  → bcrypt.compare(inputPassword, storedHash)
  → returns { id, email, name, image, role }
  → JWT callback attaches id + role to the token
  → session callback exposes id + role on session.user
```

- Strategy is `jwt` — sessions are stateless (no session table in DB)
- The JWT lives in an httpOnly cookie for 30 days
- `getServerSession(authOptions)` is called at the top of every protected API route to check if the user is logged in

---

## 5. Cloudinary Integration (`lib/cloudinary.js`)

`getCloudinary()` is called at request time (not module import time) to avoid Next.js dev-mode caching stale env vars.

Upload flow in `/api/upload`:
```
FormData file → arrayBuffer() → Buffer
  → cloudinary.uploader.upload_stream({ resource_type: "video" })
  → Cloudinary processes, stores, returns { secure_url, public_id, duration, bytes }
  → thumbnailUrl built with cloudinary.url() using { start_offset: "2" } transformation
    (Cloudinary auto-generates a frame screenshot at 2 seconds as a JPG)
  → Video document saved to MongoDB with both URLs
```

The `eager` option with `streaming_profile: "hd"` tells Cloudinary to asynchronously generate an HLS stream (`.m3u8`) for adaptive bitrate playback.

---

## 6. API Routes

All routes live in `app/api/` and follow the Next.js App Router convention — each folder has a `route.js` that exports named HTTP method handlers (`GET`, `POST`, `PATCH`, `DELETE`).

| Route | What it does |
|---|---|
| `POST /api/auth/register` | Creates a User document (bcrypt happens in the pre-save hook) |
| `GET/POST /api/auth/[...nextauth]` | NextAuth catch-all — handles signin, signout, session |
| `POST /api/upload` | Auth-gated, streams file to Cloudinary, saves Video to DB |
| `GET /api/videos` | Paginated, filterable, sortable video list |
| `GET /api/videos/[id]` | Single video detail + increments views + returns related videos |
| `PATCH /api/videos/[id]` | Toggle like (checks if userId in likes array, then $push or $pull) |
| `DELETE /api/videos/[id]` | Deletes video from DB + Cloudinary via `publicId` |
| `GET/POST/DELETE /api/comments` | Fetch threaded comments, create comment/reply, delete comment+replies |
| `POST /api/users/subscribe` | Toggles subscription: $addToSet / $pull on both users atomically |
| `GET /api/users/[id]` | Channel profile with their videos |
| `GET/POST/DELETE /api/watch-history` | Read history, upsert progress, clear history |

---

## 7. Frontend Pages & Data Flow

### Home Page (`app/(main)/page.jsx`)
- Client component — fetches `/api/videos` on mount and when category changes
- Implements **infinite scroll via a "Load More" button** — appends new pages to existing state
- Category filter chips are built from the shared `VIDEO_CATEGORIES` constant (same source as the Video model's enum)

### Watch Page (`app/(main)/watch/[id]/page.jsx`)
- Fetches video data from `/api/videos/[id]`
- Uses `setInterval` every 10 seconds to call `POST /api/watch-history` with current `playedSeconds` from ReactPlayer's `onProgress` callback
- Marks video as `completed` if user reaches 90% of duration
- Like button calls `PATCH /api/videos/[id]` and updates local state with the returned video

### Upload Page (`app/(main)/upload/page.jsx`)
- Guards access: unauthenticated → sign in prompt, `viewer` role → upgrade prompt, `uploader` → shows form
- On success, redirects to `/watch/[newVideoId]`

### Auth Pages (`app/(auth)/login`, `/register`)
- Login calls NextAuth's `signIn("credentials", { redirect: false })` to handle errors without a page redirect
- Register calls `POST /api/auth/register` directly, then auto-signs in

---

## 8. Video Playback (`components/video/VideoPlayer.jsx`)

ReactPlayer is loaded with `next/dynamic` and `ssr: false` — this is necessary because ReactPlayer uses browser-only APIs that don't exist on the server.

- `light={thumbnail}` shows a thumbnail preview before the video loads, saving bandwidth
- `playing={!!thumbnail}` auto-plays when the user clicks the thumbnail
- `controlsList: "nodownload"` removes the browser's native download button from the video controls

---

## 9. Component Architecture

```
WatchPage
  ├── VideoPlayer       → handles playback + fires onProgress
  ├── VideoInfo         → title, views, likes, channel info, subscribe button
  ├── Comments          → fetches + renders threaded comments, post/delete
  └── RelatedVideos     → sidebar list of related videos

HomePage
  ├── VideoCard[]       → each card links to /watch/[id]
  └── VideoCardSkeleton → shimmer placeholder while loading

UploadForm            → drag & drop, progress bar, form fields, calls /api/upload
Navbar                → search bar (redirects to /search?q=), session-aware links
Sidebar               → category navigation
SessionProvider       → wraps the app to make useSession() work client-side
```

---

## 10. How Everything Connects — End-to-End Flow

```
[Register] → User created in MongoDB (password bcrypt-hashed)
     ↓
[Login] → NextAuth verifies credentials → JWT issued → stored in cookie
     ↓
[Upload] → JWT verified server-side → file buffered → sent to Cloudinary
         → Cloudinary returns URL + auto thumbnail
         → Video document saved to MongoDB
     ↓
[Home Feed] → GET /api/videos → MongoDB query with pagination
            → VideoCard components rendered with Cloudinary thumbnail URLs
     ↓
[Watch] → GET /api/videos/[id] → view count incremented → video + related returned
        → ReactPlayer streams from Cloudinary CDN URL
        → Progress saved to WatchHistory every 10s via POST /api/watch-history
        → Like toggle via PATCH /api/videos/[id]
        → Comments fetched from GET /api/comments?videoId=xxx
     ↓
[Subscribe] → POST /api/users/subscribe → $addToSet on channel.subscribers
                                        → $addToSet on viewer.subscribedTo
```

---

## 11. Key Concepts Used

- **Next.js App Router** — file-based routing, server and client components, route groups for layouts
- **JWT Sessions** — stateless auth, token stored in cookie, user info available via `useSession()` client-side or `getServerSession()` server-side
- **Mongoose Virtuals** — computed fields (`likeCount`, `subscriberCount`) that don't exist in the DB but appear in JSON output
- **MongoDB `$addToSet` / `$pull`** — atomic array operations for likes and subscriptions without race conditions
- **MongoDB Text Index** — full-text search across multiple fields with a single `$text` query
- **Upsert Pattern** — `findOneAndUpdate` with `{ upsert: true }` creates-or-updates in one atomic operation
- **Cloudinary Transformations** — server-side image/video transformations via URL parameters (thumbnail at 2s, quality auto)
- **HLS Adaptive Streaming** — Cloudinary's `streaming_profile: "hd"` generates `.m3u8` playlists so browsers load the right quality for their connection
- **Self-referential MongoDB relationship** — User subscribing to another User using ObjectId refs on the same collection

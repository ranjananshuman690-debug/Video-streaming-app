# 🎬 VideoStream — Full-Stack Video Streaming Platform

A YouTube/Netflix-style video streaming platform built with Next.js 14 App Router, MongoDB, Cloudinary, and Node.js.

---

## Overview

We'll build a production-quality video streaming app that mirrors how real platforms like YouTube work:
- **Direct-to-Cloudinary uploads** (no permanent server storage)
- **Adaptive streaming** via Cloudinary HLS
- **MongoDB** for metadata, users, watch history
- **Next.js App Router** for SSR/SSG + API routes
- **Premium dark-mode UI** rivaling real streaming platforms

---

## User Review Required

> [!IMPORTANT]
> **Authentication Strategy**: I'll implement full JWT-based auth with email/password. Do you want Google OAuth as well? (Requires extra setup in Cloudinary + MongoDB)

> [!IMPORTANT]
> **Cloudinary Credentials**: You'll need to fill in `.env.local` with your Cloudinary Cloud Name, API Key, and API Secret before the upload system works. I'll create the env file template.

> [!WARNING]
> **MongoDB Connection**: You need a MongoDB Atlas URI or local MongoDB. I'll set up Mongoose models — provide your `MONGODB_URI` in `.env.local`.

---

## Open Questions

1. **Social features scope for Phase 1?** — Comments, likes, subscriptions all together, or just views/likes first?
2. **User roles?** — Just "viewer" and "uploader", or full admin panel too?
3. **Video categories?** — Should I pre-seed categories (Gaming, Music, Education, etc.) or let uploaders create them?

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom animations |
| Database | MongoDB + Mongoose |
| Media | Cloudinary (upload, stream, transcode, CDN) |
| Video Player | React Player (HLS support) |
| Auth | NextAuth.js (JWT + Credentials) |
| File Handling | Multer / Next.js formData |
| State | React Context + SWR |

---

## Project Structure

```
videos-web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── (main)/
│   │   ├── layout.jsx              # Sidebar + Navbar
│   │   ├── page.jsx                # Home feed
│   │   ├── watch/[id]/page.jsx     # Video player page
│   │   ├── upload/page.jsx         # Upload page
│   │   ├── channel/[userId]/page.jsx
│   │   └── search/page.jsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js
│   │   ├── upload/route.js         # Cloudinary upload
│   │   ├── videos/
│   │   │   ├── route.js            # GET all, POST new
│   │   │   └── [id]/route.js       # GET one, PATCH, DELETE
│   │   ├── users/
│   │   │   ├── route.js
│   │   │   └── [id]/route.js
│   │   └── watch-history/route.js
│   ├── layout.jsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── VideoCard.jsx
│   ├── video/
│   │   ├── VideoPlayer.jsx         # React Player wrapper
│   │   ├── VideoInfo.jsx
│   │   └── RelatedVideos.jsx
│   └── upload/
│       └── UploadForm.jsx          # Chunked upload UI
├── lib/
│   ├── cloudinary.js
│   ├── mongodb.js
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Video.js
│   └── WatchHistory.js
├── .env.local.example
└── tailwind.config.js
```

---

## Proposed Changes (Build Phases)

### Phase 1 — Project Bootstrap

#### [NEW] `package.json` / Next.js app init
- Run `npx create-next-app@latest` with Tailwind, App Router, TypeScript disabled
- Install: `cloudinary`, `mongoose`, `next-auth`, `react-player`, `multer`, `swr`, `lucide-react`

---

### Phase 2 — Config & Models

#### [NEW] `.env.local.example`
Template with all required env vars: Cloudinary, MongoDB, NextAuth secret.

#### [NEW] `lib/cloudinary.js`
Cloudinary v2 SDK config singleton.

#### [NEW] `lib/mongodb.js`
Mongoose connection singleton with caching (prevents hot-reload issues in dev).

#### [NEW] `lib/auth.js`
NextAuth config: credentials provider, JWT callbacks, session shape.

#### [NEW] `models/User.js`
```js
{ name, email, password (hashed), avatar, subscribers, createdAt }
```

#### [NEW] `models/Video.js`
```js
{ 
  title, description, videoUrl, publicId, thumbnail,
  duration, views, likes[], tags[], category,
  uploadedBy (ref User), createdAt 
}
```

#### [NEW] `models/WatchHistory.js`
```js
{ userId, videoId, watchedAt, progressSeconds, completed }
```

---

### Phase 3 — API Routes

#### [NEW] `app/api/upload/route.js`
- Receives `multipart/form-data`
- Streams buffer directly to Cloudinary with `upload_stream`
- `resource_type: "video"`, `folder: "videos"`, `eager: [{streaming_profile: "hd", format: "m3u8"}]`
- Returns `{ videoUrl, publicId, thumbnail, duration }`

#### [NEW] `app/api/videos/route.js`
- `GET`: paginated video list with populated user
- `POST`: save video metadata to MongoDB after Cloudinary upload

#### [NEW] `app/api/videos/[id]/route.js`
- `GET`: single video + increment view count atomically
- `PATCH`: update likes, title, description
- `DELETE`: remove from Cloudinary + MongoDB

#### [NEW] `app/api/auth/[...nextauth]/route.js`
- JWT-based auth, bcrypt password verification

#### [NEW] `app/api/watch-history/route.js`
- `POST`: upsert watch progress
- `GET`: user's history with video populated

---

### Phase 4 — Frontend Pages

#### [NEW] `app/globals.css`
Full dark-mode design system — CSS variables, animations, glassmorphism utilities.

#### [NEW] `app/layout.jsx`
Root layout: fonts (Inter + Outfit from Google), metadata, SessionProvider wrapper.

#### [NEW] `app/(main)/layout.jsx`
Sidebar + Navbar layout shell. Collapsible sidebar.

#### [NEW] `app/page.jsx` — Home Feed
- Hero section with featured video
- Infinite scroll video grid
- Category filter chips

#### [NEW] `app/watch/[id]/page.jsx` — Player Page
- ReactPlayer with HLS URL
- Video info (title, views, likes, uploader)
- Related videos sidebar
- Auto-save watch progress every 5 seconds

#### [NEW] `app/upload/page.jsx` — Upload Page
- Drag & drop file zone with progress bar
- Title, description, category, tags fields
- Thumbnail preview (auto-generated from Cloudinary)
- Real-time upload progress

#### [NEW] `app/(auth)/login/page.jsx` + `register/page.jsx`
Premium glassmorphism auth UI.

---

### Phase 5 — Components

#### [NEW] `components/ui/VideoCard.jsx`
Thumbnail card with hover-play preview, duration badge, channel info, view count.

#### [NEW] `components/video/VideoPlayer.jsx`
ReactPlayer wrapper with:
- HLS streaming support
- Custom controls overlay
- Progress tracking

#### [NEW] `components/ui/Navbar.jsx`
- Search bar with suggestions
- Auth state (login/avatar)
- Upload button

#### [NEW] `components/ui/Sidebar.jsx`
- Navigation links (Home, Trending, Subscriptions, History)
- Collapsible on mobile

---

## Design System

**Color Palette (Dark Mode):**
- Background: `#0f0f0f` (YouTube-like)
- Surface: `#1a1a1a` / `#212121`
- Primary Accent: `#ff0040` (vibrant red-pink)
- Secondary: `#6c63ff` (purple)
- Text: `#f1f1f1` / `#aaa`

**Typography:** Inter (body), Outfit (headings) — Google Fonts

**Effects:** Glassmorphism cards, smooth hover lifts, skeleton loading states

---

## Verification Plan

### Automated
- `npm run build` — ensures no type errors, no broken imports
- Test upload API route with a small test video

### Manual Verification Checklist
- [ ] Register → Login flow
- [ ] Upload a video → see Cloudinary dashboard entry
- [ ] Watch page streams video (not downloading whole file)
- [ ] View count increments on each watch
- [ ] Watch history saves progress

---

## Env Variables Required

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

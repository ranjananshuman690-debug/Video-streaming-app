# 🎬 VideoStream — Setup Guide

## ✅ What's Built

Your full-stack video streaming platform is scaffolded. Here's what was created:

### API Routes
- `POST /api/auth/register` — User registration
- `GET|POST /api/auth/[...nextauth]` — NextAuth signin
- `POST /api/upload` — Cloudinary video upload
- `GET /api/videos` — Paginated video list with filters
- `GET|PATCH|DELETE /api/videos/[id]` — Video detail, like, delete
- `GET|POST|DELETE /api/comments` — Comments + nested replies
- `POST /api/users/subscribe` — Subscribe/unsubscribe
- `GET /api/users/[id]` — Channel profile
- `GET|POST|DELETE /api/watch-history` — Watch progress tracking

### Pages
- `/` — Home feed with category filter
- `/watch/[id]` — Video player + comments + related
- `/upload` — Drag & drop upload with progress
- `/channel/[userId]` — Channel profile
- `/search` — Full-text search results
- `/login` + `/register` — Premium glassmorphism auth

---

## 🚀 Getting Started

### Step 1 — Install dependencies

Open a terminal in the project folder and run:

```bash
cd "f:\notes\Web development Roadmap\Full stack projects\videos-web"
npm install
```

### Step 2 — Fill in your credentials

Edit `.env.local` with your real values:

```env
# Cloudinary (get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/videostream

# NextAuth (any random secret string)
NEXTAUTH_SECRET=some-long-random-string-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 3 — Make sure MongoDB is running locally

```bash
# Windows: MongoDB should be running as a service
# Or start it manually:
mongod
```

### Step 4 — Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📋 First Steps After Launch

1. **Register** — Go to `/register`, create an **Uploader** account
2. **Upload** — Go to `/upload`, drag a video, fill metadata
3. **Watch** — Click your video, test streaming
4. **Comment** — Test comments and replies
5. **Subscribe** — Create a second account, subscribe to the uploader

---

## 🏗️ Architecture Recap

```
User uploads video
      ↓
/api/upload receives FormData
      ↓
Buffer streamed → Cloudinary (resource_type: "video")
      ↓
Cloudinary processes + CDN delivers
      ↓
Thumbnail auto-generated (screenshot at 2s)
      ↓
Metadata saved to MongoDB
      ↓
Frontend plays via ReactPlayer using Cloudinary URL
```

---

## 🔑 Cloudinary Account Setup

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Create free account
3. Go to **Dashboard**
4. Copy: Cloud name, API Key, API Secret
5. Paste into `.env.local`

Free tier gives you: **25GB storage + 25GB bandwidth/month** — enough to test.

---

## 🎨 Design System

The app uses a premium dark-mode design:
- Background: `#0f0f0f`
- Brand accent: `#ff0040` (vibrant red)
- Secondary: `#6c63ff` (purple)
- Glassmorphism cards, glow effects, smooth animations
- Fonts: Inter (body) + Outfit (headings) from Google Fonts

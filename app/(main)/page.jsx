"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VideoCard from "@/components/ui/VideoCard";
import VideoCardSkeleton from "@/components/ui/VideoCardSkeleton";
import { VIDEO_CATEGORIES } from "@/lib/constants";
import { TrendingUp, Flame, Clock, Star } from "lucide-react";

const CATEGORIES = ["All", ...VIDEO_CATEGORIES];

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchVideos(category, pageNum = 1, append = false) {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: pageNum,
        limit: 12,
        sort: "createdAt",
      });

      if (category !== "All") params.set("category", category);

      const res = await fetch(`/api/videos?${params}`);
      const data = await res.json();

      if (append) {
        setVideos((prev) => [...prev, ...(data.videos || [])]);
      } else {
        setVideos(data.videos || []);
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchVideos(activeCategory, 1, false);
  }, [activeCategory]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(activeCategory, nextPage, true);
  }

  return (
    <div className="py-6 px-4 sm:px-6">
      {/* Hero Banner */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8 p-8 sm:p-12"
        style={{
          background: "linear-gradient(135deg, rgba(255,0,64,0.15) 0%, rgba(108,99,255,0.15) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,0,64,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(108,99,255,0.4) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={20} className="text-brand-500" style={{ color: "var(--brand-red)" }} />
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--brand-red)" }}>
              VideoStream
            </span>
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold mb-3 gradient-text"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Watch Without Limits
          </h1>
          <p className="text-base sm:text-lg max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Stream, upload, and share videos in stunning quality. Your stage, your audience.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/upload" className="btn-primary">
              <Star size={16} /> Start Uploading
            </Link>
            <Link href="/trending" className="btn-secondary">
              <TrendingUp size={16} /> Trending Now
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`category-chip ${activeCategory === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={16} style={{ color: "var(--text-muted)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {activeCategory === "All" ? "Latest Videos" : activeCategory} •{" "}
          <span style={{ color: "var(--text-secondary)" }}>{videos.length} videos</span>
        </span>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="video-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: "var(--bg-surface)" }}
          >
            <Clock size={32} style={{ color: "var(--text-muted)" }} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            {activeCategory !== "All"
              ? `No videos in ${activeCategory} yet.`
              : "Be the first to upload!"}
          </p>
          <Link href="/upload" className="btn-primary">
            Upload a Video
          </Link>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map((video, i) => (
              <VideoCard key={video._id} video={video} index={i} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-secondary px-8"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: "var(--border-normal)", borderTopColor: "var(--brand-red)" }}
                    />
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

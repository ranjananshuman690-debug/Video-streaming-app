"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import VideoCard from "@/components/ui/VideoCard";
import VideoCardSkeleton from "@/components/ui/VideoCardSkeleton";
import { Search } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    search(query);
  }, [query]);

  async function search(q) {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos?search=${encodeURIComponent(q)}&limit=24`);
      const data = await res.json();
      setVideos(data.videos || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-6 px-4 sm:px-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Search size={20} style={{ color: "var(--text-muted)" }} />
        <h1 className="text-xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
          {query ? (
            <>
              Results for{" "}
              <span className="gradient-text">"{query}"</span>
            </>
          ) : (
            "Search VideoStream"
          )}
        </h1>
      </div>

      {loading ? (
        <div className="video-grid">
          {Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : !query ? (
        <p className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          Type something in the search bar above.
        </p>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold mb-2">No results found</p>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Try different keywords or browse by category.
          </p>
          <Link href="/" className="btn-primary">
            Browse Videos
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            {videos.length} result{videos.length !== 1 ? "s" : ""} found
          </p>
          <div className="video-grid">
            {videos.map((v, i) => <VideoCard key={v._id} video={v} index={i} />)}
          </div>
        </>
      )}
    </div>
  );
}

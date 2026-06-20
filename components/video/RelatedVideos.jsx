"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Clock } from "lucide-react";

function formatViews(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n?.toString() || "0";
}

function formatDuration(s) {
  if (!s) return "";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return new Date(d).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  return hours > 0 ? `${hours}h ago` : "just now";
}

export default function RelatedVideos({ videos }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No related videos found.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="section-heading mb-4">Related Videos</h3>
      <div className="space-y-3">
        {videos.map((video, i) => (
          <Link
            key={video._id}
            href={`/watch/${video._id}`}
            className="flex gap-2.5 rounded-xl p-2 transition-all duration-200 group animate-fade-in"
            style={{
              animationDelay: `${i * 50}ms`,
              background: "transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {/* Thumbnail */}
            <div
              className="relative flex-shrink-0 rounded-lg overflow-hidden"
              style={{ width: 120, height: 68, background: "var(--bg-surface)" }}
            >
              {video.thumbnail ? (
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center gradient-bg opacity-40">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
              {video.duration > 0 && (
                <div className="duration-badge text-xs" style={{ fontSize: "10px" }}>
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold leading-snug line-clamp-2 mb-1 group-hover:text-white transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                {video.title}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                {video.uploadedBy?.channelName || video.uploadedBy?.name}
              </p>
              <div
                className="flex items-center gap-1.5 text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Eye size={10} />
                {formatViews(video.views)}
                <span>•</span>
                {timeAgo(video.createdAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

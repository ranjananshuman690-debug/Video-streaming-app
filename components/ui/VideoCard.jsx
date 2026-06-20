"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Clock } from "lucide-react";

function formatViews(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M views`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K views`;
  return `${n || 0} views`;
}

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatTimeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 30) return new Date(date).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export default function VideoCard({ video, index = 0, compact = false }) {
  const channel = video.uploadedBy;

  return (
    <Link
      href={`/watch/${video._id}`}
      className="video-card block animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      {/* Thumbnail */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/9", background: "var(--bg-surface)" }}
      >
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--bg-surface)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center gradient-bg opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Play overlay on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center gradient-bg glow-red">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        {video.duration > 0 && (
          <div className="duration-badge">
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Category badge */}
        {video.category && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold"
            style={{ background: "rgba(0,0,0,0.7)", color: "var(--text-secondary)" }}
          >
            {video.category}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex gap-2.5">
          {/* Channel Avatar */}
          <Link
            href={`/channel/${channel?._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            <div className="avatar w-8 h-8 text-xs">
              {channel?.avatar ? (
                <Image src={channel.avatar} alt={channel.name || ""} width={32} height={32} className="rounded-full" />
              ) : (
                (channel?.name || "U").charAt(0).toUpperCase()
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className="text-sm font-semibold leading-snug mb-1 line-clamp-2"
              style={{ color: "var(--text-primary)" }}
            >
              {video.title}
            </h3>

            {/* Channel Name */}
            <Link
              href={`/channel/${channel?._id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium block mb-1 hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              {channel?.channelName || channel?.name || "Unknown"}
            </Link>

            {/* Meta */}
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {formatViews(video.views)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatTimeAgo(video.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

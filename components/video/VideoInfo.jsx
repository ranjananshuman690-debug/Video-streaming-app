"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThumbsUp, Eye, Share2, MoreHorizontal, Users, Check } from "lucide-react";

function formatViews(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n?.toString() || "0";
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function VideoInfo({ video, session, onLike }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasLiked = video.likes?.some(
    (id) => id.toString() === session?.user?.id
  );
  const channel = video.uploadedBy;

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="mt-4 animate-slide-up">
      {/* Title */}
      <h1
        className="text-xl sm:text-2xl font-bold leading-snug mb-3"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {video.title}
      </h1>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Stats */}
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <Eye size={15} />
            {formatViews(video.views)} views
          </span>
          <span>•</span>
          <span>{formatDate(video.createdAt)}</span>
          {video.category && (
            <>
              <span>•</span>
              <span className="badge">{video.category}</span>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="video-like-btn"
            onClick={onLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              hasLiked ? "glow-red" : ""
            }`}
            style={{
              background: hasLiked ? "rgba(255,0,64,0.15)" : "var(--bg-surface)",
              border: `1px solid ${hasLiked ? "rgba(255,0,64,0.4)" : "var(--border-normal)"}`,
              color: hasLiked ? "var(--brand-red)" : "var(--text-secondary)",
            }}
          >
            <ThumbsUp size={16} fill={hasLiked ? "currentColor" : "none"} />
            {formatViews(video.likes?.length || 0)}
          </button>

          <button
            id="video-share-btn"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-normal)",
              color: copied ? "var(--brand-red)" : "var(--text-secondary)",
            }}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </div>

      {/* Channel Info */}
      {channel && (
        <div
          className="flex items-center justify-between p-4 rounded-xl mb-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <Link
            href={`/channel/${channel._id}`}
            className="flex items-center gap-3 group"
          >
            <div className="avatar w-11 h-11 text-base">
              {channel.avatar ? (
                <Image src={channel.avatar} alt={channel.name} width={44} height={44} className="rounded-full" />
              ) : (
                channel.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-sm group-hover:underline">
                {channel.channelName || channel.name}
              </p>
              <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <Users size={11} />
                {formatViews(channel.subscribers?.length || 0)} subscribers
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Description */}
      {video.description && (
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <p
            className={`text-sm whitespace-pre-line leading-relaxed ${!descExpanded ? "line-clamp-3" : ""}`}
            style={{ color: "var(--text-secondary)" }}
          >
            {video.description}
          </p>
          {video.description.length > 200 && (
            <button
              onClick={() => setDescExpanded((p) => !p)}
              className="text-xs font-semibold mt-2"
              style={{ color: "var(--brand-red)" }}
            >
              {descExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      {video.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {video.tags.map((tag) => (
            <span key={tag} className="badge badge-brand">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

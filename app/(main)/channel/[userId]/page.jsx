"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import VideoCard from "@/components/ui/VideoCard";
import VideoCardSkeleton from "@/components/ui/VideoCardSkeleton";
import { Users, Film, Calendar } from "lucide-react";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatCount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n?.toString() || "0";
}

export default function ChannelPage() {
  const { userId } = useParams();
  const { data: session } = useSession();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    fetchChannel();
  }, [userId]);

  useEffect(() => {
    if (session && channel) {
      setSubscribed(
        channel.subscribers?.some((s) => s.toString() === session.user.id)
      );
    }
  }, [session, channel]);

  async function fetchChannel() {
    try {
      const [userRes, videosRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/videos?userId=${userId}&limit=20`),
      ]);
      const userData = await userRes.json();
      const videosData = await videosRes.json();
      setChannel(userData.user);
      setVideos(videosData.videos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    if (!session) return;
    setSubLoading(true);
    try {
      const res = await fetch("/api/users/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: userId }),
      });
      const data = await res.json();
      setSubscribed(data.subscribed);
      setChannel((prev) => ({
        ...prev,
        subscribers: data.subscribed
          ? [...(prev.subscribers || []), session.user.id]
          : (prev.subscribers || []).filter((s) => s !== session.user.id),
      }));
    } catch {}
    setSubLoading(false);
  }

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6">
        <div className="skeleton h-40 rounded-2xl mb-4" />
        <div className="skeleton h-8 w-48 rounded mb-2" />
        <div className="skeleton h-4 w-32 rounded mb-8" />
        <div className="video-grid">
          {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-2xl font-bold mb-3">Channel Not Found</h2>
        <Link href="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === userId;

  return (
    <div className="animate-fade-in">
      {/* Channel Banner */}
      <div
        className="h-40 sm:h-52 relative"
        style={{
          background: "linear-gradient(135deg, rgba(255,0,64,0.2) 0%, rgba(108,99,255,0.2) 100%)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,0,64,0.5) 0%, transparent 60%)"
          }}
        />
      </div>

      {/* Channel Info */}
      <div className="px-4 sm:px-8 pb-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
          <div
            className="avatar w-24 h-24 text-3xl ring-4 flex-shrink-0"
            style={{ ringColor: "var(--bg-primary)" }}
          >
            {channel.avatar ? (
              <Image src={channel.avatar} alt={channel.name} width={96} height={96} className="rounded-full object-cover" />
            ) : (
              channel.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
              {channel.channelName || channel.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <Users size={14} />
                {formatCount(channel.subscribers?.length || 0)} subscribers
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <Film size={14} />
                {videos.length} videos
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <Calendar size={14} />
                Joined {formatDate(channel.createdAt)}
              </span>
            </div>
          </div>
          {!isOwner && session && (
            <button
              onClick={handleSubscribe}
              disabled={subLoading}
              className={subscribed ? "btn-secondary" : "btn-primary"}
            >
              {subLoading ? "..." : subscribed ? "Unsubscribe" : "Subscribe"}
            </button>
          )}
          {!session && (
            <Link href="/login" className="btn-primary">Subscribe</Link>
          )}
        </div>

        {channel.channelDescription && (
          <p className="text-sm max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            {channel.channelDescription}
          </p>
        )}
      </div>

      {/* Videos Grid */}
      <div className="px-4 sm:px-8 py-6">
        <h2 className="section-heading mb-5">Videos</h2>
        {videos.length === 0 ? (
          <div className="py-20 text-center">
            <p style={{ color: "var(--text-secondary)" }}>No videos uploaded yet.</p>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map((v, i) => <VideoCard key={v._id} video={v} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

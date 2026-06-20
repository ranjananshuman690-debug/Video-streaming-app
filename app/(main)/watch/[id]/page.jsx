"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoInfo from "@/components/video/VideoInfo";
import RelatedVideos from "@/components/video/RelatedVideos";
import Comments from "@/components/video/Comments";
import VideoCardSkeleton from "@/components/ui/VideoCardSkeleton";




export default function WatchPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const progressRef = useRef(0);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    fetchVideo();
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [id]);

  async function fetchVideo() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/videos/${id}`);
      if (!res.ok) throw new Error("Video not found");
      const data = await res.json();
      setVideo(data.video);
      setRelated(data.related || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Save watch progress every 10 seconds
  const saveProgress = useCallback(
    async (seconds) => {
      if (!session || !id) return;
      try {
        await fetch("/api/watch-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: id,
            progressSeconds: Math.round(seconds),
            completed: video ? seconds >= video.duration * 0.9 : false,
          }),
        });
      } catch {}
    },
    [session, id, video]
  );

  function handleProgress({ playedSeconds }) {
    progressRef.current = playedSeconds;
  }

  // Throttled save
  useEffect(() => {
    if (!session) return;
    progressTimerRef.current = setInterval(() => {
      if (progressRef.current > 0) {
        saveProgress(progressRef.current);
      }
    }, 10000);
    return () => clearInterval(progressTimerRef.current);
  }, [session, saveProgress]);

  async function handleLike() {
    if (!session) return;
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
      const data = await res.json();
      setVideo(data.video);
    } catch {}
  }

  if (loading) {
    return (
      <div className="py-6 px-4 sm:px-6">
        <div className="flex gap-6 flex-wrap lg:flex-nowrap">
          <div className="flex-1 min-w-0">
            <div className="skeleton rounded-xl mb-4" style={{ aspectRatio: "16/9" }} />
            <div className="skeleton h-8 rounded-lg mb-3 w-3/4" />
            <div className="skeleton h-4 rounded w-1/3" />
          </div>
          <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <VideoCardSkeleton key={i} compact />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold mb-2">Video Not Found</h2>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          This video may have been removed or doesn't exist.
        </p>
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 animate-fade-in">
      <div className="flex gap-6 flex-wrap lg:flex-nowrap">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <VideoPlayer
            url={video.videoUrl}
            thumbnail={video.thumbnail}
            onProgress={handleProgress}
          />
          <VideoInfo
            video={video}
            session={session}
            onLike={handleLike}
          />
          <div className="mt-6">
            <Comments videoId={id} session={session} />
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <RelatedVideos videos={related} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UploadForm from "@/components/upload/UploadForm";
import { Lock, Upload } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div
          className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--border-normal)", borderTopColor: "var(--brand-red)" }}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4 animate-fade-in">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--bg-surface)" }}
        >
          <Lock size={36} style={{ color: "var(--brand-red)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-3">Sign In to Upload</h2>
        <p className="max-w-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          You need an account to upload videos. It's free and takes 30 seconds.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
          <Link href="/register" className="btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (session.user.role === "viewer") {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4 animate-fade-in">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--bg-surface)" }}
        >
          <Upload size={36} style={{ color: "var(--brand-red)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-3">Upgrade to Uploader</h2>
        <p className="max-w-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Your account is set to Viewer mode. Create a new account and select
          "Uploader" to start sharing videos.
        </p>
        <Link href="/register" className="btn-primary">
          Create Uploader Account
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto animate-slide-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-bg">
            <Upload size={20} className="text-white" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Upload Video
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Share your content with the world
            </p>
          </div>
        </div>
      </div>

      <UploadForm
        onSuccess={(videoId) => router.push(`/watch/${videoId}`)}
      />
    </div>
  );
}

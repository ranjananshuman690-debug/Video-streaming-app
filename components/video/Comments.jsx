"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, Trash2, Reply, Send, MessageCircle } from "lucide-react";

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

function CommentItem({ comment, session, onDelete, onReply }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isOwner = session?.user?.id === comment.userId?._id?.toString();

  async function submitReply(videoId) {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(videoId, replyText, comment._id);
    setReplyText("");
    setReplying(false);
    setShowReplies(true);
    setSubmitting(false);
  }

  return (
    <div className="comment-item">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="avatar w-8 h-8 text-xs flex-shrink-0">
          {comment.userId?.avatar ? (
            <Image src={comment.userId.avatar} alt="" width={32} height={32} className="rounded-full" />
          ) : (
            (comment.userId?.name || "U").charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author + time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">{comment.userId?.name || "User"}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Text */}
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {comment.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {session && (
              <button
                onClick={() => setReplying((p) => !p)}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <Reply size={12} /> Reply
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDelete(comment._id)}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-red)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>

          {/* Reply box */}
          {replying && (
            <div className="flex gap-2 mt-3 animate-fade-in">
              <input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="input-field py-2 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitReply(comment.videoId);
                  }
                }}
              />
              <button
                onClick={() => submitReply(comment.videoId)}
                disabled={submitting || !replyText.trim()}
                className="btn-primary px-3 py-2 text-xs"
              >
                <Send size={12} />
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowReplies((p) => !p)}
                className="text-xs font-semibold"
                style={{ color: "var(--brand-red)" }}
              >
                {showReplies ? "▾" : "▸"} {comment.replies.length} repl{comment.replies.length > 1 ? "ies" : "y"}
              </button>
              {showReplies && (
                <div className="mt-2 pl-4 space-y-3" style={{ borderLeft: "2px solid var(--border-subtle)" }}>
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="flex gap-2.5">
                      <div className="avatar w-6 h-6 text-xs flex-shrink-0">
                        {(reply.userId?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold">{reply.userId?.name}</span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {timeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Comments({ videoId, session }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments?videoId=${videoId}`);
      const data = await res.json();
      setComments(data.comments || []);
      setTotal(data.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!text.trim() || !session) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, text }),
      });
      const data = await res.json();
      setComments((prev) => [{ ...data.comment, replies: [] }, ...prev]);
      setTotal((t) => t + 1);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    await fetch(`/api/comments?commentId=${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setTotal((t) => t - 1);
  }

  async function handleReply(videoId, replyText, parentId) {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, text: replyText, parentId }),
    });
    const data = await res.json();
    setComments((prev) =>
      prev.map((c) =>
        c._id === parentId
          ? { ...c, replies: [...(c.replies || []), data.comment] }
          : c
      )
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle size={20} style={{ color: "var(--text-secondary)" }} />
        <h3 className="section-heading mb-0">{total} Comment{total !== 1 ? "s" : ""}</h3>
      </div>

      {/* Comment Input */}
      {session ? (
        <form onSubmit={submitComment} className="flex gap-3 mb-6">
          <div className="avatar w-9 h-9 text-sm flex-shrink-0">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              id="comment-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="input-field"
            />
            <button
              id="comment-submit-btn"
              type="submit"
              disabled={submitting || !text.trim()}
              className="btn-primary px-4"
            >
              {submitting ? (
                <span
                  className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                />
              ) : (
                <Send size={15} />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div
          className="p-4 rounded-xl mb-6 text-sm text-center"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          <Link href="/login" className="font-semibold" style={{ color: "var(--brand-red)" }}>
            Sign in
          </Link>{" "}
          to leave a comment.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 rounded w-1/4" />
                <div className="skeleton h-3 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              session={session}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

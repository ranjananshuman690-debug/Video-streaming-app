"use client";

import { useState, useRef, useCallback } from "react";
import { VIDEO_CATEGORIES } from "@/lib/constants";
import { Upload, Film, Tag, AlignLeft, CheckCircle, XCircle, CloudUpload } from "lucide-react";
import Image from "next/image";

const MAX_SIZE_MB = 500;

export default function UploadForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other",
    tags: "",
  });
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);
  const xhrRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  }

  function handleFileSelect(e) {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  }

  function processFile(f) {
    if (!f.type.startsWith("video/")) {
      setErrorMsg("Please select a valid video file.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File size must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFile(f);
    setErrorMsg("");
    // Create local preview URL
    const url = URL.createObjectURL(f);
    setPreview(url);
    // Auto-fill title from filename
    if (!form.title) {
      setForm((prev) => ({
        ...prev,
        title: f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !form.title.trim()) return;

    setStatus("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("tags", form.tags);

    try {
      // Use XMLHttpRequest for real upload progress
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 90));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(JSON.parse(xhr.responseText).error || "Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      setStatus("success");
      setTimeout(() => onSuccess(result.video._id), 1200);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Upload failed. Please try again.");
    }
  }

  function cancelUpload() {
    xhrRef.current?.abort();
    setStatus("idle");
    setProgress(0);
  }

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : null;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-12 rounded-2xl cursor-pointer transition-all duration-300"
          style={{
            border: `2px dashed ${dragging ? "var(--brand-red)" : "var(--border-normal)"}`,
            background: dragging ? "rgba(255,0,64,0.05)" : "var(--bg-secondary)",
            boxShadow: dragging ? "0 0 30px rgba(255,0,64,0.1)" : "none",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
            style={{
              background: dragging ? "rgba(255,0,64,0.15)" : "var(--bg-surface)",
              transform: dragging ? "scale(1.1)" : "scale(1)",
            }}
          >
            <CloudUpload size={28} style={{ color: dragging ? "var(--brand-red)" : "var(--text-muted)" }} />
          </div>
          <p className="text-lg font-semibold mb-1">
            {dragging ? "Drop it here!" : "Drag & drop your video"}
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            or click to browse — up to {MAX_SIZE_MB}MB
          </p>
          <div className="flex gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            {["MP4", "MOV", "AVI", "MKV", "WebM"].map((fmt) => (
              <span key={fmt} className="badge">{fmt}</span>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        /* File Selected Preview */
        <div
          className="flex items-center gap-4 p-4 rounded-2xl animate-scale-in"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 gradient-bg"
          >
            <Film size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {fileSizeMB} MB · {file.type}
            </p>
          </div>
          {status === "idle" && (
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-red)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <div
          className="px-4 py-3 rounded-lg text-sm animate-scale-in"
          style={{ background: "rgba(255,0,64,0.1)", border: "1px solid rgba(255,0,64,0.3)", color: "var(--brand-red)" }}
        >
          {errorMsg}
        </div>
      )}

      {/* Upload Progress */}
      {status === "uploading" && (
        <div className="animate-fade-in">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: "var(--text-secondary)" }}>
              {progress < 90 ? "Uploading to Cloudinary..." : "Processing video..."}
            </span>
            <span className="font-semibold" style={{ color: "var(--brand-red)" }}>
              {progress}%
            </span>
          </div>
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <button
            onClick={cancelUpload}
            className="mt-2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Cancel
          </button>
        </div>
      )}

      {status === "success" && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm animate-scale-in"
          style={{ background: "rgba(0,200,100,0.1)", border: "1px solid rgba(0,200,100,0.3)", color: "#00c864" }}
        >
          <CheckCircle size={16} />
          Upload successful! Redirecting...
        </div>
      )}

      {/* Metadata Form */}
      {file && status !== "success" && (
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
          <div
            className="p-6 rounded-2xl space-y-5"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Title <span style={{ color: "var(--brand-red)" }}>*</span>
              </label>
              <div className="relative">
                <Film size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  id="upload-title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Give your video a great title"
                  maxLength={200}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Description
              </label>
              <div className="relative">
                <AlignLeft size={16} className="absolute left-3 top-3" style={{ color: "var(--text-muted)" }} />
                <textarea
                  id="upload-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field pl-10 resize-none"
                  placeholder="Tell viewers about your video..."
                  rows={4}
                  maxLength={5000}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Category
                </label>
                <select
                  id="upload-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                  style={{ cursor: "pointer" }}
                >
                  {VIDEO_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} style={{ background: "var(--bg-surface)" }}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Tags
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    id="upload-tags"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="input-field pl-10"
                    placeholder="gaming, tutorial, vlog"
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Separate tags with commas
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            id="upload-submit-btn"
            type="submit"
            disabled={!file || !form.title.trim() || status === "uploading"}
            className="btn-primary w-full justify-center py-3.5 text-base"
          >
            <Upload size={18} />
            Upload Video
          </button>
        </form>
      )}
    </div>
  );
}

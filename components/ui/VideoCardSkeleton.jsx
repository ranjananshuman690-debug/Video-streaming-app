export default function VideoCardSkeleton({ compact = false }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
      {/* Thumbnail */}
      <div className="skeleton" style={{ aspectRatio: "16/9" }} />
      {/* Info */}
      <div className="p-3 flex gap-2.5">
        <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 rounded w-full" />
          <div className="skeleton h-3 rounded w-3/4" />
          <div className="skeleton h-2.5 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

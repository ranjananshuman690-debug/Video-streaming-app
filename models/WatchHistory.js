import mongoose from "mongoose";

const WatchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    progressSeconds: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one record per user-video pair
WatchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });
WatchHistorySchema.index({ userId: 1, watchedAt: -1 });

export default mongoose.models.WatchHistory || mongoose.model("WatchHistory", WatchHistorySchema);

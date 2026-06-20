import mongoose from "mongoose";
import { VIDEO_CATEGORIES } from "@/lib/constants";

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    publicId: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // seconds
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      enum: VIDEO_CATEGORIES,
      default: "Other",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    resolution: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for like count
VideoSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

// Virtual for comment count (populated separately)
VideoSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "videoId",
  count: true,
});

// Text index for search
VideoSchema.index({ title: "text", description: "text", tags: "text" });
VideoSchema.index({ category: 1 });
VideoSchema.index({ uploadedBy: 1 });
VideoSchema.index({ createdAt: -1 });

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);

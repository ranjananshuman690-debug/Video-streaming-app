import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";
import { getCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// GET /api/videos/[id] — single video with view increment
export async function GET(req, { params }) {
  try {
    await connectDB();

    const video = await Video.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("uploadedBy", "name avatar channelName subscribers subscribedTo")
      .lean();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Fetch related videos (same category, excluding current)
    const related = await Video.find({
      _id: { $ne: params.id },
      category: video.category,
      isPublished: true,
    })
      .limit(8)
      .populate("uploadedBy", "name avatar channelName")
      .lean();

    return NextResponse.json({ video, related });
  } catch (error) {
    console.error("GET /api/videos/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

// PATCH /api/videos/[id] — like toggle or update metadata
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { action, title, description, category, tags } = body;

    let update = {};

    if (action === "like") {
      // Toggle like
      const video = await Video.findById(params.id);
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }

      const userId = session.user.id;
      const hasLiked = video.likes.some((id) => id.toString() === userId);

      if (hasLiked) {
        update = { $pull: { likes: userId } };
      } else {
        update = { $addToSet: { likes: userId } };
      }
    } else {
      // Update metadata (owner only)
      const video = await Video.findById(params.id);
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }

      if (video.uploadedBy.toString() !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (title) update.title = title;
      if (description !== undefined) update.description = description;
      if (category) update.category = category;
      if (tags) update.tags = tags;
    }

    const updated = await Video.findByIdAndUpdate(params.id, update, {
      new: true,
    }).populate("uploadedBy", "name avatar channelName");

    return NextResponse.json({ video: updated });
  } catch (error) {
    console.error("PATCH /api/videos/[id] error:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

// DELETE /api/videos/[id] — remove from Cloudinary + MongoDB
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const video = await Video.findById(params.id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.publicId, {
      resource_type: "video",
    });

    // Delete from MongoDB
    await Video.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/videos/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}

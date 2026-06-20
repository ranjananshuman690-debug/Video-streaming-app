import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import WatchHistory from "@/models/WatchHistory";

export const dynamic = "force-dynamic";

// GET /api/watch-history — user's watch history
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      WatchHistory.find({ userId: session.user.id })
        .sort({ watchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "videoId",
          populate: { path: "uploadedBy", select: "name avatar channelName" },
        })
        .lean(),
      WatchHistory.countDocuments({ userId: session.user.id }),
    ]);

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("GET /api/watch-history error:", error);
    return NextResponse.json({ error: "Failed to fetch watch history" }, { status: 500 });
  }
}

// POST /api/watch-history — upsert progress
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { videoId, progressSeconds, completed } = body;

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const entry = await WatchHistory.findOneAndUpdate(
      { userId: session.user.id, videoId },
      {
        progressSeconds: progressSeconds || 0,
        completed: completed || false,
        watchedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("POST /api/watch-history error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}

// DELETE /api/watch-history?videoId=xxx — remove one item
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (videoId) {
      await WatchHistory.findOneAndDelete({
        userId: session.user.id,
        videoId,
      });
    } else {
      // Clear all history
      await WatchHistory.deleteMany({ userId: session.user.id });
    }

    return NextResponse.json({ message: "History cleared" });
  } catch (error) {
    console.error("DELETE /api/watch-history error:", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

// GET /api/videos — paginated video list with optional search/category filter
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const sort = searchParams.get("sort") || "createdAt";

    const skip = (page - 1) * limit;

    // Build query
    let query = { isPublished: true };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (userId) {
      query.uploadedBy = userId;
    }

    // Sort options
    const sortOptions = {
      createdAt: { createdAt: -1 },
      views: { views: -1 },
      likes: { likeCount: -1 },
    };

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort(sortOptions[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("uploadedBy", "name avatar channelName subscribers")
        .lean(),
      Video.countDocuments(query),
    ]);

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("GET /api/videos error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

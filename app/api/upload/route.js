import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file = data.get("file");
    const title = data.get("title");
    const description = data.get("description") || "";
    const category = data.get("category") || "Other";
    const tags = data.get("tags") ? data.get("tags").split(",").map((t) => t.trim()) : [];

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Video title is required" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get freshly configured Cloudinary instance (reads env vars at request time)
    const cloudinary = getCloudinary();

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "videostream/videos",
          eager: [
            {
              streaming_profile: "hd",
              format: "m3u8",
            },
          ],
          eager_async: true,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Auto-generate thumbnail URL from Cloudinary (screenshot at 2 seconds)
    const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: "video",
      transformation: [
        { start_offset: "2", width: 640, height: 360, crop: "fill" },
      ],
      format: "jpg",
    });

    // Save video metadata to MongoDB
    await connectDB();

    const video = await Video.create({
      title,
      description,
      videoUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      thumbnail: thumbnailUrl,
      duration: Math.round(uploadResult.duration || 0),
      category,
      tags,
      fileSize: uploadResult.bytes || 0,
      uploadedBy: session.user.id,
    });

    await video.populate("uploadedBy", "name avatar channelName");

    return NextResponse.json(
      {
        success: true,
        video,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

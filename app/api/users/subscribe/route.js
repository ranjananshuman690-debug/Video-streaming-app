import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// POST /api/users/subscribe — toggle subscribe/unsubscribe to a channel
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { channelId } = body;

    if (!channelId) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    if (channelId === session.user.id) {
      return NextResponse.json({ error: "Cannot subscribe to your own channel" }, { status: 400 });
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const isSubscribed = channel.subscribers.some(
      (id) => id.toString() === session.user.id
    );

    if (isSubscribed) {
      // Unsubscribe
      await User.findByIdAndUpdate(channelId, {
        $pull: { subscribers: session.user.id },
      });
      await User.findByIdAndUpdate(session.user.id, {
        $pull: { subscribedTo: channelId },
      });

      return NextResponse.json({ subscribed: false, message: "Unsubscribed" });
    } else {
      // Subscribe
      await User.findByIdAndUpdate(channelId, {
        $addToSet: { subscribers: session.user.id },
      });
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { subscribedTo: channelId },
      });

      return NextResponse.json({ subscribed: true, message: "Subscribed" });
    }
  } catch (error) {
    console.error("POST /api/users/subscribe error:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}

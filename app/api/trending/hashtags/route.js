// app/api/trending/hashtags/route.js
import { NextResponse } from "next/server";
import { getTrendingHashtags } from "@/lib/postUtils";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const trendingHashtags = await getTrendingHashtags(limit);

    return NextResponse.json(trendingHashtags);
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending hashtags" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { decryptId, encryptId } from "@/utils/cryptoUtils";
import { v4 as uuidv4 } from "uuid";

export async function GET(request, { params }) {
  const { postId: encryptedPostId } = params;
  let postId;
  try {
    postId = decryptId(encryptedPostId);
  } catch (error) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  if (!postId) {
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
  }

  try {
    const comments = await executeQuery(
      `SELECT 
        c.id, 
        c.content as body, 
        c.created_at, 
        c.user_id,
        c.post_id,
        u.username,
        u.email,
        u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = c.id) as like_count
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC`,
      [postId]
    );

    const formattedComments = comments.map((comment) => ({
      encryptedId: encryptId(comment.id),
      body: comment.body,
      createdAt: comment.created_at,
      postId: encryptId(comment.post_id),
      likesCount: comment.like_count || 0,
      user: {
        username: comment.username,
        name: comment.username,
        avatar: comment.avatar,
      },
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId: encryptedPostId } = params;
    let postId;
    try {
      postId = decryptId(encryptedPostId);
    } catch (error) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (!postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const data = await request.json();
    if (!data.content && !data.body) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const commentContent = data.content || data.body;

    const post = await executeQuery("SELECT id FROM posts WHERE id = ?", [
      postId,
    ]);
    if (post.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const commentId = uuidv4();
    await executeQuery(
      "INSERT INTO comments (id, content, user_id, post_id, created_at) VALUES (?, ?, ?, ?, NOW())",
      [commentId, commentContent, session.user.id, postId]
    );

    const newComment = await executeQuery(
      `SELECT 
        c.id, 
        c.content as body, 
        c.created_at, 
        c.user_id,
        c.post_id,
        u.username,
        u.email,
        u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [commentId]
    );

    if (newComment.length === 0) {
      return NextResponse.json(
        { error: "Failed to retrieve new comment" },
        { status: 500 }
      );
    }

    const formattedComment = {
      encryptedId: encryptId(newComment[0].id),
      body: newComment[0].body,
      createdAt: newComment[0].created_at,
      postId: encryptId(newComment[0].post_id),
      likesCount: 0,
      user: {
        username: newComment[0].username,
        name: newComment[0].username,
        avatar: newComment[0].avatar,
      },
    };

    return NextResponse.json(formattedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment", details: error.message },
      { status: 500 }
    );
  }
}

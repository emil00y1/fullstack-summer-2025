import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeQuery } from '@/lib/db';
import { decryptId } from '@/utils/cryptoUtils';

export async function DELETE(request, { params }) {
  const session = await auth();

  // Check if user is authenticated
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'You must be logged in to delete a comment' },
      { status: 401 }
    );
  }

  try {
    const encryptedCommentId = params.commentId;
    const commentId = decryptId(encryptedCommentId);

    if (!commentId) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      );
    }

    // Get comment information to check ownership
    const comments = await executeQuery(
      'SELECT user_id FROM comments WHERE id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const comment = comments[0];
    const currentUserId = session.user.id;

    // Check if user is the comment owner or an admin
    let isAdmin = false;
    if (currentUserId) {
      const adminCheck = await executeQuery(
        `SELECT 1 FROM user_roles ur 
         JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = ? AND r.name = 'admin'
         LIMIT 1`,
        [currentUserId]
      );
      isAdmin = adminCheck.length > 0;
    }

    if (comment.user_id !== currentUserId && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 }
      );
    }

    // Delete related records first (to maintain referential integrity)
    await executeQuery('DELETE FROM comment_likes WHERE comment_id = ?', [
      commentId,
    ]);

    // Delete the comment
    await executeQuery('DELETE FROM comments WHERE id = ?', [commentId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

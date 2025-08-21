'use client';

import { deleteCommentAction, getCurrentUser } from '@/data/actions/comment-actions';

export async function fetchCurrentUserClient() {
  return await getCurrentUser();
}

export async function callDeleteComment(commentId: string): Promise<{ message: string; success: boolean }> {
  console.log("Delete comment with ID:", commentId);
  try {
    await deleteCommentAction(commentId);
    return { message: "Comment deleted successfully.", success: true };
  } catch (error) {
    return { message: "Failed to delete comment.", success: false };
  }
}

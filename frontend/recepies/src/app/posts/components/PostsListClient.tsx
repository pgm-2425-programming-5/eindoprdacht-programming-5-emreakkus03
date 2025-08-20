'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostsItem from './PostsItem';
import { Post } from '@/types/Post';
import { deletePostAction } from '@/data/actions/recipe-actions';
import { EditRecipeForm } from '@/components/forms/edit-recipe-form';
import { getCurrentUser } from '@/data/actions/comment-actions'; // of waar je helper staat

export default function PostsListClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Ophalen ingelogde user (client-side)
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setCurrentUserId(user.documentId);
    });
  }, []);

  const handleDeletePost = async (id: string) => {
    await deletePostAction(id);
    router.refresh();
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleCloseForm = () => {
    setEditingPost(null);
  };

  return (
    <>
      {editingPost && (
        <EditRecipeForm post={editingPost} onClose={handleCloseForm} />
      )}

      {posts.map((post) => {
        // check: is deze user ingelogd én eigenaar?
        const isOwner = currentUserId && post.user?.documentId === currentUserId;

        return (
          <div key={post.documentId} className="border p-3 rounded mb-4">
            <PostsItem post={post} />

            {isOwner && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditPost(post)}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => handleDeletePost(post.documentId)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Verwijderen
                </button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
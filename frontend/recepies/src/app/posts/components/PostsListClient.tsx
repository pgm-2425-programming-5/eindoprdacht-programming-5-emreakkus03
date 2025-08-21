'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostItem from './PostsItem';
import { Post } from '@/types/Post';
import { deletePostAction } from '@/data/actions/recipe-actions';
import { EditRecipeForm } from '@/components/forms/edit-recipe-form';
import { getCurrentUser } from '@/data/actions/comment-actions';

export default function PostsListClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  
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

      
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const isOwner =
            currentUserId && post.user?.documentId === currentUserId;

          return (
            <li
              key={post.documentId}
              className="bg-gray-100 border rounded-lg shadow-md overflow-hidden"
            >
              <PostItem post={post} />

              {isOwner && (
                <div className="flex justify-center gap-2 p-3 border-t">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.documentId)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

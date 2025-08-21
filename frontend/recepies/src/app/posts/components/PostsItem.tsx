"use client";

import React from 'react';
import { Post } from '@/types/Post';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostButton from './PostButton';

interface PostItemProps {
  post: Post;
  deletePost?: (postId: number) => void;
  editPost?: (postId: number) => void;
}

export default function PostItem({ post, deletePost, editPost }: PostItemProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <li className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <Link href={`/posts/${post.documentId}`}>
        
        {post.image?.url && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${post.image.url}`}
            alt={post.image.alternativeText || 'Post image'}
            className="w-full h-56 object-cover"
          />
        )}
      </Link>

      
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-1">{post.title}</h2>
        <p className="text-sm text-gray-500 mb-2">
          {post.user?.username || 'Undefined'} • {format(new Date(post.dateAdded), 'dd-MM-yyyy')}
        </p>


        <p className="text-sm text-gray-600 mb-2">
          🕒 {post.totalTime} min | 🧑‍🍳 {post.difficulty} | {post.servings} servings
        </p>

        <p className="text-gray-500 mb-4">{post.amountLikes} 👍</p>

        
        <div className="flex justify-center space-x-4">
          {editPost && (
            <PostButton color="blue" onClick={editPost} postId={post.id}>
              Update
            </PostButton>
          )}
          {deletePost && (
            <PostButton color="red" onClick={deletePost} postId={post.id}>
              Delete
            </PostButton>
          )}
        </div>
      </div>
    </li>
  );
}

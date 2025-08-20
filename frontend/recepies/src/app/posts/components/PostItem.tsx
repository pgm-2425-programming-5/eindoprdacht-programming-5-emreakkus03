// ✅ FIXED versie van PostItem.tsx
"use client";
import CommentForm from '@/components/forms/comment-form';
import React from 'react';
import { Post } from '@/types/Post';
import { format } from 'date-fns';
import CommentItem from './CommentItem';
import { useRouter } from 'next/navigation';

import Link from 'next/link';
import PostButton from './PostButton';
import { RichText } from '@graphcms/rich-text-react-renderer';

interface PostItemProps {
  post: Post;
  deletePost?: (postId: number) => void;
  editPost?: (postId: number) => void;
}

export default function PostsItem({ post, deletePost, editPost }: PostItemProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <li className="p-6 border rounded-lg shadow-md bg-gray-200 mb-4">
        <Link href={`/posts/${post.documentId}`} className="block hover:underline">
        <div className="flex items-center mb-4">
          {post.image?.url && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${post.image.url}`}
            alt={post.image.alternativeText || 'Post image'}
            className="w-10 h-10 rounded-full mr-4"
          />
        )}
        <div>
          <h2 className="text-lg font-semibold">{post.user?.username || 'Onbekend'}</h2>
          <p className="text-sm text-gray-500">{format(new Date(post.dateAdded), 'dd-MM-yyyy')}</p>
        </div>
      </div>
</Link>
      <p className="text-gray-700 mb-4">{post.title}</p>
      <p className="text-gray-700 mb-4">{post.description}</p>
      <p className="text-gray-700 mb-4">{post.ingredients}</p>
      <p className="text-gray-700 mb-4">{post.steps}</p>
      

      <p className="text-sm text-gray-600">
        🕒 {post.totalTime} min | 🧑‍🍳 {post.difficulty} | {post.servings}
      </p>
      {post.category?.title && (
        <p className="text-sm text-gray-500">Categorie: {post.category.title}</p>
      )}

      <p className="text-gray-500 mb-4">{post.amountLikes} 👍</p>

      <div className="flex space-x-4 mb-4">
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
 
      <details className="mt-4">
        <summary className="text-xl font-semibold cursor-pointer">Comments</summary>
        <CommentForm documentId={post.documentId} onSubmitted={handleRefresh} />
        <ul className="space-y-2 mt-2">
          {(post.comments || []).map((comment, index) => (
            <CommentItem
              key={comment.documentId + '-' + index} // fix voor dubbele keys
              comment={comment}
              documentId={post.documentId}
              depth={0}
              onDeleted={() => router.refresh()}
              onEdited={() => router.refresh()}
            />
          ))}
        </ul>
      </details>
    </li>
   

  );
}

"use client";
import CommentForm from '@/components/forms/comment-form';
import React from 'react';
import { Post } from '@/types/Post';
import { format } from 'date-fns';
import CommentItem from './CommentItem';
import { useRouter } from 'next/navigation';
import PostButton from './PostButton';


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
    <li className="p-6 border rounded-lg shadow-md bg-gray-200 mb-6">
      
      
      {post.image?.url && (
        <div className="w-full flex justify-center mb-4">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${post.image.url}`}
            alt={post.image.alternativeText || 'Post image'}
            className="w-full max-w-3xl rounded-2xl shadow-lg object-cover"
          />
        </div>
      )}

      
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
          <span>{format(new Date(post.dateAdded), 'dd-MM-yyyy')}</span>
          <span>•</span>
          <span>{post.user?.username || 'Undefined'}</span>
        </div>
      </div>

     <div className="text-center max-w-2xl mx-auto">
  <p className="text-gray-700 mb-4">{post.description}</p>
  <p className="text-gray-700 mb-4">{post.ingredients}</p>
  <p className="text-gray-700 mb-4">{post.steps}</p>

  <p className="text-sm text-gray-600 mb-2">
    🕒 {post.totalTime} min | 🧑‍🍳 {post.difficulty} | {post.servings} servings | 👍 {post.amountLikes}
  </p>

  {post.category?.title && (
    <p className="text-sm font-semibold mb-4">
      Category: {post.category.title}
    </p>
  )}
</div>

      
      <div className="flex space-x-4 mb-6">
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
              key={comment.documentId + '-' + index}
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

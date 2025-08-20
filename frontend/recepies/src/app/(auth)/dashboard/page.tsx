import { gql, request } from 'graphql-request';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PostItem from '@/app/posts/components/PostItem';
import CommentItem from '@/app/posts/components/CommentItem';
import { Post } from '@/types/Post';
import { Comment } from '@/types/Post';
import {
  deleteCommentAction,
  editCommentAction,
  getCurrentUser,
} from '@/data/actions/comment-actions';

import { deletePostAction, editPostAction } from '@/data/actions/recipe-actions';
import { EditRecipeForm } from '@/components/forms/edit-recipe-form'; 
import CommentForm from '@/components/forms/comment-form';

const STRAPI_GRAPHQL_URL =
    process.env.STRAPI_GRAPHQL_URL || 'http://localhost:1337/graphql';

export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const query = gql`
  query GetUserPosts($userId: ID!) {
    posts(filters: { user: { documentId: { eq: $userId } } }) {
      documentId
      title
      description
      dateAdded
      difficulty
      servings
      totalTime
      category {
        title
        documentId
      }
      image {
        url
        alternativeText
      }
      user {
        documentId
        username
      }
    }
  }
`;

const res = await request<{ posts: Post[] }>(STRAPI_GRAPHQL_URL, query, {
  userId, // <-- dit moet dus de documentId van de user zijn
});

  return res.posts;
}

async function fetchUserComments(userId: string): Promise<Comment[]> {
  const query = gql`
    query GetUserComments($userId: ID!) {
      comments(filters: { users_permissions_user: { documentId: { eq: $userId } } }) {
        documentId
        message
        dateAdded
        users_permissions_user {
          documentId
          username
        }
        post {
          documentId
          title
        }
      }
    }
  `;
  const res = await request<{ comments: Comment[] }>(
    STRAPI_GRAPHQL_URL,
    query,
    { userId }
  );
  return res.comments;
}

export default async function MyPage() {
  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) {
    redirect('/login');
  }

  const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: 'no-store',
  });
  const user = await userRes.json();

  const posts = await fetchUserPosts(user.documentId);
  const comments = await fetchUserComments(user.documentId);

  return (
    <div className="space-y-10">
      {/* === POSTS === */}
      <section>
        <h2 className="text-xl font-bold mb-4">Mijn Posts</h2>
        {posts.length === 0 ? (
          <p>Geen posts gevonden.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.documentId} className="border p-3 rounded">
                <PostItem post={post} />

                <div className="flex gap-2 mt-2">
                  {/* DELETE POST */}
                  <form
                    action={async () => {
                      'use server';
                      await deletePostAction(post.documentId);
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Verwijderen
                    </button>
                  </form>

                  {/* EDIT POST (voorbeeld: titel aanpassen) */}
                  <form
                    action={async () => {
                      'use server';
                      await editPostAction(post.documentId, {
                        title: post.title + ' (bewerkt)',
                      });
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Bewerken
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* === COMMENTS === */}
      <section>
        <h2 className="text-xl font-bold mb-4">Mijn Comments</h2>
        {comments.length === 0 ? (
          <p>Geen comments gevonden.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.documentId} className="border p-3 rounded">
                <p className="text-gray-700">{comment.message}</p>
                <p className="text-sm text-gray-500">
                  {comment.users_permissions_user?.username} op{' '}
                  {new Date(comment.dateAdded).toLocaleDateString()}
                </p>

                <div className="flex gap-2 mt-2">
                  {/* DELETE COMMENT */}
                  <form
                    action={async () => {
                      'use server';
                      await deleteCommentAction(comment.documentId);
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Verwijderen
                    </button>
                  </form>

                  {/* EDIT COMMENT (voorbeeld: bericht aanpassen) */}
                  <form
                    action={async () => {
                      'use server';
                      await editCommentAction(
                        comment.documentId,
                        comment.message + ' (bewerkt)'
                      );
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Bewerken
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

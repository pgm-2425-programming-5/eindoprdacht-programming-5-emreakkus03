import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PostItem from '@/app/posts/components/PostItem'

import {
  deleteCommentAction,
  editCommentAction,
} from '@/data/actions/comment-actions'

import {
  deletePostAction,
  editPostAction,
} from '@/data/actions/recipe-actions'

import { fetchUserPosts, fetchUserComments } from '../lib/fetchUserData'

export default async function MyPage() {
  const jwt = (await cookies()).get('jwt')?.value
  if (!jwt) {
    redirect('/login')
  }

  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
    {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    }
  )
  const user = await userRes.json()

  const posts = await fetchUserPosts(user.documentId)
  const comments = await fetchUserComments(user.documentId)

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold mb-4">My Recipes</h2>
        {posts.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.documentId} className="border p-3 rounded">
                <PostItem post={post} />

                <div className="flex gap-2 mt-2">
                  <form
                    action={async () => {
                      'use server'
                      await deletePostAction(post.documentId)
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </form>

                  <form
                    action={async () => {
                      'use server'
                      await editPostAction(post.documentId, {
                        title: post.title + ' (edited)',
                      })
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">My Comments</h2>
        {comments.length === 0 ? (
          <p>No comments found.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.documentId} className="border p-3 rounded">
                <p className="text-gray-700">{comment.message}</p>
                <p className="text-sm text-gray-500">
                  {comment.users_permissions_user?.username} on{' '}
                  {new Date(comment.dateAdded).toLocaleDateString()}
                </p>

                <div className="flex gap-2 mt-2">
                  <form
                    action={async () => {
                      'use server'
                      await deleteCommentAction(comment.documentId)
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </form>

                  <form
                    action={async () => {
                      'use server'
                      await editCommentAction(
                        comment.documentId,
                        comment.message + ' (edited)'
                      )
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

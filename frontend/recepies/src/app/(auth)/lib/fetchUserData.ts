import { gql, request } from 'graphql-request'
import { Post, Comment } from '@/types/Post'

const STRAPI_GRAPHQL_URL =
  process.env.STRAPI_GRAPHQL_URL || 'http://localhost:1337/graphql'

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
  `

  const res = await request<{ posts: Post[] }>(STRAPI_GRAPHQL_URL, query, {
    userId,
  })

  return res.posts
}

export async function fetchUserComments(userId: string): Promise<Comment[]> {
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
  `

  const res = await request<{ comments: Comment[] }>(STRAPI_GRAPHQL_URL, query, {
    userId,
  })

  return res.comments
}

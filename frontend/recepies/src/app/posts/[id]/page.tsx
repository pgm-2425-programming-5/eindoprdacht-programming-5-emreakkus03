import { Post } from '@/types/Post';
import PostItem from '../components/PostItem';
import { gql, request } from 'graphql-request';

const STRAPI_GRAPHQL_URL =
  process.env.STRAPI_GRAPHQL_URL || 'http://localhost:1337/graphql';

interface PostPageProps {
  params: Promise<{ id: string }>; 
}

async function fetchPost(id: string): Promise<Post> {
  const query = gql`
    query Query($documentId: ID!) {
      post(documentId: $documentId) {
        amountLikes
        dateAdded
        image {
          url
          alternativeText
        }
        comments {
          documentId
          dateAdded
          message
          users_permissions_user {
            documentId
            username
          }
        }
        title
        difficulty
        description
        documentId
        ingredients
        steps
        totalTime
        servings
        category {
          title
        }
      }
    }
  `;
  const variables = { documentId: id };
  const response: { post: Post } = await request(
    STRAPI_GRAPHQL_URL,
    query,
    variables
  );

  return response.post;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params; 
  const post = await fetchPost(id);

  return <PostItem key={post.documentId} post={post} />;
}

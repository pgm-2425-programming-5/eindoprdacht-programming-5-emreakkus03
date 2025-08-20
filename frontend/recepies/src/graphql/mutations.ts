import { gql } from 'graphql-request';

export const deletePost = gql`
  mutation DeletePost($documentId: String!) {
    deletePost(documentId: $documentId) {
      success
      documentId
      message
    }
  }
`;

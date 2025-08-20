import { gql } from "graphql-request";

export const deleteComment = gql`
  mutation ($documentId: ID!) {
    deleteComment(documentId: $documentId) {
      documentId
    }
  }
`;

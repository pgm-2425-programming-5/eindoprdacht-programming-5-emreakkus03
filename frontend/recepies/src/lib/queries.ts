import { gql, request } from 'graphql-request';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getCategories() {
  const query = gql`
    query {
      categories {
        documentId
        title
      }
    }
  `;

  interface CategoriesResponse {
    categories: { documentId: string; title: string }[];
  }
  const response = await request<CategoriesResponse>(`${baseUrl}/graphql`, query);
  return response.categories;
}

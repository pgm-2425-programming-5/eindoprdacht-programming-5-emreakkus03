import React from 'react';
import { Post } from '@/types/Post';
import { gql, request } from 'graphql-request';
import { cookies } from 'next/headers';
import SearchSortForm from './components/SearchSortForm';
import Link from 'next/link';
import PostsListClient from './components/PostsListClient';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

async function fetchPosts(
  jwt: string,
  search: string = "",
  sort: 'asc' | 'desc' = 'asc',
  category: string = ""
): Promise<Post[]> {
  const query = gql`
    query Posts($filters: PostFiltersInput, $sort: [String]) {
      posts(filters: $filters, sort: $sort) {
        amountLikes
        documentId
        dateAdded
        image { url alternativeText }
        comments {
          dateAdded
          message
          users_permissions_user { username }
        }
        title
        difficulty
        description
        totalTime
        servings
        category { documentId title }
        user {
          documentId
          username
        }
      }
    }
  `;

  const filters: any = { title: { containsi: search } };
  if (category) {
    filters.category = { documentId: { eq: category } };
  }

  const sortParam = [`title:${sort}`];

  const response: { posts: Post[] } = await request(
    baseUrl + '/graphql',
    query,
    { filters, sort: sortParam },
    { Authorization: `Bearer ${jwt}` }
  );
  return response.posts;
}


export const fetchCache = 'force-no-store';

type Props = {
  searchParams?: Promise<{ search?: string; sort?: string; category?: string }>;
};

export default async function PostsPage({ searchParams }: Props) {
  // Next.js 15 verwacht searchParams als Promise
  const params = (await searchParams) || {};
  const search = params.search || "";
  const sort = (params.sort === "asc" || params.sort === "desc" ? params.sort : "asc") as 'asc' | 'desc';
  const category = params.category || "";

  const jwt = (await cookies()).get('jwt')?.value || "";
  const posts = await fetchPosts(jwt, search, sort, category);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Recipes</h1>

        {jwt && (
          <Link
            href="/posts/create"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Recipe
          </Link>
        )}
      </div>
      <SearchSortForm initialSearch={search} initialSort={sort} initialCategory={category} />
      <PostsListClient posts={posts} />
    </div>
  );
}

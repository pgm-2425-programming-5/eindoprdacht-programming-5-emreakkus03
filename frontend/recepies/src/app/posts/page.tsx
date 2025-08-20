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
  searchParams?: { search?: string; sort?: string; category?: string };
};

export default async function PostsPage({ searchParams }: Props) {
  

  const search = searchParams?.search || "";
  const sort = (searchParams?.sort === "asc" || searchParams?.sort === "desc" ? searchParams.sort : "asc") as 'asc' | 'desc';
  const category = searchParams?.category || "";

  const jwt = (await cookies()).get('jwt')?.value || "";
  const posts = await fetchPosts(jwt, search, sort, category);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Posts</h1>
      <SearchSortForm initialSearch={search} initialSort={sort} initialCategory={category} />
      <PostsListClient posts={posts} />
    </div>
  );
}
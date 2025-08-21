'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { gql } from "graphql-request";



async function getJwt() {
  return (await cookies()).get('jwt')?.value || null;
}

export async function requestGraphQL(query: string, variables: any, jwt?: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(jwt && { Authorization: `Bearer ${jwt}` }),
    },
    body: JSON.stringify({ query, variables }),
  });

  return res.json().then((res) => res.data);
}



export async function getCurrentUser() {
  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return null;

  const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  if (!userRes.ok) return null;
  return await userRes.json();
}


export async function createCommentAction(_: any, formData: FormData) {
  const message = formData.get('message') as string;
  const documentId = formData.get('documentId') as string;
  const parentCommentId = formData.get('parentCommentId') as string | null;

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Not logged in' };

  const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!userRes.ok) return { message: 'Could not retrieve user' };
  const user = await userRes.json();

  const postRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?filters[documentId][$eq]=${documentId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const postData = await postRes.json();
  const post = postData.data?.[0];
  if (!post) return { message: 'Post not found' };

  const commentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        message,
        dateAdded: new Date().toISOString(),
        users_permissions_user: user.id,
        post: post.id,
        ...(parentCommentId && { parent: parentCommentId }),
      },
    }),
  });

  const createdComment = await commentRes.json();

  if (!commentRes.ok) {
    console.error('Error creating comment:', createdComment);
    return { message: 'Error saving comment' };
  }

  console.log('✔️ Created comment with post link:', createdComment);

  return { message: 'Comment successfully posted and linked to post' };
}

export async function deleteCommentAction(commentDocumentId: string) {
  console.log("➡️ deleteCommentAction started with documentId:", commentDocumentId);

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Not logged in' };

  const currentUser = await getCurrentUser();
  console.log("👤 Current user:", currentUser);
  if (!currentUser) return { message: 'Could not retrieve user' };

  
  const query = `
    query GetComment($docId: ID!) {
      comments(filters: { documentId: { eq: $docId } }) {
        documentId
        message
        users_permissions_user {
          username
          documentId
        }
      }
    }
  `;

  const variables = { docId: commentDocumentId };
  console.log("📦 Variables for GraphQL:", variables);

  const data = await requestGraphQL(query, variables, jwt);
  console.log("📥 GraphQL response:", data);

  const comment = data?.comments?.[0];
  if (!comment) {
    return { message: 'Comment not found' };
  }

  
  if (comment.users_permissions_user?.documentId !== currentUser.documentId) {
    return { message: 'No permission to delete this comment' };
  }

  // 🗑 Delete uitvoeren
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentDocumentId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ DELETE failed:", errText);
    return { message: 'Error deleting comment' };
  }

  console.log("✅ Comment successfully deleted");
  return { message: 'Comment successfully deleted' };
}

export async function editCommentAction(
  commentDocumentId: string,
  newMessage: string
) {
  console.log("✏️ editCommentAction started with documentId:", commentDocumentId);

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Not logged in' };

  const currentUser = await getCurrentUser();
  console.log("👤 Current user:", currentUser);
  if (!currentUser) return { message: 'Could not retrieve user' };

 
  const query = `
    query GetComment($docId: ID!) {
      comments(filters: { documentId: { eq: $docId } }) {
        documentId
        message
        users_permissions_user {
          username
          documentId
        }
      }
    }
  `;

  const variables = { docId: commentDocumentId };
  console.log("📦 Variables for GraphQL:", variables);

  const data = await requestGraphQL(query, variables, jwt);
  console.log("📥 GraphQL response:", data);

  const comment = data?.comments?.[0];
  if (!comment) {
    return { message: 'Comment not found' };
  }

 
  if (comment.users_permissions_user?.documentId !== currentUser.documentId) {
    return { message: 'No permission to edit this comment' };
  }


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentDocumentId}`,
    {
      method: 'PUT', 
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          message: newMessage,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ PATCH failed:", errText);
    return { message: 'Error editing comment' };
  }

  const updated = await res.json();
  console.log("✅ Comment successfully edited:", updated);
  return { message: 'Comment successfully edited', comment: updated };
}
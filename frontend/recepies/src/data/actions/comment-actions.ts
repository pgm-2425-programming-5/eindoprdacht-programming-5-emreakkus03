'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { gql } from "graphql-request";


// Helper functie om JWT op te halen uit cookies
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


// Haal de ingelogde gebruiker op via JWT cookie
export async function getCurrentUser() {
  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return null;

  const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  if (!userRes.ok) return null;
  return await userRes.json();
}

// Comment aanmaken en koppelen aan post en eventueel parent comment
export async function createCommentAction(_: any, formData: FormData) {
  const message = formData.get('message') as string;
  const documentId = formData.get('documentId') as string;
  const parentCommentId = formData.get('parentCommentId') as string | null;

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Niet ingelogd' };

  const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!userRes.ok) return { message: 'Kon gebruiker niet ophalen' };
  const user = await userRes.json();

  const postRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?filters[documentId][$eq]=${documentId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const postData = await postRes.json();
  const post = postData.data?.[0];
  if (!post) return { message: 'Post niet gevonden' };

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
    console.error('Fout bij aanmaken comment:', createdComment);
    return { message: 'Fout bij opslaan van reactie' };
  }

  console.log('✔️ Gemaakte comment inclusief post-link:', createdComment);

  return { message: 'Comment succesvol geplaatst en gekoppeld aan post' };
}

export async function deleteCommentAction(commentDocumentId: string) {
  console.log("➡️ deleteCommentAction gestart met documentId:", commentDocumentId);

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Niet ingelogd' };

  const currentUser = await getCurrentUser();
  console.log("👤 Huidige gebruiker:", currentUser);
  if (!currentUser) return { message: 'Kon gebruiker niet ophalen' };

  // ✅ Werkende GraphQL query
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
  console.log("📦 Variabelen voor GraphQL:", variables);

  const data = await requestGraphQL(query, variables, jwt);
  console.log("📥 GraphQL response:", data);

  const comment = data?.comments?.[0];
  if (!comment) {
    return { message: 'Comment niet gevonden' };
  }

  // 🔒 Check eigenaar
  if (comment.users_permissions_user?.documentId !== currentUser.documentId) {
    return { message: 'Geen toestemming om deze reactie te verwijderen' };
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
    console.error("❌ DELETE mislukt:", errText);
    return { message: 'Fout bij verwijderen van reactie' };
  }

  console.log("✅ Comment succesvol verwijderd");
  return { message: 'Comment succesvol verwijderd' };
}

export async function editCommentAction(
  commentDocumentId: string,
  newMessage: string
) {
  console.log("✏️ editCommentAction gestart met documentId:", commentDocumentId);

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Niet ingelogd' };

  const currentUser = await getCurrentUser();
  console.log("👤 Huidige gebruiker:", currentUser);
  if (!currentUser) return { message: 'Kon gebruiker niet ophalen' };

  // ✅ Zelfde GraphQL query om comment + eigenaar op te halen
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
  console.log("📦 Variabelen voor GraphQL:", variables);

  const data = await requestGraphQL(query, variables, jwt);
  console.log("📥 GraphQL response:", data);

  const comment = data?.comments?.[0];
  if (!comment) {
    return { message: 'Comment niet gevonden' };
  }

  // 🔒 Check eigenaar
  if (comment.users_permissions_user?.documentId !== currentUser.documentId) {
    return { message: 'Geen toestemming om deze reactie te bewerken' };
  }

  // ✏️ PATCH uitvoeren
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentDocumentId}`,
    {
      method: 'PUT', // of 'PUT' afhankelijk van je Strapi config
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
    console.error("❌ PATCH mislukt:", errText);
    return { message: 'Fout bij bewerken van reactie' };
  }

  const updated = await res.json();
  console.log("✅ Comment succesvol bewerkt:", updated);
  return { message: 'Comment succesvol bewerkt', comment: updated };
}
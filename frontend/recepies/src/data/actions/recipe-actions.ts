'use server';

import { cookies } from 'next/headers';
import { getCurrentUser } from './comment-actions';
import { redirect } from "next/navigation";

export async function createRecipeAction(_: any, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const ingredients = formData.get('ingredients') as string;
  const steps = formData.get('steps') as string;
  const difficulty = formData.get('difficulty') as string;
  const totalTime = Number(formData.get('totalTime'));
  const servings = Number(formData.get('servings'));
  const category = formData.get('category') as string;
  const imageFile = formData.get('image') as File;
  const slug = title.toLowerCase().replace(/\s+/g, '-');

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Not logged in' };

  
  const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!userRes.ok) return { message: 'Could not retrieve user' };
  const user = await userRes.json();

  
  const postRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        title,
        description,
        ingredients,
        steps,
        slug,
        difficulty,
        totalTime,
        servings,
        dateAdded: new Date().toISOString(),
        user: user.id,
        category,
      },
    }),
  });

  if (!postRes.ok) {
    console.error('Error creating recipe:', await postRes.text());
    return { message: 'Error saving recipe' };
  }

  const post = await postRes.json();
  const recipeId = post.data.id;

  
  if (!imageFile || !(imageFile instanceof Blob) || imageFile.size === 0) {
    return { message: 'No image selected or invalid file' };
  }

  const imageForm = new FormData();
  imageForm.append('files', imageFile, imageFile.name);
  imageForm.append('ref', 'api::post.post'); 
  imageForm.append('refId', recipeId.toString());
  imageForm.append('field', 'image');

  const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: imageForm,
  });

  

  redirect('/posts');
  return { message: 'Recipe successfully created' };
}

export async function deletePostAction(postDocumentId: string) {
  console.log("➡️ deletePostAction started with documentId:", postDocumentId);

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Not logged in' };

  const currentUser = await getCurrentUser();
  if (!currentUser) return { message: 'Could not retrieve user' };

  
  const postRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?filters[documentId][$eq]=${postDocumentId}&populate=user`,
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  if (!postRes.ok) return { message: 'Error fetching post' };

  const data = await postRes.json();
  const post = data.data?.[0];
  if (!post) return { message: 'Post not found' };

  if (post.user?.documentId !== currentUser.documentId) {
    return { message: 'No permission to delete this post' };
  }

  
  const delRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postDocumentId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!delRes.ok) {
    const errText = await delRes.text();
    console.error('❌ DELETE failed:', errText);
    return { message: 'Error deleting post' };
  }

  console.log("✅ Post successfully deleted");
  return { message: 'Post successfully deleted' };
}

export async function editPostAction(
  postDocumentId: string,
  updates: {
    title?: string;
    description?: string;
    ingredients?: string;
    steps?: string;
    difficulty?: string;
    totalTime?: number;
    servings?: number;
    category?: string;
  }
) {
  console.log("✏️ editPostAction started with documentId:", postDocumentId);

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Not logged in' };

  const currentUser = await getCurrentUser();
  if (!currentUser) return { message: 'Could not retrieve user' };

  
  const postRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?filters[documentId][$eq]=${postDocumentId}&populate=user`,
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  if (!postRes.ok) return { message: 'Error while fetching post' };

  const data = await postRes.json();
  const post = data.data?.[0];
  if (!post) return { message: 'Post not found' };

  if (post.user?.documentId !== currentUser.documentId) {
    return { message: 'No permission to edit this post' };
  }

  
  const putRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postDocumentId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: updates }),
    }
  );

  if (!putRes.ok) {
    const errText = await putRes.text();
    console.error("❌ PATCH failed:", errText);
    return { message: 'Error while editing post' };
  }

  const updated = await putRes.json();
  console.log("✅ Post successfully edited:", updated);
  return { message: 'Post successfully edited', post: updated };
}

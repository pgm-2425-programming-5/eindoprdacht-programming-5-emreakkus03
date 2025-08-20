'use server';

import { cookies } from 'next/headers';
import { getCurrentUser } from './comment-actions';

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
  if (!jwt) return { message: 'Niet ingelogd' };

  // Haal de ingelogde gebruiker op
  const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!userRes.ok) return { message: 'Kon gebruiker niet ophalen' };
  const user = await userRes.json();

  // 1) Maak het recept aan zonder afbeelding
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
    console.error('Fout bij aanmaken recept:', await postRes.text());
    return { message: 'Fout bij opslaan van recept' };
  }

  const post = await postRes.json();
  const recipeId = post.data.id;

  // 2) Controleer en upload afbeelding + koppel aan recept
  if (!imageFile || !(imageFile instanceof Blob) || imageFile.size === 0) {
    return { message: 'Geen afbeelding geselecteerd of ongeldig bestand' };
  }

  const imageForm = new FormData();
  imageForm.append('files', imageFile, imageFile.name);
  imageForm.append('ref', 'api::post.post'); // pas aan als jouw content-type een andere UID heeft
  imageForm.append('refId', recipeId.toString());
  imageForm.append('field', 'image'); // veldnaam in jouw content-type

  const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: imageForm,
  });

  if (!uploadResponse.ok) {
    console.error('Fout bij uploaden afbeelding:', await uploadResponse.text());
    return { message: 'Fout bij uploaden van afbeelding' };
  }

  return { message: 'Recept succesvol aangemaakt' };
}

export async function deletePostAction(postDocumentId: string) {
  console.log("➡️ deletePostAction gestart met documentId:", postDocumentId);

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Niet ingelogd' };

  const currentUser = await getCurrentUser();
  if (!currentUser) return { message: 'Kon gebruiker niet ophalen' };

  // 🔍 Post ophalen om eigenaar te checken
  const postRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?filters[documentId][$eq]=${postDocumentId}&populate=user`,
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  if (!postRes.ok) return { message: 'Fout bij ophalen van post' };

  const data = await postRes.json();
  const post = data.data?.[0];
  if (!post) return { message: 'Post niet gevonden' };

  if (post.user?.documentId !== currentUser.documentId) {
    return { message: 'Geen toestemming om deze post te verwijderen' };
  }

  // 🗑 Post verwijderen
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
    console.error('❌ DELETE mislukt:', errText);
    return { message: 'Fout bij verwijderen van post' };
  }

  console.log("✅ Post succesvol verwijderd");
  return { message: 'Post succesvol verwijderd' };
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
  console.log("✏️ editPostAction gestart met documentId:", postDocumentId);

  const jwt = (await cookies()).get('jwt')?.value;
  if (!jwt) return { message: 'Niet ingelogd' };

  const currentUser = await getCurrentUser();
  if (!currentUser) return { message: 'Kon gebruiker niet ophalen' };

  // 🔍 Post ophalen om eigenaar te checken
  const postRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts?filters[documentId][$eq]=${postDocumentId}&populate=user`,
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  if (!postRes.ok) return { message: 'Fout bij ophalen van post' };

  const data = await postRes.json();
  const post = data.data?.[0];
  if (!post) return { message: 'Post niet gevonden' };

  if (post.user?.documentId !== currentUser.documentId) {
    return { message: 'Geen toestemming om deze post te bewerken' };
  }

  // ✏️ PATCH uitvoeren
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
    console.error("❌ PATCH mislukt:", errText);
    return { message: 'Fout bij bewerken van post' };
  }

  const updated = await putRes.json();
  console.log("✅ Post succesvol bewerkt:", updated);
  return { message: 'Post succesvol bewerkt', post: updated };
}

'use server';

import { cookies } from 'next/headers';

export async function changeProfileAction(_: any, formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;
  const userId = formData.get('id');

  if (password && password !== passwordConfirm) {
    return { message: 'Wachtwoorden komen niet overeen' };
  }

  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value;

  const body: any = {
    username,
    email,
  };

  // Alleen password meesturen als ingevuld
  if (password) {
    body.password = password;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Optioneel: lees error body om specifieke fout te tonen
    return { message: 'Fout bij updaten' };
  }

  return { message: 'Profiel succesvol gewijzigd' };
}

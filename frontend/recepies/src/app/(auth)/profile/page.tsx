


import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/forms/profile-form';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value;

  if (!jwt) {
    redirect('/login'); 
  }

  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect('/signin'); 
  }

  const user = await res.json();

  return (
    <main className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <ProfileForm user={{ id: user.id, username: user.username, email: user.email }} />
    </main>
  );
}


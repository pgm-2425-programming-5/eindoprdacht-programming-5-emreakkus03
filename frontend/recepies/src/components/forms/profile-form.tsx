'use client';

import React from 'react';
import { changeProfileAction } from '@/data/actions/profile-actions';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { SubmitButton } from '../custom/submit-button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ProfileForm({
  user,
  className,
}: {
  readonly user: { id: string; username: string; email: string };
  readonly className?: string;
}) {
  const initialState = { message: '' };
  const [state, formAction] = useActionState(changeProfileAction, initialState);
  const router = useRouter();

  React.useEffect(() => {
    if (state?.message === 'Profile updated successfully') {
      router.refresh();
    }
  }, [state?.message, router]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Update Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <Input
            id="username"
            name="username"
            placeholder="New username"
            required
            className="mb-4"
            defaultValue={user.username}
          />
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="New email address"
            required
            className="mb-4"
            defaultValue={user.email}
          />
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="New password (optional)"
            className="mb-4"
            autoComplete="new-password"
          />
          <Input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            placeholder="Confirm new password"
            className="mb-4"
            autoComplete="new-password"
          />
          <input type="hidden" name="id" value={user.id} />
          <SubmitButton text="Update" loadingText="Updating..." />
          {state?.message && (
            <p className="mt-2 text-sm text-gray-600">{state.message}</p>
          )}
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createCommentAction, getCurrentUser } from '@/data/actions/comment-actions';
import { useRouter } from 'next/navigation';

type Props = {
  documentId: string;
  parentCommentId?: number | null;
  parentUsername?: string | null;
  onSubmitted?: () => void;
};

export default function CommentForm({
  documentId,
  parentCommentId = null,
  parentUsername = '',
  onSubmitted,
}: Props) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((user) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  useEffect(() => {
    if (parentUsername) {
      setMessage(`@${parentUsername} `);
    }
  }, [parentUsername]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSending(true);
    setError('');

    const formData = new FormData();
    formData.append('message', message);
    formData.append('documentId', documentId);
    formData.append(
      'parentCommentId',
      parentCommentId ? parentCommentId.toString() : ''
    );

    const result = await createCommentAction({}, formData);

    if (result.message?.toLowerCase().includes('succes')) {
      setMessage(parentUsername ? `@${parentUsername} ` : '');
      if (onSubmitted) {
        onSubmitted();
      } else {
        router.refresh();
      }
    } else {
      setError(result.message || 'Er ging iets mis.');
    }

    setIsSending(false);
  }

  // ✅ Als nog niet bekend of user ingelogd is → niks tonen
  if (isLoggedIn === null) {
    return null;
  }

  // ✅ Niet ingelogd → melding + geen formulier
  if (!isLoggedIn) {
    return (
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <p className="text-red-500 font-medium mb-2">
          Je moet eerst inloggen om een reactie te plaatsen
        </p>
        {/* eventueel login-knop */}
        <button
          onClick={() => router.push('/signin')}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Inloggen
        </button>
      </div>
    );
  }

  // ✅ Wel ingelogd → formulier tonen
  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      {error && <p className="text-red-500">{error}</p>}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Schrijf een reactie..."
        required
      />

      <button
        type="submit"
        disabled={isSending}
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        {isSending ? 'Versturen…' : 'Verstuur'}
      </button>
    </form>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { Comment } from '@/types/Post';
import { format } from 'date-fns';
import CommentForm from '@/components/forms/comment-form';
import { useRouter } from 'next/navigation';
import {
  deleteCommentAction,
  editCommentAction,
  getCurrentUser,
} from '@/data/actions/comment-actions';

type Props = {
  comment: Comment;
  documentId: string;
  depth?: number;
  onDeleted: () => void;
  onEdited?: () => void;
};

export default function CommentItem({
  comment,
  documentId,
  depth = 0,
  onDeleted,
  onEdited,
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(comment.message);
  const [currentUserDocumentId, setCurrentUserDocumentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 👈 extra state

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUserDocumentId(user.documentId);
        setIsLoggedIn(true); // 👈 ingelogd
      } else {
        setIsLoggedIn(false); // 👈 niet ingelogd
      }
    });
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCommentAction(comment.documentId);
      onDeleted();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    try {
      await editCommentAction(comment.documentId, editMessage);
      setIsEditing(false);
      if (onEdited) onEdited();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li style={{ marginLeft: depth * 20 }}>
      <div className="bg-white rounded shadow-sm p-2">
        <div className="flex justify-between">
          <strong>@{comment.users_permissions_user?.username}</strong>
          <span className="text-gray-500 text-sm">
            {format(new Date(comment.dateAdded), 'dd-MM-yyyy')}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              className="w-full border rounded p-2"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleEditSave}
                disabled={isSaving}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                {isSaving ? 'Opslaan...' : 'Opslaan'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditMessage(comment.message);
                }}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Annuleren
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2">{comment.message}</p>
        )}

        <div className="flex gap-2 mt-2">
          {/* Reageren alleen tonen als ingelogd */}
          {isLoggedIn && (
            <button
              className="text-sm text-purple-500 hover:underline"
              onClick={() => setIsReplying(!isReplying)}
            >
              {isReplying ? 'Annuleer' : 'Reageer'}
            </button>
          )}

          {/* Edit/Delete alleen tonen als ingelogd én eigenaar */}
          {isLoggedIn && currentUserDocumentId === comment.users_permissions_user?.documentId && (
            <>
              <button
                className="text-blue-500 hover:underline text-sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:underline text-sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>

        {/* Reply form alleen als ingelogd */}
        {isLoggedIn && isReplying && !isEditing && (
          <CommentForm
            documentId={documentId}
            parentCommentId={Number(comment.documentId)}
            parentUsername={comment.users_permissions_user?.username || ''}
            onSubmitted={() => {
              router.refresh();
              setIsReplying(false);
            }}
          />
        )}

        {comment.children && comment.children.length > 0 && (
          <ul className="mt-2">
            {comment.children.map((child) => (
              <CommentItem
                key={child.documentId}
                comment={child}
                documentId={documentId}
                depth={depth + 1}
                onDeleted={onDeleted}
                onEdited={onEdited}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
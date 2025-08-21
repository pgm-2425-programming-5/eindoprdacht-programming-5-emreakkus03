'use client';

import React, { useState, useEffect } from 'react';
import { editPostAction } from '@/data/actions/recipe-actions';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Post } from '@/types/Post';
import { SubmitButton } from '../custom/submit-button';
import { getCategories } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EditRecipeForm({ post, onClose }: { post: Post; onClose?: () => void }) {
  const [categories, setCategories] = useState<{ documentId: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, formAction] = useActionState(
  async (prevState: { message: string }, formData: FormData) => {
    const updates = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      ingredients: formData.get('ingredients') as string,
      steps: formData.get('steps') as string,
      difficulty: formData.get('difficulty') as string,
      totalTime: Number(formData.get('totalTime')),
      servings: Number(formData.get('servings')),
      category: formData.get('category') as string,
    };
    return await editPostAction(post.documentId, updates);
  },
  { message: '' }
);
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getCategories();
        setCategories(result);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

 

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Recipe Editing</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} encType="multipart/form-data">
          <Input name="title" defaultValue={post.title} placeholder="Title" className="mb-4" />
          <textarea
            name="description"
            defaultValue={post.description}
            placeholder="Description"
            className="mb-4"
          />
          <textarea
            name="ingredients"
            defaultValue={post.ingredients}
            placeholder="Ingredients"
            className="mb-4"
          />
          <textarea
            name="steps"
            defaultValue={post.steps}
            placeholder="Preparation Steps"
            className="mb-4"
          />

          <label className="block mb-1 font-medium">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="mb-4 w-full border p-2 rounded"
          />

          <label className="block mb-1 font-medium">Difficulty</label>
          <select
            name="difficulty"
            defaultValue={post.difficulty}
            
            className="mb-4 w-full border p-2 rounded"
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label className="block mb-1 font-medium">Category</label>
          <select
            name="category"
            defaultValue={post.category?.documentId}
            
            className="mb-4 w-full border p-2 rounded"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.documentId} value={cat.documentId}>
                {cat.title}
              </option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Total Minutes</label>
          <select
            name="totalTime"
            defaultValue={post.totalTime}
            
            className="mb-4 w-full border p-2 rounded"
          >
            {[...Array(61).keys()].slice(1).map((min) => (
              <option key={min} value={min}>
                {min} minutes
              </option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Servings</label>
          <select
            name="servings"
            defaultValue={post.servings}
            
            className="mb-4 w-full border p-2 rounded"
          >
            {[...Array(21).keys()].slice(1).map((n) => (
              <option key={n} value={n}>
                {n} servings
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <SubmitButton text="Save Changes" loadingText="Saving..." />
          </div>

         
        </form>
      </CardContent>
    </Card>
  );
}
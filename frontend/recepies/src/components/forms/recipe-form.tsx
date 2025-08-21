'use client';

import React, { useState, useEffect } from 'react';
import { createRecipeAction } from '@/data/actions/recipe-actions';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '../custom/submit-button';
import { getCategories } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RecipeForm() {
  const [categories, setCategories] = useState<{ documentId: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, formAction] = useActionState(createRecipeAction, { message: '' });
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

  useEffect(() => {
    if (state?.message === 'Recipe created successfully') {
      router.refresh();
    }
  }, [state?.message, router]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Recipe</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} encType="multipart/form-data">
          <Input name="title" placeholder="Title" required className="mb-4" />
          <textarea name="description" placeholder="Description" required className="mb-4" />
          <textarea name="ingredients" placeholder="Ingredients" required className="mb-4" />
          <textarea name="steps" placeholder="Preparation Steps" required className="mb-4" />

           <label className="block mb-1 font-medium">Image</label>
            <input type="file" name="image" accept="image/*" required className="mb-4 w-full border p-2 rounded" />

          <label className="block mb-1 font-medium">Difficulty</label>
          <select name="difficulty" required className="mb-4 w-full border p-2 rounded">
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label className="block mb-1 font-medium">Category</label>
          <select name="category" required className="mb-4 w-full border p-2 rounded">
            <option value="">Select category</option>
            {categories.map((cat: any) => (
              <option key={cat.documentId} value={cat.documentId}>{cat.title}</option>
            ))}
          </select>


          <label className="block mb-1 font-medium">Total Minutes</label>
          <select name="totalTime" required className="mb-4 w-full border p-2 rounded">
            {[...Array(61).keys()].slice(1).map((min) => (
              <option key={min} value={min}>{min} minutes</option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Number of Servings</label>
          <select name="servings" required className="mb-4 w-full border p-2 rounded">
            {[...Array(21).keys()].slice(1).map((n) => (
              <option key={n} value={n}>{n} servings</option>
            ))}
          </select>

          <SubmitButton text="Create Recipe" loadingText="Saving..." />
          {state?.message && <p className="mt-2 text-sm text-gray-600">{state.message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

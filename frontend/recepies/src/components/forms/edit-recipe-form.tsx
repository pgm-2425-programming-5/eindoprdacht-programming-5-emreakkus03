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
        console.error('Fout bij ophalen categorieën:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

 

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Recept bewerken</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} encType="multipart/form-data">
          <Input name="title" defaultValue={post.title} placeholder="Titel" className="mb-4" />
          <textarea
            name="description"
            defaultValue={post.description}
            placeholder="Beschrijving"
            
            className="mb-4"
          />
          <textarea
            name="ingredients"
            defaultValue={post.ingredients}
            placeholder="Ingrediënten"
            className="mb-4"
          />
          <textarea
            name="steps"
            defaultValue={post.steps}
            placeholder="Bereidingsstappen"
            className="mb-4"
          />
         

          <label className="block mb-1 font-medium">Afbeelding</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="mb-4 w-full border p-2 rounded"
          />

          <label className="block mb-1 font-medium">Moeilijkheidsgraad</label>
          <select
            name="difficulty"
            defaultValue={post.difficulty}
            
            className="mb-4 w-full border p-2 rounded"
          >
            <option value="">Selecteer moeilijkheid</option>
            <option value="easy">Makkelijk</option>
            <option value="medium">Gemiddeld</option>
            <option value="hard">Moeilijk</option>
          </select>

          <label className="block mb-1 font-medium">Categorie</label>
          <select
            name="category"
            defaultValue={post.category?.documentId}
            
            className="mb-4 w-full border p-2 rounded"
          >
            <option value="">Selecteer categorie</option>
            {categories.map((cat) => (
              <option key={cat.documentId} value={cat.documentId}>
                {cat.title}
              </option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Totale minuten</label>
          <select
            name="totalTime"
            defaultValue={post.totalTime}
            
            className="mb-4 w-full border p-2 rounded"
          >
            {[...Array(61).keys()].slice(1).map((min) => (
              <option key={min} value={min}>
                {min} minuten
              </option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Aantal personen</label>
          <select
            name="servings"
            defaultValue={post.servings}
            
            className="mb-4 w-full border p-2 rounded"
          >
            {[...Array(21).keys()].slice(1).map((n) => (
              <option key={n} value={n}>
                {n} personen
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Annuleren
            </button>
            <SubmitButton text="Wijzigingen opslaan" loadingText="Bezig met opslaan..." />
          </div>

         
        </form>
      </CardContent>
    </Card>
  );
}
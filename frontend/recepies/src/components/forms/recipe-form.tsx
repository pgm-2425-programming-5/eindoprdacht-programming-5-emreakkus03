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
        console.error('Fout bij ophalen categorieën:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    if (state?.message === 'Recept succesvol aangemaakt') {
      router.refresh();
    }
  }, [state?.message, router]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Nieuw recept toevoegen</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} encType="multipart/form-data">
          <Input name="title" placeholder="Titel" required className="mb-4" />
          <textarea name="description" placeholder="Beschrijving" required className="mb-4" />
          <textarea name="ingredients" placeholder="Ingrediënten" required className="mb-4" />
          <textarea name="steps" placeholder="Bereidingsstappen" required className="mb-4" />

           <label className="block mb-1 font-medium">Afbeelding</label>
            <input type="file" name="image" accept="image/*" required className="mb-4 w-full border p-2 rounded" />

          <label className="block mb-1 font-medium">Moeilijkheidsgraad</label>
          <select name="difficulty" required className="mb-4 w-full border p-2 rounded">
            <option value="">Selecteer moeilijkheid</option>
            <option value="easy">Makkelijk</option>
            <option value="medium">Gemiddeld</option>
            <option value="hard">Moeilijk</option>
          </select>

          <label className="block mb-1 font-medium">Categorie</label>
          <select name="category" required className="mb-4 w-full border p-2 rounded">
            <option value="">Selecteer categorie</option>
            {categories.map((cat: any) => (
              <option key={cat.documentId} value={cat.documentId}>{cat.title}</option>
            ))}
          </select>


          <label className="block mb-1 font-medium">Totale minuten</label>
          <select name="totalTime" required className="mb-4 w-full border p-2 rounded">
            {[...Array(61).keys()].slice(1).map((min) => (
              <option key={min} value={min}>{min} minuten</option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Aantal personen</label>
          <select name="servings" required className="mb-4 w-full border p-2 rounded">
            {[...Array(21).keys()].slice(1).map((n) => (
              <option key={n} value={n}>{n} personen</option>
            ))}
          </select>

          <SubmitButton text="Recept aanmaken" loadingText="Bezig met opslaan..." />
          {state?.message && <p className="mt-2 text-sm text-gray-600">{state.message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

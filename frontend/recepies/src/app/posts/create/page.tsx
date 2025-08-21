import { RecipeForm } from '@/components/forms/recipe-form';

export default function AddRecipePage() {
  return (
    <main className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Add new recipe</h1>
      <RecipeForm />
    </main>
  );
}

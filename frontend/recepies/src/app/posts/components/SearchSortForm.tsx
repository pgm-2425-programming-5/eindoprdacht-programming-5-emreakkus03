"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getCategories } from "@/lib/queries";


type Props = {
  initialSearch: string;
  initialSort: string;
  initialCategory: string; 
};

export default function SearchSortForm({ initialSearch, initialSort, initialCategory }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [category, setCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<{documentId: string; title: string}[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  function updateUrl(newSearch: string, newSort: string, newCategory: string) {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newSort) params.set('sort', newSort);
    if (newCategory) params.set('category', newCategory);
    router.push(`/posts?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUrl(search, sort, category);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSort(e.target.value);
    updateUrl(search, e.target.value, category);
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategory(e.target.value);
    updateUrl(search, sort, e.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex items-center gap-2 flex-wrap">
      <input
        type="text"
        name="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search posts..."
        className="border px-3 py-2 rounded w-full max-w-md"
      />

      <select
        name="sort"
        value={sort}
        className="border px-3 py-2 rounded"
        onChange={handleSortChange}
      >
        <option value="asc">Titel A → Z</option>
        <option value="desc">Titel Z → A</option>
      </select>

      <select
        name="category"
        value={category}
        className="border px-3 py-2 rounded"
        onChange={handleCategoryChange}
      >
        <option value="">Alle categorieën</option>
        {categories.map(cat => (
          <option key={cat.documentId} value={cat.documentId}>{cat.title}</option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Zoek
      </button>
    </form>
  );
}

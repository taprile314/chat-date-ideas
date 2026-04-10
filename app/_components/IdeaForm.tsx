'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DateIdea, Category, CostTier } from '@/src/types/idea';

export default function IdeaForm({ idea }: { idea?: DateIdea }) {
  const router = useRouter();
  const isEdit = !!idea;

  // Add mode: free text parsed by AI
  const [freeText, setFreeText] = useState('');

  // Edit mode: structured fields
  const [title, setTitle] = useState(idea?.title || '');
  const [description, setDescription] = useState(idea?.description || '');
  const [category, setCategory] = useState<Category>(idea?.category || 'other');
  const [costTier, setCostTier] = useState<CostTier>(idea?.cost_tier || '$');
  const [costExact, setCostExact] = useState(
    idea?.cost_exact !== null && idea?.cost_exact !== undefined
      ? String(idea.cost_exact)
      : ''
  );
  const [tags, setTags] = useState(idea?.tags.join(', ') || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!freeText.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: freeText }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al agregar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/ideas/${idea!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          cost_tier: costTier,
          cost_exact: costExact ? Number(costExact) : null,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al actualizar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  if (!isEdit) {
    return (
      <form onSubmit={handleAdd} className="space-y-4">
        <div>
          <label htmlFor="freeText" className="block text-sm font-medium">
            Describe la idea de cita
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Escribe libremente — la IA extraerá los detalles automáticamente
          </p>
          <textarea
            id="freeText"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={4}
            autoFocus
            required
            placeholder="Ej: Ir al restaurante japonés nuevo en Polanco, como $500 por persona"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Agregar idea'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleEdit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Categoría
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="restaurant">🍽️ Restaurante</option>
            <option value="outdoors">🌳 Aire libre</option>
            <option value="movie">🎬 Película</option>
            <option value="activity">🎯 Actividad</option>
            <option value="travel">✈️ Viaje</option>
            <option value="other">💡 Otro</option>
          </select>
        </div>

        <div>
          <label htmlFor="costTier" className="block text-sm font-medium">
            Rango de costo
          </label>
          <select
            id="costTier"
            value={costTier}
            onChange={(e) => setCostTier(e.target.value as CostTier)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="free">Gratis</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="costExact" className="block text-sm font-medium">
          Costo aproximado (opcional)
        </label>
        <input
          id="costExact"
          type="number"
          value={costExact}
          onChange={(e) => setCostExact(e.target.value)}
          placeholder="Ej: 500"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium">
          Tags (separados por coma)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ej: romántico, nuevo, fin de semana"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

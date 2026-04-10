'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DateIdea, Category, CostTier } from '@/src/types/idea';
import IdeaCard from './IdeaCard';

export default function IdeaList({ ideas }: { ideas: DateIdea[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');
  const [costFilter, setCostFilter] = useState<CostTier | ''>('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const filtered = ideas.filter((idea) => {
    if (categoryFilter && idea.category !== categoryFilter) return false;
    if (costFilter && idea.cost_tier !== costFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q) ||
        idea.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta idea?')) return;

    setDeleting(id);
    setDeleteError('');
    try {
      const res = await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || 'Error al eliminar la idea');
      }
    } catch {
      setDeleteError('Error de conexión al eliminar');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | '')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            <option value="restaurant">🍽️ Restaurante</option>
            <option value="outdoors">🌳 Aire libre</option>
            <option value="movie">🎬 Película</option>
            <option value="activity">🎯 Actividad</option>
            <option value="travel">✈️ Viaje</option>
            <option value="other">💡 Otro</option>
          </select>
          <select
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value as CostTier | '')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los costos</option>
            <option value="free">Gratis</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </div>
        <Link
          href="/dashboard/nueva"
          className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nueva idea
        </Link>
      </div>

      {deleteError && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {deleteError}
        </p>
      )}

      <p className="mb-4 text-sm text-gray-500">
        Mostrando {filtered.length} de {ideas.length} ideas
      </p>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-400">
          No se encontraron ideas
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((idea) => (
            <div key={idea.id} className={deleting === idea.id ? 'opacity-50' : ''}>
              <IdeaCard idea={idea} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

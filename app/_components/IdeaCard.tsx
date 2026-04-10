'use client';

import Link from 'next/link';
import type { DateIdea } from '@/src/types/idea';

const CATEGORY_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  outdoors: '🌳',
  movie: '🎬',
  activity: '🎯',
  travel: '✈️',
  other: '💡',
};

const COST_LABEL: Record<string, string> = {
  free: 'Gratis',
  $: '$',
  $$: '$$',
  $$$: '$$$',
};

export default function IdeaCard({
  idea,
  onDelete,
}: {
  idea: DateIdea;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold">
          {CATEGORY_EMOJI[idea.category] || '💡'} {idea.title}
        </h3>
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {COST_LABEL[idea.cost_tier] || idea.cost_tier}
          {idea.cost_exact !== null && ` (~$${idea.cost_exact})`}
        </span>
      </div>

      {idea.description && (
        <p className="mb-3 text-sm text-gray-600">{idea.description}</p>
      )}

      {idea.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/dashboard/${idea.id}`}
          className="rounded-lg px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Editar
        </Link>
        <button
          onClick={() => onDelete(idea.id)}
          className="rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

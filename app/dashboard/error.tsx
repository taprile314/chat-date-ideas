'use client';

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="text-gray-600">
        No se pudieron cargar las ideas. Intentá de nuevo.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Reintentar
      </button>
    </div>
  );
}

import { notFound } from 'next/navigation';
import { getIdeaById } from '@/src/services/sheets';
import IdeaForm from '@/app/_components/IdeaForm';

export const dynamic = 'force-dynamic';

export default async function EditIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await getIdeaById(id);

  if (!idea) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Editar idea</h1>
      <IdeaForm idea={idea} />
    </div>
  );
}

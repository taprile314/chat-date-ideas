import { getAllIdeas } from '@/src/services/sheets';
import IdeaList from '@/app/_components/IdeaList';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const ideas = await getAllIdeas();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Mis ideas para citas</h1>
      <IdeaList ideas={ideas} />
    </div>
  );
}

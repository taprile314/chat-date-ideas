import IdeaForm from '@/app/_components/IdeaForm';

export default function NewIdeaPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Nueva idea</h1>
      <IdeaForm />
    </div>
  );
}

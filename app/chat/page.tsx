import ChatBox from '@/app/_components/ChatBox';

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Chat</h1>
      <p className="mb-6 text-sm text-gray-500">
        Pregunta sobre tus ideas guardadas — el asistente te responde en español
      </p>
      <ChatBox />
    </div>
  );
}

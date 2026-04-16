'use client';

import { useChat } from '@ai-sdk/react';
import { WorkflowChatTransport } from '@workflow/ai';
import { useState } from 'react';

export default function ChatBox() {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new WorkflowChatTransport(),
  });
  const [input, setInput] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ej: ¿Qué opciones tenemos para un plan romántico y barato?"
          rows={2}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="self-end rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Detener
          </button>
        ) : (
          <button
            type="submit"
            className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Preguntar
          </button>
        )}
      </form>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          Error: {error.message}
        </p>
      )}

      <div className="space-y-2" aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-xl p-4 shadow-sm ${
              message.role === 'user' ? 'bg-blue-50' : 'bg-white'
            }`}
          >
            <p className="whitespace-pre-wrap text-sm">
              {message.parts
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('')}
            </p>
          </div>
        ))}
      </div>

      {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-400">Buscando...</p>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ConversationItem from '@/components/ConversationItem';
import { listConversations, createConversation, getConversation, addMessage } from '@/lib/conversation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedPrompts = [
  'What is the cheapest network to send USDC?',
  'How do I check my balance?',
  'Explain how to transfer funds to a friend.',
  'What are fees for swapping USDC to ETH?',
];

export default function AssistantPage() {
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Initialize or load a conversation
  useEffect(() => {
    let currentId = conversationId;
    if (!currentId) {
      const newConv = createConversation();
      currentId = newConv.id;
      setConversationId(currentId);
    }
    const conv = getConversation(currentId);
    setMessages(conv?.messages.map(m => ({ role: m.role, content: m.text })) ?? []);
  }, []);

  // Auto‑scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load messages when conversationId changes
  useEffect(() => {
    if (!conversationId) return;
    const conv = getConversation(conversationId);
    setMessages(conv?.messages.map(m => ({ role: m.role, content: m.text })) ?? []);
  }, [conversationId]);

  const sendMessage = async (prompt: string) => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    // Optimistically add user message and persist
    const userMsg: Message = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    addMessage(conversationId, 'user', prompt);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch');
      }
      const data = await res.json();
      const assistantMsg: Message = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, assistantMsg]);
      addMessage(conversationId, 'assistant', data.reply);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleRetry = () => {
    // retry the last user message
    const lastUser = messages.filter((m) => m.role === 'user').pop();
    if (lastUser) sendMessage(lastUser.content);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50">
      {/* Sidebar with conversation list */}
      <aside className="w-64 border-r border-gray-800 p-4 overflow-y-auto">
        <button
          onClick={() => {
            const newConv = createConversation();
            setConversationId(newConv.id);
            setMessages([]);
          }}
          className="w-full mb-4 px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          New Chat
        </button>
        {listConversations().map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === conversationId}
            onSelect={(id: string) => {
              setConversationId(id);
              const c = getConversation(id);
              setMessages(c?.messages.map(m => ({ role: m.role, content: m.text })) ?? []);
            }}
          />
        ))}
      </aside>

      <main className="flex-1 flex flex-col p-4 max-w-4xl mx-auto overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">SyncX Assistant</h1>
        <section
          className="flex-1 overflow-y-auto border rounded p-4 mb-4"
          ref={scrollRef}
          aria-label="Conversation history"
        >
          {messages.length === 0 && !loading && (
            <div className="text-center text-gray-500">Start a conversation or pick a prompt below.</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 ${msg.role === 'assistant' ? 'text-blue-600' : 'text-green-600'}`}>
              <strong>{msg.role === 'assistant' ? 'Assistant' : 'You'}:</strong> {msg.content}
            </div>
          ))}
          {loading && <div className="text-center text-indigo-500">Thinking…</div>}
          {error && (
            <div className="text-center text-red-600">
              {error}{' '}
              <button onClick={handleRetry} className="underline">Retry</button>
            </div>
          )}
        </section>

        <section className="mb-4">
          <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Send message form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SyncX…"
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring bg-zinc-900 border-zinc-700"
              aria-required="true"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>

        <section className="grid grid-cols-2 gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-sm"
            >
              {p}
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

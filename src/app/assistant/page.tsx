"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ConversationItem from "@/components/ConversationItem";
import { listConversations, createConversation, getConversation, addMessage } from "@/lib/conversation";
import { MessageSquare, Send, RefreshCw, Cpu, Settings, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedPrompts = [
  "What is the cheapest network to send USDC?",
  "How do I check my balance on Arc Testnet?",
  "Explain how to transfer funds to a friend.",
  "What are the benefits of CCTP stablecoin bridging?",
];

export default function AssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize or load a conversation
  useEffect(() => {
    setMounted(true);
    let currentId = conversationId;
    if (!currentId) {
      const newConv = createConversation();
      currentId = newConv.id;
      setConversationId(currentId);
    }
    const conv = getConversation(currentId);
    setMessages(conv?.messages.map(m => ({ role: m.role, content: m.text })) ?? []);
  }, []);

  // Auto-scroll to bottom when messages change
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
    const userMsg: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    addMessage(conversationId, "user", prompt);
    
    try {
      // Load custom keys and preferences from settings localStorage
      const storedKey = localStorage.getItem("syncx_gemini_api_key") || "";
      const storedPrefs = localStorage.getItem("syncx_ai_config");
      const preferences = storedPrefs ? JSON.parse(storedPrefs) : undefined;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          customApiKey: storedKey,
          preferences
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to contact Gemini API");
      }

      const data = await res.json();
      
      // If the reply tells the user the key is unconfigured, format it as a helpful warning block
      const assistantMsg: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMsg]);
      addMessage(conversationId, "assistant", data.reply);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred during chat transmission");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleRetry = () => {
    const lastUser = messages.filter((m) => m.role === "user").pop();
    if (lastUser) sendMessage(lastUser.content);
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-500 font-medium items-center justify-center">
        Loading assistant interface...
      </div>
    );
  }

  // Check if API Key is configured
  const hasApiKey = !!(typeof window !== "undefined" && localStorage.getItem("syncx_gemini_api_key"));

  return (
    <div className="flex h-[calc(100vh-70px)] bg-slate-50">
      
      {/* Sidebar with conversation list */}
      <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0 hidden md:flex shadow-sm">
        <div className="space-y-4 flex-1 overflow-y-auto">
          <button
            onClick={() => {
              const newConv = createConversation();
              setConversationId(newConv.id);
              setMessages([]);
            }}
            className="w-full py-3 px-4 font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-2xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            New Chat
          </button>
          
          <div className="space-y-1 pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block px-2 mb-2">History</span>
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
          </div>
        </div>

        {/* Configurations link */}
        <div className="border-t border-slate-100 pt-4">
          <Link
            href="/settings"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-inner"
          >
            <Settings className="h-4 w-4" />
            AI Configurations
          </Link>
        </div>
      </aside>

      {/* Main chat window */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 max-w-4xl mx-auto overflow-hidden">
        
        {/* Title Block */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="h-7 w-7 text-sky-600 animate-pulse" />
              SyncX AI Assistant
            </h1>
            <p className="text-slate-500 text-xs mt-1">Get transaction insights, balance reports, and fintech suggestions.</p>
          </div>
          <Link
            href="/settings"
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition-all shadow-sm"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>

        {/* Warning if API key unconfigured */}
        {!hasApiKey && (
          <div className="mb-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-xs leading-relaxed flex items-start gap-2 shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Gemini API Key Required</p>
              <p className="font-medium text-amber-700">
                To interact with the assistant, please configure your own Google Gemini key in the{" "}
                <Link href="/settings" className="font-bold underline text-sky-600 hover:text-sky-700">
                  AI Settings
                </Link>{" "}
                page. This key will be securely saved locally in your browser storage.
              </p>
            </div>
          </div>
        )}

        {/* Message Container */}
        <section
          className="flex-1 overflow-y-auto border border-slate-200 rounded-3xl p-4 sm:p-6 mb-4 bg-white shadow-inner space-y-4"
          ref={scrollRef}
          aria-label="Conversation history"
        >
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10 space-y-3">
              <Cpu className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold">How can SyncX help you today?</p>
              <p className="text-xs text-slate-400 text-center max-w-sm">
                Pick a suggested query below or type your own question to start chatting.
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${
                msg.role === "assistant" 
                  ? "self-start items-start" 
                  : "self-end items-end ml-auto"
              } animate-in fade-in slide-in-from-bottom-1 duration-200`}
            >
              <span className="text-[10px] font-bold text-slate-400 mb-1 px-1 capitalize">
                {msg.role === "assistant" ? "SyncX Assistant" : "You"}
              </span>
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed font-medium shadow-sm ${
                  msg.role === "assistant"
                    ? msg.content.includes("Gemini API Key is not configured")
                      ? "bg-amber-50 border border-amber-200 text-amber-800"
                      : "bg-sky-50 border border-sky-100 text-slate-800"
                    : "bg-slate-100 border border-slate-200 text-slate-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-sky-600 bg-sky-50 px-3 py-2 rounded-2xl border border-sky-100 w-fit animate-pulse font-bold">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs leading-relaxed space-y-1.5 text-center">
              <p className="font-bold">Transmission Failed</p>
              <p>{error}</p>
              <button onClick={handleRetry} className="text-sky-600 hover:text-sky-700 font-bold underline cursor-pointer">
                Retry message
              </button>
            </div>
          )}
        </section>

        {/* Input Form */}
        <section className="mb-4">
          <form onSubmit={handleSubmit} className="flex gap-3" aria-label="Send message form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SyncX..."
              className="flex-1 border border-slate-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-sky-500/50 bg-white text-slate-900 placeholder-slate-400 text-sm shadow-sm"
              aria-required="true"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center cursor-pointer"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </section>

        {/* Suggested Prompts */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={loading}
              className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl text-left text-xs font-bold text-slate-600 hover:text-slate-800 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

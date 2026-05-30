export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const STORAGE_KEY = 'syncx_conversations';

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Conversation[];
    return data;
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function listConversations(): Conversation[] {
  return loadConversations();
}

export function createConversation(initialMessage?: string): Conversation {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const title = initialMessage ? initialMessage.slice(0, 30) + (initialMessage.length > 30 ? '…' : '') : 'New Chat';
  const conversation: Conversation = {
    id,
    title,
    messages: [],
    createdAt: Date.now(),
  };
  const convs = loadConversations();
  convs.unshift(conversation);
  saveConversations(convs);
  return conversation;
}

export function getConversation(id: string): Conversation | undefined {
  return loadConversations().find((c) => c.id === id);
}

export function addMessage(conversationId: string, role: 'user' | 'assistant', text: string): Message {
  const convs = loadConversations();
  const conv = convs.find((c) => c.id === conversationId);
  if (!conv) throw new Error('Conversation not found');
  const msg: Message = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    role,
    text,
    timestamp: Date.now(),
  };
  conv.messages.push(msg);
  // Update title for first user message if needed
  if (role === 'user' && conv.title === 'New Chat') {
    conv.title = text.slice(0, 30) + (text.length > 30 ? '…' : '');
  }
  saveConversations(convs);
  return msg;
}

export function updateConversation(conversation: Conversation) {
  const convs = loadConversations();
  const index = convs.findIndex((c) => c.id === conversation.id);
  if (index >= 0) {
    convs[index] = conversation;
    saveConversations(convs);
  }
}

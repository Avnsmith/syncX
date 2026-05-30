import React from 'react';
import { Conversation } from '@/lib/conversation';
import { ArrowRightCircle } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export default function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
      aria-current={isActive}
    >
      <span className="flex-1 truncate" title={conversation.title}>{conversation.title}</span>
      <ArrowRightCircle className="w-4 h-4 opacity-0 group-hover:opacity-100" />
    </button>
  );
}

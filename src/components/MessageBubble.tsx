import React from 'react';
import { Message } from '@/lib/conversation';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const baseClasses = 'inline-block px-3 py-1 rounded-lg max-w-xs break-words';
  const roleClasses = isUser ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>    
      <span className={`${baseClasses} ${roleClasses}`} aria-label={isUser ? 'User message' : 'Assistant message'}>
        {message.text}
      </span>
    </div>
  );
}

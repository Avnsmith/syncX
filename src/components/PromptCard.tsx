import React from 'react';

interface PromptCardProps {
  prompt: string;
  onSelect: (prompt: string) => void;
}

export default function PromptCard({ prompt, onSelect }: PromptCardProps) {
  return (
    <button
      onClick={() => onSelect(prompt)}
      className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
    >
      {prompt}
    </button>
  );
}

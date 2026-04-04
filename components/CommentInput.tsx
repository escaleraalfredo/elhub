// components/CommentInput.tsx
"use client";
import { useRef, useEffect } from "react";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  replyingTo?: number | null;
}

export default function CommentInput({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Añade un comentario...", 
  replyingTo 
}: CommentInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyingTo !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  return (
    <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 flex gap-3 items-center">
      <div className="w-8 h-8 bg-zinc-700 rounded-full flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={replyingTo ? "Responder comentario..." : placeholder}
        className="flex-1 bg-transparent text-[15px] placeholder-zinc-500 focus:outline-none"
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="text-pr-red font-semibold disabled:text-zinc-600 px-2"
      >
        Publicar
      </button>
    </div>
  );
}
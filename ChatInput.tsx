import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Baby, ListOrdered, Image as ImageIcon } from 'lucide-react';
import { ExplanationStyle } from '../types';

interface ChatInputProps {
  onSend: (message: string, style: ExplanationStyle) => void;
  disabled: boolean;
  showStyles?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled, 
  showStyles = true,
  placeholder 
}) => {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ExplanationStyle>('simple');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim(), selectedStyle);
      setText('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const styles: { id: ExplanationStyle; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'simple', label: 'Simple', icon: <Baby size={16} />, desc: '6th Grade Level' },
    { id: 'steps', label: 'Step-by-Step', icon: <ListOrdered size={16} />, desc: 'Break it down' },
    { id: 'visual', label: 'Visual', icon: <ImageIcon size={16} />, desc: 'Paint a picture' },
  ];

  const defaultPlaceholder = showStyles 
    ? `Ask a question (${selectedStyle === 'simple' ? 'Simple' : selectedStyle === 'steps' ? 'Step-by-Step' : 'Visual'} mode)...`
    : "Type your request here...";

  return (
    <div className="w-full bg-gray-900 border-t border-gray-800 p-4 pb-6 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-3">
        
        {/* Style Selector */}
        {showStyles && (
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                disabled={disabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedStyle === style.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/20'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750 hover:border-gray-600'
                }`}
              >
                {style.icon}
                <div className="flex flex-col items-start">
                  <span className="leading-none">{style.label}</span>
                  <span className="text-[10px] opacity-70 font-normal leading-none mt-0.5">{style.desc}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="relative flex items-end gap-2 bg-gray-800 p-2 rounded-2xl border border-gray-700 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-base p-3 resize-none focus:outline-none max-h-[150px] overflow-y-auto custom-scrollbar disabled:opacity-50"
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!text.trim() || disabled}
            className={`p-3 rounded-xl flex-shrink-0 transition-all duration-200 ${
              text.trim() && !disabled
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg hover:scale-105 active:scale-95'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {disabled ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
             Explain It My Way can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
};
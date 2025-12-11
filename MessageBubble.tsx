import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, AlertCircle } from 'lucide-react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : isError ? 'bg-red-500' : 'bg-emerald-600'
        }`}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : isError ? (
            <AlertCircle size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-white" />
          )}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden ${
              isUser
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : isError
                ? 'bg-red-900/50 border border-red-800 text-red-200 rounded-tl-sm'
                : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-sm'
            }`}
          >
            {isError ? (
               <span>{message.content}</span>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown
                  components={{
                    // Custom styling for code blocks to look nice in the bubble
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !String(children).includes('\n');
                      
                      if (isInline) {
                         return (
                          <code className="bg-black/20 px-1 py-0.5 rounded font-mono text-xs" {...props}>
                            {children}
                          </code>
                         );
                      }

                      return (
                        <div className="relative my-2 overflow-hidden rounded-md bg-gray-950 border border-gray-700">
                           <div className="flex items-center justify-between px-3 py-1 bg-gray-900 border-b border-gray-800">
                              <span className="text-xs text-gray-400 font-mono lowercase">{match ? match[1] : 'code'}</span>
                           </div>
                           <pre className="p-3 overflow-x-auto text-sm font-mono text-gray-300">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    },
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Blinking cursor for streaming */}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 align-middle bg-emerald-400 animate-pulse" />
            )}
          </div>
          
          <span className="text-xs text-gray-500 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

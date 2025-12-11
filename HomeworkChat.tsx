import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { createHomeworkSession, sendMessageStream } from '../services/geminiService';
import { Message, Role, ExplanationStyle } from '../types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Trash2 } from 'lucide-react';

const TypingIndicator = () => (
  <div className="flex w-full mb-6 justify-start">
    <div className="flex max-w-[85%] md:max-w-[75%] gap-3 flex-row">
      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-emerald-600 animate-pulse">
        <div className="h-2 w-2 bg-white rounded-full" />
      </div>
      <div className="flex items-center">
         <span className="text-sm text-gray-400 italic">Thinking...</span>
      </div>
    </div>
  </div>
);

export const HomeworkChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNewChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const startNewChat = () => {
    try {
      chatSessionRef.current = createHomeworkSession();
      setMessages([
        {
          id: uuidv4(),
          role: Role.MODEL,
          content: "Hi! I'm here to help you learn. \n\nPick a style below (Simple, Step-by-Step, or Visual) and ask me anything about your homework!",
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error("Failed to initialize chat", error);
    }
  };

  const getStyleInstruction = (style: ExplanationStyle): string => {
    switch (style) {
      case 'simple':
        return "EXPLANATION STYLE: '6th Grade Level'. Use very basic language, simple metaphors, and real-world examples. Keep it short and easy to digest. Avoid jargon.";
      case 'steps':
        return "EXPLANATION STYLE: 'Step-by-Step'. Break the concept down into clear, numbered steps. Explain one piece at a time logically. Act like a patient tutor walking a student through a process.";
      case 'visual':
        return "EXPLANATION STYLE: 'Visual'. Describe the concept using vivid visual imagery, analogies that create a mental picture, and text-based diagrams (like flowcharts or spatial descriptions). Help me 'see' the answer.";
      default:
        return "";
    }
  };

  const handleSendMessage = useCallback(async (text: string, style: ExplanationStyle) => {
    if (!chatSessionRef.current || !text.trim()) return;

    const userMessageId = uuidv4();
    const modelMessageId = uuidv4();

    const userMessage: Message = {
      id: userMessageId,
      role: Role.USER,
      content: text,
      timestamp: new Date(),
      style: style
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    const fullPrompt = `${getStyleInstruction(style)}\n\nUser Question: ${text}`;

    try {
      const stream = await sendMessageStream(chatSessionRef.current, fullPrompt);
      
      const initialModelMessage: Message = {
        id: modelMessageId,
        role: Role.MODEL,
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, initialModelMessage]);

      let fullContent = '';

      for await (const chunk of stream) {
        const contentChunk = chunk as GenerateContentResponse;
        const textChunk = contentChunk.text;
        
        if (textChunk) {
          fullContent += textChunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === modelMessageId 
                ? { ...msg, content: fullContent } 
                : msg
            )
          );
        }
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Streaming error:", error);
      setMessages(prev => {
        const messageExists = prev.some(m => m.id === modelMessageId);
        if (messageExists) {
            return prev.map(msg => 
              msg.id === modelMessageId 
                ? { ...msg, content: "Error generating response.", isStreaming: false, isError: true } 
                : msg
            );
        } else {
            return [...prev, {
                id: modelMessageId,
                role: Role.MODEL,
                content: "Error generating response.",
                timestamp: new Date(),
                isError: true,
                isStreaming: false
            }];
        }
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full relative">
       {/* Clear Chat Button specific to this view */}
       <div className="absolute top-4 right-4 z-20">
         <button 
           onClick={() => {
             if(confirm('Clear homework chat?')) startNewChat();
           }}
           className="p-2 bg-gray-800/80 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-all border border-gray-700"
           title="Clear Conversation"
         >
           <Trash2 size={16} />
         </button>
       </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isProcessing && messages.length > 0 && messages[messages.length - 1].role === Role.USER && (
            <TypingIndicator />
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>
      <ChatInput onSend={handleSendMessage} disabled={isProcessing} />
    </div>
  );
};
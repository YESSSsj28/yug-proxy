import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { analyzeWritingStyle, createCustomSession, sendMessageStream } from '../services/geminiService';
import { Message, Role } from '../types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Sparkles, PenTool, AlertTriangle, Check, RefreshCw, Trash2 } from 'lucide-react';

export const EssayMimic: React.FC = () => {
  const [step, setStep] = useState<'input' | 'chat'>('input');
  const [samples, setSamples] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [styleProfile, setStyleProfile] = useState<string>('');
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleAnalyze = async () => {
    if (!samples.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeWritingStyle(samples);
      if (result) {
        setStyleProfile(result);
        
        // Initialize chat with this profile
        chatSessionRef.current = createCustomSession(result);
        setMessages([
            {
              id: uuidv4(),
              role: Role.MODEL,
              content: "**I've learned your writing style!** \n\nI noticed your habits (including any errors you make). I'm ready to write essays or paragraphs that look exactly like YOU wrote them.\n\nType a topic below, and I'll write it in your voice.",
              timestamp: new Date(),
            }
        ]);
        setStep('chat');
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Something went wrong analyzing your text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (confirm("This will forget your learned style. Start over?")) {
      setStep('input');
      setSamples('');
      setStyleProfile('');
      setMessages([]);
      chatSessionRef.current = null;
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!chatSessionRef.current || !text.trim()) return;

    const userMessageId = uuidv4();
    const modelMessageId = uuidv4();

    setMessages(prev => [...prev, {
      id: userMessageId,
      role: Role.USER,
      content: text,
      timestamp: new Date()
    }]);

    setIsProcessing(true);

    try {
      const stream = await sendMessageStream(chatSessionRef.current, text);
      
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
          setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, content: fullContent } : msg));
        }
      }
      
      setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, isStreaming: false } : msg));

    } catch (error) {
      console.error("Chat error", error);
      // Handle error visually
    } finally {
      setIsProcessing(false);
    }
  }, []);

  if (step === 'input') {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-12 flex flex-col h-full overflow-y-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-900/40">
            <PenTool className="text-white h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Teach AI Your Style</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Paste 3-4 paragraphs of your previous writing (essays, answers, etc.). 
            The AI will learn your vocabulary, sentence structure, and even your common grammar mistakes so it can write exactly like you.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-500" />
                Your Writing Samples
            </label>
            <textarea 
                value={samples}
                onChange={(e) => setSamples(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-64 bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none resize-none custom-scrollbar leading-relaxed"
            />
            <div className="mt-4 flex items-start gap-3 bg-yellow-900/20 border border-yellow-800/50 p-3 rounded-lg">
                <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-yellow-200/80">
                    Note: We will purposefully learn your errors (like missing commas or simple words) to make the output authentic. 
                </p>
            </div>
        </div>

        <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || samples.length < 50}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                isAnalyzing || samples.length < 50 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transform hover:scale-[1.01]'
            }`}
        >
            {isAnalyzing ? (
                <>
                    <RefreshCw className="animate-spin" /> Analyzing Style...
                </>
            ) : (
                <>
                    Analyze My Style
                </>
            )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
       {/* Toolbar */}
       <div className="absolute top-4 right-4 z-20 flex gap-2">
           <div className="hidden md:flex items-center gap-2 bg-gray-900/90 border border-purple-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Check size={14} className="text-green-400" />
                <span className="text-xs text-purple-200 font-medium">Style Active</span>
           </div>
           <button 
             onClick={handleReset}
             className="p-2 bg-gray-800/80 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-all border border-gray-700"
             title="Reset Style"
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
            <div className="flex w-full mb-6 justify-start">
                <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                    Mimicking your style...
                </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>
      
      <ChatInput 
        onSend={(text) => handleSendMessage(text)} 
        disabled={isProcessing} 
        showStyles={false}
        placeholder="What should I write about? (I'll use your style)"
      />
    </div>
  );
};
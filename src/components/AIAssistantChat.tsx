import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  X,
  ArrowUpRight
} from 'lucide-react';
import { sendChatMessage } from '../services/apiClient';

interface AIAssistantChatProps {
  origin: string;
  destination: string;
  travelers: number;
  preference: string;
  transportOption: string;
  stayName: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Is morning train or evening express better?',
  'What should I pack for this trip?',
  'How to safely get a cab from arrival station?',
  'What local food spots must I try?',
];

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  origin,
  destination,
  travelers,
  preference,
  transportOption,
  stayName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I am your AI Travel Decision Assistant. I am tracking your trip from **${origin}** to **${destination}** (${travelers} traveler(s)). Ask me about train timing, station safety, monuments, or budget optimization!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(text, {
        origin,
        destination,
        travelers,
        preference,
        transportOption,
        stayName,
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-travel-chat-widget" className="fixed bottom-5 right-5 z-40">
      {/* Floating Toggle Button matching electric purple theme */}
      {!isOpen && (
        <button
          id="btn-open-ai-chat"
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#5e17eb] hover:bg-[#732bf5] text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(94,23,235,0.6)] border border-[#7a28f5] transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>Ask Travel AI</span>
        </button>
      )}

      {/* Chat Window Drawer in obsidian black */}
      {isOpen && (
        <div
          id="ai-chat-window"
          className="w-[92vw] sm:w-[400px] h-[540px] bg-[#110e1b] rounded-3xl border border-[#2e2847] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="bg-[#181426] text-white px-5 py-4 flex items-center justify-between border-b border-[#231f33]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5e17eb] to-[#8a3ffc] text-white flex items-center justify-center font-bold shadow-[0_0_12px_rgba(94,23,235,0.5)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight text-white">AI Travel Decision Assistant</h4>
                <span className="text-[10px] text-[#9a97b4] block leading-tight">
                  Multimodal Planning Advisor
                </span>
              </div>
            </div>

            <button
              id="btn-close-ai-chat"
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#9a97b4] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-[#141021] border-b border-[#231f33] flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[10px] whitespace-nowrap px-3 py-1 rounded-full bg-[#1c162e] border border-[#2e2847] hover:border-[#5e17eb] text-[#c084fc] transition-colors shrink-0 cursor-pointer disabled:opacity-50 font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#241a45] text-[#a87ffb] border border-[#5e17eb]/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[84%] rounded-2xl p-3.5 leading-relaxed text-xs ${
                    msg.role === 'user'
                      ? 'bg-[#5e17eb] text-white rounded-br-none shadow-[0_0_15px_rgba(94,23,235,0.3)]'
                      : 'bg-[#181426] text-purple-50 rounded-bl-none border border-[#2e2847]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-purple-200' : 'text-[#726b91]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#9a97b4] pl-8">
                <div className="w-2 h-2 rounded-full bg-[#5e17eb] animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-[#5e17eb] animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#5e17eb] animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
                <span className="text-[11px] text-[#9a97b4] ml-1">Analyzing travel options...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#181426] border-t border-[#231f33] flex items-center gap-2"
          >
            <input
              id="input-ai-chat"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trains, safety, places..."
              className="flex-1 bg-[#110e1b] border border-[#2e2847] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5e17eb] placeholder-[#5c5678]"
            />
            <button
              id="btn-send-ai-chat"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#5e17eb] hover:bg-[#732bf5] text-white disabled:opacity-40 transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

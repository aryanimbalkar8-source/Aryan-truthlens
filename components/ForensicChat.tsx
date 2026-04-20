import React, { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { ChatMessage } from '../types';

interface ForensicChatProps {
  chatSession: Chat | null;
}

const ForensicChat: React.FC<ForensicChatProps> = ({ chatSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Neuro-Spectral Interface Online. Ask me about the image analysis.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg.text });
      const responseText = result.text || "Analysis buffer empty.";
      
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', text: "ERROR: Connection severed. Packet loss detected.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs font-mono text-gray-500">TERMINAL_RELAY_V2</div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-grow p-4 overflow-y-auto space-y-4 font-mono text-sm bg-black/90"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-cyan-900/20 text-cyan-300 border border-cyan-800/50' 
                : 'bg-gray-900/50 text-green-400 border border-green-900/30'
            }`}>
              <div className="text-[10px] opacity-50 mb-1 uppercase">
                {msg.role === 'user' ? 'OPERATOR' : 'RESNET-X'} // {msg.timestamp.toLocaleTimeString()}
              </div>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-gray-900/50 text-green-400 border border-green-900/30 rounded-lg p-3 flex items-center gap-1">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-bold">{">"}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Interrogate model..."
            className="flex-grow bg-transparent text-white font-mono focus:outline-none placeholder-gray-600"
            autoComplete="off"
          />
          <button 
            onClick={handleSend}
            disabled={!chatSession || isTyping}
            className="text-xs text-gray-400 hover:text-white uppercase font-bold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForensicChat;

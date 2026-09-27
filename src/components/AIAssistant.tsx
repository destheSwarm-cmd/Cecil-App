import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  CheckCheck,
  Beer,
} from 'lucide-react';
import { AIMessage, Product, Discrepancy, Order } from '../types/pub';
import { formatRand, formatTime } from '../lib/format';

interface AIAssistantProps {
  messages: AIMessage[];
  products: Product[];
  todaySalesTotal: number;
  discrepancies: Discrepancy[];
  orders: Order[];
  onSendMessage: (role: 'user' | 'assistant', content: string) => void;
}

// F1: Full text on suggestion chips (no cut-off or truncating)
const SUGGESTED_CHIPS = [
  'How many Black Labels do I have?',
  'What must I order for Monday?',
  'Any stock missing?',
  "How's my till today?",
  'What sold most this week?',
];

export const AIAssistant: React.FC<AIAssistantProps> = ({
  messages,
  products,
  todaySalesTotal,
  discrepancies,
  orders,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalWarehouseCases = products.reduce((acc, p) => acc + p.warehouse_stock, 0);

  // P5: Personalized live greeting message
  const personalizedGreeting = `Howzit Cecil 👋 You've got ${totalWarehouseCases} cases in the warehouse and ${formatRand(
    todaySalesTotal
  )} in the till today.`;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingText]);

  // Stream text word by word for real-time live feeling
  const streamResponse = async (fullReply: string) => {
    const words = fullReply.split(' ');
    let current = '';
    setStreamingText('');

    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      setStreamingText(current);
      await new Promise((resolve) => setTimeout(resolve, 24));
    }

    setStreamingText(null);
    onSendMessage('assistant', fullReply);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping || streamingText !== null) return;

    // Add user message
    onSendMessage('user', text.trim());
    setInputText('');
    setIsTyping(true);

    try {
      // Build live pub context to supply to server Gemini 3.8-flash
      const liveContext = {
        todaySales: todaySalesTotal,
        discrepancies: discrepancies.map((d) => ({
          product_name: d.product_name,
          missing_units: d.missing_units,
          last_picked_by: d.last_picked_by,
          last_pick_time: d.last_pick_time,
        })),
        products: products.map((p) => ({
          name: p.name,
          warehouse_stock: p.warehouse_stock,
          floor_stock: p.floor_stock,
          price: p.price,
          reorder_level: p.reorder_level,
          supplier: p.supplier,
        })),
        draftOrders: orders.map((o) => ({
          supplier: o.supplier,
          items: o.items.map((i) => ({
            name: i.product_name,
            cases: i.ordered_cases,
            reason: i.reason,
          })),
        })),
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          context: liveContext,
          history: messages,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Howzit Cecil, all tavern numbers looking sharp!';
      setIsTyping(false);
      await streamResponse(reply);
    } catch (err) {
      console.error('AI chat error:', err);
      setIsTyping(false);
      onSendMessage(
        'assistant',
        "Howzit Cecil, network had a hiccup! Your tavern stock is safely recorded offline in Tembisa. Ask me again in a sec."
      );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#EFEAE2] rounded-3xl shadow-sm border border-slate-300/80 overflow-hidden animate-fadeIn">
      {/* WhatsApp Styled Chat Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between select-none shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-base shadow-sm border border-white/20">
              <Beer className="w-5 h-5 text-amber-200" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#075E54]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm leading-tight text-white">
                Cecil&apos;s Operations AI
              </h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-200">
                CoreIQ
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 leading-none mt-0.5">
              online • live pub intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-emerald-200 font-mono">
          <span>Tembisa Live</span>
        </div>
      </div>

      {/* Messages Conversation Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#075e54_0.4px,transparent_0.4px)] [background-size:16px_16px] bg-opacity-5">
        {/* System Date Badge */}
        <div className="flex justify-center">
          <span className="px-2.5 py-1 rounded-md bg-white/80 backdrop-blur-xs text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-2xs">
            Today • Cecil&apos;s Pub WhatsApp Channel
          </span>
        </div>

        {/* P5: Personalized Greeting Bubble if starting chat */}
        <div className="flex justify-start">
          <div className="relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs text-[14px] leading-relaxed select-text bg-white text-[#111810] rounded-tl-none border border-slate-100">
            <p className="font-semibold text-emerald-950 mb-1">
              {personalizedGreeting}
            </p>
            <p className="text-slate-700 text-xs">
              I&apos;m watching your stock across warehouse and floor bar. What do you need to check?
            </p>
            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono">
              <span>{formatTime()}</span>
            </div>
          </div>
        </div>

        {/* Conversation messages */}
        {messages.slice(1).map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs text-[14px] leading-relaxed select-text ${
                  isUser
                    ? 'bg-[#DCF8C6] text-[#111810] rounded-tr-none'
                    : 'bg-white text-[#111810] rounded-tl-none border border-slate-100'
                }`}
              >
                {/* Bubble Text */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Bubble Timestamp & Status */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                  <span>{formatTime(msg.created_at)}</span>
                  {isUser && (
                    <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* P5: Streaming active bubble */}
        {streamingText !== null && (
          <div className="flex justify-start">
            <div className="relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs text-[14px] leading-relaxed select-text bg-white text-[#111810] rounded-tl-none border border-slate-100">
              <div className="whitespace-pre-wrap">{streamingText}</div>
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                <span>{formatTime()}</span>
              </div>
            </div>
          </div>
        )}

        {/* P5: Typing Indicator with three animated bouncing dots */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-xs border border-slate-100 flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium mr-1">
                Cecil&apos;s AI is thinking
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#075E54] animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#075E54] animate-bounce delay-150" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#075E54] animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* F1: Suggested Quick Chips with full text & horizontal scroll (no truncation) */}
      <div className="px-3 pt-2 pb-1.5 bg-[#F0F2F5] border-t border-slate-200 overflow-x-auto no-scrollbar flex gap-2 shrink-0">
        {SUGGESTED_CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#0A4A35] border border-slate-300/80 rounded-full text-xs font-semibold whitespace-nowrap shadow-2xs transition-all active:scale-[0.97] shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* WhatsApp Input Bar */}
      <div className="p-2.5 bg-[#F0F2F5] border-t border-slate-200/90 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask Cecil's Pub AI anything..."
          className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isTyping || streamingText !== null}
          className="w-11 h-11 rounded-full bg-[#075E54] hover:bg-[#128C7E] disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-[0.97] transition-all cursor-pointer shrink-0"
          aria-label="Send message"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};

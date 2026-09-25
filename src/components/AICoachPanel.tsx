import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  HelpCircle,
  Dumbbell,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { AICoachMessage, UserProfile } from '../types/fitness';

interface AICoachPanelProps {
  userProfile: UserProfile;
}

export const AICoachPanel: React.FC<AICoachPanelProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'init-1',
      sender: 'coach',
      text: `Salom, ${userProfile.fullName}! Men sizning AI Fitness Murabbiyingizman. 🎯 Sizning maqsadingiz: ${
        userProfile.targetGoal === 'hypertrophy'
          ? 'Mushak massasini oshirish'
          : userProfile.targetGoal === 'fat_loss'
          ? "Yog' yo'qotish va rel'yef"
          : 'Kuch va chidamlilik'
      }. Mashqlar texnikasi, yondashuvlar, dam olish vaqti yoki ovqatlanish bo'yicha savollaringiz bo'lsa, bemalol so'rang!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        "Jim lejda tirsak burchagi qanday bo'lishi kerak?",
        "Pristedda chuqur o'tirish xavflimi?",
        "Mashg'ulotdan oldin va keyin nima yeyish kerak?",
        "Bugungi mashg'ulotimga qo'shimcha mashq tavsiya qil",
      ],
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: AICoachMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/coach-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query.trim(),
          userProfile,
          conversationHistory: messages.slice(-4),
        }),
      });

      if (!response.ok) {
        throw new Error('AI Coach javob bera olmadi');
      }

      const data = await response.json();
      const coachMsg: AICoachMessage = {
        id: 'msg_' + Date.now() + '_coach',
        sender: 'coach',
        text: data.reply || "Mashqni to'g'ri texnika bilan bajarish jarohatdan saqlaydi va mushak o'sishini 2 barobar tezlashtiradi.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || [
          "Keyingi mashq qanday?",
          "Dam olish vaqtimni uzaytirishim kerakmi?",
        ],
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error('Coach request error:', err);
      // Fallback local smart sports medicine advice if network hiccup
      const fallbackMsg: AICoachMessage = {
        id: 'msg_fb_' + Date.now(),
        sender: 'coach',
        text: `Savolingiz qabul qilindi! ${userProfile.fullName}, sport zalda xavfsizlik va progressning asosiy qoidasi: harakatning eksentrik (tushirish) fazasini 2-3 soniya nazorat bilan bajaring, konsentrik fazada kuchli nafas chiqaring. Og'irlikni oshirishdan oldin 10 ta toza takrorlash qila olishingizga ishonch hosil qiling!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-[#0d121f] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ccff00]/15 border border-[#ccff00]/40 flex items-center justify-center text-[#ccff00] shadow-md shadow-[#ccff00]/10">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Gemini AI Smart Coach</h3>
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-400">
              Shaxsiy biometrika va biomehanika bo'yicha onlayn murabbiy
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 hidden sm:inline-block">
          gemini-2.5-flash
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2.5 max-w-[85%]">
              {msg.sender === 'coach' && (
                <div className="w-7 h-7 rounded-xl bg-[#ccff00]/20 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#ccff00] text-black font-semibold rounded-tr-none shadow-md shadow-[#ccff00]/10'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-black/60' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                {msg.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:border-[#ccff00]/50 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-[#ccff00]" />
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#ccff00]" />
            <span>AI Murabbiy javob tayyorlamoqda...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Texnika, ovqatlanish yoki mashq haqida so'rang..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ccff00] transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-[#ccff00] hover:bg-[#b8e600] disabled:opacity-30 disabled:cursor-not-allowed text-black transition-all shadow-md shadow-[#ccff00]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

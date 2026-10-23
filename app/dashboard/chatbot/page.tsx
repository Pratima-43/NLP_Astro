"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Send, Plus, Trash2, Sparkles, Lock, Crown, Bot, User, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { suggestedQuestions, getMatchedResponse } from "@/data/chatbot";
import type { ChatMessage } from "@/types";

export default function ChatbotPage() {
  const { premium, conversations, activeConversation, setActiveConversation, addMessage, startNewConversation, clearConversation } = useApp();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getMatchedResponse(msg);
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      addMessage(botMsg);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  // Premium gate
  if (!premium.isActive) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl border border-[#E8DFCF] p-8 text-center">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#252525] mb-2">Unlock AI Cosmic Guide</h2>
          <p className="text-sm text-[#77736B] mb-6 max-w-md mx-auto">Get AI-powered answers based on the intersection of your Astrology, Numerology, and Palmistry readings.</p>
          <div className="space-y-2 mb-6">
            {suggestedQuestions.slice(0, 3).map((q) => (
              <div key={q} className="text-xs px-4 py-2 rounded-lg bg-[#FAF7F0] border border-[#E8DFCF] text-[#77736B]">{q}</div>
            ))}
          </div>
          <p className="text-xs text-[#77736B] mb-4">Use coupon <span className="font-mono font-bold text-[#C6A15B]">ASTROFREE</span> for free access</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C6A15B] text-white font-medium hover:bg-[#9E7938] transition-colors">
            Unlock Premium <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const messages = activeConversation?.messages || [];

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-6xl mx-auto gap-4 animate-fade-in">
      {/* Sidebar - conversations */}
      <div className={`${showMobileHistory ? "fixed inset-0 z-40 bg-white" : "hidden"} lg:block lg:relative lg:w-64 flex-shrink-0 border-r border-[#E8DFCF] bg-white rounded-xl lg:rounded-l-xl overflow-hidden flex flex-col`}>
        <div className="p-3 border-b border-[#E8DFCF] flex items-center justify-between">
          <h3 className="font-semibold text-[#252525] text-sm">Conversations</h3>
          <div className="flex gap-1">
            <button onClick={() => { startNewConversation(); setShowMobileHistory(false); }}
              className="p-1.5 rounded-lg hover:bg-[#FAF7F0] text-[#C6A15B]" title="New chat"><Plus className="w-4 h-4" /></button>
            <button onClick={() => setShowMobileHistory(false)} className="p-1.5 rounded-lg hover:bg-[#FAF7F0] text-[#77736B] lg:hidden">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && <p className="text-xs text-[#77736B] text-center py-4">No conversations yet</p>}
          {conversations.map((c) => (
            <button key={c.id} onClick={() => { setActiveConversation(c); setShowMobileHistory(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${
                activeConversation?.id === c.id ? "bg-[#C6A15B]/10 text-[#C6A15B] font-medium" : "text-[#77736B] hover:bg-[#FAF7F0]"
              }`}>{c.title}</button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#E8DFCF] overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8DFCF]">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMobileHistory(true)} className="lg:hidden p-1 rounded hover:bg-[#FAF7F0] text-[#77736B]">☰</button>
            <Bot className="w-5 h-5 text-[#C6A15B]" />
            <span className="font-semibold text-[#252525] text-sm">AstroVerse AI Guide</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C6A15B]/10 text-[#C6A15B] font-medium">Demo</span>
          </div>
          <button onClick={clearConversation} className="p-1.5 rounded-lg hover:bg-[#FAF7F0] text-[#77736B]" title="Clear conversation">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-[#C6A15B] mx-auto mb-3 opacity-50" />
              <h3 className="font-semibold text-[#252525] mb-1">Welcome to AstroVerse AI Guide</h3>
              <p className="text-sm text-[#77736B] max-w-md mx-auto mb-6">I can help you understand your astrology, numerology, and palmistry readings, and show you how all three systems work together.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {suggestedQuestions.slice(0, 6).map((q) => (
                  <button key={q} onClick={() => handleSend(q)}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border border-[#E8DFCF] text-[#77736B] hover:border-[#C6A15B] hover:text-[#C6A15B] transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[#C6A15B]/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-[#C6A15B]" />
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#C6A15B]/10 text-[#252525] rounded-br-md"
                  : "bg-[#FAF7F0] text-[#252525] rounded-bl-md border border-[#E8DFCF]"
              }`}>
                {msg.content}
                <p className="text-[10px] text-[#77736B]/60 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#171B2D] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C6A15B]/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#C6A15B]" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#FAF7F0] border border-[#E8DFCF]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#C6A15B] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#C6A15B] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#C6A15B] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[#E8DFCF]">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your readings..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-sm text-[#252525]"
              disabled={isTyping}
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-[#C6A15B] text-white hover:bg-[#9E7938] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#77736B] text-center mt-2">Demo chatbot with predefined responses — not connected to a real AI model.</p>
        </div>
      </div>
    </div>
  );
}

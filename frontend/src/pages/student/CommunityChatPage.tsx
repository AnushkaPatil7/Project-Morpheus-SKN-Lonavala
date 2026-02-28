import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Users, ShieldAlert, Info, AlertCircle, MessageSquare } from "lucide-react";
import StudentLayout from "../../components/shared/StudentLayout";
import { useCommunity } from "../../hooks/useCommunity";
import { cn } from "../../lib/utils";
import { formatDistanceToNow } from "date-fns";
import React from "react";

function CommunityBubble({
  message,
  isMe,
}: {
  message: any;
  isMe: boolean;
}) {
  const initials = (message.sender?.name ?? "S")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("group flex gap-3 mb-6 transition-all", isMe ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar - Discord style */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border transition-transform group-hover:scale-105",
        isMe
          ? "bg-morpheus-accent/20 border-morpheus-accent/30 text-morpheus-accent"
          : "bg-morpheus-surface border-morpheus-border text-morpheus-muted"
      )}>
        <span className="text-sm font-bold">
          {initials}
        </span>
      </div>

      <div className={cn("flex flex-col max-w-[75%] lg:max-w-[60%]", isMe ? "items-end" : "items-start")}>
        {/* Header: Name + Time */}
        <div className={cn("flex items-center gap-2 mb-1 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
          <p className="text-sm font-semibold text-morpheus-text">
            {isMe ? "You" : (message.sender?.name ?? "Student")}
          </p>
          <span className="text-[10px] text-morpheus-muted">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Message bubble */}
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-colors",
          isMe
            ? "bg-morpheus-accent text-white rounded-tr-none hover:bg-morpheus-accent/90"
            : "bg-morpheus-surface border border-morpheus-border text-morpheus-text rounded-tl-none hover:border-morpheus-accent/30"
        )}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

export default function CommunityChatPage() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    isSending,
    rejectedReason,
    sendMessage,
    currentUserId,
  } = useCommunity();

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    sendMessage(input);
    setInput("");
    if (textRef.current) textRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (!textRef.current) return;
    textRef.current.style.height = "auto";
    textRef.current.style.height = `${Math.min(textRef.current.scrollHeight, 120)}px`;
  };

  return (
    <StudentLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 overflow-hidden bg-morpheus-dark">
        {/* Header - Premium Discord feel */}
        <div className="px-6 py-4 border-b border-morpheus-border bg-morpheus-bg/50 backdrop-blur-md flex items-center gap-4 shrink-0 z-10">
          <div className="w-10 h-10 rounded-2xl bg-morpheus-accent/10 border border-morpheus-accent/20 flex items-center justify-center shadow-inner">
            <Users size={20} className="text-morpheus-accent" />
          </div>
          <div>
            <h1 className="text-base font-bold text-morpheus-text flex items-center gap-2">
              Community Commons
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-morpheus-accent/10 text-morpheus-accent border border-morpheus-accent/20 uppercase tracking-tighter">Official</span>
            </h1>
            <p className="text-xs text-morpheus-muted mt-0.5">
              Educational hub · Verified Students
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wide">Live Stream</span>
          </div>
        </div>

        {/* Messages - Scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-morpheus-border">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-morpheus-accent/20 border-t-morpheus-accent animate-spin" />
                <Users className="absolute inset-0 m-auto text-morpheus-accent/40" size={18} />
              </div>
              <p className="text-sm text-morpheus-muted animate-pulse">Establishing connection...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-morpheus-surface border border-morpheus-border flex items-center justify-center mb-6 shadow-2xl rotate-3">
                <MessageSquare className="text-morpheus-muted" size={32} />
              </div>
              <h3 className="text-xl font-bold text-morpheus-text mb-2">The stage is yours!</h3>
              <p className="text-sm text-morpheus-muted leading-relaxed">
                No messages have been sent in this frequency yet. Start the conversation by asking a concept-builder question.
              </p>
            </div>
          ) : (
            <>
              {/* Rules divider */}
              <div className="flex items-center gap-4 mb-10 opacity-60">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-morpheus-border to-transparent" />
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-morpheus-border bg-morpheus-surface text-[10px] text-morpheus-muted font-bold uppercase tracking-widest">
                  <ShieldAlert size={12} />
                  Safe Space · AI Moderated
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-morpheus-border to-transparent" />
              </div>

              <div className="space-y-2">
                {messages.map((msg) => (
                  <CommunityBubble
                    key={msg.id}
                    message={msg}
                    isMe={msg.senderId === currentUserId}
                  />
                ))}
              </div>
              <div ref={bottomRef} className="h-4" />
            </>
          )}
        </div>

        {/* Input & Rejection area */}
        <div className="mt-auto px-6 py-6 border-t border-morpheus-border/50 bg-morpheus-bg/80 backdrop-blur-md relative">

          {/* Enhanced Rejected message banner - Discord Error Style */}
          {rejectedReason && (
            <div className="absolute left-6 right-6 bottom-[100%] mb-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl flex items-start gap-3 shadow-2xl">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-tight mb-0.5">Moderation Alert</p>
                  <p className="text-sm text-red-300/90 leading-relaxed font-medium">
                    {rejectedReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto">
            <div className="relative group transition-all">
              {/* Input Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-morpheus-accent/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />

              <div className="relative flex items-end gap-3 bg-morpheus-surface border border-morpheus-border rounded-2xl p-2 focus-within:border-morpheus-accent/50 transition-all shadow-xl">
                <div className="flex-1 px-2">
                  <textarea
                    ref={textRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder="Message #community-commons..."
                    rows={1}
                    className={cn(
                      "w-full resize-none bg-transparent py-2.5 text-sm text-morpheus-text placeholder:text-morpheus-muted",
                      "focus:outline-none transition-colors",
                      "max-h-[200px] overflow-y-auto"
                    )}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-lg",
                    input.trim() && !isSending
                      ? "bg-morpheus-accent text-white hover:bg-morpheus-accent/90 hover:scale-105 active:scale-95"
                      : "bg-morpheus-bg border border-morpheus-border text-morpheus-muted opacity-40 cursor-not-allowed"
                  )}
                >
                  {isSending
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Send size={18} />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 px-1">
              <p className="text-[10px] text-morpheus-muted flex items-center gap-1.5 font-medium">
                <Info size={12} className="opacity-70" />
                Press Enter to send · Shift+Enter for new line
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-morpheus-muted hover:text-morpheus-text cursor-help transition-colors">Help</span>
                <span className="text-[10px] text-morpheus-muted hover:text-morpheus-text cursor-help transition-colors">Guidelines</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
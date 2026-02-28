import { useState, useEffect, useRef } from "react";
import { Brain, Bot, Loader2 } from "lucide-react";
import StudentLayout from "../../components/shared/StudentLayout";
import SessionList from "../../components/ai/SessionList";
import AIMessageBubble from "../../components/ai/AIMessageBubble";
import AIInputBar from "../../components/ai/AIInputBar";
import { useChatSessions, useChatbot } from "../../hooks/useChatbot";

export default function AIChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { sessions, isLoading: sessionsLoading, createSession } = useChatSessions();
  const { messages, isLoading: messagesLoading, isAsking, ask } = useChatbot(activeSessionId);

  // Auto select first session on load
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAsking]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const session = await createSession("New Conversation");
      setActiveSessionId(session.id);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAsk = async (question: string, image?: File) => {
    if (!activeSessionId) {
      // Auto-create session if none exists
      setIsCreating(true);
      const session = await createSession(
        question.slice(0, 40) || "Image Question"
      );
      setActiveSessionId(session.id);
      setIsCreating(false);
      await ask(question, image);
    } else {
      await ask(question, image);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <StudentLayout>
      <div className="flex h-[calc(100vh-6rem)] -m-6 overflow-hidden rounded-2xl border border-morpheus-border">
        {/* Left sidebar — session list */}
        <div className="w-64 shrink-0 bg-morpheus-bg hidden md:block">
          <SessionList
            sessions={sessions}
            activeId={activeSessionId}
            isLoading={sessionsLoading}
            onSelect={setActiveSessionId}
            onCreate={handleCreate}
            isCreating={isCreating}
          />
        </div>

        {/* Right — chat window */}
        <div className="flex-1 flex flex-col bg-morpheus-bg">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-morpheus-border flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Brain size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-morpheus-text">
                {activeSession?.title ?? "AI Doubt Solver"}
              </p>
              <p className="text-xs text-morpheus-muted">
                Powered by Groq · Supports OCR image uploads
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {!activeSessionId ? (
              /* Empty state — no session selected */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Brain size={28} className="text-amber-400" />
                </div>
                <h3 className="font-display font-semibold text-morpheus-text mb-2">
                  AI Doubt Solver
                </h3>
                <p className="text-sm text-morpheus-muted max-w-xs">
                  Ask any academic question or upload an image of your problem.
                  The AI will solve it step by step.
                </p>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-500/90 transition-all flex items-center gap-2"
                >
                  {isCreating
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Brain size={15} />
                  }
                  Start a Conversation
                </button>
              </div>
            ) : messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={22} className="animate-spin text-amber-400" />
              </div>
            ) : messages.length === 0 ? (
              /* Empty session */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                  <Bot size={22} className="text-amber-400" />
                </div>
                <p className="text-sm font-medium text-morpheus-text mb-1">
                  Ready to help!
                </p>
                <p className="text-xs text-morpheus-muted max-w-xs">
                  Type your question below or upload an image of a problem.
                  I'll solve it step by step.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <AIMessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator */}
                {isAsking && (
                  <div className="flex gap-3 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Bot size={15} className="text-amber-400" />
                    </div>
                    <div className="bg-morpheus-surface border border-morpheus-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          <AIInputBar onSend={handleAsk} isAsking={isAsking} />
        </div>
      </div>
    </StudentLayout>
  );
}
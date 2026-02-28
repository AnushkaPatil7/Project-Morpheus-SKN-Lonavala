import { Bot, User } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ChatMessage } from "../../api/chatbot.api.ts";

interface Props {
  message: ChatMessage;
}

export default function AIMessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 mb-5", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
        isUser
          ? "bg-morpheus-accent/10 border border-morpheus-accent/20"
          : "bg-amber-500/10 border border-amber-500/20"
      )}>
        {isUser
          ? <User size={15} className="text-morpheus-accent" />
          : <Bot size={15} className="text-amber-400" />
        }
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[75%] space-y-2", isUser ? "items-end" : "items-start")}>
        {/* Image if present */}
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Uploaded"
            className="rounded-xl max-w-xs border border-morpheus-border"
          />
        )}

        {/* Text content */}
        {message.content && (
          <div className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-morpheus-accent text-white rounded-tr-sm"
              : "bg-morpheus-surface border border-morpheus-border text-morpheus-text rounded-tl-sm"
          )}>
            {message.content}
          </div>
        )}

        {/* Timestamp */}
        <p className={cn(
          "text-xs text-morpheus-muted px-1",
          isUser ? "text-right" : "text-left"
        )}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
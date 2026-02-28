import { Plus, MessageSquare, Loader2, Trash2 } from "lucide-react";
import type { ChatSession } from "../../api/chatbot.api";
import { cn } from "../../lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Props {
  sessions: ChatSession[];
  activeId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  isCreating: boolean;
}

export default function SessionList({
  sessions, activeId, isLoading, onSelect, onCreate, isCreating,
}: Props) {
  return (
    <div className="flex flex-col h-full border-r border-morpheus-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-morpheus-border flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-morpheus-text text-sm">
            AI Doubt Solver
          </h2>
          <p className="text-xs text-morpheus-muted mt-0.5">
            {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onCreate}
          disabled={isCreating}
          className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 flex items-center justify-center transition-all"
          title="New conversation"
        >
          {isCreating
            ? <Loader2 size={14} className="animate-spin" />
            : <Plus size={14} />
          }
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 size={18} className="animate-spin text-morpheus-muted" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageSquare size={24} className="text-morpheus-border mx-auto mb-2" />
            <p className="text-xs text-morpheus-muted">No conversations yet</p>
            <button
              onClick={onCreate}
              className="mt-3 text-xs text-amber-400 hover:underline"
            >
              Start your first one
            </button>
          </div>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "w-full text-left px-4 py-3 transition-all group",
                activeId === s.id
                  ? "bg-amber-500/5 border-l-2 border-amber-500"
                  : "hover:bg-morpheus-surface border-l-2 border-transparent"
              )}
            >
              <p className={cn(
                "text-sm font-medium truncate",
                activeId === s.id ? "text-amber-400" : "text-morpheus-text"
              )}>
                {s.title}
              </p>
              <p className="text-xs text-morpheus-muted mt-0.5">
                {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
import { useState, useRef, type KeyboardEvent } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface Props {
  onSend: (question: string, image?: File) => void;
  isAsking: boolean;
}

export default function AIInputBar({ onSend, isAsking }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSend = () => {
    if (isAsking) return;
    if (!text.trim() && !image) return;
    onSend(text, image ?? undefined);
    setText("");
    removeImage();
    // Reset textarea height
    if (textRef.current) textRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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

  const canSend = (text.trim().length > 0 || image !== null) && !isAsking;

  return (
    <div className="border-t border-morpheus-border bg-morpheus-bg px-4 py-3">
      {/* Image preview */}
      {preview && (
        <div className="mb-2 flex items-start gap-2">
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Upload preview"
              className="h-20 w-auto rounded-xl border border-morpheus-border object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
            >
              <X size={11} />
            </button>
          </div>
          <div className="text-xs text-morpheus-muted mt-1">
            <p className="font-medium text-morpheus-text">{image?.name}</p>
            <p>OCR will extract text from this image</p>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Image upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all mb-0.5",
            image
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
              : "border-morpheus-border text-morpheus-muted hover:text-amber-400 hover:border-amber-500/30"
          )}
          title="Upload image for OCR"
        >
          <ImagePlus size={17} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={image ? "Add a question about the image... (optional)" : "Ask anything..."}
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-morpheus-border bg-morpheus-surface",
              "px-4 py-2.5 text-sm text-morpheus-text placeholder:text-morpheus-muted",
              "focus:outline-none focus:border-amber-500/40 transition-colors",
              "max-h-[120px] overflow-y-auto"
            )}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all mb-0.5",
            canSend
              ? "bg-amber-500 text-white hover:bg-amber-500/90 shadow-lg shadow-amber-500/20"
              : "bg-morpheus-surface border border-morpheus-border text-morpheus-muted opacity-50 cursor-not-allowed"
          )}
        >
          {isAsking
            ? <Loader2 size={16} className="animate-spin" />
            : <Send size={16} />
          }
        </button>
      </div>

      <p className="text-xs text-morpheus-muted mt-2 text-center">
        Enter to send · Shift+Enter for new line · Upload images for OCR
      </p>
    </div>
  );
}
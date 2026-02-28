import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2, Send } from "lucide-react";
import { cn } from "../../lib/utils";
import api from "../../api/axios";
import { toast } from "sonner";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    tutorName: string;
}

export default function ReviewModal({ isOpen, onClose, sessionId, tutorName }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/api/reviews", {
                sessionId,
                rating,
                comment,
            });
            toast.success("Review submitted successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0e1020] p-8 shadow-2xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute right-5 top-5 rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                                <Star size={32} className="fill-teal-400/20" />
                            </div>

                            <h2 className="mb-2 font-display text-2xl font-bold text-white">
                                How was your session?
                            </h2>
                            <p className="mb-8 text-sm text-white/50">
                                Your feedback helps <span className="text-teal-400 font-medium">{tutorName}</span> improve and helps other students find the best tutors.
                            </p>

                            {/* Star Rating */}
                            <div className="mb-8 flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        key={star}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="relative p-1 focus:outline-none"
                                    >
                                        <Star
                                            size={36}
                                            className={cn(
                                                "transition-colors duration-200",
                                                (hoveredRating || rating) >= star
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-white/10"
                                            )}
                                        />
                                        {rating === star && (
                                            <motion.div
                                                layoutId="star-glow"
                                                className="absolute inset-0 -z-10 blur-xl bg-amber-400/30 rounded-full"
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Comment Field */}
                            <div className="mb-8">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us what you liked (or didn't liked)..."
                                    className="w-full min-h-[120px] rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-white placeholder:text-white/20 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-all resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 rounded-xl border border-white/5 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || rating === 0}
                                    className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-medium text-black transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Submit Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

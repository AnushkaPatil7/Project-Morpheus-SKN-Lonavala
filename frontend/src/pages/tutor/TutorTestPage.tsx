import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, RefreshCw, ChevronRight } from "lucide-react";
import { useTutorTest } from "../../hooks/useTutorTest";
import { cn } from "../../lib/utils";

// ─── Option button ────────────────────────────────────────────────────────────

function OptionButton({
  label,
  text,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  text: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150",
        "disabled:cursor-not-allowed",
        selected
          ? "border-morpheus-accent bg-morpheus-accent/10 text-morpheus-accent"
          : "border-morpheus-border bg-morpheus-surface/50 text-morpheus-text hover:border-morpheus-accent/40 hover:bg-morpheus-surface"
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
          selected
            ? "border-morpheus-accent bg-morpheus-accent text-white"
            : "border-morpheus-border text-morpheus-muted"
        )}
      >
        {label}
      </span>
      <span className="leading-relaxed">{text}</span>
    </button>
  );
}

// ─── Result screen ────────────────────────────────────────────────────────────

function ResultScreen({
  passed,
  percentage,
  score,
  totalMarks,
  correctAnswers,
  totalQuestions,
  feedback,
  onRetry,
  onContinue,
}: {
  passed: boolean;
  percentage: number;
  score: number;
  totalMarks: number;
  correctAnswers: number;
  totalQuestions: number;
  feedback?: string;
  onRetry: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      {passed ? (
        <CheckCircle2 className="h-16 w-16 text-emerald-400" strokeWidth={1.5} />
      ) : (
        <XCircle className="h-16 w-16 text-red-400" strokeWidth={1.5} />
      )}

      <div className="space-y-1">
        <h2 className="text-2xl font-semibold font-display text-morpheus-text">
          {passed ? "You passed!" : "Not quite there"}
        </h2>
        <p className="text-morpheus-muted text-sm">
          {passed
            ? "Great work. Your profile is now pending admin approval."
            : "You need at least 70% to pass. You can retake the test."}
        </p>
      </div>

      {/* Score card */}
      <div className="w-full max-w-xs rounded-2xl border border-morpheus-border bg-morpheus-surface/50 p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-morpheus-muted">Percentage</span>
          <span className={cn("font-semibold", passed ? "text-emerald-400" : "text-red-400")}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-morpheus-border overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", passed ? "bg-emerald-400" : "bg-red-400")}
            style={{ width: `${Math.min(Math.round(percentage), 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-morpheus-muted">Score</span>
          <span className="text-morpheus-text font-medium">
            {score} / {totalMarks} marks
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-morpheus-muted">Correct answers</span>
          <span className="text-morpheus-text font-medium">
            {correctAnswers} / {totalQuestions}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-morpheus-muted">Pass threshold</span>
          <span className="text-morpheus-text">70%</span>
        </div>
      </div>

      {/* AI feedback */}
      {feedback && (
        <p className="text-sm text-morpheus-muted italic max-w-sm">
          "{feedback}"
        </p>
      )}

      {passed ? (
        <button
          onClick={onContinue}
          className={cn(
            "flex items-center gap-2 rounded-xl px-6 py-2.5",
            "bg-morpheus-accent text-white text-sm font-medium",
            "transition-all shadow-lg shadow-morpheus-accent/25 hover:bg-morpheus-accent/90"
          )}
        >
          Go to Dashboard <ChevronRight size={16} />
        </button>
      ) : (
        <button
          onClick={onRetry}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-morpheus-border px-6 py-2.5",
            "text-sm text-morpheus-text hover:bg-morpheus-surface transition-colors"
          )}
        >
          <RefreshCw size={15} /> Retake Test
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TutorTestPage() {
  const navigate = useNavigate();
  const {
    test, isGenerating, generateError, generateTest,
    answers, selectAnswer, allAnswered,
    isSubmitting, submitError, submitTest,
    result, retryTest,
  } = useTutorTest();

  // Auto-generate on mount
  useEffect(() => {
    generateTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-morpheus-bg flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-morpheus-accent">
            Step 4 of 4
          </p>
          <h1 className="text-2xl font-semibold font-display text-morpheus-text">
            Subject Competence Test
          </h1>
          <p className="text-sm text-morpheus-muted">
            Answer all questions to verify your knowledge. You need 70% or above to proceed to admin review.
          </p>
        </div>

        {/* Loading */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-morpheus-muted">
            <Loader2 className="h-8 w-8 animate-spin text-morpheus-accent" />
            <p className="text-sm">Generating your personalised test…</p>
          </div>
        )}

        {/* Generate error */}
        {!isGenerating && generateError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-5 py-6 space-y-3 text-center">
            <p className="text-sm text-red-400">{generateError}</p>
            <button
              onClick={generateTest}
              className="flex items-center gap-2 mx-auto rounded-xl border border-morpheus-border px-5 py-2 text-sm text-morpheus-text hover:bg-morpheus-surface transition-colors"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface/50 px-6 py-8">
            <ResultScreen
              passed={result.passed}
              percentage={result.percentage}
              score={result.score}
              totalMarks={result.totalMarks}
              correctAnswers={result.correctAnswers}
              totalQuestions={result.totalQuestions}
              feedback={result.feedback}
              onRetry={retryTest}
              onContinue={() => navigate("/tutor/dashboard")}
            />
          </div>
        )}

        {/* Questions */}
        {!isGenerating && !generateError && test && !result && (
          <>
            {/* Test meta */}
            <div className="rounded-2xl border border-morpheus-border bg-morpheus-surface/50 px-5 py-4">
              <p className="text-sm font-medium text-morpheus-text">{test.title}</p>
              {test.description && (
                <p className="text-xs text-morpheus-muted mt-0.5">{test.description}</p>
              )}
              <p className="text-xs text-morpheus-muted mt-2">
                {test.questions.length} questions · {Object.keys(answers).length} answered
              </p>
            </div>

            <div className="space-y-5">
              {test.questions.map((q: any, idx: any) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-morpheus-border bg-morpheus-surface/50 p-5 space-y-3"
                >
                  <p className="text-sm font-medium text-morpheus-text leading-relaxed">
                    <span className="text-morpheus-accent font-semibold mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt: any, optIdx: any) => {
                      // AI returns options as plain strings e.g. "A. Some text"
                      // or as objects { key, text } — normalise both shapes
                      const isString = typeof opt === "string";
                      const optKey = isString
                        ? (opt as string).match(/^([A-Z])\./)?.[1] ?? String.fromCharCode(65 + optIdx)
                        : (opt as { key: string; text: string }).key;
                      const optText = isString
                        ? (opt as string).replace(/^[A-Z]\.\s*/, "")
                        : (opt as { key: string; text: string }).text;

                      return (
                        <OptionButton
                          key={optKey}
                          label={optKey}
                          text={optText}
                          selected={answers[String(q.id)] === optKey}
                          onClick={() => selectAnswer(String(q.id), optKey)}
                          disabled={isSubmitting}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                <p className="text-sm text-red-400">{submitError}</p>
              </div>
            )}

            <div className="space-y-3 pb-8">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-morpheus-muted">
                  <span>Progress</span>
                  <span>{Object.keys(answers).length} / {test.questions.length}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-morpheus-border overflow-hidden">
                  <div
                    className="h-full bg-morpheus-accent rounded-full transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / test.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={submitTest}
                disabled={!allAnswered || isSubmitting}
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3",
                  "bg-morpheus-accent text-white text-sm font-medium",
                  "transition-all shadow-lg shadow-morpheus-accent/25 hover:bg-morpheus-accent/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                )}
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                ) : (
                  <>Submit Test <ChevronRight size={16} /></>
                )}
              </button>

              {!allAnswered && (
                <p className="text-center text-xs text-morpheus-muted">
                  Answer all {test.questions.length} questions to submit
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
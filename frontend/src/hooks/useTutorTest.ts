import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { tutorApi } from "../api/onboarding.api";
import type { GeneratedTest, TestEvaluation } from "../hooks/tutorTest.ts";

export function useTutorTest() {
  const navigate = useNavigate();

  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<TestEvaluation | null>(null);

  // ── Generate ───────────────────────────────────────────────────────────────

  const generateTest = useCallback(async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setTest(null);
    setAnswers({});
    setResult(null);

    try {
      const data = await tutorApi.generateTest();
      setTest(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 409) {
        navigate("/tutor/dashboard");
        return;
      }
      setGenerateError(
        axiosError.response?.data?.message || "Failed to generate test. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [navigate]);

  // ── Answer selection ───────────────────────────────────────────────────────

  const selectAnswer = useCallback((questionId: string, optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  }, []);

  const allAnswered = test
    ? test.questions.every((q: any) => answers[String(q.id)] !== undefined)
    : false;

  // ── Submit ─────────────────────────────────────────────────────────────────

  const submitTest = useCallback(async () => {
    if (!test) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const data = await tutorApi.submitTest(test.testId, answers);
      const ev = data.evaluation ?? {};

      // Safely extract values from the real evaluation response
      const score = ev.score ?? 0;
      const totalMarks = ev.totalMarks ?? 1; // avoid division by zero
      const percentage = ev.percentage ?? Math.round((score / totalMarks) * 100);
      const passed = ev.passed ?? percentage >= 70;
      const feedback = ev.feedback ?? "";

      const correctAnswers = ev.details
        ? ev.details.filter((d: any) => d.correct).length
        : Math.round((percentage / 100) * test.questions.length);

      setResult({
        score,
        totalMarks,
        percentage,
        passed,
        feedback,
        details: ev.details ?? [],
        correctAnswers,
        totalQuestions: test.questions.length,
      });
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setSubmitError(
        axiosError.response?.data?.message || "Failed to submit test. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [test, answers]);

  // ── Retry ──────────────────────────────────────────────────────────────────

  const retryTest = useCallback(() => {
    setResult(null);
    setTest(null);
    setAnswers({});
    setSubmitError(null);
    generateTest();
  }, [generateTest]);

  return {
    test, isGenerating, generateError, generateTest,
    answers, selectAnswer, allAnswered,
    isSubmitting, submitError, submitTest,
    result, retryTest,
  };
}
// ─── Tutor Test Types ─────────────────────────────────────────────────────────

// The AI returns options as plain strings e.g. "A. Some text"
// We normalise them in the component, so accept both shapes here.
export type TestQuestion = {
  id: string | number;
  type: "mcq" | "msq";
  question: string;
  options: string[] | { key: string; text: string }[];
  marks: number;
  // correctAnswer/correctAnswers are stripped by backend before sending
};

export type GeneratedTest = {
  testId: string;
  title: string;
  description: string;
  questions: TestQuestion[];
};

export type TestSubmission = {
  testId: string;
  submissions: Record<string, string>; // questionId -> chosen option key e.g. "A"
};

export type TestEvaluation = {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  feedback?: string;
  details?: { questionId: string | number; correct: boolean }[];
  // convenience fields used by ResultScreen
  correctAnswers: number;
  totalQuestions: number;
};

export type TestResult = {
  message: string;
  evaluation: TestEvaluation;
};
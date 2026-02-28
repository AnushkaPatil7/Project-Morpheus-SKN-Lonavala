
///toggle (exam mode + regular mode)
import { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

// Auth
import SignupPage from "../pages/auth/SignupPage";
import LoginPage from "../pages/auth/LoginPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";

// Onboarding
import StudentOnboardingPage from "../pages/onboarding/StudentOnboardingPage";
import TutorOnboardingPage from "../pages/onboarding/TutorOnboardingPage";

// Student
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import DiscoveryPage from "../pages/student/DiscoveryPage";
import TutorProfilePage from "../pages/student/TutorProfilePage";
import StudentChatPage from "../pages/student/StudentChatPage";
import StudentSessionsPage from "../pages/student/StudentSessionsPage";
import AIChatPage from "../../src/pages/student/AIChatPage";   ///      ../pages/student/AIChatPage
import CommunityChatPage from "../../src/pages/student/CommunityChatPage";   ///    ../pages/student/CommunityChatPage

import WeaknessPredictionPage from "../pages/student/WeaknessPredictionPage";
import LearningVelocityPage from "../pages/student/LearningVelocityPage";
import ConceptStabilityPage from "../pages/student/ConceptStabilityPage";
import RevisionSessionPage from "../pages/student/RevisionSessionPage";
import FlashcardsPage from "../pages/student/FlashcardsPage";
import SolverProfilePage from "../pages/student/SolverProfilePage";
import ConceptTransferPage from "../pages/student/ConceptTransferPage";
import LiveUsersPage from "../pages/student/LiveUsersPage";
import LandingPage from "../pages/landingpage";

// Tutor
import TutorDashboardPage from "../pages/tutor/TutorDashboardPage";
import ConnectionRequestsPage from "../pages/tutor/ConnectionRequestsPage";
import MyStudentsPage from "../pages/tutor/MyStudentsPage";
import TutorChatPage from "../pages/tutor/TutorChatPage";
import TutorSessionsPage from "../pages/tutor/TutorSessionsPage";

// Admin
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import TutorManagementPage from "../pages/admin/TutorManagementPage";
import TutorDetailPage from "../pages/admin/TutorDetailPage";

import TutorTestPage from "../pages/tutor/TutorTestPage";

// Video call
import VideoCallPage from "../pages/VideoCallPage";

// ─── Guards ───────────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "tutor") return <Navigate to="/tutor/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  return <>{children}</>;
}

function RoleRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) {
  const user = useAuthStore((s) => s.user);
  if (!user || !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-morpheus-bg flex items-center justify-center">
      <p className="font-display text-morpheus-muted">{label} — coming soon</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyOtpPage />} />

        <Route path="/" element={<LandingPage />} />

        {/* Onboarding */}
        <Route path="/student/onboarding" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentOnboardingPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/tutor/onboarding" element={
          <ProtectedRoute><RoleRoute allowedRoles={["tutor"]}><TutorOnboardingPage /></RoleRoute></ProtectedRoute>
        } />

        {/* Student — regular */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentDashboardPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/discovery" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><DiscoveryPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/tutors/:tutorId" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><TutorProfilePage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/chat" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentChatPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/connections" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><Placeholder label="Connections" /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/sessions" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentSessionsPage /></RoleRoute></ProtectedRoute>
        } />

        <Route path="/tutor/test" element={
          <ProtectedRoute><RoleRoute allowedRoles={["tutor"]}><TutorTestPage /></RoleRoute></ProtectedRoute>
        } />

        {/* Student — exam mode */}
        <Route path="/student/ai-chat" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><AIChatPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/community" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><CommunityChatPage /></RoleRoute></ProtectedRoute>
        } />

        <Route path="/student/weakness-prediction" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><WeaknessPredictionPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/learning-velocity" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><LearningVelocityPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/concept-stability" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><ConceptStabilityPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/revision/:topicSlug" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><RevisionSessionPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/flashcards/:topicSlug" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><FlashcardsPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/solver-profile" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><SolverProfilePage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/concept-transfer" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><ConceptTransferPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/student/live-users" element={
          <ProtectedRoute><RoleRoute allowedRoles={["student"]}><LiveUsersPage /></RoleRoute></ProtectedRoute>
        } />

        {/* Tutor */}
        <Route path="/tutor/dashboard" element={
          <ProtectedRoute><RoleRoute allowedRoles={["tutor"]}><TutorDashboardPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/tutor/requests" element={
          <ProtectedRoute><RoleRoute allowedRoles={["tutor"]}><ConnectionRequestsPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/tutor/students" element={
          <ProtectedRoute><RoleRoute allowedRoles={["tutor"]}><MyStudentsPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/tutor/chat" element={
          <ProtectedRoute><RoleRoute allowedRoles={["tutor"]}><TutorChatPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/tutor/sessions" element={
          <ProtectedRoute><RoleRoute allowedRoles={["tutor"]}><TutorSessionsPage /></RoleRoute></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute><RoleRoute allowedRoles={["admin"]}><AdminDashboardPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/admin/tutors" element={
          <ProtectedRoute><RoleRoute allowedRoles={["admin"]}><TutorManagementPage /></RoleRoute></ProtectedRoute>
        } />
        <Route path="/admin/tutors/:tutorId" element={
          <ProtectedRoute><RoleRoute allowedRoles={["admin"]}><TutorDetailPage /></RoleRoute></ProtectedRoute>
        } />

        {/* Video call */}
        <Route path="/call/:sessionId" element={
          <ProtectedRoute><VideoCallPage /></ProtectedRoute>
        } />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<div className="p-8 text-red-400">Access Denied</div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Search, Users, MessageSquare,
  CalendarClock, LogOut, Menu, X, Brain,
  Telescope, FlaskConical, BookOpen,
  TrendingUp, Activity, Cpu, Globe, Radio, Video,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useModeStore } from "../../store/mode.store";
import { cn } from "../../lib/utils";

interface Props {
  children: ReactNode;
}

const regularNav = [
  { to: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/student/discovery", icon: Search, label: "Find Tutors" },
  { to: "/student/connections", icon: Users, label: "Connections" },
  { to: "/student/chat", icon: MessageSquare, label: "Messages" },
  { to: "/student/sessions", icon: CalendarClock, label: "Sessions" },
];

const examOnlyNav = [
  { to: "/student/ai-chat", icon: Brain, label: "AI Doubt Solver" },
  { to: "/student/community", icon: Telescope, label: "Community" },
];

const aiNavItems = [
  { to: "/student/weakness-prediction", icon: Brain, label: "Weakness Predictor" },
  { to: "/student/learning-velocity", icon: TrendingUp, label: "Learning Velocity" },
  { to: "/student/concept-stability", icon: Activity, label: "Concept Stability" },
  { to: "/student/solver-profile", icon: Cpu, label: "Solver Profile" },
  { to: "/student/concept-transfer", icon: Globe, label: "Transfer Score" },
  { to: "/student/live-users", icon: Radio, label: "Live Platform" },
];

function NavItem({
  to, icon: Icon, label, onClick,
}: {
  to: string; icon: typeof LayoutDashboard; label: string; onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
          isActive
            ? "bg-morpheus-accent/10 text-morpheus-accent border border-morpheus-accent/20"
            : "text-morpheus-muted hover:text-morpheus-text hover:bg-morpheus-surface"
        )
      }
    >
      <Icon size={17} />
      <span>{label}</span>
    </NavLink>
  );
}

function ModeToggle() {
  const { mode, toggleMode } = useModeStore();
  const isExam = mode === "exam";

  return (
    <button
      onClick={toggleMode}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
        isExam
          ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
          : "bg-morpheus-surface border-morpheus-border text-morpheus-muted hover:text-morpheus-text"
      )}
    >
      <FlaskConical size={17} className={isExam ? "text-amber-400" : ""} />
      <div className="flex-1 text-left">
        <span>{isExam ? "Exam Mode" : "Regular Mode"}</span>
        <p className="text-xs opacity-60 font-normal mt-0.5">
          {isExam ? "Click to switch to regular" : "Click for exam features"}
        </p>
      </div>
      {/* Toggle pill */}
      <div className={cn(
        "w-8 h-4 rounded-full transition-all relative shrink-0",
        isExam ? "bg-amber-400" : "bg-morpheus-border"
      )}>
        <div className={cn(
          "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
          isExam ? "left-4" : "left-0.5"
        )} />
      </div>
    </button>
  );
}

export default function StudentLayout({ children }: Props) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { mode } = useModeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isExam = mode === "exam";

  const initials = (user?.name ?? "S")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-morpheus-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-morpheus-accent flex items-center justify-center shrink-0">
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-morpheus-text text-lg leading-none">
              Morpheus
            </span>
            {isExam && (
              <span className="block text-xs text-amber-400 font-medium mt-0.5">
                Exam Mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Regular nav — always visible */}
        <div className="space-y-1">
          {regularNav.map((item) => (
            <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />
          ))}
        </div>

        {/* AI Insights — always visible */}
        <div className="mt-4 pt-4 border-t border-morpheus-border">
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-morpheus-muted">AI Insights</p>
          <div className="space-y-1">
            {aiNavItems.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />
            ))}
          </div>
        </div>

        {/* Exam mode nav — only visible in exam mode */}
        {isExam && (
          <>
            <div className="pt-3 pb-1 px-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-amber-500/20" />
                <span className="text-xs text-amber-400 font-medium">
                  Exam Tools
                </span>
                <div className="h-px flex-1 bg-amber-500/20" />
              </div>
            </div>
            <div className="space-y-1">
              {examOnlyNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "text-morpheus-muted hover:text-amber-400 hover:bg-amber-500/5"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={17}
                        className={isActive ? "text-amber-400" : ""}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-morpheus-border space-y-2">
        {/* Mode toggle */}
        <ModeToggle />

        {/* User + logout */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-morpheus-surface border border-morpheus-border">
          <div className="w-8 h-8 rounded-full bg-morpheus-accent/10 border border-morpheus-accent/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-morpheus-accent">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-morpheus-text truncate">
              {user?.name}
            </p>
            <p className="text-xs text-morpheus-muted truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-morpheus-muted hover:text-red-400 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-morpheus-bg overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-morpheus-border bg-morpheus-bg flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-morpheus-bg border-r border-morpheus-border z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-morpheus-border bg-morpheus-bg sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-morpheus-muted hover:text-morpheus-text"
          >
            <Menu size={22} />
          </button>
          <span className="font-display font-bold text-morpheus-text">
            Morpheus
          </span>
          <div className="w-6" />
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
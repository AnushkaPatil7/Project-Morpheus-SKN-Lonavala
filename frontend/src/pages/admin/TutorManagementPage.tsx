import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, XCircle, Loader2, Eye, MapPin,
  GraduationCap, ShieldOff, Users
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdminTutors } from "../../hooks/useAdmin";
import { cn } from "../../lib/utils";

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "suspended";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  approved: { label: "Approved", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  rejected: { label: "Rejected", className: "text-red-400 bg-red-400/10 border-red-400/20" },
  suspended: { label: "Suspended", className: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
};

const tabs: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "suspended", label: "Suspended" },
];

export default function TutorManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const {
    tutors, pending, approved, rejected, suspended,
    isLoading, error, actionLoadingId,
    approve, reject, suspend,
  } = useAdminTutors();

  const filtered = activeTab === "all"
    ? tutors
    : tutors.filter((t) => t.status === activeTab);

  return (
    <AdminLayout pendingCount={pending.length}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-morpheus-text">
          Tutor Management
        </h1>
        <p className="text-morpheus-muted text-sm mt-1">
          Review, approve, and manage all tutor profiles.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pending", count: pending.length, color: "amber" },
          { label: "Approved", count: approved.length, color: "emerald" },
          { label: "Rejected", count: rejected.length, color: "red" },
          { label: "Suspended", count: suspended.length, color: "orange" },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-morpheus-border bg-morpheus-surface p-4 text-center"
          >
            <p className={`text-2xl font-black text-${color}-400`}>{count}</p>
            <p className="text-xs text-morpheus-muted uppercase tracking-wider font-bold mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-morpheus-border overflow-x-auto">
        {tabs.map((tab) => {
          const count = tab.key === "all"
            ? tutors.length
            : tutors.filter((t) => t.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap",
                activeTab === tab.key
                  ? "border-morpheus-accent text-morpheus-accent"
                  : "border-transparent text-morpheus-muted hover:text-morpheus-text"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  activeTab === tab.key
                    ? "bg-morpheus-accent text-white"
                    : "bg-morpheus-surface text-morpheus-muted"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-morpheus-accent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-morpheus-border p-12 text-center">
          <Users size={32} className="text-morpheus-border mx-auto mb-3" />
          <p className="text-morpheus-text font-medium">
            No {activeTab === "all" ? "" : activeTab} tutors found
          </p>
          <p className="text-morpheus-muted text-sm mt-1">
            {activeTab === "pending"
              ? "All tutor applications have been reviewed."
              : "No tutors match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tutor: any) => {
            const name = tutor.name ?? "Tutor";
            const email = tutor.email ?? "";
            const initials = name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const isActionLoading = actionLoadingId === tutor.id;
            const status = statusConfig[tutor.status] ?? statusConfig.pending;

            return (
              <div
                key={tutor.id}
                className="rounded-2xl border border-morpheus-border bg-morpheus-surface overflow-hidden"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm border",
                      tutor.status === "approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        tutor.status === "rejected" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                          tutor.status === "suspended" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                            "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-morpheus-text">{name}</p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border font-medium",
                          status.className
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-morpheus-muted truncate">{email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-morpheus-muted">
                      {tutor.education && <span>{tutor.education}</span>}
                      {tutor.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />{tutor.city}
                        </span>
                      )}
                      {tutor.experienceYears > 0 && (
                        <span>{tutor.experienceYears}y exp</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View Detail */}
                    <button
                      onClick={() => navigate(`/admin/tutors/${tutor.id}`)}
                      className="w-8 h-8 rounded-lg border border-morpheus-border text-morpheus-muted hover:text-morpheus-text flex items-center justify-center transition-all"
                      title="View Full Profile"
                    >
                      <Eye size={14} />
                    </button>

                    {/* Context-aware action buttons */}
                    {tutor.status === "pending" && (
                      <>
                        <button
                          onClick={() => reject(tutor.id)}
                          disabled={isActionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                          Reject
                        </button>
                        <button
                          onClick={() => approve(tutor.id)}
                          disabled={isActionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                        >
                          {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                          Approve
                        </button>
                      </>
                    )}

                    {tutor.status === "approved" && (
                      <button
                        onClick={() => suspend(tutor.id)}
                        disabled={isActionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/10 transition-all disabled:opacity-50"
                      >
                        {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={13} />}
                        Suspend
                      </button>
                    )}

                    {(tutor.status === "rejected" || tutor.status === "suspended") && (
                      <button
                        onClick={() => approve(tutor.id)}
                        disabled={isActionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                      >
                        {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                        Re-approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
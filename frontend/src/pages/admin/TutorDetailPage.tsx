import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    MapPin,
    GraduationCap,
    ShieldOff,
    Video,
    Image as ImageIcon,
    History,
    AlertCircle,
    FileText,
    ExternalLink
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../api/admin.api";
import { cn } from "../../lib/utils";

export default function TutorDetailPage() {
    const { tutorId } = useParams<{ tutorId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (tutorId) {
            adminApi.getTutorById(tutorId)
                .then(setData)
                .catch((err) => console.error("Error fetching tutor:", err))
                .finally(() => setLoading(false));
        }
    }, [tutorId]);

    const handleReview = async (status: "approved" | "rejected" | "suspended") => {
        if (!tutorId) return;
        try {
            setActionLoading(true);
            await adminApi.reviewTutor(tutorId, status);
            navigate("/admin/tutors");
        } catch (err) {
            console.error(`Error ${status} tutor:`, err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-morpheus-accent mb-4" />
                    <p className="text-morpheus-muted font-medium animate-pulse">Fetching complete tutor profile...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <AlertCircle size={40} className="text-red-400 mb-4" />
                    <h2 className="text-xl font-semibold text-morpheus-text">Tutor Not Found</h2>
                    <button onClick={() => navigate("/admin/tutors")} className="mt-4 text-morpheus-accent hover:underline flex items-center gap-2">
                        <ArrowLeft size={16} /> Back to Management
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const name = data.user?.name ?? data.name ?? "Tutor";
    const email = data.user?.email ?? data.email ?? "";
    const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const attempts = data.testAttempts || [];
    const documents = data.documents || [];

    const statusColors: Record<string, string> = {
        pending: "bg-amber-400/10 border-amber-400/20 text-amber-400",
        approved: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
        rejected: "bg-red-400/10 border-red-400/20 text-red-400",
        suspended: "bg-orange-400/10 border-orange-400/20 text-orange-400",
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header / Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/admin/tutors")}
                            className="w-10 h-10 rounded-xl border border-morpheus-border text-morpheus-muted hover:text-morpheus-text flex items-center justify-center transition-all bg-morpheus-surface"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-display text-2xl font-bold text-morpheus-text">{name}</h1>
                                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider", statusColors[data.status] ?? statusColors.pending)}>
                                    {data.status}
                                </span>
                            </div>
                            <p className="text-morpheus-muted text-sm mt-0.5">{email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {data.status === "pending" && (
                            <>
                                <button
                                    onClick={() => handleReview("rejected")}
                                    disabled={actionLoading}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={18} />}
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleReview("approved")}
                                    disabled={actionLoading}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                                    Approve
                                </button>
                            </>
                        )}
                        {data.status === "approved" && (
                            <button
                                onClick={() => handleReview("suspended")}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-orange-500/20 text-orange-400 text-sm font-bold hover:bg-orange-500/10 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={18} />}
                                Suspend Tutor
                            </button>
                        )}
                        {(data.status === "rejected" || data.status === "suspended") && (
                            <button
                                onClick={() => handleReview("approved")}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                                Re-approve
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column: Details & Subjects */}
                    <div className="xl:col-span-7 space-y-8">

                        {/* Core Profile */}
                        <div className="p-8 rounded-3xl bg-morpheus-surface border border-morpheus-border shadow-sm">
                            <h2 className="text-xs font-black text-morpheus-text uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <GraduationCap size={16} className="text-morpheus-accent" /> Professional Background
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
                                <div>
                                    <p className="text-[10px] text-morpheus-muted mb-2 uppercase tracking-widest font-bold">Education Level</p>
                                    <p className="text-base text-morpheus-text font-medium">{data.education || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-morpheus-muted mb-2 uppercase tracking-widest font-bold">Experience</p>
                                    <p className="text-base text-morpheus-text font-medium">{data.experienceYears ?? 0} Years Active</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-[10px] text-morpheus-muted mb-2 uppercase tracking-widest font-bold">Primary Institution & Qualification</p>
                                    <p className="text-lg text-morpheus-text font-bold leading-tight">{data.degreeName || "Not Specified"}</p>
                                    <p className="text-morpheus-muted mt-1">{data.collegeName || "Institution name not found"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-morpheus-muted mb-2 uppercase tracking-widest font-bold">Academic Performance</p>
                                    <p className="text-base text-morpheus-text font-medium">{data.marks || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-morpheus-muted mb-2 uppercase tracking-widest font-bold">Current Base Location</p>
                                    <p className="text-base text-morpheus-text font-medium flex items-center gap-2">
                                        <MapPin size={16} className="text-red-400" /> {data.city || "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div className="mt-12 pt-10 border-t border-morpheus-border">
                                <p className="text-[10px] text-morpheus-muted mb-4 uppercase tracking-widest font-bold">Verified Expertise</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {data.subjects?.map((sub: any, idx: number) => (
                                        <div key={idx} className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-morpheus-border bg-morpheus-bg/30 text-morpheus-text hover:border-morpheus-accent/50 transition-all">
                                            <span className="text-sm font-bold">{sub.name}</span>
                                            <span className="h-4 w-[1px] bg-morpheus-border" />
                                            <span className="text-xs text-morpheus-accent capitalize font-medium">{sub.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Test History */}
                        <div className="p-8 rounded-3xl bg-morpheus-surface border border-morpheus-border shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xs font-black text-morpheus-text uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History size={16} className="text-morpheus-accent" /> Competency Assessment
                                </h2>
                                <span className="text-xs px-3 py-1 rounded-full bg-morpheus-bg text-morpheus-muted font-bold">
                                    {attempts.length} Attempt{attempts.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {attempts.length > 0 ? (
                                <div className="space-y-4">
                                    {attempts.map((attempt: any, idx: number) => {
                                        const date = new Date(attempt.attemptedAt).toLocaleString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        });
                                        return (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-morpheus-border bg-morpheus-bg/20">
                                                <div>
                                                    <p className="text-sm font-bold text-morpheus-text">{date}</p>
                                                    <p className="text-xs text-morpheus-muted mt-0.5">Automated AI Evaluation</p>
                                                </div>
                                                <div className="flex items-center gap-6 text-right">
                                                    <div>
                                                        <p className="text-[10px] text-morpheus-muted uppercase font-bold mb-1">Score</p>
                                                        <p className={cn("text-lg font-black", attempt.passed ? "text-emerald-400" : "text-red-400")}>
                                                            {attempt.score}%
                                                        </p>
                                                    </div>
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10",
                                                        attempt.passed ? "bg-emerald-400 text-emerald-400" : "bg-red-400 text-red-400"
                                                    )}>
                                                        {attempt.passed ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 border border-dashed border-morpheus-border rounded-2xl flex flex-col items-center justify-center text-morpheus-muted">
                                    <ShieldOff size={32} className="mb-3 opacity-20" />
                                    <p className="text-sm italic">Assessment not yet initiated</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Media Preview */}
                    <div className="xl:col-span-5 space-y-8">

                        {/* Intro Video */}
                        <div className="p-8 rounded-3xl bg-morpheus-surface border border-morpheus-border shadow-sm">
                            <h2 className="text-xs font-black text-morpheus-text uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Video size={16} className="text-morpheus-accent" /> Introduction Video
                            </h2>
                            {data.introVideoUrl ? (
                                <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-morpheus-border group relative">
                                    <video
                                        src={data.introVideoUrl}
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-2xl border border-dashed border-morpheus-border flex flex-col items-center justify-center text-xs text-morpheus-muted italic bg-morpheus-bg/30">
                                    <Video size={32} className="mb-2 opacity-10" />
                                    No video submitted
                                </div>
                            )}
                        </div>

                        {/* Document Preview */}
                        <div className="p-8 rounded-3xl bg-morpheus-surface border border-morpheus-border shadow-sm">
                            <h2 className="text-xs font-black text-morpheus-text uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <ImageIcon size={16} className="text-morpheus-accent" /> Credentials Proof
                            </h2>
                            {data.collegeIdUrl ? (
                                <div className="space-y-4">
                                    <div className="relative group overflow-hidden rounded-2xl border border-morpheus-border bg-morpheus-bg/30">
                                        <img
                                            src={data.collegeIdUrl}
                                            alt="College ID"
                                            className="w-full h-auto max-h-80 object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a href={data.collegeIdUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-white text-black font-bold rounded-xl text-xs hover:bg-gray-100 transition-colors">
                                                Inspect Full Image
                                            </a>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-morpheus-muted text-center uppercase tracking-widest font-medium">Verify official Seal & Signature</p>
                                </div>
                            ) : (
                                <div className="h-60 rounded-2xl border border-dashed border-morpheus-border flex flex-col items-center justify-center text-xs text-morpheus-muted italic bg-morpheus-bg/30">
                                    <ImageIcon size={32} className="mb-2 opacity-10" />
                                    Verification document missing
                                </div>
                            )}
                        </div>

                        {/* Uploaded Documents */}
                        {documents.length > 0 && (
                            <div className="p-8 rounded-3xl bg-morpheus-surface border border-morpheus-border shadow-sm">
                                <h2 className="text-xs font-black text-morpheus-text uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <FileText size={16} className="text-morpheus-accent" /> Uploaded Documents
                                </h2>
                                <div className="space-y-3">
                                    {documents.map((doc: any) => (
                                        <a
                                            key={doc.id}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-2xl border border-morpheus-border bg-morpheus-bg/20 hover:border-morpheus-accent/40 transition-all group"
                                        >
                                            <FileText size={20} className="text-morpheus-muted group-hover:text-morpheus-accent transition-colors" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-morpheus-text truncate">{doc.name || doc.type || 'Document'}</p>
                                                <p className="text-xs text-morpheus-muted capitalize">{doc.type || 'file'}</p>
                                            </div>
                                            <ExternalLink size={14} className="text-morpheus-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Footer */}
                        {data.remarks && (
                            <div className="p-6 rounded-3xl bg-red-400/5 border border-red-400/10">
                                <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertCircle size={14} /> Critical History Note
                                </h3>
                                <p className="text-sm text-morpheus-text leading-relaxed italic">"{data.remarks}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
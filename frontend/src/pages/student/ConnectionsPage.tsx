import StudentLayout from "../../components/shared/StudentLayout";
import { Users } from "lucide-react";

export default function ConnectionsPage() {
    return (
        <StudentLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 rounded-2xl bg-morpheus-accent/10 border border-morpheus-accent/20 flex items-center justify-center mb-4">
                    <Users size={28} className="text-morpheus-accent" />
                </div>
                <h1 className="text-2xl font-display font-semibold text-morpheus-text mb-2">
                    Connections
                </h1>
                <p className="text-morpheus-muted max-w-md">
                    Your tutor connections will appear here. Start by discovering tutors
                    and sending connection requests.
                </p>
            </div>
        </StudentLayout>
    );
}

import { useTutorConnections } from "../../hooks/useTutor";
import ChatPage from "../ChatPage";     ///   ../ChatPage

import TutorLayout from "../../components/shared/TutorLayout";

export default function TutorChatPage() {
  const { pending } = useTutorConnections();

  return (
    <ChatPage
      Layout={TutorLayout}
      role="tutor"
      pendingCount={pending.length}
    />
  );
}

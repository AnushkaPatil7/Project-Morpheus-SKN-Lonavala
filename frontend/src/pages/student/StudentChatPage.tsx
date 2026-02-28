import ChatPage from "../ChatPage";
import StudentLayout from "../../components/shared/StudentLayout";

export default function StudentChatPage() {
  return (
    <ChatPage
      Layout={StudentLayout}
      role="student"
    />
  );
}

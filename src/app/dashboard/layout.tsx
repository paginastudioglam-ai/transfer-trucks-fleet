import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-60">
        <Header />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <ChatWidget />
    </div>
  );
}

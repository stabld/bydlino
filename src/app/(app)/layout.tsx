import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/shared/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg">
        <Header />
        <main className="mx-auto max-w-md px-5 pb-28 pt-5">{children}</main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}

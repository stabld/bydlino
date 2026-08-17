import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/shared/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg">
        <Sidebar />

        <div className="lg:pl-64">
          {/* Hlavička je jen pro mobil — na desktopu ji nahrazuje boční panel. */}
          <div className="lg:hidden">
            <Header />
          </div>

          <main className="mx-auto max-w-md px-5 pb-28 pt-5 lg:max-w-5xl lg:px-10 lg:pb-12 lg:pt-10">
            {children}
          </main>
        </div>

        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </ToastProvider>
  );
}

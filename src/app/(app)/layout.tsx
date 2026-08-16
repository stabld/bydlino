import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/shared/Toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let matchCount = 0;
  if (user) {
    const { count } = await supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
    matchCount = count ?? 0;
  }

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg">
        <Header matchCount={matchCount} />
        <main className="mx-auto max-w-md px-5 pb-28 pt-5">{children}</main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}

import { Suspense } from "react";
import { LoginForm } from "@/components/shared/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

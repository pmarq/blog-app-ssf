// app/verify-email/page.tsx
import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-4">Carregando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

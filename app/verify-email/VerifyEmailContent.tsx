// app/verify-email/VerifyEmailContent.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { applyActionCode, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode || mode !== "verifyEmail") {
        setMessage("Invalid or missing verification code.");
        return;
      }

      try {
        const auth = getAuth();
        await applyActionCode(auth, oobCode);
        setMessage("Email verified successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setMessage("Failed to verify email: " + error.message);
        } else {
          setMessage("Failed to verify email: An unknown error occurred.");
        }
      }
    };

    verifyEmail();
  }, [oobCode, mode, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        {message ? (
          <p className="text-xl font-semibold">{message}</p>
        ) : (
          <p className="text-xl font-semibold">Verifying your email...</p>
        )}
      </div>
    </div>
  );
}

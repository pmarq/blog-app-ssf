"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Button } from "../ui/button";

export default function ContinueWithGoogleButton() {
  const auth = useAuth();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await auth?.loginWithGoogle();
          router.refresh();
        } catch {}
      }}
      className="w-full"
    >
      Continue with Google
    </Button>
  );
}

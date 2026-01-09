"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { FcGoogle } from "react-icons/fc"; // Ícone do Google
import { Button } from "../ui/button";

export default function ContinueWithGoogleButton() {
  const auth = useAuth();
  const router = useRouter();

  return (
    <Button
      type="button"
      className="
        w-full flex items-center gap-2 font-semibold shadow 
        bg-[#4285F4] text-white 
        hover:bg-[#6ea2f7] 
        transition-colors
      "
      onClick={async () => {
        try {
          await auth?.loginWithGoogle();
          router.refresh();
        } catch {}
      }}
    >
      <FcGoogle size={22} />
      Continuar com Google
    </Button>
  );
}

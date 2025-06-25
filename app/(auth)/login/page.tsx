"use client";

import { Suspense } from "react";
import Login from "./Login"; // O seu componente de Login (o card inteiro)

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}

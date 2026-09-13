"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { LoginScreen } from "@/components/auth/LoginScreen";

export default function HomePage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);

  React.useEffect(() => {
    if (session?.kind === "STAFF") router.replace(session.user.role === "ASSOCIATE" ? "/dashboard" : "/dossiers");
    if (session?.kind === "CLIENT") router.replace("/extranet");
  }, [session, router]);

  if (session) return null;
  return <LoginScreen />;
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const initials = email
    .split("@")[0]
    .split(".")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-sidebar/80 px-8">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{email}</span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-brand/20 text-brand text-xs font-semibold">
            {initials || "TT"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

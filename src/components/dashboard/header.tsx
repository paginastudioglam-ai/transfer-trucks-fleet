"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-sidebar/80 px-8">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Carlos</span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-brand/20 text-brand text-xs font-semibold">
            TT
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

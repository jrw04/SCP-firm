import * as React from "react";
import { cn } from "@/lib/utils";
import type { User } from "@/types/database";

export function Avatar({ user, className, size = 32 }: { user: User; className?: string; size?: number }) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-medium text-white", className)}
      style={{ backgroundColor: user.color, width: size, height: size, fontSize: size * 0.38 }}
      title={user.name}
    >
      {user.initials}
    </div>
  );
}

"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function Avatar({
  handle,
  color,
  src,
  className,
}: {
  handle: string
  color: string
  src?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const initials = handle.replace("@", "").slice(0, 2).toUpperCase()

  if (src && !failed) {
    return (
      <img
        src={src || "/placeholder.svg"}
        alt={`${handle} avatar`}
        crossOrigin="anonymous"
        onError={() => setFailed(true)}
        className={cn(
          "size-10 shrink-0 rounded-full object-cover ring-1 ring-white/10",
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-1 ring-white/10",
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials}
    </div>
  )
}

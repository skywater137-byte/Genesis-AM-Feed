"use client"

import { useState } from "react"

export function Avatar({
  handle,
  color,
  src,
}: {
  handle: string
  color: string
  src?: string
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
        className="size-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
      />
    )
  }

  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-1 ring-white/10"
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials}
    </div>
  )
}

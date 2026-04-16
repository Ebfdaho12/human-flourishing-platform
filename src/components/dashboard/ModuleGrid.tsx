"use client"
import { MODULES } from "@/lib/constants"
import { ModuleCard } from "./ModuleCard"

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {MODULES.map((mod) => (
        <ModuleCard key={mod.id} module={mod} />
      ))}
    </div>
  )
}

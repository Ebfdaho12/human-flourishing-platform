"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { CheckCircle, Star, Flame, Zap, Heart, Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Toast Notification System — Makes actions feel rewarding
 *
 * Shows brief, satisfying notifications when users:
 * - Complete a habit ✓
 * - Log health data
 * - Hit a streak milestone
 * - Earn XP
 * - Level up
 * - Complete a quest
 *
 * Usage:
 *   const { toast } = useToast()
 *   toast({ message: "Habit completed!", type: "success", xp: 5 })
 */

interface Toast {
  id: string
  message: string
  type: "success" | "xp" | "streak" | "level" | "milestone" | "info"
  xp?: number
  duration?: number
}

interface ToastContextType {
  toast: (t: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const ICONS: Record<string, any> = {
  success: CheckCircle,
  xp: Zap,
  streak: Flame,
  level: Star,
  milestone: Trophy,
  info: Heart,
}

const COLORS: Record<string, string> = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-800",
  xp: "border-amber-300 bg-amber-50 text-amber-800",
  streak: "border-orange-300 bg-orange-50 text-orange-800",
  level: "border-violet-300 bg-violet-50 text-violet-800",
  milestone: "border-yellow-300 bg-yellow-50 text-yellow-800",
  info: "border-blue-300 bg-blue-50 text-blue-800",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { ...t, id }])

    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, t.duration || 3000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || CheckCircle
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 shadow-lg pointer-events-auto animate-in slide-in-from-right fade-in duration-300",
                COLORS[t.type]
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{t.message}</p>
              </div>
              {t.xp && (
                <span className="text-xs font-bold bg-white/80 rounded-full px-2 py-0.5 shrink-0">
                  +{t.xp} XP
                </span>
              )}
              <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

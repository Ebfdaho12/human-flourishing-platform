"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found.")
      return
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStatus("success")
          setTimeout(() => router.push("/dashboard"), 2500)
        } else {
          setStatus("error")
          setMessage(data.error ?? "Verification failed.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      })
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 p-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-300">Verifying your email…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Email verified!</h1>
            <p className="text-slate-400 text-sm">Redirecting you to your dashboard…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Verification failed</h1>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CLAIM_TYPES } from "@/lib/claims"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditProfilePage() {
  const router = useRouter()
  const [claimType, setClaimType] = useState<string>(CLAIM_TYPES[0].value)
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const res = await fetch("/api/user/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimType, value }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? "Failed to save claim")
    } else {
      setSuccess("Claim saved successfully")
      setValue("")
    }
  }

  const selectedType = CLAIM_TYPES.find((t) => t.value === claimType)

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Add Identity Claim</h1>
          <p className="text-sm text-muted-foreground">Build your Merkle-tree identity</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Claim</CardTitle>
          <CardDescription>
            Claims are encrypted at rest and stored as leaves in your identity Merkle tree.
            Values are never transmitted to any service in plaintext.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-400">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label>Claim type</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
              >
                {CLAIM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">{selectedType?.label ?? "Value"}</Label>
              <Input
                id="value"
                type={claimType === "DATE_OF_BIRTH" ? "date" : "text"}
                placeholder={`Enter your ${selectedType?.label?.toLowerCase() ?? "value"}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Your claim value will be encrypted using a key derived from your session.
              The server stores only the encrypted value and its SHA-256 hash.
            </p>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save claim"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}

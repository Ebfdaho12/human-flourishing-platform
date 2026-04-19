"use client"

import { useState } from "react"
import useSWR from "swr"
import { FileText, Printer, Heart, Brain, Target, Sparkles, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HealthReportPage() {
  const [days, setDays] = useState("30")
  const { data } = useSWR(`/api/report?days=${days}`, fetcher)

  if (!data) return <div className="p-8 text-center text-muted-foreground">Generating report...</div>

  const { report, vitals, entries, mood, goals, insights } = data

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Health Report</h1>
          </div>
          <p className="text-sm text-muted-foreground">Print-friendly summary for your doctor or personal records</p>
        </div>
        <div className="flex gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">{report.disclaimer}</p>
        </CardContent>
      </Card>

      {/* Report header */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Patient:</span> <strong>{report.patientName}</strong></div>
            <div><span className="text-muted-foreground">Period:</span> <strong>{report.periodDays} days</strong></div>
            <div><span className="text-muted-foreground">Generated:</span> <strong>{new Date(report.generatedAt).toLocaleDateString()}</strong></div>
            <div><span className="text-muted-foreground">Total entries:</span> <strong>{entries.total}</strong></div>
          </div>
        </CardContent>
      </Card>

      {/* Vitals summary */}
      {vitals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" /> Vitals Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Metric</th>
                    <th className="pb-2 pr-4">Readings</th>
                    <th className="pb-2 pr-4">Latest</th>
                    <th className="pb-2 pr-4">Average</th>
                    <th className="pb-2 pr-4">Min</th>
                    <th className="pb-2">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((v: any) => (
                    <tr key={v.metric} className="border-b border-border/30">
                      <td className="py-2 pr-4 font-medium capitalize">{v.metric.replace(/([A-Z])/g, " $1").trim()}</td>
                      <td className="py-2 pr-4">{v.readings}</td>
                      <td className="py-2 pr-4 font-bold">{v.latest}</td>
                      <td className="py-2 pr-4">{v.average}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{v.min}</td>
                      <td className="py-2 text-muted-foreground">{v.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entry breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Entry Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(entries.byType as Record<string, number>).map(([type, count]) => (
              <div key={type} className="text-center p-2 rounded-lg border border-border/50">
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{type.toLowerCase()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood summary */}
      {mood.checkIns > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-pink-500" /> Mental Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-xs text-muted-foreground">Check-ins</p><p className="text-xl font-bold">{mood.checkIns}</p></div>
              <div><p className="text-xs text-muted-foreground">Average Mood</p><p className="text-xl font-bold">{mood.average}/10</p></div>
            </div>
            {mood.topEmotions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Most frequent emotions:</p>
                <div className="flex flex-wrap gap-2">
                  {mood.topEmotions.map((e: any) => (
                    <span key={e.emotion} className="rounded-full bg-pink-100 text-pink-700 px-2.5 py-1 text-xs">
                      {e.emotion} ({e.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" /> Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {goals.map((g: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{g.title}</p>
                    <p className="text-xs text-muted-foreground">Target: {g.target.value} {g.target.unit}</p>
                  </div>
                  {g.deadline && <span className="text-xs text-muted-foreground">Due: {new Date(g.deadline).toLocaleDateString()}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" /> AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((i: any, idx: number) => (
                <div key={idx} className="text-sm text-muted-foreground leading-relaxed border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <p>{i.content}</p>
                  <p className="text-xs mt-1">{new Date(i.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-center text-muted-foreground print:block">
        Generated by Human Flourishing Platform · {new Date().toLocaleDateString()} · Self-reported data — not a medical diagnosis
      </p>
    </div>
  )
}

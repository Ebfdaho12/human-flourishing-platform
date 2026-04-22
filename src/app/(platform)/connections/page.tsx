"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Network, ZoomIn, ZoomOut, Maximize2, Filter, Download, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Network Graph Visualization — Shows interconnections between entities
 *
 * Uses pure Canvas rendering (no external dependency) for a force-directed graph.
 * Shows how people, organizations, money, and events are connected.
 */

interface GraphNode {
  id: string
  label: string
  type: "person" | "organization" | "event" | "money" | "document" | "policy"
  x: number
  y: number
  vx: number
  vy: number
  connections: number
  detail?: string
}

interface GraphEdge {
  source: string
  target: string
  label: string
  type: "funding" | "employment" | "lobbying" | "family" | "event" | "policy" | "ownership"
  strength: number // 1-10
}

const NODE_COLORS: Record<string, string> = {
  person: "#8b5cf6",
  organization: "#3b82f6",
  event: "#f59e0b",
  money: "#10b981",
  document: "#ef4444",
  policy: "#6366f1",
}

// Sample data demonstrating the interconnections concept
const SAMPLE_NODES: GraphNode[] = [
  { id: "trudeau", label: "Justin Trudeau", type: "person", x: 400, y: 250, vx: 0, vy: 0, connections: 8, detail: "23rd PM of Canada (2015-present)" },
  { id: "carney", label: "Mark Carney", type: "person", x: 300, y: 150, vx: 0, vy: 0, connections: 6, detail: "Former Bank of Canada & Bank of England Governor" },
  { id: "freeland", label: "Chrystia Freeland", type: "person", x: 500, y: 150, vx: 0, vy: 0, connections: 5, detail: "Former Deputy PM & Finance Minister" },
  { id: "poilievre", label: "Pierre Poilievre", type: "person", x: 550, y: 350, vx: 0, vy: 0, connections: 4, detail: "Conservative Party Leader" },
  { id: "liberal", label: "Liberal Party", type: "organization", x: 350, y: 350, vx: 0, vy: 0, connections: 5, detail: "Governing party since 2015" },
  { id: "conservative", label: "Conservative Party", type: "organization", x: 600, y: 250, vx: 0, vy: 0, connections: 3, detail: "Official Opposition" },
  { id: "boc", label: "Bank of Canada", type: "organization", x: 200, y: 250, vx: 0, vy: 0, connections: 4, detail: "Central bank — sets monetary policy" },
  { id: "wef", label: "World Economic Forum", type: "organization", x: 250, y: 400, vx: 0, vy: 0, connections: 3, detail: "Davos — annual meeting of global elites" },
  { id: "snc", label: "SNC-Lavalin Affair", type: "event", x: 450, y: 450, vx: 0, vy: 0, connections: 3, detail: "2019 scandal — PMO pressure on AG" },
  { id: "housing", label: "Housing Crisis", type: "policy", x: 150, y: 350, vx: 0, vy: 0, connections: 4, detail: "3.5M unit deficit, avg home $700K+" },
  { id: "carbon_tax", label: "Carbon Tax", type: "policy", x: 500, y: 50, vx: 0, vy: 0, connections: 3, detail: "$80/tonne, rising to $170 by 2030" },
  { id: "arrivecan", label: "ArriveCAN", type: "event", x: 100, y: 150, vx: 0, vy: 0, connections: 2, detail: "$59.5M app — Auditor General flagged" },
  { id: "mckinsey", label: "McKinsey & Co", type: "organization", x: 150, y: 50, vx: 0, vy: 0, connections: 3, detail: "$100M+ in federal consulting contracts" },
]

const SAMPLE_EDGES: GraphEdge[] = [
  { source: "trudeau", target: "liberal", label: "Leader", type: "employment", strength: 10 },
  { source: "trudeau", target: "wef", label: "Young Global Leader", type: "event", strength: 5 },
  { source: "trudeau", target: "snc", label: "Implicated", type: "event", strength: 8 },
  { source: "trudeau", target: "carbon_tax", label: "Championed", type: "policy", strength: 7 },
  { source: "trudeau", target: "housing", label: "Oversaw crisis", type: "policy", strength: 6 },
  { source: "carney", target: "boc", label: "Former Governor", type: "employment", strength: 9 },
  { source: "carney", target: "liberal", label: "Advisor / PM candidate", type: "employment", strength: 7 },
  { source: "carney", target: "wef", label: "Board of Trustees", type: "employment", strength: 6 },
  { source: "freeland", target: "liberal", label: "Deputy PM", type: "employment", strength: 9 },
  { source: "freeland", target: "wef", label: "Board of Trustees", type: "employment", strength: 6 },
  { source: "freeland", target: "carbon_tax", label: "Implemented", type: "policy", strength: 7 },
  { source: "poilievre", target: "conservative", label: "Leader", type: "employment", strength: 10 },
  { source: "poilievre", target: "carbon_tax", label: "Opposes — 'Axe the Tax'", type: "policy", strength: 8 },
  { source: "poilievre", target: "housing", label: "Blames Liberal policy", type: "policy", strength: 6 },
  { source: "boc", target: "housing", label: "Low rates → bubble", type: "policy", strength: 7 },
  { source: "mckinsey", target: "trudeau", label: "$100M+ contracts", type: "funding", strength: 7 },
  { source: "mckinsey", target: "arrivecan", label: "Consulting role", type: "funding", strength: 5 },
  { source: "liberal", target: "arrivecan", label: "Government oversight", type: "event", strength: 4 },
]

export default function ConnectionsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<GraphNode[]>(SAMPLE_NODES)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const animRef = useRef<number>(0)

  // Simple force simulation
  const simulate = useCallback(() => {
    const updated = nodes.map(node => {
      let fx = 0, fy = 0

      // Repulsion between all nodes
      nodes.forEach(other => {
        if (other.id === node.id) return
        const dx = node.x - other.x
        const dy = node.y - other.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = 2000 / (dist * dist)
        fx += (dx / dist) * force
        fy += (dy / dist) * force
      })

      // Attraction along edges
      SAMPLE_EDGES.forEach(edge => {
        let otherId: string | null = null
        if (edge.source === node.id) otherId = edge.target
        if (edge.target === node.id) otherId = edge.source
        if (!otherId) return
        const other = nodes.find(n => n.id === otherId)
        if (!other) return
        const dx = other.x - node.x
        const dy = other.y - node.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        fx += dx * 0.01 * edge.strength
        fy += dy * 0.01 * edge.strength
      })

      // Center gravity
      fx += (400 - node.x) * 0.002
      fy += (250 - node.y) * 0.002

      const nvx = (node.vx + fx) * 0.8
      const nvy = (node.vy + fy) * 0.8

      return { ...node, x: node.x + nvx, y: node.y + nvy, vx: nvx, vy: nvy }
    })
    setNodes(updated)
  }, [nodes])

  // Animation loop
  useEffect(() => {
    let frameCount = 0
    function tick() {
      if (frameCount < 200) { simulate(); frameCount++ }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, []) // Only run once on mount

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width = canvas.offsetWidth * 2
    const h = canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    // Clear
    ctx.fillStyle = "#fafaf9"
    ctx.fillRect(0, 0, w / 2, h / 2)

    const cw = w / 2, ch = h / 2

    // Draw edges
    SAMPLE_EDGES.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source)
      const target = nodes.find(n => n.id === edge.target)
      if (!source || !target) return

      const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target || selectedNode?.id === edge.source || selectedNode?.id === edge.target

      ctx.beginPath()
      ctx.moveTo(source.x * zoom, source.y * zoom)
      ctx.lineTo(target.x * zoom, target.y * zoom)
      ctx.strokeStyle = isHighlighted ? "#8b5cf6" : "#e2e8f0"
      ctx.lineWidth = isHighlighted ? 2 : 1
      ctx.stroke()

      // Edge label
      if (isHighlighted) {
        const mx = (source.x + target.x) / 2 * zoom
        const my = (source.y + target.y) / 2 * zoom
        ctx.font = "9px system-ui"
        ctx.fillStyle = "#6b7280"
        ctx.textAlign = "center"
        ctx.fillText(edge.label, mx, my - 4)
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      const x = node.x * zoom
      const y = node.y * zoom
      const isHighlighted = hoveredNode === node.id || selectedNode?.id === node.id
      const radius = isHighlighted ? 14 : 10 + Math.min(node.connections, 8)

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = NODE_COLORS[node.type] || "#6b7280"
      ctx.globalAlpha = isHighlighted ? 1 : 0.8
      ctx.fill()
      ctx.globalAlpha = 1

      if (isHighlighted) {
        ctx.strokeStyle = "#1e1b4b"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Label
      ctx.font = isHighlighted ? "bold 11px system-ui" : "10px system-ui"
      ctx.fillStyle = "#1f2937"
      ctx.textAlign = "center"
      ctx.fillText(node.label, x, y + radius + 12)
    })
  }, [nodes, hoveredNode, selectedNode, zoom])

  // Handle canvas clicks
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const clicked = nodes.find(n => {
      const dx = n.x - x / zoom * zoom
      const dy = n.y - y / zoom * zoom
      return Math.sqrt(dx * dx + dy * dy) < 20
    })
    setSelectedNode(clicked || null)
  }

  function handleCanvasMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = nodes.find(n => {
      const dx = n.x * zoom - x
      const dy = n.y * zoom - y
      return Math.sqrt(dx * dx + dy * dy) < 20
    })
    setHoveredNode(hovered?.id || null)
  }

  const connectedEdges = selectedNode ? SAMPLE_EDGES.filter(e => e.source === selectedNode.id || e.target === selectedNode.id) : []

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700">
            <Network className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Connection Map</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Visualize how people, organizations, money, events, and policies interconnect. Click any node to see its connections.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/10">
        <CardContent className="p-3">
          <p className="text-[10px] text-muted-foreground">
            <strong>Sample data shown.</strong> This visualization will populate with real data from Aletheia as the database fills. Every node and edge will link to sourced evidence. Currently showing Canadian political connections as a demonstration.
          </p>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.2))}><ZoomIn className="h-3.5 w-3.5" /></Button>
        <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}><ZoomOut className="h-3.5 w-3.5" /></Button>
        <Button variant="outline" size="sm" onClick={() => setZoom(1)}><Maximize2 className="h-3.5 w-3.5" /></Button>
        <div className="flex gap-1 ml-auto">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <button key={type} onClick={() => setFilter(filter === type ? null : type)} className={cn("flex items-center gap-1 px-2 py-1 rounded text-[9px] border", filter === type ? "ring-1 ring-violet-400" : "")}>
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ height: 500 }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
          />
        </CardContent>
      </Card>

      {/* Selected node detail */}
      {selectedNode && (
        <Card className="border-2 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: NODE_COLORS[selectedNode.type] }} />
              <p className="text-sm font-bold">{selectedNode.label}</p>
              <Badge variant="outline" className="text-[8px]">{selectedNode.type}</Badge>
              <Badge variant="outline" className="text-[8px]">{selectedNode.connections} connections</Badge>
            </div>
            {selectedNode.detail && <p className="text-xs text-muted-foreground mb-3">{selectedNode.detail}</p>}

            <p className="text-[10px] font-semibold mb-1">Connections:</p>
            <div className="space-y-1">
              {connectedEdges.map((edge, i) => {
                const otherId = edge.source === selectedNode.id ? edge.target : edge.source
                const other = nodes.find(n => n.id === otherId)
                return (
                  <div key={i} className="flex items-center gap-2 text-[10px] rounded border p-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: NODE_COLORS[other?.type || "person"] }} />
                    <span className="font-medium">{other?.label}</span>
                    <span className="text-muted-foreground">— {edge.label}</span>
                    <Badge variant="outline" className="text-[7px] ml-auto">{edge.type}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 bg-slate-50/10">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Info className="h-4 w-4" /> How This Works</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>Nodes</strong> = entities (people, organizations, events, policies, money flows, documents)</p>
            <p><strong>Edges</strong> = connections between entities (funding, employment, lobbying, family, policy involvement)</p>
            <p><strong>Click</strong> any node to see all its connections with labels</p>
            <p><strong>Hover</strong> to highlight connections</p>
            <p><strong>Vision:</strong> As Aletheia's database fills with real data, this graph will show the actual web of connections between politicians, corporations, lobbyists, and events — all sourced, all verifiable. Follow any thread. See who connects to whom. Follow the money.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/investigate" className="text-sm text-slate-600 hover:underline">Investigate</a>
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Analysis</a>
        <a href="/climate-data" className="text-sm text-green-600 hover:underline">Climate Data</a>
        <a href="/world-data" className="text-sm text-blue-600 hover:underline">World Data</a>
        <a href="/research-compiler" className="text-sm text-violet-600 hover:underline">Research Compiler</a>
      </div>
    </div>
  )
}

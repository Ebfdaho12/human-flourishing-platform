"use client"

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import { cn } from "@/lib/utils"
import "leaflet/dist/leaflet.css"

interface Country {
  name: string
  code: string
  lat: number
  lng: number
  [key: string]: any
}

interface MetricInfo {
  key: string
  label: string
  unit: string
  higherIsBetter: boolean
}

interface MapViewProps {
  countries: Country[]
  selectedMetric: string
  metric: MetricInfo
  onSelectCountry: (code: string | null) => void
  selectedCountry: string | null
}

function getColor(value: number, min: number, max: number, higherIsBetter: boolean): string {
  const range = max - min || 1
  let ratio = (value - min) / range
  if (!higherIsBetter) ratio = 1 - ratio

  // Green (good) to Red (bad)
  if (ratio >= 0.75) return "#22c55e"
  if (ratio >= 0.5) return "#84cc16"
  if (ratio >= 0.25) return "#f59e0b"
  return "#ef4444"
}

function getRadius(value: number, max: number): number {
  return Math.max(6, Math.min(25, (value / max) * 25))
}

export default function MapView({ countries, selectedMetric, metric, onSelectCountry, selectedCountry }: MapViewProps) {
  const values = countries.map(c => c[selectedMetric] as number)
  const min = Math.min(...values)
  const max = Math.max(...values)

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={6}
      style={{ height: 400, width: "100%" }}
      scrollWheelZoom={true}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {countries.map(country => {
        const value = country[selectedMetric] as number
        const color = getColor(value, min, max, metric.higherIsBetter)
        const radius = getRadius(value, max)
        const isSelected = selectedCountry === country.code

        return (
          <CircleMarker
            key={country.code}
            center={[country.lat, country.lng]}
            radius={isSelected ? radius + 4 : radius}
            fillColor={color}
            color={isSelected ? "#6366f1" : color}
            weight={isSelected ? 3 : 1.5}
            opacity={0.9}
            fillOpacity={0.7}
            eventHandlers={{
              click: () => onSelectCountry(isSelected ? null : country.code),
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{country.name}</p>
                <p>{metric.label}: <strong>{value > 1000 ? value.toLocaleString() : value}</strong> {metric.unit}</p>
                <p className="text-muted-foreground">Pop: {country.population}M</p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}

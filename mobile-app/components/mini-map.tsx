"use client"

import { MapPin } from "lucide-react"

interface MiniMapProps {
  location: { lat: number; lng: number } | null
}

export function MiniMap({ location }: MiniMapProps) {
  // In a real app, you would use a proper map library
  // This is a simplified mock implementation

  return (
    <div className="relative w-full h-full bg-muted">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=600&text=Map')] bg-cover bg-center" />

      {/* Location Marker */}
      {location && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="p-1 rounded-full bg-primary animate-pulse">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  )
}


"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Layers, MapPin, Navigation, Plus, Minus, Compass } from "lucide-react"
import { mockIssueData } from "@/lib/mock-data"

interface MapViewProps {
  onLoad?: () => void
}

export function MapView({ onLoad }: MapViewProps) {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(14)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // In a real app, you would use a proper map library like Mapbox, Google Maps, or Leaflet
  // This is a simplified mock implementation

  useEffect(() => {
    // Simulate getting user's location and loading map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })

          // Simulate map loading
          setTimeout(() => {
            setIsLoading(false)
            if (onLoad) onLoad()
          }, 1000)
        },
        () => {
          // Default location if user denies permission
          setUserLocation({ lat: 37.7749, lng: -122.4194 })

          // Simulate map loading
          setTimeout(() => {
            setIsLoading(false)
            if (onLoad) onLoad()
          }, 1000)
        },
      )
    } else {
      // Default location if geolocation not supported
      setUserLocation({ lat: 37.7749, lng: -122.4194 })

      // Simulate map loading
      setTimeout(() => {
        setIsLoading(false)
        if (onLoad) onLoad()
      }, 1000)
    }
  }, [onLoad])

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 20))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 1))
  }

  const handleMarkerClick = (issueId: string) => {
    router.push(`/issues/${issueId}`)
  }

  const handleRecenter = () => {
    if (userLocation) {
      // In a real app, this would recenter the map on the user's location
      setUserLocation({ ...userLocation })
    }
  }

  return (
    <div className="relative w-full h-full bg-muted" ref={mapRef}>
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1000&width=1000&text=Map')] bg-cover bg-center" />

      {/* Map Controls */}
      <div className="absolute bottom-20 right-4 flex flex-col space-y-2">
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg">
          <Layers className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg" onClick={handleZoomIn}>
          <Plus className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg" onClick={handleZoomOut}>
          <Minus className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg" onClick={handleRecenter}>
          <Navigation className="h-5 w-5" />
        </Button>
      </div>

      {/* User Location Marker */}
      {userLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="relative h-4 w-4 bg-primary rounded-full border-2 border-white"></div>
          </div>
        </div>
      )}

      {/* Mock Issue Markers */}
      <div className="absolute inset-0">
        {mockIssueData.map((issue) => (
          <button
            key={issue.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group`}
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`,
            }}
            onClick={() => handleMarkerClick(issue.id)}
          >
            <div
              className={`
              p-1 rounded-full shadow-md
              ${issue.type === "scenic" ? "bg-green-500" : issue.type === "condition" ? "bg-red-500" : "bg-blue-500"}
              group-hover:scale-110 transition-transform
            `}
            >
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-background/95 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium shadow-lg transition-opacity whitespace-nowrap">
              {issue.title}
            </div>
          </button>
        ))}
      </div>

      {/* Compass */}
      <div className="absolute top-4 right-4">
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
          <Compass className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}


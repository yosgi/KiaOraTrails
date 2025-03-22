"use client"

import { MapPin } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"

interface MiniMapProps {
  location: { lat: number; lng: number } | null
}

export function MiniMap({ location }: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  // 加载谷歌地图 API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key is missing")
      return
    }

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"]
    })

    loader.load()
      .then(() => {
        setMapLoaded(true)
      })
      .catch(err => {
        console.error("Error loading Google Maps API:", err)
      })
  }, [])

  // 初始化地图
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const defaultLocation = { lat: 37.7749, lng: -122.4194 } // 默认位置：旧金山
    const initialLocation = location || defaultLocation

    const mapOptions: google.maps.MapOptions = {
      center: initialLocation,
      zoom: 17, // 稍微放大一点以便更好地查看卫星图像
      mapTypeId: google.maps.MapTypeId.HYBRID, // 使用混合视图 (卫星 + 道路标签)
      disableDefaultUI: false, // 启用默认UI
      zoomControl: true, // 启用缩放控制
      streetViewControl: false,
      mapTypeControl: true, // 允许用户切换地图类型
      fullscreenControl: true,
      styles: []
    }

    const newMap = new google.maps.Map(mapRef.current, mapOptions)
    setMap(newMap)

    // 创建标记
    if (location) {
      const newMarker = new google.maps.Marker({
        position: location,
        map: newMap,
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#22c55e", // 使用主题的 primary 颜色
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
          scale: 10
        }
      })
      setMarker(newMarker)
    }
  }, [mapLoaded, location])

  // 更新标记位置
  useEffect(() => {
    if (!map || !location) return

    // 更新地图中心
    map.setCenter(location)

    // 更新或创建标记
    if (marker) {
      marker.setPosition(location)
    } else {
      const newMarker = new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#22c55e", // 使用主题的 primary 颜色
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
          scale: 10
        }
      })
      setMarker(newMarker)
    }
  }, [map, location, marker])

  return (
    <div className="relative w-full h-full bg-muted">
      {/* 谷歌地图容器 */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* 加载中状态 */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* 备用标记 (当谷歌地图加载失败时) */}
      {!mapLoaded && location && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="p-1 rounded-full bg-primary animate-pulse">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  )
}


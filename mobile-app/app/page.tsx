"use client"

import { useState, useEffect } from "react"
import { MapView } from "@/components/map-view"
import { IssueList } from "@/components/issue-list"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {Plus, List, X, Compass} from "lucide-react"
import Link from "next/link"
import { useMobile } from "@/hooks/use-mobile"
import DigitalTwins from "../app/digitaltwin/page"
import {usePrivy} from '@privy-io/react-auth';

export default function Home() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { isMobile } = useMobile()
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
        <div className="relative h-[100dvh] w-full bg-background">
          {/* Map View */}
          <div  className="relative w-full h-full bg-muted" >
            <DigitalTwins />
          </div>
          
          {/* <MapView onLoad={() => setIsMapLoaded(true)}/> */}
          {/* Loading Indicator */}
          {!isMapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
                <div className="flex flex-col items-center">
                  <div
                      className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading map...</p>
                </div>
              </div>
          )}

          {/* Issues Sheet */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                  size="icon"
                  className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm text-black"
              >
                <List className="h-5 w-5"/>
                <span className="sr-only">Open Issues</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:max-w-md p-0 border-r">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Nearby Issues</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)}>
                  <X className="h-5 w-5"/>
                </Button>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-65px)]">
                <IssueList onSelect={() => setIsSheetOpen(false)}/>
              </div>
            </SheetContent>
          </Sheet>

          {/* Add New Issue Button */}
          <Link href="/report">
            <Button size="icon" className="absolute bottom-20 right-4 z-10 h-14 w-14 rounded-full shadow-lg">
              <Plus className="h-6 w-6"/>
              <span className="sr-only">Add New Issue</span>
            </Button>
          </Link>
        </div>
  )
}


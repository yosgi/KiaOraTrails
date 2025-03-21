"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Camera, MapPin, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MiniMap } from "@/components/mini-map"
import { cn } from "@/lib/utils"

export default function ReportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [issueType, setIssueType] = useState<string>("scenic")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "0.1",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Report submitted successfully!",
      description: "Your trail report has been submitted and you've earned 5 TRL tokens.",
    })

    router.push("/")
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          toast({
            title: "Location detected",
            description: "Your current location has been set.",
          })
        },
        () => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please try again or set manually.",
            variant: "destructive",
          })
        },
      )
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setPhotos((prev) => [...prev, ...newPhotos])
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.back()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={prevStep}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Report Trail Issue</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              1
            </div>
            <div className={cn("w-16 h-1 rounded", step >= 2 ? "bg-primary" : "bg-muted")}></div>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              2
            </div>
            <div className={cn("w-16 h-1 rounded", step >= 3 ? "bg-primary" : "bg-muted")}></div>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              3
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="issue-type">What are you reporting?</Label>
              <RadioGroup
                defaultValue="scenic"
                value={issueType}
                onValueChange={setIssueType}
                className="grid grid-cols-1 gap-3"
              >
                <Card
                  className={cn(
                    "flex items-center space-x-2 p-4 cursor-pointer transition-colors",
                    issueType === "scenic" ? "border-primary bg-primary/5" : "",
                  )}
                >
                  <RadioGroupItem value="scenic" id="scenic" />
                  <Label htmlFor="scenic" className="flex-1 cursor-pointer">
                    <div className="font-medium">Scenic Spot</div>
                    <div className="text-sm text-muted-foreground">Share a beautiful view or interesting location</div>
                  </Label>
                </Card>
                <Card
                  className={cn(
                    "flex items-center space-x-2 p-4 cursor-pointer transition-colors",
                    issueType === "condition" ? "border-primary bg-primary/5" : "",
                  )}
                >
                  <RadioGroupItem value="condition" id="condition" />
                  <Label htmlFor="condition" className="flex-1 cursor-pointer">
                    <div className="font-medium">Trail Condition</div>
                    <div className="text-sm text-muted-foreground">Report obstacles, damage, or safety concerns</div>
                  </Label>
                </Card>
                <Card
                  className={cn(
                    "flex items-center space-x-2 p-4 cursor-pointer transition-colors",
                    issueType === "fundraising" ? "border-primary bg-primary/5" : "",
                  )}
                >
                  <RadioGroupItem value="fundraising" id="fundraising" />
                  <Label htmlFor="fundraising" className="flex-1 cursor-pointer">
                    <div className="font-medium">Fundraising Request</div>
                    <div className="text-sm text-muted-foreground">Request community funds for trail improvements</div>
                  </Label>
                </Card>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide details about the trail condition, scenic spot, or fundraising need"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Location</Label>
                <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use Current Location
                </Button>
              </div>
              <div className="h-64 w-full rounded-md overflow-hidden border">
                <MiniMap location={location} />
              </div>
              <p className="text-sm text-muted-foreground">
                {location ? "Location set successfully" : "Tap the button above to set your current location"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Add Photos</Label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden border">
                    <img src={photo || "/placeholder.svg"} alt="Uploaded" className="w-full h-full object-cover" />
                  </div>
                ))}
                <button
                  onClick={triggerFileInput}
                  className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center"
                >
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}

        {step === 3 && issueType === "fundraising" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Fundraising Goal (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                Set a reasonable goal for your project. The community will vote on your request.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Project Timeline</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="text-sm">
                    Start Date
                  </Label>
                  <Input id="start-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-sm">
                    End Date
                  </Label>
                  <Input id="end-date" type="date" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Project Details</Label>
              <Card className="p-4 bg-muted/50">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Type:</span>
                    <span className="text-sm font-medium">Fundraising</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Title:</span>
                    <span className="text-sm font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Goal:</span>
                    <span className="text-sm font-medium">{formData.amount} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Photos:</span>
                    <span className="text-sm font-medium">{photos.length} added</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {step === 3 && issueType !== "fundraising" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Review Your Report</Label>
              <Card className="p-4 bg-muted/50">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Type:</span>
                    <span className="text-sm font-medium">
                      {issueType === "scenic" ? "Scenic Spot" : "Trail Condition"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Title:</span>
                    <span className="text-sm font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Location:</span>
                    <span className="text-sm font-medium">{location ? "Set" : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Photos:</span>
                    <span className="text-sm font-medium">{photos.length} added</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-md overflow-hidden">
                <div className="p-3 border-b bg-muted/30">
                  <h3 className="font-medium">{formData.title}</h3>
                  <p className="text-xs text-muted-foreground">Just now • Your location</p>
                </div>
                {photos.length > 0 ? (
                  <div className="aspect-video bg-muted">
                    <img src={photos[0] || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm line-clamp-2">{formData.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <Button onClick={nextStep} className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : step < 3 ? "Continue" : "Submit Report"}
        </Button>
      </div>
    </div>
  )
}


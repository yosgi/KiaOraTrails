"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Camera, MapPin, ImageIcon, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MiniMap } from "@/components/mini-map"
import { cn } from "@/lib/utils"
import { usePrivy } from '@privy-io/react-auth'
import S3 from 'react-aws-s3';


export default function ReportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { authenticated } = usePrivy()
  const [issueType, setIssueType] = useState<string>("scenic")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "10",
  })

  // 检查用户是否已登录
  useEffect(() => {
    if (!authenticated) {
      toast({
        title: "Login required",
        description: "Please login to report trail issues",
        variant: "destructive",
      })
      router.push("/profile")
    }
  }, [authenticated, router, toast])

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

  // 上传图片到 AWS S3
  const uploadToS3 = async (file: File) : Promise<any> => {
    try {

      const config = {
          bucketName: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
          dirName: 'img', /* optional */
          region: process.env.NEXT_PUBLIC_AWS_REGION,
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
      }

      const ReactS3Client = new S3(config);
/*  Notice that if you don't provide a dirName, the file will be automatically uploaded to the root of your bucket */

/* This is optional */
      const newFileName = 'test-file';

      ReactS3Client
          .uploadFile(file, newFileName)
          .then((data:any) =>{
            const url = data?.Location
            console.log(url)
          } )
          .catch(err => console.error(err))
          } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
          }
        };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingPhotos(true);
      try {
        const uploadPromises = Array.from(e.target.files).map(async (file) => {
          const s3Url = await uploadToS3(file);
          return s3Url;
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);
        setPhotos((prev) => [...prev, ...uploadedUrls]);
        
        toast({
          title: "Photos uploaded",
          description: `Successfully uploaded ${uploadedUrls.length} photos`,
        });
      } catch (error) {
        console.error("Error uploading photos:", error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your photos. Please try again.",
          variant: "destructive",
        });
      } finally {
        setUploadingPhotos(false);
      }
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
        <h1 className="text-lg font-semibold">Share & Improve Trails</h1>
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
                  disabled={uploadingPhotos}
                >
                  {uploadingPhotos ? (
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground mt-2">
                    {uploadingPhotos ? "Uploading..." : "Add Photo"}
                  </span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
          </div>
        )}

        {step === 3 && issueType === "fundraising" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Funding Amount (TRL)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="Amount of TRL tokens needed"
                value={formData.amount}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                Request tokens from the community treasury for trail improvements
              </p>
            </div>

            <Card className="p-4">
              <h3 className="font-medium mb-2">Fundraising Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{formData.amount} TRL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photos:</span>
                  <span className="font-medium">{photos.length} uploaded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{location ? "Set" : "Not set"}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && issueType !== "fundraising" && (
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Report Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">
                    {issueType === "scenic" ? "Scenic Spot" : "Trail Condition"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photos:</span>
                  <span className="font-medium">{photos.length} uploaded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{location ? "Set" : "Not set"}</span>
                </div>
              </div>
            </Card>

            <div className="bg-muted/30 p-4 rounded-md">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Earn TRL Tokens</h3>
                  <p className="text-xs text-muted-foreground">
                    You'll receive 5 TRL tokens for submitting this report
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Button
            onClick={nextStep}
            className="w-full"
            disabled={
              (step === 1 && (!formData.title || !formData.description)) ||
              (step === 2 && !location) ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </span>
            ) : step === 3 ? (
              "Submit Report"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


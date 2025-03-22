"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  AlertTriangle,
  Landmark,
  MapPin,
  MoreVertical,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MiniMap } from "@/components/mini-map"
import { CommentList } from "@/components/comment-list"
import { usePrivy } from '@privy-io/react-auth';
import { cn } from "@/lib/utils"
import { AuthAPI } from "../../utils/api"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { DialogTitle } from "@radix-ui/react-dialog"

export default function IssuePage() {
  const { ready, login, authenticated, user: privyUser, logout } = usePrivy();
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [comment, setComment] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [isDonating, setIsDonating] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true)
      try {
        if (!privyUser) return
        const data = await AuthAPI.get(`/posts/${params.id}`)
        console.log('privyUser', privyUser)
        setIssue({
          ...data,
          author: privyUser
        })
        setLoading(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch issue data.",
        })
      }
    }

    fetchIssue()
  }, [params.id, privyUser])

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  if (!issue) {
    return <div className="flex justify-center items-center h-full">Issue not found.</div>
  }

  const handleVote = async (isUpVote: boolean) => {
    setIsVoting(true)

    // Simulate API call
    const result = await AuthAPI.post(`/posts/${issue?.id}/vote`, {
      payload: {
        isUpVote,
      }
    })
    setIssue({
      ...result,
      author: privyUser
    })

    toast({
      title: `Vote recorded!`,
      description: `You've ${isUpVote ? "upvoted" : "downvoted"} this issue and earned 1 TRL token.`,
    })

    setIsVoting(false)
  }

  const handleComment = async () => {
    if (!comment.trim()) return

    setIsCommenting(true)

    const result = await AuthAPI.post(`/posts/${issue?.id}/review`, {
      payload: {
        comments: comment,
        score: 2,
        user_id: privyUser?.id,
        user_name: privyUser?.google?.name
      },
    })
    setIssue({
      ...result,
      author: privyUser
    })


    toast({
      title: "Comment posted!",
      description: "Your comment has been added and you've earned 2 TRL tokens.",
    })

    setComment("")
    setIsCommenting(false)
  }

  const handleDonate = async () => {
    setIsDonating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Donation successful!",
      description: "Thank you for contributing to this trail improvement project!",
    })

    setIsDonating(false)
  }

  const focusCommentInput = () => {
    setActiveTab("comments")
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }
    }, 300)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold truncate max-w-[200px]">{issue.title}</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-xl">
            <VisuallyHidden>
              <DialogTitle>Options</DialogTitle>
            </VisuallyHidden>
            <div className="py-4 space-y-4">
              <h3 className="text-lg font-semibold">Options</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start" onClick={focusCommentInput}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Add Comment
                </Button>
                <Button variant="outline" className="justify-start">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                {issue.type === "condition" && (
                  <Button variant="outline" className="justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Report Problem
                  </Button>
                )}
                {issue.type === "fundraising" && (
                  <Button variant="outline" className="justify-start" onClick={() => setActiveTab("fundraising")}>
                    <Landmark className="mr-2 h-4 w-4" /> View Fundraising
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="aspect-video bg-muted relative">
          <img
            src={issue.image || "/placeholder.svg?height=400&width=600"}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
          <Badge
            variant={issue.type === "scenic" ? "secondary" : issue.type === "condition" ? "destructive" : "default"}
            className="absolute top-4 left-4"
          >
            {issue.type === "scenic" ? "Scenic Spot" : issue.type === "condition" ? "Trail Condition" : "Fundraising"}
          </Badge>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={issue?.author?.avatar ?? 'https://i.pravatar.cc/80'} />
                <AvatarFallback>{issue?.author?.google?.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{issue.author.name}</p>
                <p className="text-xs text-muted-foreground">Posted {issue.created_at}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote(true)}
                disabled={isVoting}
                className={cn("h-9 px-3", isVoting && "opacity-50")}
              >
                <ThumbsUp className="h-4 w-4 mr-1" /> {issue.up_votes}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote(false)}
                disabled={isVoting}
                className={cn("h-9 px-3", isVoting && "opacity-50")}
              >
                <ThumbsDown className="h-4 w-4 mr-1" /> {issue.down_votes}
              </Button>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" /> {issue.location}
          </div>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments ({issue?.reviews?.length})</TabsTrigger>
              {issue.type === "fundraising" && <TabsTrigger value="fundraising">Fundraising</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <p className="text-sm">{issue.description}</p>

              <div className="h-48 w-full rounded-md overflow-hidden border">
                <MiniMap location={issue.coordinates} />
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 pt-4">
              <div className="space-y-4">
                <CommentList comments={issue.reviews} />

                <div className="pt-4 border-t">
                  <Textarea
                    ref={commentInputRef}
                    placeholder="Add your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mb-2"
                  />
                  <Button onClick={handleComment} disabled={isCommenting || !comment.trim()}>
                    {isCommenting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {issue.type === "fundraising" && (
              <TabsContent value="fundraising" className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Fundraising Progress</span>
                    <span className="text-sm font-medium">
                      {issue.fundraising?.raised || 0} / {issue.fundraising?.goal || 0} ETH
                    </span>
                  </div>
                  <Progress value={((issue.fundraising?.raised || 0) / (issue.fundraising?.goal || 1)) * 100} />
                </div>

                <Card className="p-4 bg-muted/50">
                  <h3 className="font-medium flex items-center">
                    <Landmark className="h-4 w-4 mr-2" /> Treasury Information
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Funds are held in a community-managed treasury. Once the goal is reached, DAO members will vote on
                    fund allocation to ensure the project is completed properly.
                  </p>
                </Card>

                <div className="space-y-2">
                  <h3 className="font-medium">Contribute to this project</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" onClick={handleDonate}>
                      0.01 ETH
                    </Button>
                    <Button variant="outline" onClick={handleDonate}>
                      0.05 ETH
                    </Button>
                    <Button variant="outline" onClick={handleDonate}>
                      0.1 ETH
                    </Button>
                    <Button variant="outline" onClick={handleDonate}>
                      Custom
                    </Button>
                  </div>
                  <Button className="w-full mt-2" onClick={handleDonate} disabled={isDonating}>
                    {isDonating ? "Processing..." : "Donate Now"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Recent Contributors</h3>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Avatar key={i} className="border-2 border-background">
                        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${i}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                      +12
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}


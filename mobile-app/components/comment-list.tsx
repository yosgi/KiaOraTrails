"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  date: string
  likes: number
  dislikes: number
}

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  const { toast } = useToast()
  const [commentVotes, setCommentVotes] = useState<Record<string, { liked: boolean; disliked: boolean }>>({})

  const handleVote = (commentId: string, isUpvote: boolean) => {
    setCommentVotes((prev) => {
      const currentVote = prev[commentId] || { liked: false, disliked: false }

      // If already voted the same way, remove the vote
      if ((isUpvote && currentVote.liked) || (!isUpvote && currentVote.disliked)) {
        return {
          ...prev,
          [commentId]: {
            liked: isUpvote ? false : currentVote.liked,
            disliked: isUpvote ? currentVote.disliked : false,
          },
        }
      }

      // Otherwise, set the new vote
      return {
        ...prev,
        [commentId]: {
          liked: isUpvote,
          disliked: !isUpvote,
        },
      }
    })

    toast({
      title: "Vote recorded",
      description: `You've ${isUpvote ? "upvoted" : "downvoted"} this comment.`,
    })
  }

  if (comments?.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const votes = commentVotes[comment.id] || { liked: false, disliked: false }

        return (
          <div key={comment.id} className="flex space-x-3">
            <Avatar>
              <AvatarImage src={'https://i.pravatar.cc/80'} />
              <AvatarFallback>{comment?.user_name}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{comment?.user_name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{comment.date}</span>
                </div>
              </div>
              <p className="text-sm">{comment.content}</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleVote(comment.id, true)}
                  data-active={votes.liked}
                >
                  <ThumbsUp className={`h-3 w-3 mr-1 ${votes.liked ? "text-primary" : ""}`} />
                  <span>{comment.likes + (votes.liked ? 1 : 0)}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleVote(comment.id, false)}
                  data-active={votes.disliked}
                >
                  <ThumbsDown className={`h-3 w-3 mr-1 ${votes.disliked ? "text-primary" : ""}`} />
                  <span>{comment.dislikes + (votes.disliked ? 1 : 0)}</span>
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


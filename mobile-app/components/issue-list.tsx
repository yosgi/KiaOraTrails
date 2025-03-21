"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThumbsUp, Search, MapPin, AlertTriangle, Image, Landmark } from "lucide-react"
import { mockIssueData } from "@/lib/mock-data"

interface IssueListProps {
  onSelect?: () => void
}

export function IssueList({ onSelect }: IssueListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredIssues = mockIssueData.filter(
    (issue) =>
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const scenicIssues = filteredIssues.filter((issue) => issue.type === "scenic")
  const conditionIssues = filteredIssues.filter((issue) => issue.type === "condition")
  const fundraisingIssues = filteredIssues.filter((issue) => issue.type === "fundraising")

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1">
        <TabsList className="grid grid-cols-4 h-auto p-1 m-2">
          <TabsTrigger value="all" className="text-xs py-1 h-auto">
            All
          </TabsTrigger>
          <TabsTrigger value="scenic" className="text-xs py-1 h-auto">
            Scenic
          </TabsTrigger>
          <TabsTrigger value="condition" className="text-xs py-1 h-auto">
            Conditions
          </TabsTrigger>
          <TabsTrigger value="fundraising" className="text-xs py-1 h-auto">
            Fundraising
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0 overflow-auto">
          {filteredIssues.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No issues found</div>
          ) : (
            <div className="divide-y">
              {filteredIssues.map((issue) => (
                <IssueItem key={issue.id} issue={issue} onSelect={onSelect} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scenic" className="m-0 overflow-auto">
          {scenicIssues.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No scenic spots found</div>
          ) : (
            <div className="divide-y">
              {scenicIssues.map((issue) => (
                <IssueItem key={issue.id} issue={issue} onSelect={onSelect} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="condition" className="m-0 overflow-auto">
          {conditionIssues.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No trail conditions found</div>
          ) : (
            <div className="divide-y">
              {conditionIssues.map((issue) => (
                <IssueItem key={issue.id} issue={issue} onSelect={onSelect} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fundraising" className="m-0 overflow-auto">
          {fundraisingIssues.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No fundraising requests found</div>
          ) : (
            <div className="divide-y">
              {fundraisingIssues.map((issue) => (
                <IssueItem key={issue.id} issue={issue} onSelect={onSelect} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IssueItem({ issue, onSelect }: { issue: any; onSelect?: () => void }) {
  return (
    <Link href={`/issues/${issue.id}`} className="block hover:bg-accent" onClick={onSelect}>
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-2">
            <div className="mt-1">
              {issue.type === "scenic" ? (
                <Image className="h-4 w-4 text-green-500" />
              ) : issue.type === "condition" ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <Landmark className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm line-clamp-1">{issue.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{issue.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <ThumbsUp className="h-3 w-3 mr-1" /> {issue.upvotes}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" /> {issue.location}
          </div>
          <span className="text-xs text-muted-foreground">{issue.date}</span>
        </div>
      </div>
    </Link>
  )
}


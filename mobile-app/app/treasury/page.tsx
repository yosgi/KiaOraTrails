"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Landmark, Vote, CheckCircle2 } from "lucide-react"
import { mockTreasuryData } from "@/lib/mock-data"
import { AuthAPI } from "../utils/api"
import { format } from "date-fns"

export default function TreasuryPage() {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await AuthAPI.get("/posts")
        setProposals(response)
      } catch (error) {
        console.error("Failed to fetch proposals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [])


  const sortedProposals =proposals && proposals?.length > 0 ? [...proposals].sort((a, b) => {
    try {
      return sortDirection === "asc" ? a.up_votes - b.up_votes : b.up_votes - a.up_votes
    } catch (error) {
      return []
    }
  }) : []

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold">Community Fund & Governance</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Landmark className="mr-2 h-4 w-4" /> Community Fund Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold">{mockTreasuryData.balance} NZD</div>
              <p className="text-sm text-muted-foreground">Total Fund Balance</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span>{mockTreasuryData.available} NZD</span>
              </div>
              <Progress value={(mockTreasuryData.available / mockTreasuryData.balance) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Allocated</span>
                <span>{mockTreasuryData.allocated} NZD</span>
              </div>
              <Progress value={(mockTreasuryData.allocated / mockTreasuryData.balance) * 100} />
            </div>

            <div className="pt-2 border-t grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-muted/50 rounded-md">
                <div className="text-lg font-bold">{mockTreasuryData.contributors}</div>
                <div className="text-xs text-muted-foreground">Contributors</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-md">
                <div className="text-lg font-bold">{mockTreasuryData.activeProposals}</div>
                <div className="text-xs text-muted-foreground">Active Proposals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium flex items-center">
              <Vote className="mr-2 h-4 w-4" /> Proposals
            </h2>
          </div>

          {loading ? (
            <p>Loading proposals...</p>
          ) : (
            <Tabs defaultValue="voted">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="voted">Active</TabsTrigger>
                <TabsTrigger value="donated">Passed</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="voted" className="pt-4 space-y-4">
                {sortedProposals.filter(({status}) => status =="voted").map((proposal) => (
                  <Card key={proposal.id+'voted'} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/issues/${proposal.id}`} className="block hover:bg-accent">
                            <h3 className="font-medium">{proposal.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {proposal.fund ?? 0} NZD • Posted at {format(new Date(proposal.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        {proposal.type === "fundraising" && (
                          <Button size="sm" variant="outline">
                            Donate
                          </Button>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Support</span>
                          <span>{Number(proposal.up_votes)*100/5}%</span>
                        </div>
                        <Progress value={Number(proposal.up_votes)*20} />
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="donated" className="pt-4 space-y-4">
              {sortedProposals.filter(({status}) => status =="donated").map((proposal) => (
                  <Card key={proposal.id+'donated'} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/issues/${proposal.id}`} className="block hover:bg-accent">
                            <h3 className="font-medium">{proposal.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {proposal.fund ?? 0} NZD • Posted at {format(new Date(proposal.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Support</span>
                          <span>{Number(proposal.up_votes)*100/5}%</span>
                        </div>
                        <Progress value={Number(proposal.up_votes)*20} />
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="rejected" className="pt-4 space-y-4">
                
              {sortedProposals.filter(({status}) => status =="rejected").map((proposal) => (
                  <Card key={proposal.id+'rejected'} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/issues/${proposal.id}`} className="block hover:bg-accent">
                            <h3 className="font-medium">{proposal.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {proposal.fund ?? 0} NZD • Posted at {format(new Date(proposal.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Support</span>
                          <span>{Number(proposal.up_votes)*100/5}%</span>
                        </div>
                        <Progress value={Number(proposal.up_votes)*20} />
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your DAO Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>TRL Token Balance</span>
              <span className="font-medium">125 TRL</span>
            </div>
            <div className="flex justify-between">
              <span>Voting Power</span>
              <span className="font-medium">12.5%</span>
            </div>
            <div className="flex justify-between">
              <span>Reputation Score</span>
              <span className="font-medium">
                780 <span className="text-green-500 text-xs">+15</span>
              </span>
            </div>
            <Button variant="outline" className="w-full">
              Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


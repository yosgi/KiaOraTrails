"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Landmark, Vote, CheckCircle2 } from "lucide-react"
import { mockTreasuryData, mockProposalData } from "@/lib/mock-data"

export default function TreasuryPage() {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortedProposals = [...mockProposalData].sort((a, b) => {
    return sortDirection === "asc" ? a.votes - b.votes : b.votes - a.votes
  })

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold">Treasury & Governance</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Landmark className="mr-2 h-4 w-4" /> Treasury Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold">{mockTreasuryData.balance} ETH</div>
              <p className="text-sm text-muted-foreground">Total Treasury Balance</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span>{mockTreasuryData.available} ETH</span>
              </div>
              <Progress value={(mockTreasuryData.available / mockTreasuryData.balance) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Allocated</span>
                <span>{mockTreasuryData.allocated} ETH</span>
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
            <Button variant="outline" size="sm">
              Create New
            </Button>
          </div>

          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="passed">Passed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="pt-4 space-y-4">
              {sortedProposals.map((proposal) => (
                <Card key={proposal.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{proposal.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {proposal.amount} ETH • {proposal.deadline}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Vote
                      </Button>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Support</span>
                        <span>{proposal.votes}%</span>
                      </div>
                      <Progress value={proposal.votes} />
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="passed" className="pt-4 space-y-4">
              <Card className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Replace broken bridge at Riverside Trail</h3>
                      <p className="text-sm text-muted-foreground">0.75 ETH • Mar 15, 2023</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Support</span>
                      <span>82%</span>
                    </div>
                    <Progress value={82} />
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Install new trail markers at Mountain Loop</h3>
                      <p className="text-sm text-muted-foreground">0.35 ETH • Feb 28, 2023</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      In Progress
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Support</span>
                      <span>76%</span>
                    </div>
                    <Progress value={76} />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="rejected" className="pt-4 space-y-4">
              <Card className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Build luxury rest area at Summit Point</h3>
                      <p className="text-sm text-muted-foreground">2.5 ETH • Mar 10, 2023</p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Rejected
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Support</span>
                      <span>32%</span>
                    </div>
                    <Progress value={32} />
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Install solar-powered lighting</h3>
                      <p className="text-sm text-muted-foreground">1.2 ETH • Jan 25, 2023</p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Rejected
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Support</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
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

